"use client";

import { useEffect, useState } from "react";
import type { ProductModule, ModuleProgress } from "@/lib/types";
import { BuildBadge, GateBadge, TestsBadge } from "./badges";

export function ModulePanel({ moduleId }: { moduleId: string }) {
  const [pm, setPm] = useState<ProductModule | null>(null);
  const [pr, setPr] = useState<ModuleProgress | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [writeKey, setWriteKey] = useState("");

  async function refresh() {
    const d = await fetch("/api/state").then((r) => r.json());
    setPm(d.product?.modules?.[moduleId] ?? null);
    setPr(d.progress?.[moduleId] ?? null);
    setLoaded(true);
  }

  useEffect(() => {
    refresh().catch(() => setLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId]);

  async function toggleGate() {
    setBusy(true);
    const next = pr?.gate === "passed" ? "pending" : "passed";
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "content-type": "application/json", "x-atelier-key": writeKey },
      body: JSON.stringify({ action: "gate", moduleId, gate: next }),
    });
    if (res.ok) await refresh();
    else alert(res.status === 401 ? "Falta la passphrase de escritura" : "Error al guardar");
    setBusy(false);
  }

  const passed = pr?.gate === "passed";

  return (
    <div className="rounded-xl border border-stone-800 bg-stone-900/40 p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {loaded ? (
          <>
            <BuildBadge status={pm?.status} />
            <TestsBadge tests={pm?.tests} />
            <GateBadge gate={pr?.gate} />
          </>
        ) : (
          <span className="text-xs text-stone-500">cargando estado…</span>
        )}
      </div>

      {pm?.deployUrl && (
        <a
          href={pm.deployUrl}
          target="_blank"
          rel="noreferrer"
          className="block text-xs text-amber-400 hover:underline"
        >
          ↗ demo deployado
        </a>
      )}

      {(pm?.links?.pr || pm?.links?.files?.length || pm?.adrs?.length) && (
        <div className="text-xs text-stone-400 space-y-1">
          <p className="text-stone-500 uppercase tracking-wider text-[10px]">en Grounded</p>
          {pm?.links?.pr && (
            <a href={pm.links.pr} target="_blank" rel="noreferrer" className="block text-amber-400 hover:underline">
              ↗ pull request
            </a>
          )}
          {pm?.links?.files?.map((f) => (
            <code key={f} className="block text-stone-400">{f}</code>
          ))}
          {pm?.adrs?.length ? <p className="text-stone-500">ADRs: {pm.adrs.join(", ")}</p> : null}
        </div>
      )}

      <div className="pt-2 border-t border-stone-800 space-y-2">
        <p className="text-[11px] text-stone-500">
          Hard gate: build shippeado <span className="text-stone-400">{pm?.status === "shipped" ? "✓" : "○"}</span> · defensa{" "}
          <span className="text-stone-400">{passed ? "✓" : "○"}</span>
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            value={writeKey}
            onChange={(e) => setWriteKey(e.target.value)}
            placeholder="passphrase (si está configurada)"
            className="flex-1 min-w-0 rounded-md bg-stone-950 border border-stone-700 px-2 py-1 text-xs text-stone-200 placeholder:text-stone-600"
          />
          <button
            onClick={toggleGate}
            disabled={busy || !loaded}
            className="shrink-0 rounded-md bg-amber-600/90 hover:bg-amber-600 disabled:opacity-50 px-3 py-1 text-xs font-medium text-stone-950"
          >
            {passed ? "Reabrir gate" : "Marcar gate pasado"}
          </button>
        </div>
      </div>
    </div>
  );
}
