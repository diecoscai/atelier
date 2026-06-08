---
module: M6
title: Agentic RAG + multi-agent + context engineering + reasoning-RAG
concept: Cuándo el LLM decide los pasos (agent) vs cuándo vos los fijás (chain), y cómo se administra el contexto y se evalúa la trayectoria
duration: ~8-10h lectura + 1-2 findes de práctica
---

# M6 — Cuando el pipeline deja de ser una línea recta

> **Qué vas a saber al terminar esta lección:** decidir, con criterio defendible, cuándo un
> problema se resuelve con un **chain** (pipeline fijo) y cuándo con un **agent** (el LLM decide
> los pasos); construir un grafo LangGraph con routing y multi-hop; nombrar y aplicar
> **context engineering** como disciplina; explicar por qué los **reasoning models** rompen el
> RAG document-level estándar; y —lo que el bar de entrevistas castiga si falta— **evaluar la
> trayectoria** de un agente, no solo su respuesta final, reusando el harness de M2.

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
| Cómo lo evaluás | Output final (M2). | Output **+ la trayectoria** (Sección 9). |
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
Sección 9).

En la práctica no implementás el parser de ReAct a mano: LangGraph (o el tool-calling nativo del
modelo) te da el loop. Pero **tenés que entender que ese loop es ReAct** para defenderlo y para
saber qué evaluar.

---

## 5. LangGraph: el agente como máquina de estados

¿Por qué LangGraph y no un `while` loop a mano, o LangChain `AgentExecutor`? Porque un agente es,
literalmente, una **máquina de estados**: nodos (pasos) + edges (transiciones) + un **state**
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
  con la trajectory eval de la Sección 9.

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
la Sección 9. Lo dejamos en el state desde el día uno: la observabilidad no se atornilla después.

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

## 6. Multi-agent: dos agentes, y por qué (casi nunca)

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
  engineering, Sección 7).
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

## 7. Context engineering (tema de primera clase)

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
5. **Aislamiento por agente.** (Conecta con Sección 6.) Cada sub-agente recibe solo el contexto
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

## 8. Reasoning-RAG: por qué o3/Opus/Gemini 2.5 rompen tu pipeline (awareness)

Hay un cambio de fondo que tenés que conocer aunque no lo construyas a fondo en este módulo.

**System 1 vs System 2** (la analogía de Kahneman aplicada a RAG):
- **System 1 — pipeline fijo (lo tuyo hasta M5).** Recuperás una vez (o con hops fijos),
  rerankeás, generás. Rápido, barato, predecible. El *retrieval* manda y el modelo solo redacta.
- **System 2 — reasoning-driven retrieval.** El modelo *razona sobre qué necesita saber*, y ese
  razonamiento **dirige** la recuperación: decide qué buscar, evalúa lo que trajo, reformula,
  itera — guiado por una cadena de pensamiento profunda, no por un grafo que vos fijaste.

**El hallazgo incómodo (la "nota de currency"):** los **reasoning models** (o3, Claude con
extended thinking, Gemini 2.5) **ganan poco o incluso degradan** con el RAG document-level
estándar. ¿Por qué?
- Tu pipeline les inyecta chunks *antes* de que razonen. Pero su fuerza es razonar *para decidir
  qué necesitan*. Le diste la respuesta antes de que formule la pregunta interna → cortocircuitás
  su mejor capacidad.
- Los chunks rankeados por similarity superficial pueden ser ruido para un modelo que razonaría
  hacia evidencia más precisa. Un contexto recuperado mediocre **arrastra hacia abajo** a un
  modelo que, dejado razonar e iterar, recuperaría mejor.

**Cómo lo adaptarías (esto va a `DECISIONS.md` como entry, no es código obligatorio del módulo):**
- **Darle al modelo el control del retrieval** (retrieval como *tool* que el reasoning invoca
  cuando decide, no un paso forzado upstream). El reasoning model *es* el agente de la Sección 4.
- **Recuperar más grueso, no más fino.** Pasajes más largos o documentos enteros para que el
  modelo razone sobre material rico, en vez de chunks chiquitos pre-filtrados que le esconden
  contexto.
- **Rutear por modelo** (conecta con M7): reasoning models → System 2 (retrieval-as-tool);
  modelos rápidos → System 1 (pipeline fijo). No uses el mismo pipeline para los dos.
- **Cuidado con el costo/latencia:** System 2 con un reasoning model es *caro y lento*. Lo reservás
  para las queries que lo justifican (otra vez: routing).

> **Checkpoint:** "Cambié mi LLM de generación a o3 y mis métricas de RAG no mejoraron / empeoraron.
> ¿Por qué?" **Respuesta:** Porque tu pipeline es System 1 (le inyectás contexto antes de que
> razone) y un reasoning model rinde cuando *dirige* su propia recuperación (System 2). Le estás
> cortando su mejor capacidad. La adaptación es darle el retrieval como tool y recuperar más grueso
> — y rutear: no todos los modelos quieren el mismo pipeline. Saber esto **es** la señal de
> currency que distingue a alguien que leyó papers de 2025 de alguien parado en 2023.

---

## 9. Cerrar el loop de agent-eval (conecta con M2)

Esto es **lo que más castiga el bar de entrevistas** si falta, y el motivo por el que M6 existe
después de M2. La pregunta exacta: **"¿cómo evaluás un agente, no solo una respuesta?"**

En M2 construiste un harness que evalúa el **output final** (faithfulness, answer relevancy,
context recall) contra el golden dataset. Eso mide *el qué*. Pero un agente puede **dar la
respuesta correcta por el camino equivocado** — llamó tools de más (caro), en el orden
incorrecto, o recuperó basura y tuvo suerte. Y puede **dar la respuesta incorrecta por una falla
de trayectoria** identificable (no descompuso, paró un hop antes). Evaluar solo el output final
es ciego a todo eso.

**Trajectory eval** = evaluar la **secuencia de pasos** (qué tools llamó, en qué orden, con qué
args), no solo el resultado. Lo enchufás al harness de M2 — que en M2 diseñaste **agnóstico al
componente** justo para esto. Tres familias de métricas:

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

## 10. Lo que tenés que poder defender (conecta con `criterios-defensa.md`)

Al cerrar M6, un entrevistador podría preguntarte cualquiera de estas. Si no las respondés con
tus palabras y tus decisiones, el módulo no está cerrado:

- "**Agent vs chain: ¿cuándo cada uno?**" (Sección 2) — y un caso donde *no* usarías agente.
- "Mostrame tu grafo LangGraph. ¿Dónde está el routing y dónde el loop? ¿Cómo evitás loops
  infinitos?" (Sección 5, `MAX_HOPS`)
- "¿Por qué multi-agent acá, y cuándo sería sobre-ingeniería?" (Sección 6)
- "**Explicame context engineering.**" Nombrá las palancas: selección, orden, compresión, budget,
  aislamiento. (Sección 7)
- "**¿Cómo evaluás un agente, no solo una respuesta?**" — trajectory eval por el harness de M2.
  (Sección 9) — *la más probable y la más castigada si la fallás.*
- "**¿Cómo adaptás RAG para un reasoning model** (o3 / extended thinking / Gemini 2.5)?" — System 1
  vs System 2, retrieval-as-tool, recuperar más grueso, rutear por modelo. (Sección 8)

Seguí con `material-apoyo.md` para las fuentes canónicas, después `practica.md` para construirlo
en Grounded, y cerrá con los defense drills de `pruebas.md`.
