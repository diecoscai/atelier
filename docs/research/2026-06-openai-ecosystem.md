# Ecosistema de developer education de OpenAI — junio 2026

> Research 2026-06-12. Agente: research-openai (sonnet). Fuentes primarias de openai.com, developers.openai.com, academy.openai.com y cookbook.openai.com.

## Fuentes y puntos clave

### 1. OpenAI Agents SDK
https://openai.github.io/openai-agents-python/ · https://github.com/openai/openai-agents-python — VERIFICADO

- **Agents**: LLM + instrucciones + tools, con built-in agent loop.
- **Handoffs**: delegación como tool ("transfer_to_refund_agent"). Input guardrails solo al primer agente; output guardrails solo al último.
- **Guardrails**: *"run a guardrail with a fast/cheap model to detect malicious usage and immediately raise an error to prevent an expensive model from running"*.
- **Tracing built-in** por defecto: LLM generations, tool calls, handoffs, guardrails, custom events.
- **Sessions/Memory**: AsyncSQLiteSession, RedisSession, MongoDBSession.
- **Tools 5 categorías**: hosted OpenAI tools, locales (ComputerTool, ApplyPatchTool), function calling, agents-as-tools, CodexTool (experimental).
- **Update abril 2026 — "Next Evolution of the Agents SDK"** (https://openai.com/index/the-next-evolution-of-the-agents-sdk/ · TechCrunch 2026-04-15): sandboxing, harness configurable, manifest abstraction (S3/GCS/Azure/R2), model-agnostic (100+ modelos Chat Completions-compatible). Motivación: *"address the two largest enterprise blockers reported by SDK users: safety and complexity in long-horizon work."*

### 2. AgentKit
https://openai.com/index/introducing-agentkit/ — DevDay 2025. Construido sobre Responses API.

- Agent Builder (canvas visual), ChatKit, guardrails open-source modulares.
- Distinción clave: AgentKit = capa plataforma; Agents SDK = framework Python.

### 3. OpenAI Evals

Guías: https://developers.openai.com/api/docs/guides/evals · /agent-evals · /trace-grading
Repo: https://github.com/openai/evals — 17,600+ stars (ene-2026)

- **Graders**: string check, model-graded, Python custom, rubric-based (LLM-as-judge).
- **Trace grading**: *"A trace captures the end-to-end record of model calls, tool calls, guardrails, and handoffs for one run, and graders score those traces with structured criteria to find regressions and failure modes at scale."*
- **Trajectory evals**: evalúan la secuencia completa de pasos, no el string final.
- **Evaluation flywheel** (cookbook ago-2025, Neel Kapse + Hamel Husain): medir con graders → mejorar → iterar.
- **Eval-driven system design**: receta "Eval Driven System Design - From Prototype to Production".
- *"LLM Graders must undergo SME alignment validation rather than blindly trusting scores."*

> ⚠️ **DEPRECACIÓN CRÍTICA #2 — afecta contenido del curso**
> Plataforma Evals: **read-only 31-oct-2026 → cierre 30-nov-2026**.
> Reemplazo: **Datasets**.
> El repo open-source `openai/evals` es un proyecto distinto; su status post-deprecación no fue explicitado.

### 4. OpenAI Academy — Builder Bootcamp
https://academy.openai.com/ — VERIFICADO, existe.

Descripción oficial: *"A live virtual series for technical builders and teams who want to go deeper on building with OpenAI."*

| Sesión | Contenidos |
|---|---|
| Agents | Tool design, instructions, handoffs, guardrails, evaluation patterns |
| Evals | Criterios, datasets, Evals API |
| RAG | File Search API, Responses API, vector stores, grounded answers |
| Codex | Explorar codebase, plan mode, AGENTS.md, skills reutilizables, scoping |
| Production & Optimization | Quality/latency/cost tradeoffs, benchmarking, fine-tuning y distillation |

URLs de sesiones: `academy.openai.com/public/clubs/builders-etkn1/resources/builder-bootcamp-2026-04-22` y eventos individuales `builder-bootcamp-{agents-7pq4lpyiop, evals-tamj0fdzry, rag-xr0i24gvpd, codex-6cvoh4bj2q, production-and-optimization-cseahs593e}`.

Cursos adicionales: Codex 101 (mar-2026), Codex Fundamentals, AI Techniques: Agentic Workflows, Codex 103.

Nota: el contenido exacto de cada sesión requiere login para acceder; no pudo verificarse en detalle.

### 5. Certificaciones OpenAI
https://openai.com/index/openai-certificate-courses/ — diciembre 2025; Coursera + ChatGPT (early 2026).

- Certificaciones actuales: **AI Foundations** (pilotos Walmart, Accenture, Deloitte + 20 enterprises) y **ChatGPT Foundations for Teachers**.
- Validación: ETS y Credly. Meta: 10M certificados para 2030.
- Nivel **Advanced**: planeado, NO lanzado a junio 2026.
- **Conclusión**: NO son certificaciones técnicas de engineering — *"if you're a builder, the credentials don't yet exist."*

### 6. Guías oficiales de la plataforma

**Function calling** (https://developers.openai.com/api/docs/guides/function-calling):
- *"Explicitly describe the purpose of the function and each parameter (and its format), and what the output represents."*
- Strict mode: `additionalProperties: false`, todos los parámetros required, opcionales con tipo `null`.

**Structured Outputs** (https://developers.openai.com/api/docs/guides/structured-outputs):
- *"Ensures the model will always generate responses that adhere to your supplied JSON Schema."*

**Prompt engineering** (https://developers.openai.com/api/docs/guides/prompt-engineering):
- Guía base + prompt guidance model-specific (GPT-4.1, GPT-5).
- Realtime Prompting Guide (ago-2025).

**Prompt caching** (https://developers.openai.com/api/docs/guides/prompt-caching + cookbook `prompt_caching_201`):
- Automático a partir de ≥1,024 tokens; hits en incrementos de 128 tokens.
- Precio: ~50% del precio de input en cache hit.
- Extended caching: hasta 24h.
- Patrón clave: *"Keep content you expect to reuse at the beginning of your prompt."*
- Equipos reportan 60–85% reducción de costos en producción.

### 7. Fine-tuning — cuándo sí y cuándo no

Guía oficial (URL directa no verificada durante la investigación).

- **Marco de decisión**: prompting (horas) → RAG (datos en tiempo real) → fine-tuning solo para especialización profunda de comportamiento/estilo/política.
- *"80% of cases where someone proposes a fine-tune are better solved with a better prompt, a few-shot example, or a RAG pipeline."*
- **Regla de oro**: *"Do not fine-tune until you can clearly state what your eval metric is and why prompting cannot move it."*
- **Patrón híbrido 2026**: RAG para hechos + fine-tuning para estilo/política/decisión.

| Método | Modelos compatibles |
|---|---|
| SFT (Supervised Fine-Tuning) | GPT-4.1, GPT-4.1-mini |
| DPO (Direct Preference Optimization) | GPT-4.1, GPT-4.1-mini |
| RFT (Reinforcement Fine-Tuning) | o4-mini (solo reasoning models) |
| No fine-tuneable | GPT-5.x |

### 8. Codex — agentic coding
https://developers.openai.com/codex/ · /codex/skills

- Corre sobre GPT-5.5 (lanzado 23-abr-2026, entrenamiento agentic-first).
- **Flujo**: tarea en lenguaje natural → clona repo en sandbox → edición multi-archivo → corre tests → itera → abre PR.
- Builder Bootcamp enseña: explorar codebase, plan mode, AGENTS.md, skills reutilizables, scoping.
- ~4M developers activos semanales (cifra OpenAI).

### 9. Deprecaciones críticas

> ⚠️ **DEPRECACIÓN CRÍTICA #1 — afecta contenido del curso**
> **Assistants API**: deprecada, **sunset 26-ago-2026**.
> Reemplazada por: **Responses API + Conversations API**.
> Hilos: Threads/Runs/Assistants → Conversations/Responses/Prompts.
> La Responses API es stateless — el developer maneja historial y orquesta tool use.
> URLs: https://community.openai.com/t/assistants-api-beta-deprecation-august-26-2026-sunset/1354666 · https://developers.openai.com/api/docs/assistants/migration

Tabla completa de deprecaciones:

| Componente | Status actual | Fecha límite | Reemplazo |
|---|---|---|---|
| Assistants API | Deprecada | Sunset 26-ago-2026 | Responses API + Conversations API |
| Threads / Runs / Assistants | Deprecados | Sunset 26-ago-2026 | Conversations / Responses / Prompts |
| Plataforma Evals | Read-only | 31-oct-2026 | Datasets |
| Plataforma Evals | Cierre total | 30-nov-2026 | Datasets |

### 10. Cookbook reciente (selección 2025-2026)
https://cookbook.openai.com

| Recurso | Fecha |
|---|---|
| Image Evals | ene-2026 |
| Evals API MCP Evaluation | 2026 |
| Realtime Eval Guide | dic-2025 |
| Self-Evolving Agents | oct-2025 |
| AgentKit workflows | oct-2025 |
| Evaluation flywheel (Neel Kapse + Hamel Husain) | ago-2025 |
| Eval Driven System Design - From Prototype to Production | 2025 |
| Macro Evals for Agentic Systems | 2025 |
| Evaluating Agents with Langfuse | 2025 |
| prompt_caching_201 | 2025 |

### 11. Peter Welinder / developer vision — PARCIALMENTE VERIFICADO

No se encontró post 2025-2026 de Welinder con listado público de competencias. Welinder encabeza "New Product Explorations" en OpenAI.

Posición histórica (LLM Bootcamp fireside, FSDL 2023): *"drive down costs and increase speed in the foundation model layer to enable value creation in the application layer."*

Lo más cercano a visión de plataforma 2025: https://developers.openai.com/blog/openai-for-developers-2025 — *"2025 was the year AI got easier to run in production."*

## 20 competencias núcleo según OpenAI (consolidado)

Derivadas de la totalidad de guías, Bootcamp y cookbook revisados — no se encontró listado oficial publicado como tal.

| Área | Competencias |
|---|---|
| **API / Modelos** | 1. Responses API (stateless) · 2. Function calling + Structured Outputs · 3. Prompt caching · 4. Model selection (quality/latency/cost) |
| **Agentes** | 5. Agents SDK (loop, tools, handoffs, guardrails, tracing) · 6. Sessions/memory · 7. Sandboxing · 8. AGENTS.md / repo guidance |
| **Evaluación** (la capa más enfatizada) | 9. Eval-driven development · 10. Tipos de graders · 11. Trace grading · 12. Evaluation flywheel · 13. SME alignment de LLM judges |
| **Retrieval** | 14. RAG vs fine-tuning framework · 15. File Search / vector stores · 16. Embeddings / semantic search |
| **Producción** | 17. Quality/latency/cost tradeoffs · 18. Distillation · 19. Codex / agentic coding · 20. MCP |

## Lo que no se pudo verificar

- Posición pública específica de Peter Welinder 2025-2026 (solo rol y posición histórica de 2023).
- Contenido exacto de cada sesión del Builder Bootcamp (requiere login en academy.openai.com).
- Certificación técnica nivel "Advanced": planeada pero no lanzada a junio 2026.
- Status futuro del repo open-source `openai/evals` post-deprecación de la plataforma (son proyectos distintos).
- URL directa de guía oficial de fine-tuning (developers.openai.com/api/docs/guides/fine-tuning no confirmada en la sesión de investigación).

## Implicación para Atelier (preliminar)

El curso Atelier (M0-M11) actualmente enseña: RAG con Postgres/pgvector, evals con RAGAS/DeepEval/Langfuse (M2), MCP server (M3), structured outputs con Instructor (M4), agentes con LangGraph (M6), fine-tuning QLoRA (M9).

1. **No enseñar Assistants API en ningún módulo.** Con sunset el 26-ago-2026, cualquier módulo que la mencione queda desactualizado antes del fin del año lectivo. El contenido de agentes debe basarse en Responses API + Conversations API como primitivas stateless.

2. **M2 (evals): incorporar trace grading y trajectory evals.** El Bootcamp y las guías oficiales posicionan la evaluación de trazas (no solo el string final) como la metodología estándar para sistemas agentic. El evaluation flywheel (medir → mejorar → iterar) es el patrón que OpenAI llama "eval-driven development" y debe estructurar el módulo. Además, advertir que la plataforma Evals cierra nov-2026 y que Langfuse (ya en el curriculum) es la alternativa de observabilidad válida.

3. **M6 (agentes): agregar el Agents SDK de OpenAI como alternativa explícita a LangGraph.** Los 20 competencias núcleo incluyen el SDK con su loop, handoffs y guardrails. El mercado pide awareness de múltiples frameworks (ver `2026-06-market-deltas.md`); presentar LangGraph como default pero mostrar el SDK de OpenAI como caso real de producción cubre la demanda de los job listings.

4. **M7 (costos/optimización) o módulo de producción: agregar prompt caching como técnica de reducción de costos.** Automático ≥1,024 tokens, ~50% del precio de input, con equipos reportando 60–85% de reducción. El patrón de diseño (contenido reutilizable al inicio del prompt) es una decisión de arquitectura, no un parámetro trivial — merece cobertura propia.

5. **M9 (fine-tuning): incorporar el decision framework RAG-vs-fine-tuning de OpenAI.** La regla *"do not fine-tune until you can clearly state your eval metric and why prompting cannot move it"* y el patrón híbrido 2026 (RAG para hechos + fine-tuning para estilo/política) son marcos que el mercado valida. Complement QLoRA con la perspectiva de cuándo no hacer fine-tuning y cómo documentar la decisión.

6. **SME alignment de LLM judges: agregar como subpunto en M2.** OpenAI advierte explícitamente contra confiar ciegamente en graders de modelos. El proceso de validar que el juez LLM coincide con expertos humanos es una skill operativa que falta en el curriculum actual.

## Fuentes

- https://openai.github.io/openai-agents-python/ (Agents SDK docs, verificado)
- https://github.com/openai/openai-agents-python (repo, verificado)
- https://openai.com/index/the-next-evolution-of-the-agents-sdk/ (apr-2026)
- https://openai.com/index/introducing-agentkit/ (DevDay 2025)
- https://developers.openai.com/api/docs/guides/evals
- https://developers.openai.com/api/docs/guides/evals/agent-evals
- https://developers.openai.com/api/docs/guides/evals/trace-grading
- https://github.com/openai/evals (repo open-source, 17,600+ stars)
- https://academy.openai.com/ (verificado)
- https://openai.com/index/openai-certificate-courses/ (dic-2025)
- https://developers.openai.com/api/docs/guides/function-calling
- https://developers.openai.com/api/docs/guides/structured-outputs
- https://developers.openai.com/api/docs/guides/prompt-engineering
- https://developers.openai.com/api/docs/guides/prompt-caching
- https://developers.openai.com/codex/
- https://community.openai.com/t/assistants-api-beta-deprecation-august-26-2026-sunset/1354666
- https://developers.openai.com/api/docs/assistants/migration
- https://developers.openai.com/blog/openai-for-developers-2025
- https://cookbook.openai.com (recipes: evaluation flywheel ago-2025, Eval Driven System Design 2025, Macro Evals 2025, prompt_caching_201 2025, Realtime Eval Guide dic-2025, Self-Evolving Agents oct-2025, AgentKit workflows oct-2025, Evals API MCP Evaluation 2026, Image Evals ene-2026, Evaluating Agents with Langfuse 2025)
