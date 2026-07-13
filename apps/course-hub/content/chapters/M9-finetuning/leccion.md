---
module: M9
title: Fine-tuning hands-on (QLoRA) + classic ML
concept: Cuándo ajustar pesos en vez de recuperar contexto, y cómo entrenar barato sin un cluster
duration: ~8-10h lectura + 1 finde de práctica (GPU)
---

# M9 — Fine-tuning (QLoRA) y el ML clásico que separa al engineer del API caller

> **Qué vas a saber al terminar esta lección:** explicar, sin mirar, qué hace LoRA y por qué
> QLoRA lo mete en una GPU de $0; decidir con criterio **cuándo fine-tune le gana a RAG** (y por
> qué casi siempre se combinan); leer una loss curve y detectar overfitting; y entrenar un
> clasificador de intents con métricas reales (precision/recall/F1) para rutear barato *antes*
> del LLM. La práctica (ver `practica.md`) es correr un QLoRA end-to-end sobre Llama-3.2-1B y un
> clasificador Banking77.

> **Encuadre honesto:** esto es un **ejercicio de aprendizaje**, no una pieza de producción de
> Grounded. No vas a operar un cluster de GPUs. Vas a entender y *haber corrido* fine-tuning de
> punta a punta, para poder defenderlo en system design y decidir cuándo aplica. Ese es
> exactamente el módulo de alta señal donde se responde la pregunta: **¿sos un API caller o un
> engineer?**

---

## 1. Por qué este módulo existe (y por qué te van a probar acá)

Hasta M8 todo tu sistema fue **RAG + prompting + orquestación**. Eso te lleva lejísimos, pero
tiene un techo de credibilidad: un entrevistador serio sospecha que sabés *llamar* a una API de
LLM pero no entendés qué pasa adentro cuando se *ajustan los pesos*. Dos huecos concretos que
causan rechazos reales en loops de AI Engineer:

1. **Fine-tuning blindness.** "¿Cuándo fine-tunearías en vez de hacer RAG?" Si tu respuesta es
   "fine-tuning es caro, mejor RAG" y nada más, perdiste. La respuesta buena tiene *ejes*
   (formato vs conocimiento), *números* (cuántos ejemplos, cuánto costó) y la experiencia de
   haber visto una loss curve overfittear.
2. **Data/ML blindness.** Muchos "AI engineers" no saben leer una matriz de confusión ni
   explicar precision vs recall. Es el hueco de **ML clásico**: el que te delata como alguien que
   solo orquesta LLMs y nunca entrenó un modelo ni midió un clasificador. Lo tapamos con un
   clasificador de intents real.

La meta del módulo no es que fine-tunees en producción. Es que puedas **defender la decisión** y
**demostrar que entendés el mecanismo** porque lo corriste con tus manos.

---

## 2. El refresher mental: qué es "entrenar" (cross-entropy + gradient descent, a nivel intuición)

No vamos a derivar nada. Necesitás la intuición para defender, no el cálculo.

