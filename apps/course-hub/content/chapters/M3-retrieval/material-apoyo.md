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

2. **Cohere — Rerank docs + changelog de Rerank 4**
   `docs.cohere.com/docs/rerank` y `docs.cohere.com/changelog/rerank-v4.0`.
   La referencia operativa del reranker que vas a usar primero. Buscá: el shape de la API
   (`query` + `documents` → índices reordenados + `relevance_score`), las dos variantes vigentes
   **`rerank-v4.0-pro`** (calidad, 32K tokens, 100+ idiomas) y **`rerank-v4.0-fast`** (latencia), y
   el dato de cuánto sube recall/accuracy. `rerank-v3.5` deja de recibir tráfico el **1-ago-2026** —
   no arranques un proyecto nuevo apuntando a esa versión. ~30 min.

3. **Cormack, Clarke & Büttcher (2009) — "Reciprocal Rank Fusion outperforms Condorcet and
   individual Rank Learning Methods"** (SIGIR).
   El paper de RRF. Es corto. Buscá: la fórmula `Σ 1/(k + rank)`, por qué `k=60`, y el argumento
   de por qué fusionar por rank gana a fusionar por score. Leé al menos la sección de la fórmula
   y los resultados. ~30 min.

4. **modelcontextprotocol.io — spec + "Build an MCP server" (quickstart)**
   `modelcontextprotocol.io/specification/2025-11-25` (spec estable vigente) +
   `blog.modelcontextprotocol.io` (changelog/roadmap).
   La fuente oficial de MCP (Anthropic). Buscá: qué son Tools/Resources/Prompts, el quickstart de
   server en Python con `FastMCP`, y cómo se registra en Claude Desktop. La spec se mueve rápido: el
   **28-jul-2026** sale una versión nueva que elimina el handshake `initialize`/`initialized` y pasa
   a un modelo *stateless* — dale una leída al post del blog aunque uses `FastMCP` (que abstrae la
   mayoría del cambio). ~45 min.

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

7. **Jason Liu (jxnl) — Context Engineering Series (ago-sep-2025)**
   `jxnl.co` — buscá "Context Engineering Series" (index 28-ago-2025); empezá con "Beyond Chunks:
   Why Context Engineering is the Future of RAG" (27-ago-2025) y "Why Grep Beat Embeddings in our
   SWE-bench Agent" (11-sep-2025). Seguí con los dos posts que matizan este último: "Why I Stopped
   Using RAG for Coding Agents (And You Should Too)" y "Rethinking RAG Architecture for the Age of
   Agents" (ambos 11-sep-2025) — el punto real no es "abandonar RAG" sino exponerlo como una tool
   que el agente invoca a discreción.
   El marco de context engineering aplicado a RAG: faceted search para agentes y el caso empírico
   de grep vs embeddings en código. Son los dos conceptos nuevos de §8 (metadata-rich retrieval y
   retrieval heterogéneo). Si querés seguir el hilo hasta 2026, Liu extendió esto al concepto de
   "agent peripheral vision" — awareness, no hace falta leerlo para cerrar el módulo. ~60 min entre
   los cuatro.

**Credencial gratuita del módulo:** Anthropic Academy ofrece "Introduction to MCP" y "MCP:
Advanced Topics" con certificado al completar — `anthropic.skilljar.com`. Los certificados son de
un frontier lab y son gratuitos. Al terminar M3 es el momento de hacerlos (cubren server en Python,
transporte stdio/HTTP, registro en Claude Desktop — todo lo que acabás de construir).

## Referencia (tené a mano mientras construís)

- **pgvector — README + CHANGELOG** — `github.com/pgvector/pgvector` — repasá operadores (`<=>`) e
  índices HNSW. Ya lo usaste en M0. Pineá `>=0.8.5` (compatible con Postgres 18; corrige un buffer
  overflow crítico que había en 0.8.1).
- **PostgreSQL — Full Text Search** — `postgresql.org/docs/current/textsearch.html` — `to_tsvector`,
  `plainto_tsquery`, `ts_rank`, índices GIN. La parte sparse de tu hybrid sin instalar nada. Versión
  estable actual: Postgres 18; ya hay Beta 1 de Postgres 19 (jun-2026), GA estimado fin de año.
