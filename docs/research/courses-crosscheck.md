# AI Engineer Courses — Syllabus Cross-Check

Research date: 2026-06-08. Purpose: aggregate the syllabi of trustworthy, reputable AI Engineer courses (free and paid, 2024–2026) into a master topic list, so a self-built course can be checked for coverage gaps.

Scope note: "AI Engineer" here = building applications **on top of** foundation models (LLMs/multimodal) — RAG, agents, evals, prompting, fine-tuning, deployment/LLMOps — *not* classical ML/DL model-training tracks (those are listed only where they overlap, e.g. fast.ai). All syllabi below were read from the providers' own pages or canonical references; URLs are cited per row.

---

## 1. Per-course syllabus tables

### DeepLearning.AI — RAG Specialization (Coursera/DLAI)
URL: https://www.deeplearning.ai/courses/retrieval-augmented-generation-rag/ · Cost: paid (Coursera sub / DLAI Pro) · **Hands-on** (labs on real e-commerce/media/healthcare datasets)

| Module | Topics |
|---|---|
| 1. RAG Overview | How retrieval + generation work together; system anatomy |
| 2. Information Retrieval & Search Foundations | Keyword search, semantic search, hybrid search, chunking, query parsing |
| 3. Retrieval with Vector Databases | Vector DBs (Weaviate), indexing, embedding-based retrieval |
| 4. LLMs & Text Generation | Prompt design over retrieved context |
| 5. RAG in Production | Evaluation, deployment, monitoring (Arize Phoenix) |

### DeepLearning.AI — Agentic AI Specialization
URL: https://www.deeplearning.ai/courses/agentic-ai/ · Cost: free to audit / Pro for graded · **Hands-on** (31 lessons, 7 code examples, 8 graded assignments)

| Module | Topics |
|---|---|
| 1. Intro to Agentic Workflows | What is agentic AI, degrees of autonomy, task decomposition, the 4 design patterns, evaluation intro |
| 2. Reflection Pattern | Self-critique, iterative refinement, using external feedback |
| 3. Tool Use | Tool creation/syntax, code execution, MCP (DBs/APIs/services) |
| 4. Practical Tips for Building Agents | Evals, error analysis, component-level evals, latency & cost optimization |
| 5. Highly Autonomous Agents | Planning (create + execute LLM plans), multi-agent workflows & communication |

### DeepLearning.AI — Short Courses catalog (selected, AI-engineering-relevant)
URL: https://www.deeplearning.ai/courses/ · Cost: mostly **free** · **Hands-on** (notebook-based, ~1–2h each). Grouped by topic to show coverage:

| Topic cluster | Representative short courses |
|---|---|
| Prompt engineering | ChatGPT Prompt Engineering for Developers; Prompt Engineering with Llama 2&3; Prompt Engineering for Vision Models; Large Multimodal Prompting with Gemini |
| LLM app dev / frameworks | LangChain for LLM App Development; Functions, Tools & Agents with LangChain; Building Systems with the ChatGPT API; Building AI Apps with Haystack; Semantic Kernel |
| RAG | Building & Evaluating Advanced RAG; Advanced Retrieval with Chroma; Knowledge Graphs for RAG; Building Agentic RAG with LlamaIndex; Retrieval Optimization (tokenization→quantization); Prompt Compression & Query Optimization; JS RAG Web Apps |
| Embeddings / vector DBs | Understanding & Applying Text Embeddings; Vector Databases: Embeddings→Applications; Building Apps with Vector Databases; Embedding Models: Architecture→Implementation; LLMs with Semantic Search |
| Agents | AI Agents in LangGraph; Multi-AI-Agent Systems with crewAI; AutoGen design patterns; smolagents code agents; AI Browser Agents; Agent Memory / Long-Term Agentic Memory; Evaluating AI Agents; Building & Evaluating Data Agents |
| Function calling / structured output | Function-calling & Data Extraction with LLMs; Getting Structured LLM Output; Pydantic for LLM Workflows |
| Fine-tuning / post-training | Finetuning LLMs; Post-training of LLMs (SFT, DPO, RL); Reinforcement Fine-Tuning with GRPO; RLHF; Federated Fine-tuning |
| Pretraining / internals | Pretraining LLMs; How Transformer LLMs Work; Attention in Transformers (PyTorch); Build & Train an LLM with JAX |
| Inference / serving / quantization | Efficiently Serving LLMs; Fast & Efficient LLM Inference with vLLM; Efficient Inference with SGLang; Quantization Fundamentals / In Depth; On-device AI; Semantic Caching |
| Evals / testing / safety | Automated Testing for LLMOps; Evaluating & Debugging GenAI; Red Teaming LLM Applications; Safe & reliable AI via guardrails; Improving Accuracy of LLM Applications |
| LLMOps / deployment | LLMOps; Orchestrating Workflows for GenAI; Building GenAI Apps with Gradio; Fast Prototyping with Streamlit |
| MCP / context | MCP: Build Rich-Context AI Apps; Knowledge Graphs for API Discovery |
| Multimodal / voice | Multimodal Llama 3.2; Building AI Voice Agents for Production; Live Voice Agents with Google ADK; Document AI (OCR→agentic extraction); AI Agents for Image/Video Generation |
| Data prep | Preprocessing Unstructured Data for LLM Apps; Building Multimodal Data Pipelines |

