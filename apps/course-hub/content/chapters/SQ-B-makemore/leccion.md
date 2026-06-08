---
module: SQ-B
title: La math mínima de un AI Engineer (con makemore)
concept: Vectores/dot-product, softmax/temperature, cross-entropy, gradient descent, logprobs
kind: side-quest
duration: ~3-4h video/lectura + 1 día de práctica
when: M4 (en paralelo)
---

# SQ-B — Math intuition + eval (makemore MLP)

> **Qué vas a saber al terminar:** la intuición — no la derivación — de los cinco conceptos de
> math que un AI Engineer usa de verdad: vectores y dot-product, softmax y temperature,
> cross-entropy, gradient descent, y qué es un **logprob**. Y vas a instrumentar logprobs en
> Grounded, conectando con la *confidence* de M4.

---

## Por qué esta side-quest existe

Hay un gap clásico que los entrevistadores detectan rápido: el "AI Engineer" que arma RAGs pero
no entiende qué es un softmax o qué mide la cross-entropy. No necesitás derivar la backprop de la
attention (eso es para investigadores). Necesitás el **mínimo real**: poder decir qué pasa cuando
subís la `temperature`, qué número estás minimizando cuando "entrenás", y qué te dice un logprob
sobre la confianza del modelo. Eso es lo que separa "usa la API" de "entiende el modelo".

Es liviano y corre en M4 — el mismo módulo donde aparece *confidence/abstención* en Grounded. La
práctica conecta los dos: instrumentás **logprobs** en tu producto.

---

## 1. Vectores y dot-product (la operación que está en todo)

Un **vector** es una lista de números que ubica algo en un espacio. Ya los usás: los embeddings
de RAG son vectores. La operación central es el **dot-product** (producto punto): multiplicás
componente a componente y sumás.

- Geométricamente, el dot-product mide **alineación**: alto = los vectores apuntan parecido,
  cero = perpendiculares (sin relación), negativo = opuestos.
- La **cosine similarity** que usás para retrieval *es* un dot-product normalizado.
- La attention de SQ-A calcula relevancia con dot-products Q·K.

Si entendés que "dot-product = cuánto se parecen dos vectores", entendés el 80% de la geometría
que aparece en AI engineering.

---

## 2. Softmax y temperature (de scores a probabilidades)

Un modelo produce un *score* (logit) por cada opción posible (cada token del vocabulario). El
**softmax** convierte esa lista de scores en una **distribución de probabilidad**: todos
positivos, suman 1. Exagera las diferencias (el score más alto se lleva la mayor probabilidad).

La **temperature** es una perilla sobre el softmax:
- `temperature` baja (→0): la distribución se vuelve picuda, el modelo elige casi siempre lo más
  probable → salidas **deterministas, conservadoras**.
- `temperature` alta (→1+): la distribución se aplana, opciones menos probables ganan chance →
  salidas **creativas, variadas, más arriesgadas**.

Esto no es teoría abstracta: es el parámetro `temperature` que pasás en cada llamada al LLM de
Grounded. En soporte querés temperature baja (respuestas consistentes y fieles al contexto).

> **Checkpoint:** ¿por qué en un RAG de soporte usás temperature baja? Porque no querés
> creatividad: querés la respuesta más fiel al contexto recuperado, repetible.

---

## 3. Cross-entropy (qué número minimiza el entrenamiento)

Cuando un modelo "aprende", minimiza una **loss**. Para predecir el siguiente token, esa loss es
la **cross-entropy**: mide qué tan lejos está la distribución que predijo el modelo de la
respuesta correcta.

Intuición: si el modelo le dio probabilidad alta al token correcto → cross-entropy baja (bien).
Si le dio probabilidad baja al correcto → cross-entropy alta (mal, castigo grande). Entrenar =
empujar los pesos para que el token correcto reciba más probabilidad → la loss baja. Es la misma
loss cuya bajada miraste en SQ-A.

---

## 4. Gradient descent (cómo baja la loss)

El modelo tiene millones de parámetros (pesos). El **gradient** te dice, para cada peso, en qué
dirección moverlo para bajar la loss. **Gradient descent** = dar un pasito en esa dirección, una
y otra vez (el tamaño del paso es el *learning rate*). Eso es entrenar. No necesitás derivar
gradientes a mano — necesitás saber que "entrenar = bajar una loss moviendo pesos en la dirección
que da el gradiente, de a pasos chicos".

---

## 5. Logprobs (el puente a tu producto)

Un **logprob** es el logaritmo de la probabilidad que el modelo le asignó a un token que generó.
Como las probabilidades viven entre 0 y 1, su log es negativo: cerca de 0 = el modelo estaba
**seguro**; muy negativo = el modelo estaba **dudando**.

Por qué te importa como AI Engineer: los logprobs son una **señal de confianza barata y directa
del modelo**. Si una respuesta de Grounded tiene logprobs muy bajos (el modelo dudó en cada
token), es candidata a **abstención** ("no estoy seguro") en vez de alucinar. Esto es exactamente
el tema de *confidence* de M4 — y por eso la práctica de SQ-B instrumenta logprobs en el producto.

---

## 6. Lo que tenés que poder defender (ver `criterios-defensa.md`)

- "¿Qué es un dot-product y dónde aparece en tu RAG?" → Sección 1.
- "¿Qué hace la temperature y qué valor usás en soporte y por qué?" → Sección 2.
- "¿Qué loss minimiza un LM y qué mide?" → Sección 3 (cross-entropy).
- "Explicame gradient descent en una frase." → Sección 4.
- "¿Qué es un logprob y cómo lo usarías para decidir si el modelo se abstiene?" → Sección 5
  (conecta con M4).

Seguí con `material-apoyo.md` (makemore MLP de Karpathy) y después `practica.md`.
