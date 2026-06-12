---
module: M7
title: LLMOps + cost + open-source models
concept: Controlar el costo del LLM (el riesgo #1 de margen de un RAG SaaS) con routing, semantic caching, token budgets, observabilidad y modelos open-source
duration: ~8-10h lectura + 1 finde de práctica
---

# M7 — Que el LLM no te coma el margen (routing, caching, budgets, observabilidad)

> **Qué vas a saber al terminar esta lección:** explicar por qué el costo del LLM es el riesgo
> #1 del margen de un RAG SaaS, y construir las cuatro palancas que lo controlan —
> **model routing por complejidad**, **semantic caching**, **token/context budgets** y
> **observabilidad** (TTFT, p50/p95, costo por conversación). Vas a poder defender, con un
> número de *tu* sistema, cuánto baja el costo cada palanca. Y vas a hacer el **swap a un modelo
> open-source self-hosted (Ollama / Llama 3.1)** para mostrar que no dependés de un vendor — y
> saber exactamente cuándo conviene y cuándo no.

> **Pre-requisito mental:** este módulo solo tiene sentido porque en M2 construiste el harness de
> evals. Cada optimización de costo es un **trade-off contra calidad**, y "bajé el costo 70%" sin
> "...y la calidad se mantuvo en el golden dataset" es un recorte irresponsable que un buen
> entrevistador te va a clavar. Acá el patrón es siempre: *optimizo costo → corro el harness → solo
> lo mantengo si la calidad aguanta*.

---

## 1. Por qué el costo del LLM es el riesgo #1 de margen

Un RAG SaaS B2B cobra, típicamente, una **tarifa fija por mes por asiento o por tenant**. Pero el
costo de servirlo es **variable por uso**: cada conversación dispara llamadas a un LLM que cobra
**por token**. Esa asimetría — ingreso fijo, costo variable — es exactamente la forma de un negocio
con riesgo de margen. Si un cliente manda 10x más queries de lo que asumiste, o si tus prompts
crecen sin control, tu COGS (cost of goods sold) se come la ganancia y no te enterás hasta que ves
la factura de OpenAI a fin de mes.

Hagamos el número, porque en la entrevista lo van a pedir. Supongamos un modelo frontier a ~$2.50
/ 1M tokens de input y ~$10 / 1M de output (los precios cambian con cada generación; lo que no
cambia es el método). Una conversación de soporte típica con RAG:

- **Input por turno:** instrucción + 5 chunks recuperados (~2.000 tokens) + historial (~1.000) ≈
  **3.000 tokens de input**.
- **Output:** una respuesta de ~300 tokens.
- **Costo por turno:** `3000/1M × $2.50 + 300/1M × $10 = $0.0075 + $0.003 = ~$0.0105`.

Parece nada. Pero multiplicá: **1.000 tenants × 50 conversaciones/día × 4 turnos = 200.000
turnos/día = ~$2.100/día = ~$63.000/mes**. Si vendés el plan a $99/tenant, facturás $99.000/mes y
**dos tercios se van en inferencia**. El producto técnicamente "funciona" y el negocio no cierra.

Las cuatro palancas de este módulo atacan ese número desde ángulos distintos y **se componen**
(multiplican, no suman):

| Palanca | Qué reduce | Ahorro típico |
|---|---|---|
| **Prompt caching** | el precio de tokens repetidos (prefijo estable → descuento automático del proveedor) | 60-85% del costo de input en prompts con contexto largo |
| **Model routing** | el precio por token (query simple → modelo barato) | 70-80% del gasto de generación |
| **Semantic caching** | la *cantidad* de llamadas (preguntas repetidas no pegan al LLM) | 30-60% de hit rate en soporte |
| **Token/context budgets** | los tokens por llamada (no desperdiciás context window) | 20-50% del input |
| **Observabilidad** | no reduce directo — pero es lo que te deja *ver* y *atacar* los otros tres | habilita todo lo demás |

> **Checkpoint:** ¿por qué decimos que estas palancas *multiplican* en vez de *sumar*? Porque
> operan sobre factores distintos del mismo producto `costo = llamadas × tokens × precio_por_token`.
> El caching baja `llamadas`, los budgets bajan `tokens`, el routing baja `precio_por_token`. Bajar
> cada factor 50% no te da 50% de ahorro: te da `0.5 × 0.5 × 0.5 = 0.125`, o sea **87% menos**.

---

## 2. Model routing por complejidad

### Por qué

No todas las queries necesitan el mismo cerebro. "¿Cuál es el horario de atención?" la contesta un
**modelo barato** (el tier "mini/haiku/flash" del proveedor que uses, o un Llama local) con un
chunk de contexto. "Comparame el plan Enterprise vs Pro para un equipo de 200 con SSO y data
residency en la UE, y decime si me conviene migrar" necesita razonamiento multi-paso y un **modelo
frontier**. Pagar el modelo frontier para *toda* query es como mandar a un cirujano a poner una
curita: funciona, pero el costo es absurdo.

La diferencia de precio entre un modelo frontier y su variante barata del mismo proveedor es
**20-30x** — una constante que se mantiene independientemente de qué generación de modelos estés
mirando. Si el 70-80% de tus queries son "simples" (y en soporte lo son: FAQ, lookups,
confirmaciones), rutear esas al modelo barato te ahorra el grueso del costo de generación
**sin tocar la calidad percibida** — porque para esas queries el modelo barato responde igual de
bien.

El patrón 2026 más completo combina **benchmarking de calidad/latencia/costo** con el harness de
M2 para decidir qué modelo entra en producción, y **distillation** como técnica complementaria:
usás las salidas del modelo frontier para entrenar o few-shot el modelo barato, y transferís
capacidad de forma controlada. (El fine-tuning de M9 cubre el mecanismo.)

### Cómo: clasificar la query, después rutear

Necesitás un **clasificador de complejidad** que corra *antes* del LLM caro. Tres estrategias, de
menos a más sofisticada:

1. **Heurísticas** (gratis, instantáneo): longitud de la query, presencia de palabras de
   comparación/razonamiento ("compará", "por qué", "conviene"), cantidad de entidades. Frágil pero
   sorprendentemente efectivo como primer corte.
2. **Clasificador barato** (el patrón recomendado): el modelo barato del proveedor con un prompt
   que devuelve `simple | complex` en structured output. Cuesta centavos y es mucho más robusto que
   las heurísticas. El meta-truco: usás el modelo *barato* para decidir si necesitás el *caro*.
3. **Clasificador ML propio** (M9): un clasificador entrenado (estilo Banking77, side-quest C) que
   rutea sin llamar a ningún LLM. Lo más barato y rápido en runtime, pero necesita datos y training.

Para Grounded arrancamos con (2). El router en TypeScript del BFF:

```typescript
// apps/web/lib/router.ts
import OpenAI from 'openai';
const openai = new OpenAI();

type Complexity = 'simple' | 'complex';

const ROUTER_PROMPT = `Clasificá la consulta de soporte como "simple" o "complex".
- simple: lookup factual, FAQ, una sola pieza de info, confirmación.
- complex: comparación, razonamiento multi-paso, varias entidades, "por qué/conviene", troubleshooting.
Respondé SOLO con el JSON {"complexity": "simple"|"complex"}.`;

// Reemplazá con los IDs de modelo vigentes del proveedor que uses
// (ej. modelo-barato = tier mini/haiku/flash; modelo-frontier = tier caro)
const MODEL_BY_COMPLEXITY: Record<Complexity, string> = {
  simple: process.env.MODEL_CHEAP!,    // modelo barato del proveedor actual
  complex: process.env.MODEL_FRONTIER!, // modelo frontier del proveedor actual
};

export async function routeQuery(query: string): Promise<Complexity> {
  const res = await openai.chat.completions.create({
    model: process.env.MODEL_CHEAP!, // clasificás con el barato
    messages: [
      { role: 'system', content: ROUTER_PROMPT },
      { role: 'user', content: query },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 20,
  });
  const parsed = JSON.parse(res.choices[0].message.content ?? '{}');
  return parsed.complexity === 'complex' ? 'complex' : 'simple';
}

export function pickModel(complexity: Complexity): string {
  return MODEL_BY_COMPLEXITY[complexity];
}
```

### El trade-off que tenés que medir (no asumir)

Un router *no es gratis en calidad*. Cada vez que mandás una query "compleja" al modelo barato por
una mala clasificación, degradás la respuesta. Por eso el router se **valida contra el harness de
M2**: corrés el golden dataset con el router prendido y mirás si la calidad cae más de lo que estás
dispuesto a aceptar a cambio del ahorro. La metáfora correcta no es "ahorro 80%" sino "ahorro 80% y
la calidad cae de 0.91 a 0.89 en el golden set — lo acepto". Sin el segundo número, no tenés una
decisión, tenés un recorte.

> **Checkpoint:** ¿por qué clasificás con el modelo barato y no con el caro? Porque si usaras el
> caro para decidir, ya pagaste el modelo caro — perdés todo el ahorro. El router solo tiene sentido
> si el clasificador es **drásticamente más barato** que el peor caso que evita. Es la misma lógica
> del funnel barato→caro del rerank en M3.

---

## 3. Prompt caching del proveedor

### Por qué es la palanca de menor fricción

El prompt caching del proveedor (OpenAI y Anthropic lo implementan, cada uno a su manera) es la
palanca de menor fricción del módulo: no requiere cambiar tu arquitectura ni agregar una tabla
nueva. El proveedor cachea el **prefijo repetido de tu prompt** y te cobra ese prefijo a precio
reducido en los llamadas sucesivas.

El mecanismo concreto (OpenAI):

- **Automático a partir de ≥1.024 tokens**: no necesitás activarlo. Si el prefijo del prompt
  supera ese umbral, OpenAI detecta el cache automáticamente.
- **Hits en incrementos de 128 tokens**: el cache trabaja con bloques de 128 tokens, no
  token-por-token. Un prefijo de 2.000 tokens cacheado ahorra 15 bloques.
- **Precio: ~50% del precio de input en cache hit**: si un token de input cuesta $X, un token
  de cache hit cuesta ~$X/2.
- **Extended caching hasta 24 horas**: el cache persiste el tiempo suficiente para workflows
  de producción continuos.

El layout correcto: **contenido estable al principio del prompt, variable al final**.

```
┌─────────────────────────────────────────────┐
│  system prompt (instrucciones fijas)        │
│  + documentación de dominio estática        │  ← ESTO se cachea (estable por días/semanas)
│  + few-shot examples fijos                  │
├─────────────────────────────────────────────┤
│  chunks recuperados (variables por query)   │
│  + historial de la conversación (variable)  │  ← ESTO no se cachea (cambia en cada llamada)
│  + query del usuario                        │
└─────────────────────────────────────────────┘
```

El error frecuente es poner los chunks recuperados *antes* de las instrucciones de sistema. Ese
layout impide el caching: el prefijo variable invalida el cache en cada llamada.

**Equipos en producción reportan 60–85% de reducción de costos** en pipelines donde el system
prompt y los ejemplos few-shot son grandes y estables. En Grounded, donde la instrucción de
sistema tiene varias páginas (política de la empresa, formato de respuesta, reglas de citas),
el win es inmediato con cero código extra.

Nota de diseño: esto es distinto del semantic cache que vas a construir en §4. El del proveedor
cachea *tokens de prompt* dentro de una llamada; el tuyo cachea *respuestas completas* entre
llamadas. Se complementan: el del proveedor baja el costo de los cache misses del semántico.

> **Checkpoint:** ¿por qué estructurar el prompt "estable adelante, variable atrás" es una
> decisión de arquitectura y no solo un detalle de formato? Porque cambia el perfil de costo
> del sistema de forma permanente — un layout incorrecto descarta el 50% de descuento en cada
> llamada, para siempre, sin que nadie te avise. El proveedor nunca falla; el layout que
> invalida el cache sí.

---

## 4. Semantic caching

### Por qué un cache exact-match no alcanza

En soporte, la gente pregunta lo mismo de mil formas. "¿Cómo reseteo mi contraseña?",
"olvidé mi clave", "no puedo entrar a mi cuenta", "cómo recupero el acceso" — son **la misma
pregunta**. Un cache tradicional (Redis con la query como key) solo pega si el texto es *idéntico*
byte a byte. Para lenguaje natural, eso casi nunca pasa: el hit rate de un exact-match cache sobre
queries de usuario es patético.

La idea de **semantic caching**: en vez de cachear por igualdad de texto, cacheás por **igualdad de
significado**. Y resulta que ya tenés la herramienta para medir significado — los **embeddings** de
M0. Embebés la query, buscás en el cache la query más cercana por similitud coseno, y si está por
encima de un umbral, devolvés la respuesta cacheada **sin tocar el LLM**.

### Cómo funciona (reusás pgvector)

El cache es, literalmente, otra tabla con una columna `vector` — la misma tecnología de M0:

```sql
CREATE TABLE semantic_cache (
  id           bigserial PRIMARY KEY,
  tenant_id    bigint NOT NULL,         -- el cache es POR tenant (ver §3, multi-tenancy)
  query_text   text NOT NULL,
  query_embedding vector(1536) NOT NULL,
  response     text NOT NULL,
  created_at   timestamptz DEFAULT now(),
  hit_count    int DEFAULT 0
);

CREATE INDEX ON semantic_cache USING hnsw (query_embedding vector_cosine_ops);
```

El flujo de lookup, antes de llamar al LLM:

```python
# services/api/semantic_cache.py
from openai import AsyncOpenAI
client = AsyncOpenAI()

SIMILARITY_THRESHOLD = 0.95  # distancia coseno <= 0.05 ; tuneable, ver abajo

async def cache_lookup(db, tenant_id: int, query: str) -> str | None:
    emb = (await client.embeddings.create(
        model="text-embedding-3-small", input=query
    )).data[0].embedding

    # 1 - (embedding <=> $emb) = similitud coseno. Buscamos el vecino más cercano del MISMO tenant.
    row = await db.fetchrow(
        """
        SELECT response, 1 - (query_embedding <=> $1) AS similarity
        FROM semantic_cache
        WHERE tenant_id = $2
        ORDER BY query_embedding <=> $1
        LIMIT 1
        """,
        emb, tenant_id,
    )
    if row and row["similarity"] >= SIMILARITY_THRESHOLD:
        await db.execute(
            "UPDATE semantic_cache SET hit_count = hit_count + 1 WHERE tenant_id=$1 AND query_text=$2",
            tenant_id, query,
        )
        return row["response"]   # CACHE HIT — cero llamada al LLM
    return None                  # MISS — seguís al pipeline normal y después guardás
```

Y al final del camino normal (miss), guardás:

```python
async def cache_store(db, tenant_id, query, embedding, response):
    await db.execute(
        "INSERT INTO semantic_cache (tenant_id, query_text, query_embedding, response) VALUES ($1,$2,$3,$4)",
        tenant_id, query, embedding, response,
    )
```

### Los tres peligros que tenés que defender



El semantic caching es una cuchilla de doble filo. Si no entendés estos tres, no lo tenés dominado:

1. **El umbral es un trade-off precision/recall.** Umbral *muy alto* (0.99) → casi nunca pega (poco
   ahorro). Umbral *muy bajo* (0.85) → pega de más y devolvés una respuesta cacheada para una
   pregunta que *parecía* igual pero no lo era → **respuesta incorrecta servida con confianza**. Lo
   tuneás midiendo: ¿cuántos hits son correctos a cada umbral? Empezás conservador (0.95+).

2. **Aislamiento por tenant (no negociable).** El cache de Grounded es multi-tenant. La respuesta
   a "¿cuál es nuestra política de reembolso?" del tenant A **no puede** servirse al tenant B —
   son datos privados distintos. Por eso la tabla tiene `tenant_id` y *todo* lookup filtra por él.
   Esto conecta directo con la regla cardinal de M4: el aislamiento es determinístico en la capa
   de DB, nunca confiás en que el modelo "se acuerde" de no cruzar tenants.

3. **Invalidación.** Si el tenant sube un doc nuevo que cambia la respuesta correcta, el cache queda
   *stale* (sirve la respuesta vieja). La solución pragmática: TTL por entrada + invalidar las
   entradas de un tenant cuando re-ingesta documentos. "Hay solo dos problemas difíciles en CS:
   invalidación de cache y nombrar cosas" — acá te toca el primero, en serio.

> **Checkpoint:** ¿por qué el semantic cache reusa pgvector y embeddings en lugar de ser una pieza
> de infra nueva? Porque "buscar la query más parecida" es *exactamente* el mismo problema que
> retrieval (vecino más cercano en espacio de embeddings). Reusás la tecnología que ya operás —
> menos piezas, mismo principio. Es la misma disciplina YAGNI que te hizo elegir pgvector en M0.

---

## 5. Token budgets y context budgets

### Por qué el desperdicio de context window es economía negativa

Es tentador pensar "tengo 128k de context window, lleno con 20 chunks para estar seguro". Es un
error caro por dos razones que se refuerzan:

1. **Pagás por cada token de input, en cada llamada.** Pasar 20 chunks en vez de 5 cuadruplica tu
   costo de input por turno — para siempre, en cada query. Eso es **economía negativa**: gastás más
   por una mejora marginal (o negativa) de calidad.
2. **Más contexto no es más calidad — frecuentemente es menos.** El paper *Lost in the Middle*
   (Liu et al., el de M0) mostró que los modelos **ignoran la información en el medio** de contextos
   largos. Meter 20 chunks puede *empeorar* la respuesta respecto a meter los 5 mejores: enterrás la
   señal en ruido. Pagás 4x para que el modelo responda peor. Por eso el rerank de M3 existe — para
   poner los pocos chunks que importan arriba, no para poder meter más.

La regla: **el context window es un presupuesto que administrás, no un balde que llenás**.

### Cómo: budgets explícitos por tier

Definís un presupuesto de tokens y lo hacés cumplir *antes* de llamar al modelo. Dos motivos: cortar
costo y dar una palanca de monetización (el plan caro tiene más context budget).

```python
# services/api/budget.py
import tiktoken

enc = tiktoken.encoding_for_model("gpt-4o")  # o el modelo que uses — tiktoken cubre los modelos OpenAI

def count_tokens(text: str) -> int:
    return len(enc.encode(text))

# presupuesto de tokens de CONTEXTO (los chunks) por tier de plan
CONTEXT_BUDGET = {"free": 1500, "pro": 4000, "enterprise": 8000}

def fit_chunks_to_budget(chunks: list[str], tier: str) -> list[str]:
    """Mete chunks (ya rankeados por el rerank de M3) hasta agotar el budget.
    Como vienen ordenados por relevancia, cortar por el final descarta lo menos relevante."""
    budget = CONTEXT_BUDGET[tier]
    selected, used = [], 0
    for ch in chunks:
        t = count_tokens(ch)
        if used + t > budget:
            break
        selected.append(ch)
        used += t
    return selected
```

Tres prácticas más de budget que valen oro:

- **Truncá el historial de conversación.** No mandes los 30 turnos anteriores. Mandá los últimos N +
  (opcional) un resumen de los anteriores. El historial crece sin techo si no lo cortás.
- **Cap de `max_tokens` en el output.** Una respuesta de soporte no necesita 2.000 tokens. Poné
  `max_tokens` razonable: evita respuestas infladas que pagás caro (output es 4x el precio de input).
- **Prompt caching del proveedor.** OpenAI y Anthropic cachean automáticamente el *prefijo* repetido
  del prompt (tu instrucción de sistema larga, que es idéntica en cada llamada) y lo cobran con
  descuento. Estructurá el prompt con lo estable adelante (system + instrucciones) y lo variable
  atrás (chunks + query) para maximizar el hit de ese cache. Esto es distinto del semantic cache de
  §4: el del proveedor cachea *tokens de prompt* dentro de una llamada; el tuyo cachea *respuestas
  enteras* entre llamadas. El detalle de cómo maximizar el hit está en §3.

> **Checkpoint:** ¿meter más chunks "por las dudas" mejora o empeora? Empeora en los dos ejes:
> sube el costo linealmente (pagás cada token, cada vez) y *baja* la calidad por *lost in the
> middle*. La respuesta de AI Engineer es "no maximizo contexto, lo presupuesto — los pocos chunks
> que el rerank puso arriba, hasta el budget del tier".

---

## 6. A/B testing de prompts y drift detection

### Por qué la calidad no es estática

Pusiste el sistema en `recall@5 = 0.89` y respuestas que el judge de M2 aprueba. Tres meses después,
sin que toques nada, la calidad bajó. ¿Por qué?

- **El proveedor cambió el modelo por debajo.** Los aliases de modelo (ej. `"gpt-4o"` o cualquier
  alias sin versión fijada) apuntan a versiones que rotan; un upgrade silencioso puede cambiar el
  comportamiento de tus prompts (a veces mejor, a veces peor para *tu* caso particular).
- **Cambió la distribución de queries.** Tus clientes empezaron a preguntar sobre una feature nueva
  que tu doc no cubre bien. El sistema no cambió; el mundo sí.
- **Tocaste un prompt** "para mejorar algo" y rompiste otra cosa sin medirlo.

Eso es **drift**: la degradación de calidad en el tiempo sin un cambio intencional medido. Si no lo
detectás, te enterás por un cliente enojado, no por tu dashboard.

### Cómo: el harness de M2 corriendo en el tiempo

No necesitás infra nueva — necesitás **correr el harness de M2 de forma continua** y alertar cuando
una métrica cae bajo un umbral. Es el mismo golden dataset, ahora como **monitor de regresión** en
vez de gate de un solo módulo:

- **CI gate (ya lo tenés de M2):** cada cambio de prompt/modelo corre el golden set; si la métrica
  cae, el PR no mergea. Esto previene el drift que vos introducís.
- **Canario programado:** un job (cron / GitHub Actions schedule) que corre el golden set 1x/día
  contra producción y alerta si la métrica cae. Esto detecta el drift que *el proveedor* introduce.
- **Online drift signals:** sin ground-truth en producción, vigilás *proxies* — sube la tasa de
  "no sé" calibrado de M4, sube la longitud promedio de respuesta, baja el cache hit rate, cambia la
  distribución de embeddings de las queries. Ninguno prueba drift solo, pero juntos te dan una
  alarma temprana.

**A/B testing de prompts** es el método disciplinado para *cambiar* sin drift accidental: servís el
prompt A al 90% y el B al 10%, atribuís cada respuesta a su variante (un `prompt_version` en el
trace de §6), y comparás métricas. Solo promovés B a 100% si gana en el harness *y* en señales
online. Es la misma lógica del rerank de M3 ("lo mantengo solo si el número sube"), aplicada a
prompts en producción.

> **Checkpoint:** ¿por qué el A/B de prompts necesita la observabilidad de §7 para funcionar? Porque
> para comparar A vs B tenés que poder **atribuir** cada respuesta, cada costo y cada métrica a su
> variante. Sin un `prompt_version` etiquetado en cada trace, tu A/B es "me parece que el nuevo
> anda mejor" — vibes, no medición.

---

## 7. Observabilidad: ver el costo y la latencia (Langfuse)

### Por qué no podés optimizar lo que no ves

Las cuatro palancas anteriores asumen que *medís*. Pero el costo y la latencia de un LLM están
distribuidos en muchas llamadas anidadas (router → embed query → cache lookup → retrieval → rerank →
LLM → stream) y la API de OpenAI no te dice "esta conversación costó $0.03 y tardó 1.2s hasta el
primer token". Necesitás una capa de **tracing específica para LLMs** que capture eso. La estándar
open-source es **Langfuse** (que ya introdujiste en M2 para evals — acá la usás para costo/latencia).

### Las métricas que importan (y qué es cada una, exacto)

- **TTFT (time-to-first-token):** el tiempo desde que mandás el request hasta que llega el **primer
  token** de la respuesta. Es la métrica de *latencia percibida* en una UI con streaming: el usuario
  no espera la respuesta completa, espera a que *empiece*. Conecta directo con el SSE de M0. Un TTFT
  alto se siente "lento" aunque el total sea rápido. Lo bajás con modelos más rápidos (routing a
  mini), menos input (budgets), prompt caching del proveedor, y red más cerca.
- **Latencia total (p50 / p95):** cuánto tarda la respuesta completa. Reportás **percentiles**, no
  promedios — el promedio esconde la cola. p50 = la mediana (la experiencia "típica"); **p95 = el 5%
  peor** (un cliente de cada 20 lo sufre). Optimizás contra p95 porque es donde se rompe el SLA y se
  van los clientes; el promedio te miente diciendo que todo está bien.
- **Tokens por llamada** (input / output, separados — tienen precios distintos).
- **Costo por conversación / por tenant.** La métrica de negocio. Te deja ver *qué tenant* tiene
  COGS fuera de control y *qué tipo de query* es cara — exactamente lo que el routing y el caching
  atacan. Sin esto, "el LLM sale caro" es una intuición; con esto, es "el tenant X gasta 40% del
  total en queries de comparación que no rutean bien".

### Cómo: instrumentar con Langfuse

Langfuse envuelve tus llamadas y arma un **trace** jerárquico (una conversación) con **observations**
anidadas (cada llamada al LLM, con su costo, tokens y latencia calculados automáticamente):

```python
# services/api/llm.py
from langfuse.openai import openai  # drop-in: envuelve el cliente de OpenAI
from langfuse import observe

@observe()  # crea un trace por turno de conversación
async def answer(query: str, tenant_id: int, prompt_version: str):
    # el wrapper captura model, tokens, costo y latencia de cada llamada solo
    res = await openai.chat.completions.create(
        model=os.environ["MODEL_CHEAP"],  # el modelo vigente del proveedor que uses
        messages=[...],
        metadata={"tenant_id": tenant_id, "prompt_version": prompt_version},  # para A/B y costo por tenant
    )
    return res
```

Con eso, el dashboard de Langfuse te da TTFT, p50/p95, costo por trace y por tenant, y — porque
etiquetaste `prompt_version` — el A/B de §5 sale gratis. **Observabilidad no es un nice-to-have al
final: es el instrumento que hace medibles a las otras cuatro palancas.**

> **Checkpoint:** ¿por qué reportás p95 y no el promedio de latencia? Porque el promedio lo
> dominan los casos rápidos y esconde la cola — podés tener un promedio "bueno" y aun así un 5% de
> usuarios esperando 8 segundos. El SLA y la percepción de "esto es lento" viven en la cola, y la
> cola se mide con percentiles altos.

---

## 8. ⊕ Graft open-source: swap a Ollama (Llama 3.1 / Mistral)

### Por qué hacer este graft

Dos razones, una técnica y una de mercado:

- **No dependencia de vendor (22% de los roles lo esperan).** Saber correr un modelo open-source
  self-hosted te saca de "soy un wrapper de OpenAI" y te pone en "elijo el modelo según el
  trade-off". Es una de las señales que separan AI Engineer de prompt-tinkerer.
- **Economía y compliance reales.** En cierto volumen, o cuando un cliente B2B **no acepta que sus
  datos salgan a un tercero** (banca, salud, gobierno), un modelo self-hosted deja de ser
  ideológico y pasa a ser la respuesta correcta. Pero solo lo sabés si lo medís.

### Cómo: Ollama hace el swap trivial

**Ollama** corre modelos open-source (Llama 3.1, Mistral, Phi, Gemma) localmente y — clave — expone
una **API compatible con OpenAI**. Eso significa que swappear es cambiar la `baseURL` y el nombre del
modelo, sin reescribir tu código:

```bash
# instalás y bajás un modelo (descarga los pesos cuantizados, ver sidebar)
ollama pull llama3.1:8b
ollama run llama3.1:8b "hola"   # prueba rápida; sirve en http://localhost:11434
```

```python
# services/api/llm_local.py — MISMO SDK de OpenAI, otra baseURL
from openai import AsyncOpenAI

local = AsyncOpenAI(
    base_url="http://localhost:11434/v1",  # el endpoint OpenAI-compatible de Ollama
    api_key="ollama",                      # ignorado, pero el SDK lo exige
)

async def answer_local(messages):
    return await local.chat.completions.create(
        model="llama3.1:8b",
        messages=messages,
    )
```

Que swappear sea trivial es *en sí* una lección de arquitectura: si programaste contra la interfaz
de OpenAI (que es de facto un estándar), cambiar de proveedor es trivial. Si te hubieras atado a un
SDK propietario, sería un refactor.

### El entregable real: la tabla comparativa

El graft no es "corrí Llama". Es **medir el trade-off de tres ejes** con *tu* harness y *tu* dataset,
y poder defenderlo:

| | Modelo barato del proveedor (API) | Llama 3.1 8B (Ollama, local) |
|---|---|---|
| **Costo** | precio del tier barato del proveedor (varía por generación) | $0 marginal por token, pero **pagás el GPU/hora** (amortizable solo con volumen) |
| **Calidad** (golden set de M2) | tu número, ej. 0.89 | tu número, ej. 0.81 — **medilo, no lo asumas** |
| **Latencia / TTFT** | rápido si el proveedor no está saturado; depende de la red | depende **brutalmente** de tu hardware (sin GPU decente, lento; con GPU, competitivo) |
| **Privacidad** | datos salen a un tercero | datos **no salen** de tu infra |
| **Operación** | cero infra, pero rate limits del proveedor | vos operás el modelo (GPU, escala, uptime) |

La conclusión madura no es "open-source es mejor/peor", es: *"con API arrancás (cero infra, mejor
calidad por dólar al principio); self-hosted gana cuando el volumen amortiza el GPU, o cuando el
compliance exige que los datos no salgan — y tengo el número de calidad para saber cuánto cuesta esa
decisión"*. Eso es exactamente lo que un entrevistador quiere oír.

