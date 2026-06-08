---
module: M9
---

# Material de apoyo — M9

Curado y ordenado. Los **★ Core** son obligatorios antes de la práctica; **Referencia** es para
consultar mientras entrenás; **Deep** es profundización opcional para defender mejor en system
design. No leas todo de un saque: leé los Core, corré la práctica, y volvé a Referencia cuando te
trabes.

## ★ Core (leé esto antes de tocar la GPU)

1. **Maxime Labonne — "Fine-Tune Llama with QLoRA" / "A Beginner's Guide to LLM Fine-Tuning"**
   (blog de mlabonne, `mlabonne.github.io/blog` + sus notebooks en GitHub `mlabonne/llm-course`)
   La guía hands-on de referencia para fine-tunear con QLoRA en Colab. Buscá: el notebook end-to-
   end (carga 4-bit, config de LoRA con PEFT, SFTTrainer de TRL), qué hiperparámetros toca y por
   qué. Es el material que más se parece a lo que vas a hacer en la práctica. ~1h + el notebook.

2. **Hugging Face PEFT — docs (LoRA conceptual guide + QLoRA)**
   `huggingface.co/docs/peft`
   La librería que implementa LoRA/QLoRA. Buscá: `LoraConfig` (qué es `r`, `lora_alpha`,
   `target_modules`, `task_type`), `get_peft_model`, y cómo se guardan/cargan los adapters. Es *la*
   referencia de la API que vas a usar. ~30 min.

3. **Hugging Face TRL — SFTTrainer docs**
   `huggingface.co/docs/trl`
   El trainer de supervised fine-tuning. Buscá: `SFTTrainer` / `SFTConfig`, cómo se pasa el
   dataset y el formato/chat template, el data collator de **completion-only** (entrenar solo
   sobre la respuesta), y el logging de loss. ~30 min.

4. **Hugging Face — "4-bit quantization with bitsandbytes" (blog/docs)**
   `huggingface.co/blog/4bit-transformers-bitsandbytes` (y la doc de `bitsandbytes`)
   De dónde sale el 4-bit. Buscá: `BitsAndBytesConfig`, `load_in_4bit`, `bnb_4bit_quant_type="nf4"`,
   `bnb_4bit_compute_dtype`, double quantization. Esto es el "Q" de QLoRA en código. ~25 min.

## Referencia (tené a mano mientras entrenás)

- **Dataset Bitext customer-support** — `huggingface.co/datasets/bitext/Bitext-customer-support-
  llm-chatbot-training-dataset` — el dataset de soporte para el SFT. Mirá las columnas
  (instruction/response, categorías, intents) antes de formatear.
- **Dataset Banking77** — `huggingface.co/datasets/PolyAI/banking77` — 13k queries de banca, 77
  intents, splits train/test. El del clasificador classic ML.
- **scikit-learn — User Guide** — `scikit-learn.org/stable/` — buscá `TfidfVectorizer`,
  `LogisticRegression`, `classification_report`, `confusion_matrix`, y la guía de "model
  evaluation" (precision/recall/F1, macro vs weighted).
- **sentence-transformers — Training Overview** — `sbert.net` — para el embedding fine-tuning de
  dominio (Sección 8): `MultipleNegativesRankingLoss`, formato de pares, y la guía de
  "Training Examples". Solo si hacés el graft de embeddings.
- **Hugging Face `datasets`** — `huggingface.co/docs/datasets` — `load_dataset`, `map`, splits.

## Deep dive (opcional, para defender mejor en system design)

- **Dettmers, Pagnoni, Holtzman, Zettlemoyer — "QLoRA: Efficient Finetuning of Quantized LLMs"**
  (2023), `arxiv.org/abs/2305.14314`. El paper. No hace falta leerlo entero, pero **tenés que
  poder citarlo**: NF4 (4-bit NormalFloat, óptimo para datos normales), double quantization, paged
  optimizers, y el claim de que iguala ~full fine-tuning a una fracción de la memoria. Leé el
  abstract + la sección de NF4. Munición directa para el checkpoint de QLoRA.

- **Hu et al. — "LoRA: Low-Rank Adaptation of Large Language Models"** (2021),
  `arxiv.org/abs/2106.09685`. El paper original de LoRA. La hipótesis del *rango intrínseco bajo*
  de la actualización. Leé el abstract + la intuición; es la base conceptual de la Sección 4.

- **Andrej Karpathy — "makemore" / "Neural Networks: Zero to Hero"** (YouTube + repo
  `karpathy/makemore`). Si la intuición de *entrenar* (cross-entropy, gradient descent, loss que
  baja) te queda floja, los primeros videos de makemore te la dan construyendo un modelo de
  caracteres desde cero. Es el side-quest B del curso; acá paga doble porque vas a *ver* una loss
  curve real bajar. Opcional pero alto retorno si nunca entrenaste nada.

- **Sebastian Raschka — artículos sobre LoRA/fine-tuning práctico** (blog/Substack "Ahead of AI",
  autor de *Build a Large Language Model (From Scratch)*). Buscá sus posts sobre LoRA insights y
  consejos prácticos de hiperparámetros (rank, alpha, target modules). Buena segunda opinión
  cuando dudes de una decisión de config.

- **Chip Huyen — "AI Engineering"** (O'Reilly, 2025). El capítulo de *finetuning* (cuándo conviene,
  fine-tune vs RAG vs prompting, PEFT). La fuente que da autoridad cuando te preguntan "¿de dónde
  sacaste el criterio de cuándo fine-tunear?" en la Sección 7.

## Cómo usar este material

Leé los ★ Core → escribí en tus palabras (en `DECISIONS.md` o un scratchpad) las respuestas a los
checkpoints de la lección (sobre todo "¿cuándo fine-tune vs RAG?" y "¿qué es NF4?") → recién ahí
abrí `practica.md` y prendé la GPU. Si podés explicar QLoRA y la diferencia precision/recall *sin
mirar*, estás listo para correrlo.
