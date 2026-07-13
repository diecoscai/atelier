---
module: M6
title: Agentic RAG + 5 patterns + harness engineering + multi-agent + context engineering + reasoning-RAG
concept: Los 5 patterns de Anthropic, cuándo el LLM decide los pasos (agent) vs cuándo vos los fijás (chain), harness engineering, administración del contexto, y evaluación de trayectoria (trace grading)
duration: ~10-12h lectura + 1-2 findes de práctica
---

# M6 — Cuando el pipeline deja de ser una línea recta

> **Qué vas a saber al terminar esta lección:** nombrar y aplicar los **5 patterns de Anthropic**
> (Prompt Chaining, Routing, Parallelization, Orchestrator-Workers, Evaluator-Optimizer) con su
> trade-off; decidir, con criterio defendible, cuándo usar chain vs agent; entender qué es
> **harness engineering** y por qué es lo difícil; aplicar las **4 estrategias de context
> engineering** para agentes; construir un grafo LangGraph con routing y multi-hop; explicar por
> qué los **reasoning models** rompen el RAG estándar; y —lo que el bar de entrevistas castiga si
> falta— **evaluar la trayectoria completa** de un agente con trace grading, reusando el harness
> de M2.

Hasta acá (M0–M5) tu RAG fue una **línea recta**: query → hybrid retrieval → rerank → LLM con
citations. Una sola pasada. Eso es un **chain**. Funciona perfecto para "buscá lo relevante y
respondé". Pero rompe en cuanto la pregunta necesita *varios pasos que no podés predecir de
antemano*. Ahí entra lo agentic. Este módulo es sobre **ganar flexibilidad sin perder el
control** — y sobre no caer en el reflejo de "le pongo un agente" cuando un `if` alcanzaba.

---

## 1. El problema: por qué la línea recta no siempre alcanza

Tu pipeline de M3 asume que **una sola recuperación** trae todo lo necesario. Mirá estas tres
preguntas contra una base de docs de soporte:

1. *"¿Cómo reseteo mi contraseña?"* → una recuperación, un chunk, listo. **Chain.**
2. *"Compará el plan Pro y el Enterprise en límites de API y SSO."* → necesitás info de **dos**
   temas (Pro, Enterprise) y **dos** facetas (límites, SSO). Una sola query de similarity
   probablemente traiga chunks de un plan y se pierda el otro. Necesitás **descomponer**.
3. *"El cliente dice que su webhook dejó de llegar después de migrar a v2. ¿Qué cambió?"* →
   primero tenés que buscar *qué cambió en v2*, leer eso, y *recién con esa info* formular la
   segunda búsqueda (*"breaking changes de webhooks en v2"*). El segundo paso **depende del
   resultado del primero**. No lo podés planear de antemano.

Las preguntas 2 y 3 son la frontera. La 2 se descompone en sub-preguntas **conocidas de
antemano** (multi-query / fan-out). La 3 necesita **decidir el próximo paso en función de lo que
encontraste** (multi-hop iterativo). Cuando el *número y orden de los pasos depende de los
datos*, dejaste el territorio del chain.

> **Por qué importa para el producto:** Grounded es soporte B2B. Las preguntas reales de un
> agente humano de soporte son del tipo 2 y 3 mucho más seguido de lo que parece. Pero —ojo— la
> mayoría siguen siendo del tipo 1. La decisión de diseño no es "agent sí/no" global: es **rutear**
> cada query al mecanismo más barato que la resuelve.

---

## 2. Chain vs Agent: la decisión central del módulo

Esta es **la** distinción que tenés que poder defender en una pizarra.

| | **Chain** (pipeline fijo) | **Agent** (el LLM decide) |
|---|---|---|
| Quién decide los pasos | **Vos**, en código. El grafo es fijo. | **El LLM**, en runtime, eligiendo tools. |
| Control / predictibilidad | Alto. Sabés exactamente qué corre. | Bajo. La trayectoria varía por query. |
| Flexibilidad | Baja. Solo hace lo que programaste. | Alta. Maneja casos que no anticipaste. |
| Costo | Bajo y **predecible** (N llamadas fijas). | Variable y potencialmente alto (loops). |
| Latencia | Baja y predecible. | Variable; los loops la disparan. |
| Failure modes | Los conocés y los testeás. | Loops infinitos, tool calls erróneos, se "va por las ramas", costo runaway. |
| Cómo lo evaluás | Output final (M2). | Output **+ la trayectoria** (Sección 10). |
| Debuggeo | Fácil (camino único). | Difícil (necesitás traces). |

**La regla (de Anthropic, "Building Effective Agents"):** *empezá con la solución más simple
posible y subí complejidad solo cuando la medís necesaria.* En orden de complejidad creciente:

```
LLM solo  <  workflow/chain (pasos fijos, quizá con un router)  <  agent (loop autónomo con tools)
```

Anthropic distingue **workflows** (LLMs orquestados por *paths de código predefinidos*) de
**agents** (el LLM *dirige dinámicamente* su propio proceso y uso de tools). El 80% de lo que la
gente llama "agente" es en realidad un workflow bien hecho — y está bien que lo sea.

**Cuándo agent es sobre-ingeniería (memorizá esto, es una pregunta-trampa de entrevista):**
- La tarea tiene pasos fijos conocidos → chain. Un agente acá agrega costo, latencia y failure
  modes a cambio de *nada*.
- Necesitás latencia/costo predecibles (SLA, alto volumen) → chain.
- No tenés evals de trayectoria todavía → no pongas un agente en producción a ciegas.

**Cuándo agent gana:** el espacio de pasos es abierto, el camino depende de resultados
intermedios, o la tarea requiere recuperación iterativa hasta tener suficiente evidencia.

> **Checkpoint:** Un PM te pide "un chatbot que conteste FAQs del producto". ¿Chain o agent?
> **Respuesta:** Chain (probablemente single-shot RAG, lo de M0–M3). Pasos fijos, latencia
> predecible, fácil de evaluar. Meter un agente acá es el caso de libro de sobre-ingeniería: más
> costo, más latencia, más cosas que pueden fallar, cero beneficio. Lo defendés mostrando que
> *elegiste no usar* la herramienta sofisticada — esa es la señal de seniority.

---

## 3. El espectro intermedio: router, multi-query, multi-hop

Entre "chain rígido" y "agent autónomo" hay un espectro. Vas a vivir en el medio.

