---
module: SQ-C
---

# Material de apoyo — SQ-C (classic ML / Banking77)

Los **★ Core** son obligatorios antes de la práctica. El resto es referencia mientras construís.

## ★ Core (leé esto antes de tocar código)

1. **Dataset PolyAI/banking77 — Hugging Face**
   `huggingface.co/datasets/PolyAI/banking77`
   El dataset central: 13k+ frases de banca en 77 intents, con split train/test. Mirá la card:
   cómo cargarlo con la librería `datasets`, las etiquetas, y el split. ~20 min.

2. **scikit-learn — "Working With Text Data" (tutorial oficial)**
   `scikit-learn.org/stable/tutorial/text_analytics/working_with_text_data.html`
   El walkthrough canónico: `TfidfVectorizer` → clasificador → `classification_report`. Es
   prácticamente el esqueleto de tu práctica. ~40 min.

3. **scikit-learn — `classification_report` y `confusion_matrix` (docs de metrics)**
   `scikit-learn.org/stable/modules/model_evaluation.html`
   La referencia de precision/recall/F1/support y de la matriz de confusión. Buscá las
   definiciones y el ejemplo de output. ~30 min.

## Referencia (tené a mano)

- **scikit-learn — `LogisticRegression` y `LinearSVC`** (docs de cada estimador). Los dos
  clasificadores que andan muy bien sobre texto vectorizado.
- **Hugging Face — librería `datasets`** (`huggingface.co/docs/datasets`). `load_dataset` y cómo
  iterar/splitear.
- **sentence-transformers** (`sbert.net`) — si querés usar embeddings como features en vez de
  TF-IDF (la opción "mejor" de la lección).

## Deep dive (opcional)

- **Chip Huyen — "AI Engineering"** (O'Reilly, 2025) y/o **"Designing Machine Learning Systems"**
  (O'Reilly, 2022). Para metas-temas de evaluación y por qué las métricas importan.
- **Google — "Machine Learning Crash Course", módulo de Classification** (developers.google.com).
  Precision/recall/threshold con visualizaciones interactivas. Bueno si querés más intuición.
- **Casos de la doc de sklearn sobre datasets desbalanceados** — para fijar por qué accuracy
  miente.

## Cómo usar este material

Cargá Banking77 desde HF → seguí el tutorial de texto de sklearn para armar el pipeline → leé la
doc de `classification_report` y matriz de confusión *antes* de mirar tus números, así sabés qué
estás leyendo. Recién ahí abrí `practica.md`. Si podés explicar precision vs recall y por qué
accuracy puede mentir *sin mirar*, estás listo.
