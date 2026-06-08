---
module: M6
feature: agentic RAG con LangGraph (router + multi-hop) + 2 agentes + trajectory eval por el harness de M2
repo: grounded
---

# Práctica — convertí tu pipeline en un agente (en el repo Grounded)

Objetivo: que Grounded **rutee** cada query, **descomponga** comparaciones, haga **multi-hop**
cuando un paso depende del anterior, y que **cada cambio del grafo se mida** por el harness de M2
(trajectory eval). Cada paso tiene **qué hacer** y **cómo verificar**. No avances sin verificar.

> Trabajás en el repo **`grounded`**. El agente **orquesta** lo que ya construiste: el hybrid
> retrieval + rerank de M3 y la generación con citations + "no sé" de M4 son tools/nodos, no se
> reescriben. Si rompés esas piezas, parás y arreglás antes de seguir.

## Pre-requisitos
- M3 (hybrid retrieval + rerank) y M4 (citations, "no sé" calibrado) andando y testeados.
- El harness de eval de M2 corriendo en CI (pytest + golden dataset + Langfuse).
- `uv add langgraph langchain-core`. API key del LLM (router/decompose/judge usan el modelo barato
  de M2; el answer agent usa el de generación).
- Leíste los ★ Core de `material-apoyo.md` y podés explicar agent vs chain sin mirar.

---

## Paso 1 — El state tipado y la trayectoria
**Hacer:** creá `services/api/agent/state.py` con el `AgentState` (`TypedDict`): `question`,
`sub_queries`, `documents`, `answer`, `route`, y **`trajectory: Annotated[list[dict],
operator.add]`** para que cada nodo *appendee* su paso en vez de pisarlo (ver lección §5).

**Verificar:** un test arma un state, corre dos updates con `operator.add` sobre `trajectory`, y
confirma que la lista **acumula** ambos pasos (no sobreescribe). Sin esto, no hay trajectory eval.

## Paso 2 — Router (el escalón más barato de flexibilidad)
**Hacer:** nodo `route_query` que use el **LLM barato** para clasificar la query en `"simple"`
(single-shot RAG, lo de M3/M4) vs `"multi"` (necesita descomposición/hops). Logueá la decisión en
`trajectory`.

**Verificar:** "¿cómo reseteo mi contraseña?" → `simple`. "compará Pro y Enterprise en SSO y
límites" → `multi`. Test parametrizado con 4-5 queries de cada clase.

## Paso 3 — Descomposición (multi-query / fan-out)
**Hacer:** nodo `decompose` que parta una query `multi` en sub-preguntas conocidas
de antemano (ej. "compará Pro y Enterprise en SSO y límites" → 4 sub-queries). Recuperá para cada
sub-query reusando el **hybrid retrieve de M3**; fusioná en `documents`.

**Verificar:** la comparación produce ≥2 sub-queries y el contexto recuperado contiene chunks de
**ambos** planes (no solo uno). Antes (single-shot) traía uno y se perdía el otro — mostralo.

## Paso 4 — El grafo: router + loop multi-hop
**Hacer:** en `services/api/agent/graph.py` ensamblá el `StateGraph` (lección §5):
- nodos: `route`, `decompose`, `retrieve`, `grade`, `answer`.
- `START → route`; `add_conditional_edges("route", ...)` → `decompose` o `retrieve`.
- `decompose → retrieve → grade`; `add_conditional_edges("grade", ...)` → `answer` o de vuelta a
  `retrieve` (loop multi-hop).
- **`MAX_HOPS` como corte duro** del loop. `answer → END`. `compile()`.
- `grade` usa el LLM barato para juzgar si el contexto **alcanza** para responder.

**Verificar:** (a) una query simple recorre `route → retrieve → grade → answer` **sin** entrar al
loop; (b) una query que necesita 2 hops da 2 pasos `retrieve` y para; (c) forzá un caso patológico
(grade siempre "no alcanza") y confirmá que **`MAX_HOPS` corta** y no hace loop infinito. Imprimí
`trajectory` en los tres casos.