**Query routing.** Un clasificador (puede ser un LLM barato o reglas) que mira la query y la
manda al camino correcto: FAQ simple → single-shot; comparación → multi-query; pregunta sobre
otra cosa que no es la doc → declinar. Es el patrón más **barato** que te da flexibilidad: una
decisión, no un loop. Empezás acá.

**Multi-query / descomposición (fan-out).** El LLM parte la pregunta en sub-preguntas
*conocidas de antemano*, recuperás para cada una en **paralelo**, y fusionás. Para *"compará Pro
y Enterprise en límites y SSO"* generás 4 sub-queries, recuperás las 4, juntás el contexto.
Determinístico en estructura (sabés que son N búsquedas), el LLM solo elige el contenido de las
sub-queries.

**Multi-hop / retrieval iterativo.** El **resultado de un paso determina el próximo**. Buscás,
leés, y *con eso* decidís si ya tenés suficiente o necesitás otra búsqueda (y cuál). Esto es un
**loop con condición de parada**. Es genuinamente agentic: el número de hops no se sabe de
antemano. El patrón canónico que lo formaliza es **ReAct**.

> **Por qué antes que cómo:** elegís el mecanismo más simple que resuelve la query. Router antes
> que multi-query antes que loop. Cada escalón agrega costo y failure modes. La pregunta de
> diseño nunca es "¿qué es lo más potente?" sino "¿qué es lo *suficiente*?".

---

## 4. ReAct: el patrón que hace al loop razonable

**ReAct** (Yao et al., 2022, *"ReAct: Synergizing Reasoning and Acting in Language Models"*,
arXiv:2210.03629) es el patrón base de casi todo agente moderno. La idea: intercalar
**Reasoning** (el modelo piensa en voz alta qué hacer) y **Acting** (llama una tool), en un
loop, usando la **Observation** (el resultado de la tool) para informar el siguiente
*Thought*.

```
Thought:      "Necesito saber qué cambió en webhooks v2."
Action:       search("breaking changes webhooks v2")
Observation:  [chunks recuperados]
Thought:      "Dice que el header de firma cambió. ¿Es eso lo que rompió al cliente? Busco confirmación."
Action:       search("webhook signature header v2 migration")
Observation:  [chunks]
Thought:      "Suficiente. Tengo la causa. Respondo."
Action:       finish(answer)
```

Por qué ReAct y no solo "razoná y respondé": el *reasoning* solo (chain-of-thought) alucina
hechos porque no consulta nada externo; el *acting* solo (tool calls sin razonar) no sabe
*cuándo* parar ni *qué* buscar después. ReAct los **acopla**: el razonamiento decide la próxima
acción, la observación corrige el razonamiento. Eso reduce alucinación y da una **trayectoria
inspeccionable** (los Thought/Action/Observation son exactamente lo que vas a evaluar en la
Sección 10).

En la práctica no implementás el parser de ReAct a mano: LangGraph (o el tool-calling nativo del
modelo) te da el loop. Pero **tenés que entender que ese loop es ReAct** para defenderlo y para
saber qué evaluar (los Thought/Action/Observation son la trayectoria que vas a medir en Sección 10).

---

## 5. Los 5 patterns y el principio de simplicidad

Antes de ver cómo implementar un agente con LangGraph, hay que entender los **building blocks**
canónicos. Anthropic los documenta en "Building Effective Agents" (dic-2024) y son el vocabulario
de entrevista de 2026 — si no los sabés nombrar, no sabés hablar de agentes.

### 5.1 Los 5 patterns de Anthropic

| Pattern | Qué hace | Cuándo usarlo |
|---|---|---|
| **Prompt Chaining** | Divide una tarea en una secuencia de llamadas donde el output de cada una alimenta la siguiente. | Tarea descomponible en pasos conocidos de antemano; máximo control y predictibilidad. |
| **Routing** | Un clasificador (LLM barato o reglas) manda la query al camino más eficiente. | Mezcla de tipos de query con tratamiento distinto; quizás el patrón más alto ROI. |
| **Parallelization** | Corre múltiples LLM calls en paralelo y combina resultados. Dos sub-variantes: *sectioning* (cada call maneja una parte del problema) y *voting* (múltiples calls independientes votan el mismo input para mayor confianza). | Tareas independientes que se pueden dividir; o cuando necesitás validación multi-perspectiva. |
| **Orchestrator-Workers** | Un LLM orquestador descompone la tarea, delega a workers (LLMs o tools), y sintetiza resultados. | Tareas que requieren planificación dinámica donde los sub-tasks no se pueden predecir de antemano. |
| **Evaluator-Optimizer** | Un LLM genera, otro evalúa, en un loop hasta que el output pasa el criterio. | Cuando hay criterio de calidad definible y el refinamiento iterativo mejora el resultado. |

Estos patterns son **componibles**: el grafo LangGraph de la sección 6 implementa routing +
orchestrator-workers + un loop que podría ser evaluator-optimizer. Pero en muchos casos el pattern
correcto es el más simple — un Routing bien hecho resuelve el 80% de los casos que la gente
sobre-ingenia con un orchestrator completo.

### 5.2 Workflow vs agent (el trade-off central)

Anthropic distingue dos categorías:

- **Workflow (pipeline fijo):** el LLM ejecuta dentro de paths de código predefinidos. El
  programador define el flujo completo. Prompt Chaining y Routing puros son workflows.
- **Agent (decisión autónoma):** el LLM dirige dinámicamente su propio proceso y uso de tools,
  decidiendo cuándo llamar qué y cuándo parar. Orchestrator-Workers y el loop multi-hop del
  Evaluator-Optimizer son genuinamente agentivos.

El trade-off no es "workflow malo, agente bueno". Es: **mayor autonomía → mayor flexibilidad →
mayor failure surface**. Empezás con el pattern más simple que resuelve el problema y escalás
complejidad solo cuando la medís necesaria.

### 5.3 Simplicidad sobre frameworks: empezar con la API directa

**"The most successful implementations weren't using complex frameworks."** — Anthropic, Building
Effective Agents.

Un LangGraph bien armado tiene mucho valor (tipeado, checkpointing, observabilidad). Pero
añadirlo antes de entender el problema suele generar overhead sin beneficio. La recomendación
de Anthropic es explícita: **empezar con la API directa**, entender el loop, después decidir si
un framework agrega valor real.

