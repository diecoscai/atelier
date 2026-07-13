---
module: M8
title: Integración vertical — el bot vive en el inbox
concept: Webhook receiver, first-response bot, escalation calibrada y deflection como métrica de negocio
duration: ~6-8h lectura + 1 finde de práctica
---

# M8 — Meter el RAG donde el cliente ya trabaja

> **Qué vas a saber al terminar esta lección:** por qué el valor de un RAG de soporte no está en
> tu chat sino en el inbox del cliente; cómo recibir eventos de una plataforma de soporte
> (Zendesk) vía webhook de forma segura; cuándo el bot responde solo y cuándo escala a un humano;
> y cómo medir **deflection** — la métrica que le vendés al comprador. La práctica (ver
> `practica.md`) es construir el webhook + el first-response bot para **una** plataforma, contra
> data sandbox.

---

## 1. El problema: tu chat lindo no es donde está el dinero

Hasta M7 construiste un RAG completo: ingesta de docs reales (M1), evals con golden dataset (M2),
hybrid retrieval (M3), citations + "no sé" calibrado + multi-tenancy (M4), agentes (M6),
LLMOps (M7). Todo eso vive en **tu** producto: tu UI de chat, tu dashboard.

El problema de negocio es que **ningún equipo de soporte va a abandonar su inbox para entrar al
tuyo.** El soporte B2B ya corre sobre Zendesk o Intercom. Ahí están sus tickets, sus macros, sus
SLAs, su routing, sus agentes. Un producto que les pide "vení a chatear a mi app" agrega un
segundo lugar donde mirar — fricción pura, cero adopción.

El valor real aparece cuando tu RAG se mete **dentro** de la herramienta que ya usan:

- Entra un ticket nuevo → tu bot lo lee → genera una respuesta (o un borrador) **dentro de
  Zendesk**, antes de que un humano lo toque.
- Si tu bot resuelve el ticket, el humano nunca lo ve. Eso es **deflection** — y es,
  literalmente, lo que estás vendiendo.

> **El cambio mental de M8:** dejás de pensar "tengo un buen RAG" y empezás a pensar "tengo un
> agente que se inserta en un workflow existente y le saca trabajo de encima a un equipo
> humano". El primero es una demo. El segundo es un producto con un número de ROI.

### Una sola plataforma, a propósito

Vas a integrar con **una** plataforma: Zendesk **O** Intercom, no las dos. Esta lección usa
**Zendesk** como ejemplo concreto (su modelo de eventos y webhooks está bien documentado en
`developer.zendesk.com`), pero el patrón es idéntico para Intercom.

¿Por qué una sola? Porque cada integración es un contrato de eventos distinto, una autenticación
distinta y un modelo de datos distinto. Hacer las dos al mismo tiempo duplica la superficie de
bugs sin enseñarte nada nuevo. **Elegís una, la hacés bien, y la segunda es copy-paste del patrón
cuando un cliente lo pida.** (ADR-008 — ver `practica.md`.)

> **Nota de mercado (2026):** Intercom, la alternativa canónica que mencionamos arriba, está en
> medio de una consolidación — la compañía se renombró a **Fin** en mayo de 2026 y Salesforce
> anunció en junio la adquisición del negocio por ~US$3.6B (cierre esperado a fin de año). El
> helpdesk sigue vendiéndose como "Intercom"; "Fin" es a la vez el nombre de la empresa y el de su
> agente de IA. No cambia el patrón técnico de este módulo, pero es un buen argumento para el
> "can-defend": estás construyendo *tu propia* capa de integración en vez de apostar todo a la API
> de un solo vendor en transición — si mañana cambian términos o pricing, tu bot y tu escalation
> logic no dependen de su roadmap.

---

## 2. Lo que M8 NO es: el marketplace listing

Esto es lo más importante que tenés que poder defender, porque un entrevistador (o un inversor)
te va a confundir las dos cosas a propósito.