## Paso 5 — Multi-agent: retriever agent + answer agent
**Hacer:** separá en dos subgrafos coordinados por un supervisor (lección §6):
- **retriever agent:** route + decompose + loop `retrieve/grade`. Su salida: el mejor `documents`.
- **answer agent:** toma `documents`, arma el contexto (Paso 6) y genera con citations + "no sé"
  de M4.
- el grafo supervisor pasa state del primero al segundo.

**Verificar:** el flujo end-to-end sigue dando respuestas correctas con citations. Podés correr el
retriever agent **aislado** en un test (medir "¿trajo lo correcto?") sin tocar el answerer. Si no
podés evaluarlos por separado, la separación no te compró nada — revisalo.

## Paso 6 — Context engineering explícito
**Hacer:** creá `services/api/agent/context.py` con `build_context(question, docs, history,
budget)` que aplique las palancas (lección §7): **selección** (rerank de M3) → **compresión**
(dedupe + resumir historial de hops si es largo) → **presupuesto** (llenar hasta `budget` tokens,
recortar por prioridad, nunca truncar a ciegas) → **orden** (lo más relevante a los bordes, la
pregunta bien visible al final).

**Verificar:** un test con muchos docs confirma que el contexto final **respeta el budget** de
tokens y que el chunk top-rankeado NO queda enterrado en el medio. Medí: ¿la respuesta mejora o se
mantiene con *menos* tokens de contexto que pasarlos todos? (Debería — esa es la tesis.)

## Paso 7 — Cerrar el loop: trajectory eval por el harness de M2
**Hacer:** creá `services/api/evals/trajectory.py` con (lección §9):
1. `tool_correctness(actual, expected_tools)` — determinístico.
2. `trajectory_in_order(actual, expected_seq)` — el orden esperado aparece (permitiendo extras).
3. `path_judge(question, trajectory)` — el **LLM barato de M2** como judge: "¿el agente tomó el
   camino correcto?".
- Ampliá ≥10 casos del **golden dataset de M2** con `expected_trajectory` y `expected_tools`.
- Enganchá estas métricas al **mismo pytest CI gate** de M2 (mismo runner, mismo dashboard).

**Verificar:** `pytest` corre las 3 métricas sobre el golden ampliado y **falla el CI** si una
regresión baja tool-correctness por debajo del umbral. Rompé el grafo a propósito (sacá
`decompose`) → la comparación de planes debe **fallar la trajectory eval** (no pasó por
`decompose`), aunque la respuesta final parezca razonable. Ese fallo es la prueba de que el loop
está cerrado.

## Paso 8 — Capa de defensa (el entregable real)
**Hacer:**
- `DECISIONS.md`:
  - **ADR-M6-a:** "Agent vs chain para Grounded" — por qué *no* convertís todo en agente; qué
    queda como chain (FAQs); qué dispara el camino agentic; cómo evitás loops infinitos.
  - **ADR-M6-b:** "Multi-agent: 2 agentes" — el beneficio concreto (evaluabilidad + enfoque
    separados), por qué *no* más de 2, cuándo lo colapsarías a uno.
  - **ADR-M6-c:** "Reasoning-RAG / System 1 vs System 2" — cómo adaptarías el pipeline para o3 /
    extended thinking / Gemini 2.5 (retrieval-as-tool, recuperar más grueso, rutear por modelo) y
    por qué hoy seguís en System 1 por costo/latencia. Taggealos `Module: M6`.
- Respondé los **defense drills** (`pruebas.md`, capa 2) por escrito, con tus números.
- Actualizá `course.json` (status `shipped`, tests, links al grafo y a la trajectory eval).

**Verificar:** podés explicar cada decisión sin mirar las notas, y mostrar el dashboard con una
métrica de trajectory. Recién ahí marcás el gate.

---

## Definición de "hecho" (M6)
✅ El agente rutea (simple vs multi), descompone comparaciones y hace multi-hop con `MAX_HOPS` ·
✅ 2 agentes (retriever + answer) evaluables por separado · ✅ `build_context` respeta el budget de
tokens · ✅ **trajectory eval (tool-correctness + in-order + path-judge) corre por el harness de M2
y falla el CI ante regresión** · ✅ 3 ADRs (agent-vs-chain, multi-agent, reasoning-RAG) · ✅ defense
drills respondidos · ✅ `course.json` publicado. → marcás el gate en el panel del módulo.
