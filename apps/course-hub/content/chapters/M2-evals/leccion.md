---
module: M2
title: Eval harness + golden dataset
concept: Evaluation methodology (error analysis primero, RAGAS/DeepEval, LLM-as-judge, CI gate)
duration: ~8-10h lectura + 1 finde largo de práctica
---

# M2 — Evals: cómo medir un RAG en serio (LA SPINE)

> **Qué vas a saber al terminar esta lección:** explicar por qué los evals son el #1
> diferenciador de un AI Engineer, *diseñar* un eval harness empezando por error analysis (no
> por métricas), distinguir evaluación de retrieval vs generación, construir un golden dataset y
> un LLM-judge alineados a fallas reales, y meter todo en un CI gate. La práctica (`practica.md`)
> es construir ese harness sobre Grounded con docs reales de M1.

Este es **el módulo más importante del curso**. Si M0 te dio un RAG que funciona y M1 te dio
ingesta de docs reales, M2 te da lo único que convierte "construí un RAG" en "soy AI Engineer":
**la capacidad de medir, y de defender cómo medís.** Leelo despacio.

---

## 1. Por qué los evals son el #1 diferenciador

El 70% de los proyectos RAG mueren con la misma frase: *"el demo funcionaba, pero en prod no."*
Lo que pasa abajo siempre es lo mismo:

- Alguien arma el RAG, prueba 5 preguntas a mano, todas salen bien, lo declara listo.
- En prod aparecen 500 preguntas reales. El 30% sale mal: respuestas incompletas, citas
  inventadas, "no sé" cuando la respuesta *estaba* en los docs, alucinaciones con tono confiado.
- Empieza el **whack-a-mole**: tocás el chunk size para arreglar un caso → rompés tres otros que
  no estás mirando. Subís `k` de retrieval → mejora un caso, sube el costo y empeora otro.
  Cambiás el prompt → ahora falla algo que antes andaba. Cada fix es a ciegas.

La razón de fondo: **no podés mejorar lo que no medís.** Sin un número que diga "esto está al
72% y este cambio lo subió al 81%", estás optimizando por *vibes* — por la sensación de que las 5
preguntas que probás a mano salen bien. Eso no escala y no se defiende.

El que mide gana. Un AI Engineer creíble, frente a un cambio, no dice "se siente mejor": dice
*"recall@5 pasó de 0.68 a 0.84 y faithfulness de 0.79 a 0.91 sobre mi golden set de 60
ejemplos, sin regresión en answer relevancy."* Esa frase es la diferencia entre un wrapper y un
ingeniero.

**Por qué casi nadie lo tiene:** los evals son trabajo aburrido y sin glamour. No hay demo
vistosa. Requieren leer respuestas malas a mano, clasificar fallas, mantener un dataset. La
mayoría lo saltea — por eso es exactamente donde te diferenciás. Un **eval dashboard público**
lo tiene <2% de los portfolios. Es señal de altísimo valor (lo armás en `practica.md`).

> **Checkpoint:** ¿qué es el "whack-a-mole" y cuál es su causa raíz?
> Es arreglar un caso a ciegas rompiendo otros que no estás observando. Causa raíz: no tener una
> medición sistemática sobre un conjunto fijo de casos, así que cada cambio se evalúa por la
> sensación de unas pocas pruebas manuales en vez de por un número sobre un dataset estable.

---

## 2. PASO 0 — Error analysis PRIMERO (el corazón del módulo)

Acá está la idea que separa "evals serios" de "métricas vibes-based", y la que más impresiona en
una entrevista. Es el método canónico de **Hamel Husain y Shreya Shankar**.

### 2.1 El error de todos: empezar por las métricas

El instinto del principiante es: "voy a medir mi RAG → busco las métricas de RAGAS →
faithfulness, answer relevancy, context precision → las corro → listo, tengo evals". **Está mal,
y es la trampa #1.** Eso es elegir métricas de un menú *antes* de saber cómo falla tu sistema.
Terminás midiendo cosas que quizás no son tus problemas reales y no midiendo las que sí.

La pregunta correcta no es *"¿qué métricas uso?"*. Es *"¿cómo falla MI sistema, concretamente,
sobre MIS docs y MIS queries?"*. Y eso no se contesta leyendo un blog de métricas: se contesta
**leyendo los traces a mano.**

### 2.2 El método: open coding → axial coding → taxonomía

El proceso viene de la investigación cualitativa (grounded theory). Tres pasos:

**1. Generá traces reales.** Corré tu sistema actual (el de M0/M1, naive) contra **queries
reales o realistas** — 30 a 50 preguntas que un usuario de soporte haría de verdad sobre tus
docs ingestados. Guardá, para cada una: la pregunta, los chunks recuperados, y la respuesta
generada. (Acá entra Langfuse — sección 7 — para capturar traces sin armar logging a mano.)

**2. Open coding — leé y anotá SIN categorías previas.** Sentate y leé cada trace como un
humano. Por cada respuesta mala (o sospechosa), escribí en lenguaje natural *qué* salió mal, sin
intentar encasillarlo todavía. Notas crudas, una por trace:

