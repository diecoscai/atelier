# Sincronización de secciones — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mantener sincronizados contenido (refresh on-demand por sección), progreso (Upstash Redis compartido local/live) y deploy (GitHub↔Vercel auto-deploy).

**Architecture:** Un workflow parametrizado commiteado al repo refresca UNA sección con pipeline audit→research→rewrite→verify (score ≥8, verificador independiente). El progreso usa el `lib/progress.ts` existente sin cambios de arquitectura: misma URL de Upstash en Vercel y `.env.local`. Vercel se conecta al repo GitHub para que cada push redespliegue (el contenido se hornea en build time).

**Tech Stack:** Claude Code Workflow tool (scripts JS con `agent()`/`pipeline()`), Next.js 15 / pnpm, ioredis + Upstash Redis (rediss:// TCP), Vercel Git integration.

**Spec:** `docs/superpowers/specs/2026-07-13-sync-secciones-design.md`

## Global Constraints

- Subagentes NUNCA heredan el modelo de sesión: `model: 'haiku'` (audit) o `model: 'sonnet'` (research/rewrite/verify) explícito en cada `agent()`.
- El verificador nunca es el rewriter (contexto fresco por ronda).
- Solo se commitea contenido refrescado si score ≥8 Y `pnpm build` verde.
- `args` del workflow es STRING plano `"<slug> <fecha-ISO>"` (la entrega de args-objeto falló en corrida previa; `Date.now()` no existe en scripts de Workflow).
- 2-space indent, single quotes. Comentarios solo para lógica no obvia.
- No tocar el contrato Grounded (`course.json`, `lib/product.ts`, `lib/types.ts`).

---

### Task 1: Workflow `refresh-seccion.js`

**Files:**
- Create: `.claude/workflows/refresh-seccion.js`

**Interfaces:**
- Consumes: nada (script autocontenido; los prompts son fork del script de la actualización masiva de julio 2026).
- Produces: workflow invocable como `Workflow({scriptPath: '.claude/workflows/refresh-seccion.js', args: '<slug> <YYYY-MM-DD>'})` (la resolución por `name` solo cubre `~/.claude/workflows`, no el repo — verificado). Retorna `{slug, score, rounds, summary}` en éxito, `{error}` en args inválidos, `{slug, score, rounds, needsAttention: true, issues}` si no llega a 8 en 3 rondas.

- [ ] **Step 1: Escribir el script completo**

```js
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
```

- [ ] **Step 2: Probar la validación de args (sin gastar agentes)**

Invocar `Workflow({name: 'refresh-seccion', args: 'M99-nope 2026-07-13'})`.
Expected: retorna `{error: 'Slug inválido: "M99-nope". ...'}` con 0 agentes lanzados.
Esto valida además que el script parsea sin errores de sintaxis.

Luego invocar `Workflow({name: 'refresh-seccion', args: 'M0-setup fecha-mala'})`.
Expected: `{error: 'Fecha inválida: "fecha-mala". ...'}` con 0 agentes.

- [ ] **Step 3: Commit**

```bash
git add .claude/workflows/refresh-seccion.js
git commit -m "feat: workflow refresh-seccion para actualizar secciones on-demand"
```

**Nota:** la validación con una sección REAL queda diferida al primer uso ("empiezo M0"): el contenido se refrescó completo el 2026-07-12, así que correrlo hoy gastaría ~650K tokens para confirmar que todo está current.

---

### Task 2: Fallback `KV_URL` en progress + docs de entorno

**Files:**
- Modify: `apps/course-hub/lib/progress.ts:8` (la línea `const REDIS_URL = process.env.REDIS_URL;`)
- Modify: `apps/course-hub/.env.example`

**Interfaces:**
- Consumes: nada.
- Produces: `lib/progress.ts` acepta `REDIS_URL` o, en su defecto, `KV_URL` (variable que inyecta la integración Upstash del Vercel Marketplace). Sin cambios en la API exportada (`getProgress`, `setGate`, `saveDrillVerdict`, `redisReady`).

Cambio trivial de configuración (una línea + docs): sin test unitario, la verificación es `pnpm build` + el curl end-to-end de Task 3.

- [ ] **Step 1: Editar `lib/progress.ts`**

```ts
// antes
const REDIS_URL = process.env.REDIS_URL;
// después — KV_URL es el nombre que inyecta la integración Upstash de Vercel Marketplace
const REDIS_URL = process.env.REDIS_URL ?? process.env.KV_URL;
```

- [ ] **Step 2: Actualizar `.env.example`**

Reemplazar la línea/bloque de `REDIS_URL` existente por:

```bash
# Progreso (gates + drill verdicts). Opcional: sin esto, store en memoria (se pierde en Vercel).
# Upstash Redis free: crear DB en console.upstash.com y pegar la URL rediss:// (TCP/TLS).
# Caveat: las DB free se archivan tras ~30 días sin actividad (backup + email de aviso; se restaura sin pérdida).
# También se acepta KV_URL (nombre que inyecta la integración Upstash del Vercel Marketplace).
REDIS_URL=
```

(Conservar las demás variables del archivo tal cual.)

- [ ] **Step 3: Verificar build y lint**

Run: `pnpm lint && pnpm build`
Expected: ambos verdes, 17 rutas de módulos generadas.

- [ ] **Step 4: Commit**

```bash
git add apps/course-hub/lib/progress.ts apps/course-hub/.env.example
git commit -m "feat: aceptar KV_URL como fallback de REDIS_URL para Upstash"
```

---

### Task 3: Upstash — DB free + REDIS_URL en Vercel y local

Pasos manuales de Diego marcados como **[DIEGO]**; el resto los hace la sesión.

**Files:**
- Create: `apps/course-hub/.env.local` (git-ignored — verificar con `git check-ignore apps/course-hub/.env.local` antes de escribir la URL)

**Interfaces:**
- Consumes: `lib/progress.ts` de Task 2.
- Produces: `REDIS_URL` operativa en local y en Vercel production apuntando a la MISMA DB.

- [ ] **Step 1 [DIEGO]: Crear la DB en Upstash**

En https://console.upstash.com → Redis → Create Database → plan Free, región cercana a la de las funciones de Vercel (us-east-1 si no la cambiaste). Copiar la connection string `rediss://default:...@....upstash.io:6379` (pestaña "TCP", no la REST).

- [ ] **Step 2: Escribir `.env.local`**

```bash
# apps/course-hub/.env.local
REDIS_URL=rediss://default:<password>@<host>.upstash.io:6379
```

Verificar primero: `git check-ignore apps/course-hub/.env.local` debe imprimir la ruta (ignorado). Si no está ignorado, DETENER y agregarlo a `.gitignore` antes de escribir el secreto.

- [ ] **Step 3: Probar progreso end-to-end en local**

La ruta (`app/api/progress/route.ts`) espera `{action: 'gate'|'drill', ...}` y el GET envuelve en `{progress}`:

```bash
pnpm dev &
sleep 5
curl -s -X POST http://localhost:3000/api/progress -H 'content-type: application/json' \
  -d '{"action":"gate","moduleId":"M0","gate":"passed"}'
curl -s http://localhost:3000/api/progress
```

Expected: POST → `{"ok":true,"module":{"gate":"passed","updatedAt":"..."}}`; GET → `{"progress":{"M0":{"gate":"passed",...}}}`. Reiniciar `pnpm dev` y repetir el GET: el gate debe seguir ahí (prueba de que fue a Upstash y no a memoria).

- [ ] **Step 4: Configurar variables en Vercel**

La ruta ya soporta un guard de escritura: si `ATELIER_WRITE_KEY` está seteada, los POST exigen header `x-atelier-key`. Como el sitio es público, la seteamos en producción junto con `REDIS_URL`. Con CLI (si `vercel whoami` falla, Diego corre `! vercel login` primero):

```bash
cd apps/course-hub
vercel link   # si el proyecto no está linkeado aún; elegir el proyecto existente atelier-hub
vercel env add REDIS_URL production        # pegar la misma URL rediss://
openssl rand -hex 16                       # generar el write key; guardarlo
vercel env add ATELIER_WRITE_KEY production
```

Alternativa [DIEGO]: dashboard de Vercel → proyecto → Settings → Environment Variables.
En local NO seteamos `ATELIER_WRITE_KEY` (unset → escrituras permitidas, comportamiento actual de dev).

- [ ] **Step 5: Verificar en el deploy**

Tras el próximo deploy (Task 4 lo automatiza; si aún no está, `vercel --prod` manual):

```bash
curl -s https://atelier-hub-smoky.vercel.app/api/progress
curl -s -X POST https://atelier-hub-smoky.vercel.app/api/progress \
  -H 'content-type: application/json' -H "x-atelier-key: $ATELIER_KEY" \
  -d '{"action":"gate","moduleId":"M0","gate":"passed"}'
```

Expected: el GET devuelve el MISMO estado que el local (comparten store); el POST sin header correcto da 401, con el key da `{"ok":true,...}`.

- [ ] **Step 6: Commit**

No hay nada que commitear (`.env.local` es ignorado). Marcar tarea completa en PROGRESS.md.

---

### Task 4: Conectar GitHub ↔ Vercel (auto-deploy)

**Files:** ninguno en el repo (configuración en Vercel).

**Interfaces:**
- Consumes: repo `diecoscai/atelier` en GitHub (ya existe), proyecto Vercel existente.
- Produces: cada push a `main` dispara deploy de producción automático.

- [ ] **Step 1: Conectar el repo**

```bash
cd apps/course-hub
vercel git connect https://github.com/diecoscai/atelier
```

Expected: "Connected GitHub repository diecoscai/atelier". Si el comando pide permisos de la GitHub App de Vercel, [DIEGO] los aprueba en el navegador. Alternativa [DIEGO]: dashboard → Settings → Git → Connect Git Repository.

- [ ] **Step 2: Verificar root directory**

En el dashboard (Settings → Build & Development) o `vercel project inspect`: Root Directory debe ser `apps/course-hub`. Ya lo era en los deploys por CLI; si no, [DIEGO] lo corrige en el dashboard (el CLI no expone ese setting).

- [ ] **Step 3: Probar el auto-deploy con los commits pendientes**

```bash
git push origin main
```

(Los commits de Task 1-2 + la spec ya están en local.)
Expected: aparece un deployment nuevo en `vercel ls` / dashboard en <1 min, estado READY en ~2-3 min.

- [ ] **Step 4: Verificar contenido y progreso en el live**

```bash
curl -s https://atelier-hub-smoky.vercel.app/api/progress
```

Expected: responde con el estado de Upstash (cierra el Step 5 de Task 3). Abrir el sitio y confirmar que muestra el contenido de julio (p. ej. la sección de memoria de agentes en M6).

- [ ] **Step 5: Archivar el plan**

```bash
git mv docs/plans/active/sync-secciones docs/plans/archive/sync-secciones
git commit -m "chore: archivar plan sync-secciones completado"
git push origin main
```

---

## Verificación final (fresh-context verifier, protocolo diego-cc-kit:verify)

Spawnear un verificador independiente que confirme: (1) workflow rechaza args inválidos, (2) `progress.ts` compila con el fallback y `pnpm build` verde, (3) POST/GET de progreso persiste en Upstash desde local y live con el mismo estado, (4) un push a `main` produjo deploy automático READY. Reporta PASS/PARTIAL/FAIL con evidencia.