**Listar tu app en el Zendesk Marketplace / Intercom App Store NO es parte de este módulo ni del
curso.** Es un **hito de go-to-market (GTM) post-M11**, no de ingeniería. Requiere:

- **OAuth partner / app pública aprobada** — registrarte como partner, implementar el flujo OAuth
  completo de la plataforma para que *cualquier* cliente instale tu app con un click.
- **Review de semanas** — la plataforma audita tu app (seguridad, UX, scopes de permisos) antes
  de publicarla. Es un proceso humano que tarda.
- **Privacy policy + términos** — al manejar datos de tickets de terceros, necesitás política de
  privacidad, DPA, y a veces certificaciones.
- **Clientes reales** — todo lo anterior solo tiene sentido cuando ya tenés tracción.

Nada de eso te enseña AI engineering. Lo que te enseña AI engineering es **el webhook + el bot +
la escalation + la métrica**, y eso lo construís contra una **data sandbox** (un trial gratis de
Zendesk con tickets sintéticos), sin tocar un cliente real.

> **Checkpoint:** un entrevistador te dice "ah, entonces tenés la app publicada en el Zendesk
> Marketplace". ¿Qué respondés? → "No, y a propósito. El listing es OAuth partner + review de
> semanas + privacy policy + clientes reales: es un hito de GTM, no de ingeniería. Lo que tengo
> construido y testeado es el webhook receiver, el first-response bot con escalation calibrada, y
> la métrica de deflection, todo contra sandbox. Publicar es el último paso, no el primero, y
> sería irresponsable hacerlo antes de tener el bot probado con evals."

Confundir "construí la integración" con "publiqué en el marketplace" es la señal de alguien que
no entiende la diferencia entre ingeniería y distribución. Vos sí.

---

## 3. Webhooks: cómo te enterás de un ticket nuevo

### Por qué un webhook y no polling

Tenés dos formas de saber que entró un ticket nuevo en Zendesk:

| Opción | Qué es | Por qué NO / SÍ |
|---|---|---|
| **Polling** | Cada N segundos preguntás "¿hay tickets nuevos?" vía API | Gastás rate-limit aunque no pase nada, tenés latencia (esperás hasta N segundos), y a escala es ridículo. |
| **Webhook** ✅ | Zendesk te hace un `POST` HTTP a *tu* URL en el momento que pasa el evento | Reactivo (latencia ~instantánea), no gastás rate-limit, y es el patrón estándar de integración event-driven. |

Un **webhook** es simplemente esto: vos exponés un endpoint HTTP público, le decís a Zendesk
"cuando pase X, mandame un POST acá", y Zendesk te empuja el evento. Tu bot reacciona.

### El modelo de eventos de Zendesk

Zendesk tiene dos mecanismos que se combinan, y tenés que entender la diferencia porque es una
pregunta de integración clásica:

1. **Trigger** — una regla de negocio *dentro* de Zendesk: "cuando un ticket **se crea** y su
   canal es email, ejecutá esta acción". El trigger es el *qué dispara*.
2. **Webhook** — el *destino* de la acción del trigger: "hacé un POST con este JSON a esta URL".

Es decir: configurás un **trigger** ("ticket creado") cuya acción es **notificar un webhook** (tu
endpoint). Zendesk arma el payload con un template que vos definís (placeholders como
`{{ticket.id}}`, `{{ticket.description}}`). También existen los **Events API / webhook events**
nativos (`zen:event-type:ticket.created`) para apps OAuth; en sandbox el camino trigger→webhook es
el más directo y el que vas a usar.

> **Por qué importa la distinción:** si en una entrevista te preguntan "¿cómo te integrás con
> Zendesk sin romper su flujo?", la respuesta correcta empieza por acá: *no inyectás código en
> Zendesk ni interceptás nada*. Te suscribís a un evento vía su mecanismo nativo de triggers, y
> reaccionás desde afuera. El flujo de Zendesk sigue siendo el de Zendesk; vos sos un observador
> que opcionalmente escribe de vuelta vía su API REST.

