---
module: M0
feature: thin slice RAG single-shot deployado
---

# Práctica — el feature a construir

Construir, en el repo **Grounded**, el thin slice:

- [ ] Monorepo TS + Python (`apps/web` Next.js, `services/api` FastAPI).
- [ ] Upload de **1 doc** → parsing trivial (texto plano) → chunk naive (por tamaño fijo).
- [ ] Embeddings (`text-embedding-3-small`) → upsert a **pgvector**.
- [ ] Retrieval top-k → prompt single-shot → respuesta.
- [ ] Chat UI con streaming (Vercel AI SDK).
- [ ] **Deploy temprano** a Railway/Fly (aunque sea read-only).

## Capa de defensa arranca acá

- `DECISIONS.md` con su **primer ADR**: por qué monorepo, por qué pgvector de entrada.
- Primer **defense drill** (ver `pruebas.md`).
- Publicar `course.json` con el estado de M0 → el hub lo refleja.
