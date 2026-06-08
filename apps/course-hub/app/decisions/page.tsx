"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ProductStatus } from "@/lib/types";

export default function DecisionsPage() {
  const [product, setProduct] = useState<ProductStatus | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/state")
      .then((r) => r.json())
      .then((d) => setProduct(d.product ?? null))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const entries = product
    ? Object.entries(product.modules).filter(([, m]) => m.adrs?.length)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-50">Decision log</h1>
        <p className="mt-1 text-sm text-stone-400 max-w-2xl">
          Los ADRs viven en <span className="text-amber-400">Grounded</span> (
          <code className="text-stone-300">DECISIONS.md</code>), versionados con el código. El hub
          los indexa por módulo — munición para el project deep-dive en entrevistas.
        </p>
      </div>

      {!loaded && <p className="text-xs text-stone-500">cargando…</p>}
      {loaded && !entries.length && (
        <p className="text-xs text-stone-600 italic">
          Todavía no hay ADRs publicados en el contrato de Grounded.
        </p>
      )}

      <div className="space-y-4">
        {entries.map(([moduleId, m]) => (
          <div key={moduleId} className="rounded-xl border border-stone-800 bg-stone-900/40 p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-stone-500">{moduleId}</span>
              {m.links?.pr && (
                <a href={m.links.pr} target="_blank" rel="noreferrer" className="text-xs text-amber-400 hover:underline">
                  ↗ PR
                </a>
              )}
            </div>
            <ul className="mt-2 flex flex-wrap gap-2">
              {m.adrs!.map((a) => (
                <li
                  key={a}
                  className="text-xs px-2 py-1 rounded-md bg-stone-950 ring-1 ring-stone-700 text-stone-300 font-mono"
                >
                  {a}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="text-xs text-stone-600">
        ¿Falta contexto? Cada módulo del{" "}
        <Link href="/" className="text-amber-500 hover:underline">mapa</Link> linkea a su PR en Grounded.
      </p>
    </div>
  );
}
