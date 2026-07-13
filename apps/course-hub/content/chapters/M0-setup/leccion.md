---
module: M0
title: Setup + thin slice
concept: La anatomía de un RAG y el stack de AI engineering
duration: ~6-8h lectura + 1 finde de práctica
---

# M0 — Cómo funciona un RAG (y cómo armar el esqueleto)

> **Qué vas a saber al terminar esta lección:** explicar, sin mirar, qué hace un sistema RAG
> de punta a punta, por qué cada pieza existe, y cuáles son las decisiones que vas a tener que
> defender. La práctica (ver `practica.md`) es construir la versión más fina de esto.

---

## 1. El problema: por qué un LLM solo no alcanza

Un LLM como GPT-4o o Claude es un modelo entrenado con un corpus gigante hasta una fecha de
corte. Tiene dos límites duros para un producto de soporte:

1. **No conoce tus datos privados.** La documentación de *tu* empresa, los tickets de *tus*
   clientes, tu base de conocimiento — nada de eso estuvo en el entrenamiento.
2. **Alucina con seguridad.** Cuando no sabe, no dice "no sé": completa con lo más probable.
   En soporte eso es veneno (das una respuesta incorrecta con tono confiado).

Hay tres formas de darle conocimiento nuevo a un LLM. Tenés que saber por qué elegimos la
tercera:

| Opción | Qué es | Por qué NO (para esto) |
|---|---|---|
| **Reentrenar / fine-tune** | Ajustar los pesos con tus datos | Caro, lento, y el conocimiento queda "congelado": cada doc nuevo = reentrenar. No es para datos que cambian. |
| **Meter todo en el prompt** | Pegar toda la doc en cada request | El context window es finito y caro. 10.000 páginas no entran, y aunque entraran, pagás por todos los tokens en cada query y el modelo se "pierde" (lost in the middle). |
| **RAG** ✅ | Recuperar solo los fragmentos relevantes y pasárselos al modelo en el prompt | Conocimiento siempre fresco (agregás un doc y listo), barato (solo pasás lo que importa), y podés citar la fuente. |

**RAG = Retrieval-Augmented Generation.** En una frase: *en vez de que el modelo "sepa" la
respuesta, le damos los documentos correctos en el momento de preguntar, y le pedimos que
responda basándose en ellos.* El modelo deja de ser la fuente de verdad y pasa a ser un
**razonador sobre el contexto que le diste**. Ese cambio mental es la idea central del curso.

---

## 2. Anatomía de un RAG mínimo

Un RAG tiene **dos caminos** que ocurren en momentos distintos:

### A. Ingesta (offline, cuando subís un documento)

```
documento → [1] parse → [2] chunk → [3] embed → [4] store en vector DB
```

1. **Parse:** extraés el texto del archivo (PDF, HTML, Markdown). En M0, texto plano.
2. **Chunk:** partís el texto en fragmentos ("chunks"). ¿Por qué no guardar el doc entero?
   Porque después vas a recuperar *fragmentos*, no documentos enteros — querés pasarle al
   modelo el párrafo relevante, no las 80 páginas. En M0 el chunking es naive (cortás cada N
   caracteres). **Es malo a propósito** — es la baseline que vas a romper en M1.
3. **Embed:** convertís cada chunk en un **vector** (un array de números) que captura su
   *significado*. (Sección 3.)
4. **Store:** guardás cada vector + su texto en una base vectorial (pgvector).

### B. Query (online, cuando el usuario pregunta)

```
pregunta → [1] embed → [2] similarity search → [3] armar prompt con los chunks → [4] LLM → respuesta
```

1. **Embed la pregunta** con el *mismo* modelo de embeddings que usaste en la ingesta.
2. **Similarity search:** buscás en la vector DB los `k` chunks cuyos vectores están más
   "cerca" del vector de la pregunta (los más parecidos en significado). Esto es el
   *retrieval*.
3. **Armar el prompt:** metés esos `k` chunks en el prompt junto con la pregunta y una
   instrucción ("respondé usando solo este contexto; si no está, decí que no sabés").
4. **Generar:** el LLM responde. Idealmente con una cita al chunk que usó.

> **Checkpoint:** ¿por qué hay que embeber la pregunta con el *mismo* modelo que los chunks?
> Porque la búsqueda compara vectores: solo tienen sentido si viven en el mismo "espacio".
> Mezclar dos modelos de embeddings es comparar peras con manzanas.

---

## 3. Embeddings: de texto a geometría

