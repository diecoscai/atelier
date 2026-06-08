---
module: SQ-A
---

# Material de apoyo — SQ-A (Transformers)

El material central es la serie de **Andrej Karpathy**. No leas/mires todo: los **★ Core** son
obligatorios antes de la práctica; el resto es para profundizar la intuición o defender mejor.

## ★ Core (mirá esto antes de tocar código)

1. **Andrej Karpathy — "Let's build GPT: from scratch, in code, spelled out"**
   Serie *Neural Networks: Zero to Hero* (YouTube, canal de Andrej Karpathy).
   Es *la* lecture central de esta side-quest. Construye un GPT mínimo de cero, explicando
   self-attention, Q/K/V, multi-head y masking línea por línea. ~2h. Miralo con el editor al
   lado, pausando para tipear. Repo de la serie: `github.com/karpathy/nn-zero-to-hero`.

2. **Andrej Karpathy — serie *Neural Networks: Zero to Hero*** (overview)
   `karpathy.ai` (sección de cursos/lectures) enlaza la playlist completa. Las lectures de
   **makemore** previas dan el contexto (embeddings, MLP) — SQ-B las usa; acá alcanza con la
   de GPT, pero si venís sin base de redes, mirá al menos la intro.

3. **Jay Alammar — "The Illustrated Transformer"**
   `jalammar.github.io/illustrated-transformer/`
   El acompañamiento visual perfecto a Karpathy. Diagramas de Q/K/V, multi-head y positional
   encoding. Leelo *después* de la lecture para fijar la intuición. ~40 min.

## Referencia (tené a mano)

- **Vaswani et al. — "Attention Is All You Need"** (2017), `arxiv.org/abs/1706.03762`.
  El paper original del Transformer. No hace falta leerlo entero; mirá la Figura 1
  (arquitectura) y la sección de *scaled dot-product attention*. Es la cita de autoridad cuando
  te preguntan "¿de dónde sale esto?".
- **Karpathy — repo `nanoGPT`** (`github.com/karpathy/nanoGPT`). La versión "de producción
  limpia" del GPT que construís en la lecture. Útil para comparar tu build.

## Deep dive (opcional)

- **3Blue1Brown — capítulos sobre Transformers / attention** (serie de deep learning, YouTube,
  canal 3Blue1Brown). Animaciones de la attention como "movimiento de información" en el espacio
  de embeddings. Excelente para la *intuición geométrica* sin matemática.
- **Karpathy — "The spelled-out intro to neural networks and backpropagation: building
  micrograd"** (primera lecture de Zero to Hero). Si querés entender *por qué* el modelo aprende
  (gradientes/backprop) antes de SQ-B.

## Cómo usar este material

Mirá la lecture de **"Let's build GPT"** tipeando el código en paralelo → leé **The Illustrated
Transformer** para fijar los diagramas → recién ahí escribí el doc "cómo funciona el modelo" de
`practica.md`. Si podés explicar Q/K/V y por qué hay multi-head *sin mirar*, estás listo.
