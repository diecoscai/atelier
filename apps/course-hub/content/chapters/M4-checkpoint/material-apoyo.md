---
module: M4
---

# Material de apoyo — M4

> Enlaces y versiones verificados en julio 2026.

Curado y ordenado. Los **★ Core** son obligatorios antes de la práctica; **Referencia** es para
consultar mientras construís; **Deep** es profundización opcional para defender mejor en system
design. No leas todo de corrido — leé Core, construí, y volvé a Referencia cuando lo necesites.

## ★ Core (leé esto antes de tocar código)

1. **Instructor — documentación oficial**
   `python.useinstructor.com` · repo `github.com/567-labs/instructor` (11k+ ⭐, versión estable
   `1.15.4`, PyPI `pypi.org/project/instructor`)
   *La* herramienta para structured outputs con Pydantic. Buscá: el "Getting Started" con el patrón
   **actual** `instructor.from_provider("openai/gpt-4o-mini")` (interfaz unificada para 15+
   providers — OpenAI, Anthropic, Gemini, Ollama, etc.; el viejo `from_openai` sigue funcionando
   pero ya no es el ejemplo canónico), `max_retries` y cómo Instructor re-pregunta con el error de
   validación, y los ejemplos de "Validation". Después buscá el ejemplo de **Citations / RAG** (hay
   un recipe específico de validar que la cita es un substring del contexto). Instalá pineando
   versión (`uv add "instructor==1.15.4"`), no a ciegas. ~45 min.

2. **OpenAI — Structured Outputs guide**
   `developers.openai.com/api/docs/guides/structured-outputs`
   La doc oficial del constrained decoding. Buscá: la diferencia entre **JSON mode** (que la propia
   doc marca como *legacy*) y **Structured Outputs** (`strict: true`), qué garantiza cada uno, y las
   limitaciones del schema (qué subset de JSON Schema soporta). Es lo que respalda la tabla de la
   §2 de la lección. De paso, revisá `developers.openai.com/api/docs/deprecations` para ver qué
   snapshots de modelo tienen fecha de shutdown ya anunciada — relevante para fijar el modelo del
   código de ejemplo. ~30 min.

3. **OpenAI — Logprobs (guía + cookbook)**
   Doc: `developers.openai.com/api/docs/api-reference/chat` (parámetros `logprobs` / `top_logprobs`,
   sección Chat Completions — la Responses API no soporta logprobs a julio 2026).
   Cookbook: OpenAI Cookbook, notebook **"Using logprobs"** (`cookbook.openai.com/examples/using_logprobs`).
   Buscá: cómo pedir logprobs, cómo leer `top_logprobs`, y los **casos de uso de
   confianza/clasificación** — el cookbook muestra exactamente cómo convertir logprobs en una señal
   de confianza, que es lo que instrumentás en Grounded. ~40 min.

4. **OWASP — Top 10 for LLM Applications, LLM01: Prompt Injection**
   `genai.owasp.org` (proyecto "OWASP Top 10 for LLM Applications"; el PDF/landing del listado).
   Buscá la entrada **LLM01 Prompt Injection**: qué es (directa e indirecta/doc poisoning), por qué
   no hay un prompt "a prueba de balas", y las mitigaciones recomendadas. Es la munición canónica
   para defender "por qué el system prompt NO aísla tenants" (§6). ~30 min.

5. **Multi-tenant data isolation en RAG** — leé al menos UNA fuente seria sobre el patrón:
   - **AWS Architecture / SaaS** — buscá "multi-tenant RAG isolation" en el AWS Machine Learning
     Blog y en la SaaS Lens (patrones silo/pool/bridge y cómo se aplican al vector store). Buscá:
     por qué el aislamiento va en la capa de datos, y el trade-off silo (DB por tenant) vs pool
     (DB compartida + filtro por `tenant_id`).
   - **Postgres Row-Level Security** — doc oficial `postgresql.org/docs/current/ddl-rowsecurity.html`.
     Buscá: `ENABLE ROW LEVEL SECURITY`, `CREATE POLICY ... USING (...)`, y `current_setting` para
     pasar el tenant del request. Es la defensa-en-profundidad de la §6. **Prestá atención a
     `SET LOCAL` vs `SET`**: con connection pooling en producción, un `SET` sin `LOCAL` deja el
     tenant seteado pegado a la conexión y puede filtrarse al siguiente request que la reuse — el
     detalle que separa "lo implementé" de "lo implementé bien".
   - **pgvector + filtros de metadata** — repo `github.com/pgvector/pgvector`, sección de filtrado:
     cómo combinar `WHERE` (el filtro de tenant) con el operador de distancia, y la nota sobre
     índices con filtros (pre/post-filtering). ~40 min en total.

## Referencia (tené a mano mientras construís)

- **Pydantic** — `docs.pydantic.dev` — `BaseModel`, `Field(description=...)`, validators. El schema
  que Instructor consume. (Ya lo tocaste en M0.)
