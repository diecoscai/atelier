# Referentes independientes de AI engineering — posiciones 2025-2026

> Research 2026-06-12. Agente: research-referentes (sonnet). Fuentes primarias de swyx/Latent Space, Andrej Karpathy, Simon Willison, Chip Huyen, Hamel Husain + Shreya Shankar, Jason Liu.

## Fuentes y puntos clave

### 1. swyx / Latent Space

| Publicación | URL / Evento | Fecha |
|---|---|---|
| "Scaling without Slop" | latent.space/p/2026 | ene-2026 |
| "Agent Engineering" | latent.space/p/agent | 2025 |
| "2025 AI Engineering Reading List" | latent.space/p/2025-papers | 2025 |
| Keynote "Agents for Everything Else" | AIE Europe, tldrecap.tech | may-2026 |
| "AIE Europe Debrief + Agent Labs Thesis" | latent.space/p/unsupervised-learning-2026 | jun-2026 |

Competencias centrales:
- **Agent architecture**: subagents, memoria persistente, tools, "skills as the new app surface".
- **MCP como estándar de facto**: 97M descargas SDK feb-2026.
- **Observabilidad y evals como bucle de producción**: producción → fallos → eval → actualización del harness. *"Los evals son datos de entrenamiento."*
- **RAG de producción**: patrón más común en 2026.
- **Harness engineering** (track keynote AIEWF 2026): *"agents aren't hard; the Harness is hard."*
- Product thinking.

AIEWF 2026 (jun 29 – jul 2, SF): 12 tracks — Harness Engineering (keynote), Generative Media, Agentic Commerce, Inference, Security, tracks para CTOs/VPs.

Evolución de posición: 2023 "Rise of the AI Engineer" → 2025 "Agent Engineering" → 2026 tesis "Agent Labs >> Model Labs" (product-first). 1 evento en 2023 → 7+ en 2026: el rol se institucionalizó.

### 2. Andrej Karpathy

| Publicación / Evento | URL | Fecha |
|---|---|---|
| Tweet "vibe coding" (4.5M views) | x.com/karpathy/status/1886192184808149383 | 2-feb-2025 |
| Keynote Software 3.0, YC AI Startup School | — | jun-2025 |
| nanochat | github.com/karpathy/nanochat | 13-oct-2025 |
| Sequoia Ascent "agentic engineering" | karpathy.bearblog.dev/sequoia-ascent-2026 | feb-2026 |
| autoresearch | github.com/karpathy/autoresearch | mar-2026 |
| Concepto LLM Wiki | aicritique.org | 8-may-2026 |
| Se une a Anthropic para pre-training | TechCrunch | 19-may-2026 |

Competencias centrales:
- **System design y spec writing**: *"You are not writing code 99% of the time; you are orchestrating agents and acting as oversight"* — Sequoia Ascent, feb-2026.
- **Agent orchestration + arquitectura de memoria**: patrón LLM Wiki — markdown navegable vs embedding search.
- **Constraint engineering**: explotar picos verificables del LLM, guardrails para "inteligencia dentada".
- **Evaluation y oversight loops**: quality gates, rollback.
- **Pipeline LLM completo** (nanochat): tokenización → pretraining → SFT → RL → eval → serving por ~$100.

Cronología verificada:

| Período | Hito |
|---|---|
| feb-2025 | Acuña "vibe coding" |
| jun-2025 | Software 3.0: contexto = RAM, pesos = CPU, inglés = lenguaje de programación |
| nov-2025 | Escribe ~80% del código él mismo |
| **dic-2025** | **INFLEXIÓN: delega ~80% a agentes; *"básicamente no funcionaban antes de diciembre"*** |
| feb-2026 | Vibe coding "passé"; acuña "agentic engineering" |
| may-2026 | LLM Wiki + Anthropic |

Cita verificada: *"Vibe coding raises the floor. Agentic engineering is about extrapolating the ceiling."*

### 3. Simon Willison

