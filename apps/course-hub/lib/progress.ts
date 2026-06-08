import type { GateStatus, ModuleProgress, ProgressMap } from './types';

// Single boundary to the mutable learner state (gates, drill verdicts).
// Uses Vercel KV when configured; falls back to an in-memory store for local
// dev so the hub runs without a KV instance. Called ONLY from API routes.
const KV_READY = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
const KEY = 'atelier:progress';

const memStore: { value: ProgressMap } = { value: {} };

async function readAll(): Promise<ProgressMap> {
  if (!KV_READY) return memStore.value;
  const { kv } = await import('@vercel/kv');
  return (await kv.get<ProgressMap>(KEY)) ?? {};
}

async function writeAll(map: ProgressMap): Promise<void> {
  if (!KV_READY) {
    memStore.value = map;
    return;
  }
  const { kv } = await import('@vercel/kv');
  await kv.set(KEY, map);
}

export async function getProgress(): Promise<ProgressMap> {
  return readAll();
}

export async function setGate(moduleId: string, gate: GateStatus): Promise<ModuleProgress> {
  const map = await readAll();
  const prev = map[moduleId] ?? { gate: 'pending' as GateStatus };
  const next: ModuleProgress = { ...prev, gate, updatedAt: new Date().toISOString() };
  map[moduleId] = next;
  await writeAll(map);
  return next;
}

export async function saveDrillVerdict(
  moduleId: string,
  verdict: string,
  note?: string,
): Promise<ModuleProgress> {
  const map = await readAll();
  const prev = map[moduleId] ?? { gate: 'pending' as GateStatus };
  const verdicts = [...(prev.drillVerdicts ?? []), { at: new Date().toISOString(), verdict, note }];
  const next: ModuleProgress = { ...prev, drillVerdicts: verdicts, updatedAt: new Date().toISOString() };
  map[moduleId] = next;
  await writeAll(map);
  return next;
}

export const kvReady = KV_READY;
