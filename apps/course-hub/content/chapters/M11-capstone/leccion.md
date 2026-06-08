---
module: M11
title: Capstone — packaging + distribución
concept: Convertir el portfolio en un rol de AI Engineer (señales que pesan + distribución + reframe de identidad)
duration: ~5-7h lectura + 1-2 findes de ejecución
---

# M11 — Capstone: empaquetar y DISTRIBUIR el portfolio

> **Qué vas a saber al terminar esta lección:** qué artefactos pesan de verdad para un hiring
> manager de AI Engineer (rankeados), por qué la *distribución* importa tanto como el código que
> escribiste, cómo reencuadrar tu identidad de "full-stack que usó AI" a "AI Engineer que
> construye sistemas LLM de producción" sin inflar, y cómo presentás el portfolio en vez de
> esperar que te descubran. La práctica (ver `practica.md`) no es código: son pasos de packaging
> y distribución, cada uno con un entregable concreto.

Este es el capstone. No construís una feature nueva — el sistema **Grounded** ya está hecho
(M0–M10): deployado, con eval dashboard público, hybrid retrieval, aislamiento multi-tenant,
agentes, MCP server, deploy a managed cloud. Lo que falta es la parte que casi nadie hace bien:
**convertir ese trabajo en un rol.** Ese es el objetivo #1 del curso, y este módulo es donde se
cobra.

---

## 1. Por qué la distribución importa tanto como el código

El research que fundó este curso marcó un gap brutal: **los portfolios no se descubren, se
presentan.** Hay miles de repos de RAG en GitHub. El tuyo es mejor que el 98% (tenés evals con
error-analysis, multi-tenancy verificado, un dashboard público) — pero "mejor" no sirve de nada
si nadie con poder de contratar lo ve.

Pensalo como tu propio producto:

- **M0–M10 fue construir el producto.** Bien hecho, defendible, deployado.
- **M11 es el go-to-market de ese producto.** Y vos sos a la vez el producto y el vendedor.

Un error clásico del ingeniero es creer que "si el trabajo es bueno, se vende solo". No. El
trabajo bueno *baja la fricción* de la venta, pero no la reemplaza. Dos candidatos con el mismo
sistema: el que lo **presenta** (lo postea, lo escribe, lo manda a las empresas correctas con un
pitch claro) consigue las entrevistas. El que lo deja en un README esperando, no.

> **Checkpoint:** ¿por qué no alcanza con tener el mejor portfolio?
> Porque el descubrimiento no es automático. El alcance de un repo sin distribución es ~0
> hiring managers. La distribución es la función que convierte "trabajo hecho" en "trabajo
> visto por alguien que contrata". Sin ella, el ROI de los 6 meses de curso tiende a cero.

La distribución también es **señal en sí misma.** Un AI Engineer que escribe en público, publica
un MCP server con stars, y tiene un sitio que explica sus decisiones, *demuestra* las habilidades
de comunicación y ownership que el rol exige. "Learn in Public" (swyx) no es marketing vacío: es
la evidencia de que sabés explicar sistemas complejos — exactamente lo que te van a pedir en la
ronda de system design.

---

## 2. Qué señales pesan (rankeadas, no todas valen igual)

No todos los artefactos pesan lo mismo. Esta es la jerarquía real de lo que mueve la aguja con un
hiring manager, de mayor a menor. Construís y amplificás en este orden:

| # | Señal | Por qué pesa | Tu estado |
|---|---|---|---|
| **1** | **Demo deployado live** | Es la única prueba irrefutable de que funciona. Un link que abren y usan vale más que mil palabras del CV. La mayoría de candidatos *no* tiene esto. | ✅ desde M0/M4, managed cloud en M10 |
| **2** | **Outcomes CUANTIFICADOS** | "Construí un RAG" es ruido. "Subí recall@5 de 0.61→0.89 con hybrid+rerank, reduje alucinaciones X%, p95 a Y ms" es señal. Los números separan al que midió del que vibeó. | Tenés los números (M2/M3/M7) — falta *empaquetarlos* |
| **3** | **Eval dashboard público** | <2% de los portfolios tienen evals serios visibles. Es EL diferenciador frente a wrappers. Demuestra rigor, no entusiasmo. | ✅ live desde M2 |
| **4** | **DECISIONS.md (ADRs)** | Prueba que pensás como ingeniero senior: alternativas, trade-offs, cuándo cambiarías. Es la munición del deep-dive. | ✅ iniciado M4, hay que consolidarlo |
| **5** | **Video demo (Loom 3-5 min)** | Reduce a cero la fricción de "verlo andar". El recruiter lo mira en el celular. Muestra el flujo real + un número clave. | A grabar |
| **6** | **2 blog posts técnicos** | Demuestran que sabés *comunicar* decisiones, no solo tomarlas. Posts: (a) eval methodology, (b) multi-tenancy isolation. | A escribir |
| **7** | **MCP server publicado + amplificado** | Señal del segmento de mercado de más rápido crecimiento. Un repo con README claro y algunas stars = "está en la frontera". | ✅ existe (M3), falta amplificar |
| **8** | **Sitio personal 1-página** | El hub que une todo: demo, dashboard, posts, CV, GitHub. Una URL para mandar. | A armar |

