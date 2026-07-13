---
module: M1
---

# Material de apoyo — M1

Curado y ordenado. No leas todo: los **★ Core** son obligatorios antes de la práctica; el
resto es referencia para consultar mientras construís o profundización opcional. Donde no estoy
100% seguro de una URL, doy autor + título para que lo busques (mejor eso que un link inventado).

## ★ Core (leé esto antes de tocar código)

1. **Greg Kamradt — "5 Levels of Text Splitting"** (notebook + video "The 5 Levels Of Text
   Splitting For Retrieval")
   `github.com/FullStackRetrieval-com/RetrievalTutorials` (carpeta de text splitting).
   *La* referencia para entender chunking de menos a más sofisticado: character → recursive →
   document-based → semantic → agentic. Buscá: la intuición de por qué recursive respeta límites
   naturales, y la demo de semantic chunking (cortar por caída de similitud). ~45 min.

2. **LangChain — docs de Text Splitters / `RecursiveCharacterTextSplitter`**
   `python.langchain.com/docs/concepts/text_splitters/`
   La doc del splitter que vas a usar de fallback. Buscá: cómo funciona la lista jerárquica de
   `separators`, `chunk_size` vs `chunk_overlap`, y splitters por formato (Markdown/HTML). ~30 min.

3. **Docling — docs oficiales + repo**
   `docling-project.github.io/docling/` y `github.com/docling-project/docling` — chunking en
   detalle: `docling-project.github.io/docling/concepts/chunking/`
   Buscá: el `DocumentConverter`, el `DoclingDocument` y export a Markdown, el manejo de
   **tablas** (TableFormer), y sobre todo el **`HybridChunker`** (chunking layout-aware
   tokenizer-aware, disponible desde `docling-core` 2.8.0 / `docling` 2.9.0). Es tu
   parser+chunker default. Proyecto de release rápido (revisá el
   `CHANGELOG.md` del repo antes de actualizar versión). ~45 min.

4. **Unstructured — docs oficiales + repo**
   `docs.unstructured.io` y `github.com/Unstructured-IO/unstructured`
   Buscá: `partition()` / `partition_pdf()`, las **estrategias** (`fast` / `hi_res` / `ocr_only`),
   los tipos de **elementos** (`Title`, `Table`, `NarrativeText`...), y `chunk_by_title`. Tu
   alternativa/fallback de parser. ~40 min.

## Referencia (tené a mano mientras construís)

- **pgvector** — `github.com/pgvector/pgvector` — repaso de columnas/filtrado; en M1 le agregás
  columnas de metadata. Buscá: filtrar con `WHERE` + `ORDER BY embedding <=> $1`, y
  `hnsw.iterative_scan` (0.8.0+) para cuando el filtro es muy selectivo.
- **tiktoken** — `github.com/openai/tiktoken` — contar tokens (no caracteres) para medir chunks
  de forma precisa. Encoding `cl100k_base` para GPT-3.5/4 clásicos, `o200k_base` para GPT-4o en
  adelante (más eficiente en español y otros idiomas no ingleses).
- **OpenAI — Vision / images guide** — `developers.openai.com/api/docs/guides/images-vision`
  (la doc se movió de `platform.openai.com`) — cómo pasar una imagen a un modelo de visión
  vigente y pedir una descripción (para el graft multimodal). Buscá: input de imagen
  (base64/URL) y prompting de descripción.
- **Anthropic — Vision** — `platform.claude.com/docs/en/build-with-claude/vision` (la doc se
  movió de `docs.anthropic.com`) — equivalente con Claude; útil si querés comparar describer de
  imágenes. Buscá: bloque de imagen en el mensaje.
- **Tesseract OCR** — `github.com/tesseract-ocr/tesseract` — el motor de OCR liviano/CPU que
  los parsers clásicos invocan para PDFs escaneados. Solo necesitás saber que existe y cuándo se
  dispara; para awareness de hacia dónde va la industria, mirá también **PaddleOCR**
  (`github.com/PaddlePaddle/PaddleOCR`) y modelos vision-language de documento (Mistral OCR,
  Qwen2.5-VL).
- **`asyncio`** — `docs.python.org/3/library/asyncio.html` — `gather`, `Semaphore` para
  concurrencia limitada en la ingesta.

## Deep dive (opcional, para defender mejor en system design)

- **Chip Huyen — "AI Engineering"** (O'Reilly, 2025). Para M1: el tratamiento de *data
  engineering for AI* y por qué la calidad de los datos domina. La fuente de autoridad cuando
  te preguntan "¿de dónde sacaste que la ingesta es el cuello de botella?".
- **Pinecone — "Chunking Strategies for LLM Applications"** (guía de su learning center). Buen
  resumen aplicado de fixed vs recursive vs semantic y el trade-off de tamaño. Buscá la tabla de
  cuándo usar cada uno.
- **Anthropic — "Contextual Retrieval"** — `anthropic.com/engineering/contextual-retrieval`
  (el post se movió de `/news` a `/engineering`). Técnica de prepender contexto generado a cada
  chunk antes de embeber para no perder el "de qué sección vengo". Es awareness avanzado: una
  respuesta fuerte a "¿cómo evitás que un chunk pierda su contexto?". Buscá: la idea de
  "contextual chunk" y la mejora de retrieval reportada.
- **Docling technical report** — `arxiv.org/abs/2408.09869` ("Docling Technical Report", IBM
  Research Zurich, agosto 2024). Para citar con autoridad por qué Docling es fuerte en
  tablas/layout — aclarando que documenta la arquitectura fundacional, no el estado actual del
  código (Docling evolucionó bastante desde entonces).

## Cómo usar este material

Leé los ★ Core → corré Docling **y** Unstructured sobre **un PDF real tuyo** (uno con una tabla)
y compará los dos outputs a ojo (¿la tabla quedó entera? ¿el orden está bien?) — ese es tu
número propio para el ADR. Recién ahí abrí `practica.md`. Si podés explicar por qué recursive no
corta palabras y por qué layout-aware no corta tablas *sin mirar*, estás listo para construir.
