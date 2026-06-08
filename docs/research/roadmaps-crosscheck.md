# AI Engineer Roadmaps — Cross-Check & Canonical Competency Checklist

> Researched 2026-06-08. Goal: merge the most-cited 2025–2026 AI Engineer roadmaps into one canonical, exhaustive competency checklist that an aspiring AI Engineer should master to credibly hold the title.

## Sources surveyed

| # | Source | Type | URL |
|---|--------|------|-----|
| R1 | roadmap.sh — AI Engineer | Official interactive roadmap | https://roadmap.sh/ai-engineer |
| R2 | Chip Huyen — *AI Engineering* (O'Reilly, 2025) | Book / canonical reference | https://github.com/chiphuyen/aie-book · https://www.oreilly.com/library/view/ai-engineering/9781098166298/ |
| R3 | mlabonne/llm-course — LLM Scientist + LLM Engineer | GitHub roadmap (2025 ed.) | https://github.com/mlabonne/llm-course |
| R4 | swyx / Latent Space — "Rise of the AI Engineer" | Framing essay (defines the role) | https://www.latent.space/p/ai-engineer |
| R5 | Applied LLMs — "What We Learned from a Year of Building with LLMs" (Yan, Husain, Liu, Bischof, Frye, Shankar) | Practitioner field guide | https://applied-llms.org/ · https://www.oreilly.com/radar/what-we-learned-from-a-year-of-building-with-llms-part-i/ |
| R6 | Hamel Husain — LLM Evals + practitioner course | Evals authority | https://hamel.dev/blog/posts/evals-faq/ · https://hamel.dev/blog/posts/evals/ |
| R7 | "The Agent Engineer · 2026 Roadmap" (ch-balaji) | 2026 agent-centric roadmap (9 phases) | https://ch-balaji.github.io/ai-engineer-roadmap/ |
| R8 | MachineLearningMastery — "Roadmap for Mastering LLMOps in 2026" | LLMOps roadmap | https://machinelearningmastery.com/the-roadmap-for-mastering-llmops-in-2026/ |
| R9 | Turing College — AI Engineer Roadmap | Career roadmap | https://www.turingcollege.com/blog/ai-engineer-roadmap-how-to-become-an-ai-engineer |
| R10 | Anthropic — "Building Effective Agents" | Official vendor guidance | https://www.anthropic.com/research/building-effective-agents · https://www.anthropic.com/engineering/writing-tools-for-agents |

---

## 1. Per-roadmap competency areas

### R1 — roadmap.sh / AI Engineer
*Framing: "an AI Engineer uses pre-trained models and existing AI tools to improve user experiences" — application layer, not model training.*

| Section | Topics |
|---|---|
| AI vs ML, terminology | AI vs AGI, LLM/foundation-model basics, roles & responsibilities, impact on product dev |
| Pre-trained models | Popular models (OpenAI, Anthropic Claude, Google Gemini, Mistral, Cohere, Llama/HF), capabilities, context length, cutoff/knowledge dates, benefits & limitations of pre-trained models |
| OpenAI / provider APIs | Chat completions, embeddings APIs, Azure AI, AWS SageMaker, Bedrock, Hugging Face |
| Prompt engineering | Zero/few-shot, role/system prompts, prompt injection awareness |
| Token & cost management | Max tokens, token counting, pricing/cost considerations |
| Embeddings | Embedding models, semantic search |
| Vector databases | Indexing, querying, popular stores (Pinecone, Weaviate, Chroma, pgvector, etc.) |
| RAG | Retrieval-augmented generation pipeline, chunking |
| AI agents | Agent concepts, tools/function calling |
| Multimodal AI | Image/audio/video models, OCR, TTS/STT |
| Fine-tuning | When/how to fine-tune vs prompt vs RAG |
| Dev tools | LangChain, LlamaIndex, AI SDKs, Ollama |
| AI safety & ethics | Bias, safety, responsible use |

### R2 — Chip Huyen, *AI Engineering* (full ToC)
*The most authoritative single reference. 10 chapters.*

| Ch | Title | Key competencies |
|---|---|---|
| 1 | Building AI Applications with Foundation Models | Rise of AI engineering, use-case evaluation, setting expectations, milestone planning, **the 3-layer AI stack**, AI Eng vs ML Eng vs full-stack |
| 2 | Understanding Foundation Models | Training data (multilingual/domain), architecture, model size, post-training (SFT + preference/RLHF), **sampling** (strategies, **test-time compute**, structured outputs, probabilistic nature) |
| 3 | Evaluation Methodology | LM metrics (entropy, cross-entropy, perplexity, BPC/BPB), exact eval (functional correctness, similarity, embeddings), **AI-as-a-judge**, comparative/ranking eval |
| 4 | Evaluate AI Systems | Eval criteria (domain capability, generation, instruction-following, cost/latency), **model selection** (build-vs-buy, public benchmarks), designing an eval pipeline |
| 5 | Prompt Engineering | In-context learning, system/user prompts, **context length & efficiency**, best practices, prompt versioning, **defensive prompting** (jailbreak, injection, extraction) |
| 6 | RAG and Agents | RAG architecture & retrieval algorithms, retrieval optimization, RAG beyond text; **agents** (tools, planning, failure modes & eval), **memory** |
| 7 | Finetuning | When/when-not, RAG-vs-finetune, memory math & numerical reps, **quantization**, PEFT/LoRA, model merging, multi-task |
| 8 | Dataset Engineering | Data curation (quality/coverage/quantity), acquisition & annotation, **data synthesis & augmentation**, model distillation, processing (dedup/clean/filter/format) |
| 9 | Inference Optimization | Inference metrics, AI accelerators, model optimization, **inference service optimization** (batching, KV cache, etc.) |
| 10 | AI Engineering Architecture & User Feedback | Context enhancement, **guardrails**, **model router & gateway**, **caching**, agent patterns, **monitoring/observability**, **pipeline orchestration**, **user feedback / data flywheel** |

**The 3-layer AI stack (R2):** (1) Application development — prompting, context, evals, interface; (2) Model development — fine-tuning, dataset eng, inference optimization; (3) Infrastructure — serving, compute, monitoring.

### R3 — mlabonne/llm-course
Three tracks. The **LLM Engineer** track is the AI-Engineer-relevant one; the **LLM Scientist** track is for those who train models.

**LLM Fundamentals (optional base):** math for ML, Python for ML, neural networks, classical NLP (embeddings, RNNs).

**LLM Engineer (productionization):**
1. Running LLMs — LLM APIs, open-source LLMs, prompt engineering, **structuring outputs**
2. Building a vector storage — ingesting docs, splitting/chunking, embedding models, vector DBs
3. RAG — orchestrators, retrievers, memory, evaluation
4. Advanced RAG — query construction, tools, post-processing, "program LLMs" (DSPy-style)
5. **Agents** — agent fundamentals, **agent protocols (MCP/A2A)**, vendor frameworks, other frameworks
6. Inference optimization — Flash Attention, **KV cache**, speculative decoding
7. Deploying LLMs — local, demo, server (TGI/vLLM), **edge deployment**
8. **Securing LLMs** — prompt hacking, backdoors, defensive measures

**LLM Scientist (model-building, adjacent):** architecture/tokenization/attention/sampling, pre-training, post-training datasets & synthetic data, SFT, **preference alignment (DPO/RLHF)**, evaluation, **quantization** (GGUF/GPTQ/AWQ), new trends (model merging, multimodal, **interpretability**, **test-time compute**).

### R4 — swyx, "Rise of the AI Engineer" (definition of the role)
No checklist — it *defines the role*. Key claims:
- AI Engineer = **software engineer who builds with foundation models/APIs** ("shift right" of applied AI), distinct from ML Engineers who train models.
- Effective AI Engineers often "have not done Andrew Ng Coursera courses, nor know PyTorch."
- Core requirement = **software engineering fundamentals** + fluency with the emerging stack (LangChain/LlamaIndex, vector DBs/Pinecone, prompt engineering, code that orchestrates LLMs).
- Emphasis on **rapid iteration, evaluation, and production integration** over model internals.

### R5 — Applied LLMs (practitioner field guide)
Organized **Tactical / Operational / Strategic**:
- **Tactical:** prompting (n-shot, CoT, structured I/O, decomposition), **RAG & information retrieval** (hybrid BM25+embeddings, relevance/density/detail), workflow tuning (multi-step decomposition, deterministic flows), **evaluation & monitoring** (assertion/unit tests from prod samples, LLM-as-judge with bias controls, guardrails, hallucination mitigation).
- **Operational:** **data** (dev-prod skew, daily sample review), working with models (structured output, pin/version models, smallest-capable model), product (human-in-the-loop UX, risk calibration), team/roles (process before tools, don't over-hire MLEs early).
- **Strategic:** "no GPUs before PMF," inference APIs first / self-host only when needed, **the system around the model (evals, guardrails, caching, data flywheel) is the moat**.

### R6 — Hamel Husain (evals authority)
- **Evals are the #1 differentiator** — most failed LLM products lack a robust eval system.
- Components: error analysis from real traces → **assertion/code-based evals** → **LLM-as-judge** (aligned to human labels) → **golden datasets** → CI gating.
- Cites Jason Liu's "**6 RAG evals**": IR metrics on retrieval + the Question↔Context↔Answer relationships (faithfulness, answer relevance, context precision/recall).

### R7 — "Agent Engineer · 2026 Roadmap" (9 phases, agent-centric)
26 weeks / 9 phases / 62 modules / 3 capstones:
1. **Python + async engineering**
2. **LLM mental model** — tokens, context windows, temperature/sampling, base vs instruct, tool calling, hallucination mechanics
3. **Prompt engineering**
4. **Ingestion pipeline + RAG** — chunk → embed (Chroma/Pinecone) → traced retrieval
5. **Tools, MCP & single agents** — ReAct loop by hand, tool contracts, **Model Context Protocol**
6. **Memory + context engineering** — working memory, summaries, artifacts, long-term preferences (beyond vector DBs)
7. **Multi-agent orchestration**
8. **Guardrails + LLMOps** — input/output guardrails, evals in CI, observability
9. **Cloud + deployment**

### R8 — LLMOps Roadmap 2026
- **Observability & tracing** (Langfuse: inputs/outputs/tokens/latency/cost) — "table stakes"
- **Evaluation** (RAGAS: faithfulness, answer relevancy, context precision/recall; golden datasets)
- **Cost control** (token auditing, semantic caching, model routing — 30–50% savings)
- **Prompt versioning** (Git-tracked, never edit inline)
- **Guardrails/security** (Guardrails AI, NeMo Guardrails; prompt injection, PII, hallucination)
- **CI/CD** (eval gates, non-zero exit blocks regressed deploys)
- **Data infra** (vector DBs, golden datasets)
- **Agent orchestration & trajectory eval** (LangGraph, stateful multi-step)
- Standards: **OpenTelemetry GenAI semantic conventions** (adopted 2025-01-21)

### R9 — Turing College
Programming (Python, OOP, Git, venv/Poetry) → data (pandas, matplotlib, sklearn) → ML basics → DL/NN (PyTorch/TF, CNN/RNN, Transformers, transfer learning) → GenAI/LLMs (HF Transformers, prompt eng, fine-tuning, RAG) → **Responsible AI** (bias/fairness, privacy, **EU AI Act**) → deployment/APIs (OpenAI/Anthropic/Stability, LangChain/LlamaIndex, cloud) → specialization (NLP, CV, RL, agents).

### R10 — Anthropic, "Building Effective Agents" (vendor guidance)
- **Workflows vs agents** distinction (orchestrated code paths vs model-directed control).
- Agent = **environment + tools + system prompt**.
- Patterns: **prompt chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer**, autonomous agent.
- Principles: simplest solution first; add complexity only when warranted; **good tool design** ("writing tools for agents"); context management; **Skills**.

---

## 2. Consolidated canonical competency checklist

Coverage tiers (proxy for how mandatory a competency is):
- **CORE** = mentioned by most roadmaps (≈7+ of 10) → non-negotiable.
- **STRONG** = mentioned by several (≈4–6) → expected of a credible AI Engineer.
- **EMERGING/NICHE** = mentioned by few (≈1–3) → differentiator or specialization.

### A. Foundations & software engineering
| Competency | Tier | Seen in |
|---|---|---|
| Python (incl. async), OOP, Git/GitHub, env management | CORE | R3,R7,R9,R4 |
| Software-engineering fundamentals (the actual baseline of the role) | CORE | R4,R5,R9 |
| APIs / HTTP / SDK integration, JSON | CORE | R1,R3,R7,R9 |
| ML/DL basics (transformers, transfer learning) — *useful, not gatekept* | STRONG | R3,R9,R2 |
| Math for ML (linear algebra, probability) — *only for the Scientist track* | NICHE | R3,R9 |

### B. LLM / foundation-model fundamentals
| Competency | Tier | Seen in |
|---|---|---|
| How LLMs work: tokens, context windows, temperature/sampling | CORE | R1,R2,R3,R7,R8 |
| Base vs instruction-tuned models; capabilities, context length, cutoffs | CORE | R1,R2,R7 |
| Model landscape & selection (OpenAI/Anthropic/Google/Mistral/Llama/HF), build-vs-buy | CORE | R1,R2,R5,R9 |
| Hallucination mechanics & mitigation | STRONG | R2,R5,R7,R8 |
| Sampling strategies, structured/JSON outputs | STRONG | R2,R3,R5,R7 |
| Architecture/tokenization/attention internals | NICHE (Scientist) | R2,R3 |

### C. Prompt & context engineering
| Competency | Tier | Seen in |
|---|---|---|
| Prompt engineering (zero/few-shot, CoT, system vs user, decomposition) | CORE | R1,R2,R3,R5,R7,R9 |
| Structuring inputs/outputs (XML/JSON/Markdown, per-model formatting) | CORE | R2,R3,R5 |
| Prompt versioning (Git-tracked, pinned) | STRONG | R2,R5,R8 |
| **Context engineering** (working memory, summaries, artifacts, long-term prefs — beyond RAG) | EMERGING | R2,R7,R8 |
| Defensive prompting (injection, jailbreak, extraction) | STRONG | R1,R2,R3 |

### D. RAG & retrieval
| Competency | Tier | Seen in |
|---|---|---|
| Embeddings & embedding models | CORE | R1,R2,R3,R7,R9 |
| Vector databases (Pinecone/Chroma/Weaviate/pgvector) | CORE | R1,R3,R7,R8,R9 |
| RAG pipeline (ingest → chunk → embed → retrieve → generate) | CORE | R1,R2,R3,R5,R7,R9 |
| Hybrid search (BM25 + dense), retrieval optimization, reranking | STRONG | R2,R5,R3 |
| Advanced/agentic RAG (query construction, post-processing, tools) | STRONG | R3,R7 |
| RAG vs fine-tuning decision | STRONG | R1,R2,R5 |

### E. Evaluation (the differentiator)
| Competency | Tier | Seen in |
|---|---|---|
| Building evals: assertion/code-based tests from real traces | CORE | R2,R5,R6,R7,R8 |
| LLM-as-a-judge (with bias controls, human-aligned) | CORE | R2,R5,R6,R8 |
| Golden datasets + offline eval; RAG evals (faithfulness, relevance, context precision/recall) | CORE | R2,R6,R8 |
| Model & benchmark evaluation, eval criteria (cost/latency/instruction-following) | STRONG | R2,R4 |
| Evals in CI / deployment gates | STRONG | R6,R7,R8 |
| LM metrics (perplexity, cross-entropy) | NICHE | R2,R3 |

### F. Agents
| Competency | Tier | Seen in |
|---|---|---|
| Agent fundamentals: tool/function calling, ReAct loop, planning | CORE | R1,R2,R3,R7,R9,R10 |
| Tool design & contracts | STRONG | R7,R10,R2 |
| Workflows vs agents; orchestration patterns (routing, parallel, orchestrator-workers, evaluator-optimizer) | STRONG | R2,R7,R10 |
| Agent memory & state | STRONG | R2,R3,R7 |
| Multi-agent orchestration | STRONG | R3,R7 |
| Agent failure modes & trajectory evaluation | STRONG | R2,R7,R8 |
| **MCP / agent protocols (A2A)** | EMERGING | R3,R7,R10 |

### G. Fine-tuning & model adaptation *(know when, often skip how)*
| Competency | Tier | Seen in |
|---|---|---|
| When (not) to fine-tune; RAG-vs-finetune tradeoff | CORE | R1,R2,R5,R9 |
| PEFT / LoRA / QLoRA | STRONG | R2,R3 |
| Quantization (GGUF/GPTQ/AWQ) | STRONG | R2,R3 |
| Preference alignment (DPO/RLHF), model merging, distillation | NICHE (Scientist) | R2,R3 |

### H. Data engineering
| Competency | Tier | Seen in |
|---|---|---|
| Dataset curation (quality/coverage/quantity), cleaning/dedup | STRONG | R2,R5 |
| Synthetic data generation & augmentation | STRONG | R2,R3 |
| Data flywheel (human review → annotation → improvement) | STRONG | R5,R6,R10 |
| Dev-prod skew monitoring | EMERGING | R5 |

### I. Inference, serving & deployment
| Competency | Tier | Seen in |
|---|---|---|
| Deploying LLM apps (server: vLLM/TGI; demo; local; edge) | CORE | R1,R3,R7,R8,R9 |
| Inference optimization (KV cache, batching, Flash Attention, speculative decoding) | STRONG | R2,R3 |
| Caching (semantic) & model routing/gateway | STRONG | R2,R8 |
| Cost & latency management (token accounting, pricing) | CORE | R1,R2,R5,R8 |
| Cloud platforms (AWS/GCP/Azure, Bedrock/SageMaker) | STRONG | R1,R7,R9 |

### J. LLMOps, observability & reliability
| Competency | Tier | Seen in |
|---|---|---|
| Observability/tracing (Langfuse; log I/O, tokens, latency, cost) — "table stakes" | CORE | R2,R7,R8 |
| Monitoring & cost dashboards | STRONG | R2,R8 |
| Guardrails (input/output; Guardrails AI / NeMo) | STRONG | R2,R7,R8 |
| CI/CD for LLM apps; model version pinning | STRONG | R5,R7,R8 |
| **OpenTelemetry GenAI semantic conventions** | EMERGING | R8 |
| Pipeline orchestration (LangGraph etc.) | STRONG | R3,R7,R8,R10 |

### K. Security, safety & responsible AI
| Competency | Tier | Seen in |
|---|---|---|
| Prompt injection / jailbreak / data exfiltration defenses | CORE | R1,R2,R3,R8 |
| Guardrails for PII, toxicity, hallucination | STRONG | R2,R7,R8 |
| AI safety & ethics, bias/fairness | STRONG | R1,R9 |
| Regulatory compliance (EU AI Act) | EMERGING | R9 |
| Backdoors / supply-chain / model security | NICHE | R3 |

### L. Product & strategy
| Competency | Tier | Seen in |
|---|---|---|
| Use-case evaluation, scoping, setting expectations, milestone planning | STRONG | R2,R5 |
| Human-in-the-loop UX design | STRONG | R5,R10 |
| Build-vs-buy, "no GPUs before PMF," inference-API-first | STRONG | R2,R5 |
| Multimodal (vision/audio/OCR/TTS-STT) | STRONG | R1,R3 |

---

## 3. What's NEW / rising in 2025–2026 (older roadmaps miss these)

1. **MCP (Model Context Protocol) & agent protocols (A2A).** Absent from 2023–early-2024 material; now treated as the de-facto standard for connecting agents to tools/data (≈97M monthly SDK downloads by Feb 2026; backed by Anthropic, OpenAI, Google, Microsoft). Present in R3, R7, R10. **This is the single biggest addition.**

2. **Context engineering as its own discipline** (distinct from prompt engineering and RAG). Memory layered into working memory, rolling summaries, artifacts, and long-term preferences — not "just a vector DB." (R2, R7, R8)

3. **Reasoning models & test-time compute scaling.** Inference-time reasoning (o-series / extended-thinking style) reframes "sampling" and changes cost/latency tradeoffs. (R2 ch.2 "Test Time Compute," R3 "New Trends")

4. **Agentic everything.** 2026 roadmaps are agent-first (R7 dedicates 9 phases to it); workflows-vs-agents framing and orchestration patterns (routing, orchestrator-workers, evaluator-optimizer) are now baseline rather than advanced. (R7, R10)

5. **Observability before evals, evals before scale.** Tracing/observability is now "table stakes" (~89% adoption) and ranked the foundational first step; OpenTelemetry GenAI semantic conventions (adopted 2025-01-21) standardize it. (R7, R8)

6. **Evals as the moat.** The strongest practitioner consensus (Hamel, Applied LLMs): the eval system + data flywheel — not the model — is the durable competitive advantage. Older roadmaps treated eval as an afterthought. (R5, R6)

7. **Agentic RAG & trajectory evaluation.** Evaluation moved from single-response scoring to multi-step agent trajectories; canonical metrics: faithfulness rate, retrieves-per-correct-answer, latency p95, cost-per-correct-answer. (R7, R8)

---

## TL;DR — the credible-AI-Engineer core

If you can do all of these, you can credibly call yourself an AI Engineer (every item is CORE across most roadmaps):

1. Solid **software engineering** + Python/async + API integration.
2. Understand **how LLMs work** (tokens, context, sampling, base-vs-instruct) and how to **select models**.
3. **Prompt & context engineering**, including structured outputs and injection defenses.
4. Build a **RAG pipeline** end-to-end with embeddings + a vector DB.
5. **Build evals** (assertions, LLM-as-judge, golden datasets) and gate on them — *the differentiator*.
6. Build **agents** (tool calling, ReAct, orchestration) and increasingly **MCP**.
7. **Deploy** LLM apps with **observability, caching, guardrails, and cost/latency control** (LLMOps).
8. Know **when (not) to fine-tune** vs RAG vs prompt.

Everything else (model training, alignment, quantization internals, deep math) is the **LLM-Scientist / ML-Engineer** lane — useful context, but not what gatekeeps the AI Engineer title (per swyx, R4).