> **Checkpoint:** swappear Ollama por OpenAI te tomó cambiar dos líneas. ¿Qué decisión de
> arquitectura te lo permitió? Haber programado contra la **interfaz** (la API estilo OpenAI, un
> estándar de facto) en lugar de atarte a un SDK propietario. La portabilidad de proveedor es una
> propiedad que ganás por diseño, no un parche que agregás después.

---

## Sidebar — Quantization primer (awareness)

Cuando hiciste `ollama pull llama3.1:8b`, bajaste un modelo **cuantizado**. Vale entender qué es,
porque es la pregunta de "¿cómo corrés un modelo grande en hardware modesto?".

- **Qué es.** Los pesos de un modelo se entrenan en **FP16** (16 bits por número). Quantization es
  **representarlos con menos bits** — INT8 (8 bits), INT4 (4 bits) — para que el modelo ocupe menos
  memoria y corra más rápido, a cambio de algo de precisión.
- **La cuenta de memoria.** Un modelo de 8B parámetros en FP16 pesa ~16 GB (no entra en una GPU de
  consumo de 8-12 GB). En INT4 pesa ~4-5 GB — entra. Esa es la razón por la que podés correr Llama
  3.1 8B en tu laptop.
- **El trade-off.** Menos bits → más chico y más rápido, pero **más pérdida de calidad**. La sorpresa
  útil: la degradación de FP16 → INT8 suele ser **casi imperceptible**, y FP16 → INT4 es notable pero
  a menudo aceptable. INT4 es el punto dulce de "corre en mi máquina y responde bien".
