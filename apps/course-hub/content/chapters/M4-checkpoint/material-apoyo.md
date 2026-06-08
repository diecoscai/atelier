---
module: M4
---

# Material de apoyo — M4

Curado y ordenado. Los **★ Core** son obligatorios antes de la práctica; **Referencia** es para
consultar mientras construís; **Deep** es profundización opcional para defender mejor en system
design. No leas todo de corrido — leé Core, construí, y volvé a Referencia cuando lo necesites.

## ★ Core (leé esto antes de tocar código)

1. **Instructor — documentación oficial**
   `python.useinstructor.com` · repo `github.com/567-labs/instructor`
   *La* herramienta para structured outputs con Pydantic. Buscá: el "Getting Started" (patrón
   `from_openai` + `response_model`), `max_retries` y cómo Instructor re-pregunta con el error de
   validación, y los ejemplos de "Validation". Después buscá el ejemplo de **Citations / RAG** (hay
   un recipe específico de validar que la cita es un substring del contexto). ~45 min.

2. **OpenAI — Structured Outputs guide**
   `platform.openai.com/docs/guides/structured-outputs`
   La doc oficial del constrained decoding. Buscá: la diferencia entre **JSON mode** y **Structured
   Outputs** (`strict: true`), qué garantiza cada uno, y las limitaciones del schema (qué subset de
   JSON Schema soporta). Es lo que respalda la tabla de la §2 de la lección. ~30 min.

3. **OpenAI — Logprobs (guía + cookbook)**
   Doc: `platform.openai.com/docs/api-reference/chat` (parámetros `logprobs` / `top_logprobs`).
   Cookbook: OpenAI Cookbook, notebook **"Using logprobs"** (`cookbook.openai.com`, buscá
   "logprobs"). Buscá: cómo pedir logprobs, cómo leer `top_logprobs`, y los **casos de uso de
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
     pasar el tenant del request. Es la defensa-en-profundidad de la §6.
   - **pgvector + filtros de metadata** — repo `github.com/pgvector/pgvector`, sección de filtrado:
     cómo combinar `WHERE` (el filtro de tenant) con el operador de distancia, y la nota sobre
     índices con filtros (pre/post-filtering). ~40 min en total.

## Referencia (tené a mano mientras construís)

- **Pydantic** — `docs.pydantic.dev` — `BaseModel`, `Field(description=...)`, validators. El schema
  que Instructor consume. (Ya lo tocaste en M0.)
- **JWT** — `jwt.io` (intro + debugger) y la librería que uses (`pyjwt` para Python:
  `pyjwt.readthedocs.io`). Buscá: estructura header.payload.signature, **verificación de la firma**
  (lo único que da garantía), y cómo leer un claim (`tenant_id`). Clave: verificar ≠ decodificar.
- **FastAPI — Security / dependencies** — `fastapi.tiangolo.com/tutorial/security/` y
  `.../dependencies/`. Cómo armar una dependency que verifica el JWT y devuelve el `tenant_id`
  inyectable en cada endpoint (el lugar correcto para extraer el tenant una sola vez).
- **Railway docs** (`docs.railway.app`) o **Fly.io docs** (`fly.io/docs`) — deploy + TLS automático
  en el dominio asignado + variables de entorno (tu OpenAI key, el secret del JWT). Para el deploy
  público del checkpoint.
- **Mermaid** (`mermaid.js.org`) o **Excalidraw** (`excalidraw.com`) — para el diagrama de
  arquitectura del README/checkpoint. Mermaid si lo querés versionado en el repo.

## Deep dive (opcional, para defender mejor en system design)

- **Chip Huyen — "AI Engineering"** (O'Reilly, 2025). Para M4: el capítulo de **structured outputs
  / constrained generation** y la discusión de **confianza/calibración y abstención**. La fuente
  que da autoridad cuando te preguntan "¿de dónde sacaste esto?".
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
