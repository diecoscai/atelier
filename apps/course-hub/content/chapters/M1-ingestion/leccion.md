---
module: M1
title: Ingestion de docs reales + multimodal
concept: Data engineering for AI — la ingesta es el techo del retrieval
duration: ~7-9h lectura + 1 finde de práctica
---

# M1 — Por qué la ingesta decide si tu RAG sirve

> **Qué vas a saber al terminar esta lección:** explicar, sin mirar, por qué el 80% de los
> RAG se rompen en la ingesta y no en el LLM; parsear PDFs/HTML/tablas reales y elegir entre
> Docling y Unstructured con criterio; cuándo usar fixed-size vs recursive vs layout-aware vs
> chunking semántico; qué metadata guardar por chunk y por qué la vas a necesitar en M3/M4; y
> cómo ingerir screenshots vía vision. La práctica (`practica.md`) reemplaza el chunking naive
> de M0 por una ingesta que aguanta documentos reales.

---

## 0. De dónde venís: el chunking naive de M0 era malo a propósito

En M0 partiste el texto cada 800 caracteres con `text[i:i+800]`. Eso funcionó para un `.txt`
de prueba. Sobre un PDF real explota de tres formas que vas a poder reproducir hoy:

1. **Corta a la mitad de una oración** — "...el reembolso se procesa en 5 a 7 días hábi" |
   "les si el método de pago original sigue activo." Ningún chunk tiene la idea completa, así
   que ninguno embebe bien, así que el retrieval no lo encuentra.
2. **Parte tablas** — una tabla de planes y precios cortada en la fila 4 produce dos chunks
   donde ni el header ni los valores tienen sentido por separado.
3. **Mezcla secciones** — el final de "Política de reembolsos" y el principio de "Cancelación
   de cuenta" caen en el mismo chunk; el embedding queda en un promedio borroso de dos temas.

> **Checkpoint:** si el LLM de M0 daba respuestas decentes, ¿por qué te importa arreglar la
> ingesta?
> Porque las dabas sobre un `.txt` limpio. El momento en que subís el PDF real del cliente, el
> retrieval empieza a traer chunks rotos y el LLM responde sobre basura — con el mismo tono
> confiado. **El LLM solo es tan bueno como el peor chunk que le pasás.** Arreglar el modelo no
> arregla un chunk cortado a la mitad.

---

## 1. La tesis del módulo: garbage in, garbage out

Hay una creencia de principiante de que un RAG flojo se arregla cambiando de modelo (de GPT-4o
a Claude, de `3-small` a `3-large`). Casi nunca. **El cuello de botella suele estar aguas
arriba: en cómo extrajiste el texto y cómo lo partiste.** El retrieval no puede recuperar
información que la ingesta destruyó. Por eso esta es la primera cosa "de verdad" que construís
después del esqueleto.

La cadena de ingesta tiene tres etapas, y cada una puede perder información:

```
archivo real → [1] PARSE (extraer texto+estructura) → [2] CHUNK (partir con criterio) → [3] METADATA → embed → store
                       ↑ acá perdés tablas/orden            ↑ acá perdés contexto         ↑ acá habilitás filtering/citations
```

M0 saltó parse (texto plano ya) y metadata (no guardaste ninguna). M1 las construye, porque
sin ellas M3 (filtering) y M4 (citations) no tienen de dónde agarrarse.

> **Por qué ingestion ANTES que evals (M2) — decisión a defender.** Podrías argumentar
> "primero medí, después mejorá". Pero el golden dataset de M2 son pares pregunta→respuesta
> esperada derivados de *tus docs*. Si lo construís contra el MVP naive (chunks rotos, sin
> tablas), estás escribiendo el examen contra apuntes con errores: vas a "pasar" evals que
> miden el sistema equivocado, y vas a tener que rehacer el golden dataset cuando arregles la
> ingesta. Ingerís bien primero, **después** medís contra esa base estable. (Esto va a
> `DECISIONS.md` como ADR de M1.)

