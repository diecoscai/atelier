---
module: SQ-D
title: Agentic coding — el ingeniero como orchestrator
concept: CLAUDE.md, Plan Mode, verificación, subagentes, hooks, delegation gap
kind: side-quest
duration: ~4-6h lectura + práctica distribuida en cada módulo
when: M0 → M11 (se practica en cada módulo, no bloquea)
---

# SQ-D — Agentic coding (el ingeniero como orchestrator)

> **Qué vas a saber al terminar:** usar Claude Code con estrategia en lugar de hacerlo al
> azar — CLAUDE.md como contrato vivo, Plan Mode para no resolver el problema equivocado,
> verificación como palanca de calidad, subagentes especializados, hooks deterministas, y cómo
> defender cada decisión en una ronda de entrevista AI-assisted. Esto no es teoría: es la
> práctica que el mercado ya evalúa explícitamente en hiring (Canva jun-2025, piloto Google
> Q2-2026).

---

## Por qué esta side-quest existe

El Anthropic Agentic Coding Trends Report 2026 lo mide: los devs usan AI en aproximadamente
el 60% de su trabajo, pero delegan completamente solo el 0-20% de las tareas. Ese spread es el
**delegation gap** — la distancia entre lo que el agente podría hacer solo y lo que vos le
dejás hacer. Cerrarlo es exactamente lo que el mercado llama "engineer as orchestrator".

No se cierra con más contexto en el prompt. Se cierra con un sistema: CLAUDE.md que define el
contrato del proyecto, Plan Mode que separa planificación de ejecución, verificación que le da
al agente un mecanismo para iterar hasta que el resultado es excelente, y hooks que fuerzan lo
que DEBE pasar sin depender de una instrucción que se puede ignorar.

Esto **corre en paralelo desde M0 hasta M11**: cada módulo es una oportunidad de aplicar estas
prácticas al producto real (Grounded). Al terminar el curso, las vas a tener internalizadas, no
memorizadas.

---

## 1. El delegation gap y el cambio de rol

En 2026 el ingeniero no escribe todo el código: diseña sistemas, descompone tareas, evalúa
calidad, y coordina agentes. Ese es el rol que el Anthropic Trends Report 2026 describe como
"engineer as orchestrator": el agente hace el trabajo incremental; el engineer decide qué
delegar, cómo verificar, y cuándo rechazar.

El dato de Karpathy lo ilustra con una cronología personal: en noviembre de 2025 seguía
escribiendo ~80% del código él mismo. En diciembre de 2025 hubo una inflexión: empezó a delegar
~80% a agentes. En febrero de 2026, en el evento Sequoia Ascent, documentó el cambio de
posición: el vibe coding (escribir código sin mirar demasiado) es el pasado; lo que viene es
agentic engineering — con quality gates, oversight, y spec writing. La cita: *"Vibe coding
raises the floor. Agentic engineering is about extrapolating the ceiling."*

La misma transición la describe desde el lado de herramientas: Boris Cherny (autor de Claude
Code) publica en enero 2026 sus 107 tips de uso real, corriendo 5 instancias de Claude Code en
paralelo (5 checkouts) más 5-10 sesiones en claude.ai/code. El tip #1 es consistente con lo
que documenta en las best practices oficiales: darle al agente una forma de verificar su propio
output es la palanca más grande de calidad.

En el mercado: Canva desde junio 2025 espera que los candidatos usen Copilot, Cursor o Claude
en las rondas de coding. Google piloteó una ronda con Gemini en Q2-2026. Lo que evalúan no es
si usás la herramienta — es si sabés usar la herramienta con estrategia: validar el output,
debuggear outputs multi-step, ensamblar contexto. No aceptar el output crudo es un criterio
explícito.

---

## 2. CLAUDE.md — el contrato vivo del proyecto

CLAUDE.md es el archivo de instrucciones que Claude Code lee al arrancar. Boris Cherny lo
describe como un **contrato vivo**: cuando el agente se equivoca en algo recurrente, no
repetís la instrucción — actualizás el CLAUDE.md para que ese error no se repita.

