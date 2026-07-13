---
module: M3
title: Advanced retrieval + MCP server
concept: Advanced RAG / Information Retrieval (hybrid + rerank) y exponer el RAG como MCP server
duration: ~8-10h lectura + 1 finde de práctica
---

# M3 — Retrieval que no pierde el match exacto (hybrid + rerank), medido

> **Qué vas a saber al terminar esta lección:** explicar por qué el retrieval *solo-vector* de M0
> falla en casos reales, cómo lo arregla **hybrid search (BM25 + dense) + reranking**, qué hace
> exactamente **RRF** (con la fórmula), cuándo ayudan las **query transformations** (rewriting,
> HyDE), cómo **exponer tu RAG como un MCP server** aplicando los principios de tool design, y
> qué es **context engineering** — la disciplina que engloba todo lo que este módulo hace. Todo el
> módulo se valida con un número: **recall@5 de hybrid+rerank vs el baseline naive de M0**, medido
> con el harness de M2.

> **Pre-requisito mental:** este módulo solo tiene sentido porque en M2 construiste el harness y
> el golden dataset. Sin eso, "mejoré el retrieval" es vibes. Con eso, es `recall@5: 0.61 → 0.89`.
> Esa es la diferencia entre un wrapper y un AI Engineer.

---

## 0. Context engineering: el nombre que le falta a lo que estás haciendo

Este módulo trata sobre llenar el contexto del modelo con la información correcta, en el formato
correcto, en el momento correcto. Eso tiene un nombre que llegó al mainstream en mid-2025 y es el
que vas a ver en job listings y en entrevistas: **context engineering**.

La definición de Andrej Karpathy (tweet del 25-jun-2025, la que cristalizó el concepto):

> *"Context engineering is the delicate art and science of filling the context window with the
> right information in the right format at the right time."*

La atribución completa (con el matiz que suele faltar): Walden Yan (Cognition, el equipo de Devin)
ya escribía sobre el concepto *antes* de que se viralizara; Tobi Lütke (Shopify) lo tuiteó el
19-jun-2025 y fue la referencia que lo hizo viral; Karpathy lo formalizó seis días después, el
25-jun-2025; Jason Liu desarrolló el marco aplicado a RAG desde ago-2025; Gartner lo hizo
mainstream con el reporte *"Lead the Shift to Context Engineering as Prompt Engineering Fades"*
(jul-2025): *"context engineering is in, prompt engineering is out"*. Gartner siguió esa línea
declarando 2026 *"the year of context"* — la señal de que esto no fue un hype de un tweet sino una
disciplina que se consolidó.

Por qué importa nombrarlo: Anthropic lo llama el "job #1 of engineers building AI agents"; es el
keyword que los ATS de 2026 escanean; y el contexto inflado es, según el blog de Anthropic
Engineering, *"el silent killer of agent reliability"*. M3 es context engineering aplicado a
retrieval: elegir qué chunks entran al contexto, en qué orden, y con qué metadata — no a mano,
sino medido con el harness de M2.

---

## 1. El problema: por qué el retrieval dense-only de M0 pierde

En M0 hiciste *una sola cosa* para recuperar: embeber la query, buscar los `k` vectores más
cercanos por coseno (`ORDER BY embedding <=> $1`). Eso es **dense retrieval** — búsqueda
*semántica*. Es excelente para significado, y **malo para coincidencia exacta**.

Mirá estas queries de soporte B2B reales y qué les pasa con dense-only:

| Query | Qué necesita | Por qué dense-only falla |
|---|---|---|
| `"error E_4011 al exportar"` | el chunk que menciona literalmente `E_4011` | El embedding de un código no captura "E_4011-idad". Códigos, IDs, hashes no tienen vecindario semántico — son *tokens*, no conceptos. |
| `"compatibilidad con el plan Tier-3"` | el chunk que dice `Tier-3` | "Tier-3" y "Tier-2" embeben *casi igual* (un dígito de diferencia). Dense los confunde. |
| `"SDK versión 2.7.4"` | el chunk con esa versión exacta | Los números de versión colapsan al mismo vecindario. Dense trae "2.7.x" en general. |
| `"cómo cancelo mi suscripción"` | el chunk sobre cancelación | Acá dense **gana**: "cancelar" ≈ "dar de baja" ≈ "terminar contrato". Sin solapamiento de palabras. |

El patrón: **dense gana en paráfrasis y sinónimos; pierde en términos exactos, raros o
fuera-de-vocabulario** (códigos de error, SKUs, nombres propios, versiones, acrónimos del
cliente). En soporte B2B esos términos exactos son *justo* lo que el usuario tipea cuando algo
se rompe. Por eso un RAG de soporte solo-dense falla en el peor momento.

> **Checkpoint:** ¿por qué `text-embedding-3-small` no distingue bien `Tier-3` de `Tier-2`?
> Porque los embeddings capturan *significado distribuido*: dos strings que difieren en un
> carácter sin carga semántica caen casi en el mismo punto del espacio. El modelo no fue
> entrenado para tratar "3" como una entidad discreta distinta de "2" en ese contexto.

La solución no es tirar dense. Es **sumarle el método opuesto** — uno que sí sea literal — y
fusionar. Eso es hybrid.

---

## 2. Sparse vs dense: dos formas de "parecido" que se complementan

Hay dos familias de retrieval. La clave es que **fallan en lugares distintos**, así que
combinadas tapan los huecos de la otra.

### Dense (lo que ya tenés)
- Representás cada chunk como **un vector denso** (1536 floats, casi todos no-cero) que captura
  significado. Buscás por **cercanía geométrica** (coseno).
- **Fuerte:** sinónimos, paráfrasis, intención. `"olvidé mi clave"` encuentra `"reset de
  contraseña"`.
- **Débil:** términos exactos sin vecindario semántico (códigos, IDs, jerga del cliente).

