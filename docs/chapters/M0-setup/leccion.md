---
module: M0
title: Setup + thin slice
concept: El stack de AI engineering (3 capas)
---

# M0 — Setup + thin slice

El objetivo de M0 no es construir nada impresionante: es tener el **circuito completo
funcionando de punta a punta** con la pieza más fina posible, y deployado temprano. Un
*thin slice* vertical que toca las tres capas del stack de AI engineering:

1. **Datos** — un doc entra, se parte en chunks (naive por ahora) y se guarda en pgvector.
2. **Modelo** — una query embebe, recupera top-k, y un LLM responde single-shot.
3. **Producto** — UI de upload + chat streaming, deployada (aunque read-only).

## Por qué thin slice primero

El error clásico es construir la ingestion perfecta antes de ver una sola respuesta. Acá
hacemos lo contrario: el camino más corto a "subí un doc y me contestó", para tener algo
que medir y romper en M1/M2. El chunking naive de M0 es **deliberadamente malo** — es la
baseline contra la que vas a mostrar mejora.

## Onboarding Python (medio día)

Como el backend es Python, M0 incluye un onboarding corto para no pagar el "tax" de aprender
Python debugueando producción: type hints, `async/await`, Pydantic, `uv`, `pytest`.
