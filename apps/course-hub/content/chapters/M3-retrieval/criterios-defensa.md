---
module: M3
---

# Criterios de defensa — M3

Al terminar M3 tenés que poder, en el nivel honesto indicado:

- **(can-explain)** Qué es **context engineering** y por qué reemplazó a "prompt engineering" como
  la disciplina central: el foco pasó de "qué le decís al modelo" a "qué información le das, en qué
  formato y cuándo". Atribución: Karpathy (25-jun-2025, *"the delicate art and science of filling
  the context window with the right information in the right format at the right time"*), Lütke
  (primera referencia viral, 19-jun-2025), Jason Liu (marco aplicado a RAG desde ago-2025), Gartner
  (*"context engineering is in, prompt engineering is out"*, mid-2025).
- **(can-explain)** Por qué el retrieval dense-only falla en casos exactos (códigos de error,
  SKUs, nombres propios, versiones) y por qué sparse (BM25) los recupera — con ejemplos de *tu*
  dominio de soporte, no genéricos.
- **(can-explain)** Sparse vs dense: qué mide cada uno, en qué gana y en qué pierde, y por qué sus
  debilidades son casi disjuntas (por eso se combinan).
- **(can-explain)** Qué es BM25 a nivel de intuición: TF con saturación, IDF (por qué los términos
  raros pesan más), normalización por longitud.
- **(can-explain)** **Cuándo grep le gana a embeddings**: en dominios con estructura léxica exacta
  (código, nombres de funciones, IDs); caso SWE-bench de Jason Liu (sep-2025). Elegir el método de
  retrieval según las propiedades del dominio, no por default.
- **(can-build)** Implementar hybrid retrieval en Postgres: dense (pgvector `<=>`) + sparse
  (`tsvector`/`ts_rank`), cada uno devolviendo top-N rankeado.
- **(can-build)** Implementar RRF correctamente: la fórmula `Σ 1/(k + rank)`, con `k=60`, fusionando
  los dos rankings — y testearlo con un caso conocido a mano.
- **(can-build)** Conectar un cross-encoder reranker (Cohere) que reordena el top-60 → top-5, y
  enchufarlo al `/chat` sin romper su contrato.
- **(can-build)** Extraer un **MCP server standalone** que exponga el core de retrieval como tool
  (`search_docs`) y consumirlo desde Claude Desktop.
- **(can-defend-in-system-design)** Por qué RRF (fusión por rank) en vez de weighted-merge de scores
  (fusión por score): el problema de escalas incomparables y el costo de tunear normalización + `α`.
- **(can-defend-in-system-design)** Por qué un cross-encoder es más preciso que un bi-encoder pero
  **solo se usa para rerankear**: atención cruzada query↔doc vs imposibilidad de precomputar el doc.
  El patrón retrieve-and-rerank (funnel barato→caro).
- **(can-defend-in-system-design)** **El número:** cuánto subió recall@5 hybrid+rerank vs tu baseline
  naive, medido con el harness de M2 sobre tu golden dataset. Sin este número, no cerraste el módulo.
- **(can-defend-in-system-design)** Cuándo NO usar query transformations (rewriting/HyDE): queries
  ya descriptivas, out-of-domain donde HyDE alucina mal, costo/latencia que no compensa — y que la
  decisión la tomaste *midiendo*, no por intuición.
- **(can-defend-in-system-design)** Cohere rerank vs cross-encoder self-hosted: el trade-off
  (infra/costo/privacidad/latencia) y en qué punto migrarías.
- **(can-defend-in-system-design)** Las **decisiones de tool design** de tu MCP server contra los 5
  principios de Anthropic Engineering: **high leverage** (qué capacidad agentiva real da la tool),
  **clear namespacing** (por qué el nombre elegido), **human-readable outputs** (formato del
  resultado que el modelo puede leer), **token efficiency** (cuántos tokens consume una llamada
  típica y cómo lo controlás), **documentación clara** (el docstring como contrato, no como
  comentario). Leíste el ADR de tool design y podés defenderlo.
- **(awareness)** Metadata-rich retrieval para agentes (Jason Liu): devolver facets (conteos,
  categorías) para que el agente pueda refinar consultas, no solo chunks de texto.
- **(awareness)** Qué es DSPy y qué problema ataca (optimización programática de prompts vs
  hand-tuning), cómo se relaciona con tu harness, y cuándo lo considerarías. No need to build.
- **(awareness/can-explain)** Qué es MCP y por qué se volvió estándar (el problema N×M, "USB-C de
  la IA"), Tools/Resources/Prompts, y por qué exponer el RAG así es señal de mercado.
