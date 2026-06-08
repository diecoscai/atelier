---
module: M9
gate: pending
---

# Pruebas — M9

## Capa 1 — tests automatizados (prueban que *funciona*)

- [ ] **QLoRA carga en 4-bit:** el modelo base se carga con `load_in_4bit=True` / `nf4` sin OOM en
      la T4, y el uso de VRAM es marcadamente menor que su tamaño fp16. (Assert sobre
      `torch.cuda.memory_allocated()` o evidencia de `nvidia-smi`.)
- [ ] **El adapter entrena y es chico:** tras `trainer.train()`, el adapter guardado pesa decenas
      de MB (no el modelo entero) → prueba de que se entrenaron pocos parámetros.
- [ ] **Eval before/after muestra mejora:** las respuestas del modelo fine-tuneado están en el
      formato/tono del dataset y las del base no. Documentado lado a lado; idealmente la `eval_loss`
      final < base, o un LLM-as-judge prefiere el fine-tuneado en >50% de los prompts de test.
- [ ] **El clasificador reporta F1:** `classification_report` sobre el test split de Banking77
      corre y devuelve precision/recall/F1 por intent + macro-F1 (sanity: macro-F1 ~0.8+ con la
      baseline TF-IDF+LogReg). Test que falla si el macro-F1 cae por debajo de un umbral mínimo.
- [ ] **La matriz de confusión se lee:** identificados ≥2 pares de intents que el modelo confunde,
      con la explicación de por qué (cercanía semántica).
- [ ] **El router funciona:** una query de intent simple con confianza > umbral se resuelve **sin**
      llamar al LLM (verificable en el trace de Langfuse: no hay span de LLM); una query ambigua
      cae al pipeline RAG. Medido el % de queries desviadas.
- [ ] *(opcional)* **Embedding fine-tune:** recall@5 con el embedder fine-tuneado de dominio
      reportado vs el genérico sobre las golden queries.

## Capa 2 — defense drills (el HARD GATE)

> No se avanza a M10 hasta responder esto **por escrito, con tus propios números/decisiones** del
> ejercicio. Claude puede hacer de interviewer.

1. **"¿Cuándo fine-tunearías en vez de hacer RAG?"** — Dá el eje (conocimiento que cambia → RAG;
   comportamiento/formato/estilo/dominio → fine-tune) **y** un caso concreto donde fine-tunear
   sería el error (meter hechos que cambian = congelar la base). Explicá por qué en producción casi
   siempre se **combinan**.
2. **"¿Qué es QLoRA y por qué 4-bit?"** — Tenés que nombrar NF4 (dtype óptimo para datos normales),
   el modelo base congelado en 4-bit + adapters LoRA en bf16 encima, por qué entra en una T4, y
   citar el paper (Dettmers 2023). "Es LoRA más chico" = insuficiente.
3. **"¿Por qué no full fine-tuning?"** — Memoria (gradientes + estados del optimizador, ~16
   bytes/param con Adam fp16), costo, catastrophic forgetting. Y por qué LoRA evita las tres.
4. **"Interpretá esta loss curve."** — Te muestran una (usá la tuya del Paso A5). Decí si converge
   sana, overfittea (train baja / val sube), o tiene el lr roto (oscila), y qué tocarías en cada
   caso.
5. **"¿Qué es precision vs recall? ¿Cuál priorizás para tu router de intents y por qué?"** —
   Definí ambas (falsas alarmas vs escapes), F1, y justificá la elección con el **costo del error
   en Grounded** (rutear mal un caso complejo a una respuesta canned vs mandar de más al LLM).
6. **"¿Cómo sabés que tu fine-tune sirvió?"** — Eval before/after en datos no vistos, no la train
   loss sola (que baja siempre). Reusaste el harness de M2 (LLM-as-judge) → cierre del loop.
7. **"Si el reranking de M3 no te alcanza para el recall, ¿qué hacés?"** — Embedding fine-tuning de
   dominio con pares (query, chunk) de tus logs/golden + contrastive loss; medible con recall@k.

**Gate:** marcalo como pasado en el panel del módulo cuando (a) la capa 1 está verde (QLoRA corrido
con eval before/after + clasificador con F1 + router andando en Grounded) y (b) escribiste tus
respuestas a la capa 2 con tus números.
