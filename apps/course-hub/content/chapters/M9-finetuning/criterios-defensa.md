---
module: M9
---

# Criterios de defensa — M9

Al terminar M9 tenés que poder, en el nivel honesto indicado. M9 es un módulo de **alta señal**:
es donde se distingue al engineer del API caller. El listón en fine-tune vs RAG y en métricas de
clasificación es *can-defend-in-system-design*; en correr un QLoRA es *can-build*.

- **(can-explain)** Qué es LoRA: por qué congela el modelo base y aprende un parche de bajo rango
  (`A`·`B`), y por qué eso entrena <1% de los parámetros.
- **(can-explain)** Qué es QLoRA y por qué 4-bit: NF4 (dtype optimizado para distribuciones
  normales), modelo base congelado en 4-bit + adapters LoRA en bf16 encima, y por qué eso hace que
  un 7B entre en una T4. Saber citar el paper (Dettmers et al., 2023, arXiv 2305.14314).
- **(can-explain)** Por qué NO full fine-tuning: memoria (gradientes + estados del optimizador),
  costo, catastrophic forgetting.
- **(can-build)** Correr un QLoRA end-to-end desde cero: cargar en 4-bit, configurar LoRA con PEFT,
  entrenar con SFTTrainer/TRL, guardar el adapter — sin copiar a ciegas un notebook.
- **(can-build)** Leer una loss curve e identificar convergencia sana vs overfitting vs learning
  rate mal calibrado, y decir qué hiperparámetro tocar en cada caso.
- **(can-defend)** **El decision framework de fine-tuning**: el orden correcto es prompting →
  RAG → fine-tuning; el 80% de los casos se resuelven antes de llegar al fine-tune; la regla de
  oro es poder enunciar la métrica de eval que el prompting no puede mover *antes* de proponer
  fine-tunear. Con un caso concreto donde fine-tunear sería el error (meter hechos que cambian).
- **(can-defend)** **Cuándo fine-tune le gana a RAG**: RAG para conocimiento que cambia, fine-tune
  para comportamiento (formato/estilo/dominio), patrón híbrido 2026 (RAG para hechos + FT para
  estilo). Drill: ¿cuál es la métrica de eval que no se mueve con prompting y justifica el FT?
- **(can-explain)** Los métodos de fine-tuning: SFT (comportamiento/formato), DPO (preferencias),
  RFT (solo reasoning models); que GPT-5.x no es fine-tuneable; nombrar el método y el modelo
  compatible al proponer fine-tuning.
- **(can-explain)** Embedding fine-tuning de dominio: que el *retrieval* también se fine-tunea (con
  pares de tu dominio + contrastive loss) y cuándo es el siguiente paso después del reranking.
- **(can-build)** Entrenar un clasificador de intents (Banking77) con sklearn y reportar
  precision/recall/F1/matriz de confusión correctamente.
- **(can-defend)** Precision vs recall: qué mide cada una, qué es F1, y **cuál priorizar para el
  router de intents** según el costo del falso positivo vs el falso negativo *en Grounded* — no la
  fórmula en abstracto.
- **(can-explain)** Cross-entropy loss y gradient descent a nivel intuición: qué significa que la
  loss baje y por qué el learning rate es el hiperparámetro crítico.
- **(can-defend)** Por qué el routing con un clasificador barato *antes* del LLM es ingeniería de
  sistema real (costo/latencia), no over-engineering — con tu número de % de queries desviadas.
