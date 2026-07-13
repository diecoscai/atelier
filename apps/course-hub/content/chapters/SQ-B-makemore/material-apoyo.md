---
module: SQ-B
---

# Material de apoyo — SQ-B (makemore / math intuition)

Material central: la parte **MLP** de la serie *makemore* de **Andrej Karpathy**. Los **★ Core**
son obligatorios antes de la práctica.

## ★ Core (mirá esto antes de tocar código)

1. **Andrej Karpathy — "Building makemore" (parte MLP)**
   Serie *Neural Networks: Zero to Hero* (YouTube, canal de Andrej Karpathy:
   [`youtube.com/watch?v=TCH_1BHY58I`](https://www.youtube.com/watch?v=TCH_1BHY58I)). La lecture
   que construye un MLP estilo Bengio para modelar nombres caracter a caracter. Cubre embeddings,
   el forward pass, **softmax**, **cross-entropy** y el loop de **gradient descent** — todo
   tipeado y explicado. ~1.5-2h. Repo: `github.com/karpathy/makemore` y
   `github.com/karpathy/nn-zero-to-hero`.
   > Karpathy se unió a Anthropic en mayo de 2026 para liderar research de pre-training y pausó
   > Eureka Labs; estos repos siguen públicos y funcionando pero no esperes commits nuevos. No
   > hace falta pinnear un commit para seguir la lecture, pero es buena práctica si querés
   > reproducibilidad exacta.

2. **Andrej Karpathy — "The spelled-out intro to language modeling: building makemore"**
   (primera lecture de la serie makemore, bigram). El contexto previo: cómo se cuenta y se
   normaliza una distribución, qué es la *negative log likelihood*. Útil si la math te da
   inseguridad. ~1.5h.

3. **3Blue1Brown — "Essence of linear algebra" (vectores y dot-product)**
   (YouTube, canal 3Blue1Brown, playlist:
   [`youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab`](https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab)).
   Los primeros 1-2 capítulos te dan la intuición geométrica de vector y producto punto sin
   álgebra pesada. ~30 min. Opcional si ya te sentís cómodo.

## Antes de tocar código: versión de PyTorch

`practica.md` no fija una versión exacta a propósito (PyTorch sale nuevo cada 1-2 meses), pero
**local y Colab hoy no están alineados**: pip instala PyTorch 2.13 (la última estable), mientras
que el runtime pineado de Colab trae 2.10. Las operaciones que usa el MLP de makemore
(`nn.Embedding`, `F.cross_entropy`, `torch.multinomial`, autograd básico) son estables en ese
rango, así que no deberías tener problemas — pero corré `import torch; print(torch.__version__)`
al principio y no asumas paridad entre tu máquina y Colab.

## Referencia (tené a mano)

- **OpenAI — Cookbook, "Using logprobs"**
  ([`developers.openai.com/cookbook/examples/using_logprobs`](https://developers.openai.com/cookbook/examples/using_logprobs)).
  Cómo pedir `logprobs`/`top_logprobs` en una llamada a **Chat Completions**. Nota: la URL vieja
  `cookbook.openai.com` ahora redirige acá. Dos cosas a confirmar antes de instrumentar: (1) el
  **modelo** — los de razonamiento (`o1`/`o3`, `gpt-5`/`gpt-5.1`/`gpt-5.2`/`gpt-5.6`) no soportan
  `logprobs` (la API devuelve error); (2) la **API** — esta guía aplica a Chat Completions, pero la
  **Responses API** (la que OpenAI recomienda ahora por default) no soporta `logprobs` en absoluto,
  para ningún modelo. Confirmá modelo y API antes de tocar código.
- **OpenAI — Guía de razonamiento (`reasoning_effort`, `temperature`)**
  ([`developers.openai.com/api/docs/guides/reasoning`](https://developers.openai.com/api/docs/guides/reasoning)).
  Mismo caveat que arriba: en modelos de razonamiento (incluida la línea `gpt-5.6`, lanzada
  9-jul-2026, que reemplazó a `gpt-5.2` como línea frontera) `temperature` no aplica (se fija en
  1), salvo `gpt-5.1`+ con `reasoning_effort="none"` — el rango completo de `reasoning_effort` es
  `none`/`low`/`medium`/`high`/`xhigh`/`max` (default `medium`).

## Deep dive (opcional)

- **Karpathy — "micrograd"** (primera lecture de Zero to Hero, `github.com/karpathy/micrograd`).
  Si querés entender *gradient descent* desde la base construyendo un autograd de 100 líneas.
- **3Blue1Brown — serie "Neural networks"** (YouTube). Backprop y gradient descent animados.
- **Karpathy — "microgpt"** ([`karpathy.github.io/2026/02/12/microgpt`](https://karpathy.github.io/2026/02/12/microgpt)).
  Un archivo Python de ~200 líneas, sin dependencias, que el propio Karpathy describe como "la
  culminación de micrograd, makemore y nanoGPT". Entrena sobre el mismo tipo de dataset de
  nombres pero llega a un transformer completo con autograd propio. Buen siguiente paso si
  terminaste el MLP y querés ver el camino hasta un GPT real, en el mismo estilo minimalista.

## Cómo usar este material

Mirá la lecture **MLP de makemore** tipeando el código → fijate dónde aparecen softmax y
cross-entropy en *tu* código → leé la doc de `logprobs` de OpenAI (y confirmá que el modelo **y la
API** —Chat Completions vs Responses— de Grounded los soportan) → recién ahí abrí `practica.md`
para instrumentar logprobs en Grounded. Si podés explicar qué hace la temperature y qué mide la
cross-entropy *sin mirar*, estás listo.
