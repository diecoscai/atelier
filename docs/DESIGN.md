# soporte-rag — Documento de diseño (v3, post cross-check de roadmaps+cursos)

> **Nombre de trabajo:** `soporte-rag` (placeholder).
> **Qué es:** un RAG SaaS multi-tenant de soporte al cliente B2B que es, a la vez, un **curso autodidacta de AI engineering**, estructurado en un **track Core (M0–M4) → hireable checkpoint**, un **track Extended (M5–M11)**, y side-quests de fundamentos.
> **Fecha:** 2026-06-08 (v3). Basado en 4 rondas de research + 1 validación crítica de contexto fresco + 1 cross-check contra roadmaps y cursos confiables, todo en `docs/research/` (`roadmaps-crosscheck.md`, `courses-crosscheck.md`, `coverage-verdict.md`).
> **Cambios v2→v3 (cierran los gaps del cross-check):** isolation multi-tenant básico sube a M4 (checkpoint diferenciador) · error-analysis es el Paso 0 explícito de M2 (método Hamel/Shreya) · loop de agent-eval cerrado en M6 (traces de agente → harness de M2) · deploy real a managed cloud en M10 · stream de prep DSA paralelo desde M4.
> **Cambio clave (defensibilidad):** se agrega una **capa de defensibilidad transversal** — criterios de defensa + `pruebas.md` de dos capas (tests + defense drills) + `DECISIONS.md`/ADRs desde M0 + **hard gate** entre módulos. El entregable real es poder *defender* cada decisión, no solo construirla.

---

## Objetivos (en orden de prioridad)

1. **(Dominante) Posicionar a Diego como AI Engineer** — contratabilidad y credibilidad. El proyecto cubre el grueso del mapa de competencias, produce los artefactos que los hiring managers pesan, prepara para el bar de entrevistas, **y se vuelve resume-able al final del track Core (M4)** en vez de recién al final.
2. **(Futuro/bonus) Producto vendible** — al final es un SaaS instalable en un inbox de soporte, multi-tenant, deployado. El plumbing de monetización es secundario y se difiere.

## Decisiones de diseño (fijadas con el usuario)

- Forma: producto-curso único · objetivo por módulo: balance técnico/portfolio · stack híbrido TS+Python · vertical soporte B2B SaaS · núcleo técnico primero · spine = evals.
- **Reestructura (v2):** track Core M0-M4 con **hireable checkpoint duro en M4**; track Extended M5-M11 aditivo. El plan completo sigue siendo la meta; el checkpoint da un hito vendible temprano y baja el riesgo de abandono.
- **Plumbing de baja señal AI diferido:** multi-tenancy sí (aislamiento es core: **isolation básico determinístico sube a M4** para que el checkpoint sea diferenciador, no solo demo; security profundo + red-team queda en M5). Stripe billing → opcional/M10. Queues → async Python simple primero, BullMQ+Celery solo si hace falta. Integración → UNA plataforma (Intercom O Zendesk) sandbox; marketplace = hito GTM post-M11.
- **Grafts GPU (QLoRA + vLLM):** obligatorios pero en track Extended (M9/M10), enmarcados como ejercicio de aprendizaje en Colab/RunPod, no deploy de producción. No bloquean el checkpoint.

## Honestidad sobre cobertura (corrige el "90%")

No reclamamos "90% de competencias". Usamos un mapa de profundidad honesto por tema: **awareness / can-explain / can-build / can-defend-in-system-design**. Algunos temas (DSPy, quantization, governance) son sidebars de nivel *awareness/can-explain*, no *can-build*. El objetivo es poder **defender en system design** los temas core (RAG, evals, retrieval, agentes, multi-tenancy, security) y tener *can-build* demostrable en ellos. Mapeo completo en `docs/research/ai-engineer-completeness-audit.md`, con las correcciones de `critical-validation.md`.

---

## Capa de defensibilidad (el entregable real)

> **Principio rector:** el entregable no es el código, es **poder defender cada decisión**. Un AI Engineer creíble justifica *por qué* este chunk size, *qué* probó antes, *cómo* escala 10x, *qué* falló. Eso se entrena con cada módulo, no aparece al final. Esta capa corre **transversal a todos los módulos** y es lo que convierte "construí un RAG" en "soy AI Engineer".

**1. Criterios de defensa por módulo.** Cada módulo arranca declarando, en el nivel honesto (*can-explain / can-build / can-defend-in-system-design*), qué tenés que poder hacer al terminarlo. No "aprendí hybrid search" sino "puedo justificar RRF vs weighted-merge con los números de recall de **mi** sistema".

**2. `pruebas.md` en dos capas** (el archivo ya existe en la estructura; le damos contenido real):
   - **Tests automatizados** — código + evals que prueban que *funciona* (corren contra el harness de M2).
   - **Defense drills** — las preguntas de entrevista exactas para ese módulo + las decisiones a justificar *con tus propios números*. Es el ensayo del project deep-dive.

