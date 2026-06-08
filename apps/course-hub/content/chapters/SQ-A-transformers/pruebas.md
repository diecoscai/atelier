---
module: SQ-A
gate: pending
---

# Pruebas — SQ-A (Transformers)

Esta side-quest no tiene tests de CI: el entregable es *literacy*. La prueba real es la capa 2.

## Capa 1 — sanity check (prueba que el build corre)

- [ ] El GPT mínimo entrena: la loss (cross-entropy) baja a lo largo de las iteraciones.
- [ ] Samplea texto que mejora visiblemente del bigram baseline al modelo con bloques.
- [ ] Podés correr el notebook de punta a punta sin errores.

## Capa 2 — defense drills (el HARD GATE)

> No marcás el gate hasta responder esto **en voz alta, sin mirar**. Claude puede hacer de
> interviewer.

1. **"Explicame la attention como si fuera tu compañero de equipo, sin fórmulas."** — Tenés que
   llegar a Q/K/V y a la mezcla ponderada por softmax con tus palabras.
2. **"¿Para qué sirven las tres matrices Q, K, V? ¿No alcanza con una?"** — Defendé por qué los
   tres roles (buscar / ser encontrado / aportar) son distintos.
3. **"¿Por qué un positional encoding? ¿Qué se rompe sin él?"** — "perro muerde hombre" =
   "hombre muerde perro".
4. **"¿Por qué los Transformers escalan y los RNN no?"** — Paralelización; mirar toda la
   secuencia a la vez.
5. **"¿Qué tiene que ver esto con el context window y con que vos uses RAG?"** — O(n²); el
   contexto es finito y caro → recuperás solo lo relevante.

**Gate:** marcalo cuando (a) el notebook corre y samplea, y (b) respondiste la capa 2 sin mirar.
