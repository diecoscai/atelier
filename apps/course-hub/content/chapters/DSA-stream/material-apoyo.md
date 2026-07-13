---
module: DSA
---

# Material de apoyo — DSA stream

Recursos reales para la prep de coding round. Los **★ Core** son los que estructuran el stream;
el resto es complemento. Elegí UNA lista curada como columna vertebral (Grind75 o NeetCode 150)
y no la cambies a mitad de camino.

## ★ Core (la columna vertebral del stream)

1. **NeetCode — `neetcode.io` y su roadmap**
   El recurso más eficiente para aprender los patterns. El **roadmap** ordena los temas en una
   secuencia con dependencias; **NeetCode 150** (28 easy / 97 medium / 25 hard en 18 patterns) es
   la lista curada de problemas por patrón. Cada problema tiene video-explicación de Navdeep Singh
   (canal **NeetCode** en YouTube). En 2026 sumaron hints dinámicos basados en tu propio código,
   una función de "suggest fix" con AI, ~150 problemas adicionales de DSA, ~50 de SQL, y soporte
   para Kotlin/Swift/Rust además de los lenguajes originales. Empezá acá.

2. **Grind75 — `grind75.com`** (creado por Yangshun Tay, ex-Staff Engineer de Meta; documentado
   también en Tech Interview Handbook)
   Lista curada y *programable*: le decís cuántas horas/semana tenés y te genera un plan
   semanal ordenado por dificultad e importancia (ej. ~8h/semana ≈ 8 semanas para las 75; ~15-20h
   ≈ 3-4 semanas). Ideal para la cadencia "baja y constante" del stream. Es la evolución de
   **Blind 75**. Ojo si buscás el nombre: existe una app de fitness sin relación llamada igual en
   el App Store — la que te interesa es el sitio web de práctica de coding.

3. **LeetCode — `leetcode.com`**
   La plataforma donde resolvés y tipeás de verdad, con el judge automático. Filtrá por los
   patterns/tags de la lección. Usá el timer. Las listas de NeetCode/Grind75 apuntan a problemas
   de acá. Premium ($35/mes o $159/año) suma 300+ problemas exclusivos, listas por empresa, mocks
   y autocompletado asistido por AI — no es necesario para el stream, la versión gratis alcanza.
   (No confundir con "LeetCode Interview", el producto B2B que usan empresas para tomar
   assessments — no es para practicar como estudiante.)

## Referencia (consultá cuando te trabás)

- **"Cracking the Coding Interview"** (6ª edición) — Gayle Laakmann McDowell. El libro clásico:
  teoría de cada estructura de datos, el comportamiento esperado en la entrevista, y problemas
  con solución. Sigue siendo la 6ª edición (no hay 7ª ni planes anunciados de una). Lo que **no**
  cubre es el modo AI-assisted del §4 de la lección — para eso, mirá directamente los blogs de
  ingeniería de las empresas (ej. el post de Canva citado en la lección) en vez de un libro.
  Si buscás el título, cuidado con ediciones de terceros no oficiales que circulan con el mismo
  nombre — la única edición de McDowell es la 6ª.
- **Blind 75** — la lista original de 75 problemas (circula como post de Blind / repos en
  GitHub). NeetCode 150 la contiene y amplía; mencionada por si la ves referida en foros.
- **Tech Interview Handbook** (`techinterviewhandbook.org`) — la guía detrás de Grind75:
  cheatsheets por estructura de datos y consejos de proceso. Activamente mantenida (contribuciones
  registradas hasta 2026).

## Deep dive (opcional)

- **"Elements of Programming Interviews"** (EPI) — más denso que CtCI, para cuando quieras
  profundizar un patrón. Disponible en variantes C++/Java/Python, 250+ problemas.
- **VisuAlgo** (`visualgo.net`) — visualizaciones de estructuras y algoritmos (BFS/DFS, sorting)
  si un patrón no te cierra. Sitio activo (2M+ usuarios reportados) y en expansión continua.

## Cómo usar este material

Elegí UNA columna vertebral: **Grind75** (si querés un plan generado por tu disponibilidad) o
**NeetCode 150 + roadmap** (si preferís aprender por patrón con video). Usá **LeetCode** para
tipear. Tené **CtCI** como referencia de proceso. No saltes entre listas — la consistencia es el
80% del resultado. Armá tu plan concreto en `practica.md`.
