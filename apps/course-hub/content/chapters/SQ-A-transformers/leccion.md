---
module: SQ-A
title: Transformer literacy — cómo funciona el modelo que llamás
concept: Attention, self-attention, Q/K/V, multi-head, positional encoding
kind: side-quest
duration: ~4-6h lectura/video + 1 finde de práctica
when: M0 → M4 (en paralelo, no bloquea)
---

# SQ-A — Transformers (cómo funciona el modelo que estás usando)

> **Qué vas a saber al terminar:** explicar, sin mirar y sin matemática pesada, qué es la
> *attention*, cómo un Transformer convierte una secuencia de tokens en la predicción del
> siguiente, y por qué eso funciona. No vas a derivar fórmulas: vas a tener la **intuición
> sólida** que te deja sostener la ronda de teoría de una entrevista.

---

## Por qué esta side-quest existe

En ~70% de los loops de AI Engineer hay una **ronda de teoría** donde te piden explicar
attention o transformers. No saber explicarlo es una señal junior directa: pasás de "armó un
RAG" a "no entiende la herramienta que usa". Vos llamás a un LLM en cada request de Grounded —
no podés tratarlo como una caja negra mágica.

Esto **no es un módulo de producto**. No construís una feature de Grounded acá. Construís
*literacy*: el vocabulario y la intuición para hablar del modelo con propiedad. Es más liviano
que un módulo M y corre en paralelo desde M0 hasta el checkpoint M4.

---

## 1. El problema que resuelve un Transformer

Un modelo de lenguaje hace una sola cosa: dado un texto, predice el **siguiente token**. Repetí
eso en loop y tenés generación. La pregunta interesante es *cómo* decide cuál es el siguiente
token a partir del contexto.

El reto: el significado de una palabra depende de las otras. En *"el banco estaba cerrado"* vs
*"se sentó en el banco"*, "banco" es la misma palabra pero significa cosas distintas según su
contexto. El modelo necesita un mecanismo para que cada palabra **mire a las demás** y ajuste
su representación según con quién está. Ese mecanismo es la **attention**.

---

## 2. Tokens y embeddings (el punto de partida)

Antes de la attention, el texto se vuelve números:

1. **Tokenización:** el texto se parte en *tokens* (≈ trozos de palabra). `"streaming"` puede
   ser `["stream", "ing"]`.
2. **Token embedding:** cada token se mapea a un vector (igual idea que los embeddings que ya
   usás en RAG, pero estos se aprenden *adentro* del modelo).
3. **Positional encoding:** la attention por sí sola no sabe el *orden* de las palabras (trata
   la secuencia como un conjunto). Se le suma a cada token un vector que codifica su posición,
   para que "perro muerde hombre" ≠ "hombre muerde perro".

Resultado: una secuencia de vectores, uno por token, cada uno cargando *qué* es el token y
*dónde* está.

---

## 3. Self-attention: el corazón

La idea en una frase: **cada token le pregunta a todos los demás "¿qué tan relevante sos para
mí?" y se actualiza con una mezcla ponderada de ellos.**

Se hace con tres proyecciones de cada vector — el truco **Q/K/V**:

- **Query (Q):** "esto es lo que estoy buscando." (el token que pregunta)
- **Key (K):** "esto es lo que yo ofrezco." (cómo se anuncia cada token)
- **Value (V):** "esto es lo que aporto si me elegís." (la info que se mezcla)

El mecanismo:

1. Para el token actual, comparás su **Query** con la **Key** de cada otro token (un
   dot-product: mide qué tan alineados están — cuanto más alto, más relevante).
2. Esos puntajes pasan por un **softmax** → se vuelven pesos que suman 1 (una distribución de
   "cuánta atención le doy a cada uno").
3. La nueva representación del token = suma ponderada de los **Values**, usando esos pesos.

Así "banco" en *"el banco estaba cerrado"* presta mucha atención a "cerrado" y poco al resto, y
su vector se desplaza hacia el sentido financiero. **Esa es toda la magia.** El resto del
Transformer son capas de esto apiladas más MLPs.