---

## 2. Parsing: extraer texto de documentos que no son texto

Un PDF no guarda "texto en orden de lectura". Guarda instrucciones de dibujo: "poné este
glifo en x=120,y=440". Reconstruir el orden, detectar columnas, separar header/footer,
reconocer que un bloque es una tabla — eso es el trabajo del parser, y es sorprendentemente
difícil.

Los tipos de input que tu producto de soporte va a recibir:

| Input | El problema real |
|---|---|
| **PDF nativo** (exportado de Word/Docs) | Tiene texto embebido, pero el orden de lectura, columnas y tablas hay que reconstruirlos. |
| **PDF escaneado** (un manual fotocopiado) | Es una *imagen*. No hay texto: necesitás **OCR** para generarlo. |
| **HTML** (artículos de help center) | El texto está ahí pero ahogado en nav, footers, sidebars, ads. Hay que extraer el contenido principal. |
| **Tablas** | La unidad de sentido es la fila+header. Aplanarlas a texto lineal pierde la relación columna→valor. |
| **Screenshots** (Sección 8) | Píxeles. Texto + layout visual. Vision API. |

**OCR** (Optical Character Recognition) = convertir una imagen de texto en texto digital. Durante
años el motor open-source por defecto fue **Tesseract**, y los parsers clásicos (Docling,
Unstructured) todavía lo invocan por vos cuando detectan una página sin capa de texto — no
necesitás operarlo a mano, pero sí saber que un PDF escaneado lo dispara (y que es lento en CPU
y comete errores en escaneos malos). Ya no es "el" estándar sin discusión: **PaddleOCR** le gana
en precisión (texto curvo, manuscrito, ruido) y en velocidad con GPU, y la tendencia de la
industria es saltearse el pipeline clásico detector→OCR→post-proceso con **modelos
vision-language** dedicados a documentos (Mistral OCR, Qwen2.5-VL, PaddleOCR-VL) que hacen
doc→Markdown en un solo paso. Este curso sigue con el pipeline clásico (parser + Tesseract vía
Docling/Unstructured) porque es más barato, corre en CPU y alcanza para el volumen de Grounded —
pero sabé hacia dónde va la industria, porque en un system design interview puede salir.

> **Checkpoint:** ¿por qué no resolvés todo con `pdfplumber`/`pypdf` y un `.extract_text()`?
> Porque esos te dan un chorro de texto plano: pierden que algo era una tabla, en qué sección
> estaba, y a veces hasta el orden de lectura en PDFs a dos columnas. Te sirven para un PDF
> simple, pero no para docs reales con estructura. Por eso usás un parser que preserva
> *layout*.

### 2.1 Docling vs Unstructured — el trade-off que tenés que defender

Las dos herramientas serias open-source para esto. No hay "la mejor"; hay trade-offs.

**Docling** (IBM, `github.com/docling-project/docling` — antes `DS4SD/docling`):
- Convierte el doc a un **`DoclingDocument`** estructurado y exporta a Markdown/JSON
  preservando jerarquía, tablas y orden de lectura.
- Fuerte en **tablas** (modelo TableFormer, en **v2** desde Docling 2.78 — marzo 2026, mejor
  extracción y un chequeo de auto-consistencia en la estructura) y en entender layout. Pensado
  para alimentar RAG.
- Trae **`HybridChunker`**: un chunker que ya respeta la estructura del documento (no parte
  tablas, agrupa por sección) y es tokenizer-aware. Esto te da parse+chunk layout-aware casi
  gratis.
- Pesa más (modelos de layout/tablas) y la primera corrida descarga modelos.
- Es un proyecto joven con cadencia de releases muy rápida (varios releases por mes; v2.106
  salió en junio 2026) — **pineá la versión** en tu `pyproject.toml`/lockfile, porque
  `HybridChunker`/`TableFormer` pueden cambiar de API entre versiones menores.

