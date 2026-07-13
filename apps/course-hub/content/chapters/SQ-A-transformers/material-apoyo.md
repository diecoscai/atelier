---
module: SQ-A
---

# Material de apoyo — SQ-A (Transformers)

El material central es la serie de **Andrej Karpathy**. No leas/mires todo: los **★ Core** son
obligatorios antes de la práctica; el resto es para profundizar la intuición o defender mejor.

## ★ Core (mirá esto antes de tocar código)

1. **Andrej Karpathy — "Let's build GPT: from scratch, in code, spelled out"**
   `youtube.com/watch?v=kCc8FmEb1nY` — parte de la playlist *Neural Networks: Zero to Hero*
   (`youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ`).
   Es *la* lecture central de esta side-quest. Construye un GPT mínimo de cero, explicando
   self-attention, Q/K/V, multi-head y masking línea por línea. ~2h. Miralo con el editor al
   lado, pausando para tipear. Repo de la serie: `github.com/karpathy/nn-zero-to-hero`.

2. **Andrej Karpathy — serie *Neural Networks: Zero to Hero*** (overview)
   `karpathy.ai/zero-to-hero.html` enlaza la playlist completa. Las lectures de **makemore**
   previas dan el contexto (embeddings, MLP) — SQ-B las usa; acá alcanza con la de GPT, pero si
   venís sin base de redes, mirá al menos la intro.

3. **Jay Alammar — "The Illustrated Transformer"**
   `jalammar.github.io/illustrated-transformer/`
   El acompañamiento visual perfecto a Karpathy. Diagramas de Q/K/V, multi-head y positional
   encoding. Leelo *después* de la lecture para fijar la intuición. ~40 min. (Si querés más
   profundidad, el mismo autor expandió el material en formato libro — ver `LLM-book.com` —
   pero el post gratuito de arriba alcanza para esta side-quest. Nota: Alammar prácticamente
   congeló `jalammar.github.io` — su escritura nueva se mudó a Substack — pero este post clásico
   sigue online y es la referencia que usan Stanford/Harvard/MIT/Princeton/CMU en sus cursos, así
   que no hay link roto ni contenido movido.)

## Referencia (tené a mano)

- **Vaswani et al. — "Attention Is All You Need"** (2017), `arxiv.org/abs/1706.03762`.
  El paper original del Transformer. No hace falta leerlo entero; mirá la Figura 1
  (arquitectura) y la sección de *scaled dot-product attention*. Es la cita de autoridad cuando
  te preguntan "¿de dónde sale esto?".
- **Karpathy — repo `nanochat`** (`github.com/karpathy/nanochat`). El pipeline de referencia
  actual "de producción limpia": tokenize → pretrain → finetune → eval → inference completo,
  entrena un modelo con capacidad tipo GPT-2 por ~$48 (spot, más cerca de ~$15) en ~1.5-2h en
  8×H100 — la cifra sigue bajando (era ~$100/1.5h hace apenas un mes; el leaderboard de la
  comunidad ya reporta corridas de 1.8h). Es la comparación que querés usar hoy contra tu build.
- **Karpathy — repo `nanoGPT`** (`github.com/karpathy/nanoGPT`). El predecesor de nanochat —
  desde nov. 2025 el propio README lo marca como *"very old and deprecated"* y redirige a
  nanochat. Se mantiene solo por valor histórico/pedagógico (es el repo que sigue la lecture
  "Let's build GPT" línea por línea); no lo tomes como referencia de estado del arte.

## Deep dive (opcional)

- **Karpathy — `microgpt`** (`karpathy.github.io/2026/02/12/microgpt/`, feb. 2026). Un GPT
  completo (tokenizer + autograd propio + decoder + Adam) en ~200 líneas de Python puro, sin
  dependencias. Es la destilación más minimalista de la serie micrograd → makemore → nanoGPT →
  microgpt: útil si ya hiciste el build de la Práctica y querés ver el mecanismo entero sin
  ningún framework de por medio.
- **3Blue1Brown — "Transformers, the tech behind LLMs" (Deep Learning Chapter 5)**
  (`3blue1brown.com/lessons/gpt`). Renombrado desde "But what is a GPT?" al reorganizarse la
  serie *Deep Learning* por capítulos — mismo contenido, mismo link. Animaciones de la attention
  como "movimiento de información" en el espacio de embeddings. Excelente para la *intuición
  geométrica* sin matemática. El **Chapter 6, "Attention in transformers, step-by-step"**, es el
  siguiente video de la misma serie y va más al grano de Q/K/V si querés otra pasada centrada
  justo en eso.
- **Karpathy — "The spelled-out intro to neural networks and backpropagation: building
  micrograd"** (primera lecture de Zero to Hero). Si querés entender *por qué* el modelo aprende
  (gradientes/backprop) antes de SQ-B.

## Cómo usar este material

Mirá la lecture de **"Let's build GPT"** tipeando el código en paralelo → leé **The Illustrated
Transformer** para fijar los diagramas → recién ahí escribí el doc "cómo funciona el modelo" de
`practica.md`. Si podés explicar Q/K/V y por qué hay multi-head *sin mirar*, estás listo.

> **Nota (jul 2026):** Karpathy se sumó a Anthropic (equipo de pre-training) en mayo 2026, tras
> dejar Eureka Labs. Dijo que sigue apasionado por educación y planea retomarla "con el tiempo",
> pero por ahora está enfocado en pre-training research — no hay nuevas lectures públicas
> confirmadas en el corto plazo. Buena noticia práctica: el cuerpo de trabajo que usa esta
> side-quest (Zero-to-Hero, nanoGPT, nanochat, microgpt) va a seguir siendo el canon estable por
> un buen rato, no algo que quede obsoleto de un día para el otro. Dato extra para la entrevista:
> el interviewer que usás en `pruebas.md` (Claude) y el autor del material que estudiaste ahora
> trabajan en la misma empresa.