Un LLM, en el fondo, es un predictor del **próximo token**. Dado un contexto, produce una
distribución de probabilidad sobre todo el vocabulario ("la próxima palabra es `gato` con 0.4,
`perro` con 0.3, ..."). Entrenar = ajustar los pesos para que esa distribución le dé **más
probabilidad al token correcto** del dataset.

- **Cross-entropy loss** mide *qué tan sorprendido* está el modelo por el token correcto. Si al
  token correcto le asignó probabilidad alta → loss baja. Si le asignó probabilidad baja (lo
  consideraba improbable y resultó ser el correcto) → loss alta. Formalmente es `-log(p)` de la
  probabilidad que el modelo le dio al token real. `p=1` → loss 0 (predicción perfecta);
  `p→0` → loss → ∞ (catástrofe). La loss del modelo sobre un dataset es el promedio de eso.
- **Gradient descent** es cómo se baja esa loss. El gradiente te dice, para cada peso, *en qué
  dirección moverlo* para que la loss baje un poquito. Das un pasito (tamaño = **learning rate**)
  en esa dirección, repetís millones de veces. Demasiado grande el paso → rebota y no converge;
  demasiado chico → tarda una eternidad. Por eso el learning rate es el hiperparámetro que más
  vas a tocar.

> **Checkpoint:** ¿qué significa que la loss baje? Que el modelo le asigna cada vez más
> probabilidad a los tokens correctos de *tu* dataset. ¿Y si baja en train pero sube en
> validación? Empezó a memorizar el train en vez de generalizar → **overfitting** (Sección 5).

---

## 3. Por qué NO full fine-tuning (el problema que LoRA resuelve)

"Fine-tunear" en el sentido naive = re-entrenar **todos** los pesos del modelo con tus datos.
Para Llama-3.2-1B son ~1.000 millones de parámetros; para 8B, ocho mil millones. Tres problemas
que lo vuelven inviable para vos (y para casi cualquier empresa que no sea un lab):

1. **Memoria.** Para entrenar full no alcanza con cargar el modelo. Necesitás, *además* de los
   pesos: los **gradientes** (uno por peso) y los **estados del optimizador** (Adam guarda 2
   momentos por peso). Regla de pulgar: full fine-tuning en fp16 con Adam pide ~**16 bytes por
   parámetro** (2 pesos + 2 gradiente + 8 optimizer + activaciones). Un modelo de 7B → ~112 GB
   de VRAM. No entra en una T4 de 16 GB. Ni cerca.
2. **Costo y tiempo.** Mover mil millones de pesos requiere GPUs caras por horas/días.
3. **Catastrophic forgetting.** Al mover *todos* los pesos con tu dataset chico, el modelo puede
   "olvidar" capacidades generales. Tu dataset de 5.000 ejemplos de soporte no debería poder
   degradar la gramática del modelo.

La pregunta clave que LoRA hace: *¿hace falta mover todos los pesos para enseñarle un estilo o un
formato?* La respuesta empírica es **no**.

---

## 4. LoRA: fine-tuning eficiente en parámetros (adapters de bajo rango)

**LoRA = Low-Rank Adaptation.** La idea, en una frase: en vez de modificar la matriz de pesos
`W` (gigante), la **congelás** y aprendés un *parche* chiquito que se le suma.

El parche se factoriza como el producto de dos matrices flacas: si `W` es `d×d`, en vez de
aprender una matriz `d×d` de cambios (`ΔW`), aprendés `A` (`d×r`) y `B` (`r×d`) con un **rango
`r` chico** (típico 8, 16, 32). El cambio efectivo es `ΔW = B·A`, y la capa pasa de calcular
`Wx` a calcular `Wx + (B·A)x`.

```
        W  (congelada, d×d, millones de params)
        │
   x ──►├──────────────► Wx
        │
        └──► A (d×r) ──► B (r×d) ──► (BA)x   ← lo único que se entrena
                                            r pequeño = pocos params
```

Por qué funciona (y qué defender):

- **El "rango" es la apuesta.** La hipótesis de LoRA es que la *actualización* que un fine-tune
  necesita es de **bajo rango intrínseco**: no necesitás mover el espacio entero, alcanza con un
  subespacio chico. Empíricamente, para adaptar estilo/formato/dominio, sí alcanza.
- **Cuántos parámetros entrenás:** en vez de `d×d`, entrenás `2·d·r`. Con `r=16` sobre un modelo
  de miles de millones, terminás entrenando **<1%** de los parámetros. Eso colapsa la memoria de
  gradientes y optimizador (solo existen para los params de A y B).
- **Los adapters son portables.** El resultado es un archivo de pocas decenas de MB (no el modelo
  entero). Podés tener *un adapter por cliente* o por tarea y cargarlos sobre el mismo modelo
  base. Esto es enorme operativamente.
- **`lora_alpha` y escala.** El parche se aplica escalado por `lora_alpha / r`. Es el "volumen"
  del adapter. Una convención común es `alpha = 2·r`. No lo memorices como dogma; sabé que
  controla cuánto pesa el adapter.

> **Checkpoint:** ¿LoRA cambia los pesos del modelo base? **No.** Los congela y aprende matrices
> aparte que se le suman. Por eso es barato, portable y no sufre catastrophic forgetting del modelo
> base: el conocimiento general sigue intacto en `W`.

---

## 5. QLoRA: meter el entrenamiento en una GPU de $0

LoRA reduce los params *entrenables*, pero todavía tenés que **cargar el modelo base en VRAM**
para hacer el forward pass. Un modelo de 8B en fp16 son ~16 GB solo de pesos — no entra cómodo en una
T4 de 16 GB con todo lo demás. **QLoRA** (Dettmers et al., 2023, arXiv **2305.14314**) resuelve
esto: *cuantiza el modelo base a 4 bits* y entrena los adapters LoRA encima.

Las tres piezas que tenés que poder nombrar (vienen del paper):

1. **NF4 (4-bit NormalFloat).** Un tipo de dato de 4 bits diseñado para pesos que siguen una
   distribución ~normal (que es como se distribuyen los pesos de una red). Es *information-
   theoretically optimal* para datos normales: aprovecha mejor los 16 niveles que tiene un número
   de 4 bits que un INT4 lineal. Resultado: el modelo base ocupa **~4x menos** memoria con
   pérdida de calidad mínima.
2. **Double quantization.** Cuantizás también las *constantes de cuantización* (los factores de
   escala). Ahorra ~0.4 bits por parámetro extra. Marginal pero gratis.
3. **Paged optimizers.** Usan memoria unificada para evitar picos de OOM en spikes de memoria
   durante el entrenamiento (paginan al CPU como un swap).

La jugada combinada: **el modelo base, congelado, vive en 4-bit (NF4) en la GPU; los adapters
LoRA se entrenan en precisión más alta (bf16/fp16) encima.** Como solo los adapters tienen
gradientes/optimizador, y el grueso del modelo está en 4 bits, **un modelo de 7B entra y entrena
en una sola GPU de consumo**. Eso es lo que vas a hacer en Colab, normalmente gratis (la GPU T4 no
está garantizada 100% del tiempo — más en `practica.md`).

```
┌─────────────────────────────────────────────┐
│  Modelo base (ej. Llama-3.2)  →  CONGELADO en NF4 (4-bit)   ← ocupa poca VRAM
│                          │
│                          └─► adapters LoRA (A,B) en bf16  ← lo único entrenable
│                                  ↑ gradientes + optimizer SOLO acá
└─────────────────────────────────────────────┘
```

> **Checkpoint — la pregunta de entrevista:** "¿Qué es QLoRA y por qué 4-bit?" Respuesta de alta
> señal: *cuantizo el modelo base a 4-bit con NF4 (un dtype optimizado para distribuciones
> normales) para que entre en la VRAM; lo congelo; y entreno solo adapters LoRA de bajo rango
> encima, en bf16. Así un 7B entrena en una T4. El paper es Dettmers 2023; demostró que QLoRA
> alcanza ~la calidad de full fine-tuning a una fracción de la memoria.* Si decís "es como LoRA
> pero más chico" sin nombrar NF4 ni la cuantización del base, sonás a API caller.

---

## 6. El flujo de un fine-tune, end-to-end

Esto es lo que vas a ejecutar. Internalizá el orden y el *por qué* de cada paso.

> **Nota sobre versiones de modelos:** para este laburo usamos `Llama-3.2-1B-Instruct`, que ya es
> dos generaciones vieja (Meta lanzó **Llama 4** — Scout/Maverick, arquitectura MoE — en abril
> 2025, con Behemoth todavía entrenando). No es un error: para un ejercicio de QLoRA en una GPU de
> 16 GB necesitás un modelo *chico y denso*, y los modelos MoE de Llama 4 (17B+ parámetros activos)
> no entran en el presupuesto de este lab. Lo mismo aplica a las alternativas sin gate
> (`Qwen2.5-1.5B-Instruct`/`SmolLM2-1.7B-Instruct`): fueron sucedidas por Qwen3 y SmolLM3
> respectivamente, pero siguen siendo válidas para *aprender el mecanismo* de QLoRA — el punto del
> módulo no es usar el SOTA, es que entiendas y hayas corrido el proceso. Verificá siempre en
> `practica.md` qué versión de modelo/librerías está fijada antes de correr.

### 6.1. Dataset → formato de instrucción

Un modelo *instruct* fue entrenado para seguir un formato de chat específico (roles
system/user/assistant, con tokens especiales). Para fine-tunear tenés que entregar tus ejemplos
**en ese mismo formato**, o el modelo no aprende lo que creés. El **chat template** del tokenizer
es el que sabe cómo serializar los roles a tokens — usalo, no inventes el formato a mano.

Para Grounded, el dataset natural es **Bitext customer-support** (pares instrucción→respuesta de
soporte). Cada ejemplo se convierte en algo como:

```
<|system|> Sos un agente de soporte. Respondé claro y conciso.
<|user|>   How do I reset my password?
<|assistant|> To reset your password, go to Settings → Security → "Reset password"...
```

Punto fino a defender: **¿entrenás sobre toda la secuencia o solo sobre la respuesta?** Lo correcto
para un asistente es **enmascarar el prompt** (completion-only): la loss se calcula solo sobre los
tokens del `assistant`, no sobre los del `user`. No querés que el modelo aprenda a *generar
preguntas de usuario*; querés que aprenda a *responder*. (TRL lo soporta con un data collator de
completion-only.)

### 6.2. Entrenar

Cargás el modelo en 4-bit, le pegás los adapters LoRA, y corrés el train loop. No escribís el loop
a mano: usás **SFTTrainer** de la librería **TRL** (de Hugging Face), que es un wrapper sobre el
`Trainer` pensado para *supervised fine-tuning*. Vos le pasás el dataset formateado y la config; él
maneja batching, gradient accumulation, logging de loss, checkpoints.

Hiperparámetros que vas a ver y tener que justificar:
- **learning rate** (típico 1e-4 a 2e-4 para LoRA — más alto que full fine-tuning porque movés
  pocos params).
- **epochs** (1-3; con datasets de instrucción, 1-2 suele alcanzar — más es overfitting).
- **batch size + gradient accumulation** (si no entra un batch grande en VRAM, acumulás gradientes
  de varios micro-batches antes de dar el paso — simula un batch grande sin la memoria).
- **rank `r` y `lora_alpha`** (Sección 4).
- **`target_modules`**: limitarlo a las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`,
  `o_proj`) es la versión de manual antigua. La práctica 2026 es sumar también las proyecciones del
  MLP (`gate_proj`, `up_proj`, `down_proj`) — PEFT lo simplifica con el atajo
  `target_modules="all-linear"` — porque acercarte más a *todas* las capas lineales entrenables
  mejora notablemente qué tan cerca queda el LoRA de un full fine-tuning.
- **DoRA** (Weight-Decomposed LoRA, `use_dora=True` en `LoraConfig`): descompone el peso en
  magnitud + dirección y entrena ambas partes de forma más expresiva que el LoRA plano. Combinado
  con NF4 se lo llama informalmente "QDoRA". Cuesta un poco más de cómputo; vale la pena cuando
  tenés GPU de sobra (A100/H100) y necesitás una calidad más cercana a full fine-tuning que la que
  da LoRA solo.

### 6.3. Loss curve: qué mirar

Mientras entrena, TRL loguea la training loss. Si separaste un set de validación, también la
validation loss. **Esto es lo que un entrevistador te puede pedir interpretar.** Tres patrones:

```
loss
 │ \                          GOOD: train y val bajan juntas
 │  \___                      y se aplanan → convergencia sana
 │      \____ val
 │       \___ train
 └──────────────► steps

loss
 │ \                          OVERFIT: train sigue bajando,
 │  \  ___val (sube)          val toca un mínimo y SUBE.
 │   \/                       Pasaste el punto óptimo →
 │    \____train              parás antes (early stopping) o
 └──────────────► steps       menos epochs / más datos / más regularización

loss
 │ ────────────  train        UNDERFIT / LR roto: la loss no
 │  ~~~~~~~~~~~~               baja o oscila salvaje. LR muy alto
 │                            (rebota) o muy bajo (no aprende).
 └──────────────► steps
```

Lo que tenés que poder decir mirando una curva:
- **Baja suave y se aplana** → bien. Pará cuando se aplana (más epochs = gastar compute sin
  ganancia o empezar a overfittear).
- **Train baja, val sube** → overfitting. Menos epochs, más datos, o bajá el rank/lr.
- **Oscila/no baja** → learning rate mal calibrado. Bajalo.

> **Checkpoint:** ¿la training loss bajando *sola* te dice que el fine-tune sirvió? **No.** Train
> loss baja siempre que entrenás lo suficiente (puede estar memorizando). La señal honesta es la
> **validation loss** + una **eval before/after** en datos que el modelo no vio (Sección 6.4).

### 6.4. Eval before/after (la prueba de que sirvió)

La loss curve es diagnóstica, no es la prueba. La prueba es: corré el **mismo set de prompts de
test** por el modelo **antes** del fine-tune (base) y **después** (base + adapter), y compará. Esto
es lo que demuestra mejora. Formas de medir, de menos a más rigurosas:

- **Cualitativa:** leés 10-20 respuestas lado a lado. ¿El modelo fine-tuneado responde en el
  formato/tono que querías? (Para un fine-tune de *estilo*, esto ya dice mucho.)
- **Loss en test:** la validation/test loss del modelo fine-tuneado vs el base sobre el mismo set.
- **LLM-as-judge** (conecta con M2): reusá el harness de evals — un judge compara base vs
  fine-tuned en tus golden queries. **Este es el cierre del loop:** el mismo harness que evalúa
  RAG ahora evalúa el fine-tune.

> **Regla:** un fine-tune sin eval before/after es un acto de fe. Nunca presentes "fine-tuneé un
> modelo" sin el número de cuánto mejoró y *en qué dimensión*.

---

## 7. La pregunta de system design: ¿cuándo fine-tune le gana a RAG?

### El decision framework de OpenAI (y por qué el orden importa)

Antes de evaluar técnicas, el framework que popularizó OpenAI establece un orden de prioridad
claro que el mercado adoptó como estándar — y en 2026 se le sumó un cuarto escalón:

```
prompting  →  RAG  →  fine-tuning  →  distillation
  (horas)    (datos en   (último recurso,    (una vez que ya sabés
             tiempo real) con eval métrica   *qué* funciona, destilás
                          definida)          esa calidad a un modelo
                                             chico y barato de servir)
```

**El 80% de los casos donde alguien propone un fine-tune se resuelven mejor con un prompt
mejorado, algunos ejemplos few-shot, o un pipeline de RAG.** El fine-tuning solo entra cuando
has agotado esas opciones y podés articular con precisión por qué no funcionaron.

Este heurístico dejó de ser solo una opinión de curso: es literalmente la razón que dio **OpenAI**
para empezar a **cerrar su plataforma self-serve de fine-tuning** (anunciado el 7-may-2026): los
modelos base más nuevos (familia GPT-5.x, incl. GPT-5.4) siguen instrucciones tan bien que cada vez
hay menos casos que de verdad necesiten mover pesos. Ver el recuadro de la tabla más abajo — esto
cambia el mensaje de "fine-tuning en modelos cerrados" de "una opción más" a "una ventana que se
está cerrando".

**Regla de oro antes de abrir el notebook:**

> *"No hagas fine-tune hasta que puedas enunciar claramente cuál es tu métrica de eval y por qué
> el prompting no puede moverla."*

Esto conecta directo con el harness de M2: si no podés medir la mejora con el golden dataset y el
judge de M2, no tenés la condición para justificar el fine-tune. La métrica de eval es el contrato.

Llevado a Grounded: si querés que el bot "responda siempre en formato JSON con estructura fija y
en tono formal", el primer intento es prompting + structured outputs (M4). Si después de iterar el
harness muestra que el cumplimiento de formato es insuficiente y la métrica no sube — ahí el
fine-tune está justificado. Sin ese proceso documentado en `DECISIONS.md`, la propuesta de
fine-tunear es prematuro.

### Los métodos disponibles y sus condiciones (awareness)

No todos los modelos son fine-tuneables, y los métodos disponibles dependen del modelo:

| Método | Cuándo usar | Modelos compatibles (referencia jul-2026) |
|---|---|---|
| **SFT** (Supervised Fine-Tuning) | comportamiento, formato, estilo | GPT-4.1, GPT-4.1-mini |
| **DPO** (Direct Preference Optimization) | alinear a preferencias humanas, comparativas | GPT-4.1, GPT-4.1-mini |
| **RFT** (Reinforcement Fine-Tuning) | tareas de razonamiento que requieren "pensar" | histórico: solo `o4-mini` la soportaba, y ya está en salida (ver nota abajo) |
| **No fine-tuneable** | usar vía API/prompting/RAG únicamente | Toda la familia GPT-5.x (incl. GPT-5.4) |

> **Desarrollo crítico (verificá siempre contra `developers.openai.com/api/docs/deprecations`
> antes de proponer esto en una entrevista o un ADR):** OpenAI anunció el **7-may-2026** el cierre
> gradual de **toda** su plataforma self-serve de fine-tuning (SFT, DPO y RFT), en fases:
> - desde el 7-may-2026: organizaciones **nuevas** ya no pueden iniciar fine-tuning;
> - desde el 2-jul-2026: organizaciones **sin uso de inferencia** sobre un modelo fine-tuneado en
>   los últimos 60 días **pierden la capacidad de crear jobs nuevos** (ya en vigencia);
> - el 6-ene-2027: cierre total para todos. La inferencia sobre modelos ya fine-tuneados sigue
>   funcionando hasta que se deprecien los modelos base subyacentes.
>
> Además, `o4-mini` —el único modelo que soportaba RFT— fue retirado de ChatGPT en feb-2026, y su
> snapshot de API (`o4-mini-2025-04-16`) tiene shutdown programado para el **23-oct-2026**, con
> `gpt-5.4-mini` como sucesor recomendado (que no soporta fine-tuning). En la práctica, para
> jul-2026 **RFT ya no es una opción vigente para un proyecto nuevo** — es historia del módulo, no
> una alternativa a evaluar.
>
> Awareness para entrevistas: cuando cites fine-tuning en un modelo cerrado de OpenAI, nombrá el
> método, verificá que el modelo lo soporte, **y** mencioná que la plataforma se está cerrando por
> decisión del propio vendor — no es una limitación técnica más, es una tendencia de mercado que
> valida el decision framework de arriba. "Haría fine-tuning con GPT-5" sigue siendo una respuesta
> que delata no haber revisado las restricciones de la plataforma.

Esta es **la** pregunta del módulo. La respuesta mediocre es "depende". La respuesta de engineer
tiene un eje claro:

| Necesitás cambiar... | Herramienta | Por qué |
|---|---|---|
| **Conocimiento que cambia** (docs, precios, políticas nuevas cada semana) | **RAG** | Agregás un doc y listo. Fine-tunear para meter un hecho nuevo = re-entrenar por cada cambio. Insostenible y el conocimiento queda congelado. |
| **Formato / estructura de salida** (siempre responder en JSON, siempre con cierto template) | **Fine-tune** (o structured outputs) | Es comportamiento, no conocimiento. El modelo lo internaliza. |
| **Estilo / tono / voz de marca** consistente | **Fine-tune** | Difícil de lograr con prompting solo; el modelo lo "absorbe". |
| **Dominio cerrado / jerga** (vocabulario médico, legal, interno) | **Fine-tune** | Le enseñás el "idioma" del dominio. |
| **Tareas de clasificación / extracción** específicas y de alto volumen | **Fine-tune** (o modelo chico clásico) | Más barato y rápido que llamar a un LLM grande por cada item. |

La heurística para defender:
- **RAG es para CONOCIMIENTO. Fine-tune es para COMPORTAMIENTO** (formato, estilo, dominio,
  skill). Conocimiento que cambia → RAG, siempre. No fine-tunees hechos.
- **El patrón híbrido 2026 es la norma en producción:** RAG para hechos + fine-tuning para
  estilo/política/decisión. Un modelo fine-tuneado para *responder con el tono y formato de tu
  soporte*, alimentado con *los docs recuperados por RAG*. No es uno u otro — es la secuencia
  correcta: primero RAG, después (si hace falta) fine-tune encima.
- **Empezá por prompting y RAG** (en ese orden, per el decision framework de §7). Fine-tune es el
  último recurso cuando prompting + RAG no logran la métrica que definiste, y tenés datos
  suficientes (cientos-miles de ejemplos de calidad). Fine-tunear antes de agotar prompting es
  over-engineering que se paga con tiempo y costo sin evidencia de necesidad.
- **El cuarto escalón, distillation:** una vez que ya validaste con fine-tuning (o con un modelo
  grande + prompting fuerte) *qué* comportamiento querés, podés destilar esa calidad a un modelo
  chico y barato de servir. Es el paso que viene *después*, no un sustituto de los anteriores.

> **Checkpoint:** un cliente quiere que el bot "responda siempre citando el número de ticket y en
> tono formal, usando *nuestra* base de conocimiento que actualizamos a diario". ¿Fine-tune o RAG?
> **Las dos.** Fine-tune (o prompting fuerte) para el tono+formato; RAG para la base que cambia a
> diario. Si dijiste "fine-tune todo", congelaste la base de conocimiento — error.

---

## 8. Embedding fine-tuning de dominio (mejorar el retrieval, no la generación)

Hasta acá "fine-tune" fue sobre el LLM *generador*. Hay un segundo lugar donde fine-tunear paga, y
conecta directo con el corazón de Grounded: **el modelo de embeddings**.

El problema: un modelo de embeddings genérico (como `text-embedding-3-small`) fue entrenado con
texto general. En tu dominio de soporte, dos frases pueden ser semánticamente equivalentes en tu
jerga ("activar el plan" = "upgrade de la suscripción") pero el modelo genérico no las pone tan
cerca como debería. Eso te baja el **recall del retrieval** — el problema central de M3.

**Fine-tunear el embedder de dominio** = ajustar el modelo de embeddings con **pares de tu
dominio** para que acerque lo que en *tu* contexto es similar. El dato de entrenamiento son pares
(o tríos):
- **pares positivos:** (query real de usuario, chunk que la responde) — los sacás de tus logs o de
  tu golden dataset de M2.
- **negativos:** chunks que *no* responden (random, o mejor, *hard negatives*: parecidos pero
  incorrectos).

Se entrena con una **contrastive loss** (típicamente con la librería **sentence-transformers**,
con `MultipleNegativesRankingLoss`): empujar los positivos cerca y los negativos lejos en el
espacio de embeddings. El resultado: un embedder que entiende *tu* dominio → mejor recall@k → mejor
RAG, sin tocar el LLM.

Un riesgo real de este approach: si minás *hard negatives* de forma agresiva, podés terminar
etiquetando como "negativo" un chunk que en realidad **sí** responde la query (un falso negativo),
lo que confunde al entrenamiento. Si te pasa, la técnica más avanzada (2026) es **`GISTEmbedLoss`**:
extiende `MultipleNegativesRankingLoss` usando un modelo guía para filtrar esos falsos negativos
antes de penalizarlos. No hace falta para la práctica base, pero es la respuesta correcta si te
preguntan "¿y si tu hard-negative mining te está ensuciando el training set?".

> **Por qué es alta señal:** mucha gente sabe que existe el fine-tuning de LLMs; pocos saben que
> **el retrieval también se fine-tunea**. Decir "si el recall no me alcanza con reranking, el
> siguiente paso es fine-tunear el embedder de dominio con pares de mis logs" te pone en otra
> categoría. Y se mide con el mismo recall@k de M3 (before/after).

---

## 9. Classic ML: el clasificador de intents (y por qué tapa un hueco real)

Cambiamos de tema deliberadamente. Esto **no es deep learning**: es **machine learning clásico**,
y es justo el hueco que delata a los "AI engineers" que solo orquestan LLMs.

### 9.1. El por qué: routing barato antes del LLM

No toda query necesita el pipeline RAG completo + un LLM caro. Muchas son **intents conocidos y
repetitivos**: "¿dónde veo mi factura?", "quiero cancelar", "reset de contraseña". Si pudieras
**clasificar el intent** de la query con un modelo chiquito y barato (microsegundos, sin GPU),
podrías **rutear**: intents simples → respuesta canned o flujo dedicado; intents complejos →
pipeline RAG/LLM. Esto baja costo y latencia. Es ingeniería de sistema real, no AI hype.

El dataset canónico para esto es **Banking77** (PolyAI): ~13.000 queries de banca etiquetadas en
**77 intents** (`card_arrival`, `lost_or_stolen_card`, `exchange_rate`, ...). Es el benchmark
estándar de intent classification.

### 9.2. El pipeline classic ML (sin LLM)

```
texto → vectorizar (TF-IDF o embeddings) → clasificador (LogReg/SVM) → intent
```

Una baseline fuerte y barata: **TF-IDF + Logistic Regression** con scikit-learn. (Variante mejor:
usar embeddings como features en vez de TF-IDF, pero la baseline ya enseña todo lo que importa.)
TF-IDF convierte texto en vectores por frecuencia de términos ponderada; LogReg aprende una
frontera lineal por clase.

### 9.3. Las métricas — lo que de verdad tenés que entender

Acá está el corazón del "data/ML literacy". Para un clasificador, **accuracy no alcanza** (y con
clases desbalanceadas, engaña). Tenés que manejar esto:

Para una clase dada, mirá los 4 cuadrantes (matriz de confusión):
- **TP** (true positive): era esa clase y la predijo esa clase. ✅
- **FP** (false positive): NO era esa clase pero la predijo esa clase. (falsa alarma)
- **FN** (false negative): ERA esa clase pero predijo otra. (se le escapó)
- **TN** (true negative): no era y no la predijo.

Con eso:

- **Precision = TP / (TP + FP).** De todo lo que **predije** como esta clase, ¿qué fracción
  acerté? Penaliza las **falsas alarmas**. Alta precision = "cuando digo X, casi siempre es X".
- **Recall = TP / (TP + FN).** De todo lo que **realmente era** esta clase, ¿qué fracción
  *agarré*? Penaliza lo que se **escapó**. Alto recall = "casi no se me escapa ningún X".
- **F1 = media armónica de precision y recall** `= 2·(P·R)/(P+R)`. Un solo número que castiga el
  desbalance entre los dos (no podés inflar uno ignorando el otro).
- **Matriz de confusión:** la grilla `clase real × clase predicha`. La diagonal son los aciertos;
  todo lo de afuera son confusiones. Te dice **qué clases se confunden entre sí** (ej.
  `card_arrival` vs `card_delivery_estimate`) — información accionable que un solo número esconde.

El trade-off precision/recall (esto es lo que diferencia):
> Subir uno suele bajar el otro. **¿Cuál priorizás depende del costo del error.** En el routing:
> si rutear mal un intent complejo a una respuesta canned es caro (cliente furioso), querés **alta
> precision** en los intents "simples" (solo ruteo directo cuando estoy muy seguro; ante la duda,
> al LLM). En un detector de fraude querés **alto recall** (mejor revisar de más que dejar pasar un
> fraude). El número no se elige en abstracto: se elige contra el costo del falso positivo vs el
> falso negativo *en tu producto*.

- **macro vs weighted average:** con 77 clases, `macro-F1` promedia el F1 de cada clase por igual
  (las clases raras pesan lo mismo que las comunes — bueno para no esconder fallas en clases
  chicas); `weighted` pondera por soporte (refleja el desempeño "promedio" real). Reportá macro-F1
  para no engañarte con el desbalance.

`sklearn` te da todo esto con `classification_report` (precision/recall/F1 por clase + promedios) y
`confusion_matrix`. Vas a leerlos, no calcularlos a mano.

> **Checkpoint — "¿qué es precision vs recall?":** Precision = cuán *confiables* son mis
> predicciones positivas (pocas falsas alarmas). Recall = cuán *completo* es mi agarre (pocos
> escapes). F1 los balancea. Cuál priorizo depende de si me duele más el falso positivo o el falso
> negativo en *este* producto. Si recitás las fórmulas pero no podés decir cuál priorizar en el
> routing y por qué, no entendiste la métrica.

---

## 10. Cómo encaja todo en Grounded (el mapa)

| Pieza de M9 | Dónde toca a Grounded | Nivel honesto |
|---|---|---|
| QLoRA sobre Llama-3.2-1B + Bitext | ejercicio de aprendizaje; *no* se deploya | can-build (lo corriste) + can-defend |
| "¿cuándo fine-tune vs RAG?" | decisión de arquitectura (ADR) | can-defend-in-system-design |
| Embedding fine-tuning de dominio | mejora *potencial* del retrieval de M3 (medible con recall@k) | can-explain + can-build (demo) |
| Clasificador de intents (Banking77) | **router barato** antes del pipeline RAG/LLM (baja costo/latencia) | can-build + can-defend |
| precision/recall/F1/confusión | leer/defender cualquier clasificador o eval binaria | can-explain (literacy core) |

---

## 11. Lo que tenés que poder defender (conecta con `criterios-defensa.md`)

Al cerrar M9, un entrevistador podría preguntarte cualquiera de estas. Si no las podés responder
con tus palabras (y, donde aplica, tus números del ejercicio), el módulo no está cerrado:

- "¿Qué es LoRA y por qué entrena tan pocos parámetros?" (Sección 4)
- "¿Qué es QLoRA y por qué 4-bit? ¿Qué es NF4?" (Sección 5)
- "¿Por qué no full fine-tuning?" (Sección 3)
- "Interpretá esta loss curve." (Sección 6.3 — te van a mostrar una)
- "¿Cuándo fine-tunearías en vez de RAG? Dame un caso donde es lo correcto y uno donde es un
  error." (Sección 7)
- "¿Cómo mejorarías el retrieval si el reranking no alcanza?" → embedding fine-tuning de dominio.
  (Sección 8)
- "¿Qué es precision vs recall y cuál priorizarías para tu router de intents?" (Sección 9)
- "¿Cómo evaluaste que el fine-tune sirvió?" → eval before/after, no solo la train loss.
  (Sección 6.4)
- "¿Cuándo harías fine-tune en vez de prompting o RAG? Dame el criterio." → el decision framework:
  prompting → RAG → fine-tune; solo cuando podés enunciar la métrica de eval que el prompting no
  mueve. (Sección 7)
- "¿Qué método de fine-tuning usarías y en qué modelo?" → nombrar SFT/DPO/RFT según el caso, y
  verificar que el modelo lo soporte (GPT-5.x no es fine-tuneable; RFT solo en reasoning models) —
  y saber que OpenAI está cerrando la plataforma self-serve de fine-tuning en fases (may-2026 →
  ene-2027), lo cual refuerza por qué prompting/RAG son el default. (Sección 7)

**El drill de defensa crítico de este módulo:**
> *"¿Cuál es la métrica de eval que no se mueve con prompting y que justifica tu propuesta de
> fine-tune?"*
>
> Si no podés responder esto con un número del harness de M2 y una justificación de por qué el
> prompting tocó el techo, la propuesta de fine-tune no está lista. Esa es exactamente la pregunta
> que un tech lead o un entrevistador serio te va a hacer.

Seguí con `material-apoyo.md` para las fuentes canónicas, y después `practica.md` para correrlo.
