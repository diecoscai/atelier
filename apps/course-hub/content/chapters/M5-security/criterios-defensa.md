---
module: M5
---

# Criterios de defensa — M5

Al terminar M5 tenés que poder, en el nivel honesto indicado. M5 es Extended y de seguridad: el
listón en los temas core (injection, ACL, red-team) es *can-defend-in-system-design*, no solo
*can-explain* — un entrevistador de seguridad de LLMs no se conforma con definiciones.

## Lethal trifecta y Agents Rule of Two

- **(can-explain)** La **lethal trifecta** de Simon Willison (simonwillison.net, 16-jun-2025): un
  agente con (1) acceso a datos privados + (2) exposición a contenido no confiable + (3) capacidad
  de comunicación externa es exfiltrable. La única defensa probada = eliminar al menos una pata /
  cortar vectores de exfiltración. Willison: *"ningún producto de guardrails previene el 95% de los
  ataques — no existe solución probada todavía."* Los guardrails de vendors complementan, no
  reemplazan, el diseño determinista.
- **(can-explain)** Los **Agents Rule of Two** (Willison, nov-2025): máximo 2 de las 3 propiedades
  riesgosas en un agente. Si tiene las tres, hay que quitar una antes de deployar.
- **(can-build)** Análisis de la **trifecta del propio sistema Grounded**: las tres propiedades,
  cuál pata eliminaste o restringiste, y cómo documentaste esa decisión en `DECISIONS.md`.
- **(can-defend-in-system-design)** "¿Tu MCP server (M3) es un vector de ataque? ¿Cómo lo
  limitaste?" — scope de tools del server, capacidades externas que el agente no tiene, qué parte
  de la trifecta controlaste. Conectar M3↔M5 en la defensa.
- **(awareness)** Ataques reales 2025-2026: Supabase MCP leak (Willison, 6-jul-2025), "Summer of
  Johann" (Willison, 15-ago-2025), el backdoor de supply-chain en LiteLLM (mar-2026) y postmark-mcp
  — primer servidor MCP malicioso documentado en el wild. El patrón: la trifecta (y su cadena de
  supply-chain) explotada en producción.
- **(awareness)** La tendencia 2026 de mitigación: cortar una pata del trifecta de forma
  determinística sin depender de que el LLM evalúe el riesgo (ej. OpenAI Lockdown Mode restringe
  outbound requests a nivel de infraestructura), en vez de agregar más guardrails probabilísticos.

## Modelo de amenazas (OWASP LLM Top 10)

- **(can-explain)** Nombrar los riesgos de OWASP LLM que tu sistema toca por su **ID y nombre
  exacto**: **LLM01 Prompt Injection**, **LLM02 Sensitive Information Disclosure**, **LLM06
  Excessive Agency** (incluye la trifecta cuando el agente tiene comunicación externa), **LLM08
  Vector & Embedding Weaknesses**, **LLM09 Misinformation**. En entrevista: ID + nombre siempre.
- **(can-explain)** Por qué **LLM01 es el #1** y no se cierra con un prompt mejor: el LLM no separa
  instrucción de dato a nivel arquitectónico — todo es la misma secuencia de tokens.
- **(awareness)** Que el **OWASP Top 10 for Agentic Applications 2026** (`ASI01`-`ASI10`, dic-2025)
  es un framework **hermano** del LLM Top 10, no una renumeración — riesgos de comportamiento
  agéntico (tool misuse, supply-chain, memory poisoning), no del modelo/app. No confundir los dos
  esquemas de IDs en entrevista.

## Prompt injection (directa e indirecta)

- **(can-defend-in-system-design)** Explicar **injection directa vs indirecta (doc poisoning)**: en la
  indirecta el atacante esconde instrucciones en un doc ingestado, el retrieval las trae como dato
  "confiable", y atacante ≠ víctima. Por qué la indirecta es la más peligrosa y la que casi nadie
  defiende.
