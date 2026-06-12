---
module: SQ-D
feature: CLAUDE.md + hook + workflow plan→ejecutar→verificar en Grounded
repo: Grounded (el repo del producto real)
---

# Práctica — agentic coding aplicado a Grounded

Estos pasos se hacen sobre el repo real de Grounded, no en un sandbox. Cada uno produce un
artefacto que queda en el repo y que podés mostrar en una entrevista. El orden importa: cada
paso construye sobre el anterior.

> El "verificar" de cada paso no es "el agente terminó" — es que entendés por qué tomaste cada
> decisión y podés defenderla. Ese es el gate.

---

## Paso 1 — CLAUDE.md del proyecto

**Hacer:** creá (o completá) `CLAUDE.md` en la raíz del repo de Grounded con las convenciones
del proyecto. Incluí al menos:

- Cómo correr el servidor de desarrollo y los tests (`npm run dev`, `pytest`, lo que aplique).
- El path de la feature principal que estás construyendo en el módulo actual.
- Los antipatrones documentados: qué patterns NO usar (por ejemplo, si ya decidiste en M3 que
  no usás naive chunking, documentalo).
- Un ADR de referencia: la decisión de arquitectura más importante que tomaste hasta ahora.
- Convenciones de nombres: cómo se llaman los archivos, los módulos, las variables de entorno.

**Verificar:** abrí una nueva sesión de Claude Code (sin contexto previo) y pedile que te
explique cómo está estructurado el proyecto. Si puede contestar correctamente a partir del
CLAUDE.md, el archivo cumple su función. Si necesita hacer preguntas que el CLAUDE.md debería
responder, lo completás antes de seguir.

> Antipatrón a evitar: CLAUDE.md de 400 líneas que nadie lee. Si el tuyo tiene más de 100
> líneas, revisá qué puede ir en un slash command o en la task description de una sesión
> específica.

---

## Paso 2 — Hook de lint/format

**Hacer:** configurá un PostToolUse hook en Claude Code que corra tu linter o formatter
(ruff, eslint, prettier — lo que uses en Grounded) automáticamente después de cada write.

El hook va en la configuración de Claude Code (`.claude/settings.json` o el equivalente de
tu instalación). El comando debe correr el linter sobre el archivo que el agente acaba de
escribir y fallar si hay errores — no silenciar los errores.

**Verificar:** pedile a Claude Code que escriba una función con un estilo de indentación
incorrecto deliberadamente. El hook debe correrlo y reportar el error antes de que el agente
continúe. Si el agente puede escribir código mal formateado sin que el hook se dispare, el hook
no está configurado correctamente.

> Por qué esto importa: si el linter está en el prompt o en CLAUDE.md, el agente puede
> ignorarlo. Si está en el hook, no tiene opción. El determinismo es el punto.

---

## Paso 3 — Slash command para tu inner loop

**Hacer:** creá al menos un slash command para el inner loop más repetido en tu trabajo en
Grounded. Ejemplos:

- `/review-chunk`: dado un archivo de ingestion, verificá que el chunking produce chunks del
  tamaño correcto y sin cortes en medio de una oración.
- `/run-evals`: corré el eval harness de M2 y mostrá los resultados en formato tabla.
- `/check-retrieval`: dado un query, mostrá los top-5 resultados del retrieval con sus scores.

El slash command va en `.claude/commands/` como un archivo markdown con la instrucción.

**Verificar:** el comando corre de punta a punta sin intervención manual. Si requiere pasos
manuales intermedios, simplificá la tarea hasta que pueda correr sin ellos, o dividila en
subcomandos.

---

## Paso 4 — Feature con Plan Mode + subagente + verificación

**Hacer:** elegí una feature pequeña del módulo actual (no la feature principal — algo
autocontenido: una función de utilidad, un endpoint nuevo, un refactor de 1-2 archivos) y
completala usando el flujo completo:

1. **Plan Mode**: pedile a Claude Code que investigue el codebase y arme un plan antes de
   escribir código. Revisá el plan: ¿elige el lugar correcto para la feature? ¿la abstracción
   tiene sentido? ¿hay dependencias que no vio? Aprobá o pedí revisiones antes de salir del
   modo.
2. **Ejecutar con subagente especializado**: cuando el plan esté aprobado, lancá la
   implementación con `"use subagents"` al final del request si la tarea tiene partes
   independientes (por ejemplo, implementación + tests). El agente principal queda limpio; el
   subagente hace el trabajo.
3. **Verificación**: antes de aceptar el resultado, corré los tests del proyecto. Si el agente
   no tiene un mecanismo de verificación automática, configuralo (un script que corre los tests
   y le pasa el resultado de vuelta). Rechazá outputs que no pasen la verificación.

**Verificar:** el diff final es limpio (sin código de debug, sin TODOs sin resolver, sin
console.logs). Los tests pasan. Podés explicar por qué el agente eligió la implementación que
eligió — si no sabés, no aceptás el output todavía.

---

## Paso 5 — Ronda de entrevista AI-assisted simulada

**Hacer:** simulá una ronda de entrevista AI-assisted. El protocolo:

1. Elegí un problema de coding de mediana complejidad relacionado con Grounded (por ejemplo:
   implementar un algoritmo de RRF para combinar resultados de búsqueda, o escribir un
   evaluador de chunks que detecte cortes en medio de oraciones).
2. Usá Claude Code para resolverlo — con el flujo completo: CLAUDE.md activo, Plan Mode,
   verificación.
3. Documentá cada decisión a medida que avanzás: por qué usaste Plan Mode antes de ejecutar,
   por qué elegiste ese subagente, cómo validaste el output.
4. Al terminar, pedile a Claude Code que haga de interviewer y te pregunte sobre las
   decisiones. Respondé sin mirar el doc de decisiones.

Las preguntas que un interviewer real va a hacer (ver `criterios-defensa.md`):
- ¿Por qué usaste el agente para esta parte y no la otra?
- ¿Cómo validaste que el output es correcto?
- ¿Qué habrías hecho diferente si el agente hubiera cometido un error en el paso 2?
- ¿Cómo le explicás esta arquitectura de decisiones a un compañero que no usó el agente?

**Verificar:** respondés todas las preguntas sin mirar las notas. Si no podés defender una
decisión, es porque no la tomaste vos — la tomó el agente y la aceptaste sin procesar. Rehacé
ese paso.

---

## Definición de "hecho" (SQ-D)

✅ `CLAUDE.md` en git con convenciones reales del proyecto · ✅ Hook de lint/format corriendo en
PostToolUse · ✅ Al menos un slash command para el inner loop · ✅ Una feature completada con
Plan Mode + subagente + verificación · ✅ Ronda simulada completada y podés defender cada
decisión sin mirar. → marcás el gate de la side-quest.

> El gate no es que "usaste el agente" — es que podés explicar cómo y por qué, decisión por
> decisión. Eso es lo que evalúan Canva y Google en sus rondas de agentic coding proficiency.
