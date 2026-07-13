---
module: M11
feature: packaging + distribución del portfolio (ejecución de carrera, no código)
repo: grounded
---

# Práctica — empaquetá y DISTRIBUÍ el portfolio

Objetivo: convertir el sistema Grounded (ya construido en M0–M10) en un rol de AI Engineer. Esto
**no es código** — son pasos de packaging y distribución. Cada ítem tiene **Hacer** y
**Verificar**, y el entregable es concreto (una URL, un post publicado, una lista, un CV
actualizado). No marques un ítem sin que verifique.

> El producto vive en el repo **`grounded`**. Acá empaquetás lo que ya existe y lo presentás. Los
> activos nuevos (sitio, posts, video) pueden vivir en `grounded` (carpeta `/portfolio` o el
> README) o en repos propios — lo importante es que tengan URL pública.

## Pre-requisitos
- M0–M10 cerrados: demo deployado (managed cloud), eval dashboard público, `DECISIONS.md`,
  MCP server publicado, aislamiento multi-tenant verificado.
- Leíste los ★ Core de `material-apoyo.md` (swyx, eugeneyan) y tenés un borrador de tu
  positioning statement.

---

## BLOQUE A — Packaging (los artefactos que pesan)

### Paso A1 — Consolidar y verificar el demo live (señal #1)
**Hacer:** asegurate de que la URL pública del demo abre, hace el flujo completo (subir doc →
preguntar → respuesta con citations + streaming) y no requiere setup. Si pide login, dejá un
tenant demo con credenciales públicas o un modo read-only.
**Verificar:** abrís la URL en una ventana incógnito desde el celular → funciona end-to-end sin
tocar nada tuyo. Entregable: **1 URL pública del demo** que cualquiera puede usar.

### Paso A2 — Extraer y cuantificar los outcomes (señal #2)
**Hacer:** recorré `DECISIONS.md` y el dashboard y armá una tabla de 5-8 outcomes
**cuantificados** (número antes→después, no descripción). Ej.: recall@5, % alucinaciones,
TTFT/p95, costo/query, aislamiento verificado. Reescribí cada uno con el patrón
*acción + resultado medible*.
**Verificar:** tenés una tabla donde *cada fila tiene un número*. Ningún "construí/agregué/mejoré"
sin métrica. Entregable: **bloque de outcomes cuantificados** (reusable en CV, sitio, pitch).

### Paso A3 — Verificar el eval dashboard público (señal #3)
**Hacer:** confirmá que el dashboard de evals (live desde M2) es público, carga, y muestra las
métricas contra el golden dataset de forma legible para alguien externo. Agregá una línea de
contexto ("qué estás viendo y por qué importa").
**Verificar:** un extraño entiende qué muestra el dashboard sin que vos expliques. Entregable:
**1 URL pública del dashboard**.

### Paso A4 — Consolidar DECISIONS.md (señal #4)
**Hacer:** revisá que cada ADR (M0→M10) tenga: contexto, alternativas consideradas, decisión, el
número que la respaldó, y "cuándo lo cambiaría". Agregá un índice arriba. Asegurate de que la
sección "qué lo hace distinto de My AskAI/Ragie" (de M4) esté presente y actualizada.
**Verificar:** podés abrir cualquier ADR al azar y defenderlo sin mirar otra cosa. Entregable:
**`DECISIONS.md` consolidado y enlazado desde el sitio**.

### Paso A5 — Grabar el video demo (señal #5)
**Hacer:** grabá un Loom de **3-5 min**: pantalla + cámara chica. Guion: (1) qué es Grounded en 1
frase, (2) el flujo real en vivo, (3) UN número que impresiona (recall o aislamiento), (4) un
link al dashboard. Sin intro larga, sin "ehh".
**Verificar:** dura ≤5 min, muestra el producto andando, y menciona ≥1 número. Entregable:
**1 URL del Loom** (pública).

### Paso A6 — Escribir 2 blog posts (señal #6)
**Hacer:** escribí dos posts (molde: eugeneyan — problema → enfoque → números → decisiones):
1. **Eval methodology**: error-analysis primero → taxonomía de fallas → golden dataset →
   LLM-as-judge alineado → CI gate. Con tus números.
2. **Multi-tenancy isolation**: por qué el aislamiento determinístico en DB (no en el system
   prompt), JWT→tenant_id→namespace, y el test cross-tenant que lo prueba.
**Verificar:** ambos publicados con URL pública, cada uno con ≥1 número/gráfico tuyo y una
decisión defendida. Entregable: **2 URLs de blog posts**.

