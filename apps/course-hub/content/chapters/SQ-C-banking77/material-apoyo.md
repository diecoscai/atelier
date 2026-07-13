---
module: SQ-C
---

# Material de apoyo — SQ-C (classic ML / Banking77)

Los **★ Core** son obligatorios antes de la práctica. El resto es referencia mientras construís.

## ★ Core (leé esto antes de tocar código)

1. **Dataset Banking77 — Hugging Face (⚠️ leé la nota de carga primero)**
   `huggingface.co/datasets/PolyAI/banking77`
   El dataset original: 13,083 frases de banca (10,003 train + 3,080 test) en 77 intents. **Pero
   `PolyAI/banking77` todavía usa un "loading script" (`banking77.py`) que Hugging Face dejó de
   soportar desde `datasets==4.0.0`** (cualquier versión ≥4.0 tira `RuntimeError: Dataset scripts
   are no longer supported`, incluida la 5.0.0 recomendada más abajo).
   Para cargarlo hoy sin errores, usá el mirror ya migrado a Parquet:
   `huggingface.co/datasets/mteb/banking77` (mismos 77 intents, columnas `text`/`label`/
   `label_text`). Ver Paso 1 de `practica.md` para el código exacto. ~20 min.

2. **scikit-learn — ejemplo de clasificación de texto (reemplaza al tutorial descontinuado)**
   `scikit-learn.org/stable/auto_examples/text/plot_document_classification_20newsgroups.html`
   ("Classification of text documents using sparse features"). El tutorial viejo
   `.../tutorial/text_analytics/working_with_text_data.html` fue **removido de la doc** (404) —
   no lo busques. Este ejemplo cubre lo mismo y más actualizado: `TfidfVectorizer` →
   clasificador → `classification_report`. Es prácticamente el esqueleto de tu práctica. Índice
   completo de ejemplos de texto: `scikit-learn.org/stable/auto_examples/text/index.html`.
   ~40 min.

3. **scikit-learn — `classification_report` y `confusion_matrix` (docs de metrics)**
   `scikit-learn.org/stable/modules/model_evaluation.html`
   La referencia de precision/recall/F1/support y de la matriz de confusión. Buscá las
   definiciones y el ejemplo de output. ~30 min.

## Versiones (fijalas en tu entorno)

- `scikit-learn>=1.9.0` (estable desde junio 2026; requiere Python 3.11-3.14). Trae `narwhals`
  como dependencia nueva (interoperabilidad con dataframes) — no rompe nada de esta práctica,
  pero si ves esa librería instalarse sola, es por esto.
- `datasets>=5.0.0` (Hugging Face) — pero recordá usar `mteb/banking77`, no `PolyAI/banking77`
  directo (nota del punto 1).
- `sentence-transformers>=5.6.0`, si vas por la ruta de embeddings (opción "mejor" más abajo).

## Referencia (tené a mano)

- **scikit-learn — `LogisticRegression` y `LinearSVC`** (docs de cada estimador). Los dos
  clasificadores que andan muy bien sobre texto vectorizado.
- **scikit-learn — `TfidfVectorizer`** (`scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.TfidfVectorizer.html`)
  — referencia de la clase si el ejemplo del punto 2 no alcanza.
- **Hugging Face — librería `datasets`** (`huggingface.co/docs/datasets`). `load_dataset` y cómo
  iterar/splitear.
- **sentence-transformers** (`sbert.net/docs/sentence_transformer/pretrained_models.html`) — si
  querés usar embeddings como features en vez de TF-IDF (la opción "mejor" de la lección). Los
  dos defaults oficiales para uso general: `all-MiniLM-L6-v2` (rápido, liviano) y
  `all-mpnet-base-v2` (mejor calidad, más lento). **Matiz 2026:** son modelos de 2021-2022;
  para un proyecto real de retrieval/RAG vale la pena compararlos contra opciones más nuevas
  como `EmbeddingGemma-300M` (Google) o la familia `e5-small`/`e5-base-instruct`, que en
  benchmarks recientes rinden mejor en tareas de recuperación. No asumas que el default de la
  doc es la mejor opción — medí vos con tu propio set, la misma lógica de evaluación que ya
  venís aplicando en esta side-quest. **Nota aparte:** desde la v5.0, `sentence-transformers`
  también soporta *Sparse Encoders* como tercer tipo de modelo (junto a los densos y los
  cross-encoders) — no lo necesitás para esta práctica, pero es relevante si más adelante encarás
  retrieval híbrido (denso + sparse) en Grounded.

## Deep dive (opcional)

- **Chip Huyen — "AI Engineering"** (O'Reilly, 2025) y/o **"Designing Machine Learning Systems"**
  (O'Reilly, 2022). Para metas-temas de evaluación y por qué las métricas importan.
- **Google — "Machine Learning Crash Course", módulo de Classification** (developers.google.com).
  Precision/recall/threshold con visualizaciones interactivas. Bueno si querés más intuición.
- **Casos de la doc de sklearn sobre datasets desbalanceados** — para fijar por qué accuracy
  miente.

## Cómo usar este material

Cargá Banking77 desde HF (mirror en Parquet, punto 1) → seguí el ejemplo de texto de sklearn para
armar el pipeline → leé la doc de `classification_report` y matriz de confusión *antes* de mirar
tus números, así sabés qué estás leyendo. Recién ahí abrí `practica.md`. Si podés explicar
precision vs recall y por qué accuracy puede mentir *sin mirar*, estás listo.
