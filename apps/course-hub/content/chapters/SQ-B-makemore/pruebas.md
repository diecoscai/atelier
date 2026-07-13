---
module: SQ-B
gate: pending
---

# Pruebas — SQ-B (math intuition + logprobs)

## Capa 1 — sanity check + instrumentación (prueba que funciona)

- [ ] El MLP entrena: la cross-entropy baja y genera nombres más pronunciables que el bigram.
- [ ] Cambiar la temperature al samplear cambia la variedad de las salidas de forma observable.
- [ ] Confirmaste qué modelo llama el endpoint de chat de Grounded, si es de razonamiento
      (`o1`/`o3`/`gpt-5*`/`gpt-5.6*`) o no, y si esa llamada usa Chat Completions o Responses
      API — de eso depende si el siguiente ítem funciona sin cambios.
- [ ] En Grounded, el endpoint de chat captura logprobs de la respuesta generada.
- [ ] La señal de confianza derivada de logprobs se mueve en la dirección esperada (alta para
      respuestas bien cubiertas, baja para dudosas/no cubiertas).

## Capa 2 — defense drills (el HARD GATE)

> No marcás el gate hasta responder esto **por escrito, con tus propios números/ejemplos**.
> Claude puede hacer de interviewer.

1. **"¿Qué es un dot-product y dónde lo usás en tu sistema?"** — Cosine similarity en retrieval;
   Q·K en attention.
2. **"¿Qué hace la temperature? ¿Qué valor ponés en Grounded y por qué?"** — Defendé temperature
   baja para soporte (fidelidad/consistencia sobre creatividad).
3. **"¿Qué loss minimiza un LM? ¿Qué te dice un valor de loss bajo?"** — Cross-entropy; el token
   correcto recibe alta probabilidad.
4. **"¿Qué es un logprob y cómo lo usarías para decidir si el modelo se abstiene?"** — Mostralo
   con un ejemplo real de tu instrumentación; conectalo con M4.

**Gate:** marcalo cuando (a) la capa 1 está verde (MLP corre + logprobs instrumentados en
Grounded) y (b) escribiste las respuestas de la capa 2.