- **GGUF.** Es el **formato de archivo** (de `llama.cpp`) que empaqueta un modelo cuantizado para
  correr eficiente en CPU/GPU de consumo. Ollama usa GGUF por debajo. Las variantes que vas a ver
  (`Q4_K_M`, `Q5_K_M`, `Q8_0`) son distintos esquemas de cuantización: el número es los bits, las
  letras son la estrategia. `Q4_K_M` es el default razonable para la mayoría.
- **Cuándo te importa.** Para *correr* modelos (inference): elegís la cuantización por tu hardware.
  Es distinto de QLoRA (M9), que usa cuantización para *entrenar/fine-tunear* barato. Acá es solo
  para servir.

No necesitás *can-build* quantization (es awareness): necesitás poder explicar el trade-off
tamaño/calidad/velocidad y por qué INT4/GGUF es lo que hace que Ollama corra en tu laptop.

---

## 9. Escala: ¿async simple o BullMQ + Celery?

Hasta acá la ingestión de Grounded usó **async Python simple** (M0/M1). M7 es el punto donde te
preguntás si necesitás colas de trabajo robustas (**BullMQ** en TS, **Celery** en Python). La
respuesta honesta y YAGNI:

- **No las metas porque "se ve profesional".** Una cola distribuida es más infra que operar, más
  cosas que se rompen, y una pregunta más que defender sin tener el problema.
