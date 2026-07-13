---
module: M9
feature: QLoRA fine-tune end-to-end (Llama-3.2-1B + Bitext) + clasificador de intents (Banking77) como router
repo: grounded
---

# Práctica — fine-tune con QLoRA + clasificador de intents (en el repo Grounded)

Objetivo: **(A)** correr un QLoRA end-to-end sobre Llama-3.2-1B con el dataset de soporte, con loss
curve y eval before/after que muestre mejora; **(B)** entrenar un clasificador de intents con
Banking77, reportar F1/matriz de confusión, y conectarlo como **router barato** antes del pipeline
RAG/LLM de Grounded. Cada paso tiene **qué hacer** y **cómo verificar**. No avances sin verificar.

> **Encuadre:** la parte A (QLoRA) es un **ejercicio de aprendizaje** — corre en Colab/RunPod,
> *no* se deploya en Grounded. La parte B (clasificador) sí es un componente real: un router que
> vive en el repo. El código del notebook A guardalo en `grounded/experiments/m9-qlora/` (notebook
> + README con resultados); el clasificador en `grounded/services/api/routing/`.

## Pre-requisitos
- Cuenta de Google (Colab con GPU **T4**, 16 GB, gratis pero **no garantizada**: en horas pico
  —14:00-18:00 UTC aprox.— Colab puede negarte runtime GPU a la cuenta gratis, degradarlo a una
  GPU más vieja/lenta, o forzarte a CPU. Si te pasa, reintentá más tarde o usá el fallback) **o**
  un pod en RunPod si necesitás algo más consistente: al momento de escribir esto, una RTX 4090 en
  Community Cloud arranca en ~$0.34/h y un A40 en ~$0.35-0.44/h (billing por segundo) —
  **verificá el precio actual en `runpod.io/pricing` antes de lanzar**, fluctúa.
- Cuenta de Hugging Face + un **access token** (para descargar modelos/datasets gated como Llama).
  Pedí acceso a `meta-llama/Llama-3.2-1B-Instruct` en su página de HF si está gated (normalmente es
  gratis y tarda minutos, aunque no siempre es instantáneo). Alternativas sin gate: un modelo chico
  abierto como `Qwen/Qwen3-1.7B-Instruct` (sucesor de Qwen2.5) o `HuggingFaceTB/SmolLM3-3B`
  (sucesor de SmolLM2, supera a Llama-3.2-3B y Qwen2.5-3B en benchmarks — un poco más pesado pero
  entra igual en 4-bit en una T4).
- Leíste los ★ Core de `material-apoyo.md` y podés explicar QLoRA y precision/recall sin mirar.
- Python local con `uv` (para la parte B; la parte A corre en la nube).

> **Sobre versiones de librerías:** `transformers`, `peft` y `trl` cambian seguido y con breaking
> changes reales (ver Paso A0). Fijá versiones explícitas en vez de instalar "latest" a ciegas —
> un tutorial con `pip install transformers peft trl` sin pins es el motivo #1 por el que un
> notebook de hace 6 meses se rompe hoy.

---

# PARTE A — QLoRA end-to-end (en la GPU)

## Paso A0 — Setup del entorno GPU
**Hacer:**
- **Opción Colab (normalmente gratis):** abrí un notebook nuevo → `Runtime → Change runtime type →
  T4 GPU`. Verificá la GPU con `!nvidia-smi`. Si Colab te niega la GPU o te da CPU (pasa en horas
  pico), reintentá más tarde o pasá a RunPod.
- **Opción RunPod:** lanzá un pod con una GPU (ej. RTX 4090 / A40) y la plantilla de PyTorch;
  conectate por Jupyter. Apagalo al terminar para no quemar crédito — el billing es por segundo.
- Instalá las librerías **con versiones fijadas** (evita romperte con breaking changes recientes de
  Transformers v5 y TRL — ver nota de Pre-requisitos):
  ```bash
  pip install -U "transformers>=5.0,<6.0" "peft>=0.19.1,<0.20" "trl>=0.24,<0.25" \
    bitsandbytes accelerate datasets
  ```
  Verificá vos mismo las últimas versiones estables al momento de correr esto — la API de
  `SFTTrainer`/`SFTConfig` cambió de nombre varios argumentos entre versiones (`tokenizer` →
  `processing_class`, `max_seq_length` → `max_length`), y el código de abajo asume una versión
  reciente de TRL.
- Logueá a HF: `from huggingface_hub import login; login(token="hf_...")`.

**Verificar:** `!nvidia-smi` muestra la T4 (o la GPU del pod). `import torch; torch.cuda.is_available()`
da `True`.

## Paso A1 — Cargar el modelo base en 4-bit (el "Q" de QLoRA)
**Hacer:** cargá el modelo cuantizado a NF4.

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig

model_id = "meta-llama/Llama-3.2-1B-Instruct"  # o Qwen/Qwen3-1.7B-Instruct / HuggingFaceTB/SmolLM3-3B sin gate

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",            # NormalFloat4 (del paper QLoRA)
    bnb_4bit_use_double_quant=True,       # double quantization
    bnb_4bit_compute_dtype=torch.bfloat16 # cómputo en bf16, pesos en 4-bit
)

