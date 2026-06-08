---
module: M8
---

# Criterios de defensa — M8

Al terminar M8 tenés que poder, en el nivel honesto indicado:

- **(can-explain)** Por qué el valor de un RAG de soporte está en meterse en el inbox existente
  (Zendesk/Intercom) y no en tu propia UI de chat — fricción y adopción.
- **(can-explain)** La diferencia entre **construir la integración** (webhook + bot + escalation,
  esto es M8) y **publicar en el marketplace** (OAuth partner + review + privacy policy + clientes
  reales, hito GTM post-M11). Saber que son cosas distintas *es* la respuesta madura.
- **(can-build)** Un webhook receiver que recibe un evento de ticket de Zendesk sandbox, **verifica
  la firma HMAC-SHA256 sobre el body crudo**, es idempotente ante reintentos, y dispara el bot.
- **(can-build)** Un first-response bot que llama al RAG de M4 y escribe de vuelta en el ticket
  (comentario público vs interno) con citations, en modo autonomous o co-pilot.
- **(can-build)** La lógica de escalation que combina **regla dura (tema sensible)** → **"no sé"
  calibrado de M4** → **confianza/citations**, con las reglas duras evaluadas primero.
- **(can-defend)** Cómo medís el **valor de negocio**: deflection rate **atado a** resolution
  quality (accuracy del harness de M2 + tasa de reapertura). Por qué deflection a secas es una
  vanity metric que se puede inflar respondiendo todo.
- **(can-defend)** Cómo te integrás con Zendesk **sin romper su flujo**: trigger nativo → webhook,
  sos un observador externo que escribe de vuelta vía API REST, no inyectás nada en su sistema.
- **(can-defend)** Por qué **una sola plataforma** y no las dos (cada una es un contrato distinto;
  la segunda es el mismo patrón) — ADR-008.