En la práctica: implementar un pattern con la API directa antes de refactorizar a LangGraph te
obliga a entender qué hace el framework por vos — y a poder explicarlo. En la práctica del módulo
(`practica.md`) vas a implementar primero el patrón evaluator-optimizer o routing directamente
con la API, y recién después trasladar a LangGraph. Ese ejercicio es exactamente lo que enseña
a defender "¿por qué usás LangGraph?" con algo más que "es popular".

### 5.4 Harness engineering: lo difícil no es el agente

> *"Agents aren't hard. The Harness is hard."* — frase muy citada en la comunidad de AI
> Engineering en 2026; la evidencia disponible la rastrea a Ryan Lopopolo (equipo Codex de
> OpenAI), en un case study sobre un equipo de **tres ingenieros** que generó ~1,500 PRs mergeados
> sobre ~1M líneas de código con Codex en 5 meses — **no** a swyx, pese a una atribución errónea
> que circuló. Si la citás en una entrevista, verificá la fuente antes de repetir la atribución
> equivocada (y el número: es 3, no 7, un error que circuló en algunas versiones); la idea importa
> más que quién la dijo.

El "harness" es todo lo que rodea al agente: el scaffolding que lo ejecuta, los artefactos de
handoff, la gestión de errores, el logging, los guardrails, la integración con sistemas
deterministas. Un agente mal harnessed puede ser correcto en el 90% de los casos y destruir
valor en el 10% que no maneja bien (loops, tool failures, context overflow, cost runaway).

Los componentes del harness que aparecen en el módulo:
- **State management tipado** (AgentState de LangGraph) — el estado es el artefacto central del
  harness.
- **MAX_HOPS** — guardrail determinista contra loops infinitos.
- **build_context** — gestión explícita del presupuesto de tokens.
- **Trajectory logging** — observabilidad del camino, no solo del output.
- **CI gate de trajectory eval** — el harness que verifica el harness (cierra el loop con M2).

