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

2. **Zendesk Developer — "Creating and monitoring webhooks"**
   `developer.zendesk.com/documentation/webhooks/creating-and-monitoring-webhooks/`
   El flujo trigger → webhook que vas a usar en sandbox. Buscá: cómo conectar un webhook a un
   **trigger** ("ticket created") para que dispare la acción de **notificar un webhook** — la doc
   aclara que conectar el webhook a un trigger/automation y suscribirlo directo a un evento nativo
   de Zendesk son caminos **mutuamente excluyentes** (elegís uno) — y cómo se arma el **JSON body
   con placeholders** (`{{ticket.id}}`, `{{ticket.description}}`, etc.). Esto es *cómo te enterás de
   un ticket nuevo*. ~30 min. (Si en algún momento te preguntan por mandar eventos a un bus tipo AWS
   EventBridge en vez de un webhook HTTP directo, el producto se llama **Zendesk Events Connector**
   — no es lo que usás en esta práctica, pero es el nombre correcto si sale el tema.)

3. **Zendesk Developer — "Ticketing API: Tickets" (comments / update)**
   `developer.zendesk.com/api-reference/ticketing/tickets/tickets/`
   Cómo **escribís de vuelta** al ticket: agregar un comentario **público** (responder al cliente)
   vs un comentario **privado/interno** (el borrador para el agente), y cambiar el `status` a
   `solved`. Buscá el campo `comment.public` (true/false) — es la diferencia entre los modos
   autonomous y co-pilot. ~30 min. **Importante:** la autenticación para llamar este endpoint está en
   transición — leé el bullet "Zendesk API — Authentication" en Referencia antes de escribir el
   cliente HTTP.
   *(Intercom: `developers.intercom.com/docs/references/rest-api/api.intercom.io` — "Reply to a
   conversation" y "Assign a conversation". La URL sin ese path final (`.../rest-api` a secas) da
   404 — asegurate de usar la completa. La API de Intercom **no sigue semver**: pin la versión
   estable actual (2.14) en el header `Intercom-Version` en vez de asumir "latest", porque 2.15
   —hoy en preview— ya renombra valores del enum `resolution_state` del AI Agent.)*

