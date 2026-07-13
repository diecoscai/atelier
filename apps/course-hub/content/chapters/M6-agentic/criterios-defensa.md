---
module: M6
---

# Criterios de defensa — M6

Al terminar M6 tenés que poder, en el nivel honesto indicado:

## Patterns y arquitectura

- **(can-explain)** Los **5 patterns de Anthropic** por nombre: Prompt Chaining · Routing ·
  Parallelization (sectioning + voting) · Orchestrator-Workers · Evaluator-Optimizer. Para cada
  uno: qué hace y cuándo lo usarías. Sin mezclar los nombres es un fail inmediato en entrevista.
- **(can-defend)** El **trade-off workflow vs agent**: cuándo cada uno, con el principio "empezá
  simple, escalá complejidad solo cuando la medís necesaria", y al menos **un caso donde elegís NO
  usar agente** (sobre-ingeniería).
- **(can-defend)** **Simplicidad sobre frameworks**: por qué empezar con la API directa antes de
  añadir LangGraph, y qué compra cada capa de complejidad. Defendé por qué *en este caso*
  LangGraph aporta más que un loop a mano.

## Harness y multi-agent

- **(can-defend)** **Harness engineering**: qué es el harness (scaffolding, guardrails, logging,
  handoff), por qué "agents aren't hard; the Harness is hard" (frase muy citada en 2026,
  rastreada a Ryan Lopopolo del equipo Codex de OpenAI — no a swyx, pese a la atribución errónea
  que circuló), y qué piezas de tu implementación son harness vs agente.
- **(can-build)** Un grafo LangGraph con **routing** (`add_conditional_edges`) y un **loop
  multi-hop** con corte duro (`MAX_HOPS`), sobre un `AgentState` tipado, reusando el retrieval de
  M3 y la generación con citations de M4.
- **(can-explain)** El patrón **ReAct** (Thought → Action → Observation) y por qué acoplar
  reasoning y acting es mejor que cualquiera por separado.
- **(can-defend)** **Multi-agent:** por qué 2 agentes (retriever + answer) — el beneficio concreto
  (evaluabilidad + enfoque separados) — y **cuándo es sobre-ingeniería** (más cajas sin beneficio
  nombrable).
- **(can-defend)** **Economía multi-agente**: cómo justificás el ~15x de costo tokens respecto a
  single-agent. Qué mejora concreta medís y qué routing garantiza que el camino caro no se activa
  para las queries simples. Sin número medido, el 15x no está justificado.

## Context engineering

- **(can-defend)** **Las 4 estrategias de Anthropic** para context engineering en agentes:
  offload static · retrieve just-in-time · isolate per task (subagentes) · compress history
  (compaction). Y por qué context engineering es el "#1 job de los engineers que construyen AI
  agents".
- **(can-defend)** **Context engineering** como disciplina nombrada: las palancas de implementación
  **selección, orden, compresión, presupuesto de tokens, aislamiento por agente**, y por qué "más
  contexto" no es "mejor contexto" (lost-in-the-middle / context rot).

## Evaluación de agentes

- **(can-build + can-defend)** **Trace grading / trajectory eval**: evaluar la **secuencia
  completa de tool calls + handoffs**, no solo el output final. Tres métricas: tool-correctness
  (determinístico) + trajectory match (orden) + path judge (LLM barato). Todo corriendo por el
  **harness de M2** y el mismo CI gate. *Este es el ítem que más se castiga si falta.*
- **(can-defend)** "¿Cómo evaluás un agente que llama 4 tools?" — La respuesta: trajectory eval
  sobre la secuencia completa + trace grading contra el harness de M2. Evaluar solo faithfulness
  del output es insuficiente.

## Awareness

- **(awareness)** **Agent SDKs**: LangGraph (#1 producción), Claude Agent SDK, OpenAI Agents SDK
  (handoffs, guardrails, sessions, tracing built-in). Diferencias clave y criterio de selección.
  No hace falta implementarlos — hace falta poder explicar cuándo usarías cada uno.
- **(awareness + can-defend)** **Reasoning-RAG:** System 1 (pipeline fijo) vs System 2
  (reasoning-driven retrieval); que "reasoning models" ya no es una categoría de modelo separada
  sino razonamiento adaptativo integrado a los flagship (parámetro `effort` en Claude); por qué
  esos modelos ganan poco o degradan con RAG document-level estándar; y **cómo adaptarías** el
  pipeline (retrieval-as-tool, recuperar más grueso, rutear el nivel de esfuerzo por query) —
  logueado como entry en `DECISIONS.md`.
- **(awareness)** **LLM Wiki** (Karpathy, may-2026): memoria navegable en markdown vs embedding
  search — cuándo cada uno y sus trade-offs.