### Hamel Husain & Shreya Shankar — AI Evals for Engineers & PMs (Maven)
URL: https://maven.com/parlance-labs/evals · Cost: **$4,200** · 4 weeks, 3–5 h/wk · **Hands-on** (build a real agent, 4 graded homeworks, 150+ page reader). Widely cited as the #1 evals course.

| Lesson / area | Topics |
|---|---|
| L1 Foundations | Why evals; building agents to be evaluable |
| L2 Designing for Evaluability | Agent instrumentation, logging, observability, traceability |
| L3 Error Analysis | Systematic failure finding; open/axial coding; categorizing failures; prioritizing fixes |
| Evaluator design | LLM-as-judge (building trustworthy judges); code-based/deterministic evals |
| Synthetic data | Bootstrapping evals without real users; maximizing error discovery |
| RAG evaluation | Retrieval accuracy; multi-step pipeline debugging; state-level error analysis |
| CI/CD for evals | Regression detection; experiment comparison; measure→improve→ship loop |
| Safety / red-teaming | Probing for prompt injection & jailbreaks; guardrails |
| Optimization | Evidence-based accuracy & cost improvements; multimodal evals |

### Jason Liu (jxnl) — Systematically Improving RAG Applications (Maven)
URL: https://maven.com/applied-llms/rag-playbook · Cost: paid (cohort, ~$2k+ credits included) · 4-week cohort, ~2–3 h/wk · **Hands-on** (12+ Python notebooks). Prereq: prior RAG deployment.

| Area | Topics |
|---|---|
| Evaluation & metrics | Retrieval precision, recall, MRR; building eval datasets & baselines |
| Synthetic evals | Rapid experimentation without user data; pinpointing failures |
| The "RAG Flywheel" | Iterative measure→improve loop; segmenting queries to target high-impact fixes |
| Embedding optimization | Fine-tuning embeddings (cited 20–40% gains) |
| Feedback collection | Designing UX to collect 5× more user feedback |
| Multimodal retrieval | Indices for docs, tables, images, structured data |
| Query routing/classification | Route queries to the best retriever automatically |
| RAG UX | Displaying citations, confidence levels, alternative answers |

### Hugging Face — LLM Course (formerly NLP Course)
URL: https://huggingface.co/learn/llm-course · Cost: **free** · **Hands-on** (Colab/SageMaker notebooks)

| Chapters | Topics |
|---|---|
| 1–4 | Transformers library; how transformer models work; using models from the Hub; fine-tuning on a dataset; sharing |
| 5–8 | 🤗 Datasets & Tokenizers; classic NLP tasks; modern LLM methods; tackling language problems end-to-end |
| 9 | Building & sharing model demos (Gradio) on the Hub |
| 10–12 | Advanced: fine-tuning, curating high-quality datasets, building reasoning models |

### Hugging Face — AI Agents Course
URL: https://huggingface.co/learn/agents-course · Cost: **free** (with certification) · **Hands-on** (final benchmarked assignment + leaderboard)

| Unit | Topics |
|---|---|
| 0 Onboarding | Tools & platform setup |
| 1 Agent Fundamentals | Tools, thoughts, actions, observations; LLMs, messages, special tokens, chat templates; agents from Python functions |
| 2 Frameworks | smolagents, LangGraph, LlamaIndex |
| 3 Use Cases | Real-world agentic apps |
| 4 Final Assignment | Build an agent for a benchmark, evaluate, compete on leaderboard |
| Bonus 1 | Fine-tuning an LLM for function-calling |
| Bonus 2 | Agent observability & evaluation |
| Bonus 3 | Agents in games (Pokémon) |

