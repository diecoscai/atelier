---
module: M3
feature: hybrid retrieval (BM25 + dense) + RRF + cross-encoder rerank + query transforms, medido contra el baseline naive con el harness de M2, y extraído como MCP server standalone
repo: grounded
---

# Práctica — retrieval avanzado + MCP server (en el repo Grounded)

Objetivo: reemplazar el retrieval dense-only de M0 por **hybrid + RRF + rerank**, demostrar con el
**harness de M2** que sube recall@5 vs el baseline naive, y **extraer un MCP server standalone
publicable** que expone tu RAG como tool. Cada paso tiene **qué hacer** y **cómo verificar**. No
avances al siguiente sin que el actual verifique.

> Trabajás en el repo **`grounded`**. El retrieval de M3 reemplaza al de M0 detrás de la *misma*
> interfaz (`hybrid_search_rerank(query, top_k)`), así que el `/chat` no cambia su contrato — solo
> mejora lo que recupera. Eso te permite medir A/B con el harness sin tocar el resto.

## Pre-requisitos
- M0 cerrado (dense retrieval andando) y **M2 cerrado**: tenés el harness de evals y el **golden
  dataset** (50+ Q&A con su chunk/relevante esperado). Sin el golden set no podés medir recall —
  este módulo entero depende de él.
- API key de Cohere (para rerank) además de la de OpenAI.
- Leíste los ★ Core de `material-apoyo.md` y podés explicar RRF y bi- vs cross-encoder sin mirar.

---

## Paso 0 — Fijá el baseline (el número contra el que vas a competir)
**Hacer:** corré el harness de M2 contra tu retrieval **naive de M0** (dense top-5) sobre el golden
dataset y registrá `recall@5`. Guardá el número en `DECISIONS.md` como baseline (ej. `recall@5
naive = 0.61`). No optimices nada todavía.

**Verificar:** tenés un número de baseline reproducible (corrés el harness dos veces, da lo mismo).
Es tu línea de largada — todo lo demás se compara contra esto.

## Paso 1 — Sparse (BM25/full-text) + dense, cada uno por separado
**Hacer:**
1. Agregá la columna `tsvector` y los índices a `chunks` (ver SQL de la lección §4: `content_tsv`
   generada, índice GIN para sparse, HNSW para dense).
2. Implementá **dos funciones de retrieval separadas y testeables**:
   - `dense_search(query, n=60)` → top-N por `embedding <=> $1` (lo que ya tenías, ahora devolviendo
     60 con su rank).
   - `sparse_search(query_text, n=60)` → top-N por `ts_rank(content_tsv, plainto_tsquery(...))`.
   Ambas devuelven `[(chunk_id, rank), ...]`.

**Verificar:** con una query de código exacto (ej. `"E_4011"`), `sparse_search` trae el chunk
correcto **arriba** y `dense_search` **no** (o lo trae bajo). Con una query parafraseada (`"olvidé
mi clave"`), pasa lo inverso. Esto **demuestra con tus propios datos** la tesis de §1-2: fallan en
lugares distintos. Guardá ese contraste, es munición de defensa.

## Paso 2 — RRF: fusionar los dos rankings
**Hacer:** implementá la fusión con la fórmula de §3, `score(d) = Σ 1/(k + rank_i(d))` con `k=60`.
Dos caminos válidos:
- **En SQL** (CTEs + `ROW_NUMBER()` + `COALESCE(1.0/(60+rank),0)`, ver §4), o
- **En Python**: corrés `dense_search` y `sparse_search`, juntás por `chunk_id`, sumás los términos
  RRF, ordenás desc. Más fácil de testear unitariamente.

Exponé `hybrid_search(query, n=60) -> list[chunk]` (ya fusionado).

**Verificar:** test unitario de la función RRF pura con dos listas conocidas a mano → reproducí el
ejemplo de §3 (chunkB primero, chunkA segundo). El número tiene que dar **exacto** (ver
`pruebas.md`, capa 1). Además: la query de código exacto *y* la parafraseada **ahora ambas** traen
su chunk correcto en el top-60 — hybrid tapó los dos huecos.

## Paso 3 — Cross-encoder rerank: de 60 candidatos a top-5
**Hacer:**
1. Tomá los ~60 candidatos de `hybrid_search` y pasalos por **Cohere Rerank** (`rerank-v3.5`):
   mandás `query` + los 60 `documents`, recibís los reordenados con `relevance_score`.
2. Quedate con el **top-5/20** reordenado. Exponé el core final del módulo:
   `hybrid_search_rerank(query, top_k=5) -> list[chunk]`.
3. Conectá `/chat` a esta función (reemplaza el dense-only de M0; el contrato del endpoint no
   cambia). Dejá un flag/config para poder apagar el rerank (lo vas a necesitar para el A/B).

