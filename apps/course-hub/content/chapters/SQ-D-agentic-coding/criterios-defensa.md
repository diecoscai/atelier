---
module: SQ-D
---

# Criterios de defensa — SQ-D (Agentic coding)

Al terminar la side-quest tenés que poder, en el nivel honesto indicado:

## can-explain

- **(can-explain)** Qué es el **delegation gap** según el Anthropic Trends Report 2026: los devs
  usan AI en ~60% del trabajo pero delegan completamente solo el 0-20%. Por qué ese spread
  existe y qué lo cierra (sistema: CLAUDE.md + Plan Mode + verificación + hooks).

- **(can-explain)** Por qué la **verificación multiplica la calidad 2-3x**: un agente con
  mecanismo de verificación itera hasta que el criterio pasa; sin él, hace un intento y para.
  Articularlo con la cita original de Cherny: *"Giving Claude a way to verify its work is
  probably the most important thing to get great results."* — o con la versión que hoy aparece
  en la página oficial de best practices: *"Give Claude a check it can run: tests, a build, a
  screenshot to compare. It's the difference between a session you watch and one you walk away
  from."*

- **(can-explain)** La diferencia entre una instrucción en CLAUDE.md y un hook. CLAUDE.md se
  puede ignorar; un PostToolUse hook corre siempre. Lo que DEBE pasar sin excepción va en hook,
  no en prompt.

- **(can-explain)** Por qué subagentes especializados superan a los genéricos: el "diff
  reviewer para rate limiter" de Cherny tiene contexto específico, sabe qué buscar, tiene un
  criterio de éxito claro. Un "qa agent" genérico no tiene ninguna de esas ventajas. El costo:
  ~15x tokens según el sistema multi-agente de Anthropic — hay que justificarlo con mejora
  medible. La guía actual también describe **agent teams** (coordinación automática de varias
  sesiones) como la evolución de correr instancias en paralelo a mano.

- **(can-explain)** La cronología de Karpathy: vibe coding (feb-2025, picar código sin mirar
  demasiado) → "básicamente no funcionaban antes de diciembre" (nov-2025: ~80% código propio) →
  inflexión (dic-2025: ~80% delegado a agentes) → agentic engineering (Sequoia AI Ascent,
  abril-2026). La cita: *"Vibe coding raises the floor. Agentic engineering is about
  extrapolating the ceiling."* Matiz para la ronda de entrevista: Karpathy se unió a Anthropic
  en mayo-2026 — no lo cites como observador puramente externo si te preguntan por sesgo de la
  fuente.

## can-build

- **(can-build)** CLAUDE.md del proyecto real (Grounded): convenciones, antipatrones, cómo
  correr tests, referencia a ADRs. Longitud razonable (no sobreespecificado). En git.

- **(can-build)** Un PostToolUse hook que corra lint/format automáticamente después de cada
  write del agente.

- **(can-build)** Un slash command para el inner loop más repetido del trabajo en Grounded.

- **(can-build)** El flujo completo plan→ejecutar→verificar para una feature: Plan Mode activo,
  subagente lanzado con `"use subagents"`, verificación con tests antes de aceptar el resultado.

## can-defend

- **(can-defend)** Cuándo delegar a un agente vs hacerlo a mano: las tareas difíciles de
  especificar pero fáciles de verificar (definición de Anthropic en "Building Effective Agents")
  son candidatas naturales para delegación. Si la verificación es costosa o ambigua, la
  delegación completa es riesgosa.

- **(can-defend)** Cómo validás el output de un agente en una entrevista: no aceptar el output
  crudo — correr los tests, revisar el diff, entender por qué el agente tomó cada decisión. Si
  no podés explicar el código que el agente escribió, no lo aceptás.

- **(can-defend)** CLAUDE.md vs AGENTS.md: mismo concepto (contrato vivo del repo), distinto
  ecosistema (Anthropic/Claude Code vs OpenAI/Codex). Si te preguntan en una entrevista con
  stack OpenAI, el equivalente es AGENTS.md. No hace falta saber qué modelo corre detrás de
  Codex en un momento dado — cambia cada ~2 meses (GPT-5.4 → 5.5 → familia 5.6) —, sí el patrón.

- **(can-defend)** Por qué Plan Mode reduce errores costosos: los errores más caros de un agente
  de coding son haber implementado lo que no se pidió o elegido la abstracción incorrecta. Plan
  Mode fuerza una parada antes de esa bifurcación.

- **(can-defend)** El caso Rakuten (7 horas autónomas sobre vLLM) es un ejemplo oficial de
  Anthropic, pero la cifra de tamaño del codebase que reporta (12.5M líneas) está en disputa
  pública: análisis independientes calculan que vLLM completo ronda las 600k líneas, ~20 veces
  menos. Si te lo preguntan, citá el resultado (run autónomo de 7 horas, feature completada) con
  esa salvedad sobre la escala en vez de repetir el número sin matiz — eso es justamente "no
  aceptar el output crudo" aplicado a una fuente, no solo a código de agente.
