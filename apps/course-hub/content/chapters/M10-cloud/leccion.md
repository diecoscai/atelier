---
module: M10
title: Managed cloud deploy + self-hosted inference + governance
concept: Contenedores en un big-3 con IaC, inference optimization con vLLM, y governance (model card + EU AI Act)
duration: ~8-10h lectura + 1-2 findes de práctica
---

# M10 — Sacarlo del PaaS, servirlo vos mismo, y poder rendir cuentas

> **Qué vas a saber al terminar esta lección:** mover tu deploy de un PaaS (Railway/Fly) a un
> cloud de los grandes (GCP Cloud Run o AWS App Runner) con infraestructura-como-código, explicar
> por qué eso importa para un rol de AI Engineer, correr tu *propio* servidor de inferencia con
> vLLM y medir cuánto throughput te da vs la API de OpenAI, y producir los dos artefactos de
> governance que un producto EU-facing necesita (model card + dónde caés en el EU AI Act). La
> práctica (`practica.md`) construye el deploy real; el vLLM y la governance son ejercicios de
> aprendizaje enmarcados con honestidad.

---

## 0. El encuadre honesto (leé esto primero)

Este módulo tiene tres piezas con **tres niveles de claim distintos**. Confundirlos en una
entrevista te quema:

| Pieza | Qué construís | Qué podés decir | Qué NO podés decir |
|---|---|---|---|
| **Managed cloud deploy** | Deploy REAL de Grounded a Cloud Run/App Runner con IaC | "Deployé y operé el sistema en GCP/AWS con Terraform" | — (esto sí lo hacés de verdad) |
| **vLLM self-hosted** | Servir un modelo en GPU prestada (Colab/RunPod) + benchmark | "Entiendo y corrí inference optimization; medí throughput vs la API" | "Opero un cluster GPU en producción" |
| **Governance** | Model card de 1 página + ubicarte en el EU AI Act | "Sé qué governance exige un producto EU-facing y produje los artefactos" | "Soy abogado de compliance" |

La trampa del portfolio es inflar el claim del medio. El que dice "tengo experiencia con GPU en
prod" y no puede explicar cómo escala un cluster, pierde credibilidad en 30 segundos. El que dice
"corrí vLLM en una T4 prestada, medí 4x el throughput de batch vs requests sueltos, y entiendo
*por qué*" gana credibilidad — porque es exacto. **Precisión > tamaño del claim.** Todo este
módulo se trata de decir la verdad con confianza.

---

## 1. El problema: "managed cloud" es un gap que un YAML no cierra

Hasta M9 tu deploy vive en un PaaS (Railway/Fly). Un PaaS es excelente: le das un Dockerfile o un
repo y te abstrae todo — networking, TLS, scaling, secrets. Por eso lo usamos desde M0. El
problema no es técnico, es de **señal de contratación**.

Cerca de **un cuarto de los job descriptions** de AI/ML Engineer piden experiencia con *uno de los
big-3* (AWS, GCP, Azure) por nombre. No "sabés deployar"; piden "AWS" o "GCP". Un PaaS no cuenta
para ese filtro de keywords, y — más importante — no te enseña el modelo mental que el big-3 te
obliga a tener: **vos sos responsable de la infra**. El PaaS toma decisiones por vos (qué región,
qué red, cómo se inyectan los secrets); en GCP/AWS esas decisiones son tuyas y tenés que poder
defenderlas.

Hay dos formas malas de "tapar" este gap y una buena:

| Forma | Qué es | Por qué |
|---|---|---|
| **Pegar un `cloudbuild.yaml` de ejemplo en el README** | Copiar config que nunca corriste | ❌ Mentira de portfolio. El entrevistador pregunta "¿qué región? ¿cómo inyectás el secret?" y no tenés respuesta. |
| **Un curso de certificación AWS** | Estudiar para el examen | ⚠️ Conocimiento sin artefacto. Sabés trivia, no tenés un deploy que mostrar. |
| **Deployar Grounded de verdad a UN big-3 con IaC** ✅ | Mover el sistema real, escribir la infra como código | El artefacto *es* la evidencia. Podés mostrar el Terraform, el deploy vivo, y defender cada decisión. |

