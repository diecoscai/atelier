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
   qué problema resuelve. **Nota de currency:** LangChain/LangGraph llegaron a v1.0 el 22-oct-2025
   (LangGraph está en 1.2.x a jul-2026), con compromiso de estabilidad hasta 2.0. El prebuilt
   `create_react_agent` y `AgentExecutor` quedaron deprecados en favor de `create_agent` del
   paquete `langchain` — si tutoriales viejos los usan, no los repliques. `StateGraph` a mano
   (lo que construís en este módulo) sigue siendo la API estable de fondo.

5. **Yao et al. — "ReAct: Synergizing Reasoning and Acting in Language Models"** (2022)
   `arxiv.org/abs/2210.03629`
   El patrón base del loop de agente. Buscá: el ciclo **Thought → Action → Observation** y por qué
   acoplar reasoning y acting reduce alucinación vs cada uno por separado. ~30 min.

## Referencia (tené a mano mientras construís el grafo)

- **LangGraph — multi-agent / supervisor** — en las docs de langchain-ai, la sección de
  *multi-agent systems* (supervisor pattern). Para el graft de los 2 agentes (retriever + answer).
  Buscá cómo se pasa state entre subgrafos.
- **Mem0 — "State of AI Agent Memory 2026"** `mem0.ai/blog/state-of-ai-agent-memory-2026`. El
  mapa de mercado citado en la Sección 6b: ~41K stars, ~186M API calls en Q3-2025, y dónde se
  ubican LangMem, Letta y Zep respecto a Mem0. Buscá también el vocabulario de memoria en capas
  (working / episodic / semantic / procedural).
- **LangMem — docs oficiales** `langchain-ai.github.io/langmem/`. La extensión de LangGraph para
  memoria cross-session (Sección 6b). Buscá cómo se integra con el `StateGraph` que ya usás y qué
  agrega sobre el checkpointer nativo.
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
- **Claude Agent SDK** — `anthropic.com/engineering/building-agents-with-the-claude-agent-sdk` +
  `platform.claude.com/docs/en/agents-and-tools/agent-skills/overview` (Agent Skills, con
  paquetes pre-armados xlsx/docx/pptx/pdf). Para el awareness de la Sección 10b: harness
  initializer+worker, Agent Skills, arquitectura brain/hands/session. Nota de currency: desde
  15-jun-2026 el uso del SDK (y de Claude Code GitHub Actions) se factura separado del uso
  interactivo de Claude Code. No hace falta implementarlo; buscá el patrón de long-running agent.
  Ojo con "Skills": hay dos superficies distintas con el mismo nombre — en la Messages API
  (`container.skills` + code execution tool) son paquetes pre-armados; en Managed Agents y en el
  Agent SDK son carpetas con `SKILL.md` propio y disclosure progresivo. El Agent SDK usa el
  segundo modelo — no confundas los dos cuando lo cites.
- **OpenAI Agents SDK** — `openai.github.io/openai-agents-python/`. Para el awareness de la
  Sección 10b: handoffs, guardrails in/out, sessions (SQLite/Redis), tracing por defecto (revisá
  vos mismo la página de tracing del SDK — no queda explícito si el destino por defecto es el
  dashboard de OpenAI o requiere wiring a OTel). ~20 min revisando los ejemplos.

## Deep dive (opcional, para defender mejor en system design)

- **Chip Huyen — "AI Engineering"** (O'Reilly, 2025). El capítulo de **agents** (planning, tool
  use, failure modes, evaluación de agentes). La fuente de autoridad cuando te preguntan "¿de
  dónde sacaste esto?". Para M6 leé agents + el material de evaluación aplicado a agentes.

