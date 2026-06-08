---
module: M0
---

# Material de apoyo — M0

Curado y ordenado. No leas todo: los **★ Core** son obligatorios antes de la práctica; el
resto es referencia para consultar mientras construís o profundización opcional.

## ★ Core (leé esto antes de tocar código)

1. **Simon Willison — "Embeddings: What they are and why they matter"**
   `simonwillison.net/2023/Oct/23/embeddings/`
   La mejor explicación de embeddings para alguien que programa. Buscá: la intuición de
   "cercanía semántica" y el ejemplo de búsqueda. ~30 min.

2. **OpenAI — Embeddings guide**
   `platform.openai.com/docs/guides/embeddings`
   La doc oficial. Buscá: modelos (`text-embedding-3-small/large`), el parámetro `dimensions`,
   precios, y el ejemplo de "semantic search". ~20 min.

3. **pgvector — README oficial**
   `github.com/pgvector/pgvector`
   Buscá: cómo crear la extensión y la columna `vector`, los operadores `<->` `<=>` `<#>`, y
   los índices HNSW vs IVFFlat. Es corto y es *la* referencia. ~30 min.

4. **Supabase — "Vector columns / pgvector" + semantic search guide**
   `supabase.com/docs/guides/ai`
   El walkthrough más concreto de RAG sobre Postgres+pgvector de punta a punta. Buscá el flujo
   embed → store → match. ~40 min.

## Referencia (tené a mano mientras construís)

- **FastAPI** — `fastapi.tiangolo.com` — tutorial "First Steps" + "Bigger Applications".
- **uv (Astral)** — `docs.astral.sh/uv` — "Getting started" + manejo de dependencias.
- **Pydantic** — `docs.pydantic.dev` — models y validación (tu `zod` de Python).
- **Vercel AI SDK** — `ai-sdk.dev` — `streamText` / `useChat` para el chat con streaming.
- **OpenAI / Anthropic cookbook** — ejemplos de RAG mínimos en repos oficiales (busca
  "cookbook RAG" en sus GitHub).

## Deep dive (opcional, para defender mejor en system design)

- **Chip Huyen — "AI Engineering"** (O'Reilly, 2025). El libro de referencia del curso.
  Para M0: el capítulo de *foundation models* y la intro a RAG. Es la fuente que da autoridad
  cuando te preguntan "¿de dónde sacaste esto?".
- **Liu et al. — "Lost in the Middle: How Language Models Use Long Contexts"** (2023),
  `arxiv.org/abs/2307.03172`. La evidencia de por qué *no* alcanza con meter todo en el prompt
  (el modelo ignora el medio del contexto). Munición directa para la Sección 1 de la lección.
- **3Blue1Brown — serie de álgebra lineal / "vectors"** (YouTube). Si la palabra "vector" te
  da inseguridad, 1-2 videos te dan la intuición geométrica. Opcional.

## Cómo usar este material

Leé los ★ Core → escribí en tus palabras (en `DECISIONS.md` o un scratchpad) las respuestas a
los checkpoints de la lección → recién ahí abrí `practica.md`. Si podés explicar embeddings y
por qué la búsqueda funciona *sin mirar*, estás listo para construir.
