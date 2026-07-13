---
module: M4
feature: structured outputs + citations + "no sé" calibrado + multi-tenant isolation + deploy (CHECKPOINT)
repo: grounded
---

# Práctica — construí el HIREABLE CHECKPOINT (en el repo Grounded)

Objetivo: que Grounded devuelva salidas validadas con citas verificadas, abstenga cuando no sabe,
aísle tenants de forma determinística y verificada, y esté deployado público con TLS, documentado
y evaluable en 5 minutos. Cada paso tiene **Hacer** y **Verificar**. No avances sin verificar.

> Trabajás en el repo **`grounded`**. Partís de M3: ingestión real (M1), eval harness + golden
> dataset (M2), hybrid retrieval + rerank (M3). M4 le agrega la capa de confianza, el aislamiento
> y el shipping del checkpoint.

## Pre-requisitos
- M3 cerrado: `/chat` recupera con hybrid+rerank y tenés `recall@5` medido contra el golden set.
- Leíste los ★ Core de `material-apoyo.md`; podés explicar por qué el system prompt no aísla
  tenants y qué miden (y qué no) los logprobs, *sin mirar*.
- `uv add "instructor==1.15.4" "pyjwt>=2.13"` en `services/api` — pineá versión, no instales a
  ciegas (ver `material-apoyo.md`: PyJWT 2.13 endureció defaults de seguridad relevantes acá).

---

## Paso 1 — Structured outputs con Instructor
**Hacer:**
- Definí los modelos Pydantic `Citation` (`chunk_id: int`, `quote: str`) y `Answer`
  (`text: str`, `citations: list[Citation]`, `answered: bool`). Usá `Field(description=...)` en
  cada campo para guiar al modelo (ver lección §2).
- Armá el cliente con el patrón unificado actual: `client = instructor.from_provider("openai/gpt-4o-2024-08-06")`
  (versioná el snapshot del modelo explícito, no el alias desnudo `gpt-4o`).
- Refactorizá `/chat`: en vez de devolver texto, numerá los chunks recuperados en el prompt
  (`[chunk 12] ...`) y pedí `response_model=Answer`, `max_retries=2`.

**Verificar:** una query devuelve un objeto `Answer` tipado: `answer.text` (str), `answer.citations`
(lista de `Citation`), `answer.answered` (bool). Forzá un fallo (pedí un campo extra raro y validalo)
para *ver* el reintento de Instructor en los logs. (Test de schema en `pruebas.md`, capa 1.)

## Paso 2 — Citations al pasaje exacto (verificadas)
**Hacer:**
- En el prompt, instruí: "citá por número de chunk; el `quote` debe ser un fragmento textual del
  chunk citado".
- Implementá `verify_citation(citation, chunks)` que chequee que `citation.quote` es substring (o
  fuzzy match alto) del contenido del `chunk_id` citado (lección §3).
- Antes de devolver: filtrá/marcá las citas que no verifican. Si una respuesta no tiene **ninguna**
  cita verificada, tratala como no-confiable (bajá el badge o forzá `answered=False`).

**Verificar:** una pregunta cubierta devuelve `citations` con `quote` que *de verdad* aparece en el
chunk citado (lo confirmás manualmente con un caso). Inyectá a mano una cita falsa en un test y
confirmá que `verify_citation` la rechaza. (Test en `pruebas.md`, capa 1.)

## Paso 3 — "No sé" calibrado + logprobs (confidence)
**Hacer:**
- **Abstención por retrieval:** antes de generar, si la distancia del mejor chunk supera un umbral,
  devolvé directamente `Answer(text="No encontré esto en tu documentación.", answered=False,
  citations=[])`. **Calibrá el umbral contra el golden dataset de M2**: corré queries con respuesta
  y queries sin respuesta, y elegí el umbral que abstiene en las segundas sin abstenerse en las
  primeras. Anotá el número y el método en `DECISIONS.md` (no lo inventes).
- **Confidence vía logprobs:** pedí `logprobs=True, top_logprobs=5` en la llamada de generación
  (recordá: esto es Chat Completions, no Responses API — lección §5).
  Implementá `confidence(tokens)` que agregue `exp(logprob)` (media, y también `min` para el cuello
  de botella — lección §5). Adjuntá el score a la respuesta (campo extra o metadata).
- Mostrá el badge de confianza en el frontend; con confianza baja, marcá la respuesta o sugerí
  escalar.

**Verificar:** una pregunta sin respuesta en los docs → el sistema abstiene (no inventa). Una
respuesta clara tiene confidence alto; una respuesta sobre algo dudoso/parcial, más bajo. El umbral
de abstención está justificado con números del golden set en `DECISIONS.md`.

## Paso 4 — ⊕ Multi-tenant isolation (el corazón del checkpoint)
**Hacer:**
- **Schema:** agregá `tenant_id text NOT NULL` a la tabla `chunks` (y a `documents` si la tenés).
  Indexá `tenant_id`.
- **Auth → tenant_id:** una dependency de FastAPI que verifica la **firma** del JWT (`pyjwt`, con el
  secret del server), extrae el claim `tenant_id`, y lo inyecta en el endpoint. Si la firma no
  valida → 401. El `tenant_id` **nunca** se lee de un header o body que el cliente controle.
