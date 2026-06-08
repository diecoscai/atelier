---
module: M1
---

# Criterios de defensa — M1

Al terminar M1 tenés que poder, en el nivel honesto indicado:

- **(can-explain)** Por qué la ingesta —no el LLM— es donde se rompe la mayoría de los RAG:
  garbage in, garbage out; un chunk cortado a la mitad pone un techo al retrieval que ningún
  reranker levanta.

- **(can-explain)** Qué hace un parser layout-aware que un `.extract_text()` no: reconstruye
  orden de lectura, detecta tablas, preserva secciones y página.

- **(can-explain)** Las cuatro estrategias de chunking (fixed / recursive / layout-aware /
  semántico), cómo funciona el `RecursiveCharacterTextSplitter` (separadores jerárquicos), y el
  rol del overlap.

- **(can-build)** Un pipeline de ingesta `parse → chunk layout-aware → metadata → embed async →
  store` que sobre un PDF real **no parte tablas ni palabras** y **no mezcla secciones**, con la
  decisión de parser aislada detrás de una interfaz `parse()`.

- **(can-build)** Ingerir un screenshot vía un modelo de visión (describir → chunkear → embeber)
  de modo que sea recuperable por una query de texto.

- **(can-defend-in-system-design)** La elección de parser (Docling vs Unstructured) con el
  trade-off real contra **tu** mix de inputs y el output que comparaste sobre un doc tuyo —no un
  benchmark genérico.

- **(can-defend-in-system-design)** Qué metadata guardás por chunk y por qué cada campo,
  conectándolo con dónde se cobra: `source/page/section` → citations (M4),
  `source/tenant/categoría` → metadata filtering y aislamiento (M3/M4). Por qué se captura en la
  ingesta y es carísimo reconstruir después.

- **(can-defend-in-system-design)** Por qué hiciste **ingestion antes que evals**: para que el
  golden dataset de M2 se construya contra docs bien ingestados y no contra el MVP naive
  (examen contra apuntes con errores).

- **(can-defend-in-system-design)** Por qué async simple y no una queue robusta todavía (YAGNI):
  la ingesta es I/O-bound, async concurrente alcanza; una queue entra cuando necesites correr
  fuera del request y reintentar fallos parciales.