```
q07: "¿cómo cancelo mi suscripción?" → respondió sobre downgrade de plan, no cancelación.
     El chunk correcto NO estaba en el top-5. (¿problema de retrieval?)
q12: "¿el plan Pro incluye SSO?" → dijo "sí" pero el doc dice que SSO es solo Enterprise.
     El chunk correcto SÍ estaba recuperado. El modelo lo leyó mal. (¿problema de generación?)
q15: "¿cuánto cuesta el addon de almacenamiento?" → recuperó la tabla de precios pero la
     respuesta no mencionó el número. (¿chunk cortó la tabla? ¿el modelo no la usó?)
q19: query en español, doc en inglés → no recuperó nada relevante. (¿problema de embeddings
     cross-lingual?)
q23: "¿puedo exportar mis datos?" → inventó un endpoint de API que no existe en los docs.
     (alucinación pura — el chunk no decía nada de eso)
```

**3. Axial coding — agrupá las notas en categorías.** Cuando tenés 20-30 notas crudas, mirá los
patrones y agrupalas. Las notas de arriba colapsan en algo como:

| Categoría de falla | Notas que la componen | ¿Retrieval o generación? |
|---|---|---|
| **Chunk relevante no recuperado** | q07, q19 | Retrieval |
| **Modelo malinterpreta el chunk correcto** | q12 | Generación (faithfulness) |
| **Respuesta incompleta (omite el dato)** | q15 | Generación (answer relevancy / completitud) |
| **Alucinación (inventa lo que no está)** | q23 | Generación (faithfulness/groundedness) |
| **Falla cross-lingual** | q19 | Retrieval (embeddings) |

Eso es tu **taxonomía de fallas**: una lista priorizada de las maneras concretas en que TU
sistema falla, con frecuencias (cuántos traces en cada una). No salió de un blog — salió de tus
datos.

### 2.3 Por qué esto va PRIMERO (la inversión que te hace defendible)

Las métricas y los judges se diseñan **CONTRA la taxonomía, no al revés.** Tu taxonomía dice
"mi falla #1 es chunk-no-recuperado (40% de los errores) y la #2 es alucinación (25%)". Entonces:

- Para chunk-no-recuperado → medís **recall@k** (¿el chunk correcto está entre los k
  recuperados?). Esa métrica ahora *significa algo* porque ataca tu falla real.
- Para alucinación → construís un **LLM-judge de faithfulness** afinado a *tu* definición de
  alucinación (sección 6).

Si hubieras empezado por las métricas, habrías medido las 6 de RAGAS por igual sin saber cuáles
importan, y habrías diseñado un judge genérico que quizás no detecta *tu* tipo de alucinación.

> **Esto es exactamente lo que un entrevistador busca.** Cuando te pregunte "¿cómo evaluás tu
> RAG?", la respuesta floja es "uso RAGAS". La respuesta de AI Engineer es: *"Primero corrí el
> sistema contra queries reales y leí los traces a mano para construir una taxonomía de fallas —
> mis tres modos principales son X, Y, Z con estas frecuencias. Después diseñé las métricas y el
> judge contra esa taxonomía: recall@5 para Y, un judge de faithfulness para X..."* Eso te pone
> en otro nivel. Es el contenido de `criterios-defensa.md` de este módulo.

### 2.4 Confirmación canónica: "error analysis > infraestructura" (ene-2026)

