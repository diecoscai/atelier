---
module: SQ-B
---

# Criterios de defensa — SQ-B (math intuition + eval)

Al terminar la side-quest tenés que poder, en el nivel honesto indicado:

- **(can-explain)** Qué es un dot-product y dónde aparece en tu RAG (cosine similarity, attention).
- **(can-explain)** Qué hace el softmax (scores → distribución de probabilidad) y qué hace la
  temperature, con el valor que usás en soporte y por qué.
- **(can-explain)** Qué loss minimiza un modelo de lenguaje y qué mide la cross-entropy.
- **(can-explain)** Gradient descent en una frase (bajar la loss moviendo pesos en la dirección
  del gradiente, de a pasos chicos).
- **(can-build)** Señalar en el MLP que tipeaste dónde están softmax, cross-entropy y el paso de
  gradient descent.
- **(can-defend)** Qué es un logprob, cómo lo instrumentaste en Grounded, y cómo lo usarías como
  señal de confianza para decidir abstención — conectándolo con M4.
