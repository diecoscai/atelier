---
module: SQ-B
---

# Material de apoyo — SQ-B (makemore / math intuition)

Material central: la parte **MLP** de la serie *makemore* de **Andrej Karpathy**. Los **★ Core**
son obligatorios antes de la práctica.

## ★ Core (mirá esto antes de tocar código)

1. **Andrej Karpathy — "Building makemore" (parte MLP)**
   Serie *Neural Networks: Zero to Hero* (YouTube, canal de Andrej Karpathy). La lecture que
   construye un MLP estilo Bengio para modelar nombres caracter a caracter. Cubre embeddings,
   el forward pass, **softmax**, **cross-entropy** y el loop de **gradient descent** — todo
   tipeado y explicado. ~1.5-2h. Repo: `github.com/karpathy/makemore` y
   `github.com/karpathy/nn-zero-to-hero`.

2. **Andrej Karpathy — "The spelled-out intro to language modeling: building makemore"**
   (primera lecture de la serie makemore, bigram). El contexto previo: cómo se cuenta y se
   normaliza una distribución, qué es la *negative log likelihood*. Útil si la math te da
   inseguridad. ~1.5h.

3. **3Blue1Brown — "Essence of linear algebra" (vectores y dot-product)**
   (YouTube, canal 3Blue1Brown). Los primeros 1-2 capítulos te dan la intuición geométrica de
   vector y producto punto sin álgebra pesada. ~30 min. Opcional si ya te sentís cómodo.

## Referencia (tené a mano)

- **OpenAI — docs de la API, parámetro `logprobs`** (`platform.openai.com/docs`). Cómo pedir
  logprobs en una completion/chat. Es lo que vas a instrumentar en la práctica.
- **OpenAI — guía de `temperature` y sampling** (en la doc de la API). Para fijar qué valor usás
  en Grounded y por qué.

## Deep dive (opcional)

- **Karpathy — "micrograd"** (primera lecture de Zero to Hero, `github.com/karpathy/micrograd`).
  Si querés entender *gradient descent* desde la base construyendo un autograd de 100 líneas.
- **3Blue1Brown — serie "Neural networks"** (YouTube). Backprop y gradient descent animados.

## Cómo usar este material

Mirá la lecture **MLP de makemore** tipeando el código → fijate dónde aparecen softmax y
cross-entropy en *tu* código → leé la doc de `logprobs` de OpenAI → recién ahí abrí `practica.md`
para instrumentar logprobs en Grounded. Si podés explicar qué hace la temperature y qué mide la
cross-entropy *sin mirar*, estás listo.