Para agentes long-running (los que corren minutos u horas en tareas complejas), el harness se
vuelve aún más crítico. El patrón documentado por Anthropic ("Effective Harnesses for Long-Running
Agents"):

- **Initializer + worker:** dos fases separadas. El initializer entiende la tarea, configura el
  contexto, y establece los artefactos de handoff. El worker ejecuta con acceso a esos artefactos.
- **Artefactos de handoff:** un archivo de progreso (`claude-progress.txt`) + git history actúan
  como memoria persistente entre sesiones. El agente que retoma una tarea puede leer su propio
  historial de trabajo y continuar sin repetir pasos.
- **Prompts estratificados por fase:** el prompt del initializer no es el mismo que el del worker —
  tienen objetivos distintos y no deben mezclarse.

Anthropic amplió este patrón después: "Harness Design for Long-Running Application Development"
(mar-2026) formaliza el par **initializer-agent / coding-agent** para trabajo que excede una sola
ventana de contexto — el initializer-agent arranca la tarea y deja artefactos de handoff; el
coding-agent los retoma en la siguiente ventana sin re-derivar contexto. Es la extensión directa
de "Effective Harnesses for Long-Running Agents" citado arriba; leelos juntos en
`material-apoyo.md`.

> **Checkpoint:** ¿cuál es la diferencia entre el agente y el harness, y por qué importa?
> El agente es el LLM + su loop de decisión. El harness es todo lo que lo rodea: scaffolding,
> memoria, guardrails, logging, integración. Un agente sin harness no es production-ready. El
> harness es la razón por la que "funciona en el demo" no implica "funciona en prod".

---

## 5b. Context engineering para agentes: las 4 estrategias de Anthropic

Esta sección amplía la sección 8 con el framing exacto de Anthropic ("Effective Context Engineering
for AI Agents"). Context engineering es, según Anthropic, **el #1 job de los ingenieros que
construyen AI agents** desde mediados de 2025. El contexto inflado es el "silent killer" de la
confiabilidad de los agentes.

Las 4 estrategias canónicas:

1. **Offload static** — lo que no cambia entre runs (instrucciones, reglas del sistema, ejemplos
   fijos) va en el system prompt o en un archivo que se carga una vez. No lo regenerás en cada
   llamada. Reduce tokens de contexto dinámico.

2. **Retrieve just-in-time** — no metés todo lo que podrías necesitar upfront; recuperás solo lo
   que el paso actual requiere. El retriever de M3 aplicado a agentes: el agente llama la tool de
   retrieval cuando decide que la necesita, no al inicio.

3. **Isolate per task (subagentes)** — cada subagente recibe solo el contexto que su tarea
   específica necesita. El retriever agent no necesita el system prompt del answerer; el answerer
   no necesita la historia de búsquedas fallidas. Cada agente tiene un contexto chico y enfocado.
   Esto conecta directamente con la sección 6 (multi-agent).

4. **Compress history (compaction)** — en agentes long-running o con muchos hops, el historial
   acumula. En vez de arrastrarlo completo, **compactás**: resumís los pasos anteriores en un
   resumen estructurado, descartás tool results que ya no son necesarios, te quedás solo con los
   pasajes citables. Previene context overflow y context rot.

La definición de Anthropic es precisa y vale la pena memorizar para defensa:
> *"Context engineering = the smallest possible set of high-signal tokens that maximize the
> likelihood of some desired outcome."*

La conexión con la economía multi-agente es directa: más agentes = más contexto paralelo = más
tokens = más costo. Las 4 estrategias son la forma de que esa multiplicación no sea exponencial.

---

## 5c. Economía multi-agente: el costo es una decisión de diseño

Del multi-agent research system de Anthropic (jun-2025): un sistema multi-agente superó al single-
agent Opus 4 en **90.2%** en el eval interno. Costo: **~15x tokens** respecto al single-agent. Es
un benchmark fechado — no hay una cifra más nueva de Anthropic que lo reemplace, así que citalo
como referencia histórica de jun-2025, no como estado del arte de hoy.

**Nota de currency sobre el propio nombre "Opus 4":** el `claude-opus-4-20250514` que usaron en ese
benchmark está retirado desde el 15-jun-2026 — ya pasó esa fecha. La línea Opus siguió: 4 → 4.1 →
4.5 → 4.6 → 4.7 → 4.8, con **Opus 4.8** como el flagship Opus vigente hoy. Si alguien te pregunta
"¿y con los modelos actuales replicarías ese 90.2%?", la respuesta honesta es: no hay ese dato
publicado — el baseline de single-agent ya no es un modelo que exista, así que la cifra es
referencia histórica de metodología (task descriptions, coordinación), no un target reproducible.

**El ratio de tokens no es el costo en dólares.** Con pricing de jul-2026 (Haiku 4.5 ≈ $1/$5 por
MTok, Sonnet 5 ≈ $2/$10 intro, Opus 4.8 ≈ $5/$25 por MTok) el tramo Opus se abarató bastante
respecto a jun-2025 — un run 15x en tokens puede salir bastante menos de 15x en factura real hoy.
Medí el costo en $ de tu propio sistema con tu propio pricing vigente; no asumas que "15x tokens"
implica "15x plata". De paso: **Sonnet 5** es la opción intermedia que vale conocer — calidad
cercana a Opus en tareas de coding/agentic a precio de Sonnet. Si tu `path_judge` (Sección 10) con
Haiku 4.5 da veredictos poco confiables, subir el judge a Sonnet 5 antes que a Opus es el paso
lógico: más criterio sin pagar el tramo Opus completo. **Otra arruga en el cálculo de "15x tokens
≠ 15x plata":** Sonnet 5 trae un tokenizer nuevo que genera **~30% más tokens que Sonnet 4.6 para
el mismo texto**. Si migrás el judge o cualquier nodo del grafo a Sonnet 5, tu conteo de tokens
(y por lo tanto el ratio real de costo multi-agente) cambia aunque el pricing por MTok no se
mueva — medí de nuevo, no reuses el número viejo.

Ese trade-off hay que justificarlo con medición, no con intuición. **Si no podés cuantificar la
mejora**, el 15x de costo no está justificado. Preguntas que tenés que poder responder:

- ¿Cuánto mejora (en tu métrica de eval) pasar de single a multi-agent?
- ¿Ese delta de calidad justifica el costo en tu caso de uso?
- ¿El routing corta el camino para las queries simples (el 80%)? Si no, el costo se aplica a todo.

En el sistema de Anthropic, task descriptions detalladas fueron críticas: objetivo, formato de
output, herramientas disponibles, límites. Sin ellas, los subagentes duplicaban trabajo o dejaban
gaps — lo cual multiplicaba el costo sin multiplica la calidad.

> **En entrevista:** "¿cómo justificás el costo multi-agente?" La respuesta: "Medí el delta de
> calidad en el eval antes y después. El 90.2% de mejora de Anthropic es un benchmark de
> referencia; en mi sistema mido X% de mejora en trajectory eval y Y% en faithfulness sobre el
> golden set. El routing garantiza que el camino caro solo se activa cuando el clasificador decide
> que la query lo necesita — el 70% de las queries van por el path simple."

---

## 6. LangGraph: el agente como máquina de estados

¿Por qué LangGraph y no un `while` loop a mano, o `AgentExecutor` de LangChain? **Nota de
currency:** `AgentExecutor` está formalmente deprecado desde el hito LangGraph/LangChain v1.0
(oct-2025) — y hasta el prebuilt `create_react_agent` de LangGraph siguió el mismo camino, en
favor de `create_agent` del paquete `langchain` (sistema de middleware más flexible). Si ves
`AgentExecutor` o `create_react_agent` en código o tutoriales viejos, es una señal de que están
desactualizados; el grafo de esta sección usa `StateGraph` a mano, que sigue siendo la API
estable. Porque un agente es, literalmente, una **máquina de estados**: nodos (pasos) + edges (transiciones) + un **state**
compartido que cada nodo lee y actualiza. LangGraph hace explícito ese grafo. Eso te compra:

- **Control explícito del flujo.** Vos definís los nodos y las transiciones permitidas. Un agente
  "autónomo" sigue corriendo dentro de un grafo que vos acotás → menos failure modes que un loop
  libre.
- **State tipado.** El estado es un `TypedDict`; cada nodo recibe el estado y devuelve un *patch*
  parcial. Trazable y testeable.
- **Edges condicionales.** El routing (Sección 3) y la condición de parada del loop (Sección 4)
  se expresan como `add_conditional_edges`: una función que mira el estado y devuelve a qué nodo
  ir.
- **Checkpointing / memoria.** El estado se puede persistir entre turnos → memoria conversacional
  sin pegar todo en el prompt.
- **Observabilidad.** Cada paso por un nodo es un span trazable → conecta directo con Langfuse y
  con la trajectory eval de la Sección 10.

### El state

```python
# services/api/agent/state.py
from typing import Annotated, Literal
from typing_extensions import TypedDict
import operator

class AgentState(TypedDict):
    question: str
    sub_queries: list[str]          # descomposición (multi-query)
    documents: list[str]            # contexto recuperado, acumulado
    answer: str
    route: Literal["simple", "multi"]   # decisión del router
    # operator.add => cada nodo APPENDEA a la trayectoria en vez de pisarla
    trajectory: Annotated[list[dict], operator.add]
```

El campo `trajectory` es deliberado: con `Annotated[list, operator.add]` cada nodo *agrega* su
paso (qué hizo, con qué args) en vez de sobreescribir. Esa lista **es** lo que vas a evaluar en
la Sección 10. Lo dejamos en el state desde el día uno: la observabilidad no se atornilla después.

### Un grafo con router + multi-hop

```python
# services/api/agent/graph.py
from langgraph.graph import StateGraph, START, END
from .state import AgentState

MAX_HOPS = 3

def route_query(state: AgentState) -> AgentState:
    """LLM barato clasifica: ¿simple o necesita descomposición?"""
    route = classify(state["question"])  # -> "simple" | "multi"
    return {"route": route, "trajectory": [{"node": "route", "decision": route}]}

def decompose(state: AgentState) -> AgentState:
    subs = llm_decompose(state["question"])  # -> list[str]
    return {"sub_queries": subs, "trajectory": [{"node": "decompose", "subs": subs}]}

def retrieve(state: AgentState) -> AgentState:
    queries = state.get("sub_queries") or [state["question"]]
    docs = hybrid_retrieve(queries)   # el pipeline de M3: BM25+dense, RRF, rerank
    return {
        "documents": state["documents"] + docs,
        "trajectory": [{"node": "retrieve", "queries": queries, "k": len(docs)}],
    }

def grade(state: AgentState) -> AgentState:
    """¿El contexto alcanza para responder, o falta un hop?"""
    enough = judge_sufficiency(state["question"], state["documents"])
    return {"trajectory": [{"node": "grade", "enough": enough}]}

def answer(state: AgentState) -> AgentState:
    ans = generate_with_citations(state["question"], state["documents"])  # M4
    return {"answer": ans, "trajectory": [{"node": "answer"}]}

# --- routing condicional ---
def after_route(state: AgentState):
    return "decompose" if state["route"] == "multi" else "retrieve"

def after_grade(state: AgentState):
    # condición de parada del loop multi-hop
    hops = sum(1 for t in state["trajectory"] if t["node"] == "retrieve")
    last = next(t for t in reversed(state["trajectory"]) if t["node"] == "grade")
    if last["enough"] or hops >= MAX_HOPS:
        return "answer"
    return "retrieve"   # otro hop

# --- ensamblado ---
g = StateGraph(AgentState)
g.add_node("route", route_query)
g.add_node("decompose", decompose)
g.add_node("retrieve", retrieve)
g.add_node("grade", grade)
g.add_node("answer", answer)

g.add_edge(START, "route")
g.add_conditional_edges("route", after_route, {"decompose": "decompose", "retrieve": "retrieve"})
g.add_edge("decompose", "retrieve")
g.add_edge("retrieve", "grade")
g.add_conditional_edges("grade", after_grade, {"answer": "answer", "retrieve": "retrieve"})
g.add_edge("answer", END)

agent = g.compile()
```

Leé el grafo: `route` decide si descomponer; `retrieve → grade → (retrieve | answer)` es el
**loop multi-hop** con `MAX_HOPS` como red de seguridad contra loops infinitos (un failure mode
clásico del agente). Reusa tu retrieval de M3 y tu generación con citations de M4. El agente no
reemplaza nada de lo anterior: lo **orquesta**.

> **Checkpoint:** ¿Por qué `MAX_HOPS` es obligatorio y no opcional? Porque "el LLM decide cuándo
> parar" incluye el caso en que *nunca* decide parar (juzga "no alcanza" para siempre). Sin un
> límite duro, un agente en producción puede quemar tu budget de tokens en una sola query. El
> límite es la diferencia entre "flexible" y "fuera de control". Esto **es** un defense drill.

---

## 7. Multi-agent: dos agentes, y por qué (casi nunca)

El graft de M6 es construir **dos agentes** LangGraph: un **retriever agent** (su trabajo: juntar
el mejor contexto, con sus propios hops) y un **answer agent** (su trabajo: redactar la respuesta
con citations y el "no sé" calibrado de M4), coordinados por un grafo supervisor que pasa state
entre ellos.

```
        ┌─────────────────┐        ┌───────────────┐
START → │ retriever agent │  ───→  │ answer agent  │ → END
        │ (loop multi-hop)│ docs   │ (cite + guard)│
        └─────────────────┘        └───────────────┘
```

**Por qué separarlos (cuándo SÍ):**
- **Prompts/contextos divergentes.** El retriever razona sobre *búsqueda* (qué falta, qué query
  sigue); el answerer razona sobre *redacción fiel y citación*. Mezclarlos en un solo prompt
  diluye ambos. Separar = cada agente tiene un contexto chico y enfocado (esto es context
  engineering, Sección 8).
- **Evaluabilidad independiente.** Podés medir "¿el retriever trajo lo correcto?" separado de
  "¿el answerer respondió fiel a lo que le dieron?". Aísla el origen de una falla.
- **Reuso / swap.** Cambiás el retriever sin tocar el answerer.

**Por qué NO (cuándo es sobre-ingeniería — y esto es lo que defendés):**
- Más agentes = más latencia (saltos extra), más costo (más LLM calls), más superficie de fallo,
  más difícil de debuggear.
- Para Grounded, **dos** agentes es el techo razonable hoy. "Enjambres" de 5+ agentes
  (planner/critic/researcher/...) suelen rendir *peor* que un agente bien diseñado con buenas
  tools: explotan el costo y son un infierno de coordinar. La industria viró fuerte a
  "context engineering sobre un agente bien armado" antes que "más agentes".
- **La pregunta honesta:** ¿la separación me compra evaluabilidad y enfoque *reales*, o estoy
  agregando cajas porque suena sofisticado? Si no podés nombrar el beneficio concreto, es
  sobre-ingeniería.

> **Lo que defendés:** "Usé 2 agentes porque retrieval y answering tienen objetivos de
> optimización distintos y los quiero evaluar por separado — no porque más agentes sea mejor. De
> hecho, para el 70% de las queries (las simples) el supervisor corta camino y ni siquiera entra
> al loop." Eso es criterio, no hype.

---

## 8. Context engineering (tema de primera clase)

Hasta ahora "armar el prompt" sonaba trivial: metés los chunks y la pregunta. **No lo es.**
**Context engineering** es la disciplina de **diseñar y administrar exactamente qué información
entra a la ventana de contexto del modelo, en qué orden, y cuánto espacio ocupa.** Es la
evolución de "prompt engineering": ya no escribís *una* instrucción ingeniosa, **curás un
sistema dinámico de información**. En el bar de entrevistas de 2025-2026 se pregunta por nombre.

**Por qué es crítico (no cosmético):**
- **La ventana es un presupuesto finito y caro.** Cada token cuesta plata y latencia. No metés
  "todo lo que tenés"; metés *lo que el modelo necesita para este paso*.
- **Más contexto puede empeorar el resultado** (*context rot* / "lost in the middle", arXiv:2307.03172
  de M0): el modelo ignora el medio de contextos largos y se distrae con ruido. Un contexto chico
  y curado **gana** a uno grande y desordenado.
- **En un agente el contexto crece solo.** Cada hop agrega documentos. Sin gestión, el state se
  infla hasta reventar la ventana o degradar la respuesta.

**Las palancas que tenés que poder nombrar y aplicar:**

1. **Qué incluir (selección).** Solo los chunks que aportan a *esta* pregunta. Acá entra tu
   rerank de M3: rerankeás y te quedás con el top-k real, no con los 50 candidatos.
2. **Orden (posición).** Por "lost in the middle", lo más relevante va al **principio o al final**
   del bloque de contexto, nunca enterrado en el medio. La instrucción y la pregunta, bien
   visibles.
3. **Compresión.** Cuando el contexto acumulado de varios hops es mucho: resumir documentos antes
   de pasarlos, deduplicar chunks repetidos, o quedarte solo con los pasajes citables. En
   conversaciones largas, **comprimir/resumir el historial** en vez de arrastrarlo entero.
4. **Presupuesto de tokens (budget).** Asignás explícitamente: X tokens para instrucción, Y para
   contexto recuperado, Z para historial, y reservás margen para la respuesta. Cuando algo se
   pasa, *recortás según prioridad*, no truncás a ciegas.
5. **Aislamiento por agente.** (Conecta con Sección 7.) Cada sub-agente recibe solo el contexto
   que su tarea necesita. El retriever no necesita el system prompt de citación; el answerer no
   necesita la historia de búsquedas fallidas.

```python
# services/api/agent/context.py
def build_context(question: str, docs: list[str], history: list[str], budget: int = 6000) -> str:
    ranked = rerank(question, docs)             # 1. selección (M3)
    ranked = dedupe(ranked)                     # 3. compresión: sacar repetidos
    picked, used = [], 0
    for d in ranked:                            # 4. presupuesto: llenar hasta el budget
        t = count_tokens(d)
        if used + t > budget:
            break
        picked.append(d); used += t
    # 2. orden: lo más relevante primero y la pregunta al final, bien visible
    ctx = "\n\n".join(picked)
    return f"Contexto:\n{ctx}\n\nPregunta del usuario: {question}"
```

> **Lo que defendés:** "Context engineering = gestionar el presupuesto de tokens con intención.
> Selecciono con el reranker, ordeno por relevancia para mitigar lost-in-the-middle, comprimo el
> historial de hops, y nunca trunco a ciegas: recorto por prioridad. Más contexto no es mejor
> contexto." Sabé nombrar las 5 palancas.

---

## 9. Reasoning-RAG: por qué el razonamiento adaptativo rompe tu pipeline (awareness)

Hay un cambio de fondo que tenés que conocer aunque no lo construyas a fondo en este módulo.

**System 1 vs System 2** (la analogía de Kahneman aplicada a RAG):
- **System 1 — pipeline fijo (lo tuyo hasta M5).** Recuperás una vez (o con hops fijos),
  rerankeás, generás. Rápido, barato, predecible. El *retrieval* manda y el modelo solo redacta.
- **System 2 — reasoning-driven retrieval.** El modelo *razona sobre qué necesita saber*, y ese
  razonamiento **dirige** la recuperación: decide qué buscar, evalúa lo que trajo, reformula,
  itera — guiado por una cadena de pensamiento profunda, no por un grafo que vos fijaste.

**Nota de currency importante:** para jul-2026, "reasoning models" dejó de ser una categoría de
modelo aparte. En vez de un modelo separado que "piensa" opcionalmente (la distinción o3 vs
GPT-4-clase que existía en 2024-2025), el razonamiento se integró como capacidad estándar de los
modelos flagship de cada laboratorio (GPT-5.x, la familia Claude Opus/Sonnet 4.x, Gemini 3): lo
que varía por *llamada* es cuánto razona el modelo, vía un parámetro de esfuerzo — en la API de
Claude, **adaptive thinking** (`thinking: {type: "adaptive"}`, el modelo decide internamente
cuánto pensar) combinado con `output_config.effort` (`low`/`medium`/`high`/`xhigh`/`max`) para
controlar el trade-off profundidad/costo. El "extended thinking" manual de budget fijo
(`budget_tokens`) que existía hasta 2025 está deprecado en Opus/Sonnet 4.6 y **removido** (400 si
lo mandás) en Opus 4.7 en adelante. Si en 2026 alguien te dice "le agregué extended thinking a
Claude", preguntá qué versión de API usa — probablemente esté describiendo el mecanismo viejo.

**El hallazgo incómodo se sostiene, con más nuance:** modelos con razonamiento adaptativo activo
**ganan poco o incluso degradan** con el RAG document-level estándar. ¿Por qué?
- Tu pipeline les inyecta chunks *antes* de que razonen. Pero su fuerza es razonar *para decidir
  qué necesitan*. Le diste la respuesta antes de que formule la pregunta interna → cortocircuitás
  su mejor capacidad.
- Los chunks rankeados por similarity superficial pueden ser ruido para un modelo que razonaría
  hacia evidencia más precisa. Un contexto recuperado mediocre **arrastra hacia abajo** a un
  modelo que, dejado razonar e iterar, recuperaría mejor.
- Investigación de 2026 agrega un matiz sobre "lost in the middle" (Sección 8): modelos
  reasoning-heavy no solo ganan poco con RAG estándar — son **más sensibles al ruido** en el
  contexto recuperado que los modelos sin razonamiento activo. El problema de posición/orden se
  agrava, no se resuelve, cuando el modelo razona sobre contexto ruidoso.
- Un paper con ID verificable (a diferencia de otros que vas a encontrar buscando el tema, ver
  `material-apoyo.md`) plantea una salida: **"RAG over Thinking Traces Can Improve Reasoning
  Tasks"** (arXiv:2605.03344, 2026) — recuperar *trazas de razonamiento* previas en vez de
  documentos crudos mejora tareas de razonamiento (AIME, LiveCodeBench, GPQA-Diamond). El
  argumento: el límite no es RAG en sí mismo, es *qué* le das a recuperar.

**Nota de currency — modelos específicos y fechas de fin de vida (jul-2026), por si los nombrás
en una entrevista o en código:**
- **o3** (OpenAI): se retira de ChatGPT el 26-ago-2026; los snapshots de API (`o3`, `o3-pro`) se
  mapean a `gpt-5.5`/`gpt-5.5-pro` y se apagan el 11-dic-2026. No lo cites como modelo vivo para
  testear después de esas fechas.
- **Gemini 2.5** (Pro/Flash): GA solo hasta el 16-oct-2026; después Google recomienda migrar a
  Gemini 3.
- **Claude:** no hay "modelo reasoning" separado — hay adaptive thinking + `effort` disponible en
  toda la línea flagship actual (Sonnet 5, Opus 4.7/4.8, Fable 5).

**Cómo lo adaptarías (esto va a `DECISIONS.md` como entry, no es código obligatorio del módulo):**
- **Darle al modelo el control del retrieval** (retrieval como *tool* que el reasoning invoca
  cuando decide, no un paso forzado upstream). El modelo con razonamiento activo *es* el agente de
  la Sección 4.
- **Recuperar más grueso, no más fino.** Pasajes más largos o documentos enteros para que el
  modelo razone sobre material rico, en vez de chunks chiquitos pre-filtrados que le esconden
  contexto.
- **Rutear por nivel de esfuerzo, no por "tipo de modelo"** (conecta con M7): en 2026 esto es un
  parámetro por-llamada (`effort`), no elegir entre dos productos distintos. Queries que se
  benefician de razonar sobre su propio retrieval → `effort` alto + retrieval-as-tool (System 2);
  queries simples → `effort` bajo/medio + pipeline fijo (System 1). No uses el mismo nivel de
  esfuerzo para todo.
- **Cuidado con el costo/latencia:** `effort` alto con retrieval-as-tool es *caro y lento*. Lo
  reservás para las queries que lo justifican (otra vez: routing).

> **Checkpoint:** "Cambié mi LLM de generación a un modelo con `effort` alto y mis métricas de RAG
> no mejoraron / empeoraron. ¿Por qué?" **Respuesta:** Porque tu pipeline es System 1 (le
> inyectás contexto antes de que razone) y un modelo con razonamiento adaptativo activo rinde
> cuando *dirige* su propia recuperación (System 2). Le estás cortando su mejor capacidad. La
> adaptación es darle el retrieval como tool, recuperar más grueso, y rutear el nivel de esfuerzo
> por query — no todas las queries quieren el mismo `effort`. Saber que "reasoning models" ya no
> es una categoría de modelo separada sino un parámetro de esfuerzo integrado a los modelos
> flagship **es** la señal de currency que distingue a alguien parado en 2026 de alguien parado
> en 2023.

---

## 10. Cerrar el loop de agent-eval: trace grading + trajectory evals (conecta con M2)

Esto es **lo que más castiga el bar de entrevistas** si falta, y el motivo por el que M6 existe
después de M2. La pregunta exacta: **"¿cómo evaluás un agente, no solo una respuesta?"**

En M2 construiste un harness que evalúa el **output final** (faithfulness, answer relevancy,
context recall) contra el golden dataset. Eso mide *el qué*. Pero un agente puede **dar la
respuesta correcta por el camino equivocado** — llamó tools de más (caro), en el orden
incorrecto, o recuperó basura y tuvo suerte. Y puede **dar la respuesta incorrecta por una falla
de trayectoria** identificable (no descompuso, paró un hop antes). Evaluar solo el output final
es ciego a todo eso.

**Trace grading / trajectory eval** = evaluar la **secuencia completa de pasos** (qué tools llamó
el agente, en qué orden, con qué args, incluyendo handoffs entre subagentes), no solo el string
final. El vocabulario exacto del mercado: OpenAI lo llama "trace grading" en sus guías oficiales
y lo define como *"graders que scorean traces con criterios estructurados para encontrar
regresiones y failure modes a escala"*. Anthropic lo implementa en el multi-agent research
system para detectar cuándo los subagentes duplicaban trabajo.

Lo enchufás al harness de M2 — que en M2 diseñaste **agnóstico al componente** justo para esto.
Tres familias de métricas:

1. **Tool-correctness.** ¿Llamó las tools correctas con los args correctos? Comparás la
   trayectoria real contra una **trayectoria esperada** (o un conjunto de tools que *deberían*
   aparecer). Determinístico, barato, sin LLM.
2. **Trajectory match / orden.** ¿La secuencia de pasos coincide (exacto, o "in-order" permitiendo
   pasos extra, o "any-order")? Para Grounded: ¿una comparación de planes *pasó por* `decompose`?
   ¿una query simple *evitó* el loop?
3. **Trajectory judge (LLM-as-judge sobre el camino).** Un judge —el modelo barato separado de M2—
   recibe la trayectoria y responde: **"¿el agente tomó el camino correcto / razonable para esta
   pregunta?"** Captura lo que las métricas determinísticas no: eficiencia, hops redundantes,
   razonamiento sensato.

```python
# services/api/evals/trajectory.py  — corre por el harness de M2
def tool_correctness(actual: list[dict], expected_tools: set[str]) -> float:
    used = {step["node"] for step in actual}
    return len(used & expected_tools) / len(expected_tools)

def trajectory_in_order(actual: list[dict], expected_seq: list[str]) -> bool:
    """¿Aparecen los pasos esperados en orden (permitiendo extras)?"""
    it = iter(step["node"] for step in actual)
    return all(node in it for node in expected_seq)

def path_judge(question: str, trajectory: list[dict]) -> dict:
    """LLM barato: ¿el camino fue correcto? Devuelve {verdict, reason}."""
    return judge_llm.invoke(PATH_JUDGE_PROMPT.format(q=question, traj=trajectory))
```

Y un caso del golden dataset de M2 ahora incluye la trayectoria esperada:

```python
# golden dataset, ampliado para agentes
{
  "question": "Compará Pro y Enterprise en límites de API y SSO",
  "expected_answer": "...",
  "expected_trajectory": ["route", "decompose", "retrieve", "grade", "answer"],
  "expected_tools": {"decompose", "retrieve"},
}
```

**Por qué esto cierra el loop:** sin trajectory eval, M2 (evals) y M6 (agentes) viven en mundos
separados — exactamente el gap que el cross-check de roadmaps marcó. Con esto, **cada cambio en el
grafo del agente se mide igual que cualquier otro cambio del sistema**: corre por el mismo CI
gate de pytest, contra el mismo golden dataset, en el mismo dashboard. El agente deja de ser una
caja negra que "parece andar" y pasa a ser un componente con regresiones detectables.

> **Lo que defendés (la respuesta de oro):** "Evalúo dos cosas: el *outcome* (faithfulness,
> relevancy — el harness de M2) y la *trayectoria* (tool-correctness determinístico + un judge de
> 'tomó el camino correcto'). Un agente puede acertar la respuesta por el camino equivocado —caro
> o frágil— y eso lo agarra la trajectory eval, no la eval de output. Todo corre por el mismo
> harness y el mismo CI gate." Si decís solo "mido faithfulness", perdiste.

