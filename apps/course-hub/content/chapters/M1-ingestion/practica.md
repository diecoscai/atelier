---
module: M1
feature: ingesta de docs reales (parse + chunk layout-aware + metadata) + multimodal
repo: grounded
---

# Práctica — reconstruí la ingesta sobre docs reales (en el repo Grounded)

Objetivo: reemplazar el chunking naive de M0 por un pipeline `parse → chunk layout-aware →
metadata → embed (async) → store` que aguanta PDFs/HTML con tablas, y que además ingiere
screenshots vía visión. Cada paso tiene **qué hacer** y **cómo verificar** (criterio de
aceptación concreto). No avances sin que el actual verifique.

> Trabajás en el repo **`grounded`**, en `services/api`. El curso (Atelier) solo lo *sigue* vía
> `course.json`.

## Pre-requisitos
- M0 cerrado: el thin slice funciona y `chunk_text` (naive) está testeado.
- Leíste los ★ Core de `material-apoyo.md` y corriste Docling y Unstructured sobre un PDF tuyo.
- Tenés 2-3 **docs reales** de prueba en `services/api/tests/fixtures/`: al menos 1 PDF con una
  **tabla**, 1 con **secciones tituladas**, y 1 **screenshot** (.png) de una pantalla de error.

---

## Paso 1 — Elegir parser y aislar la decisión detrás de una interfaz
**Hacer:**
- Agregá la dependencia elegida: `uv add docling` (default recomendado) — o `uv add
  "unstructured[pdf]"` si tu mix de inputs lo pide.
- Definí un contrato estable para no acoplar el resto del código al parser:

```python
# services/api/ingestion/types.py
from pydantic import BaseModel

class Element(BaseModel):
    text: str
    element_type: str          # "text" | "table" | "title" | "image_caption"
    page: int | None = None
    section: str | None = None

class ParsedDoc(BaseModel):
    source: str
    elements: list[Element]
```

```python
# services/api/ingestion/parser.py
from .types import ParsedDoc

def parse(file_path: str, source: str) -> ParsedDoc:
    """Único punto que conoce Docling/Unstructured. Cambiar de parser = cambiar solo esto."""
    ...
```

**Verificar:** `parse("fixtures/politicas.pdf", "politicas.pdf")` devuelve un `ParsedDoc` con
≥1 `Element` de `element_type == "table"` para el PDF que tiene tabla, y `page`/`section`
poblados donde el doc los tiene.

## Paso 2 — Chunking layout-aware (reemplaza el naive)
**Hacer:**
- Si usás Docling: pasá el `DoclingDocument` por el `HybridChunker` (tokenizer-aware, con el
  tokenizer del modelo de embeddings). Si usás Unstructured: `chunk_by_title`.
- Para los bloques de **prosa larga** dentro de una sección, usá `RecursiveCharacterTextSplitter`
  como sub-splitter (fallback). Tablas: **NO** las pases por el splitter — una tabla = un chunk.
- Mantené `chunk_size` y `overlap` **configurables** (env o config), no hardcodeados — M2 los va
  a barrer.

```python
# services/api/ingestion/chunker.py
def chunk(doc: ParsedDoc, size: int = 800, overlap: int = 120) -> list[Chunk]:
    """Puro, sin I/O. Respeta estructura: no parte tablas, no cruza secciones."""
    ...
```

**Verificar (criterio duro):**
- Ningún chunk corta una **palabra** a la mitad (test en `pruebas.md` capa 1).
- La **tabla** del fixture cae **entera** en un solo chunk (`element_type == "table"`), no
  partida en dos.
- Dos secciones tituladas distintas **no** comparten chunk.

## Paso 3 — Metadata por chunk
**Hacer:**
- Cada `Chunk` lleva `source`, `page`, `section`, `element_type`, `chunk_index`.
- Migrá la tabla `chunks` para tener esas columnas (ver SQL en la lección, Sección 4).
- Poblá la metadata **desde el parse** (el parser sabe page/section), no la inventes después.

**Verificar:** tras ingerir el PDF, `SELECT source, page, section, element_type FROM chunks
LIMIT 10;` muestra columnas pobladas (no todo `NULL`); el chunk de la tabla tiene
`element_type = 'table'`.