Un **embedding** es una función que toma un texto y devuelve un vector de dimensión fija —
con `text-embedding-3-small` de OpenAI, 1536 números. La magia: textos con *significado
parecido* quedan *cerca* en ese espacio de 1536 dimensiones, aunque no compartan palabras.

- `"¿cómo reseteo mi contraseña?"` y `"olvidé mis credenciales de acceso"` → vectores cercanos.
- `"¿cómo reseteo mi contraseña?"` y `"recetas de pasta"` → vectores lejanos.

¿Cómo medís "cerca"? Con una métrica de distancia. La más usada es **cosine similarity**: el
coseno del ángulo entre dos vectores. 1 = misma dirección (idénticos en significado), 0 = sin
relación, -1 = opuestos. "Distancia coseno" = 1 − similitud (0 = idéntico).

```python
# intuición (no es el código real, es para entenderlo)
import numpy as np
def cosine(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
```

Detalles que vas a tener que defender:
- **Dimensiones:** `text-embedding-3-small` = 1536 dims; `3-large` = 3072. Más dims ≈ más
  expresivo pero más caro de guardar/buscar. `3-small` soporta reducir dims (parámetro
  `dimensions`) con poca pérdida.
- **Costo:** los embeddings son baratísimos (~$0.02 por 1M de tokens con `3-small`; con Batch
  API, la mitad: ~$0.01 por 1M). Embeber toda tu doc cuesta centavos. Lo caro es el LLM de
  generación. Ojo: la página oficial de cada modelo de embeddings en OpenAI ya no lidera con
  "$/1M tokens" — muestra primero una métrica de "páginas por dólar" (para `3-small`, del orden
  de decenas de miles de páginas por dólar). Es el mismo precio, comunicado distinto; no te
  confundas si ves esa unidad en vez de la que usamos acá.
- **Determinismo:** el mismo texto da (casi) el mismo vector siempre. Por eso podés cachear.

---

## 4. El vector store: pgvector

Una base vectorial guarda vectores y resuelve la pregunta *"dame los k vectores más cercanos a
este"* rápido. Hay productos dedicados (Qdrant, Pinecone, Weaviate), pero **arrancamos con
pgvector**: una extensión de PostgreSQL que agrega un tipo de dato `vector`.

A escala, la diferencia de costo y de modelo de pricing entre estas opciones es real y vale la
pena conocerla (no para elegir ahora — para poder justificar *cuándo* migrarías):

| Vector DB | ~10M vectores | ~100M vectores | Cómo cobra | Hybrid search nativo |
|---|---|---|---|---|
| **pgvector** | ~gratis (ya pagás Postgres) | <$100/mes (self-hosted) | infra que ya tenés | no (lo componés a mano) |
| **Qdrant** | ~$65/mes | crece con RAM/CPU/disco | recursos reservados | sí |
| **Pinecone** | ~$70/mes | $700+/mes (Serverless) | storage + queries + writes | sí |
| **Weaviate** | ~$135/mes | crece con RAM/CPU/disco + dims almacenadas | recursos + ~$0.095 por millón de dimensiones/mes (tier compartido) | sí |

La brecha se nota poco a 10M vectores y se dispara a 100M+. Esa es, en números, la razón por la
que "migrás cuando medís que lo necesitás" (más abajo) no es una frase vacía.

```sql
CREATE EXTENSION vector;

CREATE TABLE chunks (
  id        bigserial PRIMARY KEY,
  doc_id    bigint,
  content   text,            -- el texto del chunk (lo necesitás para el prompt)
  embedding vector(1536)     -- el vector
);

-- buscar los 5 chunks más cercanos a un vector de query (<=> = distancia coseno)
SELECT content
FROM chunks
ORDER BY embedding <=> $1     -- $1 es el embedding de la pregunta
LIMIT 5;
```

Los operadores de pgvector: `<->` (L2/euclídea), `<=>` (coseno), `<#>` (producto interno).
Para acelerar la búsqueda en tablas grandes, pgvector ofrece índices **HNSW** (rápido y
preciso, más memoria) e **IVFFlat** (más liviano). En M0 con pocos chunks ni hace falta índice.