### Sparse — BM25 (el clásico de Information Retrieval)
- Representás cada chunk como un **vector disperso (sparse)**: una dimensión por palabra del
  vocabulario, casi todo cero, con peso solo en las palabras que aparecen. Es búsqueda
  **léxica / por keyword**, la heredera directa de TF-IDF.
- **BM25** (Best Matching 25) puntúa un documento para una query sumando, por cada término de la
  query que aparece en el doc, tres señales:
  1. **TF (term frequency):** cuántas veces aparece el término en el doc — pero con
     **saturación** (la 10ª aparición pesa mucho menos que la 2ª; parámetro `k1`).
  2. **IDF (inverse document frequency):** qué tan *raro* es el término en todo el corpus. Una
     palabra que aparece en todos lados (un "the" o "el") pesa casi nada; `E_4011`, que aparece
     en un solo chunk, pesa muchísimo. **Por esto BM25 brilla con términos raros y exactos.**
  3. **Normalización por longitud del doc** (parámetro `b`): un doc largo no gana solo por ser
     largo y contener la palabra de casualidad.
- **Fuerte:** match exacto, términos raros, códigos, nombres propios. Si tipeás `E_4011`, BM25 lo
  encuentra aunque ningún embedding lo "entienda".
- **Débil:** sinónimos y paráfrasis. `"olvidé mi clave"` **no** matchea `"reset de contraseña"`
  porque no comparten palabras. (Cero solapamiento léxico = score 0.)

| | Dense (embeddings) | Sparse (BM25) |
|---|---|---|
| Representación | vector denso ~1536 dims | vector disperso, 1 dim/término |
| Mide | significado (semántica) | coincidencia de palabras (léxico) |
| Gana en | sinónimos, intención, paráfrasis | términos exactos, raros, códigos, IDs |
| Pierde en | códigos, versiones, jerga rara | sinónimos, paráfrasis |
| En Postgres | pgvector (`<=>`) | full-text search (`tsvector`, `ts_rank`) |

> **Checkpoint:** ¿por qué BM25 le da tanto peso a `E_4011` en la query `"error E_4011"` pero
> casi nada a `"error"`? Por el IDF: `error` aparece en miles de chunks (común → IDF bajo),
> `E_4011` en uno (raro → IDF alto). BM25 prioriza la señal discriminante.

La conclusión que tenés que poder defender: **no es dense *o* sparse, es dense *y* sparse.** Sus
debilidades son casi disjuntas. El problema pasa a ser *cómo fusionar dos rankings*.

---

## 3. Hybrid search: correr ambos y fusionar con RRF

Hybrid search = correr **las dos búsquedas en paralelo** (BM25 y dense), cada una devuelve su
top-N rankeado, y **fusionar los dos rankings en uno solo**. La pregunta es cómo fusionar.

### Por qué NO sumar scores directo
La tentación naive es `score_final = α · score_dense + (1-α) · score_bm25`. **No funciona bien**
y tenés que saber por qué: los scores **viven en escalas incomparables**. El coseno de dense va
de -1 a 1; el score BM25 es un número sin techo que depende del corpus y la query (puede ser 3 o
40). Sumarlos es sumar peras con manzanas. Tendrías que normalizar cada uno (min-max, z-score),
y esas normalizaciones son frágiles: dependen del batch, un outlier te arruina la escala, y el
`α` óptimo cambia por query. Es un parámetro más que tenés que tunear y defender.

### RRF — Reciprocal Rank Fusion (la respuesta)
La idea de **RRF** (Cormack, Clarke & Büttcher, 2009) es elegante: **ignorá los scores, usá solo
la posición (rank) en cada lista.** El rank #1 es el rank #1, no importa si su score fue 0.99 o
3.7. Eso elimina por completo el problema de escalas.

La fórmula. Para un documento `d`, su score RRF es la suma, sobre cada ranking `i` donde aparece,
de uno sobre (`k` más su posición en ese ranking):

```
                    1
RRF(d) =  Σ  ─────────────────
          i   k + rank_i(d)
```

- `rank_i(d)` = la posición de `d` en el ranking `i` (1 = primero, 2 = segundo, ...).
- `k` = una constante (el paper usa **60**). Amortigua el peso de los primeros puestos: sin `k`,
  el rank #1 valdría 1.0 y el #2 valdría 0.5 (caída brutal); con `k=60`, el #1 vale `1/61 ≈
  0.0164` y el #2 `1/62 ≈ 0.0161` — la diferencia entre posiciones altas se suaviza, y un doc que
  sale #3 en *ambas* listas le gana a uno que sale #1 en una sola y no aparece en la otra.
- Si `d` aparece en las dos listas, sumás los dos términos → **el consenso entre métodos se
  premia**. Justo lo que querés: un chunk que tanto BM25 *como* dense consideran relevante es la
  apuesta más segura.

Ejemplo concreto con `k=60`, dos listas:

```
dense:  [chunkA, chunkB, chunkC]      bm25: [chunkB, chunkD, chunkA]

chunkA: 1/(60+1) + 1/(60+3) = 0.0164 + 0.0159 = 0.0323   ← en ambas
chunkB: 1/(60+2) + 1/(60+1) = 0.0161 + 0.0164 = 0.0325   ← en ambas, gana
chunkC: 1/(60+3)            = 0.0159                       ← solo dense
chunkD: 1/(60+2)            = 0.0161                       ← solo bm25