**3. `DECISIONS.md` (ADRs) desde M0** — cada elección no-trivial logueada con alternativas consideradas + el número que la respaldó. Munición para el deep-dive y señal de portfolio que los hiring managers pesan.

**4. HARD GATE entre módulos.** No se avanza a M(N+1) hasta **pasar el defense drill de M(N)**: justificación escrita con números + ADR logueado. Más lento, pero garantiza que cada punto queda defendible y que no se acumula deuda de defensa. **Mock defense completo** (entrevista simulada) en el checkpoint M4 y en el capstone M11.

---

## Arquitectura

```
TYPESCRIPT (Next.js 15)                       PYTHON (FastAPI)
─────────────────────────────────            ─────────────────────────────────
Frontend: upload UI, chat UI (Vercel AI SDK)  Parsing (Docling/Unstructured)
API/BFF: auth, org ctx, rate-limit            Chunking + embeddings
Streaming chat proxy                           Retrieval (hybrid + rerank)
Billing (Stripe, diferido a M10)              LangGraph agents
                                               RAGAS/DeepEval evals + QLoRA (M9)
  Core: async Python simple para ingestion. Queues robustas (BullMQ+Celery) solo si escala (Extended).
  REST (retrieval) · SSE (chat).

Datos: Postgres + pgvector (MVP → y suficiente para todo el curso)
       Migración a Qdrant self-hosted como ejercicio de aprendizaje (Extended).
Embeddings: OpenAI text-embedding-3-small (start) → BGE-M3 (opcional)
Rerank: Cohere /rerank (start) → cross-encoder self-hosted
Observability/evals: Langfuse · RAGAS + DeepEval (pytest-native) · GitHub Actions
Infra: Docker + Fly.io/Railway. vLLM/fine-tuning en Colab/RunPod (Extended, GPU).
```

(Turbopuffer eliminado — YAGNI, nunca llegás a esa escala en el curso.)

**Regla cardinal de seguridad:** aislamiento de tenants determinístico en la capa de DB (JWT → tenant_id → namespace hard-scoped). NUNCA confiar en el system prompt.

**Pipeline RAG (System 1):** `Query → [BM25 + Dense] → RRF → cross-encoder rerank → LLM con citations`. **Nota de currency:** los reasoning models (o3, Opus 4.x, Gemini 2.5) ganan poco o degradan con RAG document-level estándar → reasoning-driven retrieval (System 2). Se cubre como awareness + DECISIONS entry en M6.

---

## TRACK CORE (M0–M4) → Hireable checkpoint

Meta: en ~3-4 meses, un sistema **deployado, con eval dashboard público, hybrid retrieval y repo evaluable en 5 min** — suficiente para listar en el CV y defender en entrevista. Cada módulo se mide contra el golden dataset (creado en M2 contra docs reales).

### M0 — setup + thin slice + onboarding Python
- **Concepto:** el stack de AI engineering (3 capas).
- **Feature:** monorepo TS+Python; subir 1 doc → chunk naive → pgvector → RAG single-shot → chat streaming; deployado temprano (aunque read-only).
- **⊕ Onboarding Python (medio día):** type hints, async/await, Pydantic, uv, pytest. (Evita el "tax" de aprender Python debugueando.)
- **⊕ Capa de defensa arranca:** `DECISIONS.md` con su primer ADR (por qué monorepo, por qué pgvector de entrada); `criterios-defensa.md` del módulo; primer defense drill ("¿por qué chunk naive acá y qué vas a romper en M1?").
- **Side-quest A arranca:** Karpathy GPT lectures 7+8.

### M1 — ingestion de docs reales + multimodal
- **Concepto:** data engineering for AI.
- **Feature:** parsing (Docling/Unstructured); chunking layout-aware + recursive + semántico; async Python simple; tablas/OCR.
- **⊕ Graft multimodal:** ingestión de screenshots vía vision API (GPT-4V/Claude Vision).
- *(Ingestion antes que evals para que el golden dataset se construya contra docs reales, no contra el MVP naive.)*

### M2 — evals harness + golden dataset (LA SPINE)
- **Concepto:** evaluation methodology (Huyen c3-4, Hamel/Shreya).
- **Paso 0 — error analysis primero (método canónico):** correr el sistema actual contra queries reales, leer traces, **construir una taxonomía de fallas a mano** (open coding → axial coding). Las métricas y los judges se diseñan *contra esa taxonomía*, no al revés. Esto es lo que separa "evals serios" de "métricas vibes-based" en el bar de entrevistas.
- **Feature:** synthetic Q&A contra docs ya ingestados; golden dataset 50+ derivado de la taxonomía; **RAGAS + DeepEval** (pytest-native, comparar); LLM-as-judge alineado a fallas reales (modelo barato separado); Langfuse tracing; pytest CI gate (GitHub Actions); **eval dashboard público arranca acá**.
- **Por qué:** el #1 diferenciador y lo que los wrappers saltan. Desde acá todo cambio se mide. El harness se diseña **agnóstico al componente** para poder evaluar también traces de agente (ver M6).

