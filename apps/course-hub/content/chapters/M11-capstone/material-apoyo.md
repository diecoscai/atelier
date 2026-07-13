---
module: M11
---

# Material de apoyo — M11

Este módulo es ejecución de carrera, no código. El material son las fuentes canónicas sobre
posicionamiento, escritura técnica, portfolios de AI, y canales LatAm→US. **★ Core** son
obligatorias antes de ejecutar `practica.md`; el resto es referencia y profundización.

> Donde no tengo el link exacto, doy **autor + título** para que lo busques — no invento URLs.

## ★ Core (leé esto antes de empaquetar y distribuir)

1. **swyx — "The Rise of the AI Engineer"**
   `latent.space` (ensayo de swyx + Alessio, también en `swyx.io`)
   El texto que *define* el rol. Buscá: dónde vive el AI Engineer entre el ML researcher y el
   product engineer, qué habilidades lo definen, y por qué es una categoría nueva. Es la base de
   tu reframe de identidad (lección, Sección 3). Leelo y quedate con la definición textual para
   poder citarla. ~40 min.
   *Prueba de que la categoría sigue viva:* el **AI Engineer World's Fair 2026** (evento fundado
   por swyx/Latent Space) se hizo del 29-jun al 2-jul-2026 en Moscone West, SF — 29 tracks, 300
   speakers, 6,000+ asistentes, sold out en todos los tiers. No es marketing histórico: el rol que
   estás reclamando sigue creciendo en 2026.

2. **swyx — "Learn in Public"**
   `swyx.io/learn-in-public`
   El manifiesto de por qué construir y escribir en público acelera tu carrera. Buscá: el
   argumento de que el output público es un activo compounding, y la idea de que enseñar lo que
   aprendés *es* la evidencia de que lo sabés. Es la base de tu estrategia de distribución
   (Sección 4). ~25 min.

3. **Eugene Yan — eugeneyan.com (writing + "how I write")**
   `eugeneyan.com`
   El modelo a seguir de un applied scientist que se hizo visible escribiendo. Buscá: la
   estructura de sus posts técnicos (problema → enfoque → números → decisiones) y cómo usa la
   escritura como portfolio. Usalo de molde para tus 2 blog posts (eval methodology;
   multi-tenancy isolation). Sigue publicando activamente en 2026 (ver p.ej. "Patterns for
   Building Cybersecurity Evals", jun-2026) con el mismo framework. ~30 min navegando + leer 1-2
   posts.
   *Munición extra para tu post de eval methodology:* un LLM judge bien calibrado concuerda con
   revisores humanos ~85% del tiempo (más que el acuerdo humano-humano en la misma tarea) — pero
   solo si controlás cuatro sesgos conocidos: *position bias* (favorece la primera opción
   comparada), *verbosity bias* (favorece respuestas largas aunque sean menos correctas),
   *self-preference bias* (un juez puntúa mejor a outputs de su propia familia de modelo), y
   *authority bias*. Nombrar estos cuatro sesgos en tu post es la diferencia entre "usé
   LLM-as-judge" y "sé por qué mi LLM-as-judge es confiable".

4. **Guía de AI / ML portfolios (qué señales pesan)**
   Buscá guías recientes sobre "AI engineer portfolio" / "ML portfolio that gets hired"
   (eugeneyan y swyx tienen material; también hay guías de comunidades como MLOps Community).
   Qué buscar: la jerarquía demo live > outcomes cuantificados > evals visibles > escritura;
   y la insistencia en *números* sobre descripciones. Contrastá con la tabla de señales rankeadas
   de la lección (Sección 2). ~30 min.

## Referencia (tené a mano mientras ejecutás)

- **Tecla** — `tecla.io` — plataforma de talent LatAm→US. Mirá: el perfil que buscan y cómo
  presentarse (aplicás con el positioning statement, no con "full-stack dev").
- **HireLATAM** — `hirelatam.com` — agencia de staffing LatAm→US (modelo flat-fee para el
  empleador). Como candidato te sumás a su talent pool y también podés ver roles abiertos
  publicados. No es un job board puro: sumate al pool con el positioning statement, no con un CV
  genérico.
- **MLOps Community** — `mlops.community` — comunidad técnica con canales/eventos (incluyendo
  presencia LatAm), +75,000 miembros en 37 ciudades. Se está institucionalizando como el user
  group oficial de la nueva **Agentic AI Foundation** bajo la Linux Foundation — señal de que el
  ecosistema madura. Mirá: Slack, Reading Group, "Agent Hour" y meetups donde compartir tus blog
  posts y aparecer como alguien que construye, no para spamear.
- **Loom** — `loom.com` — para grabar el video demo de 3-5 min. Formato: pantalla + cámara
  chica, mostrando el flujo real del producto + un número clave.
- **Plantillas de positioning / personal site** — cualquier generador de 1-página (Vercel
  templates, `read.cv`, o un Next.js propio). El contenido pesa más que el framework.

## Deep dive (opcional, para afilar el pitch y la escritura)

- **swyx — "The Latent Space" (podcast/newsletter)** — para entender el lenguaje y las
  prioridades del mercado de AI engineering actual. Te da el vocabulario que un hiring manager
  reconoce como "de la frontera".
- **Eugene Yan — posts sobre evals y LLM-as-judge** — refuerzan tu blog post de eval
  methodology con autoridad externa; podés citarlos como "alineado con el método de…".
- **Material sobre escribir CV técnico cuantificado** — busca guías de "quantified resume bullets
  for engineers" / el patrón "logro = acción + resultado medible". Munición directa para el audit
  ATS y el reframe del CV (Sección 2-3). El skill `/cv` de tu setup cubre esto para tu caso.
- **Chip Huyen — "AI Engineering" (O'Reilly, 2025)** — el libro de referencia del curso, y el más
  leído de la plataforma O'Reilly durante 2025. Para M11 no es técnico: usalo para alinear tu
  vocabulario de system design con el canon, así en la ronda de diseño hablás el mismo idioma que
  el entrevistador. Repo complementario (work-in-progress): `github.com/chiphuyen/aie-book`.

## Cómo usar este material

Leé los ★ Core → escribí (en un scratchpad o en `DECISIONS.md`) tu positioning statement y tu
lista de keywords ATS *con tus palabras* → recién ahí abrí `practica.md`. La prueba de que estás
listo: podés decir tu positioning statement de memoria en 30 segundos y nombrar las 4 rondas del
loop sin mirar.
