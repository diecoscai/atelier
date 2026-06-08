---
module: SQ-C
title: Classic ML — clasificador de intents y cómo evaluarlo
concept: Precision/recall/F1, overfitting, matriz de confusión, train/test split
kind: side-quest
duration: ~4-6h lectura + 1 finde de práctica
when: folded en M9 (el fundamento que M9 usa)
---

# SQ-C — Classic ML (clasificador Banking77 + eval)

> **Qué vas a saber al terminar:** entrenar un clasificador de ML clásico, y — más importante —
> **evaluarlo de verdad**: precision, recall, F1, matriz de confusión, y por qué el accuracy solo
> te puede mentir. Esto cubre el "data/ML blindness" que un AI Engineer no se puede permitir.

---

## Por qué esta side-quest existe (y cómo se conecta con M9)

Muchos "AI Engineers" saltaron directo a LLMs sin pasar por ML clásico, y se les nota: no saben
leer una matriz de confusión, confunden precision con recall, o reportan accuracy en un dataset
desbalanceado como si quisiera decir algo. Ese **data/ML blindness** es un red flag en la ronda
de teoría y en cualquier discusión de evals.

Esta side-quest es el **fundamento que M9 usa**: en M9 vas a meter un **clasificador de intents
barato como router** *antes* de llamar al LLM (clasificás la pregunta y la mandás al camino
correcto sin gastar un token de LLM si no hace falta). Para construir y confiar en ese router,
primero tenés que saber entrenarlo y, sobre todo, **medirlo bien**. SQ-C te da esa base; M9 la
integra. Enmarcala así: no es un módulo de producto suelto, es el músculo de ML clásico que M9
da por sentado.

---

## 1. El problema: clasificación de intents

**Banking77** es un dataset real (PolyAI) de 13.000+ frases de clientes de banca etiquetadas en
**77 intents** (`card_arrival`, `lost_or_stolen_card`, `exchange_rate`, ...). La tarea: dada una
frase nueva, predecir el intent. Es clasificación **multi-clase** y bastante difícil (77 clases,
varias muy parecidas entre sí).

Esto es el patrón exacto de un **router**: clasificar rápido y barato la intención del usuario
para decidir qué hacer. En Grounded (M9), un intent claro y barato puede resolverse sin LLM.

---

## 2. El pipeline de ML clásico

```
texto → [1] vectorizar → [2] entrenar un clasificador → [3] predecir → [4] EVALUAR
```

1. **Vectorizar:** convertís cada frase en números. Opción simple: **TF-IDF** (cuenta palabras
   ponderando las distintivas). Opción mejor: reusás **embeddings** (los mismos de tu RAG) como
   features — conexión directa con lo que ya sabés.
2. **Entrenar:** un clasificador clásico de `sklearn` (regresión logística o un SVM lineal
   andan muy bien sobre texto vectorizado).
3. **Predecir** sobre datos que el modelo **no vio en el entrenamiento**.
4. **Evaluar:** la parte que importa (Sección 4).

---

## 3. Train/test split y overfitting

Regla de oro: **nunca evalúes con los datos con los que entrenaste.** Partís el dataset en
*train* (para aprender) y *test* (para medir, intocado). Si medís sobre train, medís memoria, no
capacidad de generalizar.

**Overfitting** = el modelo memoriza el train (accuracy altísimo ahí) pero falla en test (datos
nuevos). La señal: gran brecha entre performance de train y de test. Un AI Engineer tiene que
oler esto a la legua — y este concepto se traslada idéntico a evaluar LLMs (no "evalúes" un
prompt con los mismos ejemplos con los que lo afinaste).

---

## 4. Las métricas (el verdadero objetivo de SQ-C)

Para una clase dada:

- **Precision:** de todo lo que el modelo dijo que era esta clase, ¿qué fracción acertó?
  *"Cuando dice X, ¿cuánto le creo?"* Penaliza falsos positivos.
- **Recall:** de todo lo que *realmente* era esta clase, ¿qué fracción agarró?
  *"De todos los X reales, ¿cuántos pescó?"* Penaliza falsos negativos.
- **F1:** la media armónica de precision y recall — un solo número que castiga si cualquiera de
  los dos está bajo. La métrica honesta cuando te importan los dos.
- **Accuracy:** % total de aciertos. **Engaña con clases desbalanceadas**: si el 95% es de una
  clase, predecir siempre esa clase da 95% accuracy y es inútil. Por eso reportás F1, no solo
  accuracy.

**Matriz de confusión:** una grilla `clase real × clase predicha`. La diagonal son los aciertos;
todo lo de afuera son los errores, y te muestra **qué confunde con qué** (ej. `card_arrival` vs
`card_delivery_estimate`). Es la herramienta nº1 de *error analysis* — la misma mentalidad que
vas a usar para evaluar el RAG en M2.

> **Checkpoint:** un detector de fraude marca 1 de cada 1000 transacciones como fraude y acierta
> el 60% de esas, pero se le escapa la mitad del fraude real. ¿Qué métrica te lo revela? Recall
> (lo que se escapa), no accuracy (que sería ~99.9% por el desbalance).

---

## 5. Router barato antes del LLM (la conexión con M9)

El payoff de producto: un clasificador chico cuesta microsegundos y centavos; una llamada al LLM
cuesta cientos de ms y dinero real. Si podés clasificar la intención con confianza alta y rutear
sin LLM (o elegir el prompt/herramienta correcta), bajás **latencia y costo**. En M9 vas a usar
exactamente esto: el clasificador de intents como **router barato**. Pero un router en el que no
confiás (porque no lo mediste bien) es peor que no tenerlo — de ahí que SQ-C insista tanto en la
evaluación.

---

## 6. Lo que tenés que poder defender (ver `criterios-defensa.md`)

- "¿Diferencia entre precision y recall? Dame un caso donde priorizás una." → Sección 4.
- "¿Por qué accuracy puede mentir?" → Sección 4 (desbalance).
- "¿Qué es overfitting y cómo lo detectás?" → Sección 3.
- "¿Cómo leés una matriz de confusión?" → Sección 4.
- "¿Cómo usarías este clasificador como router en tu producto?" → Sección 5 (M9).

Seguí con `material-apoyo.md` (Banking77 en HF + sklearn) y después `practica.md`.
