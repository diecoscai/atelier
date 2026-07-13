---
paths:
  - "apps/course-hub/**"
  - "package.json"
  - "pnpm-workspace.yaml"
---

# Next.js monorepo conventions

- pnpm workspaces; glob is `apps/*`, `course-hub` is the sole app. Root scripts delegate via
  `pnpm --filter course-hub <script>`. Add deps inside `apps/<app>/`, never at root.
- Run `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm lint` from repo root.
- Next.js 15 App Router + React 19 server components. Course content (`content/chapters/<slug>/*.md`)
  is read at BUILD time via gray-matter; no runtime filesystem access on Vercel.
- Module taxonomy is code-defined in `lib/course.config.ts` (`MODULES`) — edit there, not ad hoc.

## Vercel deploy

- Deploys to Vercel from `apps/course-hub` (live: https://atelier-hub-smoky.vercel.app).
- After changing content or `course.config.ts`, rebuild — content is static-baked at build time.

## Cross-repo contract (Grounded)

- Hub couples to the Grounded product ONLY through `course.json`, validated by `productStatusSchema`
  in `lib/product.ts` (zod). Do not reach into Grounded's internal layout.
- Source is `GROUNDED_STATUS_URL` (+ optional `GROUNDED_GITHUB_TOKEN`); unset falls back to
  `lib/sample-product.ts`. Keep `lib/types.ts` in sync with any contract change.
