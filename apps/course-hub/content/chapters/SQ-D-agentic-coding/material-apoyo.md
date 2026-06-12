---
module: SQ-D
---

# Material de apoyo — SQ-D (Agentic coding)

El material central son las prácticas publicadas por Boris Cherny y Anthropic. Los **★ Core**
son obligatorios antes de la práctica; el resto es para profundizar o para credenciales.

## ★ Core (leé esto antes de hacer la práctica)

1. **Boris Cherny — "Claude Code: Best practices for agentic coding"**
   `anthropic.com/engineering/claude-code-best-practices`
   La fuente primaria de esta side-quest. Documenta CLAUDE.md como contrato vivo, Plan Mode,
   verificación como palanca 2-3x, subagentes especializados, slash commands, hooks PostToolUse,
   permisos explícitos, y git worktrees. Leelo completo antes de la práctica.

2. **Boris Cherny — "How Boris Uses Claude Code" (107 tips, enero 2026)**
   `howborisusesclaudecode.com`
   Los 107 tips de uso real: 5 instancias en paralelo, el tip #1 de verificación, /loop para
   tareas de días, CLAUDE.md en git con contribuciones semanales del equipo. Leé al menos los
   primeros 30 tips antes de la práctica; el resto es consulta durante los módulos.

3. **Anthropic Academy — "Claude Code 101" y "Claude Code in Action"**
   `anthropic.skilljar.com` · `github.com/anthropics/courses`
   Dos cursos gratuitos con certificado. "Claude Code 101" cubre los fundamentos. "Claude Code
   in Action" cubre context management, hooks, y el Agent SDK. Son el complemento estructurado
   a las best practices de Cherny. Completar ambos da credencial verificable de Anthropic
   (gratuita) — hacélos durante la cursada, no al final.

## Referencia (tené a mano durante los módulos)

- **Anthropic — "2026 Agentic Coding Trends Report"**
  `resources.anthropic.com/2026-agentic-coding-trends-report`
  La fuente del delegation gap (60% uso / 0-20% delegación completa), del framing "engineer as
  orchestrator", y del caso Rakuten (run autónomo de 7 horas en codebase de 12.5M líneas).

- **OpenAI Codex — documentación y AGENTS.md**
  `developers.openai.com/codex` · `/codex/skills`
  El equivalente OpenAI: AGENTS.md como contrato del repo, plan mode, skills reutilizables,
  scoping. Codex corre sobre GPT-5.5 con entrenamiento agentic-first. Útil para entrevistas con
  stack OpenAI donde el lenguaje es distinto pero los conceptos son los mismos.

## Deep dive (opcional)

- **Andrej Karpathy — "Agentic engineering" (Sequoia Ascent, febrero 2026)**
  `karpathy.bearblog.dev/sequoia-ascent-2026`
  La cronología personal de Karpathy: de vibe coding a agentic engineering. Documenta la
  inflexión de diciembre 2025 y acuña la distinción: *"Vibe coding raises the floor. Agentic
  engineering is about extrapolating the ceiling."* También define el rol del engineer 2026:
  *"You are not writing code 99% of the time; you are orchestrating agents and acting as
  oversight."*

- **Anthropic — "How we built our multi-agent research system" (junio 2025)**
  `anthropic.com/engineering/multi-agent-research-system`
  El sistema multi-agente de Anthropic (lead agent + subagentes como filtros). Documenta el
  costo ~15x tokens vs single-agent, el umbral de mejora de calidad, y el patrón de task
  descriptions detalladas para subagentes. Útil para defender el trade-off en entrevistas.

- **Anthropic — "Building agents with the Claude Agent SDK" (2025-2026)**
  `anthropic.com/engineering/building-agents-with-the-claude-agent-sdk`
  El harness de dos agentes para long-running (initializer + worker, progress file + git como
  handoff), y el concepto de Agent Skills como packaging de expertise composable.

## Cómo usar este material

Leé las **best practices de Cherny** + los primeros 30 tips → hacé el Paso 1 (CLAUDE.md) y el
Paso 2 (hook) de la práctica → enrolate en Anthropic Academy y completá "Claude Code 101"
antes de M2 y "Claude Code in Action" antes de M6 → usá el Trends Report como referencia para
los drills de defensa → revisá Codex docs antes de M11 (packaging para el mercado).