Las prácticas documentadas:

- **El equipo lo mantiene en git** — contribuciones varias veces por semana, no es un archivo
  estático que escribe uno solo.
- **Antipatrón: sobreespecificar** — si es demasiado largo, las reglas importantes se pierden
  en el ruido. CLAUDE.md largo ≠ mejor; es más probable que el agente ignore secciones enteras.
- **Qué va adentro**: convenciones del proyecto (paths, nombres, patterns), qué NO hacer
  (antipatrones documentados), cómo correr tests, referencias a ADRs críticos.
- **Qué NO va adentro**: instrucciones de una sola vez, contexto de una tarea específica, todo
  lo que se resuelve mejor con un slash command o una instrucción en el prompt de esa sesión.

El análogo en el ecosistema OpenAI es AGENTS.md — mismo concepto, misma función, distinto
nombre. Codex (que corre sobre GPT-5.5) lo usa como punto de entrada para entender el repo
antes de ejecutar cualquier tarea.

---

## 3. Plan Mode — separar planificación de ejecución

Plan Mode es una configuración de Claude Code que le indica al agente que investigue el
problema y arme un plan *antes* de escribir código. Cherny lo define con una frase directa: es
para no resolver el problema equivocado.

El mecanismo: en Plan Mode el agente puede leer archivos, explorar el codebase, hacer preguntas
de clarificación — pero no puede escribir ni ejecutar. Cuando el plan está aprobado, salís del
modo y ejecutás.

Por qué importa: los errores más costosos de un agente de coding no son bugs de implementación
— son haber implementado lo que no se pidió, o haber elegido la abstracción equivocada. Un
agente que ejecuta directamente sobre un prompt ambiguo va a hacer algo plausible pero incorrecto.
Plan Mode fuerza una parada antes de esa bifurcación.

Codex tiene el equivalente: OpenAI Builder Bootcamp lo enseña explícitamente como parte del
flujo de Codex (tarea en lenguaje natural → plan → sandbox → edición multi-archivo → tests →
PR).

---

## 4. Verificación — la palanca de calidad 2-3x

La cita de Cherny en las best practices oficiales de Anthropic: *"Giving Claude a way to verify
its work is probably the most important thing to get great results."* En los 107 tips de enero
2026, el tip #1 es exactamente eso: el agente que puede verificar itera hasta que el resultado
es excelente.

Qué cuenta como verificación:

- **Tests que el agente puede correr** — el loop más poderoso: escribe código, corre los tests,
  lee el resultado, corrige, repite. Sin esto el agente hace un intento y para.
- **Scripts de validación** — para casos donde no hay tests de unit, un script que comprueba
  el output (formato, rango de valores, ausencia de errores) es suficiente para el loop.
- **Screenshots** — para UI, capturar el estado visual y pasárselo al agente como feedback.
- **Evaluadores LLM** — para tareas de calidad abierta, un prompt de evaluación estructurado
  que el agente puede lanzar sobre su propio output.

El patrón opuesto: "hacé X" sin mecanismo de verificación → el agente hace algo razonable,
para, y te devuelve el resultado. Si el resultado está mal, reiniciás desde cero. Con
verificación, el agente itera hasta que el criterio pasa.

---

## 5. Subagentes especializados

El ecosistema de subagentes de Cherny: corre 5 instancias de Claude Code en paralelo, una por
checkout. Cada instancia puede lanzar subagentes propios. El principio que documenta: los
**subagentes especializados superan a los genéricos**.

El ejemplo que usa: un "diff reviewer para rate limiter" supera a un "qa agent" genérico porque
tiene contexto específico sobre qué clase de errores buscar. El subagente especializado puede
tener su propio CLAUDE.md o instrucciones de tarea, sabe qué herramientas usar, y tiene un
criterio de éxito claro.