Regla mental: **el #1 y #2 son no-negociables.** Si solo tuvieras tiempo para dos cosas, son el
demo live y los outcomes cuantificados. Todo lo demás amplifica esos dos.

> **Checkpoint:** un recruiter te da 90 segundos. ¿Qué le mostrás?
> El demo live (link que abre y usa) + una línea con el número que más impresiona
> ("recall@5 0.61→0.89, aislamiento multi-tenant verificado con test cross-tenant"). No le
> mandás el repo a que lo lea. Le mandás la prueba que se consume en 90 segundos.

### El antídoto contra el CV genérico: cuantificar

Tomá cada logro y forzalo a un número. Antes → después:

- ❌ "Construí un sistema RAG de soporte." → ✅ "RAG multi-tenant de soporte; recall@5 0.61→0.89
  con hybrid (BM25+dense)+RRF+cross-encoder rerank, medido contra golden dataset de 50+ derivado
  de error-analysis."
- ❌ "Agregué evaluación." → ✅ "Eval harness (RAGAS+DeepEval, LLM-as-judge alineado a taxonomía
  de fallas) en CI gate; dashboard público; cada cambio se mide contra baseline."
- ❌ "Optimicé costos." → ✅ "Model routing por complejidad + semantic caching: −X% costo/query,
  TTFT a Y ms p95."
- ❌ "Es multi-tenant." → ✅ "Aislamiento determinístico JWT→tenant_id→namespace hard-scoped en
  capa DB; test que prueba que tenant A no recupera docs de tenant B."

Si un logro no tenés cómo cuantificarlo, o lo medís ahora o lo bajás de jerarquía. Los números
los tenés del curso — están en `DECISIONS.md` y en el dashboard. El trabajo de M11 es
*extraerlos y ponerlos al frente.*

---

## 3. El reframe de identidad: de "full-stack que usó AI" a "AI Engineer"

Venís de TS, full-stack. El instinto es presentarte como "full-stack developer con experiencia
en AI". **Eso te subvende y te mete en la pila equivocada.** El reframe es a "AI Engineer que
construye sistemas LLM de producción".

Usá la definición de **swyx** ("The Rise of the AI Engineer"): el AI Engineer es quien construye
*productos* sobre foundation models — vive en la capa entre el ML researcher y el product
engineer, domina RAG, evals, retrieval, agentes, orquestación, y el shipping de sistemas LLM.
**No** es el que entrena modelos desde cero (eso es ML researcher), **ni** el que solo pega la
API de OpenAI en un frontend (eso es un wrapper).

Lo clave: **honesto, no inflado.** Vos *sos* esto ahora — lo construiste. Tenés el sistema, los
evals, el aislamiento, los agentes, el deploy. No estás reclamando algo que no hiciste; estás
nombrando correctamente lo que hiciste. El reframe es de *naming*, no de exageración.

### 3.1 Audit de keywords ATS

Los CVs pasan por un ATS (Applicant Tracking System) antes de que un humano los vea. Si las
keywords del rol no están en tu CV/LinkedIn, te filtra una máquina. Hacé un audit: tomá 5-10 job
descriptions reales de AI Engineer y extraé los términos recurrentes. El set típico que tenés que
poder reclamar (y que efectivamente construiste):

```
RAG · vector databases (pgvector, Qdrant) · embeddings · evals / LLM-as-judge ·
hybrid search · reranking · multi-agent / agentic · LangGraph · FastAPI · Python ·
multi-tenancy · prompt engineering · semantic caching · model routing · MCP ·
observability (Langfuse) · CI/CD for ML · structured outputs · fine-tuning (QLoRA)
```

