# RAG SaaS ("subí docs → vector store → chateá con agente") — Research de producto

> Research fecha: 2026-06-08. 4 sub-agentes en paralelo (mercado/competencia · arquitectura técnica · monetización/GTM indie · diferenciación/moats/fallas).
> Idea: producto vendible donde usuarios suben documentación a vector store + RAG, luego chatean con un agente.
> Contexto Diego: solo founder, Montevideo, full-stack, quiere desarrollarse como AI engineer Y que el proyecto tenga potencial de venta.

---

## EL hallazgo central: producto y curso son el mismo proyecto

Los "hard parts" de un RAG SaaS vendible **son exactamente** las competencias de AI engineer que querés aprender. No hay tradeoff entre "aprender" y "vender": cada parte difícil del producto = una skill de alto valor de mercado.

| Hard part del producto | Skill AI engineer que construye |
|---|---|
| Evals sistemáticos (unit tests + LLM-as-judge + A/B) | **Evals engineering** — la skill #1 |
| Hybrid search (dense+BM25+metadata+rerank) | **Advanced RAG** |
| Chunking de docs reales (PDFs, tablas, imágenes, OCR) | **Data engineering** |
| Multi-hop / query decomposition / retrieval iterativo | **Agentic RAG** |
| Prompt injection + aislamiento multi-tenant + ACL | **AI security** |
| Latencia, model routing, caching, token budget | **LLMOps / inference opt** |
| Citations, confidence, "no sé" calibrado | **Trustworthy AI / UX** |
| Embedding fine-tuning de dominio | **Fine-tuning** |

---

## Mercado: lo genérico está muerto, lo vertical NO

**Veredicto sin vueltas:** construir "otro Chatbase" horizontal NO es viable en 2026. ChatGPT file upload, NotebookLM y Notion AI cubren el 80% del caso casual gratis. El tier Chatbase/SiteGPT es race-to-the-bottom de precio sin moat.

**Dónde SÍ hay apertura (idealmente combinar 2+):**
1. **Vertical con accuracy garantizada** — dominio donde alucinar es pasivo legal (legal, clínico, compliance). Harvey/LexisNexis aún alucinan 17–33% en legal (Stanford 2025). Precio $150–400/usuario/mes por confianza, no features.
2. **Conocimiento interno mid-market** — empresas 50–500 personas: caro Glean ($50k/año), pobre Notion AI. Onyx (OSS) existe pero requiere DevOps. Hueco para Onyx-managed a $500–2k/mes.
3. **RAG agéntico + acciones** — no solo Q&A: "encontrá la respuesta Y hacé algo" (update CRM, trigger workflow). Moat de switching-cost.
4. **White-label RAG infra para SaaS builders** — Carbon murió, Ragie whitelabel en beta. Hueco B2B2C.

### Competidores (tabla)
| Nombre | Target | Precio | Edge |
|---|---|---|---|
| Chatbase | SMB no-técnico | $40–500/mo | Time-to-bot más rápido |
| CustomGPT.ai | Enterprise accuracy | $99–499/mo+ | Anti-hallucination, SOC2 |
| SiteGPT | Website owners | $39–259/mo | URL→bot simple |
| DocsBot | SMB dev-friendly | $16–416/mo | API-first, 28 sources |
| Ragie | Devs/startups | $100–500/mo+ | RAG pipeline managed (reemplaza Vectara) |
| Vectara | Enterprise regulado | $50–500/mo | HIPAA/GDPR (cerró self-service 2025) |
| Onyx (ex-Danswer) | Internal search | OSS / $20/user | Open-source Glean, 50+ connectors |
| Glean | Large enterprise | ~$25–50/user, $50k+ ACV | Connector library más amplia |
| Harvey | Law firms | $200–500/user, $100k+ ACV | $300M ARR, legal fine-tuning |
| Dify/Flowise | Devs/no-code | Free self-host | Visual workflow + RAG |

---

## Monetización & GTM para solo dev (Montevideo)