tokenizer = AutoTokenizer.from_pretrained(model_id)
tokenizer.pad_token = tokenizer.eos_token

model = AutoModelForCausalLM.from_pretrained(
    model_id, quantization_config=bnb_config, device_map="auto"
)
```

**Verificar:** el modelo carga sin OOM. `!nvidia-smi` muestra un uso de VRAM mucho menor que el
tamaño fp16 del modelo (esa es la prueba de que el 4-bit funcionó).

## Paso A2 — Eval BEFORE (medí el modelo base ANTES de tocarlo)
**Hacer:** elegí 10-15 prompts de soporte de test (NO los uses para entrenar). Generá las
respuestas del modelo **base** y guardalas. Esto es tu línea de base — sin esto no podés mostrar
mejora.

```python
def generate(prompt, model, tokenizer, max_new_tokens=128):
    messages = [{"role": "user", "content": prompt}]
    inputs = tokenizer.apply_chat_template(messages, return_tensors="pt",
                                           add_generation_prompt=True).to(model.device)
    out = model.generate(inputs, max_new_tokens=max_new_tokens, do_sample=False)
    return tokenizer.decode(out[0][inputs.shape[1]:], skip_special_tokens=True)

before = {p: generate(p, model, tokenizer) for p in test_prompts}
```

**Verificar:** tenés un dict `before` con las respuestas del modelo base guardado. Leelas: vas a
notar que el formato/tono no es el de tu soporte (eso es lo que el fine-tune va a corregir).

## Paso A3 — Dataset → formato de instrucción
**Hacer:** cargá Bitext, formateá cada ejemplo con el **chat template** del tokenizer, y separá un
pequeño set de validación.

```python
from datasets import load_dataset

ds = load_dataset("bitext/Bitext-customer-support-llm-chatbot-training-dataset", split="train")
ds = ds.shuffle(seed=42).select(range(3000))  # subset para que entrene rápido y barato

def to_chat(ex):
    messages = [
        {"role": "system", "content": "You are a helpful customer support agent."},
        {"role": "user", "content": ex["instruction"]},
        {"role": "assistant", "content": ex["response"]},
    ]
    return {"text": tokenizer.apply_chat_template(messages, tokenize=False)}

ds = ds.map(to_chat, remove_columns=ds.column_names)
ds = ds.train_test_split(test_size=0.05, seed=42)  # train + validación
```

**Verificar:** `print(ds["train"][0]["text"])` muestra un ejemplo con los tokens de rol del chat
template (system/user/assistant) correctamente serializados.

## Paso A4 — Config de LoRA + entrenar con SFTTrainer
**Hacer:** pegá los adapters LoRA y entrená.

```python
from peft import LoraConfig
from trl import SFTTrainer, SFTConfig

peft_config = LoraConfig(
    r=16,                    # rango del adapter
    lora_alpha=32,           # escala (~2·r)
    lora_dropout=0.05,
    target_modules="all-linear",  # atención (q/k/v/o) + MLP (gate/up/down); mejor que solo atención
    task_type="CAUSAL_LM",
    # use_dora=True,         # opcional: QDoRA — más expresivo, más cómputo. Bueno con GPU de sobra.
)

sft_config = SFTConfig(
    output_dir="grounded-qlora",
    num_train_epochs=1,            # 1-2; más = riesgo de overfit
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4, # batch efectivo = 16 sin reventar VRAM
    learning_rate=2e-4,            # alto, típico de LoRA
    logging_steps=10,              # para ver la loss curve
    eval_strategy="steps", eval_steps=50,
    bf16=True,
)

trainer = SFTTrainer(
    model=model, args=sft_config, peft_config=peft_config,
    train_dataset=ds["train"], eval_dataset=ds["test"],
)
trainer.train()
trainer.save_model("grounded-qlora-adapter")  # guarda SOLO el adapter (pocos MB)
```

**Verificar:** el train corre sin OOM. En los logs ves la `loss` bajar a medida que avanzan los
steps, y la `eval_loss` cada 50 steps. El adapter guardado pesa decenas de MB (NO el modelo
entero) — esa es la prueba de que entrenaste pocos parámetros.

## Paso A5 — Loss curve: leerla y guardarla
**Hacer:** ploteá train loss vs eval loss (de `trainer.state.log_history`). Guardá el PNG en
`experiments/m9-qlora/`.

```python
import matplotlib.pyplot as plt
hist = trainer.state.log_history
tr = [(h["step"], h["loss"]) for h in hist if "loss" in h]
ev = [(h["step"], h["eval_loss"]) for h in hist if "eval_loss" in h]
plt.plot(*zip(*tr), label="train"); plt.plot(*zip(*ev), label="eval")
plt.xlabel("step"); plt.ylabel("loss"); plt.legend(); plt.savefig("loss_curve.png")
```

**Verificar:** tenés un PNG. **Interpretala en una línea escrita** (para el defense drill): ¿baja y
se aplana sano? ¿train baja pero eval sube (overfit)? ¿oscila (lr roto)? Si overfittea, bajá epochs
o `r` y re-corré.

## Paso A6 — Eval AFTER (la prueba de que sirvió)
**Hacer:** generá las respuestas de los **mismos** `test_prompts` con el modelo + adapter y compará
con `before`.

```python
after = {p: generate(p, model, tokenizer) for p in test_prompts}  # model ya tiene el adapter
for p in test_prompts:
    print(f"Q: {p}\nBEFORE: {before[p]}\nAFTER:  {after[p]}\n{'-'*60}")
