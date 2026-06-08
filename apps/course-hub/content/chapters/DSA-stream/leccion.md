---
module: DSA
title: Cómo encarar el coding round (y los patterns que importan)
concept: Patterns de DSA, complejidad Big-O, comunicación en la entrevista
kind: stream (pista paralela, no módulo de producto)
duration: continuo — desde M4 hasta las entrevistas (no bloquea)
when: arranca en M4, corre en paralelo
---

# DSA — el stream de prep para el coding round

> **Qué es esto:** NO es un módulo de producto. Es una **pista paralela de práctica** para la
> ronda de **coding/DSA**, que aparece en ~75% de los loops de AI Engineer. Corre en paralelo
> desde M4 hasta las entrevistas, con tracking aparte, **sin bloquear** el avance del curso.

---

## Por qué este stream existe

Por más que tu producto sea impecable, en ~3 de cada 4 loops vas a tener una ronda de **coding
en vivo** (LeetCode-style): un problema de algoritmos, 30-45 min, vos tipeando mientras explicás.
Es un filtro independiente del system design. No lo podés improvisar el día antes — se entrena
con repetición espaciada a lo largo de semanas. Por eso es un *stream*: cadencia baja y constante
desde M4, no un sprint.

La buena noticia: el coding round de entrevista **no** te pide inventar algoritmos nuevos. Te pide
**reconocer patrones**. Casi todo problema cae en uno de ~8 patrones; si los reconocés, sabés por
dónde atacar.

---

## 1. Cómo se ve (y cómo se gana) un coding round

El entrevistador evalúa cuatro cosas, y solo una es "llegar a la solución":

1. **Comunicación:** ¿pensás en voz alta? ¿aclarás supuestos antes de tipear?
2. **Resolución:** ¿reconocés el patrón? ¿llegás a una solución correcta?
3. **Complejidad:** ¿sabés el Big-O de tu solución en tiempo y espacio? ¿podés mejorarlo?
4. **Código limpio:** ¿nombres claros, casos borde, sin bugs tontos?

El error nº1 es **tipear en silencio**. Un candidato que explica su razonamiento y llega a una
solución sub-óptima suele ganarle a uno que la clava muda. Practicá *hablando*.

### El guion de 5 pasos (usalo en cada problema)
1. **Repetí el problema** con tus palabras y **pedí aclaraciones** (rangos, duplicados, vacío,
   tipos). Confirmá ejemplos de entrada/salida.
2. **Fuerza bruta primero:** decí la solución obvia y su Big-O. Establece una baseline.
3. **Optimizá:** "¿puedo usar un hash para evitar este loop anidado?" — nombrás el patrón.
4. **Codeá** explicando mientras tipeás.
5. **Verificá:** corré un ejemplo a mano, cubrí casos borde, decí el Big-O final.

---

## 2. Los patterns clave (tu vocabulario)

Estos cubren la enorme mayoría de los problemas de entrevista:

| Pattern | Cuándo se dispara | Idea central |
|---|---|---|
| **Arrays / Hashing** | "¿existe?", contar, deduplicar, lookups | Un `set`/`dict` cambia O(n) de búsqueda por O(1). El martillo más usado. |
| **Two pointers** | array **ordenado**, pares, palíndromos | Dos índices que se mueven uno hacia el otro o juntos → evita el doble loop. |
| **Sliding window** | subarray/substring contiguo "más largo/corto que cumple X" | Una ventana que crece y se encoge → O(n) en vez de O(n²). |
| **Stack / Queue** | matching de paréntesis, "siguiente mayor", orden LIFO/FIFO | Pila para anidamiento; cola para BFS/orden de llegada. |
| **Trees / Graphs (BFS/DFS)** | jerarquías, caminos, conectividad, grillas | DFS (recursión/stack) para explorar a fondo; BFS (cola) para camino más corto en grafos sin pesos. |
| **DP básico** | "¿de cuántas formas?", "máximo/mínimo", subproblemas que se repiten | Memoizar resultados de subproblemas. Empezá por la recursión + memo antes de tablas. |

No hace falta ir más allá de esto para un loop de AI Engineer (rara vez te piden algoritmos
exóticos). Dominá estos seis y reconocelos rápido.

---

## 3. Complejidad Big-O (lo que SIEMPRE te van a preguntar)

Tenés que poder dar el **tiempo y espacio** de cualquier solución tuya al instante:

- **O(1)** constante · **O(log n)** binaria/divide y vencerás · **O(n)** un pase ·
  **O(n log n)** sorting · **O(n²)** doble loop · **O(2ⁿ)** / **O(n!)** explosivo (backtracking
  ingenuo).
- Regla práctica: un loop = O(n); loop anidado = O(n²); dividir el problema a la mitad cada vez
  = O(log n).
- "¿Podés hacerlo mejor?" casi siempre significa **"¿podés bajar un loop usando un hash, dos
  punteros o una ventana?"** (de O(n²) a O(n)).

Conexión con tu trabajo de AI Engineer: el mismo razonamiento de complejidad explica por qué la
attention es O(n²) (SQ-A) o por qué un índice HNSW acelera el retrieval de M0. No es un
conocimiento desconectado — es la misma forma de pensar costo.

---

## 4. Cómo correr el stream (sin que te coma el curso)

- **Cadencia baja y constante** gana a las maratones. Mejor 3-4 problemas por semana sostenidos
  que 30 en un fin de semana y nada por un mes.
- **No bloquea el checkpoint M4** ni ningún módulo. Es tracking aparte (ver `practica.md`).
- **Curva:** primero *aprendé* el patrón (resolvé con ayuda/solución a la vista), después
  *practicá* (sin ayuda, con timer), al final *simulá* (mock con voz, como en `pruebas.md`).

---

## 5. Lo que tenés que poder hacer (ver `criterios-defensa.md`)

- Resolver un problema "easy/medium" de cada patrón en ~25-35 min, explicando en voz alta.
- Dar el Big-O de tiempo y espacio de tu solución y decir si se puede mejorar.
- Reconocer qué patrón aplica a un problema nuevo en los primeros 2-3 minutos.

Seguí con `material-apoyo.md` (NeetCode, Grind75, etc.) y armá tu plan en `practica.md`.
