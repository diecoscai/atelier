---
module: SQ-A
feature: GPT mínimo (build) + doc "cómo funciona el modelo"
repo: scratch (no es Grounded — es un sandbox de aprendizaje)
---

# Práctica — construí un GPT mínimo y documentá cómo funciona

Objetivo: seguir el build de Karpathy de un GPT mínimo *tipeando vos el código* (no copiar y
pegar), y después escribir con tus palabras un doc que explique el modelo. El entregable real
**no es el código** — es que puedas explicar attention sin mirar. Esto vive en un sandbox, no en
Grounded.

> No es un feature de producto. Es literacy. El "verificar" de cada paso es *entendés lo que
> tipeaste*, no *pasa un test de CI*.

## Pre-requisitos
- Python con `numpy` y `torch` (CPU alcanza para un modelo de juguete). Un Jupyter notebook o
  Google Colab (T4 free) hace todo más cómodo.
- Miraste la lecture **"Let's build GPT"** de `material-apoyo.md`.

---

## Paso 1 — Bigram baseline
**Hacer:** seguí la primera parte de la lecture: cargá un corpus de texto chico (el que usa
Karpathy o uno propio), tokenizá a nivel caracter, y entrená el modelo bigram más tonto (predice
el siguiente char solo a partir del actual).

**Verificar:** genera texto (basura, pero corre el loop entrenar→samplear). Entendés qué es la
*loss* (cross-entropy) y por qué baja.

## Paso 2 — Self-attention a mano
**Hacer:** implementá una sola cabeza de self-attention siguiendo la lecture: las proyecciones
Q, K, V; el dot-product Q·Kᵀ; el *scaling*; el **causal masking** (triangular); el softmax; y la
mezcla ponderada de V.

**Verificar:** podés señalar en *tu* código dónde está cada pieza de la Sección 3 de la lección.
Si no sabés por qué hay un masking triangular, volvé a la lecture antes de seguir.

## Paso 3 — Multi-head + bloque Transformer
**Hacer:** envolvé varias cabezas (multi-head), agregá la feed-forward (MLP), las *residual
connections* y *layer norm*. Apilá unos pocos bloques.

**Verificar:** el texto generado mejora notablemente vs el bigram. Entendés por qué apilar
bloques ayuda (Sección 5).

## Paso 4 — El doc "cómo funciona el modelo que llamás" (entregable real)
**Hacer:** escribí `MODELO.md` (en el sandbox o en tus notas) explicando **con tus palabras**:
- qué es self-attention y el rol de Q/K/V (con tu propia analogía),
- por qué hace falta positional encoding,
- por qué multi-head,
- por qué los Transformers escalan mejor que los RNN,
- la conexión con tu producto: por qué el context window es finito (O(n²)) y por qué eso motiva
  RAG.

**Verificar:** se lo explicás a alguien (o a Claude en modo interviewer) sin mirar el doc y no te
trabás. Ese es el gate.

---

## Definición de "hecho" (SQ-A)
✅ Tipeaste un GPT mínimo que entrena y samplea · ✅ Podés señalar Q/K/V, masking y multi-head en
tu código · ✅ `MODELO.md` escrito con tus palabras · ✅ Lo explicás sin mirar (defense drills de
`pruebas.md`). → marcás el gate de la side-quest.
