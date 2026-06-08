---
module: M0
gate: pending
---

# Pruebas — M0

## Capa 1 — tests automatizados (prueban que *funciona*)

- [ ] `pytest`: el pipeline `upload → chunk → embed → retrieve` devuelve ≥1 chunk relevante
      para una query conocida sobre el doc de prueba.
- [ ] El endpoint de chat hace stream de tokens (no espera la respuesta completa).
- [ ] Smoke test del deploy: la URL pública responde 200 y sirve la UI.

## Capa 2 — defense drills (el HARD GATE)

> No se avanza a M1 hasta responder esto **por escrito, con tus propios números/decisiones**.
> Claude puede hacer de interviewer (F3).

1. **"¿Por qué pgvector y no Pinecone/Qdrant desde el día 1?"** — Defendé el trade-off
   (operacional, costo, escala que realmente vas a tener). ¿Cuándo cambiarías?
2. **"Mostrame tu chunking. ¿Qué problemas tiene?"** — Tenés que anticipar los failure modes
   (corta tablas, parte oraciones, pierde contexto) *antes* de que te los señalen.
3. **"¿Cómo sabés que el retrieval trae lo correcto?"** — En M0 la respuesta honesta es
   "todavía no lo mido sistemáticamente — eso es M2". Saber que es un gap **es** la respuesta madura.
4. **"¿Qué fue lo más difícil del setup y cómo lo resolviste?"** — Un número o un commit concreto.

**Gate:** marcalo como pasado en el panel del módulo cuando (a) la capa 1 está verde en
Grounded y (b) escribiste tus respuestas a la capa 2.