> **Checkpoint:** ¿por qué hay tres matrices (Q, K, V) y no una? Porque el rol de *buscar* (Q),
> *ser encontrado* (K) y *aportar contenido* (V) son distintos. Separarlos deja que el modelo
> aprenda, por ejemplo, que un adjetivo "se ofrece" (K) a los sustantivos que lo "buscan" (Q).

---

## 4. Multi-head attention

Una sola attention captura *un tipo* de relación. **Multi-head** corre varias attentions en
paralelo ("cabezas"), cada una con sus propias Q/K/V, y concatena los resultados. Una cabeza
puede aprender relaciones de sintaxis (sujeto↔verbo), otra de correferencia (pronombre↔nombre),
otra de posición. Es como tener varios lectores subrayando la misma frase con criterios
distintos y juntar todo.

---

## 5. El bloque completo y por qué se apila

Un **bloque Transformer** = multi-head attention + una red feed-forward (MLP) por token, con
*residual connections* (sumar la entrada a la salida) y *layer norm* (estabilizar). Apilás N
bloques (GPT-2 small: 12). Cada capa refina: las primeras capturan patrones locales/sintaxis,
las profundas, semántica y razonamiento. Al final, una proyección a todo el vocabulario + softmax
da la probabilidad de cada token siguiente.

> **GPT-2 es el esqueleto, no el estado del arte.** Sirve como referencia porque es el punto
> donde Karpathy ancla la lecture y porque el mecanismo que importa (Q/K/V, multi-head,
> residual + layer norm) es el mismo en cualquier Transformer moderno. Lo que cambia en
> producción hoy: *positional encoding* casi siempre vía RoPE (rotary) en vez de embeddings
> sumados, *grouped-query attention* para abaratar el KV-cache, y en varios modelos grandes,
> capas MoE en lugar de un MLP denso por bloque. Ninguno de esos cambios afecta lo que tenés que
> saber explicar acá — son optimizaciones sobre el mismo esqueleto — pero no digas "así es GPT-4
> / Claude" en una entrevista: son arquitecturas mucho más grandes y con esas variantes encima.

**Causal masking:** en generación, un token solo puede mirar *hacia atrás* (no puede ver el
futuro que todavía no generó). Se logra tapando las attentions hacia adelante antes del softmax.

---

## 6. Por qué funciona (la intuición para defender)

- **Contexto, no memoria:** la attention deja que el significado de cada token dependa del
  contexto entero — exactamente lo que faltaba en arquitecturas previas.
- **Paralelizable:** a diferencia de un RNN (que procesa token por token, secuencial), la
  attention mira toda la secuencia a la vez → entrenable en GPUs gigantes → escala. Ese es el
  motivo real por el que los Transformers ganaron ("Attention is All You Need", 2017).
- **Composicional:** apilar bloques deja que el modelo construya representaciones cada vez más
  abstractas.

Esto conecta directo con tu producto: el *context window* finito sale de que la attention es
O(n²) en la longitud de secuencia (cada token mira a cada token). Por eso no podés meter 10.000
páginas en el prompt — y por eso existe RAG. La teoría de SQ-A *explica* la decisión de
arquitectura de M0.

---

## 7. Lo que tenés que poder defender (ver `criterios-defensa.md`)

- "Explicame la attention." → Secciones 3-4, con la analogía Q/K/V.
- "¿Qué hace el positional encoding y por qué hace falta?" → Sección 2.
- "¿Por qué multi-head y no una sola attention?" → Sección 4.
- "¿Por qué los Transformers reemplazaron a los RNN?" → Sección 6 (paralelización).
- "¿Qué relación tiene esto con tu context window y con RAG?" → Sección 6 (O(n²)).

Seguí con `material-apoyo.md` (la serie de Karpathy) y después `practica.md` (construir un GPT
mínimo + escribir el doc "cómo funciona el modelo").
