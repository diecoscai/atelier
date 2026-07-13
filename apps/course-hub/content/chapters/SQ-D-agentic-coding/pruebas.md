---
module: SQ-D
gate: pending
---

# Pruebas — SQ-D (Agentic coding)

Esta side-quest tiene una capa de artefactos verificables y una capa de drills de defensa.
Ambas son necesarias para marcar el gate.

## Capa 1 — artefactos en el repo (verificación mecánica)

Chequeá que los siguientes archivos existen y funcionan antes de pasar a la capa 2:

- [ ] `CLAUDE.md` existe en la raíz del repo de Grounded y tiene al menos: cómo correr tests,
  una convención de paths, un antipatrón documentado, y referencia a un ADR.
- [ ] `.claude/settings.json` (o equivalente) tiene configurado un PostToolUse hook que corre
  el linter/formatter del proyecto.
- [ ] El hook corre de verdad: pedile a Claude Code que escriba una línea con indentación
  incorrecta y verificá que el hook la reporta como error.
- [ ] Al menos un slash command existe en `.claude/commands/` y corre de punta a punta sin
  intervención manual.
- [ ] Hay un commit (o PR) de una feature completada con el flujo plan→ejecutar→verificar
  documentado en el mensaje de commit o en un ADR.

## Capa 2 — defense drills (el HARD GATE)

> No marcás el gate hasta responder esto **en voz alta, sin mirar**. Claude puede hacer de
> interviewer.

1. **"¿Qué es el delegation gap y por qué existe?"** — Tenés que llegar al ~60% de uso / 0-20%
   de delegación completa (Anthropic Trends Report 2026) y explicar por qué cerrarlo requiere
   un sistema (no más contexto en el prompt).

2. **"¿Por qué dice Cherny que la verificación es lo más importante?"** — Articulá el loop:
   agente con mecanismo de verificación → itera → resultado excelente. Agente sin mecanismo →
   hace un intento → para. Cita la fuente si te la piden — ya sea la frase original ("Giving
   Claude a way to verify its work is probably the most important thing...") o la versión
   vigente hoy en la página oficial de best practices ("Give Claude a check it can run...").

3. **"¿Cuándo ponés algo en un hook y cuándo en CLAUDE.md?"** — Lo que DEBE pasar sin
   excepción (lint, format, tests) va en hook porque es determinista. Las convenciones y
   contexto que el agente necesita saber van en CLAUDE.md.

4. **"En la ronda que hiciste, ¿por qué usaste el agente para esa parte y no la otra?"** —
   Esto es específico a tu práctica. Si no podés explicar la decisión, es que no la tomaste vos.

5. **"¿Cómo validaste que el output del agente era correcto antes de aceptarlo?"** — Nombrá el
   mecanismo concreto que usaste: tests que corriste, el script de verificación, el review del
   diff. "Se veía bien" no es un mecanismo.

6. **"¿Cuándo NO delegarías a un agente?"** — Cuando la verificación es costosa o ambigua;
   cuando el agente no tiene contexto suficiente para hacer buenas decisiones; cuando el costo
   en tokens (~15x para multi-agente) no está justificado por la mejora de calidad.

7. **"¿Qué diferencia hay entre CLAUDE.md y AGENTS.md?"** — Mismo concepto (contrato vivo del
   repo), distintos ecosistemas: Claude Code / Anthropic usa CLAUDE.md; Codex / OpenAI usa
   AGENTS.md.

**Gate:** marcalo cuando (a) los 5 artefactos de la Capa 1 existen y funcionan, y (b)
respondiste los 7 drills sin mirar.