4. **Hamel Husain y Eugene Yan — evals en producción (la referencia directa a la sección 6)**
   `hamel.dev/blog/posts/evals/` ("Your AI Product Needs Evals") ·
   `hamel.dev/blog/posts/evals-faq/` ("LLM Evals: Everything You Need to Know") ·
   `eugeneyan.com/writing/evals/` ("Task-Specific LLM Evals that Do & Don't Work") ·
   `eugeneyan.com/writing/eval-process/` ("An LLM-as-Judge Won't Save The Product — Fixing Your
   Process Will")
   No hay un post canónico de "ticket deflection" en ninguno de los dos blogs, así que la referencia
   concreta son estos cuatro: por qué necesitás evals antes de confiar en una métrica de negocio,
   qué tipo de eval sirve para *tu* tarea puntual (no un benchmark genérico), y por qué el proceso de
   iterar sobre los evals importa más que quién hace de juez. Conecta directo con la sección 6 de la
   lección y con tu harness de M2. (Yan y Husain dan además un curso pago de evals si querés ir más
   profundo, pero para el módulo estos cuatro posts alcanzan.) ~40 min.

## Referencia (tené a mano mientras construís)

- **Zendesk — "Sandbox / trial account"** — `developer.zendesk.com` / `support.zendesk.com` —
  cómo conseguir una cuenta de prueba gratuita para tu **data sandbox** (tickets sintéticos, sin
  clientes reales). Es tu entorno de M8.
- **Zendesk API — Authentication** — `developer.zendesk.com/api-reference/introduction/security-and-auth/`
  — **⚠ cambio importante (anunciado 2026):** Zendesk está eliminando los **API tokens** como
  método de autenticación, en tres fases:
  [tokens sin uso 30+ días se desactivan automáticamente **desde el 28-jul-2026**](https://support.zendesk.com/hc/en-us/articles/10840968198042-Announcing-the-removal-of-API-tokens-as-an-authentication-method-for-API-requests),
  no se pueden crear tokens nuevos **desde el 27-oct-2026**, y todos dejan de funcionar
  **el 30-abr-2027**. Para este módulo eso significa: si tu cuenta ya soporta API tokens, andá
  generando uno y **usalo dentro de esos 30 días** para que no se desactive solo; si podés, preferí
  directamente **OAuth** (client credentials grant vía Admin Center → Apps and integrations → APIs
  → OAuth Clients) — no es solo para la app pública del marketplace, es el método que Zendesk
  sostiene a largo plazo, y `practica.md` te da los dos caminos. **Ojo con el path de UI:** no hay
  ningún menú llamado "Zendesk API" — es Admin Center → Apps and integrations → APIs, y de ahí las
  pestañas "API configuration" / "API tokens" / "OAuth Clients".
- **FastAPI (≥ 0.100) — Request body / raw body** — `fastapi.tiangolo.com` — cómo leer
  `await request.body()` (bytes crudos) *antes* de parsear el JSON, necesario para verificar la
  firma HMAC. El patrón es estable en toda la serie actual de FastAPI.
- **ngrok / cloudflared** — para exponer tu endpoint local a internet y que Zendesk pueda alcanzarlo
  durante el desarrollo (tu webhook tiene que ser una URL pública). **Ojo con ngrok:** desde
  feb-2026 el free tier es bastante más chico — sesiones de **2 horas máximo**, URL aleatoria (no
  fija), ~1GB/mes de banda, 20k requests/mes, un solo endpoint concurrente, y una **página de
  warning interstitial** antes de dejar pasar tráfico HTML (`ngrok.com/docs`). Para el webhook eso no
  te bloquea si mandás el header `ngrok-skip-browser-warning: true` en las requests de Zendesk — sin
  ese header, Zendesk va a recibir el HTML de warning en vez de tu JSON de respuesta. Si tu sesión de
  práctica dura más de dos horas o el túnel se cae solo, usá
  **`cloudflared tunnel --url http://localhost:PORT`** (versión 2026.7.1+) — gratis, sin login, sin
  límite de tiempo (sí tiene un tope de 200 requests en vuelo, pero de sobra para un solo webhook).
- **Python `hmac` / `hashlib`** — `docs.python.org/3/library/hmac.html` — buscá `compare_digest`
  (comparación en tiempo constante).

## Deep dive (opcional, para defender mejor en system design)

- **Intercom / Fin — "Fin" (páginas de producto + métricas de resolution)**
  `intercom.com` — cómo **el líder del mercado** presenta y mide deflection/resolution. Dos cosas a
  saber antes de leer esto en 2026: **(1)** "Resolution Bot" ya no existe como producto separado —
  se fusionó dentro de **Fin**, así que hablá de "Fin (antes Resolution Bot)" y no de dos productos
  distintos. **(2)** la compañía Intercom se renombró a **Fin** el 12-may-2026 (el helpdesk sigue
  vendiéndose como "Intercom", pero la entidad y el developer hub ahora se presentan como
  "Intercom and Fin Developer Platform"), y el 15-jun-2026 Salesforce firmó un acuerdo definitivo
  para adquirirla por ~US$3.6B (cierre esperado a fin de año). No cambia el patrón técnico que
  estudiás acá, pero es un buen data point de mercado para el "can-defend": estás integrando contra
  un ecosistema en consolidación, no contra un vendor estático. No copiés features — el objetivo es
  el **vocabulario del comprador** (resolution rate, deflection, "% resolved") para tu propia
  propuesta. Munición para la sección 6.
- **"Designing Data-Intensive Applications" — Martin Kleppmann, cap. sobre idempotencia y
  exactly-once** — la teoría detrás de por qué los webhooks pueden llegar dos veces y cómo te
  defendés (idempotency key). Opcional, pero es la respuesta profunda a "¿qué pasa si el webhook
  llega duplicado?".
- **OWASP — SSRF Prevention Cheat Sheet y REST Security Cheat Sheet** —
  `cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html` y
  `cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html` — **no** busques un
  "Webhook Security Cheat Sheet" oficial: no existe (solo hay un borrador sin publicar en el repo de
  GitHub de OWASP, `cheatsheets_draft/`, que no deberías citar como fuente oficial). Lo que sí cubre
  la superficie de ataque de un webhook está repartido en estos dos: SSRF (si tu bot alguna vez sigue
  URLs que vienen en el payload del webhook) y REST Security (firma, replay protection con ventana de
  timestamp, allow-listing de IPs de origen). Para defender la sección 3 a nivel "can-defend".

## Cómo usar este material

Leé los ★ Core 1-3 (Zendesk webhooks + triggers + tickets API) → entendé el flujo
*trigger → webhook firmado → bot → comentario de vuelta* → leé el Core 4 (Yan/Husain) para tener
clara la diferencia entre deflection y deflection-a-calidad-fija. Si podés explicar, sin mirar,
**(a)** cómo verificás que un webhook vino de Zendesk y **(b)** por qué deflection sin una métrica
de calidad al lado es una vanity metric, estás listo para `practica.md`.
