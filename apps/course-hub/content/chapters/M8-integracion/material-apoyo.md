---
module: M8
---

# Material de apoyo — M8

Curado y ordenado. No leas todo: los **★ Core** son obligatorios antes de la práctica; el resto es
referencia para consultar mientras construís el webhook + el bot, o profundización opcional.

> **Nota de plataforma:** la lección usa **Zendesk** como ejemplo concreto. Si elegís **Intercom**,
> el patrón (webhook firmado → evento → bot → escribir de vuelta) es idéntico; abajo dejo el
> equivalente de Intercom en cada bloque para que puedas hacer el swap.

## ★ Core (leé esto antes de tocar código)

1. **Zendesk Developer — "Webhooks" (introducción + setup)**
   `developer.zendesk.com/documentation/webhooks/`
   La doc oficial del mecanismo de webhooks. Buscá: cómo se crea un webhook, qué es un endpoint, y
   sobre todo la sección de **verificación de firma / signing secret** (HMAC). Es la pieza de
   seguridad que tenés que implementar sí o sí. ~40 min.
   *(Intercom: `developers.intercom.com/docs/webhooks` — buscá "signed notifications" y el header
   `X-Hub-Signature`.)*

2. **Zendesk Developer — "Triggers and webhooks" / "Creating webhooks to interact with third-party systems"**
   `developer.zendesk.com/documentation/event-connectors/webhooks/`
   El flujo trigger → webhook que vas a usar en sandbox. Buscá: cómo un **trigger** ("ticket
   created") dispara la acción de **notificar un webhook**, y cómo se arma el **JSON body con
   placeholders** (`{{ticket.id}}`, `{{ticket.description}}`, etc.). Esto es *cómo te enterás de un
   ticket nuevo*. ~30 min.

3. **Zendesk Developer — "Ticketing API: Tickets" (comments / update)**
   `developer.zendesk.com/api-reference/ticketing/tickets/tickets/`
   Cómo **escribís de vuelta** al ticket: agregar un comentario **público** (responder al cliente)
   vs un comentario **privado/interno** (el borrador para el agente), y cambiar el `status` a
   `solved`. Buscá el campo `comment.public` (true/false) — es la diferencia entre los modos
   autonomous y co-pilot. ~30 min.
   *(Intercom: `developers.intercom.com/docs/references/rest-api` — "Reply to a conversation" y
   "Assign a conversation".)*

4. **Eugene Yan / Hamel Husain (escritos sobre LLM en producción + evals)**
   `eugeneyan.com` · `hamel.dev`
   No hay un único post canónico de "ticket deflection", pero estos dos autores son la referencia de
   *cómo medís un sistema LLM en producción de forma honesta*. Buscá: cómo atar una métrica de
   negocio (deflection) a una métrica de calidad (accuracy / reapertura), y por qué una métrica
   sola miente. Conecta directo con la sección 6 de la lección y con tu harness de M2. ~40 min.

## Referencia (tené a mano mientras construís)

- **Zendesk — "Sandbox / trial account"** — `developer.zendesk.com` / `support.zendesk.com` —
  cómo conseguir una cuenta de prueba gratuita para tu **data sandbox** (tickets sintéticos, sin
  clientes reales). Es tu entorno de M8.
- **Zendesk API — Authentication** — `developer.zendesk.com/api-reference/introduction/security-and-auth/`
  — API tokens vs OAuth. Para sandbox usás **API token** (simple); OAuth es para la app pública del
  marketplace (post-M11, fuera de scope).
- **FastAPI — Request body / raw body** — `fastapi.tiangolo.com` — cómo leer `await request.body()`
  (bytes crudos) *antes* de parsear el JSON, necesario para verificar la firma HMAC.
- **ngrok / cloudflared** — `ngrok.com/docs` — para exponer tu endpoint local a internet y que
  Zendesk pueda alcanzarlo durante el desarrollo (tu webhook tiene que ser una URL pública).
- **Python `hmac` / `hashlib`** — `docs.python.org/3/library/hmac.html` — buscá `compare_digest`
  (comparación en tiempo constante).

## Deep dive (opcional, para defender mejor en system design)

- **Intercom — "Resolution Bot" / "Fin AI Agent" (páginas de producto + métricas)**
  `intercom.com` — cómo **el líder del mercado** presenta y mide deflection/resolution. No para
  copiar features, sino para entender **el vocabulario del comprador** (resolution rate, deflection,
  "% resolved") que vas a usar en tu propia propuesta. Munición para la sección 6.
- **"Designing Data-Intensive Applications" — Martin Kleppmann, cap. sobre idempotencia y
  exactly-once** — la teoría detrás de por qué los webhooks pueden llegar dos veces y cómo te
  defendés (idempotency key). Opcional, pero es la respuesta profunda a "¿qué pasa si el webhook
  llega duplicado?".
- **OWASP — "Webhook security cheat sheet"** (buscá en `owasp.org`) — firma, replay protection
  (timestamp window), allow-listing de IPs. Para defender la sección 3 a nivel "can-defend".

## Cómo usar este material

Leé los ★ Core 1-3 (Zendesk webhooks + triggers + tickets API) → entendé el flujo
*trigger → webhook firmado → bot → comentario de vuelta* → leé el Core 4 (Yan/Husain) para tener
clara la diferencia entre deflection y deflection-a-calidad-fija. Si podés explicar, sin mirar,
**(a)** cómo verificás que un webhook vino de Zendesk y **(b)** por qué deflection sin una métrica
de calidad al lado es una vanity metric, estás listo para `practica.md`.