**Verificar:** para una query del golden set, el chunk relevante esperado sube de posición tras el
rerank (ej. estaba #14 en hybrid, queda #2 tras rerank). El `/chat` sigue funcionando end-to-end
con streaming.

## Paso 4 — Query transformations (rewriting + HyDE), medidas
**Hacer:**
1. **Query rewriting:** función que pasa la query por un LLM barato y la expande/desambigua (§6).
   En modo chat, que use el historial para volver la query auto-contenida.
2. **HyDE:** función que genera un documento hipotético con un LLM, lo embebe, y busca con *ese*
   vector (§6).
3. Hacelas **opcionales por flag**. NO las dejes prendidas por default todavía — primero medís.

**Verificar:** corré el harness con y sin cada transformación. **Mantené solo las que suben
recall@5** en tu golden set. Si HyDE no mejora (o empeora en queries out-of-domain), lo documentás
y lo dejás apagado — esa decisión *medida* es más valiosa que tenerlo prendido "porque sí".
Registrá los números en `DECISIONS.md`.

## Paso 5 — Medir: recall@5 hybrid+rerank vs baseline naive (el entregable)
**Hacer:** corré el harness de M2 sobre el golden dataset para cada configuración y armá una tabla:

| Config | recall@5 |
|---|---|
| naive dense-only (M0, baseline) | _tu número_ |
| hybrid (BM25+dense+RRF) | _tu número_ |
| hybrid + rerank | _tu número_ |
| hybrid + rerank + query transforms | _tu número_ |

**Verificar (HARD):** `recall@5` de **hybrid+rerank > baseline naive**, con el delta documentado.
Este es **el número que valida el módulo entero**. Si no sube, algo está mal en la fusión, el
golden set, o la métrica — no avances, debuggealo. (Ver `pruebas.md` capa 1: el test de
no-regresión.)

## Paso 6 — ⊕ Extraer el MCP server standalone (publicable)
**Hacer:**
1. Creá un sub-proyecto/paquete (`grounded-mcp/`) que **importe el core de retrieval** de Grounded
   (`hybrid_search_rerank` de los pasos 2-3). No dupliques lógica — el MCP server y el `/chat`
   llaman al mismo core.
2. Con el SDK `mcp` (`FastMCP`), exponé `search_docs(query, top_k=5)` como `@mcp.tool()` (ver
   código de §9). Docstring claro: es lo que el modelo lee para decidir cuándo llamarla.
3. Registralo en **Claude Desktop** (su `claude_desktop_config.json`) apuntando al comando que corre
   tu server por stdio.
4. README del repo MCP: qué hace, cómo instalarlo, un GIF de Claude Desktop usándolo. Publicalo en
   GitHub (y, si querés, en el registry de MCP). **Que quede live acumulando stars.**

**Verificar:** desde **Claude Desktop**, hacés una pregunta sobre tu doc → Claude llama a tu
`search_docs` → responde con chunks recuperados por *tu* pipeline hybrid+rerank. (Ver `pruebas.md`
capa 1: el test de que el server responde a un `tools/call`.)

## Paso 7 — Capa de defensa (el entregable real)
**Hacer:**
- `DECISIONS.md`:
  - **ADR-00X "Hybrid + RRF vs dense-only"**: por qué dense fallaba (con tus ejemplos del Paso 1),
    por qué RRF y no weighted-merge de scores, el `recall@5` antes/después. Taggealo `Module: M3`.
  - **ADR-00X "Cohere rerank vs cross-encoder self-hosted"**: por qué empezaste con Cohere (YAGNI,
    multilingüe, validar señal), cuándo migrarías a self-hosted (volumen, privacidad B2B).
  - **ADR-00X "Query transforms: cuáles mantuve y por qué"**: con los números del Paso 4.
  - **ADR-00X "MCP server"**: por qué exponer el RAG como MCP, el desacople de retrieval vs API web.
- Escribí tus respuestas a los **defense drills** (`pruebas.md`, capa 2).
- Actualizá `course.json` (status `shipped`, tests, links al repo MCP) → el hub de Atelier lo refleja.

**Verificar:** podés explicar cada decisión **con tus números** sin mirar las notas. Recién ahí
marcás el gate.

---

## Definición de "hecho" (M3)
✅ Hybrid (BM25+dense) con RRF (`k=60`) andando · ✅ cross-encoder rerank (Cohere) reordenando el
top-60 → top-5 · ✅ query transforms medidas (mantenés solo las que suben recall) · ✅ **tabla de
recall@5 mostrando hybrid+rerank > baseline naive**, con el harness de M2 · ✅ **MCP server
standalone publicado y funcionando desde Claude Desktop** · ✅ ADRs de M3 escritos con números ·
✅ defense drills respondidos · ✅ `course.json` publicado. → marcás el gate en el panel del módulo.
