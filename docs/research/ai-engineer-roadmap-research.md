# AI Engineer — Research base para proyecto-curso

> Research fecha: 2026-06-08. 4 sub-agentes en paralelo (roadmaps comunidad · cursos · practitioners/definición del rol · mercado laboral).
> Learner: Diego — mid-level full-stack ya shipeando LLM/agentes/RAG/MCP/Langfuse/evals en producción. No parte de cero: formaliza y sube de nivel.

---

## TL;DR — 5 conclusiones que convergen en los 4 ángulos

1. **Evals es la competencia #1.** Todos los practitioners (Huyen le da 2 capítulos, Hamel hizo carrera de esto, swyx, Simon Willison: "the skill that's most needed", Eugene Yan) Y el mercado ("single biggest hiring signal") coinciden. Es el gap más común en equipos LLM.
2. **El rol es system-building, no model-training.** AI Engineer = construir sistemas confiables *alrededor* de foundation models vía APIs/prompting/retrieval/orquestación. No requiere entrenar modelos ni teoría de transformers profunda.
3. **El stack core que se repite en TODOS los roadmaps:** Python → LLM APIs → prompting → embeddings/vector DBs → RAG → agentes/tool-use → deploy → evals.
4. **Sobrevalorado (lo dicen explícitamente):** fine-tuning como primer recurso, "Attention is All You Need" como punto de partida, prompt-engineering como skill standalone/certificable, benchmarks saturados (MMLU/HumanEval), retrieval solo-embeddings, modelos locales para agentes en prod.
5. **Lo que mueve la aguja para hiring = portfolio, no certificados.** Artefactos deployados con métricas. El full-stack de Diego es un diferenciador real vs AI engineers puros.

---

## Competencias core rankeadas por consenso de practitioners

| # | Competencia | Quién la enfatiza |
|---|---|---|
| 1 | **Evals** (domain-specific, assertion-based, sobre data de prod) | Huyen (2 caps), Hamel (carrera entera), Eugene Yan, swyx, Simon Willison, applied-llms.org |
| 2 | **RAG / retrieval** (hybrid BM25+semantic, métricas de retrieval antes de generation) | Huyen, Eugene Yan, Jason Liu, applied-llms.org, swyx |
| 3 | **Prompt eng / in-context learning** (n-shot, CoT, structured I/O, defensive) | Huyen, applied-llms.org, swyx, Eugene Yan |
| 4 | **Agentes y orquestación** (tool use, planning, multi-step, memoria) | Huyen, swyx, applied-llms.org, Simon Willison |
| 5 | **Fine-tuning literacy** (cuándo SÍ/NO, LoRA/PEFT, dataset eng) | Huyen, applied-llms.org, swyx, Eugene Yan |
| 6 | **Monitoring/observability/arquitectura prod** (guardrails, caching, gateways, feedback loops) | Huyen, Eugene Yan, applied-llms.org, Jason Liu |
| 7 | **Structured outputs** | Jason Liu (creador de Instructor), Huyen, applied-llms.org |
| 8 | **Model literacy** (sampling, tokenization, context, build-vs-buy) | Huyen, swyx, Karpathy |
| 9 | **Security/safety** (prompt injection, "lethal trifecta", guardrails) | Huyen, Simon Willison, applied-llms.org |
| 10 | **Data engineering for AI** (curación, síntesis, flywheels) | Huyen, Eugene Yan, applied-llms.org |

**Definición de consenso del rol:** Software engineer que construye apps de producción sobre foundation models — principalmente vía APIs, prompting, retrieval y orquestación — sin necesariamente entrenar modelos. Más cerca de SWE que de ML research. El skill definitorio NO es conocimiento del modelo sino *disciplina de construcción de sistemas*: evals, pipelines de retrieval, guardrails, feedback loops.

---

## Mercado laboral 2025–2026 (must-have vs nice-to-have)

