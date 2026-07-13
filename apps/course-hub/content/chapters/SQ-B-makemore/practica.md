---
module: SQ-B
feature: seguir el MLP de makemore + instrumentar logprobs en Grounded
repo: scratch (el MLP) + grounded (los logprobs)
---

# Práctica — makemore MLP + logprobs en el producto

Dos partes: (1) seguís el build del MLP de Karpathy en un sandbox para *sentir* la math, y (2)
instrumentás **logprobs** en Grounded, conectando con la confidence de M4. La primera te da la
intuición; la segunda la baja a tu producto real.

## Pre-requisitos
- Python con `torch` (CPU alcanza; `torch>=2.10,<2.14` o lo que traiga tu Colab — no importa cuál
  exacto, pero corré `import torch; print(torch.__version__)` antes de empezar y no asumas que
  local y Colab coinciden). Notebook o Colab.
- Una API key de OpenAI (para la parte de logprobs).
- Confirmá qué modelo **y qué API** (Chat Completions o Responses) llama el endpoint `/chat` de
  Grounded (ver Paso 2.0) — de eso depende si logprobs y temperature funcionan tal como se
  describen abajo.
- Miraste la lecture **MLP de makemore** de `material-apoyo.md`.

---

## Parte 1 — El MLP (sandbox, ~3-4h)

### Paso 1.1 — Seguí el build
**Hacer:** tipeá el MLP de la lecture: embeddings de chars → capa oculta → logits → **softmax**
→ **cross-entropy** → backward → **gradient descent** en loop. Generá nombres al final.

**Verificar:** la loss baja y los nombres generados se vuelven más "pronunciables". Podés señalar
en tu código la línea del softmax, la de la cross-entropy y la del paso de gradient descent.

### Paso 1.2 — Jugá con la temperature
**Hacer:** al samplear, dividí los logits por una `temperature` antes del softmax. Probá 0.5, 1.0
y 2.0.

**Verificar:** observás (y podés explicar) cómo baja temperature = nombres más "seguros" y
repetitivos, alta temperature = más raros/creativos. Conectalo con la perilla del LLM — con un
caveat: en modelos de razonamiento de OpenAI (`o1`/`o3`, `gpt-5`/`gpt-5.1`/`gpt-5.2`/`gpt-5.6`) la
API **no acepta** `temperature` (queda fija en 1 salvo que uses `gpt-5.1`+ con
`reasoning_effort="none"`). Si Grounded llama uno de esos modelos, esta perilla no aplica igual
en producción — igual sirve para entender el concepto en el sandbox.

---

## Parte 2 — Logprobs en Grounded (~1 día)

### Paso 2.0 — Confirmá qué modelo y qué API llama Grounded
**Hacer:** antes de tocar código, revisá qué modelo de OpenAI usa el endpoint `/chat` de Grounded
(config, env var, o el código de la llamada al LLM) — y también qué API llama: **Chat
Completions** (`chat.completions.create` en el SDK) o **Responses** (`responses.create`).

**Verificar:** sabés si es un modelo de razonamiento (`o1`, `o3`, cualquier `gpt-5*`/`gpt-5.6*`
sin `reasoning_effort="none"`) o no (`gpt-4o`, `gpt-4.1`, `gpt-4o-mini`, `gpt-5-chat-latest`, o
`gpt-5.1`+ con `reasoning_effort="none"`), y sabés si la llamada usa Chat Completions o Responses.
Esto determina si el Paso 2.1 funciona tal cual: **si es Responses API, logprobs no está
disponible sin importar el modelo** — no hay caveat que lo arregle, hay que migrar esa llamada a
Chat Completions para instrumentarlo.

### Paso 2.1 — Pedir logprobs en la generación
**Hacer:** en el endpoint de `/chat` de Grounded, activá `logprobs: true` (y opcionalmente
`top_logprobs`, un entero 0-5) en la llamada al LLM. Capturá los logprobs de los tokens generados
junto con la respuesta.

**Verificar:** una respuesta de Grounded trae sus logprobs. Imprimís/logueás el logprob promedio
de la respuesta.

> **Si el modelo es de razonamiento, este paso va a fallar** con un error tipo "you are not
> allowed to request logprobs from this model". No es un bug tuyo: los modelos de razonamiento de
> OpenAI (`o1`/`o3`, línea `gpt-5`/`gpt-5.6`) no soportan `logprobs` salvo, en `gpt-5.1`+, con
> `reasoning_effort="none"`. Si te topás con esto, para los fines de esta práctica cambiá
> temporalmente a un modelo no-razonador (`gpt-4o`, `gpt-4.1` o `gpt-4o-mini`) para instrumentar
> y probar el hook — después decidís si eso aplica en producción o si Grounded necesita
> `reasoning_effort="none"`.
>
> **Si la llamada usa la Responses API, este paso va a fallar sin importar el modelo** — la
> Responses API no soporta `logprobs` en absoluto. En ese caso no hay workaround de parámetros:
> para instrumentar logprobs necesitás una llamada equivalente por Chat Completions (aunque sea
> temporal, solo para esta práctica).

### Paso 2.2 — Una señal de confianza
**Hacer:** calculá una métrica simple de confianza a partir de los logprobs (ej. logprob promedio
o mínimo de la respuesta). Mostrala o logueala. **No** hace falta el sistema de abstención
completo todavía — eso es M4; acá dejás el *hook* instrumentado.

**Verificar:** preguntás algo bien cubierto por el doc → confianza alta (logprobs cerca de 0).
Preguntás algo dudoso/no cubierto → confianza más baja. La señal se mueve en la dirección
esperada.

### Paso 2.3 — Doc de conexión con M4
**Hacer:** anotá en tus notas (o en `DECISIONS.md` con tag `Module: M4` / `SideQuest: SQ-B`) qué
viste: ¿los logprobs distinguen respuestas confiables de dudosas en tu caso? ¿Servirían como
trigger de abstención? Esto alimenta directamente la confidence de M4.

**Verificar:** podés explicar qué es un logprob y cómo lo usarías para decidir abstención, con un
ejemplo de tu propio producto.

---

## Definición de "hecho" (SQ-B)
✅ Tipeaste el MLP, la loss baja, generás nombres · ✅ Podés señalar softmax/cross-entropy/gradient
descent en tu código · ✅ Jugaste con temperature y lo explicás · ✅ Grounded captura logprobs y
una señal de confianza que se mueve bien · ✅ Anotaste la conexión con la abstención de M4. →
marcás el gate de la side-quest.