| Publicación | URL | Fecha |
|---|---|---|
| "The lethal trifecta for AI agents" | simonwillison.net | 16-jun-2025 |
| "Design Patterns for Securing LLM Agents against Prompt Injections" | simonwillison.net | 13-jun-2025 |
| "Supabase MCP can leak your entire SQL database" | simonwillison.net | 6-jul-2025 |
| "The Summer of Johann" | simonwillison.net | 15-ago-2025 |
| Charla Lethal Trifecta | Bay Area AI Security Meetup | 9-ago-2025 |
| "New prompt injection papers: Agents Rule of Two and The Attacker Moves Second" | simonwillison.net | 2-nov-2025 |
| "2025: The year in LLMs" | simonwillison.net | 31-dic-2025 |
| "Writing about Agentic Engineering Patterns" | simonwillison.net | 23-feb-2026 |
| "Eight years of wanting, three months of building with AI" | simonwillison.net | 5-abr-2026 |

Competencias centrales:
- **Lethal trifecta literacy**: eliminar al menos una pata de (a) acceso a datos privados, (b) exposición a contenido no confiable, (c) comunicación externa. Única defensa probada = cortar vectores de exfiltración.
- **Prompt injection como threat model de producción**: ataques reales 2025 documentados — MCP, GitHub integrations, Supabase.
- **Agents Rule of Two**: máximo 2 de las 3 propiedades riesgosas (inspirado en Chrome Rule of 2).
- **Deployment discipline**: staging, rollout seguro, revisabilidad.
- **Escepticismo de guardrails de vendors**: *"ningún producto de guardrails previene el 95% de los ataques — no existe solución probada todavía."*

Evolución de posición: no cambió de posición, la escaló en urgencia — de advertencias (2023-24) a ataques documentados en producción (2025) a patrones de diseño concretos (2026).

### 4. Chip Huyen