Datos de 534 listings agentic + reportes (a16z, O'Reilly, LinkedIn, PwC).

**Must-have (bloquea candidatura si falta):**
- Python producción (93.4% de listings)
- LLM API integration (OpenAI/Anthropic/Gemini) — near-universal
- RAG architecture (65% de LLM listings) — chunking, embeddings, hybrid search, re-ranking
- Agentes/tool-calling (+280% YoY) — LangChain/LangGraph/CrewAI
- Cloud (AWS 34.7% / GCP 29.1% / Azure 24.4%) — uno profundo
- Docker (32.4%)
- **Evals** — "single biggest hiring signal" en senior
- Git + REST

**Nice-to-have (premium, no bloqueante):**
- MCP (16.9%, "fastest riser") — diferenciador 2026
- LLMOps/observability (Langfuse/LangSmith) — diferenciador senior
- TypeScript/full-stack (17.4%) — **el diferenciador de Diego**
- Fine-tuning/LoRA (+25–40% salario pero nicho, ~5–10% de listings)
- Guardrails/OWASP LLM Top 10 (must-have a nivel staff)
- Kubernetes (27.2%, suele ser del platform team)

**Skip (hype en cursos, raro en jobs):** fine-tuning como general requirement, prompt-eng certs, TensorFlow, RLHF (research labs), certs AWS ML.

**Salario:** Mid US base $120–210K / TC $170–280K. Remoto LatAm para US: est. $40–80K mid, $60–120K senior. AI skills = +56% wage premium (PwC 2025). Arquitectar agentic workflows = +46% sobre Python dev estándar en LatAm.

**Top 5 artefactos de portfolio que señalan competencia:**
1. **RAG system + eval harness** (golden dataset, LLM-as-judge, iteración documentada) — el mayor signal
2. **Multi-agent orchestration** (supervisor pattern, tool loops, failure recovery, cost tracking)
3. **Proyecto LLMOps-instrumentado** (Langfuse/LangSmith traces, dashboards latencia/costo)
4. **Producto full-stack AI con URL live** + outcome cuantificado ← fortaleza de Diego
5. **Open-source / MCP server** publicado con usuarios reales

Red flags (78% de portfolios los cometen): demos Streamlit envolviendo GPT sin evals, data de juguete (MNIST/Titanic), "prompt engineering" como skill sin evidencia, solo notebooks sin deploy.

---

## Cursos y recursos — shortlist para dev experimentado

**Top tier:**
1. **Maven: AI Evals for Engineers & PMs** (Hamel Husain + Shreya Shankar) — $4,200, 4 sem. El curso #1 para LLM eng de producción. El gap #1 de los equipos.
2. **Karpathy: Neural Networks Zero to Hero** — gratis, ~20h. GPT desde cero. Internals sin igual.
3. **Stanford CS336: Language Modeling from Scratch** — gratis (YouTube+GitHub) + ~$20–100 GPU. El curso más riguroso de internals.
4. **DeepLearning.AI short courses (gratis, ~2h c/u):** "Building and Evaluating Advanced RAG", "Automated Testing for LLMOps", "MCP with Anthropic", "DSPy", "Pydantic for LLM Workflows".
5. **Maven: Systematically Improving RAG** (Jason Liu + Dan Becker) — si RAG es central.
6. **Hugging Face: LLM Course + Agents Course** — gratis, ir directo a units de frameworks.
7. **Stanford CS25 Transformers United V6** — seminario gratis, frontera research.

**Libro canónico:** Chip Huyen, *AI Engineering: Building Applications with Foundation Models* (O'Reilly 2025). 10 capítulos = el curriculum de referencia:
1. AI Engineering Stack · 2. Foundation Models · 3. Evaluation Methodology · 4. Evaluate AI Systems · 5. Prompt Engineering · 6. RAG and Agents · 7. Finetuning · 8. Dataset Engineering · 9. Inference Optimization · 10. Architecture & User Feedback.

**Reading list:** swyx "2025 AI Engineering Reading List" (~50 papers, 10 áreas).

**Saltar como dev experimentado:** AI Python for Beginners, AI for Everyone, ChatGPT Prompt Eng for Devs, crewAI/AutoGen beginner courses, Full Stack LLM Bootcamp (material 2023), fast.ai Part 1.

---

## Roadmaps de comunidad — hilo común

Aparecen en TODOS: Python · LLM APIs · prompting (zero/few-shot, CoT) · embeddings+vector DBs · RAG · agentes/tool-use · deploy (FastAPI/Docker/cloud) · evals.

**Roadmaps destacados:**
- **roadmap.sh/ai-engineer** — 7 stages LLM-app focus (Foundation → Prompting → Building → RAG → Agents → LLMOps → Fine-tuning).
- **mlabonne/llm-course** (HF) — el más riguroso. Dual track: LLM Scientist (8 mods) + LLM Engineer (8 mods, incl. inference optimization y edge deploy, raros).
- **Microsoft: Generative AI for Beginners** (21 lecciones) + **AI Agents for Beginners** (18 lecciones, incl. MCP/A2A, metacognición, context engineering).
- **dataquest** y **KDnuggets 2026** — project-dense, incluyen MCP explícito.

**Gaps avanzados a targetear (poco cubiertos, alto valor para mid-level):** inference optimization (Flash Attention, KV cache, speculative decoding), context engineering como disciplina nombrada, DSPy (prompt optimization programático), model merging, agentic protocols (MCP/A2A), edge deployment.

---

## Recomendación para Diego (ya en producción) — saltar lo básico, targetear gaps

1. **Evals con rigor** — RAGAS, LLM-as-judge, error analysis, CI/CD para prompts/modelos (el gap #1 universal)
2. **Inference optimization** — Flash Attention, KV cache (MQA/GQA), speculative decoding (solo mlabonne/CS336 lo cubren = alto signal)
3. **Fine-tuning literacy** — LoRA/QLoRA en 7–13B vía HF peft+trl; saber cuándo NO
4. **DSPy** — optimización programática de prompts (cutting-edge)
5. **LLMOps riguroso** — prompt versioning, A/B testing, drift detection (patrones de prod Langfuse)
6. **Multi-agent design patterns** — metacognición, planning, context engineering
7. **AI security** — red teaming, garak, prompt injection sistemático

---

## Fuentes (todas verificadas por los sub-agentes)

**Roadmaps:** roadmap.sh/ai-engineer · roadmap.sh/ai-data-scientist · github.com/mlabonne/llm-course · github.com/microsoft/generative-ai-for-beginners · github.com/microsoft/ai-agents-for-beginners · dataquest.io/blog/ai-engineer-roadmap · kdnuggets.com (self-study roadmap 2026) · github.com/dswh/ai-engineer-roadmap · github.com/tensorchord/Awesome-LLMOps · github.com/alexeygrigorev/ai-engineering-field-guide

**Cursos:** deeplearning.ai/courses · learn.deeplearning.ai · course.fast.ai · huggingface.co/learn · github.com/anthropics/prompt-eng-interactive-tutorial · developers.openai.com/cookbook · web.stanford.edu/class/cs25 · cs336.stanford.edu/spring2025 · stanford-cs329s.github.io · karpathy.ai/zero-to-hero.html · maven.com/parlance-labs/evals · maven.com/applied-llms/rag-playbook

**Practitioners:** latent.space/p/ai-engineer · latent.space/p/2025-papers · huyenchip.com/books · github.com/chiphuyen/aie-book · hamel.dev/blog/posts/evals · eugeneyan.com/writing/llm-patterns · applied-llms.org · jxnl.co · simonwillison.net/2025/Dec/31/the-year-in-llms

**Mercado:** digitalapplied.com/blog/ai-developer-hiring-skills-that-matter-2026 · agentic-engineering-jobs.com/langchain-job-market-2026 · remotelytalents.com (salaries 2026 LatAm) · dbreunig.com/2025/08/21/a-guide-to-ai-titles · a16z.com/ai-enterprise-2025 · jobsbyculture.com/blog/agentic-ai-hiring-boom-2026 · kore1.com/ai-engineer-salary-guide
