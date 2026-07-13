---
module: M3
gate: pending
---

# Pruebas — M3

## Capa 1 — tests automatizados (prueban que *funciona*)

Corren contra el harness de M2 y el golden dataset. El gate de mejora es **medido**, no opinado.

- [ ] **RRF correcto (unit):** `pytest` sobre la función de fusión pura — con dos rankings conocidos
      a mano, reproduce el ejemplo de la lección §3 (chunkB primero, chunkA segundo) y los scores dan
      exactos (`1/(60+rank)` sumados). Sin esto, todo lo demás es ruido.
- [ ] **Sparse recupera exacto / dense recupera paráfrasis (unit):** un test con una query de código
      (`"E_4011"`) prueba que `sparse_search` lo trae en el top; un test con paráfrasis
      (`"olvidé mi clave"`) prueba que `dense_search` trae el chunk de reset. Demuestra la tesis de §2
      con datos.
- [ ] **No-regresión de recall (el HARD GATE de capa 1):** `recall@5` de **hybrid+rerank > recall@5
      del baseline naive (M0)** sobre el golden dataset, corrido con el harness de M2. El test falla
      si el delta no es positivo. Este es el número que valida el módulo.
- [ ] **Rerank reordena:** test que toma candidatos de hybrid y verifica que tras el rerank el chunk
      relevante esperado sube de posición (o ya está en top-5).
- [ ] **El MCP server responde:** test que arranca el server y hace un `tools/call` a `search_docs`
      con una query conocida → devuelve chunks no vacíos del pipeline hybrid+rerank. (Smoke: además,
      desde Claude Desktop la tool aparece y responde.)
- [ ] **`/chat` sigue end-to-end:** el endpoint, ahora sobre hybrid+rerank, sigue streameando y
      responde correcto sobre el doc (no rompiste el contrato de M0).

## Capa 2 — defense drills (el HARD GATE)

> No se avanza a M4 hasta responder esto **por escrito, con tus propios números/decisiones**.
> Claude puede hacer de interviewer. La respuesta correcta casi siempre incluye **un número de tu
> harness**.

1. **"¿Por qué hybrid y no solo vector?"** — Mostrá un caso de *tu* dominio donde dense-only pierde
   (un código de error, una versión) y cómo BM25 lo recupera. Defendé que dense y sparse fallan en
   lugares disjuntos.

2. **"¿Qué hace RRF, exactamente?"** — Escribí la fórmula `Σ 1/(k + rank)`. Explicá **por qué usa el
   rank y no el score** (escalas incomparables entre BM25 y dense) y **qué hace `k=60`** (amortigua
   el peso de las posiciones altas, premia el consenso entre listas).

3. **"¿Por qué no simplemente sumás los scores de BM25 y dense con un `α`?"** — Las escalas son
   incomparables (coseno -1..1 vs BM25 sin techo), la normalización es frágil y `α` hay que tunearlo
   por dominio. RRF lo evita usando solo el orden.

4. **"¿Por qué un cross-encoder es más preciso que un bi-encoder pero solo se usa para rerankear, no
   para buscar?"** — Cross-encoder procesa query+doc juntos con atención cruzada (más preciso) pero
   por eso no puede precomputar el doc y debe correr un forward por par (query, doc): inviable sobre
   millones, perfecto sobre las decenas que hybrid ya filtró. Describí el funnel barato→caro.

5. **"¿Cuándo NO usarías HyDE?"** — Queries ya largas/descriptivas, out-of-domain donde el LLM
   alucina hacia el lado equivocado y empeora el retrieval, o cuando el costo/latencia extra no
   compensa. Decilo con *tu* medición: lo prendiste, corriste recall@5, y lo mantuviste solo si subió.

6. **"¿Cohere rerank o cross-encoder self-hosted? ¿Por qué arrancaste con uno?"** — YAGNI: Cohere da
   multilingüe y cero infra para validar que rerank mueve la aguja (arrancás con `rerank-v4.0-fast`,
   no `v3.5` — se apaga el 1-ago-2026); migrás a self-hosted cuando el volumen, el costo o el
   compliance B2B (no mandar datos a un tercero) lo justifican —*medido*. Si te preguntan por
   alternativas al self-hosted de siempre (`bge-reranker-v2-m3`), podés nombrar Qwen3-Reranker,
   Jina v2 o ZeroEntropy como opciones más nuevas a benchmarkear.

7. **"Mostrame el número."** — Tu tabla de recall@5: naive → hybrid → hybrid+rerank → +query
   transforms. El delta hybrid+rerank vs baseline es el corazón de tu defensa. Tenés que saberlo de
   memoria y poder explicar de dónde sale (golden dataset de M2).

8. **"¿Qué es MCP y por qué expusiste tu RAG como un MCP server?"** — Estándar abierto (Anthropic,
   2024) que resuelve el problema N×M de integraciones ("USB-C de la IA"); Tools/Resources/Prompts.
   Lo expusiste para desacoplar el core de retrieval de la API web y porque es señal de mercado de
   crecimiento rápido (live, acumulando stars). Si te preguntan si la spec es estable: no del todo —
   el 28-jul-2026 sale una revisión grande que mueve el protocolo a stateless; no necesitás el
   detalle técnico, pero sí saber que MCP sigue evolucionando activamente.

9. **"¿Qué es DSPy y cuándo lo considerarías?"** *(awareness)* — Optimización programática de prompts:
   declarás el pipeline y un optimizer busca los prompts/few-shots que maximizan una métrica (la
   tuya, de M2), en vez de tunear a mano. Lo considerarías con muchos prompts encadenados y una
   métrica clara, para reproducibilidad y evitar drift al cambiar de modelo. Bonus si sabés que en
   2026 ya no es un experimento chico (34k+ stars, ~160K descargas/mes) y que su optimizer central
   hoy es **GEPA**.

**Gate:** marcalo como pasado en el panel del módulo cuando (a) la capa 1 está verde en Grounded —
en particular el test de no-regresión de recall y el MCP server respondiendo— y (b) escribiste tus
respuestas a la capa 2 con tus propios números.