### Seguridad del webhook: por qué NO podés confiar en el POST

Tu endpoint es **público** (Zendesk tiene que poder alcanzarlo). Eso significa que **cualquiera**
en internet puede hacerle un POST falsificando un ticket. Si tu bot procesa cualquier POST que
llega, te pueden inyectar tickets falsos, envenenar tu deflection, o peor.

Zendesk firma cada webhook con **HMAC-SHA256**: incluye un header
(`X-Zendesk-Webhook-Signature`) que es la firma del cuerpo del request usando un *secret* que solo
vos y Zendesk conocen. Vos recalculás la firma sobre el body crudo y comparás. Si no coincide, el
POST no vino de Zendesk → lo rechazás con `401`.

```python
# services/api/integrations/zendesk/security.py
import hmac, hashlib, base64

def verify_signature(body: bytes, timestamp: str, signature: str, secret: str) -> bool:
    """Zendesk firma timestamp + body con HMAC-SHA256 y manda la firma en base64."""
    message = timestamp.encode("utf-8") + body          # orden: timestamp, luego body crudo
    digest = hmac.new(secret.encode("utf-8"), message, hashlib.sha256).digest()
    expected = base64.b64encode(digest).decode("utf-8")
    return hmac.compare_digest(expected, signature)      # compare_digest: constant-time, anti timing-attack
```

Tres detalles que vas a tener que defender:

- **Body crudo, no parseado.** Tenés que firmar los *bytes exactos* que llegaron, antes de que
  cualquier middleware los reparse. Re-serializar el JSON cambia espacios/orden y rompe la firma.
- **`compare_digest`, no `==`.** Comparar strings con `==` filtra información por *timing* (corta
  apenas difiere un byte). `hmac.compare_digest` compara en tiempo constante.
- **Idempotencia.** Los webhooks pueden llegar **dos veces** (la plataforma reintenta si tu
  endpoint tarda o devuelve 5xx). Guardás el `ticket.id` + `event_id` que ya procesaste y si
  vuelve, lo ignorás. Si no, podés responder dos veces el mismo ticket.

> **Checkpoint:** ¿por qué firmás el *body crudo* y no el JSON ya parseado? Porque la firma se
> calcula sobre bytes específicos; parsear y re-serializar cambia los bytes (orden de claves,
> espacios) y la firma deja de coincidir aunque el contenido "sea el mismo". En FastAPI eso
> significa leer `await request.body()` *antes* de tocar `request.json()`.

---

## 4. El first-response bot: responder o borrador

Cuando el webhook valida y el evento es "ticket creado", arranca el bot. El flujo es tu RAG de
siempre, pero envuelto en lógica de soporte:

```
ticket nuevo (webhook) → extraer pregunta → RAG (retrieve + generate de M3/M4)
   → decisión de escalation (sección 5)
   → [responder solo]  o  [borrador para el agente]  o  [escalar sin respuesta]
```

Dos modos de operación, y la elección es del cliente, no tuya:

- **Autonomous (responde solo):** el bot publica la respuesta como comentario público en el
  ticket y, si resolvió, lo marca como `solved`. Máximo deflection, máximo riesgo.
- **Co-pilot (borrador):** el bot publica un **comentario interno** (no visible al cliente final)
  con la respuesta sugerida + las citations. El agente humano lo revisa, lo edita y lo manda.
  Cero riesgo de responder mal, pero no defleciona (siempre hay un humano).

> **Por qué los dos modos importan para la venta:** un cliente nuevo nunca te va a dejar responder
> solo el día uno — no te conoce. Arrancás en co-pilot (borrador), generás confianza con métricas
> de cuántos borradores el agente aceptó sin editar, y *después* lo subís a autonomous para los
> temas donde el bot es consistentemente bueno. La integración tiene que soportar los dos modos
> desde el diseño. Esto es producto, no solo modelo.

