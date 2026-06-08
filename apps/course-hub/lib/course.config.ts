import type { ModuleDef } from './types';

// Canonical course taxonomy (from docs/DESIGN.md v3).
// This is the single source for WHICH modules exist; content/product/progress
// layers enrich each one. A module appears on the map even with no chapter yet.
export const MODULES: ModuleDef[] = [
  // ---- Track Core (M0–M4) → hireable checkpoint ----
  { id: 'M0', slug: 'M0-setup', track: 'core', title: 'Setup + thin slice', tagline: 'Monorepo TS+Python, subir 1 doc → chunk naive → pgvector → RAG single-shot. Deploy temprano.' },
  { id: 'M1', slug: 'M1-ingestion', track: 'core', title: 'Ingestion de docs reales', tagline: 'Parsing (Docling), chunking layout-aware/semántico, tablas/OCR, multimodal (screenshots).' },
  { id: 'M2', slug: 'M2-evals', track: 'core', title: 'Eval harness + golden dataset', tagline: 'Error-analysis primero (taxonomía de fallas) → RAGAS/DeepEval, LLM-judge, dashboard público.', spine: true },
  { id: 'M3', slug: 'M3-retrieval', track: 'core', title: 'Advanced retrieval + MCP', tagline: 'Hybrid BM25+dense, RRF, rerank, query rewriting/HyDE. MCP server standalone.' },
  { id: 'M4', slug: 'M4-checkpoint', track: 'core', title: 'Structured outputs + multi-tenant + DEPLOY', tagline: 'Citations, "no sé" calibrado, aislamiento multi-tenant. Hireable checkpoint.', checkpoint: true },

  // ---- Track Extended (M5–M11) — aditivo ----
  { id: 'M5', slug: 'M5-security', track: 'extended', title: 'Security profundo + red-team', tagline: 'ACL-aware retrieval, PII redaction, prompt injection, garak en CI.' },
  { id: 'M6', slug: 'M6-agentic', track: 'extended', title: 'Agentic RAG + multi-agent', tagline: 'LangGraph, multi-hop, context engineering, reasoning-RAG, agent-eval loop (→M2).' },
  { id: 'M7', slug: 'M7-llmops', track: 'extended', title: 'LLMOps + cost + OSS models', tagline: 'Model routing, semantic caching, token budgets, Ollama, quantization primer.' },
  { id: 'M8', slug: 'M8-integracion', track: 'extended', title: 'Integración vertical', tagline: 'Webhook + first-response bot para Intercom O Zendesk (sandbox), métricas de deflection.' },
  { id: 'M9', slug: 'M9-finetuning', track: 'extended', title: 'Fine-tuning hands-on + classic ML', tagline: 'QLoRA end-to-end (Colab/RunPod), embedding fine-tuning, clasificador Banking77.' },
  { id: 'M10', slug: 'M10-cloud', track: 'extended', title: 'Managed cloud + self-hosted inference', tagline: 'Deploy real a GCP/AWS, vLLM benchmark, governance (model card, EU AI Act).' },
  { id: 'M11', slug: 'M11-capstone', track: 'extended', title: 'Capstone: packaging + distribución', tagline: 'Demo, eval dashboard, blog posts, reframe a "AI Engineer", canales LatAm→US.' },

  // ---- Side-quests de fundamentos ----
  { id: 'SQ-A', slug: 'SQ-A-transformers', track: 'sidequest', title: 'Karpathy GPT lectures 7+8', tagline: 'Transformer literacy: implementar + doc "cómo funciona el modelo que llamás".' },
  { id: 'SQ-B', slug: 'SQ-B-makemore', track: 'sidequest', title: 'Makemore MLP + logprobs', tagline: 'Intuición de math + eval: instrumentar logprobs en el producto.' },
  { id: 'SQ-C', slug: 'SQ-C-banking77', track: 'sidequest', title: 'Clasificador Banking77', tagline: 'Classic ML: precision/recall/F1/confusion → routing barato antes del LLM (folded en M9).' },

  // ---- Stream paralelo (no es módulo del producto) ----
  { id: 'DSA', slug: 'DSA-stream', track: 'dsa', title: 'Stream de prep DSA', tagline: 'Coding-round patterns (arrays/hashing/two-pointers/graphs/DP). Corre desde M4 hasta entrevistas.' },
];

export const TRACK_LABELS: Record<string, { label: string; blurb: string }> = {
  core: { label: 'Track Core · M0–M4', blurb: 'Hasta el hireable checkpoint (~3-4 meses).' },
  extended: { label: 'Track Extended · M5–M11', blurb: 'Aditivo, post-checkpoint.' },
  sidequest: { label: 'Side-quests de fundamentos', blurb: 'Grafts de transformer/math/classic-ML.' },
  dsa: { label: 'Stream paralelo', blurb: 'Práctica out-of-product.' },
};

export function getModule(slug: string): ModuleDef | undefined {
  return MODULES.find((m) => m.slug === slug);
}