### Full Stack Deep Learning — LLM Bootcamp (Spring 2023)
URL: https://fullstackdeeplearning.com/llm-bootcamp/spring-2023/ · Cost: **free** (recorded) · **Hybrid** (concept lectures + 1 build-along + project walkthrough). Still a canonical "ship an LLM app" syllabus.

| Lecture | Topics |
|---|---|
| LLM Foundations | ML overview, transformer architecture, notable LLMs & their datasets |
| Prompt Engineering ("Learn to Spell") | Prompting intuitions, decomposition, chain-of-thought, self-criticism, tokenization & few-shot pitfalls |
| Augmented Language Models | Augmenting inputs w/ external knowledge (vector indices, embeddings); augmenting outputs w/ external tools |
| Launch an LLM App in One Hour | When to build; ChatGPT/LangChain/Colab; quick-launch stacks |
| UX for Language User Interfaces | User-centered design, emerging LUI patterns, Copilot & Bing Chat case studies |
| LLMOps | Comparing/evaluating open vs proprietary models; prompt management & iteration; test-driven dev for LLMs |
| Project Walkthrough (askFSDL) | ETL, Python tooling, Modal deployment, Gantry monitoring |
| What's Next? | Multimodal, scaling trends, data constraints, AGI/safety |

### Cohere — LLM University (LLMU)
URL: https://cohere.com/llmu · Cost: **free** · **Hands-on** (Cohere endpoint exercises; deploy w/ SageMaker/Streamlit/FastAPI)

| Module | Topics |
|---|---|
| What are LLMs | Embeddings, attention, transformer architecture, semantic search |
| Text Representation | Classification, embeddings, semantic search via Cohere endpoints |
| Text Generation | Generation endpoint, prompt engineering |
| Semantic Search | Dense retrieval, search applications |
| Prompt Engineering | Prompt design patterns |
| The Cohere Platform / Deployment | Deploy on AWS SageMaker, Streamlit, FastAPI |

### fast.ai — Practical Deep Learning for Coders
URL: https://course.fast.ai · Cost: **free** · **Hands-on** (top-down, code-first). Mostly DL fundamentals; LLM-relevant overlap noted.

| Area | Topics (LLM-relevant subset) |
|---|---|
| DL fundamentals | Training/fine-tuning neural nets, transfer learning, the training loop |
| NLP | Transformers via Hugging Face, fine-tuning a language model, text classification |
| From the foundations | Building models from scratch, tokenization, embeddings, backprop intuition |

