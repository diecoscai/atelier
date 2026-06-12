---
module: M6
---

# Material de apoyo — M6

Curado y ordenado. No leas todo: los **★ Core** son obligatorios antes de la práctica; la
**Referencia** la tenés a mano mientras construís el grafo; el **Deep dive** es para defender
mejor en system design (sobre todo reasoning-RAG y agent-eval, que son las preguntas filosas).

## ★ Core (leé esto antes de tocar código)

1. **Anthropic — "Building Effective Agents"**
   `anthropic.com/research/building-effective-agents`
   *La* referencia conceptual del módulo. Buscá: la distinción **workflow vs agent**, los **5
   patterns** (Prompt Chaining · Routing · Parallelization sectioning+voting · Orchestrator-Workers
   · Evaluator-Optimizer), el principio "empezá simple, subí complejidad solo cuando la medís
   necesaria", y "the most successful implementations weren't using complex frameworks". Es la
   munición exacta para tus defense drills. ~40 min. **Leelo primero.**

2. **Anthropic — "How we built our multi-agent research system"**
   `anthropic.com/engineering/multi-agent-research-system`
   Lead agent + subagentes; task descriptions detalladas; 90.2% de mejora sobre single-agent
   Opus 4; costo ~15x tokens. La fuente de los datos de economía multi-agente de la sección 5c.
   Buscá: qué hizo la diferencia (task descriptions) y cómo justifican el costo. ~30 min.

3. **Anthropic — "Effective Context Engineering for AI Agents"**
   `anthropic.com/engineering/effective-context-engineering-for-ai-agents`
   Las 4 estrategias canónicas (offload static · retrieve JIT · isolate per task · compress
   history), la definición exacta de context engineering, y por qué es el "#1 job" de 2025-2026.
   Para las secciones 5b y 8. ~40 min.

4. **LangGraph — docs oficiales (langchain-ai)**
   `langchain-ai.github.io/langgraph/`
   Buscá: **StateGraph** (state tipado con `TypedDict`), `add_node` / `add_edge` /
   **`add_conditional_edges`**, `START`/`END`, `compile()`, y el tutorial de agentic RAG /
   self-RAG (retrieve → grade → generate con loop). Es la API que vas a escribir. ~1h leyendo +
   probando. Leelo después de los tres de arriba — el framework se entiende mejor cuando ya sabés
   qué problema resuelve.

5. **Yao et al. — "ReAct: Synergizing Reasoning and Acting in Language Models"** (2022)
   `arxiv.org/abs/2210.03629`
   El patrón base del loop de agente. Buscá: el ciclo **Thought → Action → Observation** y por qué
   acoplar reasoning y acting reduce alucinación vs cada uno por separado. ~30 min.

## Referencia (tené a mano mientras construís el grafo)

- **LangGraph — multi-agent / supervisor** — en las docs de langchain-ai, la sección de
  *multi-agent systems* (supervisor pattern). Para el graft de los 2 agentes (retriever + answer).
  Buscá cómo se pasa state entre subgrafos.
- **LangGraph — agentic RAG tutorial** (notebook `langgraph_agentic_rag` / `langgraph_self_rag`).
  El ejemplo canónico de `agent → retrieve → grade → generate` con `tools_condition` y
  `add_conditional_edges`. Tu grafo de la práctica es una variante de este.
- **DeepEval — métricas de agente** — `docs.confident-ai.com` (DeepEval, ya lo usás de M2). Buscá:
  **Tool Correctness** y las métricas de **trajectory / task completion**. Es el harness por el que
  ruteás la trajectory eval / trace grading (Sección 10).
- **RAGAS — agent / multi-turn metrics** — `docs.ragas.io`. Buscá: las métricas de uso de tools y
  goal accuracy para agentes. Comparalas con DeepEval.
- **LangSmith — agent evaluation / trajectory** — la doc de LangChain sobre evaluar trajectories
  (`exact match`, `in-order`, `any-order`, LLM-as-judge sobre el camino). El vocabulario de los 3
  tipos de match de la Sección 10 sale de acá.
- **Claude Agent SDK** — `anthropic.com/engineering/building-agents-with-the-claude-agent-sdk`.
  Para el awareness de la Sección 10b: harness initializer+worker, Agent Skills, arquitectura
  brain/hands/session. No hace falta implementarlo; buscá el patrón de long-running agent.
- **OpenAI Agents SDK** — `openai.github.io/openai-agents-python/`. Para el awareness de la
  Sección 10b: handoffs, guardrails in/out, sessions (SQLite/Redis), tracing by default.
  ~20 min revisando los ejemplos.

## Deep dive (opcional, para defender mejor en system design)

- **Chip Huyen — "AI Engineering"** (O'Reilly, 2025). El capítulo de **agents** (planning, tool
  use, failure modes, evaluación de agentes). La fuente de autoridad cuando te preguntan "¿de
  dónde sacaste esto?". Para M6 leé agents + el material de evaluación aplicado a agentes.

- **Cognition — "Don't Build Multi-Agents"**
   `cognition.ai/blog/dont-build-multi-agents`
   El contrapunto que necesitás para defender *cuándo NO* multi-agent (Sección 7). Argumenta que
   los sistemas multi-agente con contexto fragmentado son frágiles y que un agente bien armado con
   buen context engineering suele ganar. Leelo para no caer en el hype de "más agentes = mejor".

- **HuggingFace Agents Course** — `huggingface.co/learn/agents-course`
   Curso gratis con certificado. Cubre agent loops, tool use, multi-agent, y los frameworks
   populares (incluyendo LangGraph). El certificado es credencial gratuita para el módulo —
   hacelo en paralelo con la práctica o después de cerrar el gate. ~10-15h.

- **Anthropic — "Effective Harnesses for Long-Running Agents"**
   `anthropic.com/engineering/effective-harnesses-for-long-running-agents`
   Para el harness engineering (Sección 5.4): patrón initializer+worker, artefactos de handoff
   (progress file + git history), prompts estratificados por fase. Lectura de awareness; no es
   código obligatorio del módulo. ~20 min.

- **Reasoning-RAG / agentic RAG (awareness para la Sección 9).** El campo se mueve rápido; buscá
  por título en arXiv y quedate con la idea, no con un número de paper:
  - *Search-R1* y *DeepRetrieval* — retrieval-as-tool guiado por reasoning. Es "System 2 RAG".
  - *"Agentic RAG: A Survey"* — vocabulario de routing, multi-hop, retrieval iterativo.
  - **Honestidad:** no cito arXiv IDs exactos porque **inventar uno es peor que no darlo**.

- **Liu et al. — "Lost in the Middle"** (`arxiv.org/abs/2307.03172`, ya citado en M0). Releelo
  desde la óptica de M6: justificación empírica de la palanca de **orden** en context engineering.

- **Karpathy — "LLM Wiki" (concepto)** (`aicritique.org`, 8-may-2026). El patrón de memoria
  navegable markdown vs embedding search. Para el sidebar de la Sección 10c.

## Cómo usar este material

Leé los ★ Core en orden (Anthropic agents → multi-agent research → context engineering →
LangGraph → ReAct) → escribí en `DECISIONS.md` tu posición sobre "agent vs chain para Grounded"
y la entry de reasoning-RAG *antes* de construir → recién ahí abrí `practica.md`. Si podés
explicar, sin mirar, los 5 patterns de Anthropic, por qué un agente es sobre-ingeniería para una
FAQ, y cómo evaluarías la trayectoria de un agente con 4 tool calls, estás listo.
