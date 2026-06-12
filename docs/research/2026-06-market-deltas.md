# Deltas de mercado AI Engineering — mid-2025 → junio 2026

> Research 2026-06-12. Agente: research-mercado (haiku). Fuentes 2026 o late-2025, URLs al pie.
> Complementa `roadmaps-crosscheck.md` y `coverage-verdict.md` (2026-06-08) con lo que cambió desde esa ronda.

## Top 10 deltas 2025 → 2026

1. **Context engineering > prompt engineering** — shift de "qué le digo al modelo" a "qué necesita saber el modelo" (arquitectura de información). Fundacional para hiring 2026. Estudio peer-reviewed (9,649 experimentos): calidad de contexto > calidad de prompt.
2. **Eval literacy = señal #1** — "universal differentiator"; nace el rol "AI Evals Engineer" (test harnesses, ground-truth datasets, LLM-as-judge pipelines).
3. **Claude Code: 0 → herramienta #1** de AI coding en 8 meses (release mayo 2025; superó a Copilot y Cursor) — redefine expectativas de entrevistas.
4. **Boom de agentic AI jobs** — +280% YoY, ~90K listings US early 2026, 8 títulos nuevos (Agentic Engineer, Agent Architect…). Comp: $185K–$320K base.
5. **MCP es baseline** — 10,000+ MCP servers públicos activos, 97M descargas mensuales de SDK (Anthropic Q1 2026). Enterprise pide governance/SSO/multi-tenancy sobre MCP.
6. **LangGraph = estándar de producción** — superó a CrewAI en GitHub stars early 2026; ~400 deployments enterprise (Klarna, Uber, JP Morgan); v1.0 sept 2025; 34.5M descargas/mes.
7. **"Prompt Engineer" como título: -30%** (2024–2026) — few-shot/CoT son table stakes; el rol se fusiona en context engineering y especialización por dominio. RAG básico también commoditizado: requisito mínimo, no diferenciador.
8. **Entrevistas permiten AI tools** — Canva (jun 2025) espera Copilot/Cursor/Claude en las rondas; Google pilotea Gemini en coding round (Q2 2026). Lo evaluado: uso estratégico, validación de output, debugging de outputs multi-step, context assembly — no aceptar output crudo. Nace la ronda de "agentic coding proficiency".
9. **Salarios +$50K en un año** — AI Engineer promedio US: $156K (2025) → $206K (2026); LLM specialists $220K–$280K (+135.8% demanda YoY); especialistas de dominio +30–50% premium.
10. **Boom del rol Forward Deployed Engineer (FDE)** — +800% YoY; comp $300K–$600K+; stack exacto: RAG + evals + agents + observabilidad de producción (= el stack de Atelier/Grounded).

## Frameworks dominantes 2026

| Framework | Posición | Nicho |
|---|---|---|
| LangGraph | #1 producción | Stateful, auditable, multi-agent enterprise |
| Claude Agent SDK | #2 | Agentic coding, tool use, agentes autónomos |
| OpenAI Agents SDK | #3 | GPT-céntrico, prototipado rápido |
| CrewAI | #4 | Role-based multi-agent, startups |
| AutoGen | #5 | Research/POCs |
| Google ADK | emergente | Ecosistema GCP/Gemini |

LangGraph 27.1K búsquedas mensuales vs CrewAI 14.8K (Q1 2026).

## Stack que aparece en los pipelines de hiring

- Frameworks de agentes (arriba) + MCP servers custom
- Vector DBs: Pinecone, Weaviate, pgvector
- Evals: harnesses propios, LLM-as-judge; observabilidad: Langfuse, Braintrust, telemetría custom
- Agentic coding tools esperados en entrevista: Claude Code, Cursor, Codex
- Docker/K8s/AWS (32.9%)/Azure (26%): table stakes, ya no diferencian

## Skills en declive

- Prompt engineering standalone (título -30%); generalistas desplazados por especialización de dominio
- RAG básico ("RAG engineer" → "context engineering + vector DB optimization")
- Fine-tuning genérico: demandado en enterprise (71% de roles Python-focused lo listan) pero talent pool saturado; no es prioridad de contratación inicial

## Implicaciones directas para Atelier (preliminar — confirmar en gap analysis)

- El stack del FDE (RAG + evals + agents + observability) es exactamente M0–M7: validar que el packaging (M11) lo nombre así.
- Falta capítulo/graft explícito de **agentic coding proficiency** (usar Claude Code/Codex con estrategia, validación y debugging de output) — ahora es ronda de entrevista.
- "Context engineering" debe aparecer por nombre en el curriculum (hoy está implícito en M1/M3/M7).
- MCP ya está en M3 (authoring) ✓ — agregar la capa enterprise (governance, auth, multi-tenancy de MCP).
- LangGraph en M6 ✓ — sumar awareness de Claude Agent SDK y OpenAI Agents SDK como alternativas que pide el mercado.

## Fuentes

productleadersdayindia.org (may 2026, FDE/skills surge) · 365datascience.com (AI Engineer outlook 2026) · secondtalent.com (skills/salaries) · dataexpert.io (career path 2026) · theaicareerlab.com (agentic jobs guide 2026) · hatchworks.com (AI coding agents) · techinterview.org (Claude Code vs Cursor, may 2026) · bigblue.academy (death of prompt engineering) · neo4j.com (context vs prompt engineering) · anthropic.com/engineering/effective-context-engineering-for-ai-agents · careers.northeastern.edu (Google AI-assisted interview, may 2026) · heypinnacle.com (AI technical interviews 2026) · blog.modelcontextprotocol.io (2026 MCP roadmap) · workos.com (MCP in 2026) · jobsbyculture.com (FDE boom) · datacamp.com (agentic interview questions) · newsletter.pragmaticengineer.com (AI tooling 2026) · turion.ai / qubittool.com (framework comparisons 2026)
