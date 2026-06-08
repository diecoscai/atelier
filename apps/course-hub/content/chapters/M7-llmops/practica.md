---
module: M7
feature: model routing + semantic caching + token budgets + observabilidad (Langfuse) + swap a Ollama, con ahorro medido
repo: grounded
---

# Práctica — bajá el costo del LLM, medido (en el repo Grounded)

Objetivo: instrumentar las cuatro palancas de control de costo sobre el RAG que ya tenés y
**demostrar con un número** que el costo por conversación baja, **sin que la calidad caiga** más de
lo aceptable en el golden dataset de M2. Cierre con el swap a un modelo open-source y la tabla
comparativa. Cada paso tiene **qué hacer** y **cómo verificar**. No avances sin que el actual verifique.

> Trabajás en el repo **`grounded`**. El harness de M2 y el golden dataset son tu instrumento de
> medición en todo el módulo: cada optimización se valida contra ellos. Sin "y la calidad aguantó",
> ningún ahorro cuenta.

## Pre-requisitos
- Grounded con el pipeline de M0-M4 andando (ingestión, retrieval hybrid+rerank, chat con streaming,
  multi-tenant isolation) y el **harness de M2 + golden dataset** corriendo.
- API key de OpenAI. Docker (Postgres con pgvector ya levantado de M0).
- **Ollama instalado** localmente (`ollama.com`) para el Paso 6.
- Leíste los ★ Core de `material-apoyo.md` y podés explicar las 4 palancas sin mirar.

---

## Paso 0 — Baseline de costo y latencia (medí ANTES de optimizar)
**Hacer:**
- Instrumentá Langfuse en el endpoint `/chat` (decorator `@observe` + wrapper `langfuse.openai`).
  Pasá `metadata` con `tenant_id` y `prompt_version` (empezá en `"v1"`).
- Corré el golden dataset de M2 una vez con el sistema **tal cual está hoy** (todo a `gpt-4o`, sin
  routing, sin cache, sin budget).

**Verificar:** en el dashboard de Langfuse ves, para esa corrida: **costo total**, **costo por
conversación promedio**, **tokens** (input/output) y **TTFT / p50 / p95**. Anotá estos números —
son tu baseline. Sin baseline, "bajé el costo" no tiene contra qué.

## Paso 1 — Model routing por complejidad
**Hacer:**
- `routeQuery(query)` en el BFF (`apps/web/lib/router.ts`): clasificador con `gpt-4o-mini` que
  devuelve `simple | complex` en structured output (ver lección §2).
- `pickModel(complexity)`: `simple → gpt-4o-mini`, `complex → gpt-4o`.
- Enchufá el router antes de la generación en `/chat`.

**Verificar:**
- Una query factual ("¿horario de atención?") rutea a `simple`; una de comparación/razonamiento
  rutea a `complex` (test unitario, `pruebas.md` capa 1).
- Corré el golden set **con el router prendido**: el costo de generación baja **y** la métrica de
  calidad cae menos de tu umbral aceptado (ej. ≤ 0.02). Anotá ambos números. Si la calidad cae de
  más, ajustá el prompt del clasificador o el corte simple/complex — no aceptes el ahorro a ciegas.

## Paso 2 — Token / context budgets
**Hacer:**
- `count_tokens` con `tiktoken` y `fit_chunks_to_budget(chunks, tier)` (`services/api/budget.py`,
  ver lección §4). Los chunks vienen ya rankeados del rerank de M3; cortás por budget desde el final.
- Aplicá `CONTEXT_BUDGET` por tier antes de armar el prompt. Cap de `max_tokens` en el output.
  Truncá el historial a los últimos N turnos.

**Verificar:**
- Test: con más chunks que el budget, `fit_chunks_to_budget` devuelve solo los que entran, **en
  orden de relevancia** (los del final se descartan).
- En Langfuse, los tokens de input por turno bajan respecto al baseline. La calidad en el golden set
  **no cae** (estás cortando ruido, no señal — si cae, tu budget es demasiado agresivo).

## Paso 3 — Semantic cache (sobre pgvector, por tenant)
**Hacer:**
- Tabla `semantic_cache` con `tenant_id`, `query_embedding vector(1536)`, `response`, índice HNSW
  (ver lección §3).
- `cache_lookup(db, tenant_id, query)`: embebe la query, busca el vecino más cercano **del mismo
  tenant**, devuelve la respuesta si `similarity >= SIMILARITY_THRESHOLD` (arrancá en 0.95).
- `cache_store(...)` al final del camino de miss. Enchufá: lookup antes del LLM, store después.

