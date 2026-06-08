# Auditoría de completitud — ¿el proyecto te vuelve un AI Engineer creíble?

> Research fecha: 2026-06-08. 4 sub-agentes (checklist+audit de gaps · bar de entrevistas · packaging/self-marketing · fundamentos que el producto no enseña).
> Objetivo #1: que Diego pueda venderse/posicionarse como AI Engineer. El proyecto debe cubrir el mapa COMPLETO, no solo lo que un RAG de soporte ejercita.

---

## Veredicto

El proyecto tal como estaba (M0-M10) cubre **~73% de competencias [core]** y **~61% de [common]**. Con los grafts de abajo sube a **~90% core** — suficiente para ser creíble en la gran mayoría de roles de AI Engineer en empresas product-focused.

**La buena noticia (del research de entrevistas):** el producto ES literalmente la pregunta #1 de system design ("Design a RAG for customer support + evaluate it") y el tipo #1 de take-home (RAG/document-Q&A = 40%, agentic = 30%). Estás construyendo exactamente lo que te van a pedir que diseñes y defiendas.

**El riesgo principal:** el producto es API-first. Eso es bueno para roles product, pero deja un gap de percepción con roles que esperan profundidad de infra (inferencia self-hosted, fundamentos de transformers, fine-tuning hands-on). Esos gaps se cierran con side-quests baratos.

---

## Gaps encontrados (rankeados por impacto en credibilidad) y cómo se cierran

| # | Gap | Por qué duele | Cómo se cierra |
|---|---|---|---|
| 1 | **Inferencia self-hosted (vLLM/TGI)** | Aparece en casi todo system design senior ("¿cómo lo servís sin OpenAI?") | Graft en M10: servir el modelo en vLLM sobre GPU free-tier, benchmark throughput |
| 2 | **MCP server authoring** (no solo consumir) | Explotó fin 2025; todo rol agéntico lo espera | Graft en M6: construir un MCP server que expone el RAG como tool (Claude Desktop/Cursor) |
| 3 | **Profundidad de transformers** | Pregunta de teoría en 70% de loops; no saber explicar attention = señal junior | Side-quest A: Karpathy GPT lectures 7+8 (~6-8h) + doc "cómo funciona el modelo que llamás" |
| 4 | **Modelos open-source local (Ollama)** | 22% de roles; baseline 2025; muestra que no dependés de vendor | Graft en M7: swap Ollama (Llama/Mistral) por OpenAI, comparar costo |
| 5 | **Multi-agent frameworks (LangGraph)** | Multi-agent es "el próximo RAG"; system design lo pide | Graft en M6: refactor a 2 agentes (retriever + answer) con state machine |
| 6 | **Fine-tuning HANDS-ON** (no solo literacy) | "¿API caller o engineer?" se responde acá; gap que casi nadie API-first cubrió | M9 hands-on: QLoRA end-to-end sobre Llama-3-1B + dataset de soporte (Bitext), loss curve, eval before/after |
| 7 | **Classic ML + métricas** (precision/recall/F1, overfitting) | "Data/ML blindness" causa rechazos reales (Amazon) | Graft en M9: clasificador de intents (Banking77) → routing barato antes del LLM |
| 8 | **Red-teaming / adversarial eval** | Evals es el #1 diferenciador; red-team es la prueba de que lo tomás en serio | Graft en M5: pass adversarial (jailbreaks, cross-tenant probing, citation injection) con garak |
| 9 | **Multimodal (vision/screenshots)** | 20%+ de casos enterprise; soporte recibe screenshots | Graft en M2: ingestión de screenshots vía GPT-4V/Claude Vision → RAG |
| 10 | **Responsible AI / governance** | EU AI Act es table-stakes para producto EU-facing; model cards = higiene | Wrap M10: model card de 1 página + overview EU AI Act |
| 11 | **DSPy + quantization literacy** | Separan "prompt tinkerer" de "optimizador sistemático" | Sidebars en M3/M7/M9 (no módulos propios) |
| 12 | **Kubernetes / managed cloud (Bedrock/Vertex)** | 26% de roles; esperado en Series B+ | Appendix en M10: YAML k8s de ejemplo + swap a Vertex/Bedrock |

**Math:** el research dice que es el requisito más inflado. Mínimo real = intuición de vectores/dot-product, matmul, distribuciones (temperature/softmax), cross-entropy, gradient descent. Se cubre con Karpathy Makemore MLP (~1h15m) + instrumentar logprobs en el producto. NO necesitás derivar attention ni teoría estadística.

---

## Bar de entrevistas de AI Engineer (2025-2026)

**Loop típico (4 rondas, rango 3-6):** recruiter screen · coding/DSA (~75%) · teoría ML/LLM (~70%) · take-home (33%) · AI system design (~60%) · project deep-dive (~50%) · behavioral (~80%, puede pesar 50%).

**System design — preguntas reales:** "Design a RAG for customer support + evaluate it" · "multi-tenant chatbot con data isolation + cost tracking" · "1M queries/day, optimizá costo" · "manejá hallucination y latencia en prod". → **El proyecto cubre las 3 primeras directamente.**

