---
module: M6
---

# Criterios de defensa — M6

Al terminar M6 tenés que poder, en el nivel honesto indicado:

- **(can-defend)** **Agent vs chain:** cuándo cada uno, con el principio "empezá simple, escalá
  complejidad solo cuando la medís necesaria" (Anthropic), y al menos **un caso donde elegís NO
  usar agente** (sobre-ingeniería). El "no" es tan importante como el "sí".
- **(can-build)** Un grafo LangGraph con **routing** (`add_conditional_edges`) y un **loop
  multi-hop** con corte duro (`MAX_HOPS`), sobre un `AgentState` tipado, reusando el retrieval de
  M3 y la generación con citations de M4.
- **(can-explain)** El patrón **ReAct** (Thought → Action → Observation) y por qué acoplar
  reasoning y acting es mejor que cualquiera por separado.
- **(can-defend)** **Multi-agent:** por qué 2 agentes (retriever + answer) — el beneficio concreto
  (evaluabilidad + enfoque separados) — y **cuándo es sobre-ingeniería** (más cajas sin beneficio
  nombrable; el contrapunto de Cognition).
- **(can-defend)** **Context engineering** como disciplina nombrada: las palancas **selección,
  orden, compresión, presupuesto de tokens, aislamiento por agente**, y por qué "más contexto" no
  es "mejor contexto" (lost-in-the-middle / context rot).
- **(can-build + can-defend)** **Evaluar la trayectoria de un agente, no solo la respuesta:**
  tool-correctness (determinístico) + trajectory match + un judge de "¿tomó el camino correcto?",
  todo corriendo por el **harness de M2** y el mismo CI gate. *Este es el ítem que más se castiga
  si falta.*
- **(awareness + can-defend)** **Reasoning-RAG:** System 1 (pipeline fijo) vs System 2
  (reasoning-driven retrieval); por qué o3 / extended thinking / Gemini 2.5 ganan poco o degradan
  con RAG document-level estándar; y **cómo adaptarías** el pipeline (retrieval-as-tool, recuperar
  más grueso, rutear por modelo) — logueado como entry en `DECISIONS.md`.
