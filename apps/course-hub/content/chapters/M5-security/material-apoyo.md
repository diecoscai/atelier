---
module: M5
---

# Material de apoyo — M5

Curado y ordenado. No leas todo: los **★ Core** son obligatorios antes de la práctica; la Referencia
es para consultar mientras construís las defensas y la suite; el Deep dive es para defender mejor en
system design. Este módulo es de seguridad: los Core son el marco de amenazas y el por qué de cada
defensa — leelos antes de tocar una sola línea.

## ★ Core (leé esto antes de tocar código)

1. **OWASP — Top 10 for LLM Applications (edición vigente: v2.0, 12-mar-2025)**
   `genai.owasp.org/llm-top-10/` (proyecto OWASP GenAI Security). La lista canónica de riesgos,
   10 en total (LLM01-LLM10) — sigue vigente a jul-2026, sin renumeración. Buscá las fichas de
   **LLM01 (Prompt Injection)**, **LLM02 (Sensitive Information Disclosure)**, **LLM06 (Excessive
   Agency)**, **LLM08 (Vector & Embedding Weaknesses)** y **LLM09 (Misinformation)**: cada una trae
   descripción, ejemplos de ataque y mitigaciones. Tené claros los IDs y nombres exactos — se citan
   por ID en entrevista. ~1h.

2. **OWASP — Top 10 for Agentic Applications 2026 (ASI01-ASI10)**
   `genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/` — publicado
   9-dic-2025. El framework **hermano** del LLM Top 10, no un reemplazo: riesgos específicos de
   agentes con herramientas/memoria/multi-agente (Agent Goal Hijack, Tool Misuse, Agentic Supply
   Chain Compromise, Memory & Context Poisoning, entre otros). Leelo para poder distinguir en
   entrevista cuándo citás un ID de cada lista — conecta directo con el MCP server de M3 y con M6.
   ~30 min.

3. **Simon Willison — "The lethal trifecta for AI agents"**
   `simonwillison.net/2025/Jun/16/the-lethal-trifecta` — 16-jun-2025.
   El marco central de §0: las 3 propiedades que hacen exfiltrable a un agente y por qué la defensa
   es eliminar una pata, no agregar guardrails. Leelo completo; es corto. También leé la charla
   relacionada (Bay Area AI Security Meetup, 9-ago-2025, disponible como notas en su blog). ~30 min.

4. **Simon Willison — "Design Patterns for Securing LLM Agents against Prompt Injections"**
   `simonwillison.net/2025/Jun/13/prompt-injection-design-patterns` — 13-jun-2025.
   Los patrones de diseño concretos para defenderse de injection: capability separation, input
   validation, privilege minimization. La base de las defensas estructurales de §5. ~30 min.

5. **Simon Willison — "New prompt injection papers: Agents Rule of Two and The Attacker Moves Second"**
   `simonwillison.net/2025/Nov/2/new-prompt-injection-papers` — 2-nov-2025.
   El Rule of Two formalizado: máximo 2 de las 3 propiedades riesgosas. También cubre el paper
   "The Attacker Moves Second" — por qué el atacante tiene ventaja estructural. Munición directa
   para los drills de trifecta y Rule of Two. ~20 min.

6. **Simon Willison — "Prompt injection" (serie de su blog, `tags/lethal-trifecta/` y
   `tags/prompt-injection/`)**
   `simonwillison.net/tags/prompt-injection/`
   Willison acuñó el término y es la mejor fuente para *entenderlo de verdad*. Empezá por los posts
   fundacionales ("Prompt injection attacks against GPT-3", la analogía con SQL injection) y los de
   **injection indirecta** y **el patrón "dual LLM" / capability separation**. Willison siguió
   documentando exfiltraciones en vendors mainstream durante 2026 — sumá **"Google Antigravity
   Exfiltrates Data"** (25-nov-2025) y **"Microsoft Copilot Cowork Exfiltrates Files"** (26-may-2026)
   como casos recientes, y **"OpenAI Lockdown Mode"** (5-jun-2026) como el refinamiento más
   relevante: cortar una pata del trifecta con un mecanismo determinístico (no evaluado por el
   propio LLM). La idea clave a internalizar: **no hay solución del 100%**, solo mitigación en
   capas, y la defensa real es de diseño de sistema, no de prompt. ~1h.

7. **garak — repositorio y docs oficiales**
   `github.com/NVIDIA/garak` (antes `github.com/leondz/garak`) · docs en `docs.garak.ai` · pin
   `garak==0.15.1` (PyPI). El scanner de vulnerabilidades de LLMs que vas a correr en CI. Buscá: el
   modelo **probes → detectors**, la lista de probes (`promptinject`, `dan`, `encoding`,
   `leakreplay`, y los nuevos probes **ProPILE** para leakage de PII), cómo apuntarlo a un
   **endpoint REST** (generator `rest`) en vez de a un modelo crudo, y el formato del reporte
   (JSONL/HTML/JSON). Es *la* referencia del graft red-team. ~45 min.

