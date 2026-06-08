---
module: M11
gate: pending
---

# Pruebas — M11 (capstone)

Este módulo no tiene tests de software: el "test" es que los **artefactos estén live** (capa 1) y
que pases la **mock defense integral** (capa 2). La capa 2 es el HARD GATE final del curso.

## Capa 1 — checklist de artefactos LIVE (prueban que el portfolio existe y es presentable)

Cada ítem debe ser una **URL pública** que abre desde una ventana incógnito, sin setup tuyo:

- [ ] **Demo deployado live** — flujo completo (upload → pregunta → respuesta con citations +
      streaming) en managed cloud. URL: ____
- [ ] **Eval dashboard público** — métricas contra el golden dataset, legible para un extraño.
      URL: ____
- [ ] **2 blog posts publicados** — (1) eval methodology, (2) multi-tenancy isolation; cada uno
      con ≥1 número/gráfico tuyo. URLs: ____ / ____
- [ ] **MCP server** — repo público con README claro + posteado en ≥1 canal. URL: ____
- [ ] **Sitio personal 1-página** — hub que enlaza todo en 1 click. URL: ____
- [ ] **Video demo (Loom 3-5 min)** — flujo real + ≥1 número. URL: ____
- [ ] **CV actualizado (PDF) + LinkedIn** — posicionamiento "AI Engineer", keywords ATS
      auditadas, headline = positioning statement. URLs: ____
- [ ] **`DECISIONS.md` consolidado** — ADRs M0–M10 con números + sección "vs My AskAI/Ragie",
      enlazado desde el sitio. URL: ____
- [ ] **Lista de 10-15 empresas/arquetipos** — cada una con razón de match. (entregable B1)
- [ ] **Registro de outreach** — portfolio presentado a N≥3 empresas con pitch dirigido. (B4)

Capa 1 verde = todos los activos son URLs públicas que abren y los entendés sin explicar.

## Capa 2 — MOCK DEFENSE INTEGRAL (el HARD GATE final del curso)

> No se cierra el curso hasta sostener esto **en vivo, sin mirar notas**. Claude (o un compañero)
> hace de interviewer. Es la simulación completa del loop de AI Engineer. Grabate o tomá tiempo:
> el objetivo es responder fluido, con tus números.

### Apertura — el pitch (30-90 s)
1. **"Contame qué construiste y por qué debería contratarte."** → Tu **positioning statement**:
   quién sos, qué es Grounded, tu diferenciador vs My AskAI/Ragie. De memoria, en 1 minuto.
2. **"Sos full-stack. ¿Por qué decís que sos AI Engineer?"** → El reframe honesto con evidencia
   (demo, evals, aislamiento). Marcás la línea: lo que reclamás lo podés defender.

### Ronda 1 — System design (el producto ES la pregunta)
3. **"Diseñá un sistema de Q&A sobre la documentación de una empresa."** → Dibujás **tu**
   arquitectura: ingestión → chunking layout-aware → hybrid (BM25+dense) + RRF + rerank → LLM con
   citations → eval harness en CI → aislamiento multi-tenant. No improvisás genérico.
4. **"¿Por qué hybrid y no solo dense retrieval?"** → Con tu número de recall@5 (0.61→0.89).
5. **"¿Cómo garantizás que el tenant A no ve datos del tenant B?"** → Aislamiento determinístico
   en DB (JWT→tenant_id→namespace), nunca en el system prompt; el test cross-tenant que lo prueba.
6. **"¿Cómo escala esto 10x?"** → pgvector→Qdrant cuándo, caching, routing, queues si hace falta.

### Ronda 2 — Teoría ML/LLM (side-quests, nivel can-explain)
7. **"¿Qué es un embedding y por qué la búsqueda semántica funciona?"**
8. **"Explicame, a grandes rasgos, qué hace el mecanismo de attention."** → Intuición, no derivar.
9. **"¿Cómo evaluás una respuesta de LLM sin ground-truth exacto?"** → LLM-as-judge alineado a la
   taxonomía de fallas; por qué error-analysis primero.

### Ronda 3 — Take-home / deep-dive (números, failure modes, alternativas, decisiones)
10. **"Mostrame una decisión técnica de la que estés orgulloso y defendela."** → Cualquier ADR:
    alternativa considerada + el número que la respaldó + cuándo la cambiarías.
11. **"¿Cuál es el mayor failure mode de tu sistema hoy y cómo lo mitigás?"** → Honesto y
    específico (no "ninguno").
12. **"¿Cómo evaluás un agente, no solo una respuesta?"** → Trajectory/tool-correctness, el judge
    de "¿tomó el camino correcto?" (M6 conectado a M2).
13. **"Si tuvieras 1 semana más, ¿qué mejorarías y por qué?"** → Priorización con criterio.

### Ronda 4 — Coding / DSA (pista paralela)
14. **"¿Estás preparado para la ronda de algoritmos?"** → Reconocés que es ~75% de los loops, que
    lo practicaste como stream paralelo desde M4 (arrays/hashing/two-pointers/graphs/DP básico), y
    que es aparte del producto. (La práctica real de DSA se mide en su propio tracking.)

### Cierre — distribución
15. **"¿Cómo vas a conseguir que las empresas correctas vean esto?"** → Tu estrategia de
    distribución: a quién (lista de 10-15), por dónde (Tecla/HireLATAM/MLOps Community/build-in-
    public), con qué cadencia y formato. Y por qué dirigido > volumen.

**Gate final del curso:** marcalo como pasado cuando (a) la capa 1 está toda verde (URLs
públicas) y (b) sostenés la mock defense completa sin mirar notas, con tus números. Ese es el
fin de Atelier: portfolio empaquetado, distribuido a N≥3 empresas, y defendible de punta a punta.
