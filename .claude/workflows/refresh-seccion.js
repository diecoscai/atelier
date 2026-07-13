export const meta = {
  name: 'refresh-seccion',
  description: 'Refresca UNA sección del curso: auditoría → research web → reescritura → verificación independiente con score ≥8. args: "<slug> <YYYY-MM-DD>"',
  whenToUse: 'Cuando Diego va a empezar una sección del curso y hay que ponerla al día. Pasar slug y fecha de hoy como args string.',
  phases: [
    { title: 'Analyze', detail: 'auditoría de claims desactualizables', model: 'haiku' },
    { title: 'Research', detail: 'verificación web a la fecha dada', model: 'sonnet' },
    { title: 'Rewrite', detail: 'reescritura en sitio', model: 'sonnet' },
    { title: 'Verify', detail: 'verificador independiente, score 1-10, loop hasta ≥8', model: 'sonnet' },
  ],
}

const BASE = '/home/dieco/dev/projects/atelier/apps/course-hub/content/chapters'

// Copia de lib/course.config.ts (MODULES). Si se agrega un módulo, actualizar AMBOS.
const SECTIONS = [
  'M0-setup', 'M1-ingestion', 'M2-evals', 'M3-retrieval', 'M4-checkpoint',
  'M5-security', 'M6-agentic', 'M7-llmops', 'M8-integracion', 'M9-finetuning',
  'M10-cloud', 'M11-capstone',
  'SQ-A-transformers', 'SQ-B-makemore', 'SQ-C-banking77', 'SQ-D-agentic-coding',
  'DSA-stream',
]

const raw = (typeof args === 'string' && args.trim()) || ''
const [SLUG, TODAY] = raw.split(/\s+/)
if (!SLUG || !SECTIONS.includes(SLUG)) {
  return { error: `Slug inválido: "${SLUG || ''}". Debe ser uno de: ${SECTIONS.join(', ')}` }
}
if (!TODAY || !/^\d{4}-\d{2}-\d{2}$/.test(TODAY)) {
  return { error: `Fecha inválida: "${TODAY || ''}". Formato esperado: YYYY-MM-DD. args completo: "<slug> <fecha>"` }
}

const AUDIT = {
  type: 'object',
  required: ['files', 'topics'],
  properties: {
    files: { type: 'array', items: { type: 'string' } },
    topics: {
      type: 'array',
      items: {
        type: 'object',
        required: ['topic', 'claim', 'risk'],
        properties: {
          topic: { type: 'string' },
          claim: { type: 'string' },
          risk: { type: 'string' },
        },
      },
    },
    summary: { type: 'string' },
  },
}

const RESEARCH = {
  type: 'object',
  required: ['findings'],
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['topic', 'status', 'update'],
        properties: {
          topic: { type: 'string' },
          status: { type: 'string', enum: ['current', 'outdated', 'incomplete'] },
          update: { type: 'string' },
          sources: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    newDevelopments: { type: 'string' },
  },
}

const VERDICT = {
  type: 'object',
  required: ['score', 'issues', 'summary'],
  properties: {
    score: { type: 'number', minimum: 1, maximum: 10 },
    issues: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
  },
}

function analyzePrompt(slug) {
  return `Eres el auditor de contenido de la sección "${slug}" de un curso de AI Engineering en español.
Lee TODOS los .md en ${BASE}/${slug}/ (leccion.md, material-apoyo.md, practica.md, criterios-defensa.md, pruebas.md — los que existan).
Hoy es ${TODAY}. Revisa la fecha de última actualización en el frontmatter o en el propio texto si existe.
Extrae los claims técnicos con riesgo de estar desactualizados o incompletos: nombres/versiones de modelos LLM, precios de APIs, versiones de librerías y frameworks, herramientas recomendadas, benchmarks citados, prácticas recomendadas del ecosistema, enlaces a recursos.
Devuelve: files (rutas relativas encontradas), topics (topic corto, claim = qué afirma el texto hoy, risk = por qué podría estar desactualizado), summary (2-3 frases del estado de la sección).
No modifiques ningún archivo.`
}

function researchPrompt(slug, audit) {
  return `Eres el researcher del equipo que actualiza la sección "${slug}" de un curso de AI Engineering. Hoy es ${TODAY}.
Un auditor extrajo estos claims del contenido actual:
${JSON.stringify(audit.topics, null, 2)}

Usa WebSearch (y WebFetch para fuentes primarias — docs oficiales, changelogs, blogs de los vendors) para verificar cada topic A FECHA DE HOY:
- status 'current' si el claim sigue siendo correcto
- status 'outdated' si cambió (nueva versión, modelo nuevo, precio distinto, práctica deprecada) — en 'update' di exactamente qué debe decir ahora, con la fuente
- status 'incomplete' si el claim es correcto pero omite algo importante que salió después
Además llena 'newDevelopments': novedades recientes relevantes para el tema de esta sección que el contenido aún no cubre y valdría la pena añadir.
Sé preciso con versiones y nombres exactos. Prefiere fuentes primarias. No modifiques archivos.`
}

