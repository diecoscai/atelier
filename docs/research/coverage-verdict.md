# Coverage Verdict — Does `soporte-rag` make "AI Engineer" credible?

> Independent audit, 2026-06-08. Auditor: skeptical, evidence-based. Thing under audit: `projects/soporte-rag/docs/DESIGN.md` (v2). Prior internal audits (`ai-engineer-completeness-audit.md`, `ai-engineer-roadmap-research.md`) read for context but re-verified against external 2025–2026 sources, not trusted at face value.

## Method

I rebuilt the competency checklist from primary/reputable sources rather than inheriting the internal one:

- **roadmap.sh/ai-engineer** — 7-stage LLM-app track (Foundation → Prompting → Building apps → Embeddings/Vector DBs → RAG → AI Agents → LLMOps → Fine-tuning), plus sub-nodes for security/prompt-injection, open-source models, multimodal, AI safety.
- **Chip Huyen, *AI Engineering* (O'Reilly 2025)** — confirmed 10-chapter TOC: Planning, Foundation Models, Evaluation Methodology (×2), Prompt Engineering, RAG & Agents, Finetuning, Dataset Engineering, Inference Optimization, Architecture & User Feedback.
- **Hamel Husain + Shreya Shankar evals** — error analysis (open/axial coding), LLM-as-judge, synthetic data, CI/CD evals, RAG debugging, agentic + multimodal evals, safety guardrails.
- **Interview field guides** (alexeygrigorev/ai-engineering-field-guide; amitshekhariitbhu; pensero.ai; multiple "2026 interview" breakdowns) — convergent claim: **5 clusters cover ~90% of 2026 loops**: (1) LLM/transformer basics, (2) RAG architecture, (3) agentic systems, (4) prompt engineering + evals, (5) system design for LLM products. "Eval methodology is the new system design." Transformer/attention/tokenization theory is repeatedly called **non-negotiable**.
- **Market data** (cited in internal research, spot-checked): Python (~93%), LLM APIs (near-universal), RAG (~65%), agents (+280% YoY), Docker (~32%), cloud AWS/GCP/Azure (one deep), evals = "single biggest senior hiring signal"; MCP fastest riser; fine-tuning premium-but-niche.

The external consensus **matches** the internal research closely. That is itself a finding: the internal audits are not self-serving fabrications — they track reality. Where I diverge is on **COVERED vs PARTIAL honesty** and on a few **structural gaps the internal docs under-weight** (cloud, classic SWE/coding-round, prompt-injection depth-of-build, agent-eval).

---

## Competency mapping

Depth legend (course's own honest scale): **awareness** < **can-explain** < **can-build** < **can-defend-in-system-design**.
Status: **COVERED** = can-build *and* defendable, with an artifact. **PARTIAL** = touched as sidebar/awareness/can-explain only, or built but shallow. **MISSING** = absent.

| # | Competency (from external consensus) | Status | Module / Evidence |
|---|---|---|---|
| 1 | **Evals methodology** — golden set, LLM-as-judge, RAGAS, CI gate, regression catch | **COVERED** | M2 is the spine: golden 50+, RAGAS+DeepEval, LLM-judge, Langfuse, pytest CI gate, public dashboard. Strongest area. |
| 1b | **Error analysis** (open/axial coding, taxonomy of failure modes) — the *core* of the Hamel/Shreya method | **PARTIAL** | M2 builds the harness and metrics but DESIGN never names systematic **error analysis / failure taxonomy**. This is the highest-signal eval skill and it's implicit, not explicit. |
| 2 | **RAG / retrieval** — chunking, embeddings, hybrid BM25+dense, RRF, rerank, metadata filter, query rewrite/HyDE | **COVERED** | M1 (chunking) + M3 (hybrid, RRF, cross-encoder rerank, metadata, HyDE), measured recall@5 vs baseline. |
| 3 | **Prompt engineering / in-context** — n-shot, CoT, structured I/O, defensive | **PARTIAL→COVERED** | Threaded through M2/M4 (structured outputs, "no sé" calibration). No dedicated treatment of n-shot/CoT as a named discipline, but applied. Defensible. |
| 4 | **Structured outputs** — schema-constrained generation (Instructor/Pydantic) | **COVERED** | M4 explicitly: Instructor/Pydantic, citations to exact passage, logprobs confidence. |
| 5 | **AI agents / orchestration** — tool use, routing, multi-hop, memory, multi-agent | **COVERED** | M6: agent vs chain, routing, multi-hop, iterative retrieval, memory, 2-agent LangGraph state machine. |
| 5b | **Agent evaluation** — evaluating a multi-step tool-calling loop (named interview question) | **PARTIAL** | Evals spine (M2) predates agents (M6); DESIGN never explicitly loops agent traces back through the eval harness. Interviewers specifically ask "how do you eval an agent that calls 4 tools." |
| 6 | **LLM / transformer fundamentals** — attention, tokenization, sampling, context window | **PARTIAL** | Side-quest A (Karpathy GPT 7+8) + B (Makemore) + "model literacy" doc. This is *can-explain*, deliberately not *can-build* attention. Interview guides call this non-negotiable; side-quests cover it but as optional weekend work — abandonment risk. |
| 7 | **Fine-tuning hands-on** — LoRA/QLoRA, dataset, loss curve, eval before/after, when-NOT | **COVERED (Extended)** | M9: QLoRA on Llama-3-1B + Bitext, loss curve, before/after eval, "when fine-tune beats RAG." Honestly framed. Gated behind Extended track → not in hireable checkpoint. |
| 8 | **Dataset engineering** — synthesis, curation, flywheel | **PARTIAL** | Synthetic Q&A generation (M2), fine-tune dataset (M9). No named treatment of curation/data flywheel as discipline. |
| 9 | **Inference optimization / self-hosted serving** — vLLM/TGI, throughput, quantization, KV cache | **PARTIAL** | M10 vLLM benchmark (GPU exercise) + M7 quantization sidebar (awareness). Honestly framed as "ran it, don't operate a cluster." Extended-only. KV cache / speculative decoding / Flash Attention not covered. |
| 10 | **LLMOps / observability / cost** — tracing, caching, routing, A/B, drift, dashboards (TTFT/p95) | **COVERED (Extended)** | M7: model routing, semantic caching, token budgets, prompt A/B, drift, latency dashboards. Langfuse from M2. |
| 11 | **Security / safety** — prompt injection, jailbreak, PII, lethal trifecta, OWASP LLM Top 10 | **PARTIAL→COVERED (Extended)** | M5: deterministic tenant isolation, PII redaction, prompt-injection/doc-poisoning defense, garak red-team. Strong — but Extended-only and not mapped to OWASP LLM Top 10 by name. |
| 12 | **Multi-tenancy / data isolation** (named system-design interview question) | **COVERED (Extended)** | M5 deterministic namespace isolation, ACL-aware. A genuine differentiator. Extended-only. |
| 13 | **Multimodal** — vision ingestion | **PARTIAL** | M1 graft: screenshot ingestion via vision API. One graft, awareness/can-build-lite. |
| 14 | **MCP** — authoring a server (not just consuming) | **COVERED** | M3 extracts a standalone publishable MCP server. Differentiator, on the Core track. Good call. |
| 15 | **Cloud platform depth (AWS/GCP/Azure, one deep)** | **MISSING** | DESIGN deploys to Fly.io/Railway + Colab/RunPod. M10 appendix has a *swap-to-Bedrock/Vertex* note and k8s YAML — awareness only. No real managed-cloud competency. ~30%+ of listings want this. |
| 16 | **Classic ML literacy** — precision/recall/F1, overfitting, confusion matrix | **PARTIAL** | M9 graft: Banking77 intent classifier. One graft, Extended-only. Closes the "data/ML blindness" rejection. |
| 17 | **Math intuition** — vectors/dot-product, softmax/temperature, cross-entropy, gradient descent | **PARTIAL (sufficient)** | Side-quest B. External consensus says this is the *most inflated* requirement; awareness-level is genuinely enough. Adequately scoped. |
| 18 | **Coding / DSA round readiness** — ~75% of loops have a live-coding/DSA round | **MISSING** | DESIGN says nothing about DSA/coding-round prep. The project proves *system* skill, not whiteboard-coding throughput, which is a separate gate in ~3/4 of loops. |
| 19 | **System design fluency** (build/explain/whiteboard a RAG, multi-tenant chatbot, cost-at-scale) | **COVERED** | The product *is* the #1 system-design question; M4 DECISIONS.md + M11 deep-dive produce the defensible answer. |
| 20 | **Production architecture / deployment** — Docker, REST/SSE, rate-limit, error handling, live demo | **COVERED** | M0 deploy-early, M4 TLS deploy checkpoint, Docker, streaming proxy, rate-limit. Live demo = the #1 portfolio signal. |
| 21 | **Open-source / local models** — Ollama, Llama/Mistral swap, cost comparison | **COVERED (Extended)** | M7 graft. Extended-only. |
| 22 | **Responsible AI / governance** — model cards, EU AI Act | **PARTIAL** | M10 wrap: 1-page model card + EU AI Act overview. Awareness. Adequate for table-stakes. |
| 23 | **DSPy** — programmatic prompt optimization | **PARTIAL (awareness)** | M3 sidebar. Awareness only — correctly scoped as a differentiator-not-requirement. |
| 24 | **Packaging / self-marketing / distribution** — demo, metrics, DECISIONS, blog, MCP publish, CV reframe, channels | **COVERED** | M11 + M4 checkpoint. Distribution (target companies + LatAm→US channels) explicitly added. Strong for objective #1. |

**Tally:** COVERED ~11 · PARTIAL ~11 · MISSING ~2. The Core track (M0–M4) credibly delivers competencies 1,2,3,4,14,19,20 + partials of 3,6. Everything that makes the claim *senior-credible* (fine-tuning, LLMOps, security, multi-tenancy, inference, classic ML, open-source) lives in the **Extended track**, which is explicitly optional/abandonment-risk.

---

## Highest-impact gaps (ranked by impact on credibly claiming "AI Engineer")

1. **The hireable checkpoint (M4) is RAG-only — under-differentiated at the moment it's meant to be resume-able.** At M4 the candidate has a deployed RAG + evals + hybrid retrieval + MCP. That clears *table-stakes* (it's literally the #1 take-home), but the things the internal research itself calls the *differentiators* — multi-tenancy isolation, security/red-team, LLMOps cost dashboards — are all M5+. A hiring manager skimming the M4 artifact sees "competent RAG wrapper," not "AI Engineer with production depth." **The differentiation is back-loaded behind the abandonment cliff.** This is the single biggest risk: the resume-able milestone and the credibility-creating work are on opposite sides of the optional/non-optional line.

2. **Error analysis is not named — the eval spine is metrics-first, not failure-analysis-first.** The Hamel/Shreya method (the canonical eval curriculum) is *error analysis → taxonomy → targeted evals*, not "run RAGAS." DESIGN builds the harness but treats evals as a metrics/CI artifact. In a deep-dive, "is your eval vibes-based or structured?" is answered by *showing a failure taxonomy you derived from real traces*, which the course doesn't explicitly produce. High impact, low cost to fix.

3. **Agent evaluation is an unclosed loop.** Evals (M2) are built against the RAG pipeline before agents exist (M6). Interviewers specifically probe "how do you evaluate a multi-step tool-calling agent." Nothing in DESIGN routes M6 agent traces back through the M2 harness. The two strongest assets (evals + agents) never visibly connect.

4. **No managed-cloud competency (AWS/GCP/Azure).** Fly.io/Railway + Colab/RunPod is fine for shipping but leaves a real gap vs ~30% of listings and most Series-B+ system-design rounds ("how would you run this on AWS?"). The M10 Bedrock/Vertex *note* is awareness, not competence. The product never touches a hyperscaler.

5. **Coding/DSA round is unaddressed.** ~75% of loops include a live-coding or DSA gate that this project does not prepare for at all. The course makes you defensible in *system design and project deep-dive*; it does nothing for the algorithmic round that can still fail you. Out of the project's scope, but a real gate the plan is silent on.

Lower-tier gaps: inference-optimization internals (KV cache, Flash Attention, speculative decoding) — awareness-only, acceptable for product-focused roles; dataset-engineering as a named discipline; OWASP LLM Top 10 mapping (the work exists in M5, just not labeled with the vocabulary recruiters scan for).

---

## Verdict

**Conditionally yes — but not at the M4 checkpoint, and not without two cheap structural fixes.**

The full plan (M0–M11) credibly supports the claim "AI Engineer (product-focused, builds production LLM systems)." It maps cleanly onto Huyen's 10 chapters, roadmap.sh's 7 stages, and the 5 interview clusters, and it deliberately and *honestly* scopes the inflated stuff (deep transformers, pretraining, distributed training) out. The framing discipline (awareness/can-build/can-defend) is exactly right and rare. For the **dominant objective — getting hired / positioning as an AI Engineer in a product company** — the full plan is sufficient and, in evals + multi-tenancy + MCP, above-median.

The credibility problem is **structural, not coverage**: the *resume-able milestone (M4)* and the *credibility-differentiating work (M5–M11)* sit on opposite sides of an explicitly-optional boundary. If Diego stops at the checkpoint (which the design's own "abandonment risk" framing anticipates), he has a strong RAG demo — table-stakes — not a differentiated AI Engineer portfolio. The plan is credible *only if executed past M7 or so*. The "hireable at M4" claim is the most over-stated part of the design.

### Top 5 concrete changes (ranked by credibility-per-effort)

1. **Pull one differentiator into the Core track.** Move *basic* deterministic multi-tenant isolation (the namespace-scoping core of M5) or the *cost/latency dashboard* (M7) into M4. The checkpoint then says "production-aware multi-tenant RAG with cost tracking," not "RAG wrapper." Smallest change, largest jump in M4 signal. Closes Gap #1.

2. **Make error analysis the explicit first step of M2.** Add a named deliverable: a failure taxonomy derived from real traces (open/axial coding) that *drives* which evals get written. Re-frame M2 as "error-analysis-first," matching the canonical Hamel/Shreya method. Produces the exact artifact deep-dives probe. Closes Gap #2, ~half a day.

3. **Close the agent-eval loop in M6.** Add an explicit step: route M6 agent traces back through the M2 harness (tool-call correctness, trajectory eval). Connects the two strongest assets and pre-answers the most common agentic interview question. Closes Gap #3.

4. **Add a real managed-cloud touchpoint, not an appendix.** Make M10's Bedrock/Vertex swap (or a one-service AWS deploy of the API) a *built* deliverable rather than a YAML note, OR add a small "deploy the API to AWS/GCP" graft to the Core checkpoint. Converts Gap #4 from MISSING to PARTIAL/COVERED and unblocks the "run it on AWS" system-design round.

5. **Name a DSA/coding-round prep stream explicitly (even if out-of-product).** A one-line track ("LeetCode-medium + LLM-coding-round patterns, N problems/week alongside M2–M6") so the plan acknowledges the ~75% coding gate it currently ignores. Cheap insurance against a failure mode the project can't otherwise cover.

**Bottom line:** the design is honest, well-researched, and not over-claiming on *coverage*. Its one real flaw is *sequencing* — it back-loads its own differentiators behind an optional track while marketing M4 as hireable. Fix the M4 checkpoint to carry one production differentiator, name error-analysis and agent-eval explicitly, add a cloud touchpoint, and the "AI Engineer" claim becomes credible at a milestone the learner will actually reach.

---

## Sources

roadmap.sh/ai-engineer · github.com/chiphuyen/aie-book (TOC) · oreilly.com/library/view/ai-engineering · hamel.dev/blog/posts/evals-faq · maven.com/parlance-labs/evals · github.com/alexeygrigorev/ai-engineering-field-guide · github.com/amitshekhariitbhu/ai-engineering-interview-questions · pensero.ai/blog/ai-engineer-interview-questions · adilshamim8.medium.com (100+ real interviews 2026) · letsdatascience.com/blog/50-llm-and-ai-engineer-interview-questions-for-2026 · dataquest.io/blog/ai-engineer-roadmap · internal: ai-engineer-completeness-audit.md, ai-engineer-roadmap-research.md (re-verified, not trusted at face value)
