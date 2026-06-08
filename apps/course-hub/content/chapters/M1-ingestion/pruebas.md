---
module: M1
gate: pending
---

# Pruebas — M1

## Capa 1 — tests automatizados (prueban que *funciona*)

El chunker y el parser son funciones (casi) puras → testealos con `pytest`. Asserts concretos:

- [ ] **No corta palabras.** Para todo chunk producido sobre un texto de prueba, ni el primer
      ni el último token es una palabra partida. Test concreto: re-uní los chunks quitando el
      overlap y verificá que ninguna frontera cae en medio de `\w+` (o más simple: ningún chunk
      empieza/termina con un fragmento que no exista como palabra en el original).
- [ ] **No parte tablas.** Sobre el fixture PDF con tabla: existe **exactamente un** chunk con
      `element_type == "table"` que contiene **todas** las celdas de esa tabla (assert: el texto
      de la tabla original ⊆ el texto de ese único chunk). Ningún otro chunk contiene fragmentos
      de la tabla.
- [ ] **No mezcla secciones.** Para un doc con ≥2 secciones tituladas, ningún chunk contiene
      texto de dos `section` distintas (assert sobre la metadata `section` de cada chunk).
- [ ] **Overlap correcto.** Chunks contiguos de prosa comparten ~`overlap` caracteres
      (assert: el sufijo de `chunks[i]` aparece como prefijo de `chunks[i+1]`, salvo en fronteras
      de sección/tabla).
- [ ] **Metadata poblada.** Tras ingerir el fixture, ninguna fila tiene `source` NULL; las
      filas de páginas reales tienen `page` no-NULL; el chunk de tabla tiene `element_type =
      'table'`.
- [ ] **Embed async no pierde chunks.** `len(embed_all(chunks)) == len(chunks)` y todos los
      embeddings tienen dim 1536 (ningún chunk quedó sin embeber por el límite de concurrencia).
- [ ] **Multimodal end-to-end.** Ingerir el screenshot fixture crea ≥1 chunk con
      `element_type == 'image_caption'`; una query conocida sobre su contenido recupera ese chunk
      en el top-k.
- [ ] **Mejora vs M0 (al menos un caso).** Para una query cuya respuesta vive en una tabla/cruce
      de sección, el retrieval M1 trae el chunk correcto y el de M0 (naive) no. (Puede ser un test
      o un assert sobre tu mini-comparación del Paso 7.)

## Capa 2 — defense drills (el HARD GATE)

> No se avanza a M2 hasta responder esto **por escrito, con tus propios números/decisiones**.
> Claude puede hacer de interviewer. Las preguntas son las que te van a hacer de verdad.

1. **"¿Por qué decís que la ingesta es donde se rompe el RAG y no el modelo?"** — Defendelo con
   un ejemplo *tuyo*: una query que M0 fallaba por un chunk roto y M1 acierta. Sin un caso
   concreto, es una frase de blog.

2. **"Mostrame tu chunking. ¿Cómo elegiste el chunk size y qué probaste?"** — Tenés que decir el
   número de partida, **por qué** (token budget, tipo de doc), y ser honesto: *"el barrido contra
   el golden dataset es M2; en M1 elegí con criterio y lo dejé configurable para barrerlo"*.
   Anticipá: "¿probaste 256 vs 512 vs 1024?" → en M2 sí, con recall; en M1 todavía no, y sabés
   que ese es el orden correcto.

3. **"Docling o Unstructured, ¿por qué?"** — El trade-off real contra tu mix de inputs + qué
   viste al correr **los dos sobre tu PDF** (¿la tabla quedó entera en cuál?). Cómo lo cambiarías
   (interfaz `parse()` aislada). No "tiene más stars".

4. **"¿Cómo evitás cortar tablas y oraciones?"** — Layout-aware para los límites de estructura
   (tabla = un chunk, no cruzar headers) + recursive para la prosa larga (separadores naturales).
   Mostrá el test que lo prueba.

5. **"¿Qué metadata guardás y por qué esos campos?"** — Cada campo mapeado a dónde se cobra
   (`page/section` → citations M4; `source/tenant` → filtering + aislamiento M3/M4). Por qué se
   captura en la ingesta y no después.

6. **"Tu cliente manda screenshots. ¿Cómo entran al RAG?"** — Vision describe en ingesta → texto
   → chunk normal. Por qué en ingesta y no en query (costo, buscabilidad). Caption vs OCR y
   cuándo cada uno. Awareness de embeddings multimodales como alternativa.

7. **"¿Por qué ingestion antes que evals?"** — Para no construir el golden dataset contra el MVP
   naive (examen contra apuntes con errores). La base de docs tiene que ser estable antes de
   medir contra ella.

**Decisiones a justificar con tus números (logueá en `DECISIONS.md`):**
- chunk size + overlap de partida → el número y el porqué.
- parser elegido → el resultado de tu comparación sobre el PDF real (tabla entera sí/no).
- ≥1 query donde M1 > M0 → la evidencia de que la ingesta mejoró el techo del retrieval.

**Gate:** marcalo como pasado en el panel del módulo cuando (a) la capa 1 está verde en Grounded
(incluido el assert "tabla entera" y "no corta palabras") y (b) escribiste tus respuestas a la
capa 2 con números propios.