Esta posición no es la de este curso solo: es la conclusión de **Hamel Husain y Shreya Shankar**,
tras enseñar su curso "AI Evals for Engineers & PMs" (Maven). Su FAQ ("LLM Evals: Everything You
Need to Know", hamel.dev/blog/posts/evals-faq, actualizado 15-ene-2026) dice textualmente que el
curso formó a **"700+ engineers & PMs"** — esa es la cifra exacta que cita la fuente primaria, sin
desglose por empresa (el FAQ no menciona compañías puntuales; si viste una lista tipo "Google,
Microsoft, OpenAI, Meta, Amazon" en otro lado, es de material de marketing, no del FAQ). Material
de marketing más reciente del mismo curso (página de Maven y Lenny's Newsletter, 2026) ya habla de
una cifra mayor y distinta: **"más de 2,000 PMs e ingenieros, y líderes de más de 500 empresas"** —
usala si necesitás el número más grande y más actual, pero citando esa fuente y no el FAQ. El FAQ
en sí es la síntesis de esa experiencia — no una encuesta formal con metodología publicada, sino la
conclusión repetida de haber visto los mismos errores en cientos de equipos — y afila la posición
sin ambigüedades:

> *"La mayoría sobreinvierte en infraestructura de evals antes de entender qué errores comete
> el sistema. Error analysis es LA actividad más importante."*

El curso arranca acá (sección 2) por exactamente esa razón: la taxonomía de fallas es el
insumo que le da sentido a todo lo demás — métricas, judges, golden set. Sin ella, estás
construyendo infraestructura para medir lo que no sabés que querés medir.

> **Checkpoint:** ¿por qué error analysis va antes que elegir métricas?
> Porque las métricas solo significan algo si miden TUS modos de falla reales. Elegirlas antes es
> tomarlas de un menú genérico sin saber si atacan tus problemas. Leés traces a mano para
> *descubrir* cómo falla tu sistema (taxonomía), y recién entonces elegís/diseñás métricas y
> judges que ataquen esas fallas concretas. Posición respaldada por Hamel Husain y Shreya Shankar
> tras enseñar a "700+ engineers & PMs" (FAQ hamel.dev, ene-2026) — y, según marketing más reciente
> del mismo curso, a 2,000+ personas y líderes de 500+ empresas.

---

## 3. Dos ejes de evaluación: retrieval vs generación

Un RAG tiene dos componentes, y se evalúan **por separado**. Esto es crítico: si solo medís la
respuesta final y sale mal, no sabés *de quién es la culpa* — ¿el retrieval no trajo el chunk, o
lo trajo y el modelo lo usó mal? Sin separar, no sabés qué arreglar.

### 3.1 Evaluación de RETRIEVAL (¿trajiste los chunks correctos?)

Asume que para cada pregunta sabés cuál(es) chunk(s) son relevantes (la *ground truth*). Métricas
estándar de Information Retrieval:

- **Recall@k:** de los chunks relevantes que existen, ¿qué fracción está entre los k recuperados?
  *"¿Lo encontraste?"* Para RAG es a menudo la métrica reina — si el chunk no está en el contexto,
  el generador no tiene chance.
- **Precision@k:** de los k recuperados, ¿qué fracción es relevante? *"¿Cuánta basura trajiste?"*
  Importa por costo/ruido (chunks irrelevantes confunden al modelo y cuestan tokens).
- **Hit rate@k:** ¿al menos un chunk relevante apareció en el top-k? (sí/no). Versión binaria,
  fácil de leer.
- **MRR (Mean Reciprocal Rank):** 1/(posición del primer chunk relevante), promediado. Premia
  traer lo relevante *arriba*, no solo en algún lugar del top-k. Importa porque los modelos pesan
  más lo que está al principio del contexto ("lost in the middle", M0).

```python
def recall_at_k(retrieved_ids: list[str], relevant_ids: set[str], k: int) -> float:
    top_k = set(retrieved_ids[:k])
    if not relevant_ids:
        return 1.0  # nada que recuperar
    return len(top_k & relevant_ids) / len(relevant_ids)

def reciprocal_rank(retrieved_ids: list[str], relevant_ids: set[str]) -> float:
    for i, doc_id in enumerate(retrieved_ids, start=1):
        if doc_id in relevant_ids:
            return 1.0 / i
    return 0.0
```

Estas métricas son **determinísticas y baratas** (no llaman a un LLM). Por eso, cuando puedas
evaluar algo con retrieval metrics, hacelo: es más rápido, más barato y más reproducible que un
judge.

### 3.2 Evaluación de GENERACIÓN (¿la respuesta es buena dado el contexto?)

Acá no hay una "respuesta correcta" exacta contra la cual comparar string a string — el lenguaje
natural tiene mil formas válidas. Por eso la generación se evalúa con métricas semánticas,
muchas implementadas como **LLM-as-judge** (sección 6). Las métricas canónicas de **RAGAS**:

- **Faithfulness (groundedness):** ¿cada afirmación de la respuesta está *respaldada por el
  contexto recuperado*? Mide alucinación directamente. Una respuesta es faithful si no inventa
  nada que no esté en los chunks. **Esta es típicamente la métrica más importante en soporte:**
  una respuesta confiada pero no respaldada es veneno.
- **Answer relevancy:** ¿la respuesta realmente contesta la *pregunta*? Penaliza respuestas
  evasivas, incompletas o que se van por las ramas (aunque sean faithful).
- **Context precision:** de los chunks recuperados, ¿los relevantes están bien *rankeados* (arriba)?
  Es una métrica de retrieval que RAGAS computa con un LLM cuando no tenés IDs de ground truth.
- **Context recall:** ¿el contexto recuperado contiene *toda* la información necesaria para
  responder la ground truth? Mide si el retrieval dejó afuera algo necesario.

> **Precisión que tenés que tener clavada (sale en entrevistas):** *faithfulness* = la respuesta
> no inventa respecto al contexto; *answer relevancy* = la respuesta responde la pregunta;
> *context precision/recall* = calidad del contexto recuperado (ranking / completitud). Confundir
> faithfulness con answer relevancy es un error clásico — son ortogonales: una respuesta puede ser
> 100% faithful (no inventa) y 0% relevant (no contesta lo que se preguntó), y viceversa.

```
                    ┌─────────────────────────────────────────────┐
                    │  pregunta → [RETRIEVAL] → chunks → [GEN] → respuesta │
                    └─────────────────────────────────────────────┘
                                    │                        │
                         recall@k, precision@k,    faithfulness, answer
                         MRR, hit rate, context     relevancy
                         precision/recall
```

> **Checkpoint:** medís solo la respuesta final, sale mal. ¿Por qué no alcanza?
> Porque no sabés a quién atribuir la falla: ¿el retrieval no trajo el chunk (arreglás
> chunking/embeddings/reranking) o lo trajo y el modelo lo usó mal (arreglás el prompt/modelo)?
> Separar los dos ejes te dice *qué componente* romper, no solo que algo está roto.

---

## 4. El golden dataset

Un eval harness necesita un conjunto fijo de casos contra el cual medir cada cambio. Eso es el
**golden dataset**: una lista de ejemplos, idealmente con `(pregunta, ground-truth answer,
chunks relevantes)`. Es la "verdad" contra la que todo se compara.

### 4.1 Synthetic Q&A contra los docs YA ingestados

No vas a escribir 60 preguntas a mano (lento y sesgado). El approach estándar es **generación
sintética**: le das a un LLM tus chunks reales (los de M1, ya ingestados) y le pedís que genere
pares pregunta-respuesta *anclados en ese contenido*. Como la respuesta sale del chunk, ese chunk
ES la ground truth de retrieval, gratis.

```python
# Generación sintética básica de un par Q&A anclado en un chunk real.
# Modelo barato y separado del que genera respuestas en prod (sección 6.6).
SYNTH_PROMPT = """Sos un generador de datos de evaluación para un sistema de soporte.
Dado el siguiente fragmento de documentación, generá UNA pregunta realista que un cliente
haría y cuya respuesta esté COMPLETAMENTE contenida en el fragmento. Devolvé JSON:
{{"question": "...", "ground_truth_answer": "..."}}

Fragmento:
{chunk}"""

def generate_qa(client, chunk: str) -> dict:
    resp = client.messages.create(
        model="claude-haiku-4-5",  # barato; la generación sintética no necesita el modelo top
        max_tokens=1024,
        messages=[{"role": "user", "content": SYNTH_PROMPT.format(chunk=chunk)}],
    )
    text = next(b.text for b in resp.content if b.type == "text")
    import json
    return json.loads(text)
```

### 4.2 Derivá los ejemplos de la TAXONOMÍA, no al azar

Acá está la conexión con la sección 2, y lo que hace tu golden set *bueno* en vez de genérico: no
generes 60 preguntas uniformes. **Cubrí tu taxonomía de fallas a propósito.** Si tu falla #1 es
cross-lingual, incluí preguntas en español sobre docs en inglés. Si es "pregunta cuya respuesta
está repartida en dos chunks", construí esos casos. Si es alucinación, incluí preguntas cuya
respuesta NO está en los docs (para chequear que el sistema diga "no sé" en vez de inventar —
estos "negativos" son oro y casi nadie los pone).

Apuntá a **50+ ejemplos**, estratificados por categoría de la taxonomía, con un mix de:
- casos "fáciles" (respuesta en un chunk),
- casos "difíciles" (respuesta repartida, paráfrasis, multi-hop),
- **casos negativos** (la respuesta NO está → la verdad es "no sé / no lo encuentro").

Curado humano: revisá una muestra de los Q&A sintéticos a mano y descartá los malos. Un golden
set con ruido te da métricas con ruido.

### 4.3 Por qué el golden set se construye en M2 y NO en M1

Decisión de diseño importante (y defendible). El golden dataset se construye **acá, contra los
docs reales ya ingestados por el pipeline de M1** — no en M1 contra el MVP naive de M0. Razones:

1. **Contra docs reales, no de juguete.** En M1 metiste parsing y chunking de docs reales. Un
   golden set construido sobre esos chunks evalúa el sistema que vas a tener en prod, no un toy.
2. **Derivado de la taxonomía, que recién existe acá.** La taxonomía (sección 2) sale de leer
   traces del sistema actual. No podés derivar el dataset de una taxonomía que todavía no
   construiste. El orden correcto es: ingesta real (M1) → traces → taxonomía → golden set (M2).
3. **Evitás circularidad sobre el baseline naive.** Si hubieras armado el golden set en M0/M1
   contra el chunking naive, lo estarías anclando a un sistema que sabés que vas a romper. El
   golden set tiene que ser estable a través de los cambios de retrieval que vienen en M3.

> **Checkpoint:** ¿por qué generar el golden set *después* de ingerir docs reales y *después* del
> error analysis, en vez de antes?
> Porque querés que (a) evalúe el sistema real, no un toy, y (b) cubra tus fallas reales, que solo
> conocés tras leer traces. Construirlo antes lo ancla a un baseline que vas a cambiar y a fallas
> que adivinaste en vez de medir.

---

## 5. Herramientas: RAGAS vs DeepEval

Dos frameworks open-source dominan los evals de RAG. No son excluyentes; conocer ambos y *cuándo*
usar cada uno es señal de madurez.

| | **RAGAS** | **DeepEval** |
|---|---|---|
| Foco | Métricas de RAG "de fábrica" (faithfulness, answer relevancy, context precision/recall) | Framework de testing de LLMs, **pytest-native** |
| Modelo mental | "dame un dataset y te devuelvo scores de RAG" | "escribí tus evals como tests (`assert metric >= 0.8`)" |
| Integración CI | Vía dataframe / scripts | **Nativa**: `deepeval test run`, decoradores `@pytest.mark` |
| Métricas custom | Sí, pero más rígido | **G-Eval**: definís un judge custom con criterios en lenguaje natural |
| Cuándo brilla | Benchmark rápido de un RAG con las métricas canónicas | Gate de regresión en CI, métricas/judges a medida |

**La elección práctica del curso:** RAGAS para el *barrido de métricas canónicas* de RAG
(faithfulness, etc. — están listas y bien implementadas), y **DeepEval para el harness de CI**
porque es pytest-native — cada eval es un test, el gate falla como falla un test, y `G-Eval` te
deja definir un judge alineado a tu taxonomía con un criterio en prosa. Los vas a usar juntos en
`practica.md`.

> **Nota de vigencia (ver `material-apoyo.md`):** la plataforma **OpenAI Evals** (el dashboard,
> no el repo open-source) cierra el 30-nov-2026 (read-only desde el 31-oct-2026). OpenAI recomienda
> **Promptfoo** como ruta de migración oficial desde ese dashboard — vale la pena conocerlo como
> tercera opción con "bendición del vendor", aunque el stack de este curso (RAGAS + DeepEval +
> Langfuse) no depende de OpenAI Evals y sigue siendo la elección del curso. DeepEval, por su
> parte, saltó a la serie 4.x con un "Eval Harness for Coding Agents" — un desarrollo a tener en
> el radar para cuando lleguemos a M6 (evals de agentes), sin que rompa nada de lo que usás acá.
> Fijá versiones mínimas para reproducibilidad: `ragas>=0.4`, `deepeval>=4.0`, `langfuse>=3.0`.

```python
# DeepEval — un eval ES un test de pytest. Esto es lo que lo hace ideal para el CI gate.
import pytest
from deepeval import assert_test
from deepeval.test_case import LLMTestCase
from deepeval.metrics import FaithfulnessMetric, ContextualRecallMetric

@pytest.mark.parametrize("case", load_golden_dataset())  # tus 50+ ejemplos
def test_rag_faithfulness(case):
    test_case = LLMTestCase(
        input=case["question"],
        actual_output=run_grounded(case["question"]),          # tu sistema
        retrieval_context=retrieve_chunks(case["question"]),   # los chunks recuperados
        expected_output=case["ground_truth_answer"],
    )
    # Umbrales: el gate falla si bajan (sección 8). Judge barato y separado (sección 6.6).
    # Pasá el modelo SIEMPRE explícito: el default interno de DeepEval 4.x ya no es gpt-4o-mini
    # (pasó a un modelo de la serie GPT-5) — si omitís `model=`, el judge cambia sin que lo notes.
    assert_test(test_case, [
        FaithfulnessMetric(threshold=0.85, model="gpt-4o-mini"),
        ContextualRecallMetric(threshold=0.80, model="gpt-4o-mini"),
    ])
```

> **Defendé la elección, no la marca.** En entrevista no digas "uso DeepEval porque es popular".
> Decí: *"uso métricas de retrieval determinísticas (recall@k) donde puedo porque son baratas y
> reproducibles; RAGAS para las métricas canónicas de generación; y DeepEval como capa de CI
> porque es pytest-native y G-Eval me deja codificar mi taxonomía de fallas como criterio del
> judge."*

---

## 6. LLM-as-judge

Para evaluar generación sin ground-truth exacta, usás otro LLM como **juez**: le das la pregunta,
la respuesta del sistema y el contexto, y un criterio, y le pedís un veredicto (score o
pasa/falla) con justificación.

### 6.1 Cómo funciona

```python
# Un LLM-judge de FAITHFULNESS alineado a la taxonomía. Usa Claude (modelo barato y separado),
# thinking para que razone el veredicto, y structured output para parsear sin frágil regex.
import anthropic
from pydantic import BaseModel

client = anthropic.Anthropic()

JUDGE_SYSTEM = """Sos un evaluador estricto de fidelidad (faithfulness) para respuestas de un
sistema de soporte. Tu única tarea: decidir si CADA afirmación de la respuesta está respaldada
por el CONTEXTO provisto. Una respuesta es "faithful" SOLO si no afirma nada que no se pueda
verificar en el contexto.

Reglas (derivadas de la taxonomía de fallas de este sistema):
- Inventar un endpoint, precio, o feature que no está en el contexto → NO faithful.
- Decir "sí incluye X" cuando el contexto dice que X es de otro plan → NO faithful.
- Decir "no encuentro esa información" cuando el contexto NO la contiene → SÍ faithful (es lo correcto).
- Parafrasear correctamente el contexto → faithful.

Sé conciso. No te dejes influir por la longitud ni por el tono confiado de la respuesta."""

class Verdict(BaseModel):
    faithful: bool
    unsupported_claims: list[str]
    reason: str

def judge_faithfulness(question: str, answer: str, context: str) -> Verdict:
    resp = client.messages.parse(
        model="claude-haiku-4-5",       # barato y SEPARADO del modelo de generación (6.6)
        max_tokens=2048,
        # Haiku 4.5 NO soporta adaptive thinking (eso es Sonnet 5 / Opus 4.6+ / Fable 5) — usa el
        # modo manual: budget_tokens < max_tokens, mínimo 1024. Ver nota debajo.
        thinking={"type": "enabled", "budget_tokens": 1024},
        system=JUDGE_SYSTEM,
        messages=[{"role": "user", "content":
            f"PREGUNTA:\n{question}\n\nCONTEXTO:\n{context}\n\nRESPUESTA A EVALUAR:\n{answer}"}],
        output_format=Verdict,  # atajo de conveniencia de .parse(); a nivel API es output_config.format
    )
    return resp.parsed_output
```

Fijate que el prompt del judge **codifica la taxonomía** (las reglas salen de las fallas reales
de la sección 2). Eso es alinear el judge a tus fallas — no un judge genérico de "¿está buena la
respuesta?".

> **Nota sobre el modelo del judge y `thinking`:** cada familia de modelos de Claude soporta un
> modo de thinking distinto, y mezclarlos rompe en runtime. Haiku 4.5 (como Sonnet 4.5) solo acepta
> el modo manual `{"type": "enabled", "budget_tokens": N}` — con `budget_tokens` estrictamente
> menor a `max_tokens` y un mínimo de 1024 — o directamente sin `thinking`. El modo `{"type":
> "adaptive"}` (donde el modelo decide cuánto pensar) solo existe en modelos más nuevos: Sonnet 4.6
> y Sonnet 5, Opus 4.6 en adelante, y Fable 5. Si preferís adaptive thinking para el judge, usá uno
> de esos modelos (ej. `claude-sonnet-5`) — sigue siendo "separado del generador" mientras el
> generador de prod sea otro modelo; ya no sería el más barato de la familia, pero mantiene la
> separación que evita self-preference bias (6.6).

### 6.2 Taxonomía: cuándo usás code-based vs LLM-based

Antes de hablar de sesgos, la pregunta de diseño que va primero: **¿necesito un judge o alcanza
con un check determinístico?** Hamel Husain y Shreya Shankar (FAQ ene-2026, destilado de enseñarle
esto a 700+ engineers/PMs de 500+ empresas) distinguen dos tipos de evals y advierten contra
mezclarlos sin criterio:

- **Code-based (if/else / determinístico):** compara strings exactos, chequea si aparece una
  cita, cuenta tokens, verifica formato JSON, mide recall@k con IDs de ground truth. Barato,
  reproducible, sin varianza entre corridas. **Usalo siempre que puedas** — para retrieval
  metrics (recall@k, MRR) y cualquier chequeo que tenga respuesta correcta o incorrecta unívoca.

- **LLM-based (juicio):** el model evalúa semántica, coherencia, fidelidad al contexto, tono. Lo
  usás cuando no hay ground truth exacta y el criterio requiere comprensión del lenguaje natural.
  La taxonomía de RAGAS (faithfulness, answer relevancy) vive acá.

**La regla de oro:** no mezclar hasta saber cuál usar. Mezclar significa correr un LLM-judge sobre
algo que un `assert "no sé" in response` resolvería gratis — o peor, no correr nada porque "es
difícil de medir" cuando había una métrica determinística disponible.

> **En entrevista:** "¿cuándo usás code-based vs LLM-based?" La respuesta correcta: "Code-based
> primero siempre que el criterio sea unívoco — es más barato y más reproducible. LLM-based solo
> cuando el juicio requiere comprensión semántica que un if/else no puede capturar. Para mi
> sistema: recall@k y hit-rate son code-based; faithfulness y answer-relevancy son LLM-based."

### 6.3 El evaluation flywheel

El harness no es un artefacto estático que construís en M2 y olvidás. Es un **loop de mejora**
continuo. El patrón canónico (OpenAI cookbook, ago-2025):

```
medir con graders → identificar dónde fallan → mejorar prompts/componentes → volver a medir
```

Cada iteración es un ciclo completo: correr el harness contra el golden set, analizar qué casos
fallaron y por qué (error analysis de vuelta), ajustar el sistema (prompt, chunking, reranker,
umbral), medir de nuevo, y repetir hasta cruzar el umbral de calidad definido. El CI gate de la
sección 8 **es** el punto de control del flywheel: cuando una métrica sube, el umbral también
sube — never regress.

Lo que distingue este loop del whack-a-mole de la sección 1: tenés un número que dice
exactamente cuánto mejoró (o empeoró) cada cambio, contra el mismo conjunto fijo de casos.

### 6.4 SME alignment: validar el judge contra experto humano (no confiar a ciegas)

Los scores del LLM-judge son una opinión. Una opinion que hay que calibrar. OpenAI advierte
explícitamente: **"LLM Graders must undergo SME alignment validation rather than blindly trusting
scores."** (guías oficiales de evals, 2025).

El proceso:
1. Etiquetá vos mismo (o con un experto del dominio) 20-30 casos de tu golden set — por ejemplo:
   `faithful`, `unfaithful`, `borderline`.
2. Corré el LLM-judge sobre los mismos casos.
3. Calculá el **% de acuerdo** y, mejor aún, el **Cohen's Kappa (κ)**.

**Cohen's Kappa** corrige el acuerdo por azar: dos anotadores que votan al azar sobre categorías
desbalanceadas van a coincidir un porcentaje de las veces por casualidad. Kappa (κ) lo descuenta.
Interpretación práctica:

| κ | Interpretación |
|---|---|
| < 0.20 | Acuerdo pobre — el judge no sirve, reescribí el criterio |
| 0.20–0.40 | Leve — marginal, poco confiable |
| 0.40–0.60 | Moderado — usable con cautela |
| 0.61–0.80 | Substancial — confiable para producción |
| > 0.80 | Casi perfecto — muy bueno |

*(Rangos de Landis & Koch, 1977 — el estándar más citado en la industria; Cohen's Kappa como tal
lo introdujo Jacob Cohen en 1960. Ojo: Landis & Koch eligieron esos cortes por criterio propio, sin
evidencia empírica que los respalde — otros papers usan rangos ligeramente distintos. Tratalos como
guía práctica compartida por la industria, no como un estándar matemático absoluto.)* El ejemplo de
abajo usa **Kappa no ponderado** (correcto para
el caso binario faithful/unfaithful mostrado). Si tu golden set usa una escala ordinal con más de
dos categorías (ej. agregás "borderline"), existe el **Kappa ponderado** (weighted), que penaliza
menos los desacuerdos entre categorías adyacentes — considéralo si tu taxonomía crece más allá de
sí/no.

```python
# Calcular Cohen's Kappa sobre las etiquetas del judge vs las tuyas
from sklearn.metrics import cohen_kappa_score

human_labels = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1]   # tus etiquetas (1=faithful, 0=unfaithful)
judge_labels = [1, 0, 1, 0, 0, 1, 1, 0, 1, 1]   # lo que el judge decidió

kappa = cohen_kappa_score(human_labels, judge_labels)
# kappa = 0.60 → moderado. Revisá los casos donde difieren antes de deployar.
```

Documentá el kappa en `judge_validation.md`. Si κ < 0.40, el judge no está alineado — revisá
el prompt, los criterios, y posiblemente si el modelo barato que elegiste tiene el nivel de
comprensión necesario para este dominio.

> **Lo que defendés:** "Mi judge tiene κ=0.73 sobre 25 casos etiquetados a mano — acuerdo
> substancial. Sé que discrepa en casos de paráfrasis indirecta, que son el 15% de las
> discrepancias. Para esos casos el judge conservador falla más; lo compenso bajando un tick el
> threshold de producción." Eso es SME alignment real, no "el judge dice 0.91 entonces es bueno".

### 6.5 Sus sesgos (tenés que conocerlos para defender el judge)

Un LLM-judge no es un oráculo. Tiene sesgos documentados; mencionarlos en entrevista muestra que
no lo tratás como caja mágica:

- **Position bias:** cuando comparás dos respuestas (A vs B), el judge tiende a preferir la que va
  en cierta posición (a menudo la primera). *Mitigación:* corré ambos órdenes y promediá, o evitá
  el modo pairwise cuando puedas usar scoring absoluto.
- **Verbosity bias:** el judge tiende a puntuar más alto las respuestas *más largas*, aunque no
  sean mejores. *Mitigación:* instruí explícitamente "no te dejes influir por la longitud" (como
  en el prompt de arriba) y, si podés, normalizá.
- **Self-preference / self-enhancement bias:** un judge tiende a preferir salidas de su propia
  familia de modelos. *Mitigación:* usá un modelo de judge de *otra* familia que el de generación
  cuando importe, o al menos sé consciente del sesgo.
- **Sycophancy:** tiende a estar de acuerdo / ser condescendiente. *Mitigación:* prompt estricto,
  criterios binarios y verificables, pedir justificación.

La mitigación maestra de todas: **validá el judge contra labels humanos con Cohen's Kappa.** Sin
validación, el judge es otra forma de vibes-based. (Ver sección 6.4.)

### 6.6 Por qué un modelo barato y separado

Dos reglas para el modelo del judge:

1. **Barato.** Vas a correr el judge sobre 50+ casos en cada commit (CI). Usar el modelo top
   para juzgar es caro y lento, y para juzgar (tarea acotada con criterio claro) un modelo chico
   alcanza. Por eso los ejemplos usan Haiku 4.5 / `gpt-4o-mini`. Ojo con la vigencia de este
   segundo: a mediados de 2026 OpenAI ya retiró toda la familia GPT-4o de ChatGPT y Custom GPTs, y
   el lineup vigente de su API es la generación GPT-5.4/5.5 (los `gpt-5-mini`/`gpt-5-nano`
   originales ya no figuran en su página de precios desde junio 2026). `gpt-4o-mini` sigue
   disponible vía API sin fecha de retiro anunciada, pero es candidato de alto riesgo a ser el
   próximo — si dejó de funcionar, buscá el equivalente barato vigente de esa generación (p. ej.
   `gpt-5.4-mini` o el que exista al momento) en vez de asumir que seguirá disponible
   indefinidamente. Claude Haiku 4.5 (lanzado 15-oct-2025) sigue siendo el Haiku más reciente de
   Anthropic a mediados de 2026, sin reemplazo anunciado — no tiene el mismo riesgo de corto plazo.
2. **Separado del generador.** El modelo que *juzga* debe ser distinto del que *genera* las
   respuestas en prod — idealmente de otra familia. Si el mismo modelo genera y se juzga, el
   self-preference bias contamina el resultado (se aprueba a sí mismo). Separar el judge es parte
   de hacer la evaluación honesta.

> **Matiz de la guía oficial de OpenAI ("Evaluation best practices"):** arrancar el judge
> directamente con el modelo más barato es un atajo que se paga después. La recomendación es
> empezar con un modelo *fuerte* para el judge, validar su acuerdo con labels humanos (Cohen's
> Kappa, 6.4), y **recién después** optimizar a un modelo barato si el acuerdo se sostiene. No
> contradice las dos reglas de arriba — las reordena: primero validás que el criterio del judge
> es correcto con un modelo que no tenga dudas de comprensión, y después bajás de nivel para el
> gate de CI si el barato mantiene el mismo kappa.

> **Checkpoint:** nombrá dos sesgos del LLM-judge y cómo los mitigás. ¿Cuándo usás code-based en
> vez de LLM-based?
> *Position bias* → corré ambos órdenes y promediá. *Verbosity bias* → instruí "no te dejes
> influir por la longitud". Mitigación general: validar con Cohen's Kappa contra labels humanos.
> Code-based primero cuando el criterio es unívoco (recall@k, hit-rate, formato JSON); LLM-based
> solo cuando se requiere juicio semántico.

---

## 7. Langfuse: tracing y observabilidad

No podés hacer error analysis (sección 2) sin *ver* los traces, y no podés mejorar en prod sin
observabilidad. **Langfuse** es la capa que captura, para cada request del RAG: la pregunta, los
chunks recuperados (con scores), el prompt final, la respuesta, latencia, tokens/costo, y los
scores de tus evals. Sirve para dos cosas:

1. **Offline (dev):** capturar los traces que vas a leer a mano para construir la taxonomía, y
   correr los evals del golden set guardando scores por trace.
2. **Online (prod):** ver requests reales, samplearlos para error analysis continuo, y detectar
   regresiones que el golden set no cubre.

```python
from langfuse.decorators import observe, langfuse_context

@observe()  # captura input/output/latencia automáticamente
def answer_query(question: str) -> str:
    chunks = retrieve_chunks(question)
    langfuse_context.update_current_observation(metadata={"retrieved_ids": [c.id for c in chunks]})
    answer = generate(question, chunks)
    return answer

# adjuntar el score de un eval a su trace, para verlos juntos en el dashboard
langfuse_context.score_current_trace(name="faithfulness", value=verdict.faithful)
```

El loop completo de mejora: **trace (Langfuse) → leer fallas → taxonomía → golden set → métricas
+ judge → medir → cambiar → re-medir.** Langfuse es la base de ese loop.

> **Nota de versión:** el SDK de Python de Langfuse tiene una v3 basada en OpenTelemetry, que hoy
> es el estándar recomendado (v2 sigue funcionando pero solo recibe parches de seguridad, sin
> funcionalidad nueva). El decorador `@observe` que usás arriba sigue vigente en v3 — es una de las
> tres formas documentadas de instrumentar, junto con un context manager y observaciones manuales
> — así que el patrón de este código no cambia. Fijá `langfuse>=3.0` en tus dependencias y revisá
> el quickstart actual de `langfuse.com/docs` antes de instalar, porque el detalle de imports puede
> variar entre versiones. Un gotcha real de v3: si mezclás la instrumentación de Langfuse con otra
> instrumentación OpenTelemetry genérica en el mismo proceso, podés terminar con "span explosion"
> (muchos más spans de los que esperás) — y eso infla el volumen facturable si tu plan cobra por
> observabilidad. Vigilalo si además instrumentás con OTel por tu cuenta. A mediados de 2026 ya
> existe además una **v4** (con guía de migración oficial desde v2) que deprecó `update_trace()` —
> si arrancás de cero, fijate en la documentación si conviene ir directo a v4; el patrón `@observe`
> de este código sigue siendo válido en v3 y en v4.

---

## 8. El CI gate: cada cambio se mide

Acá todo se vuelve infraestructura. El golden set + las métricas + el judge se empaquetan en
**tests de pytest**, y un **GitHub Actions** los corre en cada push/PR. **Si una métrica baja
respecto al baseline, el CI falla y el merge se bloquea.** Eso es un **regression gate**: imposible
mergear un cambio que empeora el retrieval o mete alucinaciones sin que el pipeline lo grite.

```yaml
# .github/workflows/evals.yml — corre el harness en cada PR
name: RAG Evals
on: [pull_request]
jobs:
  evals:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v3
      - run: uv sync
      - name: Run eval harness against golden dataset
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: uv run pytest evals/ -v   # falla si recall@5 o faithfulness caen bajo el umbral
```

Desde este punto, **todo cambio del curso se mide contra el golden set.** Cuando en M3 metas
hybrid search y reranking, no vas a decir "se siente mejor": el CI te va a dar `recall@5: 0.68 →
0.84`. Esa es la base de la defensibilidad de todo el resto del curso.

### 8.1 El eval dashboard público (artefacto de portfolio)

El CI no solo bloquea: **publica resultados.** Acá nace tu **eval dashboard público** — una página
(o el dashboard de Langfuse, o un README con un badge + tabla) que muestra las métricas actuales y
su evolución por versión. Lo tiene <2% de los portfolios. Para un hiring manager es la prueba de
que medís en serio. Lo arrancás en `practica.md` y lo mantenés vivo el resto del curso.

---

## 9. El harness es AGNÓSTICO AL COMPONENTE (mirando a M6)

Una decisión de diseño que vale puntos en system design: **el harness no se ata a "evaluar una
respuesta de RAG".** Lo diseñás genérico — toma un *trace* (input, pasos intermedios, output) y le
aplica un set de evaluadores. Hoy el trace es `(pregunta, chunks, respuesta)`. En **M6**, cuando
metas agentes, el trace va a ser `(pregunta, trayectoria de tools que llamó el agente, respuesta)`,
y el mismo harness lo va a evaluar — agregás evaluadores de *trajectory* y *tool-correctness*, pero
la infraestructura (golden set, CI gate, dashboard) es la misma.

Si atás el harness a RAG hoy, en M6 lo reescribís. Diseñalo agnóstico ahora y el loop de
agent-eval (M6) se *cierra* sobre el harness de M2 — exactamente el gap que el bar de entrevistas
castiga: *"¿cómo evaluás un agente, no solo una respuesta?"*. La respuesta es "con el mismo harness,
porque lo diseñé agnóstico al componente".

No es solo un ejercicio teórico: la industria se está moviendo hacia acá. DeepEval, por ejemplo,
saltó a su serie 4.x con un "Eval Harness for Coding Agents" — integraciones con agentes de código
y un flujo de patch → eval → retry pensado para trayectorias de agente, no solo respuestas. Cuando
llegues a M6, el mismo harness que construiste acá (golden set, CI gate, dashboard) es la base
sobre la que se para esa capa nueva de evaluadores.

---

## 10. Lo que tenés que poder defender (conecta con `criterios-defensa.md`)

Al cerrar M2, un entrevistador podría preguntarte cualquiera de estas. Si no las podés contestar
con *tus* números y decisiones, el módulo no está cerrado:

- "¿Tu eval es vibes-based o estructurado? Explicame tu proceso." (Sección 2 — error analysis
  primero es LA respuesta)
- "Mostrame tu taxonomía de fallas. ¿De dónde salió?" (Sección 2.2)
- "¿Cómo evaluás retrieval vs generación por separado, y por qué importa separarlos?" (Sección 3)
- "Nombrame métricas de RAGAS y qué mide cada una." (Sección 3 — faithfulness ≠ answer relevancy)
- "¿Cómo funciona tu LLM-judge y qué sesgos tiene? ¿Cómo sabés que es confiable?" (Sección 6 —
  validación contra labels humanos)
- "¿Por qué un modelo barato y separado para el judge?" (Sección 6.6)
- "¿Cómo construiste el golden dataset y por qué acá y no en M1?" (Sección 4)
- "¿Qué pasa en tu CI cuando un cambio baja una métrica?" (Sección 8 — regression gate)
- "¿Cómo evaluarías un *agente* (no solo una respuesta) con este harness?" (Sección 9)

Seguí con `material-apoyo.md` para las fuentes canónicas, después `practica.md` para construir el
harness sobre Grounded.