---

## 10b. Awareness: Agent SDKs como alternativas al framework

El mercado no usa solo LangGraph. En los job listings de 2026 aparecen tres frameworks por nombre:

| Framework | Posición | Qué aporta |
|---|---|---|
| **LangGraph** | #1 en producción enterprise | Stateful, graph explícito, checkpointing, multi-agent supervisor |
| **Claude Agent SDK** | #2 | Potencia los agent loops internos de Anthropic; harness de 2 agentes, Agent Skills composables, tracing built-in |
| **OpenAI Agents SDK** | #3 | Handoffs nativos (delegación como tool), guardrails input/output, sessions/memory (SQLite, Redis, Mongo), tracing by default |

Los tres tienen en común: agent loop, tool use, tracing, y algún mecanismo de handoff/delegación.
Lo que varía es el modelo mental:
- LangGraph → grafo explícito de estados y transiciones.
- Claude Agent SDK → harness + skills composables + brain/hands/session desacoplados.
- OpenAI Agents SDK → handoffs como tool calls + guardrails de in/out.

**Nota de currency (jul-2026):** desde el 15-jun-2026 el uso del Claude Agent SDK (y de Claude
Code GitHub Actions) se factura **separado** del uso interactivo de Claude Code — un cambio de
pricing posterior a como se suele describir el SDK. Las Agent Skills además ganaron paquetes
pre-armados (PowerPoint, Excel, Word, PDF) disponibles en Claude Platform, AWS, Microsoft Foundry
y claude.ai — no hace falta escribirlos de cero. Ojo con la fila "tracing built-in" de la tabla:
no está documentada con la misma precisión que el resto de las features del SDK — antes de
citarla en una entrevista, confirmá en `code.claude.com/docs/en/agent-sdk` qué expone
exactamente. Y "Skills" no es un concepto único: en la Messages API (`container.skills` + code
execution tool) son paquetes pre-armados tipo `pptx`/`xlsx`; en Managed Agents y en el Agent SDK
son carpetas con su propio `SKILL.md`, de disclosure progresivo (descripción en contexto por
default, archivo completo solo si el agente lo necesita) — el Agent SDK sigue este segundo
modelo. Del lado de OpenAI, el Agents SDK sumó un stack de "unified tracing" y preparación de
sesión sandbox-aware, pero su documentación pública no deja explícito si el tracing "by default"
cae en el dashboard de OpenAI o requiere wiring externo a OTel — no asumas cuál sin revisar la doc
de tracing del SDK vos mismo.