**Verificar:**
- Test de **hit**: dos queries semánticamente equivalentes ("¿cómo reseteo mi contraseña?" /
  "olvidé mi clave") → la 2da pega el cache (no llama al LLM; verificable porque Langfuse no registra
  una generación nueva, o con un spy/mock).
- Test de **aislamiento** (crítico): una query cacheada por el tenant A **no** se sirve al tenant B
  aunque sea idéntica. Este test es no negociable (regla cardinal de M4).
- Con tráfico repetido, el **cache hit rate** sube en Langfuse y el costo total baja.

## Paso 4 — Observabilidad: el dashboard de costo/latencia
**Hacer:**
- Dejá Langfuse capturando: costo por conversación, costo por tenant, tokens, TTFT, p50/p95, y la
  variante `prompt_version`.
- Armá (o usá la vista de Langfuse) un panel que muestre costo por tenant y latencia p95.

**Verificar:** podés responder, mirando el dashboard, "¿qué tenant gasta más y por qué tipo de
query?" y "¿cuál es mi TTFT p95?". Si no podés, falta instrumentación.

## Paso 5 — A/B de prompts + canario de drift
**Hacer:**
- Servís dos `prompt_version` (`v1` / `v2`) a una fracción del tráfico, etiquetadas en el trace.
- Job programado (GitHub Actions schedule / cron) que corre el golden set 1x/día y alerta si la
  métrica de calidad cae bajo un umbral (drift del proveedor). El CI gate de M2 ya cubre el drift
  que vos introducís.

**Verificar:** podés comparar en Langfuse calidad/costo de `v1` vs `v2` atribuidos por variante. El
job de drift corre y produce un resultado (verde) que podés enseñar.

## Paso 6 — ⊕ Graft open-source: swap a Ollama y comparar
**Hacer:**
- `ollama pull llama3.1:8b` (y opcional `mistral`). Cliente `AsyncOpenAI` con
  `base_url="http://localhost:11434/v1"` (`services/api/llm_local.py`, ver lección §7).
- Corré el golden set de M2 **con Llama 3.1 8B local** exactamente como lo corriste con OpenAI.
- Armá la **tabla comparativa** de 3 ejes (costo / calidad / latencia-TTFT) + privacidad + operación.

**Verificar:** swappear te tomó cambiar `base_url` y el nombre del modelo (no reescribiste el
pipeline). Tenés la tabla con **tus números** (calidad del golden set local vs API, TTFT de cada
uno) y una conclusión escrita de cuándo elegirías cada uno.

## Paso 7 — (Si hace falta) colas robustas
**Hacer:** solo si tu práctica tocó un caso real de re-procesamiento masivo (re-embeber un corpus
entero) o necesitás retries/backoff/dead-letter: introducí BullMQ (TS, encola) + Celery (Python,
worker). Si no, **dejá async simple** (es la decisión correcta y defendible).

**Verificar:** si las introdujiste, un job pesado corre desacoplado del request con reintentos. Si
no, podés defender *por qué* async simple alcanza (no tenés el síntoma que justifica la cola).

## Paso 8 — Capa de defensa (el entregable real)
**Hacer:**
- `DECISIONS.md` con los ADRs de M7, taggeados `Module: M7`:
  - **ADR-00X "Routing por complejidad":** umbrales, el ahorro y la caída de calidad medidos.
  - **ADR-00X "Semantic cache":** el umbral elegido y por qué, aislamiento por tenant, estrategia de
    invalidación.
  - **ADR-00X "Context budgets por tier":** los límites y la conexión con lost-in-the-middle.
  - **ADR-00X "OpenAI API vs Ollama self-hosted":** la tabla comparativa y el criterio de switch.
- Respondé los **defense drills** (`pruebas.md` capa 2) por escrito, con tus números.
- Actualizá `course.json` (status `shipped`, tests, links al dashboard de Langfuse).

**Verificar:** podés explicar cada decisión y cada número sin mirar las notas. Recién ahí marcás el gate.

---

## Definición de "hecho" (M7)
✅ Router elige modelo por complejidad y el costo de generación baja medido · ✅ Semantic cache
pega en queries equivalentes, **aislado por tenant**, con hit rate visible · ✅ Context budgets por
tier aplicados, tokens de input bajan · ✅ Dashboard de Langfuse con costo por conversación/tenant +
TTFT + p50/p95 · ✅ Tabla comparativa OpenAI vs Ollama con tus números · ✅ La calidad en el golden
set de M2 aguantó dentro del umbral aceptado en *cada* optimización · ✅ ADRs escritos · ✅ defense
drills respondidos · ✅ `course.json` publicado. → marcás el gate en el panel del módulo.
