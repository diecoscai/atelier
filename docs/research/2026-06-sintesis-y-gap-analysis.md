# Síntesis junio 2026 + gap analysis del curriculum v3

> 2026-06-12. Orquestador: sesión principal. Insumos: 5 agentes de research (ver `2026-06-*.md`), 6 claims verificados del workflow deep-research-lean (interrumpido por límite de gasto), curriculum map v3, y la ronda previa de research (2026-06-08).
> Objetivo del goal: que cualquiera que complete Atelier pueda ejercer como AI Engineer y validar esos conocimientos.

## 1. Qué confirmó el research (el curriculum v3 está bien parado)

- **El stack del curso = el stack del mercado.** El rol FDE (+800% YoY, $300K-$600K) pide exactamente RAG + evals + agents + observabilidad de producción = M0-M7. El producto sigue siendo la pregunta #1 de system design.
- **M2 error-analysis-first ya es canónico**: Hamel/Shreya (FAQ ene-2026, 700+ engineers) afilaron la posición — "error analysis > infraestructura". El curso ya lo hace.
- **MCP authoring en M3 fue la apuesta correcta**: MCP es baseline 2026 (10K+ servers, 97M descargas SDK) y Anthropic lo certifica formalmente (Academy).
- **LangGraph en M6 sigue siendo el estándar de producción** (superó a CrewAI; ~400 deployments enterprise).
- **Evals como diferenciador #1 se intensificó**: existe el rol "AI Evals Engineer"; OpenAI lo enfatiza como la capa más importante (flywheel, trace grading).
- Definición del rol estable (roadmap.sh + ai.engineer): SWE que construye con modelos pre-entrenados, distinto de ML engineer.

## 2. Gaps detectados (rankeados por impacto en empleabilidad)

### GAP 1 — Agentic coding como práctica diaria (NUEVO, crítico)
No existe en el curriculum. En 2026 es ronda de entrevista ("agentic coding proficiency": Canva jun-2025, piloto Google Q2-2026) y la competencia que Anthropic llama "engineer as orchestrator" (Trends Report 2026: devs usan AI en ~60% del trabajo). Contenido canónico disponible: Boris Cherny best-practices (CLAUDE.md como contrato vivo, Plan Mode, verificación=2-3x calidad, subagentes especializados, hooks deterministas, worktrees, permisos), 107 tips (ene-2026), Codex (AGENTS.md, plan mode, skills). Karpathy: "Vibe coding raises the floor. Agentic engineering is about extrapolating the ceiling."
**Fix:** nuevo side-quest **SQ-D-agentic-coding** (corre M0→M11, se practica en cada módulo) + modo "AI-assisted round" en DSA-stream.

### GAP 2 — Context engineering sin nombre propio
Es el término que reemplazó a prompt engineering (Lütke/Karpathy jun-2025, Gartner, Anthropic "#1 job of engineers building AI agents"). El curso lo hace implícito (M1 metadata, M3 retrieval, M7 token budgets) pero nunca lo nombra — y es keyword de ATS/entrevista 2026.
**Fix:** nombrarlo y enseñarlo: M3 (faceted search/metadata-rich retrieval de Jason Liu; grep-beats-embeddings como caso), M6 (4 estrategias de Anthropic: offload/retrieve-JIT/isolate/compact), M11 (keyword).

### GAP 3 — M6 enseña framework antes que patterns
Anthropic ("simplicidad sobre frameworks", los 5 patterns: chaining/routing/parallelization/orchestrator-workers/evaluator-optimizer) y swyx ("agents aren't hard; the Harness is hard") coinciden: primero patterns y trade-off workflow-vs-agent con API directa, después LangGraph. Faltan además: harnesses para long-running (initializer/worker, progress files), task descriptions detalladas para subagentes (multi-agent research system), economía multi-agente (~15x tokens), y awareness de Claude Agent SDK + OpenAI Agents SDK (handoffs, guardrails, sessions) que el mercado lista.
**Fix:** reestructurar lección M6; LangGraph queda como implementación, no como concepto.

### GAP 4 — Seguridad M5 sin el vocabulario 2026
Falta por nombre: **lethal trifecta** (Willison jun-2025), **Agents Rule of Two** (nov-2025), ataques reales documentados (Supabase MCP leak jul-2025, "Summer of Johann" ago-2025), y el dato de que ningún guardrail product es solución probada. El MCP server de M3 es superficie de ataque — conectar M3↔M5.
**Fix:** actualizar M5 (lección + drills) y mapear a OWASP LLM Top 10 por nombre.

### GAP 5 — Evals M2/M6 sin las técnicas 2026
Agregar a M2: taxonomía code-based vs LLM-based, evaluation flywheel (OpenAI cookbook ago-2025), SME alignment de LLM-judges, Cohen's Kappa para anotación. Agregar a M6: **trace grading / trajectory evals** (evaluar la secuencia completa de tool calls, no el string final) — vocabulario exacto de entrevista.
**Fix:** grafts quirúrgicos, la estructura ya está bien.

### GAP 6 — Tool design para agentes (contenido nuevo)
"Tools = contracts between deterministic systems and non-deterministic agents" + 5 principios (high leverage, namespacing, human-readable, token efficiency, docs) — el MCP server de M3 debería aplicarlos y defenderlos.
**Fix:** sección en M3 + criterio de defensa.