**No vas a implementar los tres en el módulo.** LangGraph sigue siendo la implementación del
curso. Lo que sí tenés que poder defender: "conozco las alternativas, en qué se diferencian, y
por qué elegí LangGraph para este caso". Awareness sin hype: las tres son herramientas válidas
para distintos contextos. El criterio de selección importa más que la herramienta.

## 10c. Sidebar — El patrón LLM Wiki de Karpathy (memoria navegable)

Andrej Karpathy documentó en mayo 2026 un patrón de memoria para agentes que es una alternativa
interesante al embedding search convencional: el **LLM Wiki**.

La idea: en vez de guardar memorias como embeddings en un vector store y recuperarlas por
similarity, mantenés un **archivo markdown navegable** (un "wiki") que el agente puede leer como
un humano lee notas. Cada sección del wiki es un "artículo" sobre un concepto, entidad o
decisión pasada.

**Trade-offs respecto a embedding search:**

| | LLM Wiki (markdown) | Embedding search (vector) |
|---|---|---|
| Recuperación | El agente lee el archivo completo o secciones navegables | Similarity search sobre embeddings |
| Precision | Alta cuando el contenido está bien estructurado | Depende de la calidad de los embeddings |
| Recall | Depende de que el agente sepa qué secciones leer | Cubre semántica latente que las palabras clave no capturan |
| Mantenibilidad | El agente puede actualizarlo en lenguaje natural | Requiere re-indexar cuando cambia el contenido |
| Costo de lectura | Alto en tokens si el wiki es grande | Bajo (solo los k chunks recuperados) |
| Inspección humana | Trivial (es markdown) | Requiere herramienta de visualización |

