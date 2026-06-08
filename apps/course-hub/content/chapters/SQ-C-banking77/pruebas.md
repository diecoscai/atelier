---
module: SQ-C
gate: pending
---

# Pruebas — SQ-C (classic ML / Banking77)

## Capa 1 — pipeline + evaluación (prueba que funciona)

- [ ] Cargás Banking77 desde Hugging Face con sus splits train/test.
- [ ] El clasificador entrena sobre train y predice sobre test (datos no vistos).
- [ ] Generás un `classification_report` (precision/recall/F1 por clase + promedios) y una matriz
      de confusión visualizada.
- [ ] Comparás performance train vs test (chequeo de overfitting).

## Capa 2 — defense drills (el HARD GATE)

> No marcás el gate hasta responder esto **con tus propios números** del resultado de Banking77.
> Claude puede hacer de interviewer.

1. **"Diferencia entre precision y recall. Dame un caso donde priorizás una."** — Definí ambas y
   un ejemplo (fraude / soporte) con el trade-off.
2. **"¿Por qué accuracy puede mentir? ¿Qué reportás en su lugar?"** — Clases desbalanceadas; F1
   macro.
3. **"Mostrame tu matriz de confusión. ¿Qué intents se confunden y por qué?"** — Señalá pares
   concretos de tu resultado y la razón (cercanía semántica).
4. **"¿Cómo sabés que no estás overfitteando?"** — Brecha train vs test con tus números.
5. **"¿Usarías esto como router antes del LLM? ¿Con qué umbral?"** — Defendé el framing de M9:
   confianza, ahorro de costo/latencia, fallback al LLM.

**Gate:** marcalo cuando (a) la capa 1 está verde (clasificador entrenado y evaluado) y (b)
escribiste las respuestas de la capa 2 con tus números.
