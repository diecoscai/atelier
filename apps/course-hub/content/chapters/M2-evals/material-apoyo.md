---
module: M2
---

# Material de apoyo — M2

Curado y ordenado. No leas todo: los **★ Core** son obligatorios antes de la práctica; la
Referencia es para consultar mientras construís el harness; el Deep dive es para defender mejor en
system design. Este es el módulo spine — los Core valen el doble.

## ★ Core (leé esto antes de tocar código)

1. **Hamel Husain — "Your AI Product Needs Evals"**
   `hamel.dev/blog/posts/evals/`
   El post fundacional del módulo. Buscá: por qué los evals son el #1 diferenciador, el loop de
   mejora, y la distinción entre evals unitarios / de modelo / humanos. Es la fuente que da
   autoridad cuando te preguntan "¿de dónde sacaste esto?". ~45 min.

2. **Hamel Husain & Shreya Shankar — "A Field Guide to Rapidly Improving AI Products" / curso de
   evals ("AI Evals for Engineers & PMs")**
   `hamel.dev/blog/posts/field-guide/` (el field guide es público; el curso es pago).
   El método canónico de **error analysis primero**: open coding → axial coding → taxonomía de
   fallas, y cómo las métricas se diseñan *contra* la taxonomía. **Esto es el corazón de la sección
   2 de la lección — leelo con cuidado, es lo que te diferencia en entrevista.** ~1h.

