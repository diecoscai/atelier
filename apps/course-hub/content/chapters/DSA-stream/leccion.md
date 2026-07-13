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

## 4. Modo AI-assisted coding round (de rareza a norma)

Lo que arrancó como una movida puntual de Canva en 2025 ya es, a mediados de 2026, un patrón de
industria con varias empresas grandes sumadas. Esto es lo confirmado a julio de 2026:

- **Canva (jun-2025, vigente):** en su blog de ingeniería ("Yes, You Can Use AI in Our Interviews.
  In fact, we insist", canva.dev) anunciaron que **esperan** que los candidatos a Backend, Machine
  Learning y Frontend usen herramientas como Copilot, Cursor o Claude durante la entrevista
  técnica. Reemplazaron el viejo screening de "CS Fundamentals" por una competencia explícita de
  "AI-Assisted Coding". Sigue activo un año después.
- **Meta (rollout oct-2025, en expansión durante 2026):** para roles E4/E5 de SWE corre en
  CoderPad con acceso a GPT-5, Claude Sonnet 4/4.5, Gemini 2.5 Pro y Llama 4 Maverick. Se está
  extendiendo a más roles de backend/ops a lo largo de 2026.
- **Google (rollout en curso, horizonte de 12-18 meses):** formalizó una ronda de "code
  comprehension" de 60 minutos en un CoderPad de 3 paneles (explorador de archivos, editor, y un
  chat con Gemini que **no** edita archivos directamente). El candidato recorre fases de
  bug-fixing → implementación → optimización sobre un codebase multi-archivo. Por ahora apunta a
  roles junior/mid en equipos seleccionados de EE.UU., con transición completa planeada para
  2026-2027 — no es un piloto acotado que ya cerró, sigue rodando.
- **Shopify, Rippling, LinkedIn, Coinbase:** permiten o piden que el candidato traiga su propio
  IDE/herramienta de AI; Coinbase trata la fluidez con AI como una señal a favor, no una falta.

El punto en común: el criterio ya no es "¿usaste IA, sí o no?" sino **qué tan bien la usaste** —
prompt engineering, validación del output, debugging del código generado. Varias de estas empresas
lo evalúan como competencia explícita, no como tolerancia.

Esto **no reemplaza** el modo clásico (solo vos + el enunciado). Sigue siendo mayoría de loops, y
el modo AI-assisted evalúa habilidades distintas. Necesitás prepararte para los dos.

### Qué evalúan en el modo AI-assisted

No es "¿el agente resuelve el problema?". Evalúan si sabés **usar el agente con estrategia**:

1. **Uso selectivo, no delegación total.** Usás el agente para subtareas bien definidas
   (boilerplate, buscar un método, generar tests unitarios) — no para delegar el razonamiento.
2. **Validación del output.** Ante cualquier sugerencia del agente, la verificás: ¿el algoritmo
   es correcto? ¿el Big-O que propone es real? Un candidato que acepta el output sin validar
   falla exactamente en lo que evalúan.
3. **Debugging multi-step.** Si el agente genera código con un bug, sos vos quien lo detecta y
   lo corrige — no el agente iterando a ciegas.
4. **Control de la solución global.** La arquitectura de la solución (qué patrón, qué trade-off,
   qué complejidad) la decidís vos. El agente ejecuta partes, vos orquestás y defendés.
5. **Comunicación.** Igual que en el modo clásico: pensás en voz alta, aclarás por qué usás el
   agente en *este* paso y no en otro.

### Cómo practicar el modo AI-assisted

Practicá N problemas del stream en este modo: resolvé el problema *con* Claude Code o Cursor
abierto, pero seguí el guion de 5 pasos (§1) y usá el agente solo en pasos acotados. Después
de resolverlo, **defendé cada decisión**: ¿por qué delegaste ese paso al agente? ¿Cómo
verificaste que el output era correcto? ¿Qué hubieras hecho diferente sin el agente?

Dado que ahora varias empresas evalúan explícitamente la "fluidez con AI" como competencia propia
(no solo si llegaste a la solución), practicar *solo* resolución manual deja un hueco: sumá
prompting + validación de código generado como habilidad de entrevista en sí misma, no como
atajo.

Este modo de práctica entrena el framework que Karpathy viene desarrollando en charlas y
entrevistas desde fines de 2025 (no es la cita textual del tweet donde acuñó "vibe coding" en
feb-2025 — esa solo nombraba el concepto): *vibe coding* baja el piso, porque cualquiera puede
producir algo funcional sin saber programar; *agentic engineering* es lo que sube el techo,
porque mantiene el nivel profesional cuando delegás partes del trabajo a un agente. Practicar en
modo AI-assisted es entrenar exactamente esa segunda habilidad — usar el agente con criterio, no
cederle el control.

---

## 5. Cómo correr el stream (sin que te coma el curso)

- **Cadencia baja y constante** gana a las maratones. Mejor 3-4 problemas por semana sostenidos
  que 30 en un fin de semana y nada por un mes.
- **Dos modos de práctica:** clásico (sin AI, para el loop tradicional) y AI-assisted (con el
  agente, para rondas tipo Canva/Google — ver §4). Alternará ambos para estar listo para los dos.
- **No bloquea el checkpoint M4** ni ningún módulo. Es tracking aparte (ver `practica.md`).
- **Curva:** primero *aprendé* el patrón (resolvé con ayuda/solución a la vista), después
  *practicá* (sin ayuda, con timer), al final *simulá* (mock con voz, como en `pruebas.md`).

---

## 6. Lo que tenés que poder hacer (ver `criterios-defensa.md`)

- Resolver un problema "easy/medium" de cada patrón en ~25-35 min, explicando en voz alta
  (modo clásico).
- Dar el Big-O de tiempo y espacio de tu solución y decir si se puede mejorar.
- Reconocer qué patrón aplica a un problema nuevo en los primeros 2-3 minutos.
- En el modo AI-assisted (§4): usar el agente en subtareas acotadas, validar el output, defender
  por qué delegaste cada paso y mantener el control de la solución global.

Seguí con `material-apoyo.md` (NeetCode, Grind75, etc.) y armá tu plan en `practica.md`.