ranking fusionado: chunkB, chunkA, chunkD, chunkC
```

`chunkB` gana porque aparece arriba en *las dos* listas. `chunkA` segundo por lo mismo. Los que
salen en una sola lista quedan abajo. Eso es exactamente el comportamiento deseado.

> **Checkpoint:** ¿por qué RRF usa el rank y no el score? Porque los scores de BM25 y dense
> están en escalas distintas e incomparables; el rank (posición) es una señal *ordinal* común a
> ambos. RRF compra robustez (cero tuning de normalización) a cambio de tirar la magnitud del
> score — y en la práctica esa magnitud aportaba poco y costaba tuning.

> **Checkpoint:** ¿qué hace el `k=60`? Controla cuánto pesan las posiciones altas. `k` chico →
> el top-1 domina (parecido a "el que ganó una lista gana todo"). `k` grande → aplana, premia el
> consenso entre listas. 60 es el default del paper (2009) y la literatura reciente confirma que
> RRF no es muy sensible a `k` — es un punto de partida sensato para arrancar. Cuándo sí vale la
> pena barrerlo en tu harness: cuando tu corpus tiene una distribución de relevancia muy distinta a
> la de un benchmark genérico (ej. investigación de 2026 sobre retrieval de patentes encontró que
> `k=30` era mejor para ese corpus específico). Si tu dominio es idiosincrático, no asumas 60 —
> medilo.

---

## 4. Hybrid en Postgres: BM25 + dense en una sola base

No necesitás un motor de búsqueda aparte (Elasticsearch). Postgres hace **las dos**: pgvector
para dense (ya lo tenés de M0) y **full-text search nativo** (`tsvector` / `ts_rank`) para la
parte léxica. `ts_rank` no es BM25 *exacto*, pero es la misma familia (TF-IDF léxico) y alcanza
de sobra para el curso; cuando quieras BM25 estricto, la extensión `pg_search` (ParadeDB) lo da.

> **Nota de versiones (jul-2026):** pgvector está en la serie 0.8.x (0.8.5 compila contra
> Postgres 18, la versión estable actual con un I/O subsystem nuevo — hasta 3x más rápido en
> lecturas); ya salió **Postgres 19 Beta 1** (jun-2026) con GA estimado para fin de año, así que no
> te sorprenda si tu proveedor te empuja a migrar durante el curso. Si pensás usar `pg_search`
> (ParadeDB) sobre **Neon**: desde mar-2026 ya no está disponible para proyectos nuevos (solo los
> existentes lo conservan) — confirmá con tu hosting antes de apoyarte en esa extensión, o quedate
> con `ts_rank` nativo, que alcanza para este módulo.

Agregás una columna de búsqueda léxica y un índice GIN:

```sql
-- columna tsvector generada desde el contenido (full-text search)
ALTER TABLE chunks ADD COLUMN content_tsv tsvector
  GENERATED ALWAYS AS (to_tsvector('spanish', content)) STORED;

CREATE INDEX chunks_tsv_idx  ON chunks USING gin (content_tsv);
CREATE INDEX chunks_vec_idx  ON chunks USING hnsw (embedding vector_cosine_ops);
```

Cada retriever devuelve su top-N **con su rank**. Una forma limpia de hacer RRF en SQL puro
(con CTEs y `ROW_NUMBER()` para el rank) sobre las dos búsquedas:

```sql
WITH dense AS (
  SELECT id,
         ROW_NUMBER() OVER (ORDER BY embedding <=> $1) AS rank   -- $1 = query embedding
  FROM chunks
  ORDER BY embedding <=> $1
  LIMIT 60
),
sparse AS (
  SELECT id,
         ROW_NUMBER() OVER (ORDER BY ts_rank(content_tsv, q) DESC) AS rank
  FROM chunks, plainto_tsquery('spanish', $2) AS q                -- $2 = query text
  WHERE content_tsv @@ q
  ORDER BY ts_rank(content_tsv, q) DESC
  LIMIT 60
)
SELECT c.id, c.content,
       COALESCE(1.0 / (60 + dense.rank), 0) +
       COALESCE(1.0 / (60 + sparse.rank), 0) AS rrf_score        -- la fórmula de §3
FROM chunks c
LEFT JOIN dense  ON c.id = dense.id
LEFT JOIN sparse ON c.id = sparse.id
WHERE dense.id IS NOT NULL OR sparse.id IS NOT NULL
ORDER BY rrf_score DESC
LIMIT 60;                                                         -- candidatos para el reranker
```

Fijate el `LIMIT 60` final: **no devolvés 5 todavía.** Devolvés un pozo amplio de candidatos
(50-100) que en el próximo paso un reranker va a ordenar fino. Recordá los operadores de
pgvector de M0: `<->` L2, `<=>` coseno, `<#>` producto interno — acá usás `<=>` igual que en M0.

> **Checkpoint:** ¿por qué hybrid devuelve 60 candidatos y no los 5 finales? Porque hybrid es
> **recall-oriented**: su trabajo es *no perder* el chunk correcto, meterlo en algún lado del
> top-60. Quién decide cuáles son los 5 mejores de esos 60 es el reranker (§5), que es mucho más
> preciso pero solo se puede dar el lujo de mirar pocos.

---

## 5. Reranking: el cross-encoder que ordena fino el top-N

Hybrid te da ~60 candidatos con buen *recall* (el correcto está adentro), pero su *ranking* es
ordinario — RRF fusiona posiciones, no entiende profundamente la query. El **reranking** es un
segundo paso que **re-ordena esos 60 y se queda con el top-5/20**, usando un modelo mucho más
preciso. Para entender por qué funciona y por qué es caro, tenés que distinguir dos arquitecturas.

### Bi-encoder vs cross-encoder
- **Bi-encoder** = lo que usás para *buscar* (tus embeddings de M0). Embebe la query y el
  documento **por separado**, en dos pasadas independientes, y compara los dos vectores con
  coseno. La ventaja decisiva: el vector del documento se **precomputa una vez** en la ingesta y
  se guarda; en query-time solo embebés la pregunta y hacés similarity search. **Por eso escala**
  a millones de chunks: la parte cara ya está hecha.

