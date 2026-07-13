---
module: M7
---

# Criterios de defensa — M7

Al terminar M7 tenés que poder, en el nivel honesto indicado:

- **(can-explain)** Por qué el costo del LLM es el riesgo #1 de margen de un RAG SaaS (ingreso fijo,
  costo variable por token) y hacer el cálculo `costo = llamadas × tokens × precio_por_token` con
  números de *tu* tráfico esperado.
- **(can-explain)** Por qué las cuatro palancas (routing, caching, budgets, observabilidad)
  *multiplican* el ahorro en vez de sumarlo (operan sobre factores distintos del mismo producto).
- **(can-build)** Un **model router por complejidad** que clasifica con el modelo barato y rutea al
  caro solo cuando hace falta — y validarlo contra el harness de M2 (ahorro **y** caída de calidad,
  los dos números).
- **(can-build)** Un **semantic cache** sobre pgvector que pega por similitud de significado (no
  exact-match), **aislado por tenant**, con un umbral que justificás y una estrategia de invalidación.
- **(can-build)** **Token/context budgets** por tier que cortan el desperdicio de context window, y
  explicar por qué meter más chunks es economía negativa (costo lineal + *lost in the middle*).
- **(can-build)** Instrumentación de **observabilidad con Langfuse**: costo por conversación/tenant,
  tokens, TTFT, p50/p95 — y leer el dashboard para decidir qué optimizar.
- **(can-explain)** Qué es **TTFT** y por qué es la métrica de latencia percibida en un chat con
  streaming (vs latencia total); por qué reportás **p95** y no el promedio.
- **(can-explain)** **Drift**: cómo la calidad se degrada en el tiempo (cambio de modelo del
  proveedor, cambio de distribución de queries) y cómo lo detectás corriendo el harness de M2 de
  forma continua + señales online; cómo hacés **A/B de prompts** sin drift accidental.
- **(can-defend)** Cuándo usar un **modelo open-source self-hosted** (Ollama / Qwen3 como referencia
  2026, o Llama, Gemma, Phi — Llama 4 como techo de familia, pero fuera del alcance de una laptop)
  en vez de la API de OpenAI, con la **tabla comparativa de costo/calidad/latencia**
  (+ privacidad/operación) hecha con *tus* números — y por qué el swap fue trivial (programaste
  contra la interfaz estándar).
- **(awareness)** **Quantization**: qué es (FP16 → INT8/INT4), el trade-off tamaño/calidad/velocidad,
  qué es **GGUF**, y por qué INT4/GGUF es lo que hace que un 8B corra en tu laptop.
- **(can-defend)** Por qué **async simple alcanza** (YAGNI) y exactamente qué síntoma medido te haría
  introducir colas robustas (BullMQ + Celery).