**Cuándo usar cada uno (esto es lo que defendés):**
- **LLM Wiki**: dominios bien estructurados, base de conocimiento chica, cuando la inspección
  humana y la mantenibilidad importan, o cuando el agente necesita razonar sobre la estructura
  del conocimiento (no solo recuperar un chunk).
- **Embedding search**: bases grandes, semántica latente importante, retrieval de alta velocidad
  a escala.

Este sidebar no es un cambio de práctica en el módulo — usás pgvector de M3 para retrieval.
Es **awareness de diseño**: hay alternativas de memoria con trade-offs distintos que vas a
encontrar en la literatura y en entrevistas.

---

## 11. Lo que tenés que poder defender (conecta con `criterios-defensa.md`)

Al cerrar M6, un entrevistador podría preguntarte cualquiera de estas. Si no las respondés con
tus palabras y tus decisiones, el módulo no está cerrado:

- "**Nombrá los 5 patterns de Anthropic y cuándo usarías cada uno.**" (Sección 5.1) — y el
  trade-off workflow vs agent.
- "**¿Por qué empezarías con la API directa antes de un framework?**" (Sección 5.3) — simplicidad
  sobre frameworks; lo que el framework hace por vos.
- "**¿Qué es el harness y por qué es lo difícil?**" (Sección 5.4) — scaffolding, guardrails,
  logging, handoff para long-running.
