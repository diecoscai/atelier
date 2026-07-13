---
module: SQ-C
feature: clasificador de intents Banking77 + eval → router barato (fundamento de M9)
repo: scratch (el clasificador) → se integra a grounded en M9
---

# Práctica — clasificador Banking77 y su evaluación

Objetivo: entrenar un clasificador de intents sobre Banking77 y **evaluarlo de verdad** con
`classification_report` y matriz de confusión. El entregable real no es el accuracy: es que
sepas *leer* las métricas y argumentar si el clasificador sirve como router. M9 lo integra a
Grounded; acá construís y medís el fundamento.

## Pre-requisitos
- Python con `scikit-learn>=1.9.0`, `datasets>=5.0.0` (Hugging Face), y `matplotlib` (para la
  matriz). Notebook o Colab.
- Leíste los ★ Core de `material-apoyo.md` y podés explicar precision vs recall sin mirar.

---

## Paso 1 — Cargar Banking77
**Hacer:** cargá el dataset con `datasets`. **No uses `PolyAI/banking77` directo** — todavía usa
un loading script que `datasets` rechaza desde la versión 4.0.0 en adelante (incluida la 5.0.0
recomendada en `material-apoyo.md`) con `RuntimeError: Dataset scripts are no longer supported`.
Usá el mirror ya migrado a Parquet:

```python
from datasets import load_dataset

ds = load_dataset("mteb/banking77")  # mismos 77 intents, ya en Parquet
train, test = ds["train"], ds["test"]
```

Usá los splits `train`/`test` que ya trae.

**Verificar:** imprimís unas frases con su intent (columnas `text`/`label_text`); sabés cuántas
clases (77) y cuántos ejemplos hay por split (train ~9,990 / test 3,080 en este mirror — el
conteo exacto puede variar levemente respecto al original según cómo se re-splitee). Mirás si
las clases están balanceadas o no (importa para elegir métrica).

## Paso 2 — Vectorizar + entrenar
**Hacer:** vectorizá las frases (arrancá con `TfidfVectorizer`; opcional: probá embeddings como
features) y entrená un clasificador (`LogisticRegression` o `LinearSVC`) **solo sobre train**.

**Verificar:** el modelo entrena sin error y predice sobre el set de test (que no tocó).

## Paso 3 — Evaluar bien (el corazón de la práctica)
**Hacer:** sobre el **test set**:
1. corré `classification_report` → mirá precision, recall y F1 por clase y los promedios
   (macro vs weighted).
2. generá la **matriz de confusión** y visualizala.
3. identificá los **pares de intents que más se confunden** (las celdas grandes fuera de la
   diagonal).

**Verificar:** podés decir, con tus números, cuáles son las 2-3 clases peores y *por qué* se
confunden (intents semánticamente cercanos). Podés explicar la diferencia entre el F1 macro y el
weighted en tu resultado.

## Paso 4 — Chequear overfitting
**Hacer:** comparÁ la performance en train vs test.

**Verificar:** entendés la brecha. Si train ≫ test, hay overfitting; sabés explicar por qué y qué
harías (más datos, regularización, features más simples).

## Paso 5 — El framing de router (conexión con M9)
**Hacer:** anotá en tus notas (o `DECISIONS.md`, tag `Module: M9` / `SideQuest: SQ-C`): ¿con qué
umbral de confianza usarías este clasificador como **router barato antes del LLM**? ¿Qué clases
son lo bastante confiables para rutear sin LLM y cuáles no? ¿Cuánto costo/latencia ahorrarías?

**Verificar:** podés defender el clasificador como router: dónde confiás en él, dónde caés al LLM,
y cómo lo mediste para decidirlo.

---

## Definición de "hecho" (SQ-C)
✅ Clasificador entrenado sobre Banking77 · ✅ `classification_report` + matriz de confusión
analizados (no solo generados) · ✅ Identificaste los intents que más se confunden y por qué ·
✅ Chequeaste overfitting (train vs test) · ✅ Anotaste el framing de router para M9. → marcás el
gate de la side-quest.
