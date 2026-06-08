---
module: M10
---

# Criterios de defensa — M10

Al terminar M10 tenés que poder, en el nivel honesto indicado:

## Managed cloud deploy (el entregable real)

- **(can-build)** Deployar Grounded desde cero a un big-3 (Cloud Run *o* App Runner): build → push
  al registry del cloud → servicio corriendo → URL pública con TLS. Sin copiar de un tutorial.
- **(can-build)** Escribir la infra como código (Terraform): declarar el servicio, el secret y el
  IAM, y aplicarla de forma que `terraform plan` quede idempotente ("No changes").
- **(can-defend)** Por qué elegiste Cloud Run/App Runner y NO Kubernetes (GKE/EKS) ni ECS ni
  Lambda — y qué te haría cambiar de opinión (workloads stateful, control fino de scheduling).
- **(can-defend)** Dónde viven tus secrets en producción y qué pasa si te filtran la imagen Docker
  (nada crítico: el secret se inyecta en runtime, no está en la imagen).
- **(can-defend)** Por qué IaC en vez de clickear la consola (reproducible, revisable, reversible,
  defendible) y por qué elegiste la región EU (data residency, conecta con governance).
- **(can-explain)** Networking básico de tu deploy: ingress (público vs IAM), TLS gestionado,
  egress a OpenAI. Qué decisión de cada uno tomaste y por qué.

## Self-hosted inference (ejercicio de aprendizaje — claim honesto)

- **(can-explain)** Qué hace vLLM y por qué es más rápido que un loop naive de `model.generate()`:
  **PagedAttention** (KV cache paginado como la memoria virtual del OS → casi cero desperdicio de
  VRAM + bloques compartibles) y **continuous batching** (libera el slot del batch apenas una
  secuencia termina → la GPU nunca espera).
- **(can-build)** Levantar el server de vLLM (`vllm serve`), apuntar un cliente OpenAI-compatible, y
  correr el benchmark (`vllm bench serve`) reportando throughput, TTFT y TPOT.
- **(can-defend)** Tus números: por qué el throughput agregado en tok/s sube con concurrencia y la
  latencia por request casi no se degrada (la firma del continuous batching). Comparativa vs OpenAI.
- **(can-defend)** El claim honesto: "entiendo y corrí inference optimization en una GPU prestada y
  medí throughput", NO "opero un cluster GPU en producción". Saber dónde termina tu claim *es* parte
  de la defensa.
- **(awareness)** Que tu app es OpenAI-compatible end-to-end, así que swap OpenAI ↔ vLLM ↔
  Bedrock/Vertex es de configuración (`base_url`) — model portability por diseño.

## Governance

- **(can-build)** Una model card de 1 página para el sistema RAG completo, con TUS métricas reales
  (recall@5, faithfulness, tasa de "no sé"), uso previsto + out-of-scope, y riesgos + mitigaciones.
- **(can-defend)** En qué categoría de riesgo del EU AI Act cae Grounded (**riesgo limitado**), cuál
  es la obligación concreta (transparencia: avisar que es IA), qué NO te aplica (Anexo III /
  high-risk) y por qué.
- **(can-explain)** La distinción deployer-de-sistema vs proveedor-de-modelo-base (las obligaciones
  de GPAI son de OpenAI/Meta, no tuyas) y que el timeline del Act es escalonado.

## Billing (opcional)

- **(awareness / can-explain)** Cómo le pasarías el costo del LLM al usuario con metered billing de
  Stripe (meter events, idempotencia, tiers) — o por qué lo diferís conscientemente como plumbing de
  baja señal AI.
