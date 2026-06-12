# Anthropic engineering: prácticas publicadas para AI Engineers — junio 2026

> Research 2026-06-12. Agente: research-anthropic (sonnet). Fuentes primarias de anthropic.com/engineering, Boris Cherny y Anthropic Academy.

## Fuentes y puntos clave

### 1. "Claude Code: Best practices for agentic coding" — Boris Cherny (~abr 2025)
https://www.anthropic.com/engineering/claude-code-best-practices

- **CLAUDE.md como contrato vivo**: reglas del proyecto; cuando Claude se equivoca, se actualiza CLAUDE.md para que no se repita. Antipatrón: sobreespecificar (si es muy largo, las reglas importantes se pierden en el ruido).
- **Plan Mode antes de ejecutar**: separar investigación/planificación de implementación para no resolver el problema equivocado.
- **Verificación = palanca de calidad 2-3x**: *"Giving Claude a way to verify its work is probably the most important thing to get great results"* — tests, scripts, screenshots como feedback loop.
- **Subagentes especializados > genéricos**: "diff reviewer para rate limiter" supera a "qa agent".
- **Slash commands** para inner loops repetidos, en git, compartidos por el equipo.
- **Hooks para determinismo**: lo que DEBE pasar siempre (formato, lint, seguridad) va en hook, no en instrucción. PostToolUse es el más útil.
- **Permisos explícitos** (`/permissions`) en vez de `--dangerously-skip-permissions`.
- **Git worktrees** para paralelismo de agentes con aislamiento.

### 2. "How Boris Uses Claude Code" (ene 2026, 107 tips)
https://howborisusesclaudecode.com/

- Corre 5 instancias de Claude Code en paralelo (5 checkouts) + 5-10 sesiones en claude.ai/code.
- "Append 'use subagents' to any request where you want Claude to throw more compute" — los subagentes mantienen limpio el contexto principal.
- CLAUDE.md único del equipo en git, contribuciones varias veces por semana.
- `/loop` para tareas autónomas de hasta 3 días.
- El tip #1: dar al agente forma de verificar su output — con eso itera hasta que el resultado es excelente.

### 3. "Building Effective Agents" (dic 2024)
https://www.anthropic.com/research/building-effective-agents

- **Workflows vs agents**: rutas de código predefinidas vs LLM que decide sus pasos.
- **Los 5 patterns** (dominio obligatorio): Prompt Chaining · Routing · Parallelization (sectioning + voting) · Orchestrator-Workers · Evaluator-Optimizer.
- **Simplicidad sobre frameworks**: *"The most successful implementations weren't using complex frameworks"* — empezar con la API directa.
- Agentes para tareas difíciles de especificar pero fáciles de verificar.
- Augmentations del LLM base: retrieval, tools, memory.

### 4. "How we built our multi-agent research system" (jun 2025)
https://www.anthropic.com/engineering/multi-agent-research-system

- Lead agent + subagentes como filtros inteligentes; task descriptions detalladas (objetivo, formato de output, herramientas, límites) o los agentes duplican trabajo / dejan gaps.
- Multi-agent superó 90.2% a single-agent Opus 4 en su eval interno; costo ~15x tokens — el trade-off hay que justificarlo.

### 5. "Effective context engineering for AI agents" (2025)
https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

- Definición: *"the smallest possible set of high-signal tokens that maximize the likelihood of some desired outcome"*.
- Context engineering = "#1 job of engineers building AI agents" desde mediados de 2025; el contexto inflado es el "silent killer of agent reliability".
- 4 estrategias: offload static · retrieve just-in-time · isolate per task (subagentes) · compress history (compaction).
- Long-horizon: compaction, structured note-taking, multi-agent. Tool results pueden consumir >50K tokens.

### 6. "Building agents with the Claude Agent SDK" (2025-2026)
https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk

- Agent SDK (ex Claude Code SDK) potencia casi todos los agent loops internos de Anthropic; uso más allá de coding.
- Harness de 2 agentes para long-running: initializer + worker, con `claude-progress.txt` + git history como handoff.
- **Agent Skills**: carpetas de instrucciones/scripts con progressive disclosure — packaging de expertise composable.
- Arquitectura Managed Agents: brain (modelo+harness) / hands (sandbox+tools) / session (event log) desacoplados.

### 7. "Writing effective tools for AI agents" (2025)
https://www.anthropic.com/engineering/writing-tools-for-agents

- Tools = *"contracts between deterministic systems and non-deterministic agents"*.
- Más tools ≠ mejor; no wrappear endpoints sin valor agentivo.
- 5 principios: high leverage · clear namespacing · human-readable outputs · token efficiency · documentación clara.
- Proceso: Prototype → Evaluate (con el modelo real) → Collaborate.

### 8. "Effective harnesses for long-running agents" (2025)
https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents

- Problema: cero memoria entre sesiones → artefactos de handoff (progress file + git) y prompts estratificados por fase (initializer vs worker).

### 9. "2026 Agentic Coding Trends Report" (Q1-Q2 2026)
https://resources.anthropic.com/2026-agentic-coding-trends-report

- **Delegation Gap**: devs usan AI en ~60% del trabajo pero delegan completamente solo 0-20% de tareas.
- El ingeniero se vuelve **orchestrator**: diseño de sistemas, coordinación de agentes, evaluación de calidad, descomposición estratégica.
- Long-running en producción: Rakuten — feature compleja en codebase de 12.5M líneas, run autónomo de 7 horas.
- 27% del trabajo asistido por AI es trabajo incremental que no se habría hecho.

### 10. Anthropic Academy (lanzada 2-mar-2026; 17 cursos a may 2026)
https://anthropic.skilljar.com/ · https://github.com/anthropics/courses

| Track | Cursos |
|---|---|
| Developer Deep-Dives | Claude API · Building MCP Servers (Python, desde cero) · Claude Code 101 · Claude Code in Action (context mgmt, hooks, Agent SDK) |
| Foundational | Introduction to Subagents · Prompt Engineering Interactive Tutorial |
| AI Fluency | AI Capabilities and Limitations |

Certificados gratuitos al completar. Competencias certificables: tool use, MCP servers, context management, subagentes, hooks, Agent SDK.

## Competencias que Anthropic considera núcleo en 2026 (consolidado)

1. **Context engineering** — CLAUDE.md vivo, retrieval just-in-time, compaction, aislamiento por subagente. El "#1 job".
2. **Arquitecturas multi-agente** — los 5 patterns + jerarquías lead/subagent con task descriptions detalladas.
3. **Feedback loops y verificación** — auto-verificación del agente (tests/scripts/evaluators) = calidad 2-3x.
4. **Tool design para consumidores no deterministas** — 5 principios, evaluación empírica.
5. **Agentes long-running** — harnesses initializer/worker, artefactos de handoff.
6. **Plan Mode** — separación planificación/ejecución.
7. **Hooks y automatización determinista** — guardrails en el lifecycle, no en el prompt.
8. **Orquestación paralela con worktrees**.
9. **Agent Skills y slash commands** — packaging de expertise, progressive disclosure.
10. **Model routing y economía agentiva** — modelo más barato que sirva; justificar el ~15x de multi-agente con mejora medible.

## Implicación para Atelier (preliminar)

- M6 (agentic) debe enseñar los 5 patterns por nombre y el trade-off workflow-vs-agent ANTES de LangGraph ("simplicidad sobre frameworks").
- Falta en el curriculum: **agentic coding como práctica diaria** (CLAUDE.md, Plan Mode, verificación, subagentes, hooks) — es la competencia que el Trends Report 2026 llama "engineer as orchestrator".
- Tool design (fuente 7) es contenido nuevo para M3/M6 (el MCP server de M3 debería aplicar los 5 principios).
- Context engineering merece nombre propio en el curriculum (hoy implícito).
- Anthropic Academy mapea 1:1 con módulos (MCP→M3, subagents→M6) como credencial gratuita.