La respuesta del bot **siempre** lleva las citations de M4 (al pasaje exacto del doc). En soporte,
una respuesta sin fuente no es auditable, y el agente humano no puede verificarla rápido.

---

## 5. Escalation logic: cuándo el bot se calla

Esta es la parte donde M8 conecta con todo el curso. **No todo ticket debe ser respondido por el
bot.** La decisión de escalar a un humano se apoya en piezas que ya construiste:

### 5.1 El "no sé" calibrado de M4

En M4 construiste un RAG que, cuando el retrieval no trae contexto suficiente, dice "no encontré
esto en la documentación" en vez de inventar. **Esa señal es tu primer gate de escalation:** si el
bot diría "no sé", no respondés al cliente — **escalás a un humano**. Un "no sé" calibrado no es un
fracaso; es exactamente la señal que evita que tu bot dé una respuesta incorrecta con tono
confiado (el veneno del soporte que vimos en M0).

### 5.2 Confianza baja (de M4: logprobs / citations)

En M4 también instrumentaste confidence vía logprobs y citations. Definís un **umbral**: si la
confianza de la respuesta está por debajo de, digamos, `0.6`, o si no hay ninguna citation que
respalde la respuesta, escalás. No es "el modelo dijo que está seguro" — es un número que medís.

### 5.3 Temas sensibles (reglas duras, no ML)

Algunos temas **nunca** los responde el bot, sin importar la confianza: billing/reembolsos,
cancelaciones, quejas legales, seguridad de la cuenta, lenguaje de cliente enojado. Esto es una
lista de reglas explícitas (keywords, tags del ticket, prioridad). No le pedís al LLM que decida
si un tema es sensible — lo hardcodeás, porque el costo de equivocarte es alto y la regla es
barata.

### La función de decisión

```python
# services/api/integrations/escalation.py
from dataclasses import dataclass

@dataclass
class Decision:
    action: str        # "respond" | "draft" | "escalate"
    reason: str        # para auditar y para tus métricas

SENSITIVE = {"billing", "refund", "cancel", "legal", "gdpr", "account_security"}
CONFIDENCE_FLOOR = 0.6

def decide(answer: str, confidence: float, citations: list, ticket_tags: set,
           mode: str) -> Decision:
    # 1. tema sensible → siempre humano (regla dura, gana sobre todo lo demás)
    if ticket_tags & SENSITIVE:
        return Decision("escalate", "sensitive_topic")
    # 2. el RAG no encontró respuesta (el "no sé" calibrado de M4)
    if answer is None or _is_idk(answer):
        return Decision("escalate", "calibrated_idk")
    # 3. confianza baja o sin fuente que respalde → no autónomo
    if confidence < CONFIDENCE_FLOOR or not citations:
        return Decision("draft", "low_confidence")   # borrador, no escala total: el humano decide
    # 4. confianza alta + hay fuente: depende del modo elegido por el cliente
    return Decision("respond" if mode == "autonomous" else "draft", "high_confidence")
```

Fijate el diseño: **las reglas duras ganan sobre el ML.** Primero chequeás tema sensible (regla),
después el "no sé" (calibración de M4), después confianza (número de M4), y solo al final, si todo
pasó, mirás el modo de operación. El orden importa: un ticket de billing con confianza 0.99 igual
escala, porque la regla dura va primero.

