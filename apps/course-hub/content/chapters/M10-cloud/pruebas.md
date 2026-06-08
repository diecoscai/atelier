---
module: M10
gate: pending
---

# Pruebas — M10

## Capa 1 — tests automatizados (prueban que *funciona*)

- [ ] **Smoke del deploy managed:** la URL pública del big-3 (`*.run.app` / `*.awsapprunner.com`)
      responde 200 a un health-check y completa el flujo RAG (upload → query → respuesta con cita).
      Un test que curlea la URL de prod y asierta status + que la respuesta cita un chunk.
- [ ] **IaC idempotente:** `terraform plan` sobre la infra desplegada devuelve "No changes" — el
      código describe el estado real (no hay drift).
- [ ] **Secret fuera del repo:** `git grep -iE "sk-[A-Za-z0-9]"` (y el contenido de la imagen) no
      contiene la API key. El servicio en prod responde usando la key inyectada desde Secret Manager.
- [ ] **Benchmark de vLLM corre y reporta throughput:** `vllm bench serve` completa y emite una
      tabla con throughput (req/s y tok/s), TTFT y TPOT, para `request-rate=1` y `request-rate=10`.
      El número agregado de tok/s a rate=10 es mayor que a rate=1 (evidencia de continuous batching).
- [ ] **Transparencia (AI Act):** la UI muestra de forma visible que el usuario habla con una IA.
- [ ] *(Opcional, si hiciste billing)* reportar un meter event dos veces con la misma idempotency
      key produce UN solo cargo en Stripe (test mode).

## Capa 2 — defense drills (el HARD GATE)

> No se avanza (M10 es track Extended; esto cierra el módulo) hasta responder esto **por escrito,
> con tus propios números y decisiones**. Claude puede hacer de interviewer.

1. **"¿Cómo lo deployás en producción, a escala, a un cloud de verdad?"** — Walkthrough end-to-end:
   imagen → Artifact Registry/ECR → Cloud Run/App Runner vía Terraform → secret en Secret Manager →
   URL con TLS → scaling 0→N. Mostrá el `main.tf`, no lo cuentes de memoria.

2. **"¿Por qué Cloud Run y no Kubernetes / ECS / Lambda?"** — Defendé serverless-de-contenedor para
   un servicio web stateless (90% del valor, 10% del trabajo operativo de K8s). Nombrá qué te
   obligaría a moverte a K8s (stateful, scheduling fino, service mesh). Es un ADR.

3. **"¿Dónde están tus secrets y qué pasa si te filtran la imagen Docker?"** — Secret Manager,
   inyectado en runtime; la imagen no contiene la key; filtrarla no compromete el secret.

4. **"¿Cómo servís el modelo sin OpenAI?"** — vLLM OpenAI-compatible: cambiás el `base_url`, tu app
   no se entera. Y la opción managed (Bedrock/Vertex) para data residency sin operar GPUs.

5. **"¿Qué hace vLLM y por qué es más rápido?"** — PagedAttention (KV cache paginado como la memoria
   virtual del OS → casi cero desperdicio de VRAM, bloques compartibles) + continuous batching
   (libera el slot apenas una secuencia termina → la GPU no espera). Citá el blog de vLLM.

6. **"Medí tu throughput. ¿Qué te dio y por qué sube con concurrencia?"** — Tus números reales
   (rate=1 vs rate=10) y la explicación: continuous batching mantiene la GPU saturada. Encuadre
   honesto: lo corriste en una GPU prestada, no operás un cluster.

7. **"¿Qué te exige el EU AI Act y en qué categoría caés?"** — Riesgo **limitado** (chatbot de
   soporte) → obligación de **transparencia**. NO sos high-risk (Anexo III). Sos deployer de un
   sistema, no proveedor del modelo base → las obligaciones de GPAI no son tuyas. Timeline escalonado.

8. **"Mostrame tu model card y cómo le pasarías el costo del LLM al usuario."** — La model card de 1
   página con tus métricas; y (opcional) metered billing con Stripe + idempotencia, o la decisión
   consciente de diferirlo.

**Gate:** marcalo como pasado en el panel del módulo cuando (a) la capa 1 está verde en Grounded
(deploy managed vivo + benchmark con números + model card escrita) y (b) escribiste tus respuestas a
la capa 2.
