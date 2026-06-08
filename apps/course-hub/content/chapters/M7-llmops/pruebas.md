---
module: M7
gate: pending
---

# Pruebas — M7

## Capa 1 — tests automatizados (prueban que *funciona* y que el costo baja medible)

Corren contra el harness de M2 y el golden dataset. El ahorro es **medido**, no opinado — y cada
optimización se acompaña de "y la calidad aguantó".

- [ ] **El router elige bien (unit):** `pytest`/`vitest` sobre `routeQuery` con casos a mano — una
      query factual (`"¿horario de atención?"`) clasifica `simple`; una de comparación/razonamiento
      (`"compará Enterprise vs Pro para 200 usuarios con SSO"`) clasifica `complex`. Sin esto, todo
      el ahorro de routing es ruido.
- [ ] **El routing baja el costo sin romper la calidad (el HARD GATE de costo):** corrido el golden
      set con el router prendido vs el baseline (todo a `gpt-4o`), el **costo de generación baja**
      (delta negativo, medible en Langfuse) **y** la métrica de calidad cae ≤ tu umbral aceptado.
      El test falla si el costo no baja o si la calidad cae de más. Este es el número que valida la
      palanca #1.
- [ ] **El semantic cache hitea por significado (unit/integration):** dos queries equivalentes pero
      no idénticas (`"olvidé mi clave"` / `"no puedo entrar a mi cuenta"`) → la 2da pega el cache
      (no se dispara una generación nueva; verificable por mock/spy o por ausencia de la observation
      en Langfuse). Una query no relacionada (`"recetas de pasta"`) **no** pega.
- [ ] **El cache respeta el aislamiento por tenant (el HARD GATE de seguridad):** una entrada
      cacheada por el tenant A **no** se sirve al tenant B aunque la query sea idéntica. El test debe
      fallar si hay cross-tenant. No negociable (regla cardinal de M4).
- [ ] **Budget recorta lo menos relevante (unit):** `fit_chunks_to_budget` con más chunks que el
      budget devuelve solo los que entran, **en orden de relevancia** (descarta desde el final), y
      `count_tokens` cuenta bien. La calidad del golden set no cae al aplicar el budget (cortás ruido,
      no señal).
- [ ] **Observabilidad presente:** un trace de `/chat` en Langfuse expone costo, tokens, TTFT y la
      etiqueta `prompt_version`. Smoke: el dashboard muestra costo por tenant y p95.
- [ ] **El swap a Ollama funciona y está medido:** el golden set corre contra `llama3.1:8b` local
      cambiando solo `base_url`/modelo, y produce la tabla comparativa (calidad local vs API, TTFT de
      cada uno). El pipeline no se reescribió.
- [ ] **`/chat` sigue end-to-end:** con router + cache + budget activos, el endpoint sigue
      streameando y responde correcto sobre el doc (no rompiste el contrato de M0/M4).

## Capa 2 — defense drills (el HARD GATE)

> No se avanza al siguiente módulo hasta responder esto **por escrito, con tus propios
> números/decisiones**. Claude puede hacer de interviewer. La respuesta correcta casi siempre
> incluye **un número de tu sistema** (Langfuse / golden set) y un trade-off explícito.

1. **"Tenés 1M de queries/día. Optimizá el costo."** — Atacá `costo = llamadas × tokens ×
   precio_por_token` en orden de impacto: **routing** (baja el precio por token, 70-80% del
   generation cost si el grueso es simple) → **semantic caching** (baja la cantidad de llamadas) →
   **budgets** (baja tokens por llamada) → todo medido con **observabilidad**. Mostrá que
   *multiplican*. Cerrá con "y validé que la calidad aguantó en el golden set en cada paso".

2. **"¿Cómo cacheás respuestas de un LLM si nunca preguntan exactamente lo mismo?"** — Exact-match
   no sirve para lenguaje natural; cacheás por **significado**: embebés la query, buscás el vecino
   más cercano por coseno (pgvector, la misma tech de retrieval), y devolvés la respuesta cacheada si
   supera el umbral. Defendé los tres peligros: el **umbral** (precision/recall — muy bajo sirve
   respuestas incorrectas), el **aislamiento por tenant**, y la **invalidación** (TTL + invalidar al
   re-ingestar).

