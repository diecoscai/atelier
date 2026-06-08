---
module: DSA
gate: pending
---

# Pruebas — DSA stream

El "test" del stream no es CI: son **mocks cronometrados con voz** y una autoevaluación honesta.

## Capa 1 — mocks (prueban que resolvés bajo presión)

Hacé al menos un mock por patrón. Reglas del mock: problema que **no viste antes**, timer de
30-40 min, narrás todo en voz alta (grabate o usá Claude/un amigo como entrevistador), tipeás en
un editor sin autocompletar la lógica.

- [ ] **Arrays / Hashing** — ej. "dos números que sumen al target", "subarray con suma K",
      "primer caracter no repetido". Resuelto en tiempo, con Big-O.
- [ ] **Two pointers** — ej. "container with most water", "3-sum", "¿es palíndromo?".
- [ ] **Sliding window** — ej. "substring sin caracteres repetidos más larga", "máximo de
      ventana de tamaño k".
- [ ] **Stacks / Queues** — ej. "paréntesis válidos", "siguiente temperatura mayor" (monotonic
      stack).
- [ ] **Trees / Graphs (BFS/DFS)** — ej. "número de islas" (grilla, BFS/DFS), "level-order
      traversal", "¿hay camino entre A y B?".
- [ ] **DP básico** — ej. "subir escaleras", "casas robadas (house robber)", "coin change".

## Capa 2 — autoevaluación (el HARD GATE del stream)

> Sé honesto: el objetivo es la ronda real, no tildar casillas.

1. **Por cada mock:** ¿lo resolviste **solo** y dentro del tiempo? Si no, queda re-agendado.
2. **Big-O al instante:** ¿pudiste dar tiempo y espacio sin dudar, y proponer una mejora cuando
   te lo pidieron?
3. **Voz:** ¿narraste el razonamiento de punta a punta, o caíste en el silencio? (el silencio
   pierde rondas).
4. **Reconocimiento de patrón:** ¿identificaste el patrón en los primeros minutos o te perdiste?
5. **Cobertura:** ¿hay algún patrón donde fallás sistemáticamente? Ese es tu foco de las próximas
   semanas.

**Gate (orientativo, no bloquea el curso):** considerás el stream "listo para entrevistar" cuando
hiciste un mock limpio de cada patrón, das Big-O al instante, y narrás sin trabarte. Hasta
entonces, seguí la cadencia de `practica.md`.