- **Ingesta hard-scoped:** `/ingest` escribe cada chunk con el `tenant_id` de la dependency.
- **Retrieval hard-scoped:** TODA query de similaridad lleva `WHERE tenant_id = $tenant` en el SQL,
  con el `tenant_id` que vino del JWT verificado (lección §6). Revisá que NINGUNA query de chunks
  quede sin ese filtro.
- **(Opcional, defensa en profundidad):** activá Postgres RLS en `chunks` con una policy
  `USING (tenant_id = current_setting('app.current_tenant'))` y seteá la variable por request tras
  verificar el JWT con **`SET LOCAL app.current_tenant = ...`** (nunca `SET` a secas — con
  connection pooling en producción, `SET` sin `LOCAL` deja el valor pegado a la conexión y puede
  filtrarse al siguiente tenant que la reuse). Loguealo como ADR.

**Verificar:** escribí el **test de aislamiento cross-tenant** (`pruebas.md`, capa 1, EL test):
ingestás un doc para `acme` y otro para `globex`, hacés una query desde `acme` que semánticamente
matchearía el doc de `globex`, y asertás que el resultado contiene lo de `acme` y **NUNCA** lo de
`globex`. Tiene que correr en CI y ponerse rojo si alguien saca el filtro.

## Paso 5 — Deploy público con TLS
**Hacer:**
- Deployá `services/api` (Railway o Fly) y `apps/web` (Vercel), conectando las URLs. Configurá las
  env vars: OpenAI key, el secret del JWT, la connection string de Postgres+pgvector. Ojo con el
  presupuesto: **Fly.io** cobra desde el primer dólar tras su trial (pay-as-you-go, sin plan
  gratis de respaldo); **Railway** cae a un Free plan de ~$1/mes de crédito tras el trial (existe,
  pero no alcanza para 24/7) antes de necesitar Hobby ~$5/mes. El **TLS** sí es gratis en los dos,
  el hosting real no.
- Confirmá **TLS**: la URL pública es `https://` con candado válido (Railway/Fly lo dan automático
  vía Let's Encrypt en su dominio).
- Smoke del flujo completo en la URL pública: con un JWT válido de `acme`, subir → preguntar →
  respuesta con cita verificada + badge de confianza; preguntar algo no cubierto → "no sé".

**Verificar:** un tercero, desde otra máquina, con un JWT de prueba, completa el flujo end-to-end
sobre `https://`. El smoke test del deploy responde 200.

## Paso 6 — ⊕ DECISIONS.md + diagrama + README con métricas (la capa que vuelve resume-able)
**Hacer:**
- **`DECISIONS.md`** — agregá los ADRs de M4 (taggeados `Module: M4`):
  - structured outputs: **Instructor vs API nativa de OpenAI** (portabilidad + reintentos
    validados vs constrained decoding estricto). Por qué Instructor.
  - umbral de abstención: el número, calibrado contra el golden set de M2.
  - aislamiento: filtro en código + (opcional) RLS; por qué NO el system prompt (OWASP LLM01).
  - **sección "qué lo hace distinto de My AskAI / Ragie":** evals con error-analysis (M2), hybrid
    retrieval medido (M3), multi-tenancy determinístico verificado (M4), y que cada decisión es
    defendible con un número.
- **Diagrama de arquitectura** (Mermaid o Excalidraw): ingesta (parse→chunk→embed→pgvector con
  `tenant_id`) y query (JWT→auth→retrieve hard-scoped→rerank→LLM con structured output+citations→
  confidence). Que se lea en 30 segundos. Embebido en el README.
- **README con métricas:** `recall@5` hybrid+rerank vs baseline (de M3), **aislamiento cross-tenant
  verificado** (link al test), stack, cómo correrlo, link al deploy y al eval dashboard (M2).
  Números, no adjetivos. Si te alcanza el tiempo, corré un bootstrap pareado sobre el golden set
  para saber si la mejora de recall@5 es significativa y no ruido (lección §7).
- **Demo (Loom 2-3 min):** subir → preguntar (cita verificada + badge) → preguntar algo no cubierto
  (→ "no sé") → mostrar el test de aislamiento en verde.
- Escribí tus respuestas a los **defense drills** y hacé el **mock defense** (`pruebas.md` capa 2 +
  `criterios-defensa.md`).
- Actualizá `course.json` (status `shipped`, tests, links al deploy/demo/README) → el hub lo refleja.

**Verificar:** un extraño entiende qué es Grounded, qué lo diferencia, y lo evalúa en **5 minutos**
con el README + diagrama + demo. Vos respondés el mock defense sin mirar las notas.

---

## Definición de "hecho" (M4) = CHECKPOINT resume-able
✅ Structured output validado (Instructor+Pydantic) con reintentos · ✅ Citations verificadas al
pasaje (grounding check) · ✅ "No sé" calibrado contra el golden set + confidence vía logprobs ·
✅ Aislamiento multi-tenant determinístico (JWT→tenant_id→`WHERE`) **con test cross-tenant verde en
CI** · ✅ Deploy público con TLS funcionando end-to-end · ✅ `DECISIONS.md` (ADRs + diferenciación) +
diagrama + README con métricas + demo Loom · ✅ defense drills respondidos + **mock defense pasado** ·
✅ `course.json` publicado.

**Estado alcanzado: resume-able, defendible en entrevista, evaluable en 5 min.** Marcás el gate del
checkpoint en el panel del módulo. (En paralelo, ya arrancó el stream de prep DSA — tracking aparte,
no es gate.)