- **JWT** — `jwt.io` (intro + debugger) y la librería que uses (`pyjwt` para Python:
  `pyjwt.readthedocs.io`, pineá **`pyjwt>=2.13`**). Buscá: estructura header.payload.signature,
  **verificación de la firma** (lo único que da garantía), y cómo leer un claim (`tenant_id`).
  Clave: verificar ≠ decodificar. Nota de versión: PyJWT 2.13 (mayo 2026, ver
  `pyjwt.readthedocs.io/en/stable/changelog.html`) endureció el default de seguridad — una clave
  HMAC vacía (típico bug de env var faltante) ahora lanza `InvalidKeyError` en vez de fallar
  silenciosamente, y `PyJWKClient` fuerza que el algoritmo del header coincida con tu allow-list.
  Si pineás una versión vieja, tu verificación de JWT del paso 4 de `practica.md` puede tener
  agujeros que 2.13 ya cierra.
- **FastAPI — Security / dependencies** — `fastapi.tiangolo.com/tutorial/security/simple-oauth2/`
  y `.../dependencies/`. Cómo armar una dependency que verifica el JWT y devuelve el `tenant_id`
  inyectable en cada endpoint (el lugar correcto para extraer el tenant una sola vez). Fijá una
  versión mínima de FastAPI en tu `pyproject.toml` (el framework itera rápido — refactor de router
  internals el 1 de julio 2026 — aunque este patrón de seguridad no tuvo cambios breaking).
- **Railway docs** (`docs.railway.com/networking/domains`) o **Fly.io docs** (`fly.io/docs`,
  `fly.io/pricing`) — deploy + TLS automático (Let's Encrypt) en el dominio asignado + variables de
  entorno (tu OpenAI key, el secret del JWT). El TLS es gratis en ambos; el **hosting** sigue una
  cascada distinta en cada uno: **Fly.io** da un trial de 2 VM-horas/7 días y después cobra desde
  el primer dólar (100% pay-as-you-go, pide tarjeta, sin plan gratis de respaldo). **Railway** da
  un trial de 30 días con $5 de crédito y, al vencer, *no* salta directo a Hobby $5/mes — cae a un
  **Free plan** con ~$1/mes de crédito perpetuo (irrisorio para correr algo 24/7, pero existe)
  antes de que necesites pasarte a Hobby para uso real. Ninguno te deja correr el checkpoint gratis
  indefinidamente; presupuestalo antes de comprometerte al deploy.
- **Mermaid** (`mermaid.js.org`) o **Excalidraw** (`excalidraw.com`) — para el diagrama de
  arquitectura del README/checkpoint. Mermaid si lo querés versionado en el repo.

## Deep dive (opcional, para defender mejor en system design)

- **Chip Huyen — "AI Engineering"** (O'Reilly, 2025; repo de ejemplos `github.com/chiphuyen/aie-book`).
  Para M4, específicamente: el capítulo **"Structured Outputs"** (constrained generation) y el
  capítulo de **"Evaluation"** en la parte de calibración/abstención — no hace falta leer el libro
  entero. Es un libro de un año (jul 2026), así que tratalo como fuente de *principios* de diseño
  (evals, calibración, structured generation), no como referencia de qué modelo o API usar hoy —
  para eso, la doc viva de cada provider (arriba) es la fuente de verdad.
- **Andrej Karpathy — "makemore" (parte 2/3: el MLP)** — serie *Neural Networks: Zero to Hero*
  (YouTube) + repo `github.com/karpathy/makemore`. **Side-quest B.** Buscá: cómo el MLP produce
  *logits* → *softmax* → distribución sobre el siguiente caracter, y la **negative log likelihood**
  como loss. Es exactamente la mecánica detrás de los logprobs que instrumentás en Grounded — verla
  "desde adentro" es lo que te deja explicar logprobs con autoridad, no de memoria. ~3-4h.
- **Andrej Karpathy — "Let's build the GPT Tokenizer"** y la serie Zero to Hero en general — si
  querés cerrar la intuición de softmax/temperature/cross-entropy que sostiene la §5.
- **Simon Willison — escritos sobre prompt injection** (`simonwillison.net`, tag "prompt-injection"
  y "security"). El comentarista más claro sobre por qué el prompt injection no tiene "fix" limpio
  y por qué la seguridad tiene que ser estructural — refuerza el argumento de la §6 con ejemplos
  concretos.
- **Hamel Husain — "Your AI Product Needs Evals"** (`hamel.dev`) — re-leé la parte de cómo los
  umbrales (incluido el de abstención de la §4) se eligen *midiendo*, no inventando. Conecta el
  "calibrado" de M4 con el harness de M2.

## Cómo usar este material

Leé Core (Instructor → Structured Outputs → logprobs → OWASP LLM01 → multi-tenant isolation) →
escribí en `DECISIONS.md` o un scratchpad tus respuestas a los checkpoints de la lección,
especialmente **"¿por qué el system prompt no aísla tenants?"** y **"¿qué miden y qué NO miden los
logprobs?"**. Si podés responder esas dos *sin mirar*, estás listo para construir el checkpoint en
`practica.md`.