**Unstructured** (`github.com/Unstructured-IO/unstructured`):
- Particiona el doc en **elementos tipados** (`Title`, `NarrativeText`, `Table`, `ListItem`,
  `Image`...) vía `partition()` / `partition_pdf()`.
- Muy amplio en **formatos** (PDF, HTML, DOCX, PPTX, EML, imágenes...). Si tu input es un zoo
  de tipos de archivo, brilla.
- Estrategias `partition_pdf(strategy=...)`: `"fast"` (solo texto embebido, rápido),
  `"hi_res"` (modelo de layout + OCR, detecta tablas/imágenes), `"ocr_only"`.
- Trae chunkers `chunk_by_title` / `chunk_elements` que agrupan respetando los elementos.
- La librería open-source es muy capaz; hay también una API/SaaS de pago para volumen, que NO
  necesitás.

**Cómo elegir (tu criterio para el ADR):**

| Si... | Inclinate por |
|---|---|
| Tu input es sobre todo **PDFs con muchas tablas** y querés Markdown limpio | **Docling** |
| Tenés un **zoo de formatos** (HTML, DOCX, PPTX, EML, imágenes) | **Unstructured** |
| Querés parse+chunk layout-aware en una sola pieza con poco código | **Docling** (`HybridChunker`) |
| Querés control fino sobre tipos de elemento (filtrar `Footer`, tratar `Table` aparte) | **Unstructured** |

Para Grounded (soporte B2B: PDFs de políticas + artículos de help center con tablas), **Docling
como default** es defendible: tablas fuertes, Markdown estructurado, chunker incluido. La
postura honesta en entrevista: *"elegí Docling por las tablas y el chunking layout-aware
incluido; tengo Unstructured como fallback para formatos que Docling no cubre bien, y la
decisión está aislada detrás de una interfaz `parse(file) -> ParsedDoc` para poder cambiarla."*

> **Checkpoint:** ¿por qué no decidís parser por "cuál tiene más stars"?
> Porque la decisión correcta depende de *tu* mix de inputs. La señal de madurez es haber
> corrido los dos sobre **un doc real tuyo** y comparar el output (¿la tabla quedó entera?
> ¿el orden de lectura está bien?), no citar un benchmark genérico. Eso es un número propio
> para el deep-dive.

---

## 3. Chunking: por qué determina el techo del retrieval

Recordá el flujo: recuperás *chunks*, no documentos. El chunk es la unidad atómica de
retrieval. De eso salen dos verdades incómodas:

- **Si la respuesta a una pregunta está partida entre dos chunks, nunca la vas a recuperar
  bien** — ningún chunk la contiene entera, así que ninguno matchea fuerte. El chunking pone
  un *techo* al recall que ningún reranker de M3 puede levantar.
- **Un chunk con dos temas mezclados embebe a un punto promedio** entre ambos, lejos de las
  dos preguntas reales. Mezclar temas baja la precisión.

La tensión central del chunk size:

| Chunks **chicos** (~200-300 tokens) | Chunks **grandes** (~800-1000+ tokens) |
|---|---|
| Embeddings más precisos (un solo tema → vector nítido) | Más contexto por chunk, menos fragmentación de ideas |
| Pueden cortar una idea que necesita más contexto | El embedding se "promedia", matchea peor con queries puntuales |
| Más chunks → más filas, recall puede sufrir si la idea cruza límites | Menos chunks, pero podés meter ruido irrelevante en el prompt |

No hay número mágico, pero en 2026 sí hay puntos de partida *medidos*: benchmarks públicos
(Vecta/FloTorch sobre un corpus de 50 documentos reales, guías de NVIDIA) convergen en **~512
tokens con 10-20% de overlap** como el arranque que mejor balancea precisión y contexto en
general. Ajustá desde ahí según el tipo de query: **256-400 tokens** si son mayormente
*factoides puntuales* (buscar un dato concreto), **512-1024** si son *analíticas/multi-hop*
(razonar cruzando varias secciones). Esto reemplaza a "no hay evidencia" por "hay un punto de
partida citable"; el barrido fino contra **tu** golden dataset sigue siendo M2.