## Paso 4 — Embed async con concurrencia limitada
**Hacer:**
- Reemplazá el embeber serial de M0 por `asyncio.gather` con un `Semaphore` (límite ~8).
- Insertá `(content, embedding, source, page, section, element_type, chunk_index)` en `chunks`.

```python
# services/api/ingestion/embed.py
async def embed_all(chunks: list[Chunk], concurrency: int = 8) -> list[Chunk]:
    sem = asyncio.Semaphore(concurrency)
    async def one(c: Chunk) -> Chunk:
        async with sem:
            c.embedding = await embed(c.content)
            return c
    return await asyncio.gather(*[one(c) for c in chunks])
```

**Verificar:** ingerir un doc de ~30 chunks tarda *notablemente* menos que serial (cronometralo:
`time`); todas las filas tienen embedding de dim 1536. Sin errores de rate-limit.

## Paso 5 — Endpoint `/ingest` actualizado
**Hacer:** `POST /ingest` recibe un archivo (PDF/HTML/imagen), detecta el tipo y orquesta
`parse → chunk → embed_all → store`. Devuelve `{doc_id, n_chunks, n_tables, n_images}`.

**Verificar:** subís el PDF con tabla por la API → respuesta con `n_chunks > 0` y `n_tables >= 1`.
Subís el mismo doc otra vez → no duplica (idempotencia por `source`/hash, o al menos lo
detectás y lo logueás).

## Paso 6 — ⊕ Graft multimodal: ingerir screenshots
**Hacer:**
- Si el archivo es imagen, en vez de `parse` de texto, llamá a un modelo de **visión** (GPT-4o
  o Claude con visión) para describirla (prompt de la lección, Sección 6).
- La descripción entra al pipeline como un `Element` con `element_type = "image_caption"` y
  `source` = nombre de la imagen → se chunkea/embebe/guarda como cualquier texto.

**Verificar:** subís el screenshot del error → se crea ≥1 chunk con `element_type =
'image_caption'`; preguntás en el chat por el error que muestra la captura → el retrieval trae
ese chunk y el LLM responde basándose en él.

## Paso 7 — Demostrar la mejora vs M0 (el entregable de aprendizaje)
**Hacer:**
- Tomá 3-4 preguntas cuya respuesta esté en una **tabla** o **cruzando una sección** del doc
  real. Preguntalas contra el sistema **M0 (naive)** y contra **M1 (layout-aware)**.
- Anotá la diferencia (M0 trae chunk roto / no encuentra; M1 trae el chunk correcto).
- Guardá esas 3-4 queries — son semillas del golden dataset de M2.

**Verificar:** tenés una mini-tabla "pregunta → M0 vs M1" con al menos un caso donde M1 acierta
y M0 no. Ese es tu **número propio** para el defense drill.

## Paso 8 — Capa de defensa (el entregable real)
**Hacer:**
- `DECISIONS.md` con dos ADRs nuevos, tag `Module: M1`:
  - **ADR-002 — "Parser: Docling vs Unstructured"**: alternativas, tu mix de inputs, el output
    comparado sobre tu PDF real, criterio, y cómo lo cambiarías (interfaz `parse()` aislada).
  - **ADR-003 — "Estrategia de chunking + ingestion antes que evals"**: por qué layout-aware,
    qué chunk size de partida y por qué, por qué el barrido fino es M2, y por qué ingerís bien
    *antes* de construir el golden dataset.
- Respondé los **defense drills** (`pruebas.md`, capa 2) por escrito con tus números.
- Actualizá `course.json` (status `shipped`, tests, links).

**Verificar:** podés explicar cada decisión sin mirar las notas. Recién ahí marcás el gate.

---

## Definición de "hecho" (M1)
✅ `parse()` extrae texto+tablas+metadata de un PDF real · ✅ chunking layout-aware: tabla entera,
ninguna palabra cortada, secciones no mezcladas · ✅ metadata (source/page/section/element_type)
poblada en `chunks` · ✅ embed async concurrente · ✅ screenshot ingerido vía visión y recuperable
· ✅ mini-comparación M0 vs M1 con ≥1 caso ganado · ✅ ADR-002 + ADR-003 escritos · ✅ defense
drills respondidos · ✅ `course.json` publicado. → marcás el gate en el panel del módulo.