**Elegimos uno solo** (GCP Cloud Run *o* AWS App Runner), no los tres. Aprender un big-3 a fondo
vale más que tres a nivel superficial, y los conceptos transfieren. Esto es un ADR
(`ADR-0X0: por qué Cloud Run y no ECS/Lambda/App Runner`).

> **Checkpoint:** ¿por qué no alcanza con tener el deploy en Railway y decir "deployé a la nube"?
> Porque "managed cloud" en una JD significa big-3 por nombre, y porque el PaaS te oculta
> justamente las decisiones (red, secrets, región, scaling) que un AI Engineer tiene que poder
> tomar y defender. El gap no es de capacidad, es de *evidencia de responsabilidad sobre la infra*.

---

## 2. Contenedores: por qué tu deploy ya es portable (y qué cambia)

Buena noticia: desde M0 empaquetás con **Docker**, así que el *artefacto* (la imagen) ya es
portable. Un contenedor es tu app + sus dependencias + el runtime, congelados en una imagen que
corre igual en tu laptop, en Railway, o en GCP. Eso es precisamente lo que hace que esta migración
sea de *plomería*, no de reescritura.

Lo que cambia al pasar a un big-3 no es la imagen, es **dónde y cómo la corrés**:

- **Registry:** la imagen tiene que vivir en un registry que el cloud lea. En GCP es **Artifact
  Registry**; en AWS es **ECR**. (Antes empujabas a Docker Hub o al registry del PaaS.)
- **Runtime de contenedor:** quién corre la imagen. Las opciones serverless-de-contenedor son las
  que querés — pagás por uso, escalan a cero, sin gestionar VMs:
  - **GCP Cloud Run** — corré un contenedor que escucha en un puerto HTTP; Google maneja todo lo
    demás (scaling 0→N, TLS, balanceo). Es el "Railway de GCP" pero es GCP de verdad.
  - **AWS App Runner** — el equivalente de AWS: dale una imagen de ECR, escucha un puerto, escala
    solo. (ECS/Fargate es el primo más configurable y más laborioso; App Runner es el atajo
    correcto para esto.)

**Por qué serverless-de-contenedor y no Kubernetes (GKE/EKS):** K8s es la respuesta a un problema
que no tenés. Te da control total sobre orquestación, pero a cambio de operar un cluster (nodos,
upgrades, networking, IAM). Para un servicio web stateless que escala con el tráfico, Cloud Run/App
Runner te dan el 90% del valor con el 10% del trabajo operativo. Saber *cuándo* K8s es over-kill
(y poder nombrar qué te obligaría a moverte a él: workloads stateful, control fino de
scheduling, multi-servicio con service mesh) es exactamente la madurez que se evalúa. Esto es otro
ADR.

> **Checkpoint:** tu imagen de Docker no cambia entre Railway y Cloud Run. ¿Qué tres cosas sí
> cambian? Dónde vive la imagen (Artifact Registry/ECR), quién la corre (Cloud Run/App Runner), y
> cómo le llegan los secrets y la config (Secret Manager + variables de entorno gestionadas por el
> cloud, no un `.env` en el repo).

### El Dockerfile (lo que ya tenés, revisado para Cloud Run)

Cloud Run requiere que tu contenedor **escuche en el puerto que le pasa por la variable `PORT`**
(default 8080) y en `0.0.0.0`. Si tu FastAPI escucha en un puerto hardcodeado o en `127.0.0.1`, el
deploy arranca y muere. Este es el error #1 de la primera vez:

```dockerfile
# services/api/Dockerfile
FROM python:3.11-slim

# uv para instalar deps rápido y reproducible
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

COPY . .

# Cloud Run inyecta $PORT (default 8080). Escuchá ahí y en 0.0.0.0, no en 127.0.0.1.
ENV PORT=8080
EXPOSE 8080
CMD ["sh", "-c", "uv run uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
```

---

## 3. IaC: por qué la infra tiene que ser código