8. **promptfoo — docs oficiales, sección red-team**
   `promptfoo.dev/docs/red-team/` · repo `github.com/promptfoo/promptfoo` · pin `promptfoo>=0.121`
   (0.121.18 a jul-2026; releases casi semanales — ahora parte de OpenAI, sigue MIT). El framework
   de eval + red-team con el que comparás garak. Buscá: cómo define un red-team (plugins/strategies
   que generan adversariales, incluyendo *context purpose overrides* y *runtime tags* recientes), y
   cómo el **mismo runner** corre tus evals funcionales y los adversariales. El objetivo de leerlo
   es poder defender **garak vs promptfoo** (barrido genérico vs específico de dominio) y por qué
   usás los dos. ~40 min.

9. **Presidio — docs oficiales**
   `presidio.dataprivacystack.org` (proyecto originado en Microsoft, hoy community-owned bajo la
   organización `data-privacy-stack`; `microsoft.github.io/presidio` redirige ahí) · pin
   `presidio-analyzer`/`presidio-anonymizer` >=2.2.363. La herramienta de detección/anonimización de
   PII. Buscá: la arquitectura **Analyzer** (reconocedores por regex + NER spaCy + checksums) y
   **Anonymizer** (operadores: replace, mask, hash, encrypt), las entidades soportadas, y la
   dependencia del **modelo de spaCy por idioma**. Es lo que vas a usar en `pii.py`. ~40 min.

## Referencia (tené a mano mientras construís)

- **OWASP — LLM01 ficha detallada de Prompt Injection** (`genai.owasp.org`) — la sección de
  mitigaciones (separación instrucción/dato, privilege control, human-in-the-loop) es tu checklist de
  §5.
- **Postgres — Row-Level Security** (`postgresql.org/docs`, "Row Security Policies") — para la RLS de
  dos dimensiones (tenant + ACL) como defensa en profundidad de §6.
- **pgvector — README y changelog** (`github.com/pgvector/pgvector`) — repaso de cómo el filtro de
  metadatos (`WHERE`) convive con la búsqueda vectorial; relevante para el filtro ACL en la query.
  **Pin `>=0.8.2`**: corrige CVE-2026-3172 (buffer overflow en builds HNSW paralelos).
- **spaCy — modelos por idioma** (`spacy.io/models`) — para correr Presidio en español. Pin
  `spacy>=3.8,<3.9` + `es_core_news_sm` en la versión matching (3.8.x).
- **garak — escribir probes/detectors custom** (`docs.garak.ai`, "contributing" / plugins) — para tus
  probes de cross-tenant probing y citation injection, que son específicas de Grounded.
- **Microsoft Security Blog — "Securing AI agents: AI tools move from reading to acting"**
  (30-jun-2026, `microsoft.com/en-us/security/blog/`) y **CSA Research Note — "MCP Security Crisis"**
  (`labs.cloudsecurityalliance.org`) — casos 2026 de supply-chain y tool-poisoning en MCP
  (postmark-mcp, LiteLLM backdoor, poisoned tool descriptions). Contexto para §0.

## Deep dive (opcional, para defender mejor en system design)

- **Greshake et al. — "Not what you've signed up for: Compromising Real-World LLM-Integrated
  Applications with Indirect Prompt Injection"** (2023), `arxiv.org/abs/2302.12173`. El paper que
  formaliza la **injection indirecta** (doc poisoning). Munición directa para §4 — citarlo te da
  autoridad sobre "no es teórico, está documentado".
- **Simon Willison — "The Dual LLM pattern for building AI assistants that can resist prompt
  injection"** (`simonwillison.net`). El patrón de **capability/privilege separation**: por qué el
  contenido no confiable nunca debe tener autoridad para gatillar acciones — la base de §5.1 y la
  conexión con LLM06 (agentes, M6).
- **OWASP GenAI — guías de la comunidad sobre red-teaming de LLMs** (`genai.owasp.org`). Marco para
  pensar el red-team como proceso, no como un solo test.
- **Google Zanzibar paper + OpenFGA/SpiceDB docs** — para el sidebar de §6 (ReBAC). Solo *awareness*:
  cuándo el modelo de grupos planos deja de alcanzar y traerías permisos por relación. No para
  construir en Grounded.
- **Chip Huyen — "AI Engineering" (O'Reilly, 2025)** — el capítulo sobre defensas y guardrails da el
  encuadre de seguridad como parte del ciclo de vida, no un apéndice.

## Cómo usar este material

Leé los ★ Core en orden (OWASP LLM Top 10 da el marco → OWASP ASI Top 10 el marco hermano para
agentes → Willison trifecta + patrones da la intuición de diseño → injection serie da la intuición
de injection → garak/promptfoo las herramientas → Presidio la PII) → escribí en tus palabras (en
`DECISIONS.md` o un scratchpad) las respuestas a los checkpoints de la lección, sobre todo "¿qué es
la lethal trifecta y cómo aplica a Grounded?", "¿por qué no hay defensa del 100% contra injection?"
y "¿garak vs promptfoo?" → recién ahí abrí `practica.md`. Si podés explicar la trifecta de tu propio
sistema, injection directa vs indirecta, y por qué el aislamiento determinístico (no el prompt) es
lo que aguanta, estás listo para construir.