3. **★ Hamel Husain & Shreya Shankar — "LLM Evals: Everything You Need to Know" (FAQ)**
   `hamel.dev/blog/posts/evals-faq` (actualizado 15-ene-2026)
   No es una encuesta formal con metodología publicada — es la síntesis de haberle enseñado esto,
   según la propia fuente, a **"700+ engineers & PMs"** en su curso "AI Evals for Engineers & PMs"
   (Maven). El FAQ no desglosa esa cifra por empresa — si en algún otro lado ves una lista de
   compañías (Google, Microsoft, OpenAI, Meta, Amazon) atribuida a este FAQ, viene de material de
   marketing más reciente del mismo curso (Maven / Lenny's Newsletter, 2026), que ya habla de una
   cifra mayor y distinta: "2,000+ PMs e ingenieros, líderes de 500+ empresas" — citalo aparte si
   lo usás, no como parte del FAQ. Posición afilada: *"error analysis > infraestructura"*. La
   distinción code-based vs LLM-based como eje de diseño. Confirma que el método de la sección 2 es
   el canónico en la industria — munición directa para cualquier defensa. ~30 min. **Leelo después
   del field-guide.**

4. **RAGAS — documentación oficial**
   `docs.ragas.io`
   Buscá: las métricas core (faithfulness, answer relevancy, context precision, context recall),
   *cómo se computa cada una*, y la generación de testsets sintéticos. Tené claras las
   definiciones exactas — salen en entrevista. ~45 min. *(El repo de GitHub del proyecto se
   transfirió de `explodinggradients/ragas` a `vibrantlabsai/ragas` — mismo equipo, ahora también
   con foco en entornos para entrenar agentes con RL. El redirect de GitHub sigue funcionando y
   `docs.ragas.io` no cambió; si linkeás el repo directo, usá `github.com/vibrantlabsai/ragas`.)*

5. **DeepEval — repo y docs oficiales**
   `github.com/confident-ai/deepeval`
   Buscá: el modelo pytest-native (`assert_test`, `deepeval test run`), las métricas de RAG, y
   **G-Eval** (definir un judge custom con criterios en lenguaje natural — así codificás tu
   taxonomía). Comparalo mentalmente con RAGAS mientras leés. ~40 min. *(La librería saltó a la
   serie 4.x con un "Eval Harness for Coding Agents" — integraciones con agentes de código y un
   flujo patch → eval → retry. No rompe nada de lo que usás en este módulo — `assert_test`,
   `LLMTestCase`, `FaithfulnessMetric`, `ContextualRecallMetric` y `deepeval test run` siguen
   iguales — pero es la dirección hacia la que se mueve la herramienta, relevante para M6. Detalle
   aparte: el modelo de juicio *default* interno de la librería ya no es `gpt-4o-mini` — pasá
   siempre `model=` explícito en tus métricas, como hace el código de `leccion.md`, para no
   depender de qué default trae la versión instalada.)*

6. **Chip Huyen — "AI Engineering" (O'Reilly, 2025), capítulos de evaluación (cap. 3-4)**
   El marco de referencia del curso para evaluación de modelos de fundación y de sistemas. Buscá:
   la taxonomía de métodos de evaluación, evaluación funcional vs de calidad, y por qué la
   evaluación es el cuello de botella de los productos de IA. La fuente que da autoridad teórica.
   ~1h.

## Referencia (tené a mano mientras construís)

- **Langfuse — docs** `langfuse.com/docs` — tracing con `@observe`, scores, y el dashboard. Buscá
  el quickstart de Python y cómo adjuntar scores a traces. El SDK de Python tiene una v3 nativa de
  OpenTelemetry que es hoy el estándar recomendado (v2 solo recibe parches de seguridad); `@observe`
  sigue siendo una de las formas soportadas de instrumentar en v3.
- **RAGAS — synthetic test data generation** (`docs.ragas.io`, sección de testset generation) —
  para generar el golden set contra tus docs ingestados.
- **DeepEval — G-Eval y métricas custom** (`github.com/confident-ai/deepeval`, docs de metrics) —
  para el judge alineado a tu taxonomía.
- **pytest** `docs.pytest.org` — `parametrize` para correr el harness sobre cada caso del golden
  set; fixtures. (Ya lo conocés de M0.)
- **GitHub Actions** `docs.github.com/actions` — workflow básico, `secrets`, matrices. Para el CI
  gate.

**Versiones mínimas para reproducibilidad** (fijalas en `pyproject.toml`/`requirements.txt` — el
código de este módulo asume estas APIs): `ragas>=0.4`, `deepeval>=4.0`, `langfuse>=3.0`.

## Deep dive (opcional, para defender mejor en system design)

- **Zheng et al. — "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena"** (2023),
  `arxiv.org/abs/2306.05685`. El paper que documenta **position bias, verbosity bias y
  self-enhancement bias** del LLM-judge, y mide su acuerdo con humanos. Munición directa para la
  sección 6.2 — citarlo en entrevista muestra que conocés la literatura, no solo la herramienta.
- **Shreya Shankar et al. — "Who Validates the Validators? Aligning LLM-Assisted Evaluation of LLM
  Outputs with Human Preferences"** (2024), `arxiv.org/abs/2404.12272`. Por qué hay que *validar el
  judge contra humanos* y cómo alinear criterios — base de la idea "un judge sin validar es
  vibes-based".
- **Es et al. — "RAGAS: Automated Evaluation of Retrieval Augmented Generation"** (2023),
  `arxiv.org/abs/2309.15217`. El paper original de RAGAS — las definiciones formales de
  faithfulness, answer relevancy y context relevance. Útil para clavar las definiciones exactas.
- **OpenAI / Anthropic cookbooks — "synthetic eval data" / "evaluating RAG"** — ejemplos prácticos
  de generación de golden sets y judges en sus repos oficiales (buscá "evals" / "RAG evaluation" en
  sus GitHub).

## Nota sobre plataformas de evals

**La plataforma OpenAI Evals cierra el 30-nov-2026** (read-only desde el 31-oct-2026, anunciado
3-jun-2026). Si en algún recurso externo ves referencias a ella como destino de runs o
almacenamiento de datasets, ignorala como dependencia — el stack del curso (RAGAS/DeepEval/
Langfuse) es válido y no depende de esa plataforma. El repo open-source `github.com/openai/evals`
sigue activo y sin aviso de deprecación propio — hasta donde se pudo verificar es un proyecto
distinto del dashboard que cierra, pero no hay un anuncio oficial de OpenAI que lo confirme
explícitamente; tratalo como una distinción razonable, no como un hecho confirmado por fuente
primaria.

OpenAI recomienda explícitamente **Promptfoo** como ruta de migración oficial desde el dashboard
de Evals que se apaga — vale la pena conocerlo como alternativa con "bendición del vendor", junto
a RAGAS/DeepEval/Langfuse. Ojo con un detalle si migrás algo desde ahí: no todos los tipos de eval
exportan a una config de Promptfoo ejecutable — algunos solo exportan un JSONL de resultados, sin
la config completa.

## Cómo usar este material

Leé los ★ Core en orden (Hamel #1 y #2 primero — son el método; #3 el FAQ de 2026 que lo confirma;
RAGAS/DeepEval/Huyen después — son las herramientas y el marco). Antes de abrir `practica.md`,
tenés que poder responder *sin mirar*: (a) por qué error analysis va antes que las métricas, (b) la
diferencia entre faithfulness y answer relevancy, (c) cuándo usás code-based vs LLM-judge, y (d)
qué es Cohen's Kappa y para qué lo usás. Si las cuatro salen, estás listo para construir el harness.