Podés crear todo esto clickeando en la consola de GCP. **No lo hagas.** Lo que clickeás no podés
revisar, versionar, ni reproducir — y no podés mostrarlo en una entrevista. **Infrastructure as
Code (IaC)** es declarar tu infra en archivos versionados: el estado deseado del mundo, en Git.

La herramienta canónica multi-cloud es **Terraform** (HashiCorp). Declarás *recursos* (un servicio
Cloud Run, un secret, un repo de Artifact Registry) y Terraform calcula el diff entre lo que
declaraste y lo que existe, y lo aplica. Por qué importa para vos:

- **Reproducible y revisable:** la infra entra a code review como cualquier cambio. Un hiring
  manager que ve Terraform en tu repo lee "esta persona piensa la infra como software".
- **Defendible:** "¿cómo está configurado tu deploy?" → señalás el archivo, no tu memoria.
- **Reversible:** `terraform destroy` apaga todo (clave para no quemar créditos del free tier).

IaC mínimo de verdad — no necesitás módulos ni workspaces. Un `main.tf` que declara: el servicio,
el secret, y el permiso de acceso público. Esto es Cloud Run:

```hcl
# infra/main.tf
provider "google" {
  project = var.project_id
  region  = "europe-west1"   # EU: decisión deliberada, ver §6 (governance / data residency)
}

# El secret (la API key) vive en Secret Manager, NUNCA en el repo ni en el Dockerfile.
resource "google_secret_manager_secret" "openai_key" {
  secret_id = "openai-api-key"
  replication { auto {} }
}

resource "google_cloud_run_v2_service" "grounded_api" {
  name     = "grounded-api"
  location = "europe-west1"

  template {
    containers {
      image = "europe-west1-docker.pkg.dev/${var.project_id}/grounded/api:latest"
      ports { container_port = 8080 }

      # El secret se inyecta como env var EN RUNTIME desde Secret Manager.
      env {
        name = "OPENAI_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.openai_key.secret_id
            version = "latest"
          }
        }
      }
    }
    scaling {
      min_instance_count = 0   # escala a cero = no pagás cuando no hay tráfico
      max_instance_count = 4   # techo: protegés el bolsillo y el rate-limit de OpenAI
    }
  }
}

# Hacer el servicio público (sin esto, 403). Decisión consciente: ¿público o detrás de auth?
resource "google_cloud_run_v2_service_iam_member" "public" {
  name     = google_cloud_run_v2_service.grounded_api.name
  location = google_cloud_run_v2_service.grounded_api.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}
```

El comando de deploy de punta a punta:

```bash
# 1. Build + push de la imagen al Artifact Registry
gcloud auth configure-docker europe-west1-docker.pkg.dev
docker build -t europe-west1-docker.pkg.dev/$PROJECT_ID/grounded/api:latest services/api
docker push europe-west1-docker.pkg.dev/$PROJECT_ID/grounded/api:latest

# 2. Cargar el valor del secret UNA vez (el recurso lo crea Terraform; el VALOR lo cargás vos)
echo -n "$OPENAI_API_KEY" | gcloud secrets versions add openai-api-key --data-file=-

# 3. Aplicar la infra
cd infra && terraform init && terraform apply

# 4. Obtener la URL pública
gcloud run services describe grounded-api --region europe-west1 --format='value(status.url)'
```

> **Atajo alternativo sin Terraform:** `gcloud run deploy grounded-api --source services/api
> --region europe-west1 --allow-unauthenticated --set-secrets OPENAI_API_KEY=openai-api-key:latest`
> deploya en un comando (build incluido). **Úsalo para tu primer deploy y para iterar**, pero el
> entregable defendible es el Terraform: el `gcloud run deploy` no queda versionado ni revisable.
> Un comando demuestra que podés; el Terraform demuestra que pensás la infra como software.

---

## 4. Secrets y networking básico (lo que el PaaS te ocultaba)

**Secrets.** Regla absoluta, válida desde M0 y obligatoria acá: **la API key nunca toca el repo ni
la imagen**. En el big-3 vive en un gestor de secrets (**GCP Secret Manager** / **AWS Secrets
Manager**) y se inyecta como variable de entorno *en runtime*. La imagen no contiene el secret; el
runtime se lo da cuando arranca. Por eso en el Terraform el secret es un `value_source` /
`secret_key_ref`, no un valor literal. Si alguien roba tu imagen, no tiene tu key.