Regla: **solo reclamás keywords que podés defender.** Si está en el CV, tiene que estar en
`criterios-defensa.md` como mínimo a nivel *can-explain*, idealmente *can-build*. Un keyword que
no podés defender en la entrevista es peor que no tenerlo: te quema la credibilidad.

> **Checkpoint:** ¿cuál es la diferencia entre "inflar" y "reframe honesto"?
> Inflar = reclamar lo que no hiciste o no podés defender (ej. "experto en distributed training"
> sin haber tocado FSDP). Reframe honesto = nombrar correctamente lo que sí hiciste y podés
> defender con números y un demo. El test es simple: ¿lo podés sostener en el deep-dive con
> evidencia? Si sí, no es inflar.

### 3.2 Positioning statement con diferenciación

Necesitás una frase que diga *qué sos* y *por qué vos y no otro*. La diferenciación no es contra
otros candidatos solamente — es contra los **competidores del producto** (My AskAI, Ragie), porque
eso demuestra que entendés el mercado, no solo la tecnología. Ese análisis ya lo tenés en
`DECISIONS.md` desde M4 ("qué lo hace distinto de My AskAI/Ragie"). Reusalo.

Estructura del positioning statement (una versión larga para el sitio, una de 1 línea para el
pitch):

> *"AI Engineer que construye sistemas RAG de producción con rigor de evaluación. Construí
> Grounded — un RAG SaaS multi-tenant de soporte B2B con eval harness (error-analysis →
> golden dataset → LLM-as-judge en CI), hybrid retrieval (recall@5 0.61→0.89), aislamiento de
> tenants verificado, y agentes. A diferencia de los productos cerrados como My AskAI o Ragie,
> mi diferenciador es la evaluación medible y la defensibilidad de cada decisión de
> arquitectura."*

---

## 4. Distribución: los portfolios se presentan, no se descubren

Esta es la sección que casi ningún recurso de "armá tu portfolio" cubre, y es el gap que el
research marcó. Tenés que tratar la búsqueda como un funnel con tres piezas: **a quién**, **por
dónde**, **con qué cadencia y formato.**

### 4.1 A quién: dónde calza fuerte este portfolio

No mandás el portfolio a "cualquier empresa que contrate ingenieros". Lo mandás donde **calza
fuerte**: tu sistema es un RAG de soporte B2B multi-tenant con evals. Calza con:

- **Product companies con features de AI** (no labs de research, no consultoras genéricas).
- **Startups Series A–B** que están agregando AI a su producto — necesitan a alguien que *ship*ee
  sistemas LLM, no que investigue. Justo lo que demostraste.
- **Empresas con producto de soporte / knowledge / search** — tu vertical es literalmente el de
  ellas.

En la práctica vas a armar una lista nominal de **10-15 empresas/arquetipos** (no nombres
genéricos: empresas reales o arquetipos concretos con ejemplos). Para cada una, una línea de *por
qué calza* (qué pieza de tu portfolio responde a un dolor de ellas).

### 4.2 Por dónde: canales LatAm → US

Estás en LatAm apuntando a roles US (o US-remote). Eso es una ventaja (costo, timezone overlap) si
usás los canales correctos. Tres concretos:

1. **Plataformas de talent LatAm→US** — **Tecla**, **HireLATAM** y similares conectan ingenieros
   de LatAm con empresas US que contratan remoto. Tu perfil (AI Engineer con portfolio fuerte,
   inglés, timezone US) es exactamente lo que filtran. Aplicá con el positioning statement, no con
   "full-stack dev".
2. **Comunidades técnicas** — **MLOps Community** (tiene presencia/canales LatAm), Slack/Discords
   de AI engineering. No para spamear: para participar, compartir tus blog posts, y aparecer como
   alguien que construye. El research de empleo muestra que un % alto de roles se mueve por
   referido/comunidad, no por job board.
3. **Build-in-public en X/Twitter (y LinkedIn)** — postear el progreso, los números, el MCP
   server, los blog posts. Es la versión pública de "Learn in Public". Bajo costo, compounding:
   cada post es un activo que sigue trayendo alcance.

### 4.3 Con qué cadencia y formato: estrategia concreta

Distribución sin cadencia es un post suelto que se pierde. Definí una estrategia concreta —
plataforma, ritmo, formato:

- **Plataforma principal:** elegí UNA donde poner el esfuerzo (ej. LinkedIn para alcance a
  hiring managers + X para la comunidad AI). No te disperses en cinco.