function rewritePrompt(slug, ctx, feedback, round) {
  const feedbackBlock = feedback
    ? `\n\nFEEDBACK DEL VERIFICADOR (ronda anterior, score < 8) — corrige TODOS estos puntos:\n${feedback}`
    : ''
  return `Eres el rewriter del equipo que actualiza la sección "${slug}" (ronda ${round}) de un curso de AI Engineering en español.
Archivos a editar en sitio: ${BASE}/${slug}/ (edita SOLO archivos dentro de ese directorio).

Auditoría del contenido actual:
${JSON.stringify(ctx.audit.topics, null, 2)}

Hallazgos del researcher (verificados por web a ${TODAY}):
${JSON.stringify(ctx.research, null, 2)}${feedbackBlock}

Instrucciones:
1. Lee los archivos actuales antes de editar.
2. Corrige todo lo marcado 'outdated' con los datos exactos del researcher; completa lo 'incomplete'; integra 'newDevelopments' donde aporte pedagógicamente.
3. Mantén: idioma español, el frontmatter gray-matter intacto (mismas claves; actualiza valores solo si procede), la estructura de archivos existente, el tono y nivel pedagógico del curso.
4. Mejora claridad y calidad pedagógica donde el texto sea flojo, sin inflar longitud innecesariamente.
5. Los enlaces/recursos citados deben ser reales y actuales (usa las fuentes del researcher).
6. No toques nada fuera de ${BASE}/${slug}/.
Devuelve un resumen breve de los cambios aplicados por archivo.`
}

function verifyPrompt(slug, ctx) {
  return `Eres un verificador INDEPENDIENTE con contexto fresco. No participaste en la escritura. Hoy es ${TODAY}.
Evalúa la sección "${slug}" del curso de AI Engineering: lee todos los .md en ${BASE}/${slug}/.

Contexto de referencia — hallazgos de research verificados por web:
${JSON.stringify(ctx.research, null, 2)}

Rúbrica (score 1-10, entero):
- Actualidad técnica a ${TODAY}: versiones, modelos, precios y prácticas correctas (peso alto)
- Precisión factual: nada inventado, enlaces plausibles, coherente con los hallazgos de research
- Calidad pedagógica: progresión clara, ejemplos útiles, práctica accionable
- Integridad estructural: frontmatter gray-matter válido en cada archivo, español consistente, estructura de archivos intacta
Puedes hacer spot-checks con WebSearch si dudas de un dato concreto.
Score 8+ solo si la sección está lista para publicarse tal cual. Si score < 8, 'issues' debe listar problemas CONCRETOS y accionables (archivo + qué corregir). 'summary': 2-3 frases del veredicto.
No modifiques ningún archivo.`
}

log(`Refrescando ${SLUG} a fecha ${TODAY}`)

phase('Analyze')
const audit = await agent(analyzePrompt(SLUG), { label: `analyze:${SLUG}`, model: 'haiku', schema: AUDIT })
if (!audit) return { error: `La auditoría de ${SLUG} falló; no se modificó nada.` }

phase('Research')
const research = await agent(researchPrompt(SLUG, audit), { label: `research:${SLUG}`, model: 'sonnet', schema: RESEARCH })
if (!research) return { error: `El research de ${SLUG} falló; no se modificó nada.` }

const ctx = { audit, research }
let verdict = null
let feedback = null
for (let round = 1; round <= 3; round++) {
  await agent(rewritePrompt(SLUG, ctx, feedback, round), {
    label: `rewrite:${SLUG}#${round}`, phase: 'Rewrite', model: 'sonnet',
  })
  verdict = await agent(verifyPrompt(SLUG, ctx), {
    label: `verify:${SLUG}#${round}`, phase: 'Verify', model: 'sonnet', schema: VERDICT,
  })
  if (verdict && verdict.score >= 8) {
    log(`${SLUG}: score ${verdict.score}/10 en ronda ${round} ✓`)
    return { slug: SLUG, score: verdict.score, rounds: round, summary: verdict.summary }
  }
  feedback = verdict
    ? verdict.issues.map((i, n) => `${n + 1}. ${i}`).join('\n')
    : 'El verificador falló; revisa integridad general de la sección.'
  log(`${SLUG}: score ${verdict ? verdict.score : '?'}/10 en ronda ${round}, iterando con feedback`)
}
return { slug: SLUG, score: verdict ? verdict.score : 0, rounds: 3, needsAttention: true, issues: verdict ? verdict.issues : [] }
