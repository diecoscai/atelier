# Atelier

> El taller donde me forjo como **AI Engineer** construyendo [**Grounded**](../grounded),
> un RAG SaaS de producción. Curso, evals y defensa en un solo lugar.

Atelier es un producto-curso de AI Engineering (módulos M0–M11) con una columna de
**defensibilidad**: el entregable no es el código, es poder *defender cada decisión* con mis
propios números. El hard gate de un módulo se pasa cuando el build shippeó **y** aprobé su
defense drill.

## Estructura

```
atelier/
├── apps/course-hub/        ← el hub (Next.js 15 → Vercel): mapa, evals, drills, progreso
│   └── content/chapters/M*/ ← leccion / practica / criterios-defensa / pruebas (drills)
└── docs/
    ├── DESIGN.md            ← diseño del curso (v3)
    └── research/            ← roadmaps, cursos, validaciones
```

Live: **https://atelier-hub-smoky.vercel.app**

El producto (Grounded) vive en un **repo aparte** y se *sigue* desde acá vía un contrato
(`course.json`): el hub muestra build/tests/deploy/evals por módulo y deep-linkea al código.

## Desarrollo

```bash
pnpm install
pnpm dev          # http://localhost:3000  (corre sin KV ni Grounded: usa fallbacks)
pnpm build        # build de producción
```

Variables de entorno: ver `apps/course-hub/.env.example`. Sin configurar nada, el hub usa
un store en memoria (progreso) y un sample del producto.

## Fases

- **F1 (hecha):** esqueleto + tracking + contrato cross-repo. Mapa, módulos, decisiones, gate.
- **F2:** eval dashboard (charts desde `eval-results` de Grounded).
- **F3:** defense-drill interviewer (LLM) + pulido de portfolio.