- **Metelas cuando *medís* que las necesitás:** picos de ingestión que saturan el proceso, jobs
  largos que no pueden vivir en un request HTTP (re-embeber un corpus entero), o necesidad de
  **retries con backoff y dead-letter** para llamadas a LLM que fallan transitoriamente.
- **El patrón:** el BFF de TS encola con BullMQ (Redis), los workers de Python consumen con Celery.
  Desacopla el request del trabajo pesado y te da reintentos y visibilidad.

Para el curso, **async simple alcanza** salvo que tu práctica de M7 toque un caso de re-procesamiento
masivo. Si lo introducís, logueá el ADR ("por qué cola acá y no antes") — esa decisión, *justificada
con un síntoma medido*, vale más que la cola en sí.

---

## 10. Lo que tenés que poder defender (conecta con `criterios-defensa.md`)

Al cerrar M7, un entrevistador podría pegarte cualquiera de estas. Si no las respondés con *tus
números* y *tus decisiones*, el módulo no está cerrado:

- "Tenés 1M de queries/día. Optimizá el costo." (Las palancas — prompt caching, routing, semantic
  cache, budgets — §1-§5, en orden de impacto.)
- "¿Qué es prompt caching del proveedor y cómo lo maximizás?" (§3: automático ≥1.024 tokens, 50%
  de descuento en cache hit, layout estable-primero.)
- "¿Cómo cacheás respuestas de un LLM si nunca preguntan exactamente lo mismo?" (§4, semantic cache.)
- "¿Cuándo mandás una query al modelo barato vs al caro, y cómo decidís?" (§2, routing + el harness.)
- "Metiste 20 chunks para mejorar la respuesta. ¿Bien o mal?" (§5, budget + lost in the middle.)
- "¿Cómo sabés que la calidad no se degradó cuando cambiaste de prompt / el proveedor cambió el
  modelo?" (§6, drift + harness continuo.)
- "¿Qué es TTFT y por qué te importa más que la latencia total en un chat?" (§7.)
- "¿Cuándo usarías un modelo open-source self-hosted en vez de la API de un proveedor?" (§8, la tabla.)
- "¿Qué es quantization y cómo corrés un 8B en una laptop?" (sidebar, INT4/GGUF.)

Seguí con `material-apoyo.md` para las fuentes, y después `practica.md` para construir las palancas
en Grounded y medir el ahorro.