### M3 — advanced retrieval + MCP server standalone
- **Concepto:** advanced RAG / IR.
- **Feature:** hybrid (BM25 + dense), RRF, reranking (cross-encoder/Cohere), metadata filtering, query rewriting/HyDE.
- **Sidebar:** DSPy (awareness — optimización programática, comparar vs hand-tuned).
- **⊕ Extraer MCP server como mini-proyecto standalone publicable** (expone el RAG como tool; señal de más rápido crecimiento del mercado, live y acumulando stars temprano).
- **Se mide:** recall@5 hybrid+rerank vs naive baseline.

### M4 — structured outputs + trust + multi-tenant isolation + **DEPLOY (HIREABLE CHECKPOINT)**
- **Concepto:** structured outputs, trustworthy AI, aislamiento multi-tenant + shipping.
- **Feature:** schema (Instructor/Pydantic), citations al pasaje exacto, "no sé" calibrado, confidence vía logprobs.
- **⊕ Multi-tenant isolation básico (subido desde M5):** JWT → tenant_id → namespace hard-scoped en la capa de DB; test que prueba que el tenant A no puede recuperar docs del tenant B. Es la pregunta #1 de system design y lo que hace que el checkpoint sea **diferenciador, no un demo de RAG genérico**. (El red-team adversarial profundo queda en M5.)
- **⊕ Side-quest B (math):** Karpathy Makemore MLP + instrumentar logprobs.
- **⊕ CHECKPOINT:** deploy público con TLS; `DECISIONS.md` (ADRs + sección "qué lo hace distinto de My AskAI/Ragie"); diagrama de arquitectura; README con métricas (recall@5, aislamiento verificado); demo. **Estado: resume-able, defendible en entrevista, evaluable en 5 min.**
- **⊕ Stream de prep DSA arranca (out-of-product, paralelo):** patterns de coding-round (~75% de los loops). No es módulo del producto; es una pista paralela de práctica (arrays/hashing/two-pointers/graphs/DP básico) que corre desde acá hasta entrevistas. Tracking aparte, no bloquea el checkpoint.

---

## TRACK EXTENDED (M5–M11) — aditivo, post-checkpoint

### M5 — security profundo + red-team (sobre el isolation básico de M4)
Endurecer el aislamiento de M4: ACL-aware retrieval (no solo namespace), PII redaction, defensa prompt injection / doc poisoning, sanitización. **⊕ Graft red-team:** suite adversarial con garak (jailbreaks, cross-tenant probing, citation injection) corriendo en CI. *(El isolation determinístico básico ya está en M4 y pre-carga la diferenciación; M5 lo lleva a "can-defend-in-system-design".)*

### M6 — agentic RAG + multi-agent + context engineering + reasoning-RAG
Agent vs chain, query routing, multi-hop, retrieval iterativo, memoria (LangGraph). **⊕ Multi-agent:** 2 agentes LangGraph (retriever + answer) con state machine. **⊕ Context engineering** promovido a tema de primera clase (no transversal). **⊕ Reasoning-RAG awareness:** System 1 vs System 2 RAG + DECISIONS entry ("pipeline fijo vs reasoning-driven retrieval"; cómo lo adaptarías para o3/Gemini 2.5).
- **⊕ Cerrar el loop de agent-eval (conecta con M2):** rutear los traces de agente (trajectory: qué tools llamó, en qué orden, con qué args) por el harness de M2 — agregar métricas de trajectory/tool-correctness + un judge de "¿el agente tomó el camino correcto?". Sin esto, los evals (M2) y los agentes (M6) quedan desconectados — gap real que el bar de entrevistas castiga ("¿cómo evaluás un agente, no solo una respuesta?").

### M7 — LLMOps + cost + open-source models
Model routing por complejidad, semantic caching, token budgets, A/B de prompts, drift detection, dashboards (TTFT, p95). **⊕ Graft open-source:** swap Ollama (Llama 3.1/Mistral) + comparación de costo. **Sidebar:** quantization primer (INT8/INT4/GGUF). *(Si hace falta escala: introducir BullMQ+Celery acá; si no, async simple.)*

### M8 — integración vertical (UNA plataforma, sandbox)
Webhook receiver + first-response bot para **Intercom O Zendesk** (no ambos), con data sandbox/sintética; escalation logic; métricas de deflection. **Marketplace listing = hito GTM post-M11, no curriculum** (requiere OAuth partner + review de semanas + clientes reales).