| Publicación | URL | Fecha |
|---|---|---|
| "AI Engineering" (O'Reilly) — libro #1 más leído en la plataforma (verificado) | — | 7-ene-2025 |
| Capítulo "Agents" adaptado | huyenchip.com/2025/01/07/agents.html | 2025 |
| Blog mensual | huyenchip.com | 2025-2026 |

Framework 3 capas:
1. **Application**: prompt engineering, RAG, agentes, fine-tuning, dataset engineering.
2. **Model development**: adaptación, evaluación.
3. **Infrastructure**: serving, training, MLOps.

Competencias centrales:
- Prompt engineering de precisión como base no negociable.
- Progresión RAG → fine-tuning → agentes → dataset engineering.
- **Evaluación como disciplina de primer nivel**: *"fundamentalmente diferente de la evaluación de ML tradicional"*, integrada al ciclo, no post-hoc.
- Cross-functional: producto + software engineering + intuición ML.
- Agent design = tools + planning.

Sin reversiones de posición; los agentes pasaron de capítulo a tema dominante entre 2024 y 2025.

### 5. Hamel Husain + Shreya Shankar

| Recurso | URL | Fecha |
|---|---|---|
| Curso Maven "AI Evals for Engineers & PMs" — #1 más lucrativo de Maven | maven.com/parlance-labs/evals | activo |
| "A Field Guide to Rapidly Improving AI Products" | hamel.dev/blog/posts/field-guide | 2025 |
| "LLM Evals: Everything You Need to Know" FAQ (encuesta a 700+ engineers, PDF) | hamel.dev/blog/posts/evals-faq | 15-ene-2026 |

Contexto: 4,000+ profesionales de 500+ empresas; 50+ personas de cada una de Google/Microsoft/OpenAI/Meta/Amazon. Cohort rehecho por completo en sep-2026 con curriculum nuevo de Shreya.

Shreya Shankar: PhD UC Berkeley → assistant professor Carnegie Mellon fall-2027; creadora de DocETL.

Competencias centrales:
- **Error analysis como LA actividad más importante**: revisar 20–50 outputs ante cambios significativos (~30 min); determina qué evals escribir, no al revés.
- Dos tipos de evals: code-based (if/else) y LLM-based (juicio).
- Synthetic data para bootstrapping de datasets.
- Traces como unidad de análisis.
- Annotation con Cohen's Kappa (acuerdo inter-anotador).
- Evals integrados a CI/CD.

Posición afilada ene-2026: *"error analysis > infraestructura"* — la mayoría sobreinvierte en infra de evals antes de entender qué errores comete el sistema.

### 6. Jason Liu (jxnl.co)

| Publicación | URL | Fecha |
|---|---|---|
| "RAG is more than just embedding search" | jxnl.co | sep-2023 |
| "Systematically Improving RAG Applications" | jxnl.co | 24-ene-2025 |
| Context Engineering Series index | jxnl.co | 28-ago-2025 |
| "Beyond Chunks: Why Context Engineering is the Future of RAG" | jxnl.co | 27-ago-2025 |
| "Why Grep Beat Embeddings in our SWE-bench Agent" | jxnl.co | 11-sep-2025 |
| "Rethinking RAG Architecture for the Age of Agents" | jxnl.co | 11-sep-2025 |
| "Codex-maxxing" | jxnl.co | 10-may-2026 |

Competencias centrales:
- **Context engineering sobre prompt engineering**: para agentes, las respuestas de retrieval deben incluir metadata agregada (faceted search), conteos y categorías para que el agente refine consultas.
- **Retrieval heterogéneo**: grep puede ganar a embeddings (SWE-bench); elegir según dominio, no por default.
- **Structured outputs con Pydantic/Instructor**: ~11K stars, 3M descargas/mes.
- Mejora sistemática de RAG: métricas → segmentación de errores → routing → feedback flywheel.
- ***"RAG is overrated. Reports are the real game-changer... generating high-value decision-making tools that drive business outcomes"*** (X, nov-2024).
- Coding agents como *"los más económicamente viables hoy"* (estudió Devin, Amp, Cline, Augment).

Evolución: 2023 RAG foundations → 2024 optimización → ago/sep-2025 context engineering → 2026 coding agents. *"Naive RAG está muriendo; retrieval sofisticado (context engineering) crece al 49% CAGR."*

## Atribución de "context engineering" (verificada)

- Tobi Lütke (Shopify): primera referencia viral — tweet, 19-jun-2025.
- Andrej Karpathy: tweet 25-jun-2025 con la definición que cristalizó el concepto: *"Context engineering is the delicate art and science of filling the context window with the right information in the right format at the right time."*
- Jason Liu: desarrolló el marco aplicado a RAG desde ago-2025.
- Gartner: *"context engineering is in, prompt engineering is out"* — mainstream mid-2025.

## Consenso 2026 (6/6 referentes)

Posiciones compartidas sin disenso:
- Agent orchestration (todos)
- Evaluación como disciplina de ingeniería, integrada al ciclo, no post-hoc (todos)
- Context engineering (Karpathy, Liu, swyx, Huyen)
- Security de agentes (Willison, swyx, Karpathy)
- RAG/retrieval sofisticado (Liu, Huyen, Hamel/Shreya, swyx)
- Structured outputs / type safety (Liu, Huyen, Hamel/Shreya)

Cambios de posición consolidados 2023-24 → 2025-26:

| Antes (2023-24) | Ahora (2025-26) | Quién |
|---|---|---|
| Prompt engineering central | Context engineering | Karpathy jun-2025, Liu ago-2025, Gartner |
| Vibe coding | Agentic engineering (quality gates, oversight, spec writing) | Karpathy feb-2026 |
| Naive RAG | Retrieval heterogéneo + faceted search | Liu sep-2025 |
| AI Engineer = llamar APIs | AI Engineer = harness engineer | swyx jun-2026 |
| Evals = métricas | Error analysis first | Hamel/Shreya ene-2026 |
| Seguridad opcional | Lethal trifecta = blocking constraint | Willison jun-2025 |
| ML Eng ≈ AI Eng | Distinción clara (aplicar modelos vs entrenarlos) | Huyen 2025, swyx |

Stack del AI Engineer 2026 (síntesis de los 6 referentes):

| Nivel | Competencias |
|---|---|
| 1 — Fundamentos | Context engineering, Python+TS, structured outputs, retrieval heterogéneo |
| 2 — Sistemas agentivos | Orchestration, MCP, LLM Wiki pattern, spec writing |
| 3 — Calidad y seguridad | Error analysis → code-based → LLM-based → CI/CD; traces; lethal trifecta; oversight loops |
| 4 — Producto | Reports > Q&A; harness engineering a escala; loop producción → traces → errores → evals |

## Implicación para Atelier (preliminar)

El curso Atelier (M0-M11) actualmente tiene: M2=evals (error-analysis-first al estilo Hamel/Shreya ✓), M3=hybrid retrieval+MCP, M5=security (prompt injection, garak), M6=agentes LangGraph.

1. **M5 (security): incorporar "lethal trifecta" y "Agents Rule of Two" por nombre.** Willison documentó ataques reales en 2025 contra MCP y GitHub integrations. El lethal trifecta (acceso a datos privados + contenido no confiable + comunicación externa) y el Rule of Two son los marcos de diseño con nombre propio que el mercado ya usa; M5 debe enseñarlos como tales, no solo como principios genéricos de seguridad. Complementar con el escepticismo de guardrails de vendors: no hay solución probada que prevenga el 95% de los ataques.

2. **M3 (retrieval+MCP): nombrar "context engineering" explícitamente y enseñar faceted search de Liu.** El concepto ya está en el curriculum de forma implícita, pero el mercado lo llama context engineering desde mid-2025 (Karpathy, Gartner, Liu). Renombrarlo activa el vocabulario que los estudiantes verán en job listings y lecturas. El aporte técnico concreto de Liu — respuestas de retrieval con metadata agregada (conteos, categorías) para que el agente refine consultas — es un upgrade directo del módulo de RAG.

3. **M6 (agentes LangGraph): adoptar el framing de "harness engineering" y "agentic engineering".** swyx posiciona harness engineering como el track keynote de AIEWF 2026; Karpathy acuña agentic engineering como superación del vibe coding. Presentar M6 bajo estos nombres conecta el curriculum con el lenguaje que estructura el mercado en 2026, más allá del framework específico.

4. **M6 (agentes): incluir el patrón LLM Wiki de Karpathy como alternativa de memoria.** El patrón — markdown navegable en lugar de embedding search — es una decisión de arquitectura explícita con trade-offs documentados. Presentarlo junto a las opciones de memoria existentes (pgvector, sesiones) da al estudiante un decision framework real, no solo una implementación.

5. **Extensión de producto desde M6/M11: "reports > Q&A" de Liu.** La tesis de Liu (nov-2024) de que RAG para Q&A es menos valioso que RAG para generar reports de decisión de negocio es una implicación de producto directa. M11 (packaging/posicionamiento del curso) puede nombrar esto como el salto de "assistant" a "decision tool", que es el framing que diferencia los proyectos de los estudiantes en entrevistas.

6. **M2 (evals): el patrón error analysis first ya está ✓ — sumar la distinción code-based vs LLM-based como taxonomía explícita.** Hamel/Shreya la usan como el eje de diseño de evals (cuándo usar if/else vs juicio de modelo). Nombrarlo explícitamente permite al estudiante articular su proceso en entrevistas y en documentación de sistemas.

## Fuentes

- latent.space/p/2026 · latent.space/p/agent · latent.space/p/2025-papers · latent.space/p/unsupervised-learning-2026 (swyx, 2025-2026)
- tldrecap.tech (AIE Europe keynote swyx, may-2026)
- x.com/karpathy/status/1886192184808149383 (2-feb-2025)
- karpathy.bearblog.dev/sequoia-ascent-2026 (feb-2026)
- github.com/karpathy/nanochat (13-oct-2025)
- github.com/karpathy/autoresearch (mar-2026)
- aicritique.org (LLM Wiki concept, 8-may-2026)
- simonwillison.net (lethal trifecta 16-jun-2025; design patterns 13-jun-2025; Supabase MCP 6-jul-2025; Summer of Johann 15-ago-2025; Rule of Two 2-nov-2025; year in LLMs 31-dic-2025; agentic engineering patterns 23-feb-2026; eight years 5-abr-2026)
- huyenchip.com/2025/01/07/agents.html (2025)
- maven.com/parlance-labs/evals (Hamel Husain + Shreya Shankar, activo)
- hamel.dev/blog/posts/field-guide · hamel.dev/blog/posts/evals-faq (15-ene-2026)
- jxnl.co (RAG sep-2023; improving RAG 24-ene-2025; context engineering series 27-28-ago-2025; grep vs embeddings 11-sep-2025; rethinking RAG 11-sep-2025; codex-maxxing 10-may-2026)
