---
module: SQ-C
---

# Criterios de defensa — SQ-C (classic ML)

Al terminar la side-quest tenés que poder, en el nivel honesto indicado:

- **(can-explain)** La diferencia entre precision y recall, con un caso real donde priorizarías
  una sobre la otra.
- **(can-explain)** Qué es el F1 y por qué reportarlo en vez de (o además de) accuracy; por qué
  accuracy engaña con clases desbalanceadas.
- **(can-explain)** Qué es overfitting y cómo lo detectás (brecha train vs test).
- **(can-build)** Entrenar un clasificador de intents sobre Banking77 y evaluarlo con
  `classification_report` + matriz de confusión, desde cero.
- **(can-defend)** Leer tu matriz de confusión: qué intents se confunden, por qué, y qué harías
  al respecto.
- **(can-defend)** Cómo usarías este clasificador como **router barato antes del LLM** en M9: con
  qué umbral confiás en él, cuándo caés al LLM, y cómo lo mediste para decidirlo.