> **Checkpoint:** ¿por qué la decisión de escalation no es solo "confianza < umbral"? Porque
> mezcla tres tipos de señal con distinta naturaleza: una **regla dura** (tema sensible, donde el
> costo de error es alto y no querés que un modelo decida), una **señal de calibración** (el "no
> sé" de M4, que es el modelo admitiendo que no tiene contexto), y un **número continuo**
> (confianza/citations). Cada una tapa un failure mode distinto. Reducir todo a un umbral de
> confianza deja entrar tickets sensibles con respuesta segura-pero-peligrosa.

---

## 6. Deflection: la métrica que vendés

Acá está el cierre. Todo lo anterior existe para mover **un solo número** que el comprador
entiende sin saber qué es un embedding:

> **Deflection rate = tickets resueltos sin que un humano los tocara / total de tickets entrantes.**

Si entran 1000 tickets/mes y tu bot resuelve 300 solo, defleccionaste el 30%. A un costo de ~$X
por ticket atendido por un humano, eso es un ahorro mensual concreto. **Eso** es lo que ponés en la
propuesta comercial, no "recall@5 de 0.85".

### Por qué deflection sin evals es una mentira

Acá conectás con M2. Podés inflar deflection trivialmente: dejá que el bot responda *todo* en modo
autonomous y nunca escale. Deflection = 100%. Y estarías dando respuestas incorrectas a la mitad de
tus clientes.

Por eso **deflection solo tiene sentido junto a la calidad de lo deflectionado.** Las métricas que
reportás van siempre en par:

- **Deflection rate** — % resuelto sin humano (la métrica de negocio).
- **Resolution quality** — de lo que el bot respondió solo, ¿qué % era correcto? Esto lo medís con
  el harness de M2 (LLM-as-judge + golden dataset) y, en producción, con la señal real: ¿el
  cliente **reabrió** el ticket? ¿lo escaló él mismo? ¿quedó satisfecho (CSAT)?
- **Escalation rate + breakdown** — % escalado, y *por qué* (sensible / no-sé / baja confianza).
  Un escalation rate sano es señal de un bot honesto, no de uno malo.

> **El número que defendés no es deflection a secas, es deflection a calidad fija.** "Defleccioné
> 30% manteniendo una accuracy de 95% en lo respondido, medida contra mi golden dataset de M2 y
> validada con tasa de reapertura < 5%." Esa frase es la que separa a alguien que entiende el
> negocio de alguien que reporta una vanity metric.

### El loop completo

```
ticket → bot responde solo (deflection++) → ¿correcto?
   ├── cliente no reabre, CSAT alto  → deflection legítimo, lo contás
   └── cliente reabre / escala       → deflection falso: era un caso que debió escalar
                                        → entra como nuevo ejemplo a la taxonomía de fallas (M2)
                                        → ajustás el umbral de confianza o agregás una regla dura
```

Ese loop — producción alimenta evals, evals ajustan escalation, escalation mejora deflection real —
es el sistema de M8 funcionando como un organismo, no como features sueltas.

---

## 7. Lo que tenés que poder defender (conecta con `criterios-defensa.md`)

Al cerrar M8, un entrevistador o un comprador podría preguntarte cualquiera de estas. Si no las
podés responder con tus palabras, tus números y tus decisiones, el módulo no está cerrado:

- "¿Cómo medís el **valor de negocio** de tu producto?" → deflection rate, *atado a* resolution
  quality (sección 6). Nunca deflection a secas.
- "¿Cuándo el bot responde solo y cuándo escala?" → las tres señales en orden: regla dura
  (sensible) → "no sé" calibrado de M4 → confianza/citations. Modos co-pilot vs autonomous
  (secciones 4-5).
- "¿Cómo te integrás con Zendesk **sin romper su flujo**?" → trigger nativo → webhook, sos un
  observador externo, no inyectás nada; escribís de vuelta vía API REST (sección 3).
- "¿Cómo asegurás que el webhook es legítimo?" → HMAC-SHA256 sobre el body crudo, `compare_digest`
  constant-time, idempotencia por reintentos (sección 3).
- "¿Por qué una sola plataforma y no las dos?" → cada una es un contrato distinto; una bien hecha,
  la segunda es el mismo patrón (ADR-008, sección 1).
- "Entonces ya está en el Zendesk Marketplace, ¿no?" → **No, y a propósito.** El listing es GTM
  post-M11 (OAuth partner + review + privacy policy + clientes reales), no ingeniería (sección 2).

Seguí con `material-apoyo.md` para las fuentes canónicas de Zendesk, y después `practica.md` para
construir el webhook + el bot contra sandbox.
