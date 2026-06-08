# Validación crítica del curso (sub-agente fresco, adversarial)

> Fecha: 2026-06-08. Sub-agente sin contexto de la conversación, instruido a ser crítico y validar con research externo independiente.
> Veredicto: NO proceder como está. Reestructurar (no solo recortar).

## 12 issues encontrados

| # | Sev | Issue | Fix propuesto |
|---|---|---|---|
| 1 | MAJOR | "90% cobertura" es mention-rate, no competencia. Sidebars de 3-4h o grafts de 1 día contados como "cerrado". Context engineering relegado a transversal cuando ya es disciplina nombrada que se prueba en entrevistas. | Reemplazar "90%" por mapa de competencia con horas + nivel honesto (awareness/can-explain/can-build/can-defend). Promover context engineering a tema de primera clase en M6. |
| 2 | **CRITICAL** | Scope sobrecargado para solo dev part-time aprendiendo Python. Realista: 12-18+ meses. M0-M5 no producen NADA demo-able (evals/security son invisibles al recruiter). Valor de portfolio back-loaded. Todo "obligatorio" = sin válvula de escape = riesgo de abandono. | **Hireable checkpoint duro al final de M4**: deployado + eval dashboard público + hybrid retrieval + repo evaluable en 5 min. Todo post-M4 es aditivo. Track core (M0-M7+M11) vs extended. |
| 3 | MAJOR | "Evals-first en M1" es cuestionable: construís golden dataset contra chunking naive que vas a romper en M2/M3 → busywork. Hamel: evals valen una vez que tenés baseline que pensás mejorar. | Mover el eval harness a fin de M2 / inicio de M3 (contra docs reales ingestados). Agregar DeepEval (pytest-native, superó a RAGAS en workflow) como comparación. |
| 4 | MAJOR | GPU desde Uruguay no está resuelto. No hay datacenter local. vLLM "benchmark" mediría latencia inflada por red. | Explicitar: M9 QLoRA en Colab T4 free / RunPod (~$2). M10 vLLM = ejercicio de aprendizaje, NO deploy de producción; enmarcarlo así en portfolio (honesto y suficiente). |
| 5 | MAJOR | Customer-support RAG es ahora la pregunta canónica de system design = table-stakes, no diferenciador. Todos lo hacen. Un interviewer googlea y encuentra My AskAI ($40k MRR) y Ragie. | Pre-cargar la diferenciación: sección "qué lo hace distinto de My AskAI/Ragie" en DECISIONS.md. Solo funciona si las piezas difíciles (evals, multi-tenancy) están hechas Y visibles temprano. |
| 6 | MINOR | MCP server (la señal de más rápido crecimiento, 16.9%) está enterrado en M6, el módulo más sobrecargado. | Extraer el MCP server como mini-proyecto standalone publicable después de M3 → artefacto live que acumula stars antes. |
| 7 | MAJOR | Intercom/Zendesk subespecificado y más difícil de lo que implica. Listing en marketplace = OAuth partner + review de semanas + privacy policy + clientes reales. Necesita volumen de tickets real para testear deflection. | Reducir M8 a: webhook receiver + first-response bot para UNA plataforma con data sandbox. Marketplace = hito GTM post-M11, no curriculum. |
| 8 | MAJOR | Reasoning models (o3, Opus 4.x, Gemini 2.5) cambian RAG. El pipeline fijo M0-M5 es "System 1 RAG"; los reasoning models "ganan poco o degradan" con RAG document-level estándar → reasoning-augmented retrieval. Gap de system design ("¿cómo lo adaptás para o3?"). | Entry en DECISIONS.md "pipeline fijo vs reasoning-driven retrieval". Awareness de papers System 1 vs System 2 RAG en material-apoyo de M6. |
| 9 | MAJOR | Estrategia de hireability sobre-indexa portfolio, sub-indexa distribución/networking. Blog tiene lag 3-6 meses; sitio sin seguidores llega a 0. Los portfolios no se descubren, se presentan. Nada sobre qué empresas targetear ni canales LatAm→US. | Agregar a M11: lista de 10-15 empresas/arquetipos donde este portfolio calza fuerte; 2-3 canales LatAm→US (Tecla, MLOps Community LatAm, HireLATAM); estrategia de distribución concreta (plataforma, cadencia, formato). |
| 10 | MINOR | Turbopuffer en arquitectura es YAGNI (p50 >200ms cold, nunca llegás a esa escala). Agrega una pregunta a responder sin valor de aprendizaje. | Quitar Turbopuffer. pgvector→Qdrant alcanza y es realista. |
| 11 | MAJOR | "Aprender Python mientras construís Python de producción" subestimado. RAGAS/FastAPI/Celery/LangGraph/QLoRA todo Python. Tax real para un dev TS: +20-30% tiempo por módulo nuevo. | Medio día de onboarding Python en M0 (type hints, async, Pydantic, uv, pytest). 3-4h que ahorran 20+. |
| 12 | MAJOR | "Producto = curso" es parcialmente falsa economía. Stripe billing, rate limiting, BullMQ+Celery, webhooks = plumbing SaaS que NO enseña nada AI-específico. Señal de hiring de "tiene Stripe" ≈ 0; de "eval harness real" = muy alta. | Auth/multi-tenancy al mínimo para demostrar aislamiento (sí necesario). Diferir Stripe billing a M11/opcional. Reemplazar coordinación BullMQ+Celery por async Python simple para el curso. |

## Veredicto y cambio #1

**No proceder as-is.** El concepto es sólido y el research es mejor que el promedio, pero 3 problemas estructurales causan abandono o un resultado más débil que un plan más simple:
1. Scope incoherente con el timeline (todo mandatory, nada tiered).
2. El scope de producto es un impuesto sobre el objetivo de aprendizaje (auth/billing/queues/dual-integration son ruido).
3. La estrategia de positioning asume descubrimiento, no distribución.

**El cambio más importante:** hireable checkpoint duro al final de M4 — sistema deployado, eval dashboard live, hybrid retrieval, repo evaluable en 5 min. Todo desde M5 es aditivo. Cambia la estructura psicológica de "proyecto de 18 meses" a "sprint de 3-4 meses a hireable, después aprendizaje extendido". El riesgo de abandono cae y si la vida interrumpe en M5, igual shippeaste algo útil.

## Fuentes externas citadas
dev.to/klement_gunndu (5 AI portfolio projects 2026) · digitalapplied.com/blog/ai-developer-hiring-skills-2026 · datavlab.ai (RAG eval 2026) · braintrust.dev (best RAG eval tools) · gurusup.com (multi-agent frameworks 2026) · buildmvpfast.com (QLoRA laptop 2026) · respan.ai (Docling vs Unstructured) · encore.dev (pgvector vs Qdrant) · dev.to (context engineering 2026) · appsecsanta.com (garak vs promptfoo) · bertonisolutions.com (hiring AI eng LatAm 2026) · arxiv.org/pdf/2506.10408 (Reasoning RAG System 1/2) · spheron.network (vLLM prod 2026)
