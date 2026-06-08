import type Redis from "ioredis";
import type { GateStatus, ModuleProgress, ProgressMap } from "./types";

// Single boundary to the mutable learner state (gates, drill verdicts).
// Uses a standard Redis (Railway) via REDIS_URL when configured; falls back to
// an in-memory store for local dev so the hub runs without Redis. Called ONLY
// from API routes.
const REDIS_URL = process.env.REDIS_URL;
const KEY = "atelier:progress";

const memStore: { value: ProgressMap } = { value: {} };

// Singleton connection, reused across warm serverless invocations.
let client: Redis | null = null;
async function getClient(): Promise<Redis | null> {
  if (!REDIS_URL) return null;
  if (client) return client;
  const { default: IORedis } = await import("ioredis");
  client = new IORedis(REDIS_URL, { maxRetriesPerRequest: 3, lazyConnect: false });
  return client;
}

async function readAll(): Promise<ProgressMap> {
  const c = await getClient();
  if (!c) return memStore.value;
  const raw = await c.get(KEY);
  return raw ? (JSON.parse(raw) as ProgressMap) : {};
}

async function writeAll(map: ProgressMap): Promise<void> {
  const c = await getClient();
  if (!c) {
    memStore.value = map;
    return;
  }
  await c.set(KEY, JSON.stringify(map));
}

export async function getProgress(): Promise<ProgressMap> {
  return readAll();
}

export async function setGate(moduleId: string, gate: GateStatus): Promise<ModuleProgress> {
  const map = await readAll();
  const prev = map[moduleId] ?? { gate: "pending" as GateStatus };
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
  const prev = map[moduleId] ?? { gate: "pending" as GateStatus };
  const verdicts = [...(prev.drillVerdicts ?? []), { at: new Date().toISOString(), verdict, note }];
  const next: ModuleProgress = { ...prev, drillVerdicts: verdicts, updatedAt: new Date().toISOString() };
  map[moduleId] = next;
  await writeAll(map);
  return next;
}

export const redisReady = Boolean(REDIS_URL);