```

**Verificar:** las respuestas AFTER están en el formato/tono del dataset de soporte y las BEFORE no.
Documentá la mejora: cualitativa (lado a lado) y, si podés, la `eval_loss` final vs la del base.
**Bonus (cierra el loop con M2):** pasá `before` vs `after` por un LLM-as-judge de tu harness de
evals y reportá el % de veces que prefiere el fine-tuneado.

## Paso A7 (opcional, graft) — Embedding fine-tuning de dominio
**Hacer:** con `sentence-transformers`, fine-tuneá un embedder chico (ej. `all-MiniLM-L6-v2`) con
**pares (query, chunk-que-responde)** de tu golden dataset de M2, usando
`MultipleNegativesRankingLoss`. Re-calculá **recall@5** sobre tus golden queries antes y después.

**Verificar:** recall@5 con el embedder fine-tuneado ≥ recall@5 con el genérico sobre *tu* dominio.
(Si no mejora, está bien: el aprendizaje es haberlo medido y saber cuándo aplica.)

---

# PARTE B — Clasificador de intents (router barato, en el repo)

## Paso B1 — Entrenar el clasificador con Banking77
**Hacer:** en `grounded/services/api/routing/` (local, sin GPU), entrená TF-IDF + LogReg.

```python
from datasets import load_dataset
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, confusion_matrix
import joblib

train = load_dataset("PolyAI/banking77", split="train")
test  = load_dataset("PolyAI/banking77", split="test")

clf = Pipeline([
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=2)),
    ("lr", LogisticRegression(max_iter=1000, C=10)),
])
clf.fit(train["text"], train["label"])
joblib.dump(clf, "intent_clf.joblib")
```

**Verificar:** `intent_clf.joblib` existe y `clf.predict(["I lost my card"])` devuelve un intent
plausible (el id de `lost_or_stolen_card`).

## Paso B2 — Métricas: F1 + matriz de confusión
**Hacer:** evaluá en el test split y reportá.

```python
pred = clf.predict(test["text"])
print(classification_report(test["label"], pred, digits=3))  # precision/recall/F1 por intent
cm = confusion_matrix(test["label"], pred)
# guardá el macro-F1 y un heatmap de cm en routing/REPORT.md
```

**Verificar:** tenés el **macro-F1** reportado (una baseline TF-IDF+LogReg sobre Banking77 suele
dar ~0.8-0.85 de accuracy/F1 — usalo como sanity check, no como target rígido). Identificá en la
matriz de confusión **2 pares de intents que se confunden** y escribí por qué (semánticamente
parecidos). Eso es la lectura accionable.

## Paso B3 — Conectar como router (el componente real)
**Hacer:** en el `POST /chat` de Grounded, antes del pipeline RAG, clasificá el intent y ruteá:
- intent de **alta confianza** (probabilidad de la top class > umbral, ej. 0.7) y "simple" →
  respuesta canned / flujo dedicado (sin LLM).
- de lo contrario → pipeline RAG/LLM completo.

```python
import numpy as np
proba = clf.predict_proba([query])[0]
intent, conf = clf.classes_[proba.argmax()], proba.max()
if conf > 0.7 and intent in SIMPLE_INTENTS:
    return canned_response(intent)         # barato, sin LLM
return rag_pipeline(query)                  # caro, full RAG
```

**Verificar:** una query de intent simple con alta confianza se resuelve **sin** llamar al LLM (lo
ves en los logs/trace de Langfuse — no hay span de LLM). Una query ambigua cae al RAG. Medí: % de
queries que el router desvía y el ahorro estimado de costo/latencia.

---

## Definición de "hecho" (M9)
✅ Corriste QLoRA end-to-end en GPU (modelo en 4-bit NF4, adapter LoRA entrenado y guardado) ·
✅ Tenés loss curve guardada e interpretada · ✅ Eval before/after muestra mejora documentada ·
✅ Clasificador Banking77 entrenado con macro-F1 reportado y matriz de confusión leída ·
✅ Router conectado en Grounded (intent simple → sin LLM; ambiguo → RAG), con el ahorro medido ·
✅ ADR-M9 escrito ("¿cuándo fine-tune vs RAG?" con el caso de Grounded) · ✅ defense drills
respondidos · ✅ `course.json` actualizado. → marcás el gate en el panel del módulo.
