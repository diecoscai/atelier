---
module: M8
feature: webhook receiver + first-response bot + escalation + deflection (una plataforma, sandbox)
repo: grounded
---

# Práctica — integrá el RAG en el inbox (en el repo Grounded)

Objetivo: cuando entra un ticket en **Zendesk sandbox**, tu RAG genera una primera respuesta o un
borrador, escala cuando corresponde, y todo queda medido en un número de **deflection**. Cada paso
tiene **qué hacer** y **cómo verificar**. No avances al siguiente sin que el actual verifique.

> Trabajás en el repo **`grounded`**. La integración vive en `services/api/integrations/zendesk/`.
> Todo contra **data sandbox** (cuenta de prueba + tickets sintéticos) — **cero clientes reales.**

## Pre-requisitos
- M4 cerrado: tenés RAG con citations, "no sé" calibrado y confidence (logprobs). M8 lo *usa*.
- M2 cerrado: tenés el harness de evals + golden dataset. Lo vas a reusar para medir calidad.
- Una cuenta **Zendesk trial** (gratis) o Intercom. Esta guía usa Zendesk.
- `ngrok` (o `cloudflared`) para exponer tu endpoint local.
- Leíste los ★ Core 1-3 de `material-apoyo.md` y entendés trigger → webhook → comentario.

---

## Paso 1 — Sandbox + tickets sintéticos
**Hacer:**
- Creá una cuenta Zendesk trial. Generá un **API token** (Admin → Apps and integrations → APIs →
  Zendesk API → Token access). Guardalo en `.env` como `ZENDESK_API_TOKEN` + `ZENDESK_SUBDOMAIN` +
  `ZENDESK_EMAIL`.
- Cargá **8-12 tickets sintéticos** que cubran los casos que necesitás testear: unos cubiertos por
  tu doc (el bot debería resolver), unos no cubiertos (debería decir "no sé" → escalar), y al menos
  uno sensible (tag `billing` o `refund` → escala por regla dura).

**Verificar:** desde tu API podés listar tickets vía
`GET https://{subdomain}.zendesk.com/api/v2/tickets.json` con el token y ves tus tickets sintéticos.

## Paso 2 — Webhook receiver con verificación de firma
**Hacer:** endpoint `POST /integrations/zendesk/webhook` en FastAPI que:
1. lea el **body crudo** (`await request.body()`) *antes* de parsear JSON.
2. verifique la firma HMAC-SHA256 (`verify_signature` de la lección, sección 3). Si falla → `401`.
3. sea **idempotente**: guardá los `event_id`/`ticket.id` ya procesados (tabla `processed_events`);
   si vuelve, respondé `200` sin re-procesar.
4. responda **rápido** (`200`) y procese el ticket en background (la plataforma reintenta si tardás).

```python
# services/api/integrations/zendesk/router.py
from fastapi import APIRouter, Request, BackgroundTasks, HTTPException
from .security import verify_signature
from .bot import handle_ticket
import os, json

router = APIRouter()

@router.post("/integrations/zendesk/webhook")
async def webhook(request: Request, bg: BackgroundTasks):
    body = await request.body()                                   # crudo, sin parsear
    ts = request.headers.get("X-Zendesk-Webhook-Signature-Timestamp", "")
    sig = request.headers.get("X-Zendesk-Webhook-Signature", "")
    if not verify_signature(body, ts, sig, os.environ["ZENDESK_WEBHOOK_SECRET"]):
        raise HTTPException(status_code=401, detail="bad signature")
    event = json.loads(body)
    bg.add_task(handle_ticket, event)                             # procesar async, responder ya
    return {"ok": True}
```

**Hacer (config en Zendesk):** creá un **webhook** apuntando a tu URL de `ngrok`, con
**signing secret**, y un **trigger** "ticket created" cuya acción sea notificar ese webhook, con un
body template que incluya `{{ticket.id}}`, `{{ticket.description}}`, `{{ticket.tags}}`.

**Verificar:** creás un ticket nuevo en Zendesk → tu endpoint recibe el POST, la firma valida, y
ves el evento loggeado. Un POST con firma inválida (curl a mano) → `401`. (Tests en `pruebas.md`,
capa 1.)

## Paso 3 — First-response bot (responder/borrador)
**Hacer:** `handle_ticket(event)` que:
1. extraiga la pregunta del ticket (`description`).
2. llame a tu RAG de M4: `answer, confidence, citations = rag.answer(question, tenant_id)`.
3. (la decisión de escalation va en el Paso 4 — por ahora asumí "respond").
4. **escriba de vuelta** vía la Tickets API: comentario **público** (`comment.public = true`) si es
   respuesta autónoma, **interno** (`public = false`) si es borrador; y `status = solved` solo si
   respondió y resolvió.

