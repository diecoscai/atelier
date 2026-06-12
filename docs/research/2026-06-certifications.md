# Certificaciones para AI Engineers — vigentes a junio 2026

> Research 2026-06-12. Agente: research-certs (haiku). Responde "cómo validar conocimientos" del goal — el research previo (2026-06-08) cubrió entrevistas y portfolio pero no certificaciones.

## Tabla de credenciales vigentes

| Credencial | Emisor | Costo | Validez | Valida | Nota |
|---|---|---|---|---|---|
| Anthropic Academy Certificates | Anthropic (skilljar) | Gratis | s/d | Claude API, Claude Code, MCP, subagents, AI fluency | 13+ cursos, certificado oficial, LinkedIn-able |
| OpenAI AI Foundations | OpenAI + ETS | Gratis/bajo | s/d | AI fluency general (NO engineering) | Piloto dic 2025, badge Credly; acceso aún limitado |
| AWS Certified AI Practitioner (AIF-C01) | AWS | $100 | 3 años | Fundamentos AI/ML/GenAI | Entry-level |
| AWS Certified ML Engineer – Associate (MLA-C01) | AWS | $150 | 3 años | SageMaker, MLOps, CI/CD, prod | Production-focused |
| AWS Certified GenAI Developer – Professional (AIP-C01) | AWS | $150 beta → $300 | 3 años | Bedrock, LLMs, GenAI apps en prod | NUEVO; beta hasta 31-mar-2026 |
| GCP Professional ML Engineer (PMLE) | Google Cloud | $200 | 3 años | Vertex AI, MLOps, GenAI, model eval | Prestigio alto |
| GCP Generative AI Leader | Google Cloud | $99 | s/d | Estrategia GenAI, no-code | Para PMs/execs, no engineers |
| Azure AI Engineer Associate (AI-102) | Microsoft | $165 | 1 año | Azure AI Foundry, RAG, agentes | ⚠️ SE RETIRA 30-jun-2026 |
| Databricks GenAI Engineer Associate | Databricks | $200 | 2 años | RAG, LLM chains, MLflow, Model Serving | Production-focused |
| IBM AI Engineering Prof. Certificate | IBM (Coursera) | ~$400 | no expira | ML→DL→LLMs→RAG, 13 cursos ~6 meses | Para career changers sin base ML |
| IBM Generative AI Engineering Prof. Cert. | IBM (Coursera) | ~$400 | no expira | LLM arch, fine-tuning, RAG c/ LangChain | Track especializado |
| Hugging Face Agents Course Certificate | Hugging Face | Gratis | s/d | smolagents, LlamaIndex, LangGraph | Community-grade, 2 certificados |
| Oracle OCI AI Foundations Associate | Oracle | ~$165 | 1 año | OCI AI services | ⚠️ SE RETIRA 22-jun-2026 |

## Hallazgos clave

1. **OpenAI NO tiene certificación técnica de engineering** a junio 2026 — sus certs (AI Foundations dic 2025, ChatGPT for Teachers) validan AI fluency, no agents/evals/API. Meta declarada: 10M certificados para 2030, atado a OpenAI Jobs Platform.
2. **Anthropic Academy es la única credencial gratuita de frontier lab con contenido de engineering real** (MCP servers/clients en Python, Claude Code, subagents) — diferenciador de bajo esfuerzo.
3. **AWS lanzó la primera cert Professional específica de GenAI** (AIP-C01) — señal de que "GenAI developer" se formalizó como rol.
4. **Azure AI-102 y Oracle OCI AI Foundations se retiran en junio 2026** — no recomendarlas en el curso.
5. Las cloud certs validan el delivery (MLOps/serving), no las competencias diferenciales del rol (evals, agents, context engineering) — esas se validan con portfolio + entrevista, no con examen.

## Ranking para un AI Engineer que YA tiene portfolio (caso Atelier)

**Tier 1 (ROI alto):**
1. AWS ML Engineer Associate (MLA-C01) — $150, credibilidad de producción
2. AWS GenAI Developer Professional (AIP-C01) — $150 en beta, señal nueva de mercado
3. GCP Professional ML Engineer — $200, prestigio + evals de GenAI en scope
4. Databricks GenAI Engineer Associate — $200, RAG/LLM chains = core 2026

**Tier 2 (contextual):**
- Anthropic Academy (gratis — hacer SIEMPRE, durante el curso)
- Hugging Face Agents Course (gratis, refuerza M6)
- IBM AI Engineering (solo career changers sin base ML)

**Evitar:** Azure AI-102 y Oracle OCI (se retiran), OpenAI AI Foundations (esperar acceso público; no es técnica), GCP GenAI Leader (no-code, no aplica al rol).

## Implicación para Atelier (preliminar)

El curso debería mapear cada módulo a la credencial gratuita que lo refuerza (M3→Anthropic MCP courses, M6→HF Agents Course + Anthropic subagents, M10→AWS MLA-C01 como objetivo post-curso) y agregar al capstone M11 una sección "ruta de certificación" con el combo Tier 1 (~$700, 3-4 meses en paralelo).

## Fuentes

anthropic.skilljar.com · spectrumailab.com (Anthropic Academy ranked 2026) · labla.org · openai.com/index/openai-certificate-courses · aws.amazon.com/certification (AIF-C01, MLA-C01, AIP-C01) · flashgenius.net (AWS AI certs 2026, AI-102 guide) · cloud.google.com/learn/certification (PMLE, GenAI Leader) · learn.microsoft.com/credentials (AI-102) · databricks.com/learn/certification/genai-engineer-associate · coursera.org (IBM ×2) · huggingface.co/learn/agents-course · learn.oracle.com (OCI AI Foundations) · certificationpractice.com
