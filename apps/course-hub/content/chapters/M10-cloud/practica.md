---
module: M10
feature: deploy real a managed cloud (Cloud Run/App Runner) con IaC + vLLM benchmark + model card
repo: grounded
---

# Práctica — deploy real a un big-3, self-host inference, y governance (en el repo Grounded)

Objetivo: mover Grounded del PaaS a UN cloud de los grandes con IaC, correr tu propio modelo en
vLLM y medir su throughput, y producir los dos artefactos de governance. Cada paso tiene **qué
hacer** y **cómo verificar**. No avances sin que el actual verifique.

> Trabajás en el repo **`grounded`**. El deploy a cloud es el entregable real; vLLM y governance
> son ejercicios de aprendizaje (encuadre honesto, ver `leccion.md` §0). El billing (Paso 7) es
> **opcional**.

## Pre-requisitos
- Grounded ya deployado en Railway/Fly (de M0→M4), funcionando.
- Dockerfile de `services/api` que escucha en `$PORT` y en `0.0.0.0` (ver `leccion.md` §2).
- Una cuenta de GCP **o** AWS con free tier / créditos. `gcloud` **o** `aws` CLI instalado y
  autenticado. `terraform` instalado.
- Para vLLM: acceso a una GPU prestada (Colab con runtime T4, o una GPU económica de RunPod — su
  catálogo cambia seguido, así que no te fijes en un modelo puntual: mirá `runpod.io/pricing` y
  elegí la opción más barata disponible en el momento, típicamente en el rango de ~$0.15-0.30/h
  para una GPU de entrada tipo L4/RTX 4000).
- Leíste los ★ Core de `material-apoyo.md`; podés explicar PagedAttention y los 4 tiers del AI Act
  sin mirar.

> **Elegí UN cloud y un solo runtime serverless.** Los pasos muestran **GCP Cloud Run** (camino
> recomendado, IaC más simple). Si elegís AWS, usá **ECS Express Mode** si estás arrancando de
> cero (App Runner está en maintenance mode desde abr-2026 y no acepta cuentas nuevas — ver
> `leccion.md` §2). El flujo es análogo (ECR en vez de Artifact Registry, Secrets Manager en vez
> de Secret Manager). No hagas los dos clouds.

---

## Paso 1 — Imagen al registry del cloud
**Hacer:**
- Creá un repo Docker en **Artifact Registry** (`grounded`, región `europe-west1`).
- `gcloud auth configure-docker europe-west1-docker.pkg.dev`.
- Build + push de `services/api`:
  ```bash
  docker build -t europe-west1-docker.pkg.dev/$PROJECT_ID/grounded/api:latest services/api
  docker push europe-west1-docker.pkg.dev/$PROJECT_ID/grounded/api:latest
  ```

**Verificar:** la imagen aparece en Artifact Registry (consola o `gcloud artifacts docker images
list`). Elegiste **región EU** a propósito (conecta con governance / data residency, §6).

## Paso 2 — Primer deploy en un comando (para iterar rápido)
**Hacer:** antes del Terraform, validá que la imagen *corre* en Cloud Run con el atajo:
```bash
gcloud run deploy grounded-api \
  --image europe-west1-docker.pkg.dev/$PROJECT_ID/grounded/api:latest \
  --region europe-west1 --allow-unauthenticated --port 8080
```
(El secret todavía no — eso es el Paso 4. Si tu app falla sin la key, pasala temporal con `--set-env-vars`
para este smoke, y movela a Secret Manager en el Paso 4.)

**Verificar:** `gcloud` te devuelve una URL `*.run.app`. La abrís/curleás → responde 200. Si da
error de arranque, casi seguro es el puerto: tu app DEBE escuchar en `$PORT` y `0.0.0.0`.

## Paso 3 — Infra como código (Terraform) — EL ENTREGABLE
**Hacer:**
- Creá `infra/main.tf` declarando: el servicio Cloud Run, el secret de Secret Manager, y el IAM de
  acceso público (ver el bloque completo en `leccion.md` §3). Variabilizá `project_id`.
- `cd infra && terraform init && terraform plan` → revisá el diff → `terraform apply`.

**Verificar:** `terraform apply` crea/actualiza el servicio sin error. `terraform plan` corrido de
nuevo dice "No changes" (tu código describe el estado real). El `main.tf` está commiteado.

## Paso 4 — Secrets fuera del repo
**Hacer:**
- El recurso del secret lo creó Terraform; cargá el **valor** una vez:
  ```bash
  echo -n "$OPENAI_API_KEY" | gcloud secrets versions add openai-api-key --data-file=-
  ```
- Confirmá en el Terraform que el servicio inyecta `OPENAI_API_KEY` vía `secret_key_ref` (runtime),
  no como literal. Quitá cualquier `--set-env-vars` con la key del Paso 2.