### M9 — fine-tuning hands-on (GPU) + classic ML
**⊕ Graft pesado (Colab T4 free / RunPod ~$2):** QLoRA end-to-end sobre Llama-3-1B + dataset soporte (Bitext); loss curve; eval before/after; "cuándo fine-tune gana a RAG". Embedding fine-tuning de dominio. **⊕ Graft classic ML:** clasificador de intents (Banking77) con precision/recall/F1/confusion → routing barato antes del LLM.

### M10 — managed cloud deploy + self-hosted inference + governance + billing (opcional)
**⊕ Managed-cloud deploy real (construido, no apéndice):** mover el deploy de PaaS (Fly/Railway) a UN big-3 — GCP Cloud Run o AWS ECS/App Runner — con IaC mínimo. Cierra el gap de "managed cloud" que el 26% de los roles esperan y que un apéndice de YAML no demuestra. **⊕ Graft pesado (GPU, ejercicio de aprendizaje):** servir el modelo en vLLM sobre Colab/RunPod, benchmark de throughput vs API — **enmarcado como "entiendo y corrí inference optimization", no "opero un cluster GPU"** (honesto). **⊕ Governance:** model card + overview EU AI Act. **Billing Stripe (diferido acá, opcional).** Awareness: swap a Bedrock/Vertex managed LLM.

### M11 — capstone: packaging + **DISTRIBUCIÓN**
- **Packaging:** demo deployado · eval dashboard público (ya live desde M2) · `DECISIONS.md` (ya iniciado M4) · video demo (Loom) · **2 blog posts** (eval methodology; multi-tenancy isolation) · publicar/amplificar el MCP server (de M3) · sitio personal · **reframe CV/LinkedIn a "AI Engineer"** + audit keywords ATS · positioning statement con diferenciación vs competidores.
- **⊕ Distribución (el gap que el crítico marcó):** lista de 10-15 empresas/arquetipos donde este portfolio calza fuerte (product cos / Series A-B con features AI) · 2-3 canales LatAm→US (Tecla, MLOps Community LatAm, HireLATAM) · estrategia de distribución concreta (plataforma, cadencia, formato). *Los portfolios no se descubren, se presentan.*

---

## Side-quests de fundamentos

| ID | Side-quest | Gap | Cuándo | Tiempo |
|---|---|---|---|---|
| A | Karpathy GPT lectures 7+8 + doc "cómo funciona el modelo" | Transformer literacy | M0→M4 | 1 finde |
| B | Karpathy Makemore MLP + instrumentar logprobs | Math intuition + eval | M4 | 3-4h + 1 día |
| C | clasificador Banking77 + eval | Classic ML | folded en M9 | 1 finde |

Math: solo intuición (vectores/dot-product, matmul, softmax/temperature, cross-entropy, gradient descent). NO derivar attention.

---

## Estructura de archivos por módulo (espejo de yomi + capa de defensibilidad)
`docs/chapters/M{N}-{slug}/`:
- `leccion.md` — concepto · `material-apoyo.md` — recursos · `practica.md` — el feature a construir.
- `criterios-defensa.md` — qué tenés que poder explicar/build/defender al terminar (nivel honesto por ítem).
- `pruebas.md` — **dos capas:** (1) tests automatizados (código + evals) que prueban que funciona; (2) defense drills (preguntas de entrevista + decisiones a justificar con tus números). **Pasar la capa 2 es el HARD GATE para avanzar.**

Docs maestros: `COURSE-ROADMAP.md`, `REQUIREMENTS.md`, `GLOSSARY.md`, **`DECISIONS.md` (ADRs, desde M0)**. Learnings POST-coding en `docs/learnings/M{N}.md`. Research en `docs/research/`.

## Fuera de scope por diseño
Pre-training desde cero, training distribuido multi-GPU (FSDP/DeepSpeed), data engineering a escala warehouse (Spark/Kafka), recommendation systems, voice/video. (No necesario para el claim de AI Engineer generalista product-focused.)

## Preparación para entrevistas
El producto ES la pregunta #1 de system design y el take-home #1 — pero eso es **table-stakes, no diferenciador**: la diferenciación (evals con error-analysis primero, multi-tenancy desde M4, hybrid, agent-eval) tiene que estar hecha y visible desde el checkpoint M4. Las 4 rondas del loop típico quedan cubiertas: **system design** (el producto), **teoría ML/LLM** (side-quests A/B), **take-home/deep-dive** (números, failure modes, alternativas, decisiones — M11), y **coding/DSA** (stream paralelo desde M4). Detalle del bar de entrevistas en `docs/research/coverage-verdict.md` y `ai-engineer-completeness-audit.md`.
