---
module: M0
feature: thin slice RAG single-shot deployado
repo: grounded
---

# Práctica — construí el thin slice (en el repo Grounded)

Objetivo: subir 1 documento y poder preguntarle, de punta a punta, deployado. Cada paso tiene
**qué hacer** y **cómo verificar** que quedó. No avances al siguiente sin que el actual verifique.

> Trabajás en el repo **`grounded`** (el producto). Todo el código vive ahí; el curso (Atelier)
> solo lo *sigue* vía `course.json`.

## Pre-requisitos
- Node 20+, pnpm, Python 3.11+, `uv`, Docker (para Postgres local).
- Una API key de OpenAI.
- Leíste los ★ Core de `material-apoyo.md` y podés explicar embeddings sin mirar.

---

## Paso 1 — Monorepo + Postgres con pgvector
**Hacer:**
- Estructura: `apps/web` (Next.js + Vercel AI SDK) y `services/api` (FastAPI con `uv`).
- Levantá Postgres con pgvector vía Docker (imagen `pgvector/pgvector:pg16`).
- Creá la extensión y la tabla `chunks` (ver SQL en la lección, Sección 4).

**Verificar:** `psql` → `SELECT '[1,2,3]'::vector;` no da error. La tabla `chunks` existe.

## Paso 2 — Ingestión (capa Datos)
**Hacer:** endpoint `POST /ingest` en FastAPI que reciba texto (o un archivo de texto plano) y:
1. **chunk naive:** partí cada ~800 caracteres (con un pequeño overlap, ej. 100). Función pura,
   testeable.
2. **embed:** llamá a `text-embedding-3-small` para cada chunk (`async`).
3. **store:** insertá `(content, embedding, doc_id)` en `chunks`.

```python
# services/api/chunking.py  — mantenelo puro (sin I/O) para poder testearlo
def chunk_text(text: str, size: int = 800, overlap: int = 100) -> list[str]:
    step = size - overlap
    return [text[i:i + size] for i in range(0, len(text), step) if text[i:i + size].strip()]
```

**Verificar:** subís un doc de prueba → la tabla `chunks` tiene N filas con embeddings de
dimensión 1536. (Test de `chunk_text` en `pruebas.md`, capa 1.)

## Paso 3 — Retrieval + generación (capa Modelo)
**Hacer:** endpoint `POST /chat` que reciba una pregunta y:
1. embeba la pregunta (mismo modelo que la ingesta).
2. `SELECT content FROM chunks ORDER BY embedding <=> $1 LIMIT 5` (top-5 por distancia coseno).
3. arme el prompt: instrucción + los 5 chunks + la pregunta. Instrucción clave:
   *"Respondé usando solo el contexto. Si la respuesta no está, decí que no la encontrás."*
4. llame al LLM **con streaming** y devuelva el stream (SSE).

**Verificar:** preguntás algo cubierto por el doc → respuesta correcta basada en el doc.
Preguntás algo no cubierto → dice que no lo encuentra (no inventa).

## Paso 4 — Frontend: upload + chat con streaming (capa Producto)
**Hacer:** en `apps/web`, UI mínima: un input para subir el doc (→ `/ingest`) y un chat
(Vercel AI SDK, `useChat`) que consuma el stream de `/chat` y pinte los tokens a medida que
llegan.

**Verificar:** en el browser, subís → preguntás → ves la respuesta *aparecer token por token*.

## Paso 5 — Deploy temprano
**Hacer:** deployá `services/api` (Railway/Fly) y `apps/web` (Vercel). Conectá las URLs.

**Verificar:** una URL pública responde y hace el flujo completo. (Aunque sea read-only / sin
auth todavía — eso es M4.)

## Paso 6 — Capa de defensa (el entregable real)
**Hacer:**
- `DECISIONS.md` con **ADR-001**: "¿Por qué pgvector de entrada?" — alternativas consideradas
  (Qdrant/Pinecone), el criterio (simplicidad, escala que vas a tener), cuándo lo cambiarías.
  Taggealo `Module: M0`.
- Escribí tus respuestas a los **defense drills** (`pruebas.md`, capa 2).
- Actualizá `course.json` (status `shipped`, tests, links) → el hub de Atelier lo refleja.

**Verificar:** podés explicar cada decisión sin mirar las notas. Recién ahí marcás el gate.

---

## Definición de "hecho" (M0)
✅ Subís un doc → preguntás → respuesta correcta con streaming, en una URL pública ·
✅ `chunk_text` testeado · ✅ ADR-001 escrito · ✅ defense drills respondidos · ✅ `course.json`
publicado. → marcás el gate en el panel del módulo.