**Lo que un buen answer demuestra:** clarificar requisitos primero · estimaciones cuantificadas · arquitectura modular (no "usaría LangChain") · fluidez en tradeoffs (RAG vs fine-tune, dense vs sparse, model tiering) · failure modes · evals (RAGAS, golden dataset, LLM-as-judge, A/B). Fallas que matan: saltar a la solución sin clarificar, tratar al LLM como fuente de verdad, solo el happy path.

**Take-home — qué buscan los graders:** (1) **empezar por evals** ("red flag si no lo hace" — quote de founder YC) · (2) sistema configurable · (3) video walkthrough (Loom) · (4) documentar decisiones de diseño con alternativas · (5) conectar métricas a outcomes de negocio. Rubric típico: correctness 30% · arquitectura 30% · **eval methodology 25%** · production readiness 15%.

**Project deep-dive — los drill-downs que importan:** "¿por qué este chunk size? ¿qué probaste antes?" · "¿tu eval es vibes-based o estructurado?" · "¿qué salió mal?" · "¿cómo escalarías a 10x?". Defendible = vos manejaste las decisiones, tenés números, conocés los failure modes, exploraste alternativas.

**Debés poder BUILD/EXPLAIN/WHITEBOARD:** RAG pipeline ✓ · hybrid+rerank ✓ · eval harness con RAGAS+LLM-judge ✓ · agente con tool-calling ✓ · multi-tenant isolation ✓ · prompt injection ✓ · **PERO estudiar aparte:** transformers/attention, tokenization, multi-agent design, MCP.

---

## Packaging: cómo convertir el proyecto en señal de contratación (objetivo #1)

**Señales que los hiring managers pesan (rankeadas):**
1. **Demo deployado live** (87% de recruiters miran GitHub; repos con demo +80% engagement) — la señal #1
2. **Outcomes cuantificados** ("redujo tickets 45%, latencia 200ms") no "construí un RAG"
3. GitHub con commit history en proyecto no-trivial + carpeta `/eval`
4. Señales de producción (error handling, rate limiting, multi-tenancy) — ausentes en 90% de portfolios
5. **Eval dashboard público** (RAGAS, comparación de estrategias) — "raro y de alta señal", <2% de portfolios
6. `DECISIONS.md` (ADRs: por qué pgvector, por qué hybrid, por qué este chunking)
7. Technical writing/blogging (lag 3-6 meses, pero multiplica credibilidad)
8. **MCP server publicado** (diferenciador emergente)
9. Keywords ATS en CV/LinkedIn (RAG, vector DBs, LangChain, multi-agent, evals, FastAPI)

**Reframe de identidad:** NO "full-stack que usó AI" → **"AI Engineer que construye sistemas LLM de producción"**. Es la definición exacta de swyx (SWE que construye CON AI, no researcher). Es honesto, no inflado.

**Checklist de credibilidad (señal-por-esfuerzo):** demo URL → métricas en README+CV → diagrama de arquitectura → DECISIONS.md → audit de keywords ATS → reframe LinkedIn → eval dashboard público → video demo (Loom) → 1er blog post (eval methodology) → carpeta `/eval` reproducible → sitio personal 1-página → MCP server publicado → 2do blog (multi-tenancy) → util open-source de evals → charla meetup.

**Artefactos auxiliares de alta señal:** eval dashboard hosteado · `DECISIONS.md` · video demo 3-5min · MCP server publicado · util open-source de evals · 1 blog post que rankee · charla en AI Engineer meetup.

---

## Fundamentos: grafts rankeados por ROI de credibilidad/hora

| # | Graft | Gap que cierra | Tiempo | Señal |
|---|---|---|---|---|
| 1 | QLoRA fine-tune end-to-end sobre data de soporte | Fine-tuning / training | 1-2 finde | Muy alta |
| 2 | Karpathy GPT lectures 7+8 (implementar) | Transformer literacy | 1 finde | Alta |
| 3 | Clasificador Banking77 + eval propio | Classic ML + evaluación | 1 finde | Alta |
| 4 | Capa SQL analytics sobre logs de prod | Data / SQL | 2-3 días | Alta |
| 5 | Hybrid retrieval BM25+vector+RRF | Data + model literacy | 2-3 días | Alta (ya en M3) |
| 6 | Ingestión screenshots vía vision API | Multimodal | 1 día | Media |
| 7 | Makemore MLP + instrumentar logprobs | Math + eval | 3-4h + 1 día | Media |

---

## Fuentes
github.com/chiphuyen/aie-book/blob/main/ToC.md · roadmap.sh/ai-engineer · github.com/mlabonne/llm-course · github.com/alexeygrigorev/ai-engineering-field-guide (interview/take-home/system-design) · github.com/amitshekhariitbhu/ai-engineering-interview-questions · systemdesignhandbook.com/guides/generative-ai-system-design-interview · zenvanriel.com/ai-engineer-blog · dataexpert.io/blog/ultimate-guide-ai-engineering-portfolios · agenticcareers.co · swyx.io/learn-in-public · eugeneyan.com/writing · karpathy.ai/zero-to-hero.html · cs336.stanford.edu/spring2025 · modelcontextprotocol.io · HF datasets: bitext customer-support, PolyAI/banking77
