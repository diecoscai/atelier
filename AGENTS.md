# AGENTS.md

Single source of truth for AI agents working in this repo. Facts only.

## Overview

Atelier is an AI-Engineering course-lab and portfolio. It is a course-hub web app
(module map, evals, defense drills, progress tracking) plus course content (modules
M0-M11 + side-quests). The product being built through the course, **Grounded** (a RAG
SaaS), lives in a separate repo and is tracked here via a cross-repo contract.

Live: https://atelier-hub-smoky.vercel.app

## Stack

- Next.js 15.5.19 (App Router, React 19, server components)
- TypeScript 5, strict
- Tailwind CSS v4 (`@tailwindcss/postcss`)
- pnpm workspaces monorepo
- ESLint 9 (`eslint-config-next`)
- zod (schema validation), gray-matter (markdown frontmatter), react-markdown + remark-gfm
- ioredis (optional progress store; falls back to in-memory)

## Commands

Run from repo root. Root scripts delegate to the `course-hub` workspace via `pnpm --filter`.

```bash
pnpm install        # install all workspaces
pnpm dev            # dev server at http://localhost:3000 (no KV/Grounded needed; uses fallbacks)
pnpm build          # production build
pnpm start          # serve production build
pnpm lint           # eslint
```

## Monorepo layout

```
atelier/
├── package.json            # root: dev/build/start/lint delegate to course-hub
├── pnpm-workspace.yaml      # packages: apps/*
├── apps/
│   └── course-hub/          # the only app (Next.js 15 → Vercel)
│       ├── app/             # App Router: page, layout, decisions, evals, modules/[slug], api/{state,progress}
│       ├── components/
│       ├── lib/             # content.ts, course.config.ts, product.ts, progress.ts, sample-product.ts, types.ts
│       └── content/chapters/# course content, one dir per module
└── docs/
    ├── DESIGN.md            # course design (v3); canonical module taxonomy
    └── research/
```

- Workspace glob is `apps/*`. `course-hub` is currently the sole package.
- Add new app dependencies inside `apps/<app>/`, never at root.

## Course structure conventions

- Module taxonomy is defined in code: `apps/course-hub/lib/course.config.ts` (`MODULES`). This is the
  single source for which modules exist; a module appears on the map even with no chapter.
- Module id / slug examples: `M0`/`M0-setup`, `M4`/`M4-checkpoint`, `SQ-A`/`SQ-A-transformers`, `DSA`/`DSA-stream`.
- Tracks: `core` (M0-M4, hireable checkpoint at M4), `extended` (M5-M11), `sidequest` (SQ-*), `dsa` (parallel stream).
- Content lives at `apps/course-hub/content/chapters/<slug>/` with these files (all optional):
  `leccion.md`, `material-apoyo.md`, `practica.md`, `criterios-defensa.md`, `pruebas.md`.
- Markdown files use gray-matter frontmatter; read at BUILD time (static server components), not runtime.

## Cross-repo contract (Grounded)

The hub depends on Grounded ONLY through `course.json`, never on Grounded's internal layout.

- Schema: `productStatusSchema` in `apps/course-hub/lib/product.ts` (zod). Shape `{ course, hub?, modules }`
  where each module has `status` (`shipped`|`in-progress`|`todo`), optional `commit`, `tests`, `deployUrl`,
  `evalResults`, `adrs`, `links`. Types mirror in `lib/types.ts` (`ProductStatus`, `ProductModule`).
- Source: fetched from `GROUNDED_STATUS_URL` (a raw `course.json` URL) with optional `GROUNDED_GITHUB_TOKEN`.
  Unset → falls back to bundled `lib/sample-product.ts` so the hub runs standalone.

## Environment

Optional; all have fallbacks (see `apps/course-hub/.env.example`):

- `GROUNDED_STATUS_URL`, `GROUNDED_GITHUB_TOKEN` — cross-repo product status (else sample).
- `REDIS_URL` — progress/gate store via ioredis (else in-memory). Used only by API routes.

## Conventions

- 2-space indentation, single quotes, functional components, hooks over classes.
- Comments only when logic is non-obvious.
- Deploys to Vercel from `apps/course-hub`.
