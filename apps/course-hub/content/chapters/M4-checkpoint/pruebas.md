---
module: M4
gate: pending
---

# Pruebas — M4 (HIREABLE CHECKPOINT)

## Capa 1 — tests automatizados (prueban que *funciona*)

> El más importante de todo el módulo es el **test de aislamiento cross-tenant**. Sin él verde en
> CI, el checkpoint no existe — "aíslo tenants" sin un test que lo pruebe no vale en una entrevista.

- [ ] **★ Aislamiento cross-tenant (EL test).** Ingestás un doc para el tenant `acme` y otro para
      `globex`. Una query desde `acme` que semánticamente matchearía el doc de `globex` recupera SOLO
      lo de `acme` — **NUNCA** lo de `globex`. Corre en CI; se pone rojo si alguien saca el filtro
      `WHERE tenant_id`.
      ```python
      async def test_cross_tenant_isolation():
          await ingest(tenant_id="acme",   text="El código secreto de Acme es ALPHA-7.")
          await ingest(tenant_id="globex", text="El código secreto de Globex es OMEGA-9.")
          results = await retrieve(embed("¿cuál es el código secreto?"), tenant_id="acme")
          blob = " ".join(r["content"] for r in results)
          assert "ALPHA-7" in blob              # ve lo suyo
          assert "OMEGA-9" not in blob          # NUNCA lo de Globex  <- el assert que importa
          assert all(r["tenant_id"] == "acme" for r in results)
      ```
- [ ] **JWT manipulado no cruza tenants.** Un request con `tenant_id` puesto en el body/header (no
      en el JWT) es ignorado; el tenant efectivo sale solo del claim del token verificado. Un JWT con
      firma inválida → 401.
- [ ] **Structured output valida contra schema.** `/chat` devuelve un objeto que cumple el schema
      `Answer` (campos y tipos correctos). Forzar una salida inválida dispara el reintento de
      Instructor; si tras los reintentos sigue inválida, el endpoint falla limpio (no devuelve basura).
- [ ] **Citation verification.** Una cita cuyo `quote` NO es substring del chunk citado es rechazada
      por `verify_citation`. Una respuesta sin ninguna cita verificada se marca no-confiable.
- [ ] **Abstención calibrada.** Una query sin respuesta en los docs → `answered=False` y texto de
      "no sé" (no inventa). Una query con respuesta clara → `answered=True` con cita verificada.
- [ ] **Confidence vía logprobs.** La respuesta lleva un score de confianza derivado de logprobs;
      el test confirma que el score existe y cae en bajo-confianza para un caso ambiguo conocido.
- [ ] **Smoke del deploy.** La URL pública `https://` responde 200, sirve la UI, y completa el flujo
      con un JWT de prueba. TLS válido.

## Capa 2 — defense drills (el HARD GATE del checkpoint)

> No se cierra el checkpoint ni se avanza a M5 hasta responder esto **por escrito, con tus propios
> números/decisiones**, y pasar el **mock defense** de `criterios-defensa.md`. Claude puede hacer de
> interviewer.

1. **"Diseñá un chatbot multi-tenant con aislamiento de datos."** — LA pregunta. Esperan el flujo
   completo: JWT firmado → `tenant_id` del claim → `WHERE tenant_id = $1` hard-scoped en cada query →
   RLS como defensa en profundidad → test que lo prueba. Dibujá el flujo de datos, no lo recites.
2. **"¿Cómo evitás cross-tenant leakage? ¿Por qué no alcanza ponerlo en el system prompt?"** — Esperan:
   (a) el retrieval ya trajo los chunks *antes* de que el prompt actúe, (b) el prompt se rompe con
   prompt injection (OWASP LLM01). Aislamiento determinístico en la capa de datos, no en el modelo.
   *Caer en "le pongo en el prompt que no cruce" = reprobás el drill.*
3. **"Mostrame que tu aislamiento funciona."** — No lo cuentes: corré el test cross-tenant en vivo.
4. **"¿Cómo garantizás que la salida del LLM sea parseable?"** — Structured outputs / constrained
   decoding / Instructor + Pydantic + reintentos validados. Por qué NO regex sobre texto libre.
5. **"¿Cómo hacés que cite de verdad y no invente la cita?"** — quote + chunk_id en el schema +
   verificación por substring/fuzzy en código (grounding check).
6. **"¿Cómo calibrás el 'no sé'? Dame el número y de dónde salió."** — umbral de retrieval + flag
   `answered` + logprobs, *calibrados contra el golden dataset de M2*. La frase clave:
   "calibrado contra mi eval set", con el número concreto.
7. **"¿Qué son los logprobs y qué NO miden?"** — confianza del modelo en su propio sampling
   (`prob = exp(logprob)`); NO miden corrección factual. Una señal entre varias.
8. **"¿Qué hace distinto a Grounded de My AskAI / Ragie?"** — evals con error-analysis (M2), hybrid
   retrieval medido (M3), multi-tenancy determinístico verificado (M4), y que cada decisión es
   defendible con un número. La sección de diferenciación de tu `DECISIONS.md`.

**Gate (checkpoint):** marcalo como pasado en el panel del módulo cuando (a) la capa 1 está verde en
Grounded — **con el test cross-tenant verde en CI** —, (b) el deploy público con TLS funciona
end-to-end, (c) `DECISIONS.md` + diagrama + README con métricas + demo existen, y (d) pasaste el
**mock defense completo** de `criterios-defensa.md` sin titubear en los drills 1 y 2.
**Estado al pasar: resume-able, defendible, evaluable en 5 min.**