El paper de arquitectura multi-agente de Anthropic (jun-2025) cuantifica el costo: el sistema
multi-agente de research superó al agente single Opus 4 en su eval interno, pero a un costo
de ~15x tokens. El cálculo que hay que hacer: ¿la mejora de calidad justifica el costo? Para
una tarea crítica (diff review antes de un deploy), casi siempre. Para un one-off, quizás no.

El patrón de tarea description que documenta Anthropic: objetivo explícito, formato de output
esperado, herramientas disponibles, límites. Los subagentes sin task description detallada
duplican trabajo o dejan gaps.

El comando: `"use subagents"` al final de cualquier request le indica a Claude Code que use
más compute lanzando subagentes para esa tarea. El contexto principal queda limpio.

---

## 6. Slash commands — packaging de expertise

Los slash commands son shortcuts reutilizables que viven en git y el equipo comparte. Cherny
los recomienda para **inner loops repetidos**: el flujo de code review, el chequeo de formato
antes de un commit, el ciclo de correr tests y leer el resultado.

En el Claude Agent SDK, esto se generaliza como **Agent Skills**: carpetas de instrucciones y
scripts con progressive disclosure. El skill encapsula expertise composable — la misma idea
que un slash command pero con más estructura para casos de uso complejos.

El /loop command que menciona Cherny: corre tareas autónomas de hasta 3 días, con el agente
verificando y corrigiendo de forma continua.

---

## 7. Hooks — determinismo sobre instrucciones

La distinción que hace Cherny es limpia: lo que DEBE pasar siempre (lint, format, seguridad,
tests) no va en el prompt — va en un hook. Los prompts se pueden ignorar, malinterpretar, o
quedar desactualizados. Los hooks son deterministas.

PostToolUse es el hook más útil: se dispara cada vez que el agente escribe o ejecuta algo, y
puede correr verificaciones o transformaciones automáticas sobre el resultado. Un hook de lint
que corre después de cada write garantiza que el código queda bien formateado sin que el agente
tenga que recordarlo.

La diferencia con una instrucción en CLAUDE.md: si "siempre corrés `ruff format` antes de
commitear" está en CLAUDE.md, el agente puede olvidarlo, saltárselo cuando está apresurado, o
interpretarlo de forma distinta en un contexto nuevo. Si está en un PostToolUse hook, corre
siempre, independientemente del estado del agente.

---

## 8. Permisos explícitos y git worktrees

Los permisos en Claude Code van en `/permissions`, no en `--dangerously-skip-permissions`. La
diferencia: skip-permissions deshabilita todas las verificaciones; permissions explícitos
declaran exactamente qué puede tocar el agente. Es una decisión de seguridad y de documentación
del sistema.

Para paralelismo con aislamiento, Cherny usa **git worktrees**: cada instancia de Claude Code
trabaja en su propio checkout del repo. Así varios agentes pueden trabajar en paralelo sobre
el mismo codebase sin pisarse los archivos. Cuando la tarea termina, el worktree se mergea o
descarta.

El patrón Anthropic para tareas long-running (documentado en el Agent SDK): harness de dos
agentes con initializer + worker. El initializer establece el estado y los artefactos de
handoff (progress file + git history). El worker toma eso y continúa. Rakuten corrió una
feature compleja en un codebase de 12.5M líneas con un run autónomo de 7 horas usando este
patrón.

---

## 9. Lo que tenés que poder defender (ver `criterios-defensa.md`)

- El delegation gap: por qué el 60% con 0-20% de delegación completa es el problema.
- Por qué verificación es la palanca más grande de calidad (la cita de Cherny).
- La diferencia entre una instrucción en CLAUDE.md y un hook.
- Cuándo lanzar un subagente especializado vs hacerlo en el agente principal.
- Cómo defender cada decisión en una ronda AI-assisted (no alcanza con usar la herramienta).

Seguí con `material-apoyo.md` (best practices de Cherny + Anthropic Academy) y después
`practica.md` (aplicar al repo de Grounded paso a paso).
