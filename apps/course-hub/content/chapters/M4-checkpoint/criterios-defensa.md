---
module: M4
---

# Criterios de defensa — M4 (HIREABLE CHECKPOINT)

Al terminar M4 tenés que poder, en el nivel honesto indicado. M4 es el checkpoint: el listón es
*can-defend-in-system-design* en los temas core (aislamiento, structured outputs, trust), no solo
*can-explain*.

## Structured outputs

- **(can-explain)** La diferencia entre `json.loads` sobre texto, JSON mode, y Structured Outputs
  con `strict:true` (constrained decoding) — qué garantiza cada uno y por qué la tercera es la
  única que garantiza *tu* schema.
- **(can-build)** Devolver una instancia Pydantic validada desde el LLM con Instructor, con
  reintentos que re-preguntan usando el error de validación como feedback.
- **(can-defend-in-system-design)** Por qué structured outputs > parsear texto con regex (robustez
  ante cambios de modelo, tipado, validación), y Instructor vs API nativa de OpenAI (ADR).

## Trust: citations, abstención, confidence

- **(can-build)** Citas al **pasaje exacto** (quote + chunk_id en el schema) con **verificación por
  substring/fuzzy** en código — anti-alucinación estructural.
- **(can-defend)** Por qué se verifica la cita en código y no se confía en que el modelo cita bien
  (grounding hallucination).
- **(can-build)** "No sé" **calibrado**: umbral de retrieval + flag `answered` + logprobs, con el
  umbral elegido *midiendo contra el golden dataset de M2* (no inventado).
- **(can-explain)** Qué es un logprob (`log(prob)` del token elegido), cómo se lee
  (`prob = exp(logprob)`), y — crítico — **qué NO mide**: confianza del modelo en su sampling, no
  corrección factual. Una señal entre varias.

## ⊕ Multi-tenant isolation (el ítem que define el checkpoint)

- **(can-defend-in-system-design)** **Diseñar un chatbot multi-tenant con aislamiento de datos**
  de punta a punta: JWT firmado → extraer `tenant_id` del claim → `WHERE tenant_id = $1`
  hard-scoped en cada query → RLS como defensa en profundidad → test que prueba que A no recupera
  docs de B. Es LA pregunta #1 de system design para un RAG B2B.
- **(can-defend-in-system-design)** Por qué el **system prompt NO aísla tenants**: (a) el retrieval
  ya trajo los chunks antes de que el prompt actúe, (b) el prompt se rompe con prompt injection
  (OWASP LLM01). El aislamiento es determinístico en datos, no probabilístico en el modelo.
- **(can-build)** Escribir el **test de aislamiento cross-tenant** y tenerlo verde en CI.
- **(can-explain)** El alcance M4 (namespace determinístico por tenant) vs M5 (ACL-aware retrieval,
  PII redaction, red-team con garak) — saber dónde termina lo que construiste.

## ⊕ Checkpoint (shipping + defensibilidad)

- **(can-build)** Deploy público con **TLS**, end-to-end, evaluable por un tercero.
- **(can-defend)** La **diferenciación vs My AskAI / Ragie**: evals con error-analysis (M2), hybrid
  retrieval medido (M3), multi-tenancy determinístico verificado (M4), y que cada decisión es
  defendible con un número — no una caja cerrada.
- **(can-defend)** Recitar las **métricas** del README sin mirar: `recall@5` hybrid+rerank vs
  baseline, aislamiento verificado.

---

## Mock defense del checkpoint (entrevista simulada — el HARD GATE de M4)

> No se cierra el checkpoint (ni se avanza a M5) sin **pasar el mock defense completo**. Claude (o
> un humano) hace de interviewer. Simula el bloque de **system design** de un loop de AI Engineer.
> Hacelo con cámara/voz si podés — es el ensayo real.

**Setup (5 min).** Presentás Grounded en 90 segundos con el diagrama: qué es, las tres capas, el
diferenciador. El interviewer abre el README y el repo en frío.

**Bloque de system design (15-20 min).** El interviewer dispara, sin orden fijo:
1. *"Diseñá un chatbot de soporte multi-tenant con aislamiento de datos. Empezá por el aislamiento."*
   — Esperan: JWT→tenant_id→`WHERE` hard-scoped→RLS→test. Que dibujes el flujo de datos.
2. *"Le pongo en el system prompt que solo use los docs del cliente. ¿No alcanza?"* — Esperan: no, y
   por qué (retrieval antes del prompt + prompt injection / OWASP LLM01).
3. *"Mostrame que tu aislamiento funciona, no me lo cuentes."* — Esperan: el test cross-tenant, en
   verde, en CI. Correlo en vivo si podés.
4. *"¿Cómo garantizás que la salida sea parseable por tu frontend?"* — structured outputs / Instructor.
5. *"¿Cómo calibraste el 'no sé'? Dame el número y de dónde salió."* — umbral del golden set (M2).
6. *"¿Qué son logprobs y qué NO te dicen?"* — confianza del sampling, no factualidad.
7. *"¿Qué te diferencia de My AskAI?"* — la sección de diferenciación del `DECISIONS.md`, con números.

**Criterio de aprobado:** respondés las 7 sin mirar notas, con **tus** números y **tus** decisiones,
y sin caer en la trampa del system prompt en la #2. Un titubeo en la #1 o la #2 = el checkpoint no
está cerrado; volvé a la lección §6 y repetí.