### Reference texts treated as "the syllabus" by practitioners
- **Chip Huyen — *AI Engineering* (O'Reilly, 2025)** · https://github.com/chiphuyen/aie-book — the de-facto curriculum. Chapters: (1) Intro to building apps with foundation models, (2) Understanding foundation models, (3) **Evaluation methodology**, (4) Evaluating AI systems, (5) **Prompt engineering**, (6) **RAG & agents** (context construction), (7) **Fine-tuning**, (8) **Dataset engineering**, (9) **Inference optimization**, (10) **AI engineering architecture & user feedback** (production design, feedback loops).
- **Paul Iusztin & Maxime Labonne — *LLM Engineering Handbook*** — RAG, evals, LangChain, fine-tuning, LLMOps (cited in 2026 roundups).

### Industry roadmaps (used to weight "table-stakes" vs "nice-to-have")
- Firecrawl "Best Hands-On Resources to Learn AI Engineering in 2026" — https://www.firecrawl.dev/blog/best-ai-resources
- Data Unboxed "Complete AI Engineering Roadmap 2025" — https://www.dataunboxed.io/blog/roadmap-to-ai-engineering
- LangChain "State of Agent Engineering" — https://www.langchain.com/state-of-agent-engineering
- OpenAI "for Developers in 2025" — https://developers.openai.com/blog/openai-for-developers-2025

---

## 2. Aggregated master topic list (union of all courses)

Frequency marker reflects how many of the surveyed syllabi/references teach it:
**[CORE]** taught by most (≈7+ sources) · **[COMMON]** taught by several (3–6) · **[NICHE]** taught by few (1–2).

### A. Foundations / model understanding
- Transformer architecture & attention — **[CORE]**
- How LLMs generate (tokens, sampling, context window) — **[CORE]**
- Tokenization & its pitfalls — **[COMMON]**
- Embeddings (what they are, geometry, similarity) — **[CORE]**
- Foundation/multimodal model landscape & selection (open vs proprietary) — **[CORE]**
- Pretraining concepts — **[NICHE]**

### B. Prompt engineering
- Prompting fundamentals & iteration — **[CORE]**
- Chain-of-thought / decomposition / self-criticism — **[COMMON]**
- Few-shot design — **[COMMON]**
- Structured output / JSON / schema enforcement (Pydantic) — **[COMMON]**
- Function/tool calling & data extraction — **[CORE]**
- Prompt management/versioning — **[COMMON]**

### C. RAG (retrieval-augmented generation)
- RAG anatomy (retrieve→augment→generate) — **[CORE]**
- Chunking strategies — **[CORE]**
- Keyword vs semantic vs hybrid search — **[CORE]**
- Vector databases & indexing (ANN) — **[CORE]**
- Reranking & advanced retrieval — **[COMMON]**
- Query parsing / routing / classification — **[COMMON]**
- Embedding fine-tuning for retrieval — **[NICHE]**
- Knowledge graphs for retrieval — **[NICHE]**
- Multimodal retrieval (tables, images, structured data) — **[NICHE]**
- RAG UX (citations, confidence, alternatives) — **[NICHE]**
- RAG evaluation (precision/recall/MRR, pipeline debugging) — **[CORE]**

### D. Agents
- Agent loop (thought→action→observation; ReAct) — **[CORE]**
- Tool use / tool creation — **[CORE]**
- MCP (Model Context Protocol) — **[COMMON]**
- Planning & task decomposition — **[COMMON]**
- Reflection / self-critique pattern — **[COMMON]**
- Multi-agent systems & communication — **[COMMON]**
- Agent memory (short- & long-term) — **[COMMON]**
- Agent frameworks (LangGraph, smolagents, crewAI, AutoGen, LlamaIndex) — **[CORE]**
- Agent evaluation & error analysis — **[CORE]**
- Code-execution / computer-use / browser agents — **[NICHE]**

### E. Evaluation (evals) — the differentiator
- Why evals / eval-driven development — **[CORE]**
- Systematic error analysis (open/axial coding, failure taxonomies) — **[COMMON, but core to best courses]**
- LLM-as-judge (building trustworthy judges) — **[CORE]**
- Code-based / deterministic / assertion evals — **[CORE]**
- Synthetic data for evals — **[COMMON]**
- Component-level vs end-to-end evals — **[COMMON]**
- Regression testing / CI for LLMs (measure→improve→ship) — **[COMMON]**
- Accuracy improvement workflow — **[COMMON]**

### F. Fine-tuning & post-training
- When to fine-tune vs prompt/RAG — **[CORE]**
- SFT (supervised fine-tuning) — **[COMMON]**
- LoRA / QLoRA / PEFT — **[COMMON]**
- RLHF / DPO / preference tuning — **[COMMON]**
- Reinforcement fine-tuning (GRPO/RFT, graders) — **[NICHE]**
- Distillation to smaller models — **[NICHE]**
- Fine-tuning for function-calling — **[NICHE]**

### G. Dataset / data engineering
- Dataset curation & quality validation — **[COMMON]**
- Data annotation — **[COMMON]**
- Preprocessing unstructured data — **[COMMON]**
- Synthetic data generation — **[COMMON]**

### H. Production / LLMOps / deployment
- Deploying LLM apps (APIs, serving frameworks) — **[CORE]**
- Observability / instrumentation / tracing (every LLM, tool, RAG call) — **[CORE]**
- Monitoring & feedback loops — **[CORE]**
- Cost & latency optimization — **[COMMON]**
- Inference optimization (vLLM/SGLang, batching, caching) — **[COMMON]**
- Quantization — **[NICHE]**
- On-device / edge — **[NICHE]**
- Orchestration / workflow tooling — **[COMMON]**

### I. Safety, security, reliability
- Guardrails (input/output/action) — **[COMMON]**
- Red-teaming / prompt injection / jailbreaks — **[COMMON]**
- Reliability & error handling — **[COMMON]**

### J. UX & app shipping
- LUI/UX patterns for AI apps — **[COMMON]**
- Rapid prototyping (Gradio/Streamlit) — **[COMMON]**
- End-to-end "ship an app" project — **[CORE]**

### K. Multimodal / voice (emerging)
- Multimodal models & prompting — **[COMMON]**
- Voice agents (production) — **[NICHE]**
- Document AI / OCR→agentic extraction — **[NICHE]**

---

## 3. What the BEST courses treat as core differentiator vs nice-to-have

**Treated as the differentiating core (where the best courses spend their depth):**
- **Evals & systematic error analysis.** This is the single biggest signal of a serious 2025–2026 AI-engineering course. Hamel/Shreya's entire $4,200 course is evals; Chip Huyen devotes 2 of 10 chapters to it; DLAI Agentic AI and HF Agents both add dedicated eval units. The consistent message: *error analysis → LLM-as-judge + code evals → CI/regression loop* is the workflow that separates engineers from prompt-tinkerers. Industry roadmaps echo this ("evals are table stakes," "measure→improve→ship loop").
- **RAG done rigorously** — not just "stuff context in," but retrieval metrics (precision/recall/MRR), hybrid search, reranking, query routing, and *evaluating* the retrieval step. Jason Liu's course is entirely this; DLAI RAG and Chip Huyen both treat it as foundational.
- **Agents with tool use + observability.** Tool/function calling, MCP, the agent loop, and instrumenting/evaluating agents appear in nearly every current syllabus. Frameworks (LangGraph/smolagents/crewAI/AutoGen) are taught but treated as interchangeable plumbing.
- **Production/LLMOps: observability, monitoring, feedback loops.** Deploying + instrumenting + closing the feedback loop is universal in the application-oriented courses (FSDL, Chip Huyen ch.10, DLAI RAG/Agentic, evals course).
- **Function calling & structured output** — now treated as table-stakes plumbing for any agentic/RAG app, not advanced.

**Treated as nice-to-have / specialization (taught by few, or marked optional):**
- Heavy fine-tuning (LoRA/QLoRA/RLHF/GRPO) — most courses say *most teams don't fine-tune*; it's offered as optional depth. Industry data: ~57% of orgs rely on base models + prompting + RAG instead.
- Pretraining / training-from-scratch, quantization, on-device inference — deep-internals topics, only in HF LLM Course, a few DLAI shorts, and Chip Huyen's inference chapter.
- Multimodal, voice agents, document AI — emerging, course-specific add-ons.
- Knowledge graphs, embedding fine-tuning, RAG UX — advanced RAG niceties (mostly Jason Liu + a couple DLAI shorts).

**Bottom line for a self-built course:** to match the reputable set, the non-negotiable core is **foundations → prompting/structured-output/function-calling → RAG (with retrieval eval) → agents (tool use + observability) → evals & error analysis → production/LLMOps (deploy, instrument, feedback loop) → one end-to-end shipped project.** Fine-tuning, multimodal/voice, and deep model internals can be optional modules without falling behind the field.

---

## Sources
- DeepLearning.AI courses catalog — https://www.deeplearning.ai/courses/
- DeepLearning.AI RAG Specialization — https://www.deeplearning.ai/courses/retrieval-augmented-generation-rag/
- DeepLearning.AI Agentic AI — https://www.deeplearning.ai/courses/agentic-ai/
- AI Evals for Engineers & PMs (Hamel Husain & Shreya Shankar) — https://maven.com/parlance-labs/evals
- Systematically Improving RAG Applications (Jason Liu) — https://maven.com/applied-llms/rag-playbook ; https://jxnl.co/writing/2025/01/24/systematically-improving-rag-applications/
- Hugging Face LLM Course — https://huggingface.co/learn/llm-course ; blog: https://huggingface.co/blog/llm-course
- Hugging Face AI Agents Course — https://huggingface.co/learn/agents-course
- Full Stack Deep Learning LLM Bootcamp (Spring 2023) — https://fullstackdeeplearning.com/llm-bootcamp/spring-2023/
- Cohere LLM University — https://cohere.com/llmu ; https://docs.cohere.com/docs/llmu-2
- fast.ai Practical Deep Learning — https://course.fast.ai
- Chip Huyen, *AI Engineering* (O'Reilly 2025) — https://github.com/chiphuyen/aie-book ; https://www.oreilly.com/library/view/ai-engineering/9781098166298/
- Firecrawl "Best Hands-On Resources to Learn AI Engineering in 2026" — https://www.firecrawl.dev/blog/best-ai-resources
- Data Unboxed "Complete AI Engineering Roadmap 2025" — https://www.dataunboxed.io/blog/roadmap-to-ai-engineering
- LangChain "State of Agent Engineering" — https://www.langchain.com/state-of-agent-engineering
- OpenAI for Developers in 2025 — https://developers.openai.com/blog/openai-for-developers-2025