3. **"¿Cuándo mandás una query al modelo barato vs al caro, y cómo lo decidís sin gastar de más?"** —
   Clasificás complejidad **con el modelo barato** (si usaras el caro para decidir, ya pagaste el
   caro y perdiste el ahorro). Simple → mini/haiku/Llama; complex → modelo caro. Y mostrás el número:
   el ahorro y la caída de calidad medidos en el golden set.

4. **"Para mejorar la respuesta metés 20 chunks en el contexto. ¿Bien o mal?"** — Mal en los dos
   ejes: el costo de input sube **linealmente** (pagás cada token, cada vez) y la calidad **baja** por
   *lost in the middle* (el modelo ignora el medio). La respuesta correcta: no maximizo contexto, lo
   **presupuesto** — los pocos chunks que el rerank de M3 puso arriba, hasta el budget del tier.

5. **"¿Cómo sabés que la calidad no se degradó cuando cambiaste un prompt o el proveedor cambió el
   modelo por debajo?"** — Eso es **drift**. Lo detecto corriendo el harness de M2 de forma continua:
   CI gate para el drift que yo introduzco, canario programado (golden set 1x/día) para el del
   proveedor, y señales online (sube "no sé", cambia longitud/distribución). El A/B de prompts (con
   `prompt_version` etiquetado en el trace) me deja cambiar sin drift accidental.

6. **"¿Qué es TTFT y por qué te importa más que la latencia total en un chat con streaming?"** —
   TTFT = tiempo hasta el **primer token**. En una UI con streaming (el SSE de M0) es la latencia
   *percibida*: el usuario espera a que *empiece*, no a que termine. Un TTFT alto se siente lento
   aunque el total sea aceptable. Lo bajo con routing (modelo más rápido), budgets (menos input) y
   prompt caching del proveedor. Y reporto **p95**, no promedio, porque la cola es donde se rompe el
   SLA.

7. **"¿Cuándo usás un modelo open-source self-hosted en vez de la API de OpenAI?"** — Con la tabla:
   API arranca (cero infra, mejor calidad por dólar al principio); **self-hosted gana cuando el
   volumen amortiza el GPU, o cuando el compliance B2B exige que los datos no salgan a un tercero**
   (banca/salud/gobierno). Lo digo con *mi* número de calidad (golden set local vs API) para saber
   cuánto cuesta esa decisión. Y el swap fue trivial porque programé contra la interfaz estándar
   (cambié `base_url`).

8. **"¿Qué es quantization y cómo corrés un 8B en una laptop?"** *(awareness)* — Representar los pesos
   con menos bits (FP16 → INT8/INT4) para que ocupen menos memoria y corran más rápido, a cambio de
   algo de precisión (INT8 casi imperceptible; INT4 notable pero usable). Un 8B en FP16 pesa ~16 GB,
   en INT4 ~4-5 GB — por eso entra. **GGUF** es el formato (de `llama.cpp`) que empaqueta el modelo
   cuantizado; Ollama lo usa por debajo (`Q4_K_M` es el default razonable).

9. **"¿Por qué no metiste BullMQ + Celery desde el principio?"** — YAGNI: una cola distribuida es más
   infra que operar y una pregunta más que defender sin tener el problema. La introduzco cuando
   **mido** el síntoma: picos que saturan el proceso, jobs largos que no caben en un request, o
   necesidad de retries/backoff/dead-letter. Hasta ahí, async simple es la decisión correcta y
   defendible.

**Gate:** marcalo como pasado en el panel del módulo cuando (a) la capa 1 está verde en Grounded —en
particular el routing que baja costo sin romper calidad y el aislamiento del cache por tenant— y
(b) escribiste tus respuestas a la capa 2 con tus propios números de Langfuse y del golden set.
