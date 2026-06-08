---
module: M8
gate: pending
---

# Pruebas — M8

## Capa 1 — tests automatizados (prueban que *funciona*)

- [ ] `pytest`: `verify_signature` acepta un payload firmado con el secret correcto y **rechaza**
      uno con firma inválida o secret distinto (test del HMAC del webhook).
- [ ] `pytest`: el webhook es **idempotente** — el mismo `event_id` enviado dos veces procesa el
      ticket una sola vez (no postea dos comentarios).
- [ ] `pytest`: el webhook **procesa un evento sandbox** end-to-end — recibe un payload de
      "ticket created", valida firma, extrae la pregunta, y llama al bot (mock del RAG).
- [ ] `pytest`: `decide()` **escala cuando la confianza es baja** (`confidence < CONFIDENCE_FLOOR`
      → `draft`) y cuando el RAG dice "no sé" (`calibrated_idk` → `escalate`).
- [ ] `pytest`: `decide()` con un **ticket sensible** (tag `billing`) escala **aunque la confianza
      sea alta** — la regla dura gana sobre el número.
- [ ] `pytest`: el bot postea comentario **público** en modo autonomous y **interno** (`public =
      false`) en modo co-pilot (mock del cliente Zendesk).
- [ ] El cálculo de **deflection rate** sobre los tickets sandbox coincide con
      `respond_count / total` y reporta el breakdown de escalation por `reason`.

## Capa 2 — defense drills (el HARD GATE)

> No se avanza hasta responder esto **por escrito, con tus propios números/decisiones**.
> Claude puede hacer de interviewer (o de comprador escéptico).

1. **"¿Cómo medís el valor de negocio de tu producto?"** — Deflection rate, pero **atado a**
   resolution quality. Explicá por qué deflection a secas es inflable (responder todo en
   autonomous → 100%) y qué métrica de calidad ponés al lado (accuracy del harness de M2 +
   tasa de reapertura). Dá un número de tu sandbox: "defleccioné X% a Y% de accuracy".

2. **"¿Cuándo el bot responde solo y cuándo escala a un humano?"** — Las tres señales **en orden**:
   regla dura (tema sensible) → "no sé" calibrado de M4 → confianza/citations. Explicá por qué
   no es solo "confianza < umbral" y por qué las reglas duras van primero. Mencioná co-pilot vs
   autonomous y por qué un cliente nuevo arranca en co-pilot.

3. **"¿Cómo integrás con Zendesk sin romper su flujo?"** — Trigger nativo → webhook; sos un
   observador externo, no inyectás código ni interceptás nada; escribís de vuelta vía la Tickets
   API (comentario público/interno). El flujo de Zendesk sigue siendo el suyo.

4. **"¿Cómo asegurás que un webhook es legítimo y no un POST falso de internet?"** — HMAC-SHA256
   sobre el **body crudo**, `compare_digest` (constant-time), idempotencia ante reintentos.
   Explicá por qué firmás los bytes crudos y no el JSON re-serializado.

5. **"Entonces ya tenés la app en el Zendesk Marketplace, ¿no?"** — **No, y a propósito.** El
   listing es un hito de **GTM post-M11** (OAuth partner + review de semanas + privacy policy +
   clientes reales), no de ingeniería. Lo construido y testeado es el webhook + bot + escalation +
   deflection contra sandbox. Publicar es el último paso, no el primero.

**Gate:** marcalo como pasado en el panel del módulo cuando (a) la capa 1 está verde en Grounded y
(b) escribiste tus respuestas a la capa 2.