### 3.1 Las cuatro estrategias (de tonta a inteligente)

**A. Fixed-size (lo de M0).** Cortás cada N caracteres/tokens, con overlap. Simple, rápido,
agnóstico al contenido. Defecto: ignora toda estructura → corta oraciones y tablas. Útil solo
como baseline o para texto sin estructura.

**B. Recursive (`RecursiveCharacterTextSplitter` de LangChain).** El caballo de batalla.
Intenta partir por una **lista jerárquica de separadores**, del más semántico al menos:
`["\n\n", "\n", ". ", " ", ""]`. Primero intenta cortar por párrafos (`\n\n`); si un párrafo
excede el tamaño, baja a oraciones (`. `); si una oración sigue siendo gigante, a palabras; y
solo como último recurso, a caracteres. Resultado: **respeta los límites naturales del texto
siempre que puede** y casi nunca corta a mitad de palabra. Es el default sensato para texto
prosa. Sigue siendo ciego a tablas y a la estructura del *documento* (no sabe qué es un
header).

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,          # en caracteres por defecto; podés usar tokens (ver abajo)
    chunk_overlap=120,       # solapamiento entre chunks contiguos
    separators=["\n\n", "\n", ". ", " ", ""],
)
chunks = splitter.split_text(texto)
```

**C. Layout-aware / structure-aware.** Usás la *estructura que el parser detectó* para definir
los límites: un chunk por sección, sin cruzar headers, sin partir tablas. Es lo que te dan el
`HybridChunker` de Docling y `chunk_by_title` de Unstructured. **Esta es la ganancia grande de
M1** y la razón de parsear con layout: el chunk respeta cómo el documento *está organizado*,
no solo cómo fluye el texto. Una tabla queda en un chunk; una sección no se mezcla con otra.

**D. Semántico.** Mirás el *significado* para decidir dónde cortar: embebés oración por
oración y cortás donde la similitud entre oraciones consecutivas cae por debajo de un umbral
(cambio de tema). Lo popularizó Greg Kamradt (sus "5 levels of text splitting"). Captura
límites de tema que la estructura no marca, pero **es más caro** (un embedding por oración en
ingesta) y más impredecible (chunks de tamaño variable, sensible al umbral). Para Grounded es
*awareness*: sabés qué es y cuándo lo probarías, no lo hacés default.

> **Checkpoint:** te dan un PDF de políticas con secciones tituladas y un par de tablas de
> precios. ¿Qué estrategia?
> Layout-aware (C). El documento *ya te dice* dónde están los límites (headers, tablas);
> aprovechás esa señal en vez de adivinarla con un splitter ciego. Recursive (B) sería tu
> fallback para los pedazos de prosa largos dentro de una sección; fixed-size (A) no lo
> tocás; semántico (D) no lo necesitás todavía.

### 3.2 Overlap: por qué y cuánto

**Overlap** = los chunks contiguos comparten un trozo de texto en el borde (los últimos ~100-150
caracteres de uno son los primeros del siguiente). ¿Por qué? Para que una idea que cae justo en
el límite no se pierda: aparece *completa* en al menos uno de los dos chunks. Regla práctica:
**10-20% del chunk size** — la misma franja que valida el benchmark de la sección anterior.
Demasiado overlap = duplicás texto, inflás la base y devolvés chunks casi idénticos en el
retrieval (redundancia). Cero overlap = riesgo de cortar la idea del borde. Para layout-aware el
overlap importa menos (los límites ya son naturales).

Tratá el 10-20% como default razonable, no como verdad revelada: un análisis de 2026 (retrieval
SPLADE + Mistral-8B sobre Natural Questions) no encontró beneficio medible del overlap y sí más
costo de indexación. Si vas a invertir tiempo ajustando algo, rinde más probar **late chunking**
(embeber el documento completo y recién ahí partir, para que cada chunk retenga contexto
anafórico — mejoras de 10-12% reportadas) o contextual retrieval (Sección de material-apoyo) que
tocar el overlap medio punto porcentual.

### 3.3 Tokens vs caracteres

Embeddings y LLMs cuentan **tokens**, no caracteres (≈1 token cada 4 caracteres en inglés; en
español un poco menos eficiente). Medir el chunk en caracteres es una aproximación. Para ser
preciso, medís en tokens con el tokenizer del modelo: `tiktoken`, con el encoding `o200k_base`
para GPT-4o y modelos posteriores (~35% más eficiente en idiomas no ingleses, español incluido,
que el `cl100k_base` de GPT-3.5/4 clásicos). El `HybridChunker` de Docling es tokenizer-aware: le
pasás el tokenizer del modelo de embeddings y respeta su límite real. Esto importa cuando un
chunk "de 800 caracteres" en realidad son 600 tokens y excedés sin querer.

---

## 4. Metadata por chunk: la inversión que cobrás en M3 y M4

En M0 guardaste `(content, embedding, doc_id)`. Insuficiente. Cada chunk tiene que llevar
**metadata** — datos *sobre* el chunk que no van al embedding pero que necesitás después:

```python
class ChunkMeta(BaseModel):
    doc_id: str
    source: str          # nombre/URL del archivo de origen
    page: int | None     # página del PDF (para citar "p. 4")
    section: str | None  # título de sección ("Política de reembolsos")
    element_type: str    # "text" | "table" | "image_caption"
    chunk_index: int     # orden dentro del doc
