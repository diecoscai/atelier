---
module: DSA
feature: plan de práctica de coding round (NO es un feature de producto)
repo: ninguno — es un plan de estudio con tracking propio
---

# Práctica — el plan del stream DSA

Esto **no es construir una feature**. Es un **plan de práctica** sostenido: qué patterns, en qué
orden, a qué cadencia, cuántos problemas, y cómo trackear el progreso. Arranca en M4 y corre en
paralelo hasta las entrevistas, sin bloquear nada.

## Pre-requisitos
- Elegiste tu columna vertebral en `material-apoyo.md` (Grind75 **o** NeetCode 150 + roadmap).
- Una cuenta de LeetCode.
- Un lugar para trackear (una tabla en Notion/sheet, o un `dsa-log.md`).

---

## La cadencia (regla de oro: baja y constante)
- **3-4 problemas por semana**, sostenidos. Es mejor que 30 en un finde y nada por un mes.
- ~30-45 min por problema. Si te trabás >25 min: leé la solución, **entendela**, y reagéndalo
  para re-resolverlo en 3-4 días (repetición espaciada).
- **No bloquea el checkpoint M4** ni ningún módulo. Si una semana el curso te come, hacés 1-2 y
  seguís. La consistencia importa más que el volumen semanal.

## El orden de patterns (de M4 hacia adelante)
Seguí el orden del roadmap de NeetCode / la dificultad de Grind75. Una secuencia razonable:

1. **Semanas 1-2 — Arrays / Hashing.** El patrón más frecuente; arrancá acá.
2. **Semanas 3-4 — Two pointers + Sliding window.** Las optimizaciones O(n²)→O(n) más comunes.
3. **Semanas 5-6 — Stacks / Queues.** Paréntesis, "siguiente mayor", monotonic stack.
4. **Semanas 7-9 — Trees / Graphs (BFS/DFS).** El bloque más grande; tomate más tiempo.
5. **Semanas 10-12 — DP básico.** El más difícil; recursión + memo antes de tablas.

Por cada patrón: 1 problema *aprendiendo* (con solución a la vista) → 3-5 *practicando* (solo, con
timer) → re-resolvé los que fallaste.

## El loop por problema (cada vez)
1. Leé y **aclará supuestos** (como si hubiera un entrevistador).
2. Decí la fuerza bruta y su Big-O **antes** de optimizar.
3. Nombrá el patrón, codeá explicando en voz alta (sí, hablando solo — entrenás la ronda real).
4. Verificá con un ejemplo a mano y dá el Big-O final.
5. **Logueá** (ver tracking).

## Tracking (qué anotar por problema)
Una fila por intento en tu `dsa-log.md` / tabla:

| Fecha | Problema | Patrón | ¿Resuelto solo? | Tiempo | Big-O | Re-agendar |
|---|---|---|---|---|---|---|
| ... | Two Sum | Arrays/Hashing | sí | 12 min | O(n)/O(n) | no |

- **Marcá los que NO resolviste solos** → esos vuelven en 3-4 días.
- Revisá la columna "Patrón" cada par de semanas: ¿hay un patrón donde fallás seguido? Reforzalo.
- Meta orientativa antes de entrevistar: ~60-80 problemas con buena cobertura de los 6 patterns,
  pudiendo resolver un medium "fresco" de cada uno en tiempo.

## Cuándo "endurecer" el stream
A medida que se acercan entrevistas reales, pasá de práctica relajada a **mocks cronometrados con
voz** (ver `pruebas.md`): problema random, timer de 30-40 min, narrando todo, como en vivo.

---

## Definición de "en curso / listo" (DSA)
Esto no se "termina" como un módulo; se mantiene. Señales de que estás listo para la ronda:
✅ Cadencia sostenida (no abandonaste) · ✅ Cobertura de los 6 patterns en tu log · ✅ Resolvés un
medium fresco de cada patrón en ~30 min explicando · ✅ Das Big-O al instante · ✅ Hiciste al menos
unos mocks cronometrados con voz.