- **Cognition — "Don't Build Multi-Agents"** (`cognition.com/blog/dont-build-multi-agents` — el
   dominio migró de `cognition.ai` a `cognition.com`) **+ el follow-up "Multi-Agents: What's
   Actually Working"** (`cognition.com/blog/multi-agents-working`). El primero es el contrapunto
   que necesitás para defender *cuándo NO* multi-agent (Sección 7): sistemas multi-agente con
   contexto fragmentado son frágiles y un agente bien armado con buen context engineering suele
   ganar. El segundo es necesario para no presentar la postura de Cognition como estática: la
   matizaron después, y Devin (su producto) sumó orquestación manager/multi-agente en mar-2026.
   Leé los dos juntos para no caer ni en el hype de "más agentes" ni en el dogma opuesto.

- **HuggingFace Agents Course** — `huggingface.co/learn/agents-course`
   Curso gratis con certificado. Cubre agent loops, tool use, multi-agent, y los frameworks
   populares (incluyendo LangGraph). El certificado es credencial gratuita para el módulo —
   hacelo en paralelo con la práctica o después de cerrar el gate. ~10-15h.

- **Anthropic — "Effective Harnesses for Long-Running Agents"** (nov-2025)
   `anthropic.com/engineering/effective-harnesses-for-long-running-agents`
   **+ su continuación, "Harness Design for Long-Running Application Development"** (mar-2026)
   `anthropic.com/engineering/harness-design-long-running-apps`. Para el harness engineering
   (Sección 5.4): patrón initializer+worker (el segundo doc lo formaliza como
   initializer-agent/coding-agent), artefactos de handoff (progress file + git history), prompts
   estratificados por fase. Lectura de awareness; no es código obligatorio del módulo. ~30 min
   los dos.

- **Reasoning-RAG / agentic RAG (awareness para la Sección 9).** El campo se mueve rápido; un
  paper sí tiene ID exacto y verificable:
  - **"RAG over Thinking Traces Can Improve Reasoning Tasks"** (arXiv:2605.03344, 2026) —
    recuperar trazas de razonamiento en vez de documentos crudos mejora tareas de razonamiento.
    Citalo con confianza, es el más concreto de esta lista.
  - Para el resto — *Search-R1*, *DeepRetrieval*, *"Agentic RAG: A Survey"* — buscá por título en
    arXiv y quedate con la idea, no con un número de paper. **Honestidad:** no cito sus IDs
    exactos porque **inventar uno es peor que no darlo**; la nomenclatura de estos papers cambia
    rápido y no confirmé sus IDs actuales.

- **Liu et al. — "Lost in the Middle"** (`arxiv.org/abs/2307.03172`, ya citado en M0). Releelo
  desde la óptica de M6: justificación empírica de la palanca de **orden** en context engineering.
  Nota 2026: investigación posterior muestra que modelos reasoning-heavy son *más* sensibles al
  ruido posicional en el contexto recuperado, no menos — el hallazgo de 2023 se agrava, no se
  resuelve, con razonamiento activo (ver el paper de arXiv:2605.03344 arriba).

- **Karpathy — "LLM Wiki" (concepto)**. Fuente primaria: el Gist público de Karpathy (4-abr-2026)
  describiendo compilación incremental de fuentes en un wiki markdown persistente, guiado por un
  archivo de esquema (ej. `CLAUDE.md`/`AGENTS.md`). Fuente secundaria/resumen:
  `aicritique.org` (8-may-2026). Citá el Gist si podés encontrarlo — es más trazable que el
  resumen. Hay un concepto derivado, "Self-Organizing Wiki", que agrega descubrimiento
  estructural/asociativo encima; awareness extra, no imprescindible. Para el sidebar de la
  Sección 10c.

## Cómo usar este material

Leé los ★ Core en orden (Anthropic agents → multi-agent research → context engineering →
LangGraph → ReAct) → escribí en `DECISIONS.md` tu posición sobre "agent vs chain para Grounded"
y la entry de reasoning-RAG *antes* de construir → recién ahí abrí `practica.md`. Si podés
explicar, sin mirar, los 5 patterns de Anthropic, por qué un agente es sobre-ingeniería para una
FAQ, y cómo evaluarías la trayectoria de un agente con 4 tool calls, estás listo.
