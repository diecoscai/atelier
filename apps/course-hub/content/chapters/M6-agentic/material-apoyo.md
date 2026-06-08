---
module: M6
---

# Material de apoyo — M6

Curado y ordenado. No leas todo: los **★ Core** son obligatorios antes de la práctica; la
**Referencia** la tenés a mano mientras construís el grafo; el **Deep dive** es para defender
mejor en system design (sobre todo reasoning-RAG y agent-eval, que son las preguntas filosas).

## ★ Core (leé esto antes de tocar código)

1. **Anthropic — "Building Effective Agents"**
   `anthropic.com/engineering/building-effective-agents`
   *La* referencia conceptual del módulo. Buscá: la distinción **workflow vs agent**, el principio
   "empezá simple, subí complejidad solo cuando la medís necesaria", y los patrones (prompt
   chaining, routing, orchestrator-workers). Es la munición exacta para tu defense drill
   "agent vs chain". ~40 min. **Leelo primero.**

2. **LangGraph — docs oficiales (langchain-ai)**
   `langchain-ai.github.io/langgraph/`
   Buscá: el concepto de **StateGraph** (state tipado con `TypedDict`), `add_node` / `add_edge` /
   **`add_conditional_edges`**, `START`/`END`, `compile()`, y el tutorial de agentic RAG /
   self-RAG (el del retrieve → grade → generate con loop). Es la API que vas a escribir. ~1h
   leyendo + probando.

3. **Yao et al. — "ReAct: Synergizing Reasoning and Acting in Language Models"** (2022)
   `arxiv.org/abs/2210.03629`
   El patrón base del loop de agente. Buscá: el ciclo **Thought → Action → Observation** y por qué
   acoplar reasoning y acting reduce alucinación vs cada uno por separado. No necesitás todo el
   paper; entendé la figura del loop y el intuition. ~30 min.

4. **Anthropic — "Effective Context Engineering for AI Agents"**
   `anthropic.com/engineering/effective-context-engineering-for-ai-agents`
   Para la Sección 7. Buscá: por qué el contexto es un **presupuesto finito** que se administra,
   el "context rot"/degradación con contexto largo, y las técnicas (compactación/compresión,
   selección, aislamiento por sub-agente). Context engineering como disciplina nombrada. ~40 min.

## Referencia (tené a mano mientras construís el grafo)

- **LangGraph — multi-agent / supervisor** — en las docs de langchain-ai, la sección de
  *multi-agent systems* (supervisor pattern). Para el graft de los 2 agentes (retriever + answer).
  Buscá cómo se pasa state entre subgrafos.
- **LangGraph — agentic RAG tutorial** (notebook `langgraph_agentic_rag` / `langgraph_self_rag`).
  El ejemplo canónico de `agent → retrieve → grade → generate` con `tools_condition` y
  `add_conditional_edges`. Tu grafo de la práctica es una variante de este.
- **DeepEval — métricas de agente** — `docs.confident-ai.com` (DeepEval, ya lo usás de M2). Buscá:
  **Tool Correctness** y las métricas de **trajectory / task completion**. Es el harness por el que
  ruteás la trajectory eval (Sección 9).
- **RAGAS — agent / multi-turn metrics** — `docs.ragas.io`. Buscá: las métricas de uso de tools y
  goal accuracy para agentes. Comparalas con DeepEval (igual que comparaste en M2).
- **LangSmith — agent evaluation / trajectory** — la doc de LangChain sobre evaluar trajectories
  (`exact match`, `in-order`, `any-order`, LLM-as-judge sobre el camino). El vocabulario de los 3
  tipos de match de la Sección 9 sale de acá.

## Deep dive (opcional, para defender mejor en system design)

- **Chip Huyen — "AI Engineering"** (O'Reilly, 2025). El capítulo de **agents** (planning, tool
  use, failure modes, evaluación de agentes). La fuente de autoridad cuando te preguntan "¿de
  dónde sacaste esto?". Para M6 leé agents + el material de evaluación aplicado a agentes.

- **Cognition — "Don't Build Multi-Agents"**
   `cognition.ai/blog/dont-build-multi-agents`
   El contrapunto que necesitás para defender *cuándo NO* multi-agent (Sección 6). Argumenta que
   los sistemas multi-agente con contexto fragmentado son frágiles y que un agente bien armado con
   buen context engineering suele ganar. Leelo para no caer en el hype de "más agentes = mejor".

- **Reasoning-RAG / agentic RAG (awareness para la Sección 8).** El campo se mueve rápido y no
  quiero mandarte a una URL que cambie. Buscá por título/autor en arXiv y quedate con la idea, no
  con un número de paper que no recuerdo con certeza:
  - *Search-R1* y *DeepRetrieval* — líneas de trabajo (2025) sobre entrenar/usar el reasoning del
    modelo para **dirigir la búsqueda** (retrieval-as-tool guiado por RL/reasoning). Es la
    encarnación de "System 2 RAG".
  - *"Agentic RAG: A Survey"* — survey reciente que mapea routing, multi-hop, retrieval iterativo y
    self-reflection sobre el espectro chain↔agent. Bueno para el vocabulario.
  - **Honestidad:** no cito un arXiv ID exacto acá porque no lo tengo con certeza y **inventar un
    ID es peor que no darlo**. Buscá los títulos; si algún número no matchea, descartalo.

- **Liu et al. — "Lost in the Middle"** (`arxiv.org/abs/2307.03172`, ya citado en M0). Releelo
  desde la óptica de M6: es la justificación empírica de la palanca de **orden** en context
  engineering (Sección 7) — el modelo ignora el medio del contexto, así que lo importante va a los
  bordes.

## Cómo usar este material

Leé los ★ Core en orden (Anthropic agents → LangGraph → ReAct → Anthropic context) → escribí en
`DECISIONS.md` tu posición sobre "agent vs chain para Grounded" y la entry de reasoning-RAG
*antes* de construir → recién ahí abrí `practica.md`. Si podés explicar, sin mirar, por qué un
agente es sobre-ingeniería para una FAQ y cómo evaluarías su trayectoria, estás listo.