### Paso A7 — Amplificar el MCP server (señal #7)
**Hacer:** revisá el repo del MCP server (de M3): README claro (qué expone, cómo se instala, un
ejemplo de uso), licencia, y un GIF/clip corto. Si estás ejecutando esto antes del **28-jul-2026**,
verificá tu servidor contra la especificación MCP `2026-07-28` (release candidate ya publicado):
cambios *breaking* incluyen protocolo stateless (sin session pinning, escalable con round-robin
plano), "Tasks" movido de experimental-core a extensión, y la nueva "MCP Apps" (UIs HTML en
iframe sandboxed). Actualizá el SDK si hace falta antes de amplificar. Postealo en los canales de
comunidad (Sección B) para sumar visibilidad/stars.
**Verificar:** el README lo entiende alguien que llega de cero, el repo funciona contra la spec
vigente, y está posteado en ≥1 canal. Entregable: **URL del repo MCP + 1 post amplificándolo**.

### Paso A8 — Armar el sitio personal de 1 página (señal #8)
**Hacer:** una página que sea el hub: positioning statement arriba, demo live, outcomes
cuantificados, dashboard, video, 2 posts, MCP, GitHub, contacto. Una sola URL para mandar.
**Verificar:** desde el sitio llegás en 1 click a todos los activos anteriores. Entregable:
**1 URL del sitio personal**.

### Paso A9 — Reframe del CV/LinkedIn + audit ATS
**Hacer:** reescribí CV y LinkedIn al posicionamiento "AI Engineer que construye sistemas LLM de
producción". Corré el audit de keywords ATS: tomá 5-10 JDs reales de AI Engineer, extraé los
términos recurrentes, y asegurate de que los que podés *defender* estén presentes (RAG, vector
DBs, evals, multi-agent, FastAPI, etc.). Headline de LinkedIn = el positioning statement en 1
línea. (El skill `/cv` ayuda acá.)
**Verificar:** cada keyword del CV está respaldada en `criterios-defensa.md` (≥ can-explain). El
headline de LinkedIn dice "AI Engineer", no "full-stack". Entregable: **CV actualizado (PDF) +
LinkedIn actualizado**.

---

## BLOQUE B — Distribución (presentá, no esperes a que te descubran)

### Paso B1 — Lista de 10-15 empresas/arquetipos donde calza fuerte
**Hacer:** armá una lista nominal de 10-15 empresas reales o arquetipos concretos (product cos /
Series A–B agregando AI / productos de soporte-knowledge-search). Para cada una, **una línea de
por qué tu portfolio calza** (qué dolor de ellos responde qué pieza tuya).
**Verificar:** cada entrada tiene nombre/arquetipo + razón de match específica (no "buena
empresa"). Entregable: **lista de 10-15 con razón de match por entrada**.

### Paso B2 — Activar 2-3 canales LatAm→US
**Hacer:** creá/actualizá perfil en **Tecla** y **HireLATAM** (o equivalentes) con el positioning
statement. Unite a **MLOps Community** (Slack/eventos). Definí tu **plataforma build-in-public**
(X y/o LinkedIn).
**Verificar:** perfiles live en ≥2 plataformas de talent + miembro de ≥1 comunidad. Entregable:
**enlaces a los perfiles + comunidad**.

### Paso B3 — Definir la estrategia de distribución (plataforma, cadencia, formato)
**Hacer:** escribí en 1 párrafo: cuál es tu **plataforma principal**, tu **cadencia** sostenible
(ej. 1 post técnico/semana + 3-5 aplicaciones dirigidas/semana), y el **formato** (cómo troceás
los activos del Bloque A en posts: thread por blog post, clip del Loom, "lo que aprendí" con un
número).
**Verificar:** la estrategia es concreta y sostenible (números, no "voy a postear más"). 
Entregable: **estrategia de distribución escrita**.

### Paso B4 — Primer ciclo de distribución (ejecutar, no solo planear)
**Hacer:** ejecutá la primera ronda: publicá ≥1 post build-in-public (con un activo del Bloque A),
y **presentá el portfolio a las primeras 3-5 empresas** de la lista B1 — con un pitch dirigido
("vi que están agregando AI a X; construí exactamente eso, acá el demo: <URL>"), no un CV genérico.
**Verificar:** ≥1 post publicado + ≥3 empresas contactadas con pitch dirigido y link al demo.
Entregable: **registro de outreach** (a quién, qué mandaste, cuándo).

---

## Paso C — Mock defense (el HARD GATE final)
**Hacer:** completá la mock defense integral de `pruebas.md` (capa 2): las 4 rondas del loop +
defender el positioning statement. Claude (o un compañero) hace de interviewer.
**Verificar:** podés sostener el deep-dive completo del sistema con números, alternativas y
decisiones, *sin mirar las notas*. Recién ahí marcás el gate final del curso.

---

## Definición de "hecho" (M11)
✅ Demo live verificado · ✅ outcomes cuantificados · ✅ dashboard público · ✅ `DECISIONS.md`
consolidado · ✅ Loom 3-5 min · ✅ 2 blog posts publicados · ✅ MCP amplificado · ✅ sitio 1-página ·
✅ CV/LinkedIn reframe + audit ATS · ✅ lista de 10-15 empresas · ✅ 2-3 canales activos · ✅
estrategia de distribución escrita · ✅ **portfolio presentado a N≥3 empresas (primer ciclo)** ·
✅ mock defense pasada. → marcás el **gate final del curso** en el panel.
