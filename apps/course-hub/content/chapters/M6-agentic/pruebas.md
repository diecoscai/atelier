---
module: M6
gate: pending
---

# Pruebas — M6

## Capa 1 — tests automatizados (prueban que *funciona*)

- [ ] **El router rutea bien.** `pytest` parametrizado: queries simples → `"simple"`, comparaciones
      / multi-tema → `"multi"` (≥4 de cada clase). Falla si una FAQ trivial entra al camino agentic.
- [ ] **La descomposición trae de ambos lados.** Para una comparación, el contexto recuperado
      contiene chunks de **los dos** temas/planes (no solo uno) — la falla que el single-shot tenía.
- [ ] **El loop multi-hop termina.** Una query de 2 hops da 2 pasos `retrieve` y para; un caso
      patológico (grade siempre "no alcanza") **corta en `MAX_HOPS`** y no hace loop infinito.
- [ ] **`trajectory` acumula** (`operator.add`), no sobreescribe — cada nodo deja su paso.
- [ ] **Context engineering respeta el budget:** `build_context` nunca excede el budget de tokens y
      no entierra el chunk top-rankeado en el medio.
- [ ] **Los 2 agentes se evalúan por separado:** el retriever agent corre aislado en un test
      ("¿trajo lo correcto?") sin tocar el answer agent.
- [ ] **Trajectory eval corre por el harness de M2** (mismo pytest CI gate, mismo golden dataset
      ampliado con `expected_trajectory` / `expected_tools`):
  - [ ] `tool_correctness` ≥ umbral sobre el golden ampliado.
  - [ ] `trajectory_in_order`: la comparación de planes **pasa por** `decompose`; la query simple
        **evita** el loop.
  - [ ] `path_judge` (LLM barato): veredicto "camino correcto" sobre los casos del golden.
  - [ ] **Regresión detectada:** sacar `decompose` del grafo **hace fallar el CI** (la comparación
        falla la trajectory eval) aunque la respuesta final parezca razonable.

## Capa 2 — defense drills (el HARD GATE)

> No se avanza a M7 hasta responder esto **por escrito, con tus propias decisiones/números**.
> Claude puede hacer de interviewer.

1. **"Agent vs chain: ¿cuándo cada uno?"** — Defendé el espectro (LLM solo < chain/workflow <
   agent) y el principio "empezá simple". Dame **un caso donde elegiste NO usar agente** en
   Grounded y por qué (el "no" cuenta más que el "sí").

2. **"¿Cómo evaluás un agente, no solo una respuesta?"** — *(la más probable y la más castigada.)*
   Explicá outcome eval (faithfulness/relevancy, M2) **+** trajectory eval (tool-correctness
   determinístico + judge de "camino correcto"). Mostrá un caso donde el agente **acertó la
   respuesta por el camino equivocado** y cómo lo agarrás. Si decís solo "mido faithfulness",
   fallaste.

3. **"¿Cómo adaptás RAG para un reasoning model (o3 / extended thinking / Gemini 2.5)?"** —
   System 1 vs System 2. Por qué inyectar chunks antes de que razone **cortocircuita** su mejor
   capacidad. Tu adaptación: retrieval-as-tool, recuperar más grueso, rutear por modelo. Y por qué
   hoy seguís en System 1 (costo/latencia).

4. **"¿Por qué multi-agent acá? ¿Cuándo sería sobre-ingeniería?"** — El beneficio concreto de tus
   2 agentes (evaluabilidad + enfoque). Por qué *no* 5 agentes. El contrapunto de Cognition
   ("Don't build multi-agents").

5. **"Explicame context engineering."** — Las 5 palancas (selección, orden, compresión, budget,
   aislamiento) con cómo cada una aparece en tu `build_context`. Por qué más contexto puede
   empeorar el resultado.

6. **"Mostrame tu grafo. ¿Cómo evitás un agente fuera de control?"** — Routing + `MAX_HOPS` +
   estado acotado. El failure mode (loop infinito / costo runaway) y tu red de seguridad.

**Gate:** marcalo como pasado en el panel del módulo cuando (a) la capa 1 está verde en Grounded —
incluyendo la trajectory eval corriendo por el CI de M2 y la regresión que detecta sacar
`decompose` — y (b) escribiste tus respuestas a la capa 2 (con los 3 ADRs de M6 logueados).