**Networking básico.** Tres cosas que tenés que poder explicar (no configurar a fondo — ese no es
tu rol):

- **Ingress / quién puede llamar tu servicio.** En Cloud Run, `allUsers` con `run.invoker` = público.
  Quitarlo = solo identidades autenticadas (IAM) pueden invocarlo. La decisión "¿lo dejo público o
  detrás de auth?" es tuya y deliberada — para Grounded el frontend lo llama, así que o es público
  con auth a nivel app (tu JWT de M4) o lo ponés detrás de un balanceador.
- **TLS.** Cloud Run/App Runner te dan HTTPS gratis en el dominio `*.run.app` / `*.awsapprunner.com`.
  No gestionás certificados (eso sí te lo abstraen). Dominio propio = mapeo + cert gestionado.
- **Egress.** Tu contenedor sale a internet (a OpenAI) por default. Salir por una IP fija
  (para allow-lists) requiere un VPC connector / NAT — awareness, no lo hacés acá.

> **Checkpoint:** ¿dónde está tu `OPENAI_API_KEY` en producción y cómo llega a tu app? En Secret
> Manager (no en el repo, no en la imagen). Llega como variable de entorno inyectada en runtime por
> el cloud, referenciada por el Terraform. Si te preguntan "¿qué pasa si te filtran la imagen Docker?":
> nada crítico — el secret no está adentro.

---

## 5. Self-hosted inference con vLLM (el graft de GPU)

Hasta acá tu LLM de generación es la API de OpenAI. Funciona, pero hay tres razones reales para
querer servir tu *propio* modelo: **costo** a volumen alto, **data residency / privacidad** (los
datos no salen de tu infra), y **control** (modelo fine-tuneado, latencia predecible). Vos no vas a
operar esto en prod — pero tenés que *entender* cómo se hace y haber medido la diferencia, porque
"¿cómo lo servirías sin OpenAI?" es una pregunta de entrevista frecuentísima.

### 5.1 Qué hace vLLM (y por qué es rápido)

Servir un LLM no es "cargar el modelo y llamarlo". El cuello de botella es la memoria de la GPU,
específicamente el **KV cache**: por cada token generado, el modelo guarda los vectores Key/Value
de la atención para no recomputarlos. Ese cache crece con la longitud de la secuencia y se come la
VRAM. **vLLM** es un servidor de inferencia open-source (de Berkeley) que ataca esto con dos ideas:

- **PagedAttention.** Los servidores naive reservan un bloque *contiguo* de memoria para el KV cache
  de cada secuencia, dimensionado al *peor caso* (la longitud máxima). Resultado: la mayoría de ese
  bloque queda vacío y desperdiciado (fragmentación interna/externa) — a veces >60% de la VRAM tirada.
  PagedAttention toma la idea de la **memoria virtual paginada de los sistemas operativos**: parte el
  KV cache en *bloques* de tamaño fijo no necesariamente contiguos, y una "page table" mapea la
  secuencia lógica a esos bloques físicos. Casi cero desperdicio (<4%), y los bloques se pueden
  *compartir* entre secuencias (ej. mismo prompt de sistema → mismo bloque). Más VRAM aprovechada =
  más secuencias en vuelo a la vez = más throughput.

- **Continuous batching.** El batching naive ("static batching") agrupa N requests, espera a que
  *todos* terminen, y recién ahí toma el próximo batch — los requests cortos esperan a los largos, la
  GPU queda ociosa. El continuous batching (a.k.a. *in-flight batching*) trabaja a nivel de *iteración*:
  apenas una secuencia termina, su lugar en el batch se libera y entra una nueva *inmediatamente*. La
  GPU nunca espera. Esto es lo que da el salto grande de throughput bajo carga concurrente.

Juntos: PagedAttention libera VRAM para meter más secuencias, y continuous batching las mantiene
todas trabajando. Por eso vLLM rinde mucho más que un loop ingenuo de `model.generate()`.