- `grep` el repo y la imagen: la key NO debe aparecer en ningún archivo ni en el Dockerfile.

**Verificar:** el servicio responde usando la key inyectada. `git grep -i "sk-"` no encuentra nada.
Podés responder "si me filtran la imagen, el secret no está adentro".

## Paso 5 — Self-hosted inference con vLLM + benchmark (ejercicio)
**Hacer (en la GPU prestada, Colab/RunPod):**
- Levantá el server:
  ```bash
  pip install "vllm[bench]"
  vllm serve meta-llama/Llama-3.2-1B-Instruct --host 0.0.0.0 --port 8000 --max-model-len 4096
  ```
- Apuntá un cliente de OpenAI a `http://localhost:8000/v1` (api_key `"EMPTY"`) y verificá que
  responde una pregunta de soporte (ver `leccion.md` §5.2).
- Corré el benchmark a DOS tasas de request y guardá los números:
  ```bash
  vllm bench serve --model meta-llama/Llama-3.2-1B-Instruct --host localhost --port 8000 \
    --dataset-name random --random-input-len 512 --random-output-len 128 \
    --num-prompts 200 --request-rate 1 --percentile-metrics "ttft,tpot,e2el"
  # repetir con --request-rate 10
  ```

**Verificar:** tenés una **tabla** con throughput (req/s y tok/s), TTFT y TPOT para
`request-rate=1` vs `=10`, y una fila comparativa contra la API de OpenAI. El throughput agregado en
tok/s **sube con concurrencia** — podés explicar por qué (continuous batching). Guardá la tabla en
`docs/learnings/M10.md` o en la model card.

## Paso 6 — Governance: model card + ubicación en el EU AI Act
**Hacer:**
- Escribí `docs/MODEL-CARD.md` (1 página) para el sistema RAG completo: detalles del modelo, uso
  previsto + out-of-scope, datos (aislados por tenant), métricas REALES (recall@5, faithfulness,
  tasa de "no sé"), limitaciones y riesgos + mitigaciones. (Estructura en `leccion.md` §6.1.)
- Agregá a `DECISIONS.md` un ADR de governance: en qué categoría de riesgo del EU AI Act cae
  Grounded (**riesgo limitado**), cuál es tu obligación (transparencia), qué NO te aplica y por qué,
  y la distinción deployer-vs-proveedor-de-modelo-base.
- Implementá la transparencia: que la UI deje claro que el usuario habla con una IA.

**Verificar:** la model card cabe en una página y cita TUS números. Podés decir de memoria "soy
riesgo limitado, mi obligación es transparencia, no toco el Anexo III, las obligaciones de GPAI son
del proveedor del modelo base". La UI avisa que es IA.

## Paso 7 — Billing con Stripe (OPCIONAL)
**Hacer (solo si lo encarás):**
- Definí un precio **metered** en Stripe (test mode). Por cada query, reportá un meter event con
  conteo idempotente (no doble-cobro en reintentos). Definí 2-3 tiers.
- ADR: cómo pasás el costo del LLM al usuario (costo por request + margen).

**Verificar:** un uso simulado genera meter events correctos en el dashboard de Stripe; reintentar
el mismo request NO duplica el cargo. Si NO lo hacés: dejá en `DECISIONS.md` la decisión consciente
de diferirlo ("no es señal AI; lo difiero").

## Paso 8 — Capa de defensa (el entregable real)
**Hacer:**
- ADRs en `DECISIONS.md` taggeados `Module: M10`: (a) por qué Cloud Run y no K8s/ECS/Lambda;
  (b) por qué Terraform; (c) governance / AI Act tier; (d) opcional billing.
- Respondé los **defense drills** (`pruebas.md`, capa 2) por escrito, con tus números del benchmark.
- Actualizá `course.json` (status `shipped`, tests, links al deploy de cloud, tabla de benchmark).

**Verificar:** podés explicar cada decisión sin mirar. Recién ahí marcás el gate.

---

## Definición de "hecho" (M10)
✅ Grounded vive en Cloud Run/App Runner vía Terraform, con secret en Secret Manager, en una URL
pública del big-3 · ✅ `terraform plan` dice "No changes" · ✅ corriste vLLM y tenés la tabla de
throughput (1 vs 10 req/s + comparativa OpenAI) · ✅ `MODEL-CARD.md` de 1 página con tus números ·
✅ ADR de EU AI Act (riesgo limitado + transparencia) · ✅ ADRs M10 escritos · ✅ defense drills
respondidos · ✅ `course.json` publicado. → marcás el gate en el panel del módulo.
(Billing Stripe NO es requisito de "hecho" — es opcional.)
