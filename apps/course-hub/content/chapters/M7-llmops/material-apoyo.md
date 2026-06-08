---
module: M7
---

# Material de apoyo — M7

Curado y ordenado. No leas todo: los **★ Core** son obligatorios antes de la práctica; el resto es
referencia para consultar mientras construís, o profundización opcional. Para cada uno, *qué buscar*.

## ★ Core (leé esto antes de tocar código)

1. **Langfuse — Docs: "Tracing", "Get Started" y "Model Usage & Cost"**
   `langfuse.com/docs`
   La capa de observabilidad del módulo. Buscá: el modelo `trace → observation`, el decorator
   `@observe`, el wrapper drop-in de OpenAI (`langfuse.openai`), cómo Langfuse calcula tokens y costo
   automáticamente, y cómo pasar `metadata` (para etiquetar `tenant_id` y `prompt_version`). ~45 min.

2. **Ollama — Docs oficiales + "OpenAI compatibility"**
   `ollama.com` (sección Docs) y el repo `github.com/ollama/ollama` (carpeta `docs/`)
   El graft open-source. Buscá: `ollama pull` / `ollama run`, el endpoint OpenAI-compatible en
   `:11434/v1`, cómo listar tags de cuantización de un modelo, y qué modelos hay (`llama3.1`,
   `mistral`). Buscá específicamente la página `docs/openai.md` (la prueba de que swapear es cambiar
   `base_url`). ~40 min.

3. **Chip Huyen — "AI Engineering" (O'Reilly, 2025), capítulos de inference optimization y cost**
   El marco conceptual de costo/latencia del módulo. Buscá: la descomposición de latencia
   (incluida **TTFT** vs total), el trade-off costo/latencia/calidad, prompt caching, y la sección
   de inference optimization (quantization, batching). Es la fuente que te da autoridad cuando te
   preguntan "¿de dónde sacaste esto?". ~1-2h para los capítulos relevantes.

4. **pgvector — README (releído con otra intención) + "Semantic caching" pattern**
   `github.com/pgvector/pgvector`
   Ya lo conocés de M0; acá lo reusás para el cache. Buscá: índice HNSW con `vector_cosine_ops`, y
   pensá el cache como un "retrieval de queries" (vecino más cercano sobre `query_embedding`). Para
   el patrón concreto de semantic caching, buscá los writeups de **Redis** (`redis.io`, "semantic
   caching") y **Zilliz/GPTCache** (`github.com/zilliz/GPTCache`) — leelos por el *concepto*
   (embeber query → similarity lookup → umbral), no por la implementación (vos lo hacés en pgvector).
   ~30 min.

## Referencia (tené a mano mientras construís)

- **OpenAI — Pricing** `openai.com/api/pricing` — los números reales para tu tabla de costo
  (input vs output, `gpt-4o` vs `gpt-4o-mini`). **No memorices los precios** — cambian; aprendé la
  *relación* (~20-30x) y el método.
- **OpenAI — "Prompt caching"** (`platform.openai.com/docs`, sección prompt caching) — el cache de
  *prefijo* del proveedor (§4); cómo estructurar el prompt (estable adelante) para maximizar el hit.
- **Anthropic — "Prompt caching"** (docs de Anthropic) — el equivalente con control explícito
  (`cache_control`); útil para contrastar con el automático de OpenAI.
- **tiktoken** `github.com/openai/tiktoken` — contar tokens para los budgets de §4.
- **OpenAI structured outputs / `response_format`** (`platform.openai.com/docs`) — para el router
  que devuelve `{"complexity": ...}` (lo viste en M4 con Instructor/Pydantic).
- **llama.cpp** `github.com/ggml-org/llama.cpp` — el motor detrás de Ollama; el repo donde vive el
  formato **GGUF** y la doc de los esquemas de cuantización (`Q4_K_M`, etc.).

## Deep dive (opcional, para defender mejor en system design)

- **Liu et al. — "Lost in the Middle: How Language Models Use Long Contexts" (2023)**
  `arxiv.org/abs/2307.03172`
  Ya lo citaste en M0; acá es munición directa de §4. Buscá la curva en U: la evidencia de que más
  contexto puede *empeorar* la respuesta. Es el respaldo de "presupuesto el contexto, no lo lleno".

- **Dettmers et al. — "QLoRA: Efficient Finetuning of Quantized LLMs" (2023)**
  `arxiv.org/abs/2305.14314`
  Para el sidebar de quantization (y precarga M9). Buscá: NF4, la intuición de que 4-bit preserva
  casi toda la calidad. Acá te alcanza con la intuición; el hands-on es M9.

- **Tim Dettmers — "A Gentle Introduction to 8-bit Matrix Multiplication / LLM.int8()"**
  (blog de Hugging Face / del autor) — la mejor explicación intuitiva de por qué INT8 casi no
  degrada. Buscá: outliers y por qué se manejan aparte. Opcional, para entender el "por qué".

- **Hamel Husain & Shreya Shankar — material de evals** (ya en M2)
  Acá lo reusás para drift detection (§5): el harness como monitor continuo, no como gate de un solo
  módulo. Buscá la idea de "evals como tests de regresión".

## Cómo usar este material

Leé los ★ Core → escribí en tus palabras (en `DECISIONS.md` o un scratchpad) las respuestas a los
checkpoints de la lección, **con un número estimado de tu sistema** (el cálculo de costo de §1 contra
tu propio tráfico esperado) → recién ahí abrí `practica.md`. Si podés explicar por qué las cuatro
palancas *multiplican* el ahorro, y cuándo el self-hosted gana al API, estás listo para construir.
