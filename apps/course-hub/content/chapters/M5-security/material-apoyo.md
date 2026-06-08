---
module: M5
---

# Material de apoyo — M5

Curado y ordenado. No leas todo: los **★ Core** son obligatorios antes de la práctica; la Referencia
es para consultar mientras construís las defensas y la suite; el Deep dive es para defender mejor en
system design. Este módulo es de seguridad: los Core son el marco de amenazas y el por qué de cada
defensa — leelos antes de tocar una sola línea.

## ★ Core (leé esto antes de tocar código)

1. **OWASP — Top 10 for LLM Applications (edición vigente, 2025)**
   `genai.owasp.org` (proyecto OWASP GenAI Security) — buscá "OWASP Top 10 for LLM Applications".
   La lista canónica de riesgos. Buscá las fichas de **LLM01 (Prompt Injection)**, **LLM02
   (Sensitive Information Disclosure)**, **LLM08 (Vector & Embedding Weaknesses)** y **LLM09
   (Misinformation)**: cada una trae descripción, ejemplos de ataque y mitigaciones. Tené claros los
   IDs y nombres exactos — se citan por ID en entrevista. ~1h.

2. **Simon Willison — "Prompt injection" (serie de su blog)**
   `simonwillison.net/tags/prompt-injection/`
   Willison acuñó el término y es la mejor fuente para *entenderlo de verdad*. Empezá por los posts
   fundacionales ("Prompt injection attacks against GPT-3", la analogía con SQL injection) y los de
   **injection indirecta** y **el patrón "dual LLM" / capability separation**. La idea clave a
   internalizar: **no hay solución del 100%**, solo mitigación en capas, y la defensa real es de
   diseño de sistema, no de prompt. ~1h.

3. **garak — repositorio y docs oficiales**
   `github.com/NVIDIA/garak` (antes `github.com/leondz/garak`) · docs en `docs.garak.ai`.
   El scanner de vulnerabilidades de LLMs que vas a correr en CI. Buscá: el modelo
   **probes → detectors**, la lista de probes (`promptinject`, `dan`, `encoding`, `leakreplay`…),
   cómo apuntarlo a un **endpoint REST** (generator `rest`) en vez de a un modelo crudo, y el formato
   del reporte. Es *la* referencia del graft red-team. ~45 min.

4. **promptfoo — docs oficiales, sección red-team**
   `promptfoo.dev/docs/red-team/`
   El framework de eval + red-team con el que comparás garak. Buscá: cómo define un red-team
   (plugins/strategies que generan adversariales), y cómo el **mismo runner** corre tus evals
   funcionales y los adversariales. El objetivo de leerlo es poder defender **garak vs promptfoo**
   (barrido genérico vs específico de dominio) y por qué usás los dos. ~40 min.

5. **Microsoft Presidio — docs oficiales**
   `microsoft.github.io/presidio/`
   La herramienta de detección/anonimización de PII. Buscá: la arquitectura **Analyzer**
   (reconocedores por regex + NER spaCy + checksums) y **Anonymizer** (operadores: replace, mask,
   hash, encrypt), las entidades soportadas, y la dependencia del **modelo de spaCy por idioma**.
   Es lo que vas a usar en `pii.py`. ~40 min.

## Referencia (tené a mano mientras construís)

- **OWASP — LLM01 ficha detallada de Prompt Injection** (`genai.owasp.org`) — la sección de
  mitigaciones (separación instrucción/dato, privilege control, human-in-the-loop) es tu checklist de
  §5.
- **Postgres — Row-Level Security** (`postgresql.org/docs`, "Row Security Policies") — para la RLS de
  dos dimensiones (tenant + ACL) como defensa en profundidad de §6.
- **pgvector — README** (`github.com/pgvector/pgvector`) — repaso de cómo el filtro de metadatos
  (`WHERE`) convive con la búsqueda vectorial; relevante para el filtro ACL en la query.
- **spaCy — modelos por idioma** (`spacy.io/models`) — para correr Presidio en español (modelo `es`)
  además de inglés.
- **garak — escribir probes/detectors custom** (`docs.garak.ai`, "contributing" / plugins) — para tus
  probes de cross-tenant probing y citation injection, que son específicas de Grounded.

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

Leé los ★ Core en orden (OWASP da el marco → Willison da la intuición de injection → garak/promptfoo
las herramientas → Presidio la PII) → escribí en tus palabras (en `DECISIONS.md` o un scratchpad) las
respuestas a los checkpoints de la lección, sobre todo "¿por qué no hay defensa del 100% contra
injection?" y "¿garak vs promptfoo?" → recién ahí abrí `practica.md`. Si podés explicar injection
directa vs indirecta y por qué el aislamiento determinístico (no el prompt) es lo que aguanta, estás
listo para construir.