```python
# services/api/integrations/zendesk/client.py
async def post_comment(ticket_id: int, body: str, public: bool, solve: bool):
    payload = {"ticket": {"comment": {"body": body, "public": public}}}
    if solve:
        payload["ticket"]["status"] = "solved"
    # PUT .../api/v2/tickets/{ticket_id}.json con auth {email}/token:{api_token}
    await _put(f"/api/v2/tickets/{ticket_id}.json", payload)
```

**Verificar:** ticket cubierto por tu doc → aparece un comentario del bot **dentro de Zendesk** con
la respuesta + citations. En modo co-pilot, el comentario es interno (el cliente no lo ve).

## Paso 4 — Escalation logic
**Hacer:** implementá `decide(...)` (lección, sección 5) y metelo antes de escribir:
- tema sensible (tag en `SENSITIVE`) → `escalate` (regla dura, gana sobre todo).
- el RAG dijo "no sé" (calibración M4) → `escalate`.
- confianza < `CONFIDENCE_FLOOR` o sin citations → `draft`.
- si todo pasa → `respond` (autonomous) o `draft` (co-pilot) según `mode`.
- en `escalate`: no respondés al cliente; agregás un tag `needs-human` y/o asignás a un grupo humano
  (vía la Tickets API), y registrás el `reason`.

**Verificar:** ticket sensible (tag `billing`) con confianza alta → **escala igual** (no responde).
Ticket no cubierto → el bot dice "no sé" → escala. Ticket cubierto y confiado → responde/borrador.
(Test de `decide` en `pruebas.md`, capa 1.)

## Paso 5 — Métricas de deflection (atadas a calidad)
**Hacer:**
- Logueá cada decisión: `ticket_id, action, reason, confidence, mode, timestamp` en una tabla
  `bot_actions`.
- Calculá **deflection rate** = `respond_count / total_tickets`, **escalation rate** + breakdown por
  `reason`, y dejá el hook para **resolution quality**: marcá si el ticket fue **reabierto** (señal
  de deflection falso).
- Corré las respuestas autónomas del sandbox por tu **harness de M2** (LLM-as-judge + golden
  dataset) para tener un % de accuracy de lo deflectionado.
- Exponé estos números en tu dashboard (el que arrancó en M2): deflection **junto a** accuracy y
  reapertura, nunca solo.

**Verificar:** corrés tus 8-12 tickets sandbox → ves un deflection rate, un escalation breakdown
(cuántos por sensible / no-sé / baja confianza), y un % de accuracy de lo respondido medido contra
tu golden dataset. Podés decir "defleccioné X% manteniendo Y% de accuracy".

## Paso 6 — Capa de defensa (el entregable real)
**Hacer:**
- `DECISIONS.md` con **ADR-008**: "¿Por qué una sola plataforma (Zendesk) y por qué webhook+bot en
  vez de marketplace listing?" — alternativas (Intercom; las dos a la vez), el criterio (una bien
  hecha; marketplace = GTM post-M11), y por qué OAuth-partner/review/privacy/clientes-reales están
  fuera del curriculum. Taggealo `Module: M8`.
- **ADR-009** (opcional pero recomendado): "Umbral de escalation y orden de las señales" — por qué
  regla dura > 'no sé' > confianza, y de dónde sale el `CONFIDENCE_FLOOR` (tu número de M4).
- Escribí tus respuestas a los **defense drills** (`pruebas.md`, capa 2).
- Actualizá `course.json` (status `shipped`, tests, links al deflection dashboard) → el hub de
  Atelier lo refleja.

**Verificar:** podés explicar, sin mirar, **(a)** cómo medís el valor de negocio (deflection a
calidad fija), **(b)** la lógica de escalation completa, y **(c)** por qué el marketplace listing NO
es parte de esto. Recién ahí marcás el gate.

---

## Definición de "hecho" (M8)
✅ Webhook recibe un evento de Zendesk sandbox, valida firma HMAC y es idempotente ·
✅ El bot escribe de vuelta (público o borrador) **dentro de Zendesk** con citations ·
✅ `decide()` escala por tema sensible / "no sé" calibrado / baja confianza, con las reglas duras
primero · ✅ Deflection rate calculado **junto a** accuracy (harness M2) y reapertura ·
✅ `verify_signature` y `decide` testeados · ✅ ADR-008 escrito · ✅ defense drills respondidos ·
✅ `course.json` publicado. → marcás el gate en el panel del módulo.
