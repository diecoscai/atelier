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
   automáticamente, y cómo pasar `metadata` (para etiquetar `tenant_id` y `prompt_version`). Usá
   **Python SDK ≥4.0 / JS-TS SDK ≥5.0** (el rewrite que llegó a GA en marzo 2026): `@observe` sigue
   igual, pero `update_current_trace()` está deprecado a favor de `propagate_attributes()`, y por
   default el SDK v4 ya no exporta *todos* los spans de OpenTelemetry — solo los de LLM, así que si
   querés ver spans de DB/HTTP en el trace hay que habilitarlo explícito. Ver la guía de migración
   `langfuse.com/docs/observability/sdk/upgrade-path/python-v3-to-v4` si venís de v3. (Dato de
   contexto: en enero 2026 Langfuse pasó a formar parte de ClickHouse — no cambia la API que usás
   acá, pero vale saberlo si te preguntan por el roadmap o el self-hosting.) ~45 min.

2. **Ollama — Docs oficiales + "OpenAI compatibility"**
   `ollama.com` (sección Docs) y el repo `github.com/ollama/ollama` (carpeta `docs/`)
   El graft open-source. Buscá: `ollama pull` / `ollama run`, el endpoint OpenAI-compatible en
   `:11434/v1` (Ollama lo sigue marcando **experimental** en su propia doc — no asumas que la ruta
   no puede cambiar), cómo listar tags de cuantización de un modelo, y qué modelos hay vigentes para
   correr en una laptop (`qwen3` es hoy el default de facto de la comunidad; `gemma3`, `phi4`,
   `llama3.2` y `mistral` como alternativas). Buscá específicamente la página `docs/openai.md` (la
   prueba de que swapear es cambiar `base_url`). ~40 min.