```

Por qué cada campo, y dónde lo cobrás:

- **`source` + `page` + `section`** → en **M4** hacés *citations*: la respuesta dice "según
  *Política de reembolsos*, p. 4". Sin haber guardado page/section en la ingesta, no podés
  citar — y tendrías que reingerir todo. Lo guardás **ahora** aunque todavía no lo uses.
- **`source` / tenant / categoría** → en **M3** hacés *metadata filtering*: "buscá solo en
  docs de este tenant" o "solo en la categoría facturación". El filtro corre **antes** de la
  búsqueda vectorial y achica el espacio. En M4 esto se vuelve parte del aislamiento
  multi-tenant.
- **`element_type`** → te deja tratar tablas distinto (ej. no rerankearlas igual, o
  renderizarlas aparte) y saber si un chunk vino de una imagen.

En pgvector la metadata vive en columnas (o un `jsonb`) en la misma fila del chunk:

```sql
ALTER TABLE chunks
  ADD COLUMN source       text,
  ADD COLUMN page         int,
  ADD COLUMN section      text,
  ADD COLUMN element_type text DEFAULT 'text',
  ADD COLUMN chunk_index  int;

-- M3 preview: filtrar por metadata ANTES del similarity search
SELECT content FROM chunks
WHERE source = 'facturacion.pdf'           -- filtro de metadata (barato)
ORDER BY embedding <=> $1 LIMIT 5;          -- luego similarity
```

> **Matiz para el ADR:** con índices **HNSW** (el default recomendado en pgvector), filtrar por
> metadata *antes* del `ORDER BY embedding <=>` puede devolver menos de `LIMIT N` filas de las
> esperadas si el filtro es muy selectivo, porque el índice escanea solo un subconjunto
> aproximado del grafo. Desde pgvector 0.8.0 existe `hnsw.iterative_scan` para mitigarlo —
> activalo si notás que te faltan resultados con filtros angostos.
>
> La columna `vector(N)` tiene que declarar la **dimensión exacta** que produce tu modelo de
> embeddings (1536 para `text-embedding-3-small`, otra para otro proveedor — ver nota en
> `practica.md` Paso 4). La mayoría de los proveedores actuales (OpenAI, Gemini, Voyage, Cohere)
> soportan **Matryoshka Representation Learning (MRL)**: podés truncar el embedding a una
> dimensión menor sin reentrenar nada, a cambio de algo de calidad. Es un trade-off
> storage/precisión que vale la pena conocer aunque en M1 no lo uses.

> **Checkpoint:** ¿por qué guardar `page`/`section` ahora si recién en M4 los usás?
> Porque la metadata se captura *durante el parse* — el parser sabe en qué página y sección
> está cada bloque. Si no la guardás ahora, esa información ya no existe en el chunk; para
> recuperarla tendrías que reparsear y reingerir todo el corpus. **Capturá toda la metadata en
> la ingesta aunque no la uses todavía; es barata de guardar y carísima de reconstruir.**

---

## 5. Async Python simple para la ingesta

Ingerir es I/O-bound: leés archivos, llamás a la API de embeddings (red), escribís a la DB. Tu
proceso pasa la mayoría del tiempo *esperando*, no calculando. `async`/`await` (igual que en TS)
te deja disparar muchas de esas esperas en paralelo sin threads.

El patrón que vas a usar: embeber muchos chunks concurrentemente con un límite, en vez de uno
por uno (serial, lento) o todos de golpe (te rate-limitea la API).

```python
import asyncio