- **ParadeDB `pg_search`** — `github.com/paradedb/paradedb` — si querés **BM25 real** dentro de
  Postgres (no solo `ts_rank`). Opcional; el curso arranca con `ts_rank`. Si tu Postgres es un
  proyecto nuevo en **Neon**: `pg_search` ya no está disponible ahí desde mar-2026 (los proyectos
  existentes lo conservan) — confirmá disponibilidad con tu proveedor antes de apoyarte en esto.
- **Cohere Python SDK** — `docs.cohere.com` — el cliente para `client.rerank(...)`. Usalo contra
  `rerank-v4.0-fast` o `rerank-v4.0-pro`, no `v3.5` (se apaga 1-ago-2026).
- **`mcp` Python SDK (FastMCP)** — `github.com/modelcontextprotocol/python-sdk` y
  `gofastmcp.com/updates` — el SDK oficial para escribir el server con `@mcp.tool()`. Ojo: hay dos
  paquetes distintos migrando en paralelo — el `fastmcp` standalone de PrefectHQ (pineá `>=3.4`, la
  3.0 estable de feb-2026 rediseñó la arquitectura interna en Components/Providers/Transforms) y el
  SDK oficial `mcp` de Anthropic, que lanzó una **v2.0 beta (30-jun-2026) renombrando `FastMCP` a
  `MCPServer`** para alinearse con el spec stateless del 28-jul-2026. Pineá `mcp>=1,<2` hasta que la
  v2 sea estable.
- **Alternativas de reranker self-hosted (2026)** — más allá de `bge-reranker-v2-m3`: `Qwen3-Reranker`
  (0.6B/4B/8B), `Jina Reranker v2`, `ZeroEntropy zerank-2` (multilingüe, ~40x más barato que Cohere)
  y `KaLM-Reranker-V1` (arxiv, jun-2026). Vale un benchmark rápido contra tu golden set antes de
  asumir que `bge-reranker-v2-m3` sigue siendo la mejor opción.
- **sentence-transformers — CrossEncoder** — `sbert.net` (y su `migration_guide.html`) — para el
  reranker self-hosted (`bge-reranker-v2-m3`, `ms-marco-MiniLM-...`) cuando migres de Cohere. Pineá
  `sentence-transformers>=5.6` — la v5.4 modularizó `CrossEncoder` (rerankers generativos vía
  `LogitScore`, Flash Attention 2 sin padding).

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
  (Khattab et al.) — `dspy.ai`. Solo para el sidebar §8b: qué es optimización programática de
  prompts. Nivel awareness; no hace falta construir nada. Si querés ver hasta dónde maduró: la
  serie 3.x adoptó **GEPA** (`dspy.ai/api/optimizers/GEPA/overview`) como optimizer central —
  vale una mirada rápida al overview aunque no lo uses en M3.
- **Anthropic — "Introducing the Model Context Protocol"** (anuncio, nov 2024) + el
  **MCP Registry** (`registry.modelcontextprotocol.io`, en preview desde sep-2025, API en v0.1) —
  la vía recomendada para publicar tu server. Contexto de mercado de por qué MCP creció tan rápido
  (§9). El cliente de referencia sigue siendo Claude Desktop, pero para 2026 conviene saber que
  Cursor, Cline (VS Code, open-source) y Windsurf también son clientes MCP viables si querés
  demostrar tu server en más de un lugar. Anthropic también sumó el **Claude Desktop Extensions
  Directory** (`anthropic.com/engineering/desktop-extensions`) — instalación en un click de servers
  revisados por Anthropic, across Claude.ai/Desktop/Mobile/Code — como capa curada sobre el registry
  crudo.

## Cómo usar este material

Leé los ★ Core → escribí en tus palabras (en `DECISIONS.md` o un scratchpad) las respuestas a los
checkpoints de la lección, sobre todo **la fórmula de RRF** y **por qué el cross-encoder solo
rerankea**. Si podés explicar hybrid, RRF y el patrón retrieve-and-rerank *sin mirar*, y tenés
claro qué vas a medir con el harness de M2, estás listo para abrir `practica.md`.