### 5.2 Arrancar el servidor

vLLM expone un servidor **compatible con la API de OpenAI** — el truco que hace que tu código no
cambie: apuntás el mismo cliente de OpenAI a tu `localhost` en vez de a `api.openai.com`.

```bash
# En la GPU prestada (Colab T4 / RunPod). Modelo chico que entra en una T4 (~16GB).
pip install vllm

vllm serve meta-llama/Llama-3.2-1B-Instruct \
  --host 0.0.0.0 --port 8000 \
  --max-model-len 4096
# Expone /v1/chat/completions y /v1/completions, idéntico a OpenAI.
```

```python
# Tu código de Grounded NO cambia: solo el base_url y el api_key dummy.
from openai import OpenAI
client = OpenAI(base_url="http://localhost:8000/v1", api_key="EMPTY")

resp = client.chat.completions.create(
    model="meta-llama/Llama-3.2-1B-Instruct",
    messages=[{"role": "user", "content": "¿Cómo reseteo mi contraseña?"}],
)
print(resp.choices[0].message.content)
```

> **Checkpoint:** ¿por qué que vLLM sea "OpenAI-compatible" es más que una comodidad? Porque
> significa que tu capa de aplicación no sabe ni le importa quién sirve el modelo. Eso *es* model
> portability: cambiás OpenAI ↔ vLLM ↔ (más adelante) Bedrock/Vertex tocando un `base_url`. Tu
> arquitectura ya está desacoplada del proveedor — ese desacople es lo defendible.

### 5.3 El benchmark (el entregable medible)

No alcanza con "lo corrí". Tenés que **medir** y reportar throughput. vLLM trae su propio
benchmark de serving:

```bash
pip install vllm[bench]

vllm bench serve \
  --model meta-llama/Llama-3.2-1B-Instruct \
  --host localhost --port 8000 \
  --dataset-name random \
  --random-input-len 512 --random-output-len 128 \
  --num-prompts 200 \
  --request-rate 10 \
  --percentile-metrics "ttft,tpot,e2el"
```

Las métricas que importan y qué significan:

| Métrica | Qué mide | Por qué importa |
|---|---|---|
| **Throughput (req/s)** | Requests completados por segundo | La capacidad bruta. Sube con concurrencia gracias a continuous batching. |
| **Output throughput (tok/s)** | Tokens generados por segundo (agregado) | La métrica honesta de "cuánto trabajo hace la GPU". |
| **TTFT** (time-to-first-token) | Latencia hasta el primer token | UX del streaming. La pieza de M7 (TTFT) reaparece acá. |
| **TPOT** (time-per-output-token) | Tiempo medio entre tokens | Qué tan fluido sale el stream. |

**El experimento que importa:** corré el benchmark a `--request-rate 1` (un request a la vez,
secuencial) y a `--request-rate 10+` (concurrente). Vas a ver que el throughput agregado en
tokens/s **sube mucho con concurrencia** mientras la latencia por request casi no se degrada — esa
es la firma del continuous batching. Compará ese número contra la API de OpenAI (que tiene su
propio throughput pero vos no controlás el batching ni la VRAM). **Tu entregable es esa tabla
comparativa**, no un "anduvo".

> Esto NO prueba que vLLM "le gana" a OpenAI — son cosas distintas (un modelo de 1B en una T4 vs
> GPT-4o en la infra de OpenAI). Lo que prueba es que **entendés y sabés medir** las palancas de
> inference optimization. Ese es el claim honesto.

---

## 6. Governance: model card + EU AI Act

Si Grounded apunta a clientes en la UE (es soporte B2B, muchos lo serán), no alcanza con que
funcione: tenés que poder **rendir cuentas** de qué hace tu IA, con qué datos, y qué riesgos tiene.
Dos artefactos cubren el 80% de eso a tu escala.

### 6.1 Model card (1 página)

Concepto de Mitchell et al. (Google, "Model Cards for Model Reporting", 2019): una ficha estándar
y corta que documenta un modelo para que terceros — y tu yo futuro — sepan qué hace, en qué
condiciones, y dónde *no* confiar en él. No es un paper, es una página. Para Grounded documenta el
**sistema RAG completo**, no solo el LLM base. Secciones:

- **Detalles del modelo/sistema:** qué LLM (GPT-4o-mini / tu vLLM), qué embeddings
  (`text-embedding-3-small`), reranker, versión, fecha.
- **Uso previsto:** responder preguntas de soporte de clientes B2B sobre la documentación *del
  tenant*, con citas. **Out of scope:** asesoramiento legal/médico/financiero, decisiones
  automatizadas sobre personas.
- **Datos:** documentación que sube cada tenant (aislada por `tenant_id`, M4). No se entrena con
  datos del cliente.
- **Métricas:** las de *tu* sistema — recall@5 (M3), groundedness/faithfulness (M2), tasa de "no sé"
  calibrado (M4). Números reales, no genéricos.
- **Limitaciones y riesgos:** alucinación residual; sesgo del modelo base; degradación con docs mal
  parseados; "no sabe lo que no se ingestó". Mitigaciones: citas obligatorias, "no sé" calibrado,
  aislamiento de tenants.

El valor: cuando un cliente enterprise o su equipo de compliance pregunta "¿qué hace exactamente su
IA y qué garantías dan?", tenés *una página* que responde. Y en una entrevista, mostrar una model
card señala que pensás en producto y riesgo, no solo en código.

### 6.2 EU AI Act: dónde caés y por qué importa

El **EU AI Act** (Reglamento UE 2024/1689) es la primera ley horizontal de IA del mundo. Aplica si
ponés un sistema de IA en el mercado de la UE *o si su output se usa en la UE* — extraterritorial,
como el GDPR. Clasifica por **riesgo**, no por tecnología, en cuatro niveles:

| Nivel de riesgo | Qué cae acá | Régimen |
|---|---|---|
| **Inaceptable (prohibido)** | Social scoring estatal, manipulación subliminal, scraping masivo de caras, real-time biometric ID en espacios públicos (con excepciones) | **Prohibido.** Aplica desde feb 2025. |
| **Alto riesgo** | IA en infraestructura crítica, educación, empleo/RRHH (filtrar CVs), crédito, justicia, biometría | Permitido con **obligaciones fuertes**: gestión de riesgo, calidad de datos, documentación técnica, supervisión humana, registro, evaluación de conformidad. |
| **Riesgo limitado** | Chatbots, sistemas que interactúan con personas, contenido generado por IA | **Obligación de transparencia:** el usuario tiene que *saber que habla con una IA* y el contenido generado debe ser identificable. |
| **Riesgo mínimo** | El resto (filtros de spam, IA en videojuegos) | Sin obligaciones específicas; códigos de conducta voluntarios. |

