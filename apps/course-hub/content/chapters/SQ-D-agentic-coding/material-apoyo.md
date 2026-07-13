---
module: SQ-D
---

# Material de apoyo — SQ-D (Agentic coding)

El material central son las prácticas publicadas por Boris Cherny y Anthropic. Los **★ Core**
son obligatorios antes de la práctica; el resto es para profundizar o para credenciales.

## ★ Core (leé esto antes de hacer la práctica)

1. **Anthropic — "Claude Code: Best practices"** (originalmente post de Boris Cherny, reescrito
   como página de producto en 2026)
   `code.claude.com/docs/en/best-practices` (el link viejo `anthropic.com/engineering/claude-code-best-practices`
   redirige acá — Anthropic migró la documentación de ingeniería a este dominio durante 2026)
   La fuente primaria de esta side-quest. Documenta CLAUDE.md como contrato vivo, Plan Mode,
   verificación como palanca 2-3x, subagentes especializados, slash commands, hooks (PostToolUse
   y Stop), permisos explícitos, git worktrees, y dos conceptos más nuevos que vale la pena
   revisar: **auto mode** (clasificador que aprueba solo acciones de bajo riesgo, alternativa a
   permisos exhaustivos o a `--dangerously-skip-permissions`) y **agent teams** (coordinación
   automática de varias sesiones, un paso más allá de correr instancias en paralelo a mano).
   Leelo completo antes de la práctica.

2. **Boris Cherny — "How Boris Uses Claude Code"**
   `howborisusesclaudecode.com`
   Documento vivo sin fecha de corte fija: arrancó en enero 2026 con 107 tips y hoy (jul-2026)
   ya son 118+. El contenido central no cambió: 5 instancias en paralelo, el tip #1 de
   verificación, /loop para tareas de días, CLAUDE.md en git con contribuciones semanales del
   equipo. Leé al menos los primeros 30 tips antes de la práctica; el resto es consulta durante
   los módulos.

3. **Anthropic Academy — "Claude Code 101" y "Claude Code in Action"**
   `anthropic.skilljar.com/claude-code-101` · `anthropic.skilljar.com/claude-code-in-action`
   Dos cursos gratuitos con certificado, alojados en Skilljar (la plataforma de Anthropic
   Academy). Ojo: no son lo mismo que `github.com/anthropics/courses` — ese repo tiene otros 5
   notebooks sobre la API de Claude (prompt engineering, tool use, evals) sin contenido de Claude
   Code, así que no lo busques ahí. "Claude Code 101" cubre los fundamentos. "Claude Code in
   Action" cubre context management, hooks, y el Agent SDK. Son el complemento estructurado a las
   best practices oficiales. Completar ambos da credencial verificable de Anthropic (gratuita) —
   hacélos durante la cursada, no al final.

## Referencia (tené a mano durante los módulos)

- **Anthropic — "2026 Agentic Coding Trends Report"**
  `resources.anthropic.com/2026-agentic-coding-trends-report`
  La fuente del delegation gap (60% uso / 0-20% delegación completa), del framing "engineer as
  orchestrator", y del caso Rakuten (run autónomo de 7 horas sobre vLLM, que Anthropic reporta
  oficialmente como un codebase de 12.5M líneas). Análisis técnicos independientes calculan que
  vLLM completo ronda las 600k líneas — unas 20 veces menos —, así que conviene citar el caso con
  esa salvedad sobre la escala si te lo piden en una entrevista.

- **OpenAI Codex — documentación y AGENTS.md**
  `learn.chatgpt.com/docs` · `/docs/build-skills`
  (las URLs viejas `developers.openai.com/codex` y `/codex/skills` redirigen acá — OpenAI
  migró su documentación de developers a este dominio "ChatGPT Learn" durante 2026)
  El equivalente OpenAI: AGENTS.md como contrato del repo, plan mode, skills reutilizables,
  scoping. El modelo debajo de Codex cambia rápido — GPT-5.4 (mar-2026) → GPT-5.5 (abr-2026) →
  familia GPT-5.6 "Sol/Terra/Luna" (GA 9-jul-2026, tres tiers: Sol flagship, Terra intermedio,
  Luna rápido/económico, a $5/$30, $2.50/$15 y $1/$6 por millón de tokens input/output) — y en
  jul-2026 Codex se integró como modo dedicado dentro de la nueva app de escritorio de ChatGPT,
  junto a Chat y Work. No memorices qué modelo corre hoy: el patrón (AGENTS.md como contrato,
  plan→sandbox→edición→tests→PR) es lo estable. Útil para entrevistas con stack OpenAI donde el
  lenguaje es distinto pero los conceptos son los mismos.

## Deep dive (opcional)

- **Andrej Karpathy — "Agentic engineering" (Sequoia AI Ascent, abril 2026)**
  `karpathy.bearblog.dev/sequoia-ascent-2026`
  La cronología personal de Karpathy: de vibe coding a agentic engineering. Documenta la
  inflexión de diciembre 2025 y acuña la distinción: *"Vibe coding raises the floor. Agentic
  engineering is about extrapolating the ceiling."* También define el rol del engineer 2026:
  *"You are not writing code 99% of the time; you are orchestrating agents and acting as
  oversight."* Nota para los drills de defensa: Karpathy se unió a Anthropic en mayo 2026 para
  liderar research de pre-entrenamiento — al citarlo, aclará que ya no es un observador 100%
  externo al ecosistema Claude cuando te pregunten por sesgo de la fuente.

- **Anthropic — "How we built our multi-agent research system" (junio 2025)**
  `anthropic.com/engineering/multi-agent-research-system`
  El sistema multi-agente de Anthropic (lead agent + subagentes como filtros). Documenta el
  costo ~15x tokens vs single-agent, el umbral de mejora de calidad, y el patrón de task
  descriptions detalladas para subagentes. Útil para defender el trade-off en entrevistas.

- **Anthropic — "Building agents with the Claude Agent SDK" (2025-2026)**
  `anthropic.com/engineering/building-agents-with-the-claude-agent-sdk`
  El harness de dos agentes para long-running (initializer + worker, progress file + git como
  handoff), y el concepto de Agent Skills como packaging de expertise composable. Si este link
  no resuelve, buscá el título en `claude.com/blog` — Anthropic viene migrando activamente
  documentación de `anthropic.com/engineering/*` hacia `code.claude.com/docs/en/*` (para Claude
  Code) o `claude.com/blog/*` (para posts de ingeniería) durante 2026. Aplica a cualquier link
  `anthropic.com/engineering/*` que veas en el resto del curso, no solo a este.

## Cómo usar este material

Leé las **best practices oficiales** (antes post de Cherny, hoy página de producto) + los
primeros 30 tips de "How Boris Uses Claude Code" → hacé el Paso 1 (CLAUDE.md) y el Paso 2
(hook) de la práctica → enrolate en Anthropic Academy y completá "Claude Code 101" antes de
M2 y "Claude Code in Action" antes de M6 → usá el Trends Report como referencia para los
drills de defensa → revisá Codex docs antes de M11 (packaging para el mercado).