- **(can-defend-in-system-design)** Las **defensas en capas** y cuál es estructural vs probabilística:
  estructural = aislamiento en SQL (no en el prompt), citas verificadas en código, ningún acto
  gatillable por el retrieval; probabilística = separación instrucción/dato y delimitadores en el
  prompt, sanitización heurística. Y que **no hay defensa del 100%** — se mitiga y se *contiene* el
  impacto con diseño.
- **(can-build)** Implementar la separación instrucción/dato (system vs user, contexto delimitado y
  etiquetado como no confiable) y la sanitización de ingesta.

## ACL-aware retrieval (permisos dentro del tenant)

- **(can-defend-in-system-design)** Por qué el aislamiento por tenant de M4 **no alcanza**
  intra-tenant y cómo se diseña ACL por documento/rol: `allowed_groups` en el chunk, grupos del **JWT
  verificado**, `AND allowed_groups && $3` en el `WHERE`, RLS de dos dimensiones como defensa en
  profundidad.
- **(can-defend-in-system-design)** Por qué **filtrar en la query y no post-filtrar**: el post-filtro
  ya cargó contenido restringido (fuga + LLM02) y rompe recall en silencio. Mismo principio que el
  tenant.
- **(can-build)** El test que prueba que un usuario sin el grupo no recupera el doc restringido.
- **(awareness)** Cuándo grupos planos dejan de alcanzar y traerías **ReBAC** (Zanzibar / OpenFGA /
  SpiceDB) — y por qué construirlo en Grounded hoy es YAGNI.

## PII redaction

- **(can-build)** Detectar y redactar PII con Presidio (NER + regex + checksum) **en ingesta** (antes
  de embeber/guardar) y como **red de salida**.
- **(can-defend)** Por qué redactar **en ingesta por defecto** (minimización: la PII nunca toca el
  vector store, logs ni la API del proveedor) y la salida solo como red; y la diferencia entre
  **redaction / masking / tokenization** y cuándo cada una.
- **(can-explain)** Que la detección de PII **se mide** (precision/recall contra un set etiquetado) y
  depende del **idioma** (modelo de spaCy por lengua).

## Citation injection y técnicas adversarias

- **(can-defend)** Qué es **citation injection** (forzar citas falsas/inventadas, conecta con LLM09) y
  cómo la **verificación de cita por substring de M4** la bloquea; más delimiter/role smuggling y
  encoding/obfuscation como evasiones que necesitan red-team, no markers fijos.

## ⊕ Red-team en CI (garak)

- **(can-build)** Apuntar **garak** a tu endpoint REST (no al modelo crudo) y correr probes de
  injection/jailbreak/encoding/leak, parsear el reporte y **fallar el build** sobre umbrales.
- **(can-build)** Escribir **probes custom** específicas de Grounded: cross-tenant probing y citation
  injection, con umbral 0 de éxito del ataque.
- **(can-defend-in-system-design)** **garak vs promptfoo**: naturaleza (scanner de vulnerabilidades vs
  framework de eval+red-team) y por qué usás **los dos** (barrido adversarial genérico + ataques
  específicos de dominio).
- **(can-defend-in-system-design)** Por qué los tests de seguridad **son evals adversariales** y corren
  en el **mismo gate de CI** que los evals de M2 — una entrada conocida (ataque) con salida esperada
  (que NO funcione). Separarlos dejaría la seguridad sin gate.

---

> **Alcance M5 vs lo que sigue:** M5 endurece el aislamiento de M4 a nivel defendible en system design
> para un RAG single-shot. **LLM06 (Excessive Agency)** se vuelve crítico recién con los **agentes de
> M6**: ahí la regla "el contenido del retrieval no puede gatillar una acción/tool" pasa de buena
> práctica a requisito duro, y la lethal trifecta se vuelve el marco de diseño de cada arquitectura
> de agente. Saber dónde termina lo que construiste en M5 (defensas de un RAG, no de un agente) y
> qué se extiende a M6 (la trifecta, los Rule of Two) es parte de la defensa madura.
