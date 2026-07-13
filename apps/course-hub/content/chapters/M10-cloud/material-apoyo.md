---
module: M10
---

# Material de apoyo — M10

Curado y ordenado. No leas todo: los **★ Core** son obligatorios antes de la práctica; la
**Referencia** se consulta mientras construís; el **Deep dive** es para defender mejor en system
design / governance.

## ★ Core (leé esto antes de tocar código)

1. **Google Cloud — "Deploy to Cloud Run" + "Container runtime contract"**
   `docs.cloud.google.com/run/docs/deploying` y `docs.cloud.google.com/run/docs/container-contract`
   (Google migró su documentación a `docs.cloud.google.com` en 2025-2026; las URLs viejas en
   `cloud.google.com/run/docs` redirigen acá.) El walkthrough oficial de deploy y, crítico, el
   *contract* del contenedor. Buscá: la variable `PORT`, que tenés que escuchar en `0.0.0.0`,
   scaling a cero, y el flag `--allow-unauthenticated`. El error #1 de la primera vez (no escuchar
   en `$PORT`) sale de no leer esto. ~40 min.

2. **AWS — "ECS Express Mode" (recomendado) o "App Runner" (solo si ya tenés cuenta existente)**
   Docs de ECS: `docs.aws.amazon.com/AmazonECS/latest/developerguide/` (buscá "Express Mode").
   App Runner (legacy): `docs.aws.amazon.com/apprunner/latest/dg/getting-started.html`. Anuncio del
   cambio: `aws.amazon.com/about-aws/whats-new/2026/03/aws-service-availability/`.
   (Solo si elegís AWS en vez de GCP.) **App Runner está en maintenance mode desde el 30-abr-2026**
   — AWS dejó de aceptar cuentas nuevas; solo sigue operativo para quien ya lo tenía. Si arrancás
   hoy, la ruta es **ECS Express Mode** (lanzado en re:Invent, nov-2025), que replica la
   simplicidad de App Runner sobre ECS. Buscá: imagen desde ECR, el puerto de escucha, y el
   auto-scaling. ~40 min.

3. **HashiCorp — Terraform "Get Started" (con el provider de tu cloud)**
   `developer.hashicorp.com/terraform/tutorials`
   Buscá: `provider`, `resource`, el ciclo `init → plan → apply → destroy`, y el state. No necesitás
   módulos ni workspaces para M10. ~1h.

4. **vLLM — docs oficiales: "Quickstart" + "OpenAI-Compatible Server"**
   `docs.vllm.ai/en/latest/getting_started/quickstart.html`
   La fuente de verdad para `vllm serve` y para apuntar el cliente de OpenAI a tu server. Buscá:
   `vllm serve`, los endpoints `/v1/chat/completions`, `--max-model-len`. ~30 min.

5. **vLLM — blog "vLLM: Easy, Fast, and Cheap LLM Serving with PagedAttention"** (2023) +
   **"Inside vLLM: Anatomy of a High-Throughput LLM Inference System"** (2025)
   `blog.vllm.ai/2023/06/20/vllm.html` y `vllm.ai/blog/2025-09-05-anatomy-of-vllm`
   El post de 2023 explica PagedAttention y continuous batching con diagramas — **la fuente que
   tenés que poder citar** cuando te preguntan "¿por qué vLLM es rápido?". El post de 2025 lo
   actualiza con lo que vino después (chunked prefill, prefix caching, decoding especulativo):
   leélo si querés defender el estado del arte 2025-2026, no solo el paper original. ~30+20 min.

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
  Mirá qué versión es "latest" hoy (el provider pasó de 5.x a 7.x en 2025-2026) y **pineala** en tu
  `required_providers` (`~> 7.0`) en vez de dejarla flotante.
- **vLLM — "Engine Args"** — `docs.vllm.ai` — flags del servidor (`--max-model-len`,
  `--gpu-memory-utilization`, `--max-num-seqs`) cuando ajustes el benchmark.
- **vLLM — `vllm bench serve`** — la doc de CLI de benchmarking; las métricas TTFT/TPOT/throughput.
- **Stripe — "Usage-based / metered billing"** — `docs.stripe.com/billing/subscriptions/usage-based` —
  (solo si hacés el opcional) meter events e idempotencia.

## Deep dive (opcional, para defender mejor en system design / governance)

- **Kwon et al. — "Efficient Memory Management for Large Language Model Serving with
  PagedAttention"** (SOSP 2023). El paper académico detrás de vLLM. Para cuando te preguntan "¿de
  dónde sale PagedAttention?" — la analogía con la memoria virtual paginada del OS está acá. Sigue
  siendo la cita canónica; combinalo con el post de 2025 (★ Core #5) para lo que vino después
  (chunked prefill, speculative decoding, prefix caching), que el paper de 2023 no cubre. La
  "siguiente capa" sobre PagedAttention en 2025-2026 es cuantización/eviction del KV cache
  (KVQuant, PagedEviction) — no reemplaza el paper, lo extiende; mencionalo si te preguntan qué
  vino después.
- **Mitchell et al. — "Model Cards for Model Reporting"** (FAT* 2019). El paper que define la model
  card. Leé las secciones de una model card; replicá esa estructura para tu sistema RAG. Dato para
  la entrevista: buena parte de lo que este paper proponía como práctica voluntaria, el EU AI Act
  lo convirtió en requisito legal de documentación para proveedores de modelos GPAI (vigente desde
  ago 2025) — la model card dejó de ser "buena práctica" para ser, en la UE, casi un piso legal.
- **Anyscale — "Continuous batching" / "How continuous batching enables 23x throughput"** (blog).
  La mejor explicación visual de static vs continuous batching y por qué el throughput escala con
  concurrencia. Munición directa para el benchmark de §5.3.
- **Comisión Europea — "AI Act" hub** (`digital-strategy.ec.europa.eu`). Resúmenes oficiales del
  timeline escalonado y las obligaciones de GPAI. Para el matiz "deployer vs proveedor del modelo".
  Para el timeline actualizado post-jun-2026 (Parlamento 16-jun, Consejo 29-jun: aplazamiento del
  high-risk a dic-2027/ago-2028, transparencia Art. 50 SIN cambios en ago-2026), buscá "Digital
  Omnibus on AI" — cambió el calendario que este módulo cita en §6.2.
- **Chip Huyen — "AI Engineering"** (O'Reilly, 2025). Los capítulos de *inference optimization* y
  *deployment* dan el marco de costo/latencia/throughput. La autoridad cuando te preguntan "¿de
  dónde sacaste esto?". Sigue vigente sin revisión; no hay segunda edición al día de hoy.

## Cómo usar este material

Leé los ★ Core de cloud + Terraform → hacé el deploy real (`practica.md` pasos 1-4) ANTES de tocar
vLLM, porque el deploy es el entregable y vLLM es el ejercicio. Para vLLM, leé el blog de
PagedAttention *antes* de correr el server: si no podés explicar PagedAttention y continuous
batching sin mirar, el benchmark es un número sin historia. Para governance, leé la taxonomía de
riesgo del AI Act y escribí *vos* dónde cae Grounded — esa frase es la que rendís en la entrevista.