- **Cadencia:** un ritmo sostenible que puedas mantener (ej. 1 post técnico/semana durante la
  búsqueda + aplicaciones dirigidas a 3-5 empresas de la lista/semana). La consistencia importa
  más que el volumen.
- **Formato:** el contenido ya lo tenés — los blog posts, los números, el demo, el MCP. El
  formato de distribución es trocearlo: un thread por cada blog post, un clip del Loom, un "lo
  que aprendí construyendo evals" con un número. Reusás el activo, no creás de cero cada vez.

> **Checkpoint:** ¿por qué una lista de 10-15 empresas y no "aplico a todo"?
> Porque la distribución dirigida convierte. Un pitch que dice "vi que están agregando AI a su
> producto de soporte; construí exactamente eso, acá está el demo" tiene tasa de respuesta de un
> orden de magnitud sobre un CV genérico tirado a 200 listings. Calidad de match > volumen.

---

## 5. Las 4 rondas del loop de entrevista (y dónde tu portfolio responde)

El loop típico de AI Engineer tiene 4 rondas. Tu portfolio fue diseñado para cubrirlas. Mapealas:

| Ronda | Qué evalúa | Cómo la cubre tu portfolio |
|---|---|---|
| **1. System design** | Diseñar un sistema LLM de producción | **El producto ES la pregunta #1.** Grounded es un RAG de soporte multi-tenant deployado — la pregunta de system design más común *es* lo que construiste. Dibujás tu propia arquitectura. |
| **2. Teoría ML/LLM** | Fundamentos (embeddings, attention, eval) | Las **side-quests A/B** (Karpathy GPT lectures, Makemore + logprobs). Nivel honesto: *can-explain* la intuición, no derivar attention. |
| **3. Take-home / deep-dive** | Defender decisiones técnicas con profundidad | **`DECISIONS.md` + los números.** Failure modes, alternativas consideradas, trade-offs, "cómo escala 10x". Es lo que entrenaste con cada defense drill del curso. |
| **4. Coding / DSA** | Resolver problemas de algoritmos | El **stream paralelo de DSA** (corre desde M4, fuera del producto). ~75% de los loops lo tienen. No es parte de Grounded; es práctica aparte. |

La diferenciación (evals con error-analysis primero, multi-tenancy desde M4, hybrid, agent-eval)
no es table-stakes — **es lo que te separa.** El producto deployado es necesario pero no
suficiente; lo que te hace memorable es poder defender *por qué* cada decisión, con tus números.

> **Checkpoint:** en system design te piden "diseñá un sistema de Q&A sobre docs de una empresa".
> ¿Qué hacés?
> No improvisás un diseño genérico: dibujás **tu** arquitectura (ingestión → chunking
> layout-aware → hybrid retrieval + RRF + rerank → LLM con citations → eval harness en CI →
> aislamiento multi-tenant). Y cuando preguntan "¿por qué hybrid y no solo dense?" respondés con
> tu número de recall. Ya lo construiste y lo mediste — es tu ventaja sobre quien lo improvisa.

---

## 6. Lo que tenés que poder defender (conecta con `criterios-defensa.md`)

Al cerrar M11, esto es lo que un entrevistador (o vos mismo, en la mock defense) tiene que poder
sacarte sin que dudes. Si no lo podés responder con tus palabras, números y decisiones, el
capstone no está cerrado:

- **El positioning statement, de memoria, en 1 línea y en 30 segundos.** Quién sos, qué
  construiste, cuál es tu diferenciador. (Sección 3.2)
- **El reframe honesto:** por qué sos "AI Engineer" y no "full-stack que usó AI", sostenido con
  evidencia (el demo, los evals, el aislamiento). Sin inflar. (Sección 3)
- **Las señales rankeadas:** qué le mostrás a un recruiter en 90 segundos y por qué *ese* orden.
  (Sección 2)
- **La estrategia de distribución:** a quién, por dónde, con qué cadencia — y por qué dirigido y
  no en masa. (Sección 4)
- **Las 4 rondas:** cómo tu portfolio responde a cada una, y dónde está el gap (DSA es práctica
  aparte). (Sección 5)
- **El deep-dive completo del sistema:** cualquier decisión de M0–M10 con su número, su
  alternativa, y cuándo la cambiarías. Esto es el examen integral — la **mock defense** de
  `pruebas.md` capa 2.

Seguí con `material-apoyo.md` para las fuentes (swyx, eugeneyan, canales LatAm), después
`practica.md` para ejecutar el packaging + distribución, y cerrá con `pruebas.md`: la mock defense
integral es el HARD GATE final del curso.
