---
module: M2
gate: pending
---

# Pruebas — M2

## Capa 1 — tests automatizados (prueban que el harness *funciona*)

> El harness ES código testeable y corriendo en CI. Estos son los chequeos de que existe y agarra
> regresiones de verdad.

- [ ] `pytest evals/test_retrieval.py`: las métricas de retrieval (recall@k, precision@k, MRR,
      hit rate) son funciones puras testeadas, y corren sobre los 50+ casos del golden set
      reportando el baseline.
- [ ] `pytest evals/test_generation.py`: las métricas de generación (RAGAS/DeepEval —
      faithfulness, answer relevancy, context recall) corren sobre el golden set con thresholds.
- [ ] El **golden dataset** (`evals/golden.jsonl`) tiene ≥50 ejemplos estratificados por la
      taxonomía, incluyendo **casos negativos** (respuesta no presente → la verdad es "no sé").
- [ ] El **LLM-judge** corre con output estructurado y está **validado**: `judge_validation.md`
      muestra ≥80% de acuerdo con labels humanos sobre 20-30 casos, con **Cohen's Kappa ≥ 0.61**
      (acuerdo substancial). Si κ < 0.40, el judge no está listo — reescribí el criterio.
- [ ] El **CI gate** (GitHub Actions) corre el harness en cada PR y **falla cuando una métrica
      baja**: un PR que empeora el retrieval a propósito (ej. `k=1`) rompe el CI; revertir lo
      arregla.
- [ ] El **eval dashboard público** está live y muestra las métricas actuales + su evolución.

## Capa 2 — defense drills (el HARD GATE)

> No se avanza a M3 hasta responder esto **por escrito, con tus propios números/decisiones**.
> Estas son las preguntas EXACTAS de entrevista para este módulo. Claude puede hacer de
> interviewer. Si una sale floja, el módulo no está cerrado.

1. **"¿Tu eval es vibes-based o estructurado? Explicame tu proceso."** — La respuesta de AI
   Engineer: error analysis PRIMERO. Describí open coding → axial coding → taxonomía, y cómo las
   métricas/judges se diseñan *contra* la taxonomía. Si tu respuesta empieza con "uso RAGAS",
   reprobaste.

2. **"Mostrame tu taxonomía de fallas. ¿De dónde salió?"** — Tenés que poder *abrir
   `taxonomy.md`* y explicar cada categoría, su frecuencia, y que salió de leer traces a mano (no
   de un blog). Decí cuál es tu falla #1 y su %.

3. **"¿Cómo evaluás retrieval vs generación por separado, y por qué importa?"** — Atribución de la
   falla: sin separar no sabés si arreglar retrieval o generación. Nombrá las métricas de cada eje.

4. **"Nombrame las métricas de RAGAS y qué mide cada una."** — faithfulness (no inventa respecto al
   contexto) ≠ answer relevancy (responde la pregunta) ≠ context precision/recall (calidad del
   contexto). Que no se te confundan.

5. **"¿Cuándo usás un eval code-based vs un LLM-judge?"** — Code-based cuando el criterio es
   unívoco (recall@k, formato, presencia de cita). LLM-based cuando se requiere juicio semántico
   (faithfulness, answer relevancy). No mezclarlos sin criterio. Este es el eje de diseño de
   tu harness — si respondés "uso LLM-judge para todo", reprobaste.

6. **"¿Cómo alineás tu judge con juicio humano experto? ¿Qué es Cohen's Kappa?"** — SME
   alignment: etiquetás 20-30 casos a mano, corrés el judge, calculás κ. Kappa corrige el acuerdo
   por azar. κ < 0.40 → el judge no sirve; κ ≥ 0.61 → substancial, confiable para producción.
   Defendé tu kappa y qué casos discrepan.

7. **"¿Cómo funciona tu LLM-judge, qué sesgos tiene, y cómo sabés que es confiable?"** — Cómo
   juzga, los sesgos (position/verbosity/self-preference) + mitigaciones, y sobre todo: **validado
   contra labels humanos con Cohen's Kappa**. Un judge sin validar es vibes-based.

8. **"¿Por qué un modelo barato y separado para el judge?"** — Barato porque corre en cada commit;
   separado del generador para evitar self-preference bias.

9. **"¿Cómo construiste el golden dataset y por qué en M2 y no en M1?"** — Synthetic Q&A contra
   docs reales, estratificado por la taxonomía. En M2 porque (a) docs reales, no toy, (b) derivado
   de la taxonomía que recién existe acá, (c) estable a través de los cambios de M3.

10. **"¿Qué pasa en tu CI cuando un cambio baja una métrica?"** — Regression gate: el job falla y
    bloquea el merge. Demostralo con el PR que rompiste a propósito.

11. **"¿Cómo evaluarías un *agente* (no solo una respuesta) con este harness?"** — El harness es
    agnóstico al componente: toma un trace genérico. En M6, el trace es la trayectoria de tools del
    agente; agregás evaluadores de trajectory/tool-correctness sin reescribir la infraestructura.

**Gate:** marcalo como pasado en el panel del módulo cuando (a) la capa 1 está verde en Grounded
(harness corriendo, CI gate agarra una regresión real, dashboard live) y (b) escribiste tus
respuestas a la capa 2 con tus números. Este es el hard gate del módulo spine — no lo apures.
