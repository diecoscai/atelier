---
module: M10
---

# Material de apoyo — M10

Curado y ordenado. No leas todo: los **★ Core** son obligatorios antes de la práctica; la
**Referencia** se consulta mientras construís; el **Deep dive** es para defender mejor en system
design / governance.

## ★ Core (leé esto antes de tocar código)

1. **Google Cloud — "Deploy to Cloud Run" + "Container runtime contract"**
   `cloud.google.com/run/docs/deploying` y `cloud.google.com/run/docs/container-contract`
   El walkthrough oficial de deploy y, crítico, el *contract* del contenedor. Buscá: la variable
   `PORT`, que tenés que escuchar en `0.0.0.0`, scaling a cero, y el flag `--allow-unauthenticated`.
   El error #1 de la primera vez (no escuchar en `$PORT`) sale de no leer esto. ~40 min.

2. **AWS — "App Runner: deploy from a container image"**
   `docs.aws.amazon.com/apprunner/latest/dg/getting-started.html`
   (Solo si elegís AWS en vez de GCP.) El equivalente de Cloud Run en AWS. Buscá: imagen desde ECR,
   el puerto de escucha, y el auto-scaling. ~40 min.

3. **HashiCorp — Terraform "Get Started" (con el provider de tu cloud)**
   `developer.hashicorp.com/terraform/tutorials`
   Buscá: `provider`, `resource`, el ciclo `init → plan → apply → destroy`, y el state. No necesitás
   módulos ni workspaces para M10. ~1h.

4. **vLLM — docs oficiales: "Quickstart" + "OpenAI-Compatible Server"**
   `docs.vllm.ai/en/latest/getting_started/quickstart.html`
   La fuente de verdad para `vllm serve` y para apuntar el cliente de OpenAI a tu server. Buscá:
   `vllm serve`, los endpoints `/v1/chat/completions`, `--max-model-len`. ~30 min.

5. **vLLM — blog "vLLM: Easy, Fast, and Cheap LLM Serving with PagedAttention"**
   `blog.vllm.ai/2023/06/20/vllm.html`
   El post original que explica PagedAttention y continuous batching con diagramas. **Esta es la
   fuente que tenés que poder citar** cuando te preguntan "¿por qué vLLM es rápido?". ~30 min.

6. **EU AI Act — texto oficial + explorador interactivo**
   Texto oficial: `eur-lex.europa.eu` (Reglamento UE 2024/1689). Explorador navegable:
   `artificialintelligenceact.eu`.
   Buscá: los cuatro niveles de riesgo (prohibido / alto / limitado / mínimo), la obligación de
   transparencia para chatbots (riesgo limitado), y el Anexo III (lista de high-risk). No leas las
   400 páginas — leé la taxonomía de riesgo y la sección de transparencia. ~45 min.

## Referencia (tené a mano mientras construís)

- **GCP — Artifact Registry** — `cloud.google.com/artifact-registry/docs` — crear el repo Docker y
  el `gcloud auth configure-docker`.
- **GCP — Secret Manager + Cloud Run** — `cloud.google.com/run/docs/configuring/services/secrets` —
  cómo inyectar un secret como env var en runtime (lo que hace el `value_source` del Terraform).
- **Terraform — Google provider, recurso `google_cloud_run_v2_service`** —
  `registry.terraform.io/providers/hashicorp/google/latest/docs` — los campos exactos del recurso.
- **vLLM — "Engine Args"** — `docs.vllm.ai` — flags del servidor (`--max-model-len`,
  `--gpu-memory-utilization`, `--max-num-seqs`) cuando ajustes el benchmark.
- **vLLM — `vllm bench serve`** — la doc de CLI de benchmarking; las métricas TTFT/TPOT/throughput.
- **Stripe — "Usage-based / metered billing"** — `docs.stripe.com/billing/subscriptions/usage-based` —
  (solo si hacés el opcional) meter events e idempotencia.

## Deep dive (opcional, para defender mejor en system design / governance)

- **Kwon et al. — "Efficient Memory Management for Large Language Model Serving with
  PagedAttention"** (SOSP 2023). El paper académico detrás de vLLM. Para cuando te preguntan "¿de
  dónde sale PagedAttention?" — la analogía con la memoria virtual paginada del OS está acá.
- **Mitchell et al. — "Model Cards for Model Reporting"** (FAT* 2019). El paper que define la model
  card. Leé las secciones de una model card; replicá esa estructura para tu sistema RAG.
- **Anyscale — "Continuous batching" / "How continuous batching enables 23x throughput"** (blog).
  La mejor explicación visual de static vs continuous batching y por qué el throughput escala con
  concurrencia. Munición directa para el benchmark de §5.3.
- **Comisión Europea — "AI Act" hub** (`digital-strategy.ec.europa.eu`). Resúmenes oficiales del
  timeline escalonado y las obligaciones de GPAI. Para el matiz "deployer vs proveedor del modelo".
- **Chip Huyen — "AI Engineering"** (O'Reilly, 2025). Los capítulos de *inference optimization* y
  *deployment* dan el marco de costo/latencia/throughput. La autoridad cuando te preguntan "¿de
  dónde sacaste esto?".

## Cómo usar este material

Leé los ★ Core de cloud + Terraform → hacé el deploy real (`practica.md` pasos 1-4) ANTES de tocar
vLLM, porque el deploy es el entregable y vLLM es el ejercicio. Para vLLM, leé el blog de
PagedAttention *antes* de correr el server: si no podés explicar PagedAttention y continuous
batching sin mirar, el benchmark es un número sin historia. Para governance, leé la taxonomía de
riesgo del AI Act y escribí *vos* dónde cae Grounded — esa frase es la que rendís en la entrevista.