**Dónde cae Grounded:** un bot de soporte que responde preguntas es **riesgo limitado**. Tu
obligación concreta es **transparencia**: el usuario tiene que saber que está hablando con un
sistema de IA (no esconderlo detrás de un nombre humano), y idealmente que las respuestas son
generadas. *No* sos high-risk — no decidís sobre crédito, empleo, ni nada del Anexo III. **Saber
articular esto exacto** ("soy riesgo limitado, mi obligación es transparencia, esto es lo que NO me
aplica y por qué") es la respuesta que separa awareness real de pánico regulatorio.

Dos matices que suman puntos:
- **GPAI (modelos de propósito general).** Hay obligaciones separadas para *proveedores* de modelos
  base (OpenAI, Meta). Vos sos *deployer/proveedor de un sistema downstream*, no proveedor del
  modelo base — esa distinción importa y la tenés que poder nombrar.
- **Timeline escalonado.** Prohibiciones: feb 2025. Reglas de GPAI: ago 2025. El grueso de
  high-risk: 2026-2027. No todo está vigente hoy; saber que es escalonado es señal de que lo leíste.

- **Conexión data residency (cierra con §3):** elegiste región `europe-west1` en el Terraform. Eso
  no es decoración — para clientes EU, mantener el cómputo y los datos en la UE es parte de la
  historia de compliance (GDPR + AI Act). La decisión de infra y la de governance son la misma
  decisión.

> **Checkpoint:** te preguntan "¿el EU AI Act te bloquea?". Respuesta correcta: "No. Grounded es un
> chatbot de soporte → riesgo limitado → mi única obligación dura es transparencia (avisar que es
> IA). No toco ninguna categoría de alto riesgo del Anexo III. Soy deployer de un sistema, no
> proveedor del modelo base, así que las obligaciones de GPAI son de OpenAI, no mías." Si pudiste
> decir eso, entendés el Act a nivel awareness defendible.

---

## 7. Billing con Stripe (OPCIONAL, diferido acá)

Esto es plumbing de monetización, no señal de AI engineering — por eso es **opcional** y va último.
Si querés que Grounded sea vendible de verdad, el modelo es **metered/usage-based billing**: cobrás
por uso (queries, o tokens consumidos), no una tarifa fija. La idea clave de unit economics: **el
LLM te cuesta dinero por request**, así que tu pricing tiene que pasarle ese costo al usuario más un
margen, o perdés plata a escala.

El flujo con Stripe (a nivel awareness):
1. Definís un precio **metered** en Stripe (ej. $X por 1.000 queries).
2. Por cada uso, reportás un **meter event** a Stripe (`v1/billing/meter_events`) con la cantidad.
3. Stripe agrega el uso del período y factura automáticamente al cierre del ciclo.
4. Tiers (Free/Pro/Enterprise) = distintos precios y/o límites sobre el mismo meter.

La trampa real no es Stripe, es el **metering**: tenés que contar el uso de forma confiable e
idempotente (no cobrar dos veces si un request se reintenta). Ese es el laburo de verdad. Si lo
hacés, es un buen ADR; si no, "lo difiero conscientemente porque no es señal AI" *también* es una
decisión defendible.

---

## 8. Awareness: swap a un LLM managed (Bedrock / Vertex)

Una tercera opción entre "API de OpenAI" y "self-host vLLM": un **LLM managed de tu propio cloud** —
**AWS Bedrock** o **GCP Vertex AI**. Le pedís a tu cloud que sirva modelos (Claude, Llama, Mistral,
Gemini) por vos: no operás GPU, pero los datos y el billing quedan dentro de tu cuenta de cloud
(mejor para data residency / compliance EU que llamar a un tercero). Por qué te importa aunque no
lo construyas: es la respuesta a "¿cómo das garantías de data residency sin operar GPUs?" → "muevo
la inferencia a Bedrock/Vertex en mi región EU". Y como tu app ya es OpenAI-compatible y
desacoplada del proveedor (§5.2), el swap es de configuración. Awareness, no build.

---

## 9. Lo que tenés que poder defender (conecta con `criterios-defensa.md`)

Al cerrar M10, un entrevistador podría preguntarte cualquiera de estas. Si no las respondés con tus
palabras, tus decisiones y tus números, el módulo no está cerrado:

- "¿Cómo deployás esto en producción, a un cloud de verdad, a escala?" (Secciones 2-4)
- "¿Por qué Cloud Run y no Kubernetes / ECS / Lambda?" (Sección 2, ADR)
- "¿Dónde viven tus secrets y qué pasa si te filtran la imagen Docker?" (Sección 4)
- "¿Por qué Terraform y no clickear la consola?" (Sección 3)
- "¿Cómo servirías el modelo sin OpenAI?" (Sección 5)
- "¿Qué hace vLLM y por qué es más rápido que un loop de generate?" (PagedAttention + continuous
  batching — Sección 5.1)
- "Medí tu throughput. ¿Qué números te dio y por qué suben con concurrencia?" (Sección 5.3)
- "¿Qué te exige el EU AI Act y en qué categoría de riesgo caés?" (Sección 6.2)
- "Mostrame tu model card." (Sección 6.1)
- "¿Cómo le pasarías el costo del LLM al usuario?" (Sección 7, opcional)

Seguí con `material-apoyo.md` para las fuentes canónicas, después `practica.md` para construir el
deploy real, y `pruebas.md` para los tests y los defense drills (el HARD GATE).