- **Cross-encoder** = mete la query **y** el documento *juntos* en una sola pasada del modelo
  (`[query] [SEP] [documento]`), y el modelo atiende cruzado entre ambos token a token. Sale un
  único score de relevancia. Es **mucho más preciso** — el modelo ve la interacción real entre
  pregunta y pasaje, no dos resúmenes comprimidos en vectores. Pero el costo es brutal: **no
  podés precomputar nada**, porque el score depende del par (query, doc). Para 1 query sobre 1M
  de chunks tendrías que correr el modelo 1M de veces *en query-time*. Inviable para buscar.

| | Bi-encoder (search) | Cross-encoder (rerank) |
|---|---|---|
| Procesa query y doc | por separado | juntos, con atención cruzada |
| Precómputo del doc | sí (en ingesta) | imposible (depende del par) |
| Precisión | buena | mucho mejor |
| Costo en query-time | barato (1 embed + ANN) | caro (1 forward por par) |
| Rol | **buscar** sobre millones | **re-ordenar** decenas |

### Por eso el cross-encoder SOLO re-rankea, no busca
Esta es la línea exacta que te van a pedir en entrevista. El cross-encoder es demasiado caro para
buscar sobre el corpus entero, pero **perfecto para re-ordenar un puñado de candidatos** que un
método barato ya filtró. Es el patrón **retrieve-and-rerank**, o "funnel":

```
1M chunks ──[hybrid: barato, recall-oriented]──▶ top-60 ──[cross-encoder: caro, preciso]──▶ top-5
```

El cross-encoder corre 60 veces por query (1 por candidato), no 1M. Costo acotado, precisión
alta donde importa. Hacés barato el filtro grueso y caro solo el ajuste fino sobre poquitos.

### Cohere rerank vs cross-encoder self-hosted
Dos formas de tener el cross-encoder:
- **Cohere Rerank (API)** — desde dic-2025 la línea vigente es **Rerank 4**: `rerank-v4.0-pro`
  (máxima calidad, ventana de 32K tokens, 100+ idiomas, entiende contenido semi-estructurado —
  JSON, tablas, código) y `rerank-v4.0-fast` (menor latencia, el punto de partida más barato). Le
  mandás query + lista de documentos, te devuelve los índices reordenados con relevance scores.
  Cero infra, multilingüe out-of-the-box (clave para soporte en español), pago por uso, latencia
  de red. **Empezás acá** (DESIGN: Cohere como start) — es la decisión correcta para validar que
  rerank mueve la aguja antes de operar un modelo.
  > ⚠️ **`rerank-v3.5` deja de recibir tráfico el 1-ago-2026.** Si veías ese nombre en versiones
  > anteriores de este curso, es porque era el vigente hasta ahora. A partir de esa fecha Cohere
  > enruta automáticamente el tráfico de v3.5 a `rerank-v4.0-fast`, y los `relevance_score` **no
  > son comparables** entre versiones — si tenés un threshold hardcodeado, re-calibralo con el
  > harness después de migrar.
- **Cross-encoder self-hosted** — ej. `BAAI/bge-reranker-v2-m3` (sigue siendo el estándar de facto,
  sin sucesor mayor) o un `ms-marco-MiniLM` vía `sentence-transformers`. Sin costo por llamada y
  sin mandar datos a un tercero (privacidad B2B), pero ahora **operás un modelo**: GPU o CPU lento,
  batching, latencia, deploy. Migrás acá cuando *medís* que el volumen o el compliance lo
  justifican — el mismo criterio YAGNI de pgvector en M0. El ecosistema self-hosted se diversificó
  bastante en 2026 — `Qwen3-Reranker` (0.6B/4B/8B), `Jina Reranker v2`, `ZeroEntropy zerank-2`
  (multilingüe, del orden de 40x más barato que Cohere) y `KaLM-Reranker-V1` (arxiv, jun-2026) — no
  hace falta perseguir cada release, pero antes de asumir que `bge-reranker-v2-m3` es la única
  opción, vale correr un benchmark rápido contra tu golden set: puede que una de estas alternativas
  te dé un punto intermedio (más barato que Cohere, sin la fricción de operar GPU propia).

### El número que justifica todo el módulo
El dato real de la literatura (Pinecone, Cohere y otros lo reportan consistente): **hybrid +
rerank sube el recall de forma significativa frente a dense-only** — típicamente decenas de
puntos en datasets de QA/soporte. Pero el número que vale en *tu* defensa no es el del blog, es
**el de tu harness de M2 sobre tu golden dataset**: `recall@5 naive (M0)` vs `recall@5
hybrid+rerank (M3)`. Ese delta, medido por vos, es el entregable del módulo.

> **Checkpoint:** ¿por qué un cross-encoder es más preciso que un bi-encoder pero solo se usa
> para rerankear? Porque procesa query y doc juntos con atención cruzada (ve la interacción real
> → más preciso), pero por eso mismo no puede precomputar el doc y debe correr un forward por par
> (query, doc) en query-time. Inviable sobre millones; perfecto sobre las decenas que el retriever
> barato ya filtró.

---

## 6. Query transformations: arreglar la *pregunta* antes de buscar

A veces el problema no es el retriever, es **la query**. El usuario escribe corto, ambiguo, con
errores, o con un vocabulario que no matchea el de la doc. Dos técnicas para transformar la query
antes de buscar:

### Query rewriting
Pasás la query del usuario por un LLM barato que la **reescribe** para que recupere mejor:
expande siglas, corrige typos, agrega sinónimos, o la descompone. Casos de uso:
- **Expansión:** `"no anda el SSO"` → `"el inicio de sesión único (Single Sign-On / SSO) no
  funciona; error de autenticación SAML/OAuth"`. Ahora hay más términos para que BM25 y dense
  enganchen.