3. **Chip Huyen — "AI Engineering" (O'Reilly, 2025), capítulos de inference optimization y cost**
   El marco conceptual de costo/latencia del módulo. Buscá: la descomposición de latencia
   (incluida **TTFT** vs total), el trade-off costo/latencia/calidad, **prompt caching**,
   **distillation** como patrón de transferencia de capacidad entre modelos, y la sección de
   inference optimization (quantization, batching). Es la fuente que te da autoridad cuando te
   preguntan "¿de dónde sacaste esto?". ~1-2h para los capítulos relevantes.

4. **pgvector — README (releído con otra intención) + "Semantic caching" pattern**
   `github.com/pgvector/pgvector`
   Ya lo conocés de M0; acá lo reusás para el cache. Buscá: índice HNSW con `vector_cosine_ops`
   (además de `halfvec` para cuantizar embeddings e iterative index scans para queries filtradas,
   ambos en pgvector 0.8.x), y pensá el cache como un "retrieval de queries" (vecino más cercano
   sobre `query_embedding`). Para el patrón concreto de semantic caching, buscá el writeup de
   **Redis** (`redis.io`, "semantic caching"). **GPTCache** (`github.com/zilliz/GPTCache`) fue la
   referencia histórica del patrón pero perdió tracción frente a implementarlo nativo sobre
   Postgres/Redis (que es justo lo que hacés acá) — si lo mirás, es solo por el *concepto* (embeber
   query → similarity lookup → umbral), no como dependencia a instalar. ~30 min.

## Referencia (tené a mano mientras construís)

- **OpenAI — Pricing** `developers.openai.com/api/docs/pricing` — los números reales para tu tabla de
  costo. **No memorices los precios ni un ratio fijo** — cambian con cada generación. A julio 2026,
  frontier vs tier barato *de la misma generación* (Sol vs Luna en GPT-5.6) da ~5x, no 20-30x; ese
  20-30x solo aparece si cruzás generaciones (ej. Sol 5.6 vs `nano` 5.4), y eso no es el ratio que
  necesitás para decidir tu router. Aprendé el *método*: desde GPT-5, OpenAI corre 3+ tiers de precio
  por generación (ej. Sol/Terra/Luna) — primero decidí cuál tier es tu "barato" en la generación
  vigente, después calculá el ratio contra el frontier de esa misma generación.
- **OpenAI — "Prompt caching" (guía oficial)** `developers.openai.com/api/docs/guides/prompt-caching`
  — el cache de prefijo del proveedor (§3 de la lección): automático ≥1.024 tokens, hits en
  bloques de 128, ~50% de descuento. Leé el layout "estable adelante", los ejemplos de cuándo
  NO se produce un hit, y — si tu proveedor/generación ya lo soporta (GPT-5.6+) — el costo de los
  **cache writes** (1.25x el input estándar) y el `prompt_cache_breakpoint` explícito.
- **OpenAI — Cookbook `prompt_caching_201`** `cookbook.openai.com` — casos de uso avanzados:
  extended caching, multi-turn con prefijo estable, medición del hit rate. Útil para el ADR de
  estructura de prompt en Grounded.
- **Anthropic — "Prompt caching"** (docs de Anthropic) — el equivalente con control explícito
  (`cache_control`); útil para contrastar con el automático de OpenAI. La API de Anthropic pide que
  marques explícitamente los breakpoints; la de OpenAI lo detecta sola.
- **tiktoken** `github.com/openai/tiktoken` — contar tokens para los budgets de §5. La librería suele
  ir atrás agregando el alias exacto de modelos nuevos; más robusto resolver por *encoding*
  (`o200k_base`) que por nombre de modelo (ver lección §5).
- **OpenAI structured outputs / `response_format`** (`developers.openai.com/api/docs`) — para el
  router que devuelve `{"complexity": ...}` (lo viste en M4 con Instructor/Pydantic). Nota:
  `platform.openai.com/docs` redirige (301) acá — es el mismo dominio nuevo que ya usa la guía de
  prompt caching más arriba.
- **llama.cpp** `github.com/ggml-org/llama.cpp` — el motor detrás de Ollama; el repo donde vive el
  formato **GGUF** y la doc de los esquemas de cuantización (`Q4_K_M`, etc.).
- **OpenTelemetry** `opentelemetry.io` — el protocolo de traces/spans sobre el que corre Langfuse
  en 2026 (ver §7 de la lección). No hace falta implementarlo aparte de Langfuse; alcanza con
  poder nombrarlo cuando describís tu stack de observabilidad. Complementa la doc de Langfuse de
  arriba: `langfuse.com/docs` tiene la sección de integración con OTel si querés el detalle de
  cómo se relacionan los dos.

## Deep dive (opcional, para defender mejor en system design)

- **Liu et al. — "Lost in the Middle: How Language Models Use Long Contexts" (2023)**
  `arxiv.org/abs/2307.03172`
  Ya lo citaste en M0; acá es munición directa de §5. Buscá la curva en U: la evidencia de que más
  contexto puede *empeorar* la respuesta. Es el respaldo de "presupuesto el contexto, no lo lleno".
  El fenómeno sigue confirmado en 2026 incluso en modelos con ventanas de 1M+ tokens (benchmarks de
  seguimiento como **RULER** y **HELMET**), y hoy hay explicación arquitectónica además de empírica:
  el decaimiento de largo plazo de RoPE reduce la similitud entre tokens distantes y softmax amplifica
  el efecto.

- **Dettmers et al. — "QLoRA: Efficient Finetuning of Quantized LLMs" (2023)**
  `arxiv.org/abs/2305.14314`
  Para el sidebar de quantization (y precarga M9). Buscá: NF4, la intuición de que 4-bit preserva
  casi toda la calidad. Acá te alcanza con la intuición; el hands-on es M9.

- **Tim Dettmers — "A Gentle Introduction to 8-bit Matrix Multiplication / LLM.int8()"**
  (blog de Hugging Face / del autor) — la mejor explicación intuitiva de por qué INT8 casi no
  degrada. Buscá: outliers y por qué se manejan aparte. Opcional, para entender el "por qué".

- **Hamel Husain & Shreya Shankar — material de evals** (ya en M2)
  Acá lo reusás para drift detection (§6): el harness como monitor continuo, no como gate de un solo
  módulo. Buscá la idea de "evals como tests de regresión".

## Cómo usar este material

Leé los ★ Core → escribí en tus palabras (en `DECISIONS.md` o un scratchpad) las respuestas a los
checkpoints de la lección, **con un número estimado de tu sistema** (el cálculo de costo de §1 contra
tu propio tráfico esperado) → recién ahí abrí `practica.md`. Si podés explicar por qué las cuatro
palancas *multiplican* el ahorro, y cuándo el self-hosted gana al API, estás listo para construir.