### GAP 7 — Validación formal: certificaciones ausentes
El curso valida con gates+drills+portfolio pero no mapea credenciales externas. Hallazgos: Anthropic Academy (gratis, certificados reales de MCP/Claude Code/subagents — única credencial técnica de frontier lab), HF Agents Course (gratis), AWS MLA-C01/AIP-C01, GCP PMLE, Databricks GenAI (Tier 1 de pago). OpenAI NO tiene cert técnica ("if you're a builder, the credentials don't yet exist"). Azure AI-102 se retira 30-jun-2026 — no recomendarla.
**Fix:** mapear módulo→credencial gratuita (M3→Anthropic MCP, M6→Anthropic subagents + HF Agents) y agregar "ruta de certificación" al M11.

### GAP 8 — Frescura técnica / deprecaciones
- Assistants API muere 26-ago-2026 → si algún material la menciona, migrar a Responses API (stateless). El curso usa FastAPI propio, riesgo bajo — verificar.
- Plataforma OpenAI Evals cierra nov-2026 → el curso usa RAGAS/DeepEval/Langfuse ✓; no referenciarla.
- Modelos citados (gpt-4o, o3) → revisar contra vigentes (GPT-5.x, Codex/GPT-5.5, Claude 4.x; GPT-5.x no fine-tuneable, RFT solo en reasoning models).
- Prompt caching como técnica de costos para M7 (~50% input, 60-85% reducción reportada; layout estable-primero).
- Fine-tuning M9: agregar el decision framework de OpenAI ("no fine-tunees hasta poder decir qué métrica de eval no se mueve con prompting"; 80% de los casos se resuelven con prompt/RAG; SFT/DPO/RFT).

### GAP 9 — Packaging M11 con framing 2025, no 2026
Keywords nuevos de mercado: context engineering, agentic engineering, harness engineering, trace grading, FDE. Liu: "reports > Q&A" como extensión de producto de alto valor. Sumar datos de mercado 2026 (salarios $206K avg, +280% agentic jobs) al framing del CV.
**Fix:** refresh de M11 + drills.

### GAP 10 (menor) — Memoria de agentes
Patrón LLM Wiki de Karpathy (may-2026: memoria navegable markdown vs embedding search) como sidebar de awareness en M6.

## 3. Matriz de cambios por capítulo

| Capítulo | Cambio | Gap | Esfuerzo |
|---|---|---|---|
| **SQ-D-agentic-coding** (NUEVO) | 5 archivos: prácticas Cherny/Codex, CLAUDE.md/AGENTS.md, Plan Mode, verificación, subagentes, hooks, entrevista AI-assisted | 1 | Alto |
| M2-evals | + flywheel, code-based vs LLM-based, SME alignment, Cohen's Kappa | 5 | Bajo |
| M3-retrieval | + context engineering nombrado, faceted search, tool design (5 principios) en el MCP server | 2,6 | Medio |
| M5-security | + lethal trifecta, Rule of Two, ataques 2025 documentados, OWASP por nombre, MCP attack surface | 4 | Medio |
| M6-agentic | Reestructura: 5 patterns primero, harness engineering, trace grading/trajectory evals, long-running harnesses, Agent SDKs awareness, LLM Wiki sidebar, economía 15x | 3,5,10 | Alto |
| M7-llmops | + prompt caching, model selection 2026 | 8 | Bajo |
| M9-finetuning | + decision framework OpenAI, SFT/DPO/RFT, modelos fine-tuneables 2026 | 8 | Bajo |
| M11-capstone | + keywords 2026, ruta de certificación, datos de mercado, "reports > Q&A" | 7,9 | Medio |
| DSA-stream | + modo "AI-assisted coding round" (Canva/Google 2026) | 1 | Bajo |
| Varios | Mapeo módulo→credencial gratuita en material-apoyo; barrido de deprecaciones/modelos | 7,8 | Bajo |
| course.config.ts | Registrar SQ-D | 1 | Trivial |

## 4. Validación de conocimientos (respuesta directa al goal)

Tres capas, en orden de peso según el research:
1. **Portfolio defendible** (ya es la espina del curso): demo live + eval dashboard + ADRs + números. Sigue siendo la señal #1.
2. **Defense drills actualizados**: sumar preguntas 2026 — lethal trifecta, trace grading de un agente, context engineering de un sistema, cuándo delegar a un agente (delegation gap), justificar costo multi-agente.
3. **Credenciales externas** (nuevo): Anthropic Academy durante el curso (gratis), HF Agents en M6, y ruta de pago post-curso (AWS MLA-C01 → AIP-C01 / GCP PMLE / Databricks GenAI) documentada en M11.

## 5. Plan de ejecución (subagentes, todos sonnet)

- **U1**: crear SQ-D-agentic-coding (5 archivos) + registrar en `course.config.ts`.
- **U2**: M2 + M6 (evals y agentes — comparten vocabulario de trace grading).
- **U3**: M3 + M5 (retrieval/MCP y security — comparten superficie MCP).
- **U4**: M7 + M9 + M11 + DSA-stream (grafts menores + packaging).
- **V**: verificador con contexto fresco (formato PASS/PARTIAL/FAIL) — consistencia entre capítulos, frontmatter, ningún claim sin fuente en docs/research.

Cada agente es dueño exclusivo de sus directorios (sin colisiones de archivos). Fuentes canónicas para los agentes: este doc + `2026-06-anthropic-engineering.md` + `2026-06-openai-ecosystem.md` + `2026-06-referentes-independientes.md` + `2026-06-market-deltas.md` + `2026-06-certifications.md`.