- "**Agent vs chain: ¿cuándo cada uno?**" (Sección 2) — y un caso donde *no* usarías agente.
- "Mostrame tu grafo LangGraph. ¿Dónde está el routing y dónde el loop? ¿Cómo evitás loops
  infinitos?" (Sección 6, `MAX_HOPS`)
- "¿Por qué multi-agent acá, y cuándo sería sobre-ingeniería? ¿Cómo justificás el costo 15x?"
  (Sección 7 + 5c)
- "**Explicame context engineering.**" Las 4 estrategias de Anthropic (offload static, retrieve
  JIT, isolate per task, compress history) + las palancas de implementación. (Secciones 5b y 8)
- "**¿Cómo evaluás un agente, no solo una respuesta?**" — trajectory eval + trace grading por el
  harness de M2. (Sección 10) — *la más probable y la más castigada si la fallás.*
- "**¿Cómo adaptás RAG para un modelo con razonamiento adaptativo** (Claude con `effort` alto,
  GPT-5.x, Gemini 3)?" — System 1 vs System 2, retrieval-as-tool, recuperar más grueso, rutear el
  nivel de esfuerzo por query. (Sección 9)
- "**¿Qué diferencia LangGraph, el Claude Agent SDK y el OpenAI Agents SDK?**" (Sección 10b)
  — awareness de alternativas, criterio de selección.

Seguí con `material-apoyo.md` para las fuentes canónicas, después `practica.md` para construirlo
en Grounded, y cerrá con los defense drills de `pruebas.md`.