async def embed_all(chunks: list[str], concurrency: int = 8) -> list[list[float]]:
    sem = asyncio.Semaphore(concurrency)          # como máximo 8 requests en vuelo
    async def one(text: str) -> list[float]:
        async with sem:
            return await embed(text)              # tu llamada async a la API de embeddings
    return await asyncio.gather(*[one(c) for c in chunks])
```

Lo que **NO** hacés en M1: queues robustas (Celery/BullMQ), workers, reintentos con backoff
sofisticado. Eso es resolver un problema de escala que todavía no tenés (YAGNI). Async simple
ingiere un corpus de soporte de sobra. La nota para el ADR: *"async simple ahora; introduzco
una queue (Celery) recién cuando la ingesta tarde lo suficiente como para necesitar correrla
fuera del request y reintentar fallos parciales — eso es M7 si llega"*.

> **Checkpoint:** ¿por qué `asyncio` y no multiprocessing/threads para embeber?
> Porque embeber es esperar red, no quemar CPU. Para I/O, async es lo más liviano: un solo hilo
> manejando muchas esperas. Multiprocessing tiene sentido para trabajo CPU-bound (parsear PDFs
> pesados con OCR podría serlo) — pero para la parte de llamar APIs, async gana.

---

## 6. ⊕ Graft multimodal: ingerir screenshots vía vision

Soporte recibe **capturas de pantalla** constantemente: un usuario manda un screenshot de un
error, de una pantalla de configuración, de un mensaje. Eso es conocimiento que tu RAG debería
poder usar, pero un screenshot es píxeles — no tiene texto para embeber.

La técnica: pasás la imagen por un **modelo de visión** (familia GPT-5.x o `gpt-4o` vía API del
lado OpenAI; Sonnet 5 / Opus 4.8 / Fable 5 con visión del lado Anthropic) y le pedís que la
**describa en texto** — qué muestra, qué dice el UI, qué error aparece. Esa descripción es
texto, y al texto **sí** lo podés chunkear, embeber y guardar como un chunk más, con
`element_type="image_caption"` y `source` = la imagen original.

```python
# pseudo-flujo: imagen -> descripción textual -> chunk normal
async def caption_image(image_b64: str) -> str:
    prompt = (
        "Describí en detalle esta captura de un sistema de soporte: qué pantalla es, "
        "qué texto/errores aparecen, qué acción sugiere. Sé literal con los mensajes visibles."
    )
    return await vision_call(image_b64, prompt)   # modelo de visión vigente (GPT-5.x/gpt-4o o Claude)
