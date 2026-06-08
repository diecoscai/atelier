---
module: SQ-A
---

# Criterios de defensa — SQ-A (Transformers)

Al terminar la side-quest tenés que poder, en el nivel honesto indicado:

- **(can-explain)** Qué es la self-attention y el rol de Query / Key / Value, con tu propia
  analogía, sin matemática pesada.
- **(can-explain)** Por qué hace falta el positional encoding y qué pasaría sin él.
- **(can-explain)** Por qué multi-head attention en vez de una sola, y qué captura cada cabeza.
- **(can-explain)** Por qué los Transformers reemplazaron a los RNN (paralelización, contexto
  global) — el argumento de "Attention Is All You Need".
- **(can-build)** Señalar en un GPT mínimo (el que tipeaste) dónde está cada pieza: Q/K/V,
  causal masking, softmax, multi-head, bloque apilado.
- **(can-defend)** La conexión con tu producto: por qué la attention es O(n²), por qué eso vuelve
  finito el context window, y por qué eso es exactamente lo que motiva RAG en M0.