**¿Por qué empezar con pgvector y no con Qdrant?** (Decisión #1 a defender, ADR-001):
- Ya conocés Postgres; una sola base para datos relacionales *y* vectores = menos piezas.
- Alcanza de sobra hasta cientos de miles de chunks.
- Migrás a Qdrant cuando *medís* que lo necesitás (hybrid search avanzado, escala) — no antes.
  Elegir el vector DB dedicado el día 1 es YAGNI y una pregunta extra que tenés que justificar
  sin tener el problema.

---

## 5. El modelo mental: 3 capas

Todo sistema de AI engineering vive en tres capas. Ubicá cada pieza de tu thin slice:

| Capa | Qué hace | En tu M0 |
|---|---|---|
| **Datos** | Llevar conocimiento a una forma buscable | parse → chunk → embed → pgvector |
| **Modelo** | Recuperar + razonar/generar | similarity search → prompt → LLM |
| **Producto** | Que un humano lo use | UI de upload + chat con streaming, deployado |

Un "wrapper" típico solo tiene capa Producto (una caja de chat sobre la API de OpenAI). Lo que
te vuelve AI Engineer es dominar las capas Datos y Modelo — y eso es exactamente donde están
los problemas difíciles (chunking, retrieval, evals) que el resto del curso ataca.

---

## 6. Thin slice: por qué end-to-end antes que perfecto

El error clásico del principiante es construir la ingesta perfecta (parsers, chunking
inteligente, índices) *antes* de ver una sola respuesta. Nosotros hacemos lo contrario: un
**walking skeleton** (Cockburn) — el camino más corto que toca las tres capas y *funciona*,
aunque cada pieza sea mínima.

¿Por qué?
- Te da **algo que medir y romper.** No podés mejorar lo que no existe. El chunking naive de
  M0 es la baseline contra la que vas a mostrar mejora en M1/M3.
- Descubrís los problemas reales de integración temprano (¿cómo streameo de FastAPI a Next?),
  no al final.
- Psicológicamente: tenés un sistema vivo en el día 1, no en el mes 3.

**Regla:** profundidad sobre una pieza recién cuando tengas el circuito entero andando.

---

## 7. Streaming: por qué SSE

Un LLM genera token por token. Si esperás la respuesta completa antes de mostrar nada, el
usuario mira una pantalla vacía varios segundos. **Streaming** = mostrar los tokens a medida
que salen. La forma estándar es **SSE (Server-Sent Events)**: una conexión HTTP que el server
mantiene abierta y por la que va empujando trozos. El Vercel AI SDK del lado de Next consume
ese stream y lo pinta. En M0 conectás el stream de FastAPI → al chat. Lo das por hecho ahora;
en M7 vas a volver a esto para optimizar el *time-to-first-token*.

---

## 8. Onboarding Python (medio día, para un dev de TS)

El backend de AI es Python (RAGAS, LangGraph, QLoRA, todo). Venís de TS, así que estos son los
cinco conceptos que te ahorran 20 horas de debuggear después:

1. **Type hints + Pydantic.** Python es dinámico, pero en producción tipás. Pydantic valida en
   runtime (lo que `zod` hace en TS):
   ```python
   from pydantic import BaseModel
   class Chunk(BaseModel):
       content: str
       doc_id: int
   ```
2. **`async`/`await`.** Igual que en TS. FastAPI es async; tus handlers de I/O (DB, API de
   OpenAI) son `async def` y usás `await`.
3. **`uv`.** El gestor de paquetes/entornos moderno (de Astral, los de Ruff). Reemplaza
   pip+venv+poetry, es 10-100x más rápido. `uv add fastapi`, `uv run ...`.
4. **`pytest`.** El framework de tests estándar. Una función `def test_...()` con `assert`.
   Lo vas a usar desde M0 (ver `pruebas.md`).
5. **Estructura de proyecto:** `pyproject.toml` (como `package.json`), entorno virtual aislado.

No necesitás dominar Python — necesitás no tropezarte con estas cinco cosas mientras construís.

---

## 9. Lo que tenés que poder defender (conecta con `criterios-defensa.md`)

Al cerrar M0, un entrevistador podría preguntarte cualquiera de estas. Si no las podés
responder con tus palabras y tus decisiones, el módulo no está cerrado:

- "Explicame RAG como si yo no supiera nada." (Sección 1-2)
- "¿Por qué no fine-tuning?" (Sección 1)
- "¿Qué es un embedding y por qué la búsqueda funciona?" (Sección 3)
- "¿Por qué pgvector y no Pinecone?" (Sección 4, ADR-001)
- "Tu chunking es naive. ¿Qué problemas tiene y qué vas a romper?" (Sección 2, 6)
- "¿Cómo sabés que el retrieval trae lo correcto?" — respuesta honesta de M0: "todavía no lo
  mido, eso es M2". Saber que es un gap *es* la respuesta madura.

Seguí con `material-apoyo.md` para las fuentes canónicas, y después `practica.md` para construir.