**Casos reales (todos bootstrapped):**
- **Chatbase** (Yasser Elsaid, solo): $64k MRR mes 6 → $10M ARR 2026. PERO pegó la ola exacta de ChatGPT feb-2023; esa ventana cerró.
- **SiteGPT** (Bhanu Teja, solo): $10k MRR mes 1, churn 50% mes 2, recuperó a $250k ARR. Canal: Twitter 3 años + Product Hunt.
- **My AskAI** (2 personas): $40k MRR DESPUÉS de pivotar de "chat with any data" horizontal → soporte al cliente vertical (Intercom/Zendesk). 82% margen.
- **DocsBot**: ~$500k ARR primer año, SOC2 para enterprise.

**Realidad distribución (Freemius 2025):** 70% de micro-SaaS gana <$1k MRR temprano. Mediana rentable ~$4.2k MRR. Top 1% >$50k MRR.

**Expectativa 12 meses solo dev sin audiencia:** $3k–8k MRR realista con buena ejecución. $15k+ requiere audiencia previa o nicho muy concentrado. 4–6 meses para construir+posicionar antes de revenue real.

**Costos LLM (el riesgo #1 de margen):** GPT-4o-mini ~$0.004/conversación, GPT-4o ~$0.07–0.10. Proteger margen: model routing por complejidad (-70-80%), caching agresivo, cap de tokens por tier, pasar costo al user (sistema de créditos con multiplicador por modelo premium). Margen objetivo 70-80% a $10k+ MRR.

**GTM que funciona para solo dev:** SEO + comparison pages ("X vs Chatbase") · build-in-public en X · seeding en 3 comunidades nicho · Product Hunt (spike único) · **marketplaces de integración** (Intercom/Zendesk/Slack app stores = demanda embebida). NO funciona: paid ads temprano (57% no mide ROI), mensaje horizontal genérico, esperar a SEO post-PMF.

**Vertical vs horizontal — los datos son claros: ir vertical.** Retención vertical 91-96% vs horizontal 78-85%. ARPU vertical 5-10x ($500-2000/mes legal vs $40-150 genérico). Comunidades verticales son alcanzables y el word-of-mouth viaja dentro del nicho.

**Wedge recomendado por el research:** vertical RAG para UN workflow específico de soporte al cliente, con integración nativa a Intercom/Zendesk/Crisp. (Es el camino que My AskAI probó: $0 → $40k MRR.)

---

## Arquitectura técnica de referencia (stack híbrido TS+Python)

```
TYPESCRIPT (Next.js/Node)                    PYTHON (FastAPI/Celery)
─────────────────────────────────────        ─────────────────────────────
Frontend (upload UI, chat UI)                Parsing (Docling/Unstructured)
API/BFF (auth, org ctx, rate-limit)          Embeddings
Job enqueue (BullMQ)                          Chunking pipelines
Streaming chat (Vercel AI SDK)                Vector upsert workers
Agent graph (LangGraph.js opcional)          RAGAS evals
Usage metering / billing                      LangGraph agents
                                              Fine-tuning scripts
```

**Comunicación:** Queue (BullMQ→Redis→Celery) para ingestion · REST (TS→FastAPI) para retrieval · SSE streaming para chat (FastAPI→Vercel AI SDK) · Redis Pub/Sub para status. (Evitar gRPC con equipo 1-3.)

**Stack concreto recomendado:**
- Frontend: Next.js 15 + shadcn/ui + Vercel AI SDK
- Auth: Clerk/Auth.js (JWT con org_id)
- Storage: Cloudflare R2 · Queue: BullMQ+Celery+Redis
- Ingestion: FastAPI+Celery+Docling/Unstructured
- Embedding: OpenAI text-embedding-3-small (start) → BGE-M3 (scale)
- Vector DB: **pgvector/Supabase (MVP) → Qdrant self-hosted (growth) → Turbopuffer (scale)**
- Hybrid: Qdrant sparse+dense · Rerank: Cohere /rerank o cross-encoder self-hosted
- Agent: LangGraph (Python) → stream a Vercel AI SDK
- Observability: Langfuse · Evals: RAGAS+pytest+GitHub Actions
- Infra: Docker + Fly.io/Railway → K8s

**Regla cardinal de seguridad:** NUNCA confiar en el LLM para aislar tenants. El system prompt "solo responde de los docs del user" es teatro — se rompe con prompt injection. Aislamiento determinístico en la capa de DB: JWT → extrae tenant_id → namespace hard-scoped por query. Imposible arquitectónicamente cruzar tenants.

**Pipeline RAG de producción:**
```
Query → [BM25 top-100 + Dense top-100] → RRF merge → cross-encoder rerank top-5/20 → LLM con citations
```
Hybrid + Cohere rerank: Recall@5 0.816 vs 0.695 hybrid-solo.

---

## Por qué fallan los wrappers (y cómo no ser uno)

**Estadísticas brutales:** 80% de proyectos RAG enterprise tienen fallas críticas. 90% de RAG agéntico falló en prod 2024. 70% de sistemas RAG no tienen evals sistemáticos.

**Failure modes:**
- Retrieval roto, culpan al LLM (50% recall = la mitad del contenido nunca lo ve el modelo)
- Chunking optimizado para demos, no docs reales (80% de fallas vienen de ingestion, no del LLM)
- Sin evals ("demo funciona, prod no") — efecto whack-a-mole
- Baseline de alucinación 5-10% en tareas simples, difícil bajar de 2%
- Sin moat → posición commodity (caso Jasper: $1.5B val → revenue colapsó cuando ChatGPT mejoró)
- Economía negativa por desperdicio de context window (10x costo)
- Seguridad multi-tenant: 74% éxito de poisoning, cross-tenant leakage, embedding inversion

**Moats defensibles (3 capas que componen):**
1. **Data moat** — cada corrección del user = ejemplo etiquetado que el competidor no tiene
2. **Accuracy como moat (evals-driven)** — el flywheel que hace componer toda mejora
3. **Workflow lock-in** — cuando el RAG se embebe en operación diaria (Cursor: wrapper → $29B val por indexing+memoria)

---

## Top 5 diferenciadores (defensibles Y de alto valor de aprendizaje)

1. **Sistema de evals 3-niveles** (unit + LLM-as-judge + A/B, métricas de dominio) — el flywheel #1
2. **Vertical domain depth + data flywheel** — un dominio profundo + loop de correcciones
3. **Advanced retrieval engineering** — hybrid + embeddings fine-tuned + extracción de tablas (+20-40% accuracy)
4. **Agentic actions** — de respuestas a acciones (el moat de switching-cost más grueso)
5. **Observability + cost control** — trace logging, cost tracking, model routing (-60-80% costo)

## Top 5 pitfalls (con mitigación)

| Pitfall | Mitigación |
|---|---|
| Shipear sin evals | Eval harness ANTES del código de producto: synthetic Q&A + golden dataset 50+ + regression diario |
| Solo vector search | Hybrid (BM25+vector+metadata) desde día 1; fine-tune embeddings con 100+ ejemplos |
| Posición horizontal genérica | Un vertical con tipos de doc/terminología/workflow propios |
| Ignorar seguridad multi-tenant | ACL-aware retrieval, aislamiento por tenant, sanitización, red-team mensual = launch blocker |
| Economía negativa por context waste | Monitorear precisión de retrieval, caching, model routing, pricing usage-based |

---

## Fuentes
**Mercado:** sitegpt.ai/blog · graphlit.com (RAG-as-a-service comparison) · ragie.ai · onyx.app · indiehackers.com · Stanford Legal_RAG_Hallucinations.pdf · harvey.ai
**Arquitectura:** truto.one (multi-tenant isolation) · milvus.io · firecrawl.dev (PDF parsers) · secondtalent.com (vector DB compare) · turbopuffer · langfuse.com · ai-sdk.dev · langchain.com/langgraph
**Monetización:** buildmvpfast.com (Chatbase case) · superframeworks.com (SiteGPT) · indiehackers.com (My AskAI) · docsbot.ai/article · freemius.com (micro-SaaS 2025) · cloudzero.com (LLM pricing) · saasmag.com (vertical)
**Diferenciación:** hamel.dev/blog/posts/evals · jxnl.co (RAG flywheel) · oreilly.com (year of building) · hatchworks.com (moat) · analyticsvidhya.com (silent killers) · OWASP LLM01:2025 · drivetrain.ai (unit economics)
