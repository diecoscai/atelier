---
module: M2
feature: eval harness + golden dataset + LLM-judge + CI gate + dashboard público
repo: grounded
---

# Práctica — construí el eval harness (en el repo Grounded)

Objetivo: convertir Grounded de "un RAG que funciona" en "un RAG que se mide". Al terminar, cada
push corre el harness contra un golden dataset de 50+ ejemplos y bloquea el merge si una métrica
baja, y tenés un dashboard público de métricas. Cada paso tiene **qué hacer** y **cómo verificar**.
No avances sin que el paso actual verifique.

> Trabajás en el repo **`grounded`**. El harness vive en `services/api/evals/`. Es la columna
> vertebral: todo cambio de retrieval (M3) y de agentes (M6) se va a medir contra esto.

## Pre-requisitos
- M1 cerrado: docs reales ingestados por el pipeline de parsing/chunking, en pgvector.
- API keys de OpenAI (embeddings/generación) y Anthropic (judge), o equivalente.
- Cuenta de Langfuse (cloud free tier o self-hosted vía Docker).
- Leíste los ★ Core de `material-apoyo.md` (sobre todo Hamel #1 y #2) y podés explicar *por qué
  error analysis va primero* sin mirar.

---

## Paso 1 — Tracing con Langfuse (para poder VER las fallas)
**Hacer:**
- Instalá `langfuse` y envolvé el path de query de Grounded (`retrieve` + `generate`) con
  `@observe()`, registrando como metadata los IDs de los chunks recuperados y sus scores.
- Conectá las keys de Langfuse. Verificá que cada request del chat aparezca como un trace con
  input, chunks recuperados, prompt final, respuesta, latencia y tokens.

**Verificar:** hacés 5 preguntas en el chat → ves 5 traces completos en el dashboard de Langfuse,
cada uno con sus chunks y su respuesta. (Sin esto no podés hacer el Paso 2.)

## Paso 2 — Error analysis a mano → taxonomía (PASO 0, lo más importante)
**Hacer:**
1. Armá una lista de **30-50 queries reales/realistas** de soporte sobre tus docs ingestados
   (no inventes 5 fáciles — incluí preguntas difíciles y algunas cuya respuesta NO esté en los
   docs).
2. Corré Grounded (el sistema actual, naive) contra todas. Andá a Langfuse y **leé cada trace a
   mano** (open coding): por cada respuesta mala o sospechosa, anotá en lenguaje natural *qué*
   salió mal, sin categorizar todavía.
3. Cuando tengas las notas crudas, **agrupalas en categorías** (axial coding) y construí
   `evals/taxonomy.md`: una tabla con cada categoría de falla, ejemplos que la componen, su
   frecuencia, y si es de **retrieval o generación**.

```
# evals/taxonomy.md  (ejemplo de formato — el contenido tiene que salir de TUS traces)
| # | Categoría de falla              | Ejemplos     | Frec. | Eje         |
|---|---------------------------------|--------------|-------|-------------|
| 1 | Chunk relevante no recuperado   | q07, q19, q31| 38%   | retrieval   |
| 2 | Alucinación (inventa)           | q23, q44     | 22%   | generación  |
| 3 | Respuesta incompleta            | q15, q28     | 18%   | generación  |
| 4 | No dice "no sé" cuando debe      | q02, q39     | 12%   | generación  |
| 5 | Falla cross-lingual             | q19          | 10%   | retrieval   |
```

**Verificar:** tenés `evals/taxonomy.md` con ≥4 categorías, cada una con ejemplos concretos y
frecuencia, derivadas de leer traces (no de un blog). Podés decir cuál es tu falla #1 y su %.
**Este archivo es el que vas a mostrar en la entrevista cuando te pidan "mostrame tu taxonomía".**

## Paso 3 — Golden dataset (synthetic Q&A derivado de la taxonomía)
**Hacer:**
- Escribí `evals/build_golden.py`: para cada chunk (o muestra de chunks) ingestado, generá un par
  `(question, ground_truth_answer)` anclado en ese chunk con un LLM barato (Haiku/gpt-4o-mini). El
  chunk de origen ES la ground-truth de retrieval.
- **Cubrí la taxonomía a propósito:** generá casos para cada categoría — incluí casos difíciles
  (respuesta repartida en 2 chunks), cross-lingual si es una falla tuya, y **casos negativos** (la
  respuesta NO está → la verdad es "no sé").
- Curá a mano: revisá una muestra y descartá los Q&A malos. Apuntá a **50+ ejemplos** guardados en
  `evals/golden.jsonl`, cada uno con `question`, `ground_truth_answer`, `relevant_chunk_ids`, y un
  `category` de la taxonomía.

**Verificar:** `evals/golden.jsonl` tiene ≥50 líneas, estratificadas por categoría (contá cuántas
por `category`), con al menos algunos negativos. Una muestra leída a mano se ve realista.

## Paso 4 — Métricas de RETRIEVAL (determinísticas, baratas)
**Hacer:**
- Implementá `recall@k`, `precision@k`, `hit_rate@k` y `MRR` como funciones puras (testeables) en
  `evals/retrieval_metrics.py` (sin I/O — las funciones de la lección sección 3.1).
- Escribí `evals/test_retrieval.py`: para cada caso del golden set, corré el retrieval de Grounded
  y comparás los IDs recuperados contra `relevant_chunk_ids`. Reportá las métricas promedio.

**Verificar:** `uv run pytest evals/test_retrieval.py` corre sobre los 50+ casos y te imprime
`recall@5`, `MRR`, etc. del baseline naive. Anotá esos números — son tu baseline para M3.

## Paso 5 — Métricas de GENERACIÓN (RAGAS + DeepEval)
**Hacer:**
- Con RAGAS: corré el barrido de métricas canónicas (faithfulness, answer relevancy, context
  precision/recall) sobre el golden set, guardando los scores.
- Con DeepEval (pytest-native): escribí `evals/test_generation.py` con casos parametrizados sobre
  el golden set, usando `FaithfulnessMetric` y `ContextualRecallMetric` con `threshold` y un
  **modelo de judge barato** (la estructura de la lección sección 5).

**Verificar:** `uv run pytest evals/test_generation.py` corre y reporta faithfulness/relevancy del
baseline. Los thresholds que pongas reflejan el baseline (los ajustás para que el gate sea
significativo, no trivialmente verde).

## Paso 6 — LLM-judge alineado a la taxonomía
**Hacer:**
- Escribí `evals/judge.py`: un judge de tu falla #1 de generación (probablemente faithfulness)
  cuyo **prompt codifica las reglas de tu taxonomía** (la estructura de la lección sección 6.1 —
  Claude, modelo barato y separado del generador, adaptive thinking, structured output).
- **Validá el judge:** etiquetá a mano 20-30 casos (faithful / no faithful), corré el judge sobre
  esos mismos casos, y calculá el **% de acuerdo** con tus labels. Documentalo en
  `evals/judge_validation.md`.

**Verificar:** el judge corre sobre el golden set y devuelve veredictos estructurados con
justificación. `evals/judge_validation.md` muestra ≥80% de acuerdo con tus labels humanos (si es
menor, reescribí el criterio del prompt y revalidá). **Sin esta validación el judge es
vibes-based.**

## Paso 7 — Harness agnóstico al componente
**Hacer:**
- Refactorizá lo anterior para que el harness no esté atado a "respuesta de RAG": un evaluador
  toma un *trace* `(input, pasos_intermedios, output)` y aplica una lista de evaluadores. Hoy
  `pasos_intermedios = chunks`; dejalo abierto para que en M6 sea `pasos_intermedios = trajectory
  de tools`. Documentá esta decisión en `DECISIONS.md` (ADR de M2).

**Verificar:** podés explicar (y mostrar en el código) cómo el mismo harness evaluaría un trace de
agente en M6 sin reescribirlo — solo agregando evaluadores de trajectory.

## Paso 8 — CI gate (pytest + GitHub Actions, regression gate)
**Hacer:**
- Creá `.github/workflows/evals.yml` que corra `uv run pytest evals/` en cada PR (la estructura de
  la lección sección 8), con las API keys como `secrets`.
- Configurá los thresholds para que el job **falle si recall@5 o faithfulness caen** bajo el
  baseline. (Opcional: comparar contra métricas guardadas de `main` para detectar regresión real,
  no solo umbral absoluto.)

**Verificar:** abrís un PR que *empeora* el retrieval a propósito (ej. bajás `k` a 1) → el CI
**falla** y muestra qué métrica bajó. Revertís → el CI pasa. El gate funciona.

## Paso 9 — Eval dashboard público (artefacto de portfolio)
**Hacer:**
- Publicá los resultados: el dashboard de Langfuse compartido públicamente, o una página/README en
  el repo con una tabla de métricas actuales + su evolución por versión + un badge del CI.
- Linkealo desde el README de Grounded y desde `course.json`.

**Verificar:** hay una URL pública donde se ven tus métricas actuales (recall@5, faithfulness,
etc.) y cómo cambiaron. Un hiring manager puede verlo en 30 segundos. Lo tiene <2% de los
portfolios — este es de los entregables de más señal del curso.

## Paso 10 — Capa de defensa (el entregable real)
**Hacer:**
- `DECISIONS.md` con los **ADRs de M2**: (1) "Error analysis antes que métricas" — por qué, y qué
  taxonomía salió; (2) "RAGAS vs DeepEval" — cuál para qué y por qué; (3) "Harness agnóstico al
  componente" — la decisión que cierra el loop de M6. Taggealos `Module: M2`.
- Escribí tus respuestas a los **defense drills** (`pruebas.md`, capa 2) con *tus* números.
- Actualizá `course.json` (status `shipped`, tests, link al dashboard) → el hub de Atelier lo
  refleja.

**Verificar:** podés explicar cada decisión y cada número sin mirar las notas. Recién ahí marcás el
gate.

---

## Definición de "hecho" (M2)
✅ `taxonomy.md` derivada de error analysis a mano · ✅ `golden.jsonl` con 50+ ejemplos
estratificados por la taxonomía (con negativos) · ✅ métricas de retrieval (recall@k, MRR) y de
generación (RAGAS/DeepEval) corriendo sobre el golden set · ✅ LLM-judge alineado a la taxonomía y
**validado contra labels humanos (≥80% acuerdo)** · ✅ harness agnóstico al componente · ✅ CI gate
que falla si una métrica baja · ✅ eval dashboard público live · ✅ ADRs de M2 + defense drills
respondidos · ✅ `course.json` publicado. → marcás el gate en el panel del módulo.
