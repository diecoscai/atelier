# Sincronización de secciones del curso — diseño

**Fecha:** 2026-07-13
**Estado:** aprobado por Diego (pendiente revisión de spec escrita)

## Problema

El curso se actualizó completo en julio 2026, pero Diego lo cursará durante meses y hay tres
cosas que se desincronizan con el tiempo:

1. **Contenido**: el ecosistema AI cambia rápido; una sección escrita hoy queda vieja en semanas.
2. **Progreso**: los gates/drill verdicts viven en Redis vía `REDIS_URL` con fallback en memoria;
   en Vercel sin esa variable el progreso se pierde entre invocaciones.
3. **Repo ↔ sitio live**: el deploy de Vercel se hizo por CLI y no está conectado al repo de
   GitHub; los pushes no redespliegan y el contenido (bakeado en build time) queda desfasado.

## Decisiones

- Refresh de contenido **on-demand por sección**, al empezarla — no cron ni triggers automáticos.
- Progreso en **Upstash Redis free tier**, creando la DB directamente en la consola de Upstash
  (no vía Vercel Marketplace: la integración no documenta qué variables inyecta; la URL manual
  garantiza cero cambios de arquitectura).
- Conectar el repo `diecoscai/atelier` al proyecto de Vercel para auto-deploy en cada push.

Research validado (workflow deep-research-lean, 2026-07-13, fuentes primarias):
- Upstash free: 256 MB, 500K comandos/mes, 10 GB bandwidth; exceso → rate-limit, no cobro.
- Caveat: DBs free se archivan tras ~30 días sin actividad (backup + emails; restaurable).
- Vercel KV descontinuado (dic 2024); Upstash es la opción KV oficial del Marketplace.

## Componente A — Workflow de refresh por sección

**Archivo:** `.claude/workflows/refresh-seccion.js` (commiteado al repo).

Fork parametrizado del workflow usado en la actualización masiva de julio 2026
(analyze→research→rewrite→verify). Diferencias:

- Recibe `args` como string: `"<slug> <fecha-ISO>"` (p. ej. `"M3-retrieval 2026-08-02"`).
  Se usa string plano y no objeto porque la entrega de args-objeto falló en una corrida previa;
  la fecha va en args porque `Date.now()` no está disponible dentro de scripts de Workflow.
- Valida el slug contra la lista canónica de 17 secciones (copiada de `lib/course.config.ts`;
  si se agrega un módulo hay que actualizar ambos). Slug inválido → retorna error sin gastar agentes.
- Pipeline para UNA sección: audit (haiku) → research web (sonnet) → loop de hasta 3 rondas
  rewrite (sonnet) + verify independiente (sonnet) con score 1–10 y feedback; termina al llegar a ≥8.
- El verificador nunca es el rewriter (contexto fresco por ronda). Modelos fijados por fase —
  ningún subagente hereda el modelo de la sesión.

**Flujo de uso:** Diego dice "empiezo M3" → sesión de Claude Code corre
`Workflow({scriptPath: '.claude/workflows/refresh-seccion.js', args: 'M3-retrieval <hoy>'})` →
si score ≥8: `pnpm build` (gate de frontmatter/estructura) → commit + push → Vercel redespliega.
Si tras 3 rondas el score es <8: NO se commitea; se reportan los issues del verificador y Diego decide.

## Componente B — Progreso persistente compartido (Upstash)

- Diego crea una DB Redis free en la consola de Upstash (paso manual, requiere su cuenta) y
  copia la URL `rediss://`.
- Esa URL se configura como `REDIS_URL` en: (a) el proyecto de Vercel (env de producción) y
  (b) `.env.local` local (git-ignored). Local y live comparten el mismo store → un gate marcado
  desde cualquier lado se ve en ambos al instante. La app sigue siendo single-user sin auth;
  las rutas API de progreso quedan efectivamente públicas en el sitio — aceptado (dato no sensible,
  key única `atelier:progress`).
- Cambio de código (único): en `apps/course-hub/lib/progress.ts`, aceptar también `KV_URL` como
  fallback (`process.env.REDIS_URL ?? process.env.KV_URL`) para que una futura integración
  Marketplace funcione sin tocar nada. `.env.example` documenta ambas.
- Documentar en `.env.example` el caveat de archiving por inactividad (~30 días) y que la
  restauración es sin pérdida.

## Componente C — GitHub ↔ Vercel

- Conectar el repo `diecoscai/atelier` al proyecto Vercel existente (`atelier-hub-smoky`):
  Git integration con producción en `main` y root directory `apps/course-hub`.
- Vía dashboard de Vercel o `vercel git connect` desde CLI (requiere `vercel` CLI autenticado;
  si pide login interactivo, Diego lo corre con `! vercel login`).
- Verificación: push trivial → deploy automático visible en el dashboard → sitio actualizado.

## Ciclo completo resultante

"empiezo M3" → refresh verificado (≥8) de `M3-retrieval` → build verde → push → auto-deploy
(~2 min) → Diego estudia la versión fresca → marca gates desde el hub (local o live) → Upstash
persiste y ambos entornos lo reflejan.

## Manejo de errores

- Workflow: agentes que mueren por errores transitorios de API los absorbe el loop de rondas
  (visto en la corrida masiva); research fallido → retorna error sin reescribir nada.
- Build rojo tras rewrite → no se commitea; se reporta el error de build.
- `REDIS_URL` ausente o Upstash caído → el código ya degrada a in-memory (comportamiento actual,
  sin cambios).

## Testing

- Refresh: correr el workflow con una sección real y confirmar score ≥8 + `pnpm build` verde.
- Progreso: `curl` a `/api/progress` (POST gate, GET) en local y en el deploy apuntando al mismo
  Upstash; confirmar que ambos leen el mismo estado.
- Deploy: un push a `main` dispara deploy automático y el contenido nuevo aparece en el sitio.

## Fuera de alcance

- Cron/refresh automático de secciones no empezadas.
- Auth multi-usuario para el progreso.
- Cambiar el contrato con Grounded (`course.json`) — no lo toca nada de esto.