```

Decisiones que esto trae:
- **Caption vs OCR.** Si el screenshot es sobre todo texto (un mensaje de error largo), OCR
  puede bastar y es más barato. Si importa el *layout/significado visual* (dónde está el botón,
  qué pantalla es), vision describe mejor. A menudo: ambos — OCR para el texto literal + vision
  para el contexto.
- **Costo.** Vision sigue siendo caro comparado con embeddings: `text-embedding-3-small` de
  OpenAI cuesta centavos por millón de tokens (~$0.02/1M estándar, la mitad en batch), mientras
  que una sola llamada de visión por imagen es órdenes de magnitud más cara. La brecha se
  mantiene aunque los nombres de los modelos cambien — por eso corrés vision **una vez en la
  ingesta** y guardás la descripción, no en cada query.
- **Multimodal embeddings (awareness).** Existen modelos que embeben imagen y texto en el mismo
  espacio para buscar imágenes directo, sin pasar por una descripción textual. **CLIP** (2021)
  es la referencia histórica/didáctica: dos encoders separados (imagen, texto) proyectados al
  mismo espacio. Los modelos actuales van más allá: `voyage-multimodal-3.5` (enero 2026) usa un
  único transformer que procesa texto e imagen intercalados (documentos, screenshots, tablas,
  incluso video) en vez de encoders separados estilo CLIP. Es una alternativa real al patrón
  "describir y embeber el texto". Para Grounded el patrón caption→texto sigue siendo más simple
  y reusa todo tu pipeline de texto; mencionás los embeddings multimodales como camino que
  conocés y evaluarías si el volumen de imágenes creciera mucho.

> **Checkpoint:** ¿por qué describís la imagen en la ingesta y no en la query?
> Porque la query trae *texto* ("¿qué significa el error X?") y vos querés matchearlo contra el
> *contenido* del screenshot. Si describís en ingesta, el screenshot ya vive como texto
> buscable y lo encontrás con tu retrieval normal. Describir en query-time sería caro
> (una llamada vision por consulta) y no resolvería la búsqueda.

---

## 7. El modelo mental: la ingesta es un pipeline, no un script

Pensá la ingesta como una **tubería de transformaciones**, cada una con un contrato claro:

```
parse(file)        -> ParsedDoc(elements, metadata)     # texto + estructura + page/section
chunk(ParsedDoc)   -> list[Chunk]                        # respeta estructura, lleva metadata
embed(list[Chunk]) -> list[Chunk con embedding]          # async, con límite de concurrencia
store(list[Chunk]) -> filas en pgvector                  # content + embedding + metadata
```

Cada etapa es **pura y testeable** donde se pueda (chunking sobre todo: dado un texto/doc,
produce chunks — sin I/O, sin red). Esto importa porque en M2 vas a *barrer parámetros*
(chunk size, estrategia, overlap) y medir cuál gana: solo podés hacerlo si la ingesta es
reconfigurable, no un script hardcodeado. **Diseñá la ingesta para ser experimentada, porque
M2 la va a experimentar.**

---

## 8. Lo que tenés que poder defender (conecta con `criterios-defensa.md`)

Al cerrar M1, un entrevistador podría preguntarte cualquiera de estas. Si no las respondés con
tus palabras y tus números, el módulo no está cerrado:

- "¿Por qué decís que la ingesta es donde se rompen los RAG y no el LLM?" (Sección 0-1)
- "Mostrame tu pipeline de ingesta. ¿Qué parser elegiste y por qué?" (Sección 2, ADR Docling vs
  Unstructured)
- "¿Qué estrategia de chunking usás y cómo elegiste el chunk size?" — respuesta honesta de M1:
  "elegí un punto de partida razonable con criterio; el *barrido* contra el golden dataset es
  M2". (Sección 3)
- "¿Cómo evitás cortar tablas y oraciones?" (Sección 3.1-C, layout-aware)
- "¿Qué metadata guardás por chunk y por qué esos campos?" (Sección 4 — citations M4, filtering
  M3)
- "Tu cliente manda screenshots. ¿Cómo los metés en el RAG?" (Sección 6)
- "¿Por qué hiciste ingestion antes que evals?" (Sección 1 — el golden dataset estable)

Seguí con `material-apoyo.md` para las fuentes canónicas, y después `practica.md` para
reconstruir la ingesta en Grounded.
