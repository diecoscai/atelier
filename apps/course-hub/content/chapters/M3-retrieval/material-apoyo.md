---
module: M3
---

# Material de apoyo — M3

Curado y ordenado. No leas todo: los **★ Core** son obligatorios antes de la práctica; el resto
es referencia para consultar mientras construís o profundización opcional. Donde no tengo la URL
exacta al 100%, doy **autor + título** para que lo busques (no inventes que el link es ese).

## ★ Core (leé esto antes de tocar código)

1. **Pinecone Learn — "Hybrid search" y "Rerankers and Two-Stage Retrieval"**
   `pinecone.io/learn/` (busca esos dos artículos por título).
   La mejor explicación visual de por qué dense-only falla, cómo se combina con sparse, y el patrón
   retrieve-and-rerank (two-stage). Buscá: la intuición de bi-encoder vs cross-encoder y por qué el
   cross-encoder no escala para buscar. ~45 min los dos.

2. **Cohere — Rerank docs + "What is a reranker / semantic reranking"**
   `docs.cohere.com` (sección Rerank).
   La referencia operativa del reranker que vas a usar primero. Buscá: el shape de la API
   (`query` + `documents` → índices reordenados + `relevance_score`), `rerank-v3.5`, y el dato de
   cuánto sube recall/accuracy. ~30 min.

3. **Cormack, Clarke & Büttcher (2009) — "Reciprocal Rank Fusion outperforms Condorcet and
   individual Rank Learning Methods"** (SIGIR).
   El paper de RRF. Es corto. Buscá: la fórmula `Σ 1/(k + rank)`, por qué `k=60`, y el argumento
   de por qué fusionar por rank gana a fusionar por score. Leé al menos la sección de la fórmula
   y los resultados. ~30 min.

4. **modelcontextprotocol.io — spec + "Build an MCP server" (quickstart)**
   `modelcontextprotocol.io`
   La fuente oficial de MCP (Anthropic). Buscá: qué son Tools/Resources/Prompts, el quickstart de
   server en Python con `FastMCP`, y cómo se registra en Claude Desktop. ~45 min.

5. **Jason Liu (jxnl) — "Systematically Improving RAG" / el "RAG flywheel"**
   `jxnl.co` (su blog y la serie/curso de improving RAG).
   El marco mental de todo el módulo: no agregás técnicas porque suenan bien, las agregás porque
   *medís* que mejoran. Buscá: por qué medir recall antes de optimizar, y su take sobre cuándo
   hybrid/rerank/query-transforms valen la pena. ~40 min. **Leelo entendiendo que es lo que conecta
   M2 (harness) con M3 (técnicas).**

6. **Anthropic Engineering — "Writing effective tools for AI agents"**
   `anthropic.com/engineering/writing-tools-for-agents`
   La fuente de los 5 principios de tool design de §9: high leverage, namespacing, human-readable
   outputs, token efficiency, documentación clara. Leelo antes de publicar el MCP server. ~25 min.

7. **Jason Liu (jxnl) — Context Engineering Series (ago-2025)**
   `jxnl.co` — buscá "Context Engineering Series" (index 28-ago-2025); empezá con "Beyond Chunks:
   Why Context Engineering is the Future of RAG" (27-ago-2025) y "Why Grep Beat Embeddings in our
   SWE-bench Agent" (11-sep-2025).
   El marco de context engineering aplicado a RAG: faceted search para agentes y el caso empírico
   de grep vs embeddings en código. Son los dos conceptos nuevos de §8 (metadata-rich retrieval y
   retrieval heterogéneo). ~45 min entre los dos.

**Credencial gratuita del módulo:** Anthropic Academy ofrece "Introduction to MCP" y "MCP:
Advanced Topics" con certificado al completar — `anthropic.skilljar.com`. Los certificados son de
un frontier lab y son gratuitos. Al terminar M3 es el momento de hacerlos (cubren server en Python,
transporte stdio/HTTP, registro en Claude Desktop — todo lo que acabás de construir).

## Referencia (tené a mano mientras construís)

- **pgvector — README** — `github.com/pgvector/pgvector` — repasá operadores (`<=>`) e índices
  HNSW. Ya lo usaste en M0.
- **PostgreSQL — Full Text Search** — `postgresql.org/docs/current/textsearch.html` — `to_tsvector`,
  `plainto_tsquery`, `ts_rank`, índices GIN. La parte sparse de tu hybrid sin instalar nada.
- **ParadeDB `pg_search`** — `github.com/paradedb/paradedb` — si querés **BM25 real** dentro de
  Postgres (no solo `ts_rank`). Opcional; el curso arranca con `ts_rank`.
- **Cohere Python SDK** — `docs.cohere.com` — el cliente para `client.rerank(...)`.
- **`mcp` Python SDK (FastMCP)** — `github.com/modelcontextprotocol/python-sdk` — el SDK oficial
  para escribir el server con `@mcp.tool()`.
- **sentence-transformers — CrossEncoder** — `sbert.net` — para el reranker self-hosted
  (`bge-reranker-v2-m3`, `ms-marco-MiniLM-...`) cuando migres de Cohere.

## Deep dive (opcional, para defender mejor en system design)

- **Gao et al. (2022) — "Precise Zero-Shot Dense Retrieval without Relevance Labels" (HyDE)** —
  `arxiv.org/abs/2212.10496`. El paper de HyDE. Buscá: por qué embeber un documento hipotético
  matchea mejor que embeber la pregunta. Munición directa para §6.
- **Chip Huyen — "AI Engineering"** (O'Reilly, 2025). Para M3: el capítulo de **RAG y retrieval**
  (term-based vs embedding-based retrieval, reranking, query rewriting). La fuente de autoridad
  cuando te preguntan "¿de dónde sacaste esto?".
- **Robertson & Zaragoza (2009) — "The Probabilistic Relevance Framework: BM25 and Beyond"**. Si
  querés entender BM25 de verdad (los parámetros `k1`, `b`, el IDF). Denso; opcional.
- **DSPy — docs + paper "DSPy: Compiling Declarative LM Calls into Self-Improving Pipelines"**
  (Khattab et al.) — `dspy.ai`. Solo para el sidebar §8: qué es optimización programática de
  prompts. Nivel awareness; no hace falta construir nada.
- **Anthropic — "Introducing the Model Context Protocol"** (anuncio, nov 2024) + el registry de
  servers MCP. Contexto de mercado de por qué MCP creció tan rápido (§9).

## Cómo usar este material

Leé los ★ Core → escribí en tus palabras (en `DECISIONS.md` o un scratchpad) las respuestas a los
checkpoints de la lección, sobre todo **la fórmula de RRF** y **por qué el cross-encoder solo
rerankea**. Si podés explicar hybrid, RRF y el patrón retrieve-and-rerank *sin mirar*, y tenés
claro qué vas a medir con el harness de M2, estás listo para abrir `practica.md`.