- **De-contextualización en chat:** en una conversación, `"¿y eso cómo se configura?"` no tiene
  sentido aislado. El rewriter usa el historial y lo vuelve `"¿cómo se configura el webhook de
  Intercom?"` — una query auto-contenida y buscable.
- **Descomposición:** una pregunta multi-parte se parte en sub-queries que buscás por separado.

### HyDE — Hypothetical Document Embeddings
Técnica con un giro contra-intuitivo (paper de Gao et al., 2022, "Precise Zero-Shot Dense
Retrieval without Relevance Labels"). El problema de fondo: **una pregunta y su respuesta no se
parecen léxicamente.** La query `"¿cómo aumento el límite de rate?"` y el chunk de la doc
`"Para elevar tu cuota de requests, configurá rate_limit_tier en el panel de Admin…"` comparten
pocas palabras y su distancia de embedding es mayor de lo ideal: estás comparando *una pregunta*
contra *una respuesta*, dos géneros de texto distintos.

HyDE lo resuelve así:
1. Le pedís a un LLM que **genere una respuesta hipotética** a la query — un párrafo que *suene
   como* el documento que buscás, aunque tenga datos inventados. ("Para aumentar el límite de
   rate, andá a Settings → API y modificá el tier…").
2. **Embebés ese documento hipotético** (no la pregunta original).
3. Buscás con *ese* vector.

¿Por qué funciona? Porque ahora comparás **documento-vs-documento** (hipotético vs reales), que
viven en el mismo "género" del espacio de embeddings y caen más cerca. Las invenciones del LLM no
importan: solo usás el vector para *encontrar* los docs reales, la respuesta final la genera el
LLM sobre los chunks recuperados de verdad.

### Cuándo ayudan (y cuándo no)
- **Ayudan** cuando: queries cortas/ambiguas, mucha brecha de vocabulario query↔doc, chat
  multi-turno (rewriting es casi obligatorio ahí), dominios con jerga.
- **No valen la pena** cuando: queries ya largas y descriptivas, o cuando el costo/latencia extra
  (cada transformación es +1 llamada LLM *antes* de buscar) no compensa. **HyDE puede alucinar
  hacia el lado equivocado** y *empeorar* el retrieval si la query es muy out-of-domain. Por eso
  **lo medís con el harness**: agregás la transformación, corrés recall@5, y la mantenés solo si
  sube. No la metés "porque suena bien". El consenso 2026 es no dejarla siempre-on sino **gateada**:
  solo disparás HyDE cuando la similitud query-doc de la búsqueda directa es baja (señal de brecha
  de vocabulario), y siempre validás el resultado con el reranker después — así el costo extra solo
  se paga cuando hay evidencia de que hace falta.

> **Checkpoint:** ¿por qué embeber una respuesta inventada mejora el retrieval? Porque el match
> de embeddings es más fuerte documento-vs-documento que pregunta-vs-documento. El doc hipotético
> vive en el mismo género que los reales (misma forma, mismo vocabulario esperado), así que su
> vector cae más cerca de los chunks correctos. La invención no contamina la respuesta final
> —solo se usa para *buscar*.

---

## 7. Metadata filtering: usar la estructura que guardaste en M1

En M1 enriqueciste cada chunk con **metadata** (sección, tipo de doc, producto, versión, fecha,
`doc_id`). El retrieval avanzado la usa para **filtrar el espacio de búsqueda *antes* o *durante*
la búsqueda vectorial** — un `WHERE` sobre columnas estructuradas combinado con el `ORDER BY`
vectorial:

```sql
SELECT content
FROM chunks
WHERE product = 'billing'          -- pre-filtro por metadata (de M1)
  AND version >= '2.0'
ORDER BY embedding <=> $1
LIMIT 60;
```

Por qué importa:
- **Precisión:** si el usuario pregunta por el producto *Billing*, no querés chunks de *Analytics*
  contaminando el top-k aunque embeban parecido.
- **Multi-tenancy (anticipo de M4):** el filtro más crítico es `WHERE tenant_id = $org`. Es la
  base del aislamiento — el tenant A nunca debe recuperar chunks del tenant B. En M3 lo practicás
  como filtro; en M4 lo volvés un invariante hard-scoped y lo testeás adversarialmente.
- **Frescura:** filtrás por fecha para no recuperar doc deprecada.

Cuidado a defender: un filtro muy agresivo **mata el recall** (si filtrás de más, el chunk
correcto queda fuera antes de que el ranking lo vea). Es un trade-off precision↔recall que —
otra vez— se *mide*, no se adivina.

---

## 8. Retrieval para agentes: metadata-rich retrieval y cuándo grep le gana a embeddings

### Faceted search: respuestas con estructura para que el agente refine

Cuando el consumidor de tu RAG no es un usuario final sino un **agente**, el contrato de retrieval
cambia. Jason Liu (Context Engineering Series, ago-sep-2025, jxnl.co) lo describe así: los
resultados de retrieval para agentes deben incluir **metadata agregada** — conteos, categorías,
facetas — no solo chunks de texto. ¿Por qué? Porque el agente necesita poder *refinar* la consulta.

Si el agente busca "documentación de autenticación" y el retriever devuelve cinco chunks sin
contexto, el agente no sabe si hay 5 docs o 500, si cubren OAuth o solo API keys, si son recientes
o deprecados. Devolver solo texto lo obliga a adivinar. Devolver **facets** — `total_found: 47,
categories: {oauth: 12, api_keys: 23, saml: 12}, date_range: {oldest: 2023-01, newest: 2025-11}`
— le permite emitir una segunda query más precisa (ej. "OAuth, últimos 12 meses").

El patrón en la práctica: tu `search_docs` del MCP server devuelve no solo los chunks sino también
un bloque de metadata de la búsqueda. El agente lo usa para decidir si profundiza o expande.

**Hacia dónde va esto en 2026:** Liu extendió la idea de facets a lo que llama *"agent peripheral
vision"* — pistas estructuradas sobre el espacio de información completo, no solo el top-k que
devolviste, para que el agente sepa qué se está perdiendo sin tener que pedirlo explícitamente. Y
viene sosteniendo una postura más fuerte: que el RAG semántico "de chatbot" (embed-and-retrieve,
sin estructura) está mal calzado para sistemas agénticos y hay que rediseñar el retrieval pensando
en el agente desde el principio, no adaptar un pipeline pensado para responder una sola pregunta.
No hace falta construir "peripheral vision" en M3 — es awareness para cuando diseñes retrieval para
agentes en serio — pero conecta directo con por qué facets y el patrón de tool (§9) importan más de
lo que parecen a primera vista.

```python
@mcp.tool()
def search_docs(query: str, top_k: int = 5) -> dict:
    """Busca en la base de conocimiento. Devuelve chunks + metadata para refinamiento."""
    results = hybrid_search_rerank(query, top_k=top_k)
    facets = compute_facets(results)   # conteos por categoría, rango de fechas, total encontrado
    return {
        "chunks": [{"content": r.content, "source": r.doc_id, "score": r.score} for r in results],
        "metadata": facets,            # la señal que el agente usa para refinar
    }
```

### Cuándo grep le gana a embeddings (SWE-bench, sep-2025)

La suposición implícita en muchos sistemas RAG es que los embeddings son el método de retrieval
correcto por default. Jason Liu documentó un contra-ejemplo directo: en su análisis del agente
SWE-bench (sep-2025, "Why Grep Beat Embeddings in our SWE-bench Agent", jxnl.co), grep superó a
embeddings en retrieval sobre código fuente.

Por qué: los embeddings capturan significado semántico, pero código tiene *estructura léxica exacta*
— nombres de funciones, imports, signatures. `search_for_function("parse_jwt_claims")` con grep
encuentra el resultado exacto; los embeddings de una función y su llamadora son parecidos pero no
idénticos, y la consulta por nombre exacto no se beneficia del espacio semántico.

Ojo con sobre-generalizar esa conclusión: Liu publicó dos seguimientos ese mismo mes que matizan el
punto para que no se lea como "abandoná RAG" — *"Why I Stopped Using RAG for Coding Agents (And You
Should Too)"* y *"Rethinking RAG Architecture for the Age of Agents"* (ambos 11-sep-2025, jxnl.co).
El argumento real no es tirar el retrieval estructurado, sino **exponerlo como una tool más que el
agente invoca a discreción** — combinando grep/exploración libre con búsqueda estructurada cuando
conviene, en vez de forzar retrieval en cada turno. Es el mismo patrón que vas a construir en §9: tu
`search_docs` es una tool que el agente decide cuándo llamar, no el único camino de acceso a la
información.

La conclusión que hay que poder defender: **elegir el método de retrieval según las propiedades del
dominio**, no por default:

| Dominio | Por qué embeddings | Por qué grep/BM25 |
|---|---|---|
| Soporte/FAQ en lenguaje natural | sinónimos, paráfrasis, intención variada | — |
| Código fuente | — | nombres exactos, imports, signatures |
| Documentación técnica | intención del usuario varía | referencias exactas a funciones/IDs |
| Tickets con IDs/códigos de error | — | el ID es el token discriminante |

En M3 hacés hybrid precisamente para no tener que elegir uno solo — pero la heurística de Liu es
munición de system design cuando alguien te pregunta "¿por qué no usás solo embeddings?".

---

## 8b. Sidebar: DSPy (awareness — optimizar prompts con datos, no a mano)

Hasta acá todo lo que escribiste —los prompts de query rewriting, de HyDE, de generación— lo
tuneaste **a mano**: probás un wording, mirás si mejora, ajustás. **DSPy** (Stanford) propone otra
cosa: **programás el pipeline declarando *qué* querés** (firmas tipo `pregunta -> respuesta`,
módulos como `ChainOfThought`) y un **optimizer** ("teleprompter") **busca automáticamente** los
prompts / few-shot examples que maximizan una métrica tuya sobre un set de ejemplos. Es
"compilar" el prompt contra datos en vez de artesanarlo.

| | Hand-tuned (lo que hacés ahora) | DSPy (programmatic) |
|---|---|---|
| Cómo mejorás el prompt | prueba y error manual | optimizer busca contra una métrica |
| Reproducible | depende de tu memoria | sí, es código + datos |
| Cuándo conviene | pipelines chicos, pocos prompts | muchos prompts encadenados, métrica clara, querés evitar drift al cambiar de modelo |
| Costo | tu tiempo | llamadas LLM de la optimización + curva de aprendizaje |

**Update 2026:** DSPy maduró más rápido de lo esperado. La serie estable 3.x adoptó **GEPA**
(Genetic-Pareto, un optimizer reflexivo que en varios benchmarks supera a RL para optimizar
prompts) como pieza central, y ya es una opción real de producción para pipelines con muchos
prompts encadenados — no solo un experimento académico. Si en M5+ terminás con una cadena de 4-5
prompts y una métrica clara (como la tuya de M2), DSPy+GEPA es la primera alternativa seria al
hand-tuning que vale la pena mirar.

Nivel de este curso: **awareness / can-explain.** No vas a construir un pipeline DSPy en M3. Tenés
que poder explicar *qué* problema ataca (el tuning manual no escala ni es reproducible), *cómo* se
relaciona con tu harness de M2 (DSPy necesita exactamente una métrica como la tuya para optimizar),
y *cuándo lo considerarías*. Eso alcanza para defenderlo en system design sin venderte humo.

---

## 9. ⊕ Extraer un MCP server: exponé tu RAG como una tool

Este es el mini-proyecto publicable del módulo, y la **señal de mercado de crecimiento más rápido**
ahora mismo. Vale la pena entender qué es antes de construirlo.

### Qué es MCP
**MCP (Model Context Protocol)** es un estándar abierto (lo lanzó Anthropic a fines de 2024,
`modelcontextprotocol.io`) para conectar asistentes de IA con herramientas y datos externos. La
analogía que circula y que sirve: **MCP es el "USB-C de las apps de IA"** — un único protocolo
estándar para que cualquier cliente (Claude Desktop, Cursor, etc.) hable con cualquier servidor de
capacidades, en vez de una integración custom por cada par cliente×herramienta (el problema N×M).

> ⚠️ **La spec evoluciona rápido — no la trates como congelada.** La versión estable vigente es
> **2025-11-25** (`modelcontextprotocol.io/specification/2025-11-25`), pero el **28-jul-2026** —dos
> semanas después de este texto— se publica una versión nueva que **elimina el handshake clásico
> `initialize`/`initialized`** y el header `Mcp-Session-Id`, moviendo a un modelo *stateless* donde
> la metadata de sesión viaja en el `_meta` de cada request, y suma headers obligatorios
> (`Mcp-Method`, `Mcp-Name`) para el transporte Streamable HTTP. `FastMCP` abstrae la mayor parte de
> esto, pero si alguna vez tocás el protocolo a mano (debugging, tooling propio), no asumas que el
> handshake de 2024 sigue vigente — revisá el changelog de `blog.modelcontextprotocol.io` primero.

Un **MCP server** expone tres tipos de cosas a un cliente:
- **Tools** — funciones que el LLM puede *invocar* (ej. `search_docs(query)` → tu RAG). Es lo que
  vas a exponer.
- **Resources** — datos que el cliente puede *leer* (archivos, registros).
- **Prompts** — plantillas de prompt reutilizables.

El cliente (Claude Desktop) descubre las tools de tu server, y cuando el usuario pregunta algo, el
modelo **decide** llamar a tu `search_docs`, recibe los chunks, y responde con ellos. El transporte
es JSON-RPC sobre **stdio** (server local) o **HTTP/SSE** (server remoto).

### Por qué esto, por qué ahora
- **Es señal de mercado pura:** "construí un MCP server" es exactamente la skill que las ofertas de
  AI Engineer empezaron a pedir en 2025. Publicarlo (GitHub, registry de MCP) lo deja **live,
  acumulando stars** mientras seguís el curso — un activo de portfolio que trabaja solo.
- **Es desacople arquitectónico:** te obliga a separar tu **lógica de retrieval** (hybrid + rerank
  de este módulo) de tu API web. El MCP server llama al *mismo* core de retrieval que tu `/chat`.
  Esa separación es buen diseño además de buen marketing.
- **Demo instantánea:** en una entrevista, "mirá, conecto mi RAG a Claude Desktop y le pregunto por
  la doc de mi producto" es mucho más fuerte que un screenshot.

### Tool design: el paradigma nuevo y los 5 principios

Antes de escribir el server, un frame conceptual del blog de Anthropic Engineering ("Writing
effective tools for AI agents", 2025):

> *"Tools represent a fundamentally new software paradigm as contracts between deterministic
> systems and non-deterministic agents."*

Una tool no es solo una función. Es un **contrato** que el LLM lee, interpreta, y decide cuándo
invocar — en el contexto de una conversación, con información parcial, sin poder predecir
exactamente qué queries va a recibir. Eso cambia cómo se diseña.

Los 5 principios (Anthropic Engineering, 2025):

1. **High leverage** — cada tool debe darle al agente una capacidad que no puede tener de otra
   forma. No wrappear un endpoint que no aporta valor agentivo real; más tools ≠ mejor.

2. **Clear namespacing** — nombres que describen exactamente qué hace la tool sin ambigüedad.
   `search_docs` es mejor que `query` o `get`. En MCP, el nombre es parte del contrato que el
   modelo lee — la imprecisión ahí genera llamadas incorrectas.

3. **Human-readable outputs** — los resultados deben ser legibles para el modelo (y para vos en
   debug). Un JSON plano con `content` y `source` es mejor que un objeto anidado denso. Si el
   modelo no puede leer el output, no puede usarlo.

4. **Token efficiency** — los resultados de tools consumen tokens del contexto. Si tu `search_docs`
   devuelve chunks completos de 1000 tokens cada uno, con k=10, gastás 10K tokens en el retrieval
   solo. Paginá, truncá, o devolvé summaries cuando tenga sentido.

5. **Documentación clara** — el docstring de tu tool **es** el prompt que el modelo lee para
   decidir cuándo llamarla. No es un comentario de código. Es un contrato. Escribilo como si le
   explicaras a un colega inteligente, en una oración, qué hace y cuándo usarla.

**Proceso recomendado:** Prototype (construí rápido) → Evaluate (testea con el modelo real, no con
tus suposiciones — el modelo va a llamar la tool de formas que no esperabas) → Collaborate (ajustá
los nombres y docstrings en base a cómo el modelo la interpreta realmente).

En la práctica de M3, vas a revisar tu `search_docs` contra estos 5 principios antes de publicarla.

### Forma mínima (Python, sin perderte en infra)
El SDK oficial `mcp` (con `FastMCP`) hace que exponer una tool sea casi una función decorada. Ojo:
hay **dos paquetes distintos** con el mismo nombre de clase, y ambos están migrando al mismo tiempo:

- **FastMCP standalone** (PrefectHQ, `pip install fastmcp`) — llegó a 3.0 estable en feb-2026 con un
  rediseño arquitectónico (primitivas Components/Providers/Transforms) e instrumentación
  OpenTelemetry nativa, y ya va por la serie 3.4.x. Pineá `fastmcp>=3.4` — un quickstart de la serie
  2.x puede tener sintaxis distinta a la actual.
- **El SDK oficial `mcp`** (Anthropic, `pip install mcp`, el que importa el código de abajo) lanzó
  una **v2.0 beta el 30-jun-2026** que **renombra la clase `FastMCP` incluida a `MCPServer`**, para
  alinearse con el nuevo spec stateless que sale el 28-jul-2026. Es pre-release: si estás siguiendo
  este curso después de esa fecha, pineá con upper bound (`mcp>=1,<2`) hasta que la v2 salga
  estable, o vas a encontrarte con que `from mcp.server.fastmcp import FastMCP` ya no existe.

```python
# grounded-mcp/server.py
from mcp.server.fastmcp import FastMCP
from grounded.retrieval import hybrid_search_rerank   # ⬅ el MISMO core de §3-5

mcp = FastMCP("grounded")

@mcp.tool()
def search_docs(query: str, top_k: int = 5) -> list[dict]:
    """Busca en la base de conocimiento de soporte y devuelve los pasajes más relevantes."""
    results = hybrid_search_rerank(query, top_k=top_k)   # hybrid + RRF + rerank
    return [{"content": r.content, "source": r.doc_id, "score": r.score} for r in results]

if __name__ == "__main__":
    mcp.run()   # transporte stdio por defecto
```

Lo registrás en Claude Desktop (su `claude_desktop_config.json`, apuntando al comando que corre tu
server) y ya podés preguntarle a Claude sobre tu doc, recuperada por *tu* pipeline. El docstring
de la función **es** la descripción que el modelo lee para decidir cuándo llamarla — escribilo bien,
es prompt engineering.

Claude Desktop sigue siendo la implementación de referencia para probar esto sin código extra, pero
el ecosistema de clientes MCP se diversificó bastante en 2026: **Cursor**, **Cline** (extensión
open-source de VS Code) y **Windsurf** también descubren y llaman tools MCP. Para portfolio alcanza
con demostrarlo en uno; mencionar que probaste tu server contra dos clientes distintos es una señal
extra de que el contrato (no el cliente) es lo que hiciste bien. Anthropic también sumó el **Claude
Desktop Extensions Directory** — instalación en un click de servers MCP curados por Anthropic,
disponible en Claude.ai, Desktop, Mobile y Code — como capa de distribución más pulida que publicar
en el registry crudo (ver `material-apoyo.md` para el link).

> **Checkpoint:** ¿qué problema resuelve MCP que justifica que sea un estándar? El problema N×M:
> sin un protocolo común, cada cliente de IA necesita una integración custom por cada herramienta
> (N clientes × M herramientas). MCP define *una* interfaz: escribís tu server una vez y *cualquier*
> cliente MCP-compatible lo consume. Por eso "el USB-C de la IA".

---

## 10. El pipeline completo de M3 (la foto mental)

Juntá todo. Así queda el camino de query después de M3, comparado con el de M0:

```
M0:   query ─────────────[dense top-5]──────────────▶ LLM

M3:   query
        │
        ├─(opcional) query rewriting / HyDE          §6
        │
        ├──▶ BM25 (sparse)  ─top-60┐
        │                          ├─ RRF fusion  §3,4 ─▶ top-60 candidatos
        ├──▶ dense (pgvector)─top-60┘  (+ metadata filter §7)
        │
        └──▶ cross-encoder rerank  §5  ─▶ top-5 finales ─▶ LLM con citations

        (todo este core se expone además como MCP tool §9, y se mide con el harness de M2 §1,5)
```

Cada flecha que agregaste tiene que ganarse el lugar con un número de recall. Si rewriting o HyDE
no suben recall@5 en *tu* golden set, se sacan. Esa disciplina —cada componente justificado por
una medición— es literalmente la diferencia de seniority que el curso entero persigue.

---

## 11. Lo que tenés que poder defender (conecta con `criterios-defensa.md`)

Al cerrar M3, un entrevistador podría preguntarte cualquiera de estas. Si no las podés responder
con tus palabras *y con los números de tu harness*, el módulo no está cerrado:

- "¿Qué es context engineering y por qué reemplazó a prompt engineering?" (§0: definición
  Karpathy, atribución Lütke/Liu, framing Gartner; el foco pasó de qué le decís al modelo a qué
  información le das y cómo la estructurás.)
- "¿Por qué hybrid y no solo vector?" (§1-2: dense pierde en términos exactos; ejemplos de tu
  dominio.)
- "¿Qué hace RRF, exactamente?" (§3: la fórmula `1/(k+rank)`, por qué rank y no score, qué hace
  `k=60`.)
- "¿Por qué un cross-encoder es más preciso pero solo se usa para rerankear?" (§5: atención
  cruzada vs no-precomputable.)
- "¿Cuándo NO usarías HyDE?" (§6: queries ya largas, out-of-domain donde alucina mal; lo medís.)
- "¿Cuándo grep le gana a embeddings?" (§8: dominio con estructura léxica exacta — código,
  nombres de función, IDs; caso SWE-bench de Liu, sep-2025.)
- "¿Cohere rerank o self-hosted? ¿Por qué empezaste con uno?" (§5: YAGNI, validar señal antes de
  operar infra.)
- "Mostrame el número: ¿cuánto subió recall@5 hybrid+rerank vs tu baseline naive?" (§1,5 + harness
  M2 — **este es el centro de tu defensa**.)
- "¿Qué es MCP y por qué expusiste tu RAG así?" (§9: estándar, problema N×M, señal de mercado.)
- "Defendé los 5 principios de tool design en tu MCP server." (§9: high leverage, namespacing,
  human-readable outputs, token efficiency, documentación clara — con decisiones reales de tu impl.)
- "¿Qué es DSPy y cuándo lo usarías?" (§8b: optimización programática de prompts; awareness.)

Seguí con `material-apoyo.md` para las fuentes canónicas, después `practica.md` para construir, y
`pruebas.md` para el hard gate.
