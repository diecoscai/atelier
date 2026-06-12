---
module: M2
---

# Criterios de defensa — M2

Al terminar M2 tenés que poder, en el nivel honesto indicado. Este es el módulo spine: los ítems
`can-defend` son los que más pesan en una entrevista de AI Engineer.

## Metodología (el diferenciador)

- **(can-defend)** Por qué los evals son el #1 diferenciador y qué falla sin ellos (whacka-mole,
  "demo funciona / prod no", optimizar por vibes). Defendelo con *tu* historia: qué fallas
  encontraste y qué número las cuantifica.
- **(can-defend)** El método de **error analysis primero** (open coding → axial coding →
  taxonomía) y por qué las métricas se diseñan *contra* la taxonomía y no al revés. Esta es LA
  respuesta a "¿tu eval es vibes-based o estructurado?".
- **(can-defend)** Tu **taxonomía de fallas** concreta: cuáles son tus modos de falla, sus
  frecuencias, y de dónde salieron (leer traces a mano, no un blog). Tenés que poder *mostrarla*.

## Tipos de evaluación

- **(can-explain)** Por qué se evalúa retrieval y generación **por separado**, y qué te dice cada
  eje (atribución de la falla a un componente).
- **(can-explain)** Las métricas de retrieval (recall@k, precision@k, MRR, hit rate) — qué mide
  cada una y cuándo recall es la métrica reina para RAG.
- **(can-explain)** Las métricas de generación de RAGAS (faithfulness, answer relevancy, context
  precision/recall) — la definición exacta de cada una, sin confundir faithfulness (no inventa) con
  answer relevancy (responde la pregunta).
- **(can-build)** Implementar las métricas de retrieval determinísticas desde cero (funciones puras
  testeables) y correrlas sobre el golden set.

## LLM-as-judge y evals

- **(can-defend)** La distinción **code-based vs LLM-based**: cuándo usás un check if/else o
  recall@k determinístico y cuándo necesitás un LLM-judge. La regla: code-based siempre que el
  criterio sea unívoco; LLM-based solo cuando se requiere juicio semántico. No mezclarlos sin
  criterio explícito.
- **(can-build)** Construir un LLM-judge alineado a la taxonomía (el prompt codifica tus reglas de
  falla), con modelo barato y separado del generador, y output estructurado.
- **(can-defend)** Los sesgos del LLM-judge (position bias, verbosity bias, self-preference,
  sycophancy) y cómo los mitigás.
- **(can-defend)** **SME alignment**: por qué un judge sin validar es vibes-based, y cómo medís
  el acuerdo con **Cohen's Kappa (κ)**. Defendé tu kappa: qué nivel alcanzaste, dónde discrepa el
  judge con tu criterio humano, y qué ajustes hiciste al prompt. κ < 0.40 → el judge no está listo.
- **(can-defend)** **Evaluation flywheel**: el loop continuo medir → identificar fallas → mejorar
  componentes → re-medir, y cómo el CI gate es el punto de control de ese loop.
- **(can-defend)** Por qué el modelo del judge es barato (corre en cada commit) y separado del de
  generación (evita self-preference bias).

## Golden dataset

- **(can-build)** Generar un golden dataset sintético contra los docs ingestados, estratificado
  por la taxonomía, con casos negativos.
- **(can-defend)** Por qué el golden set se construye en M2 (contra docs reales y derivado de la
  taxonomía) y NO en M1 contra el MVP naive — y por qué tiene que ser estable a través de los
  cambios de retrieval de M3.

## Infraestructura y diseño

- **(can-build)** Un CI gate (pytest + GitHub Actions) que mide cada cambio contra el golden set y
  **falla si una métrica baja** (regression gate). Demostrable: un PR que empeora retrieval rompe
  el CI.
- **(can-defend-in-system-design)** Por qué el harness se diseña **agnóstico al componente** —
  toma un trace genérico — y cómo eso cierra el loop de agent-eval en M6 (evaluar la *trayectoria*
  de un agente con el mismo harness, no solo la respuesta). Esta es la respuesta a "¿cómo evaluás
  un agente, no solo una respuesta?".
- **(can-explain)** Qué es el eval dashboard público y por qué es un artefacto de portfolio de alta
  señal (<2% lo tienen).
