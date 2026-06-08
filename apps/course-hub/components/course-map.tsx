"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ProductStatus, ProgressMap, Track } from "@/lib/types";
import { BuildBadge, GateBadge, TestsBadge } from "./badges";

export interface MapModule {
  id: string;
  slug: string;
  track: Track;
  title: string;
  tagline: string;
  checkpoint?: boolean;
  spine?: boolean;
  hasChapter: boolean;
}

const TRACK_ORDER: Track[] = ["core", "extended", "sidequest", "dsa"];
const TRACK_META: Record<Track, { label: string; blurb: string }> = {
  core: { label: "Track Core · M0–M4", blurb: "Hasta el hireable checkpoint (~3-4 meses)." },
  extended: { label: "Track Extended · M5–M11", blurb: "Aditivo, post-checkpoint." },
  sidequest: { label: "Side-quests", blurb: "Grafts de fundamentos (transformer / math / classic-ML)." },
  dsa: { label: "Stream paralelo", blurb: "Práctica out-of-product, desde M4." },
};

export function CourseMap({
  modules,
  tracks,
}: {
  modules: MapModule[];
  tracks: Record<string, { label: string; blurb: string }>;
}) {
  const [progress, setProgress] = useState<ProgressMap>({});
  const [product, setProduct] = useState<ProductStatus | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/state")
      .then((r) => r.json())
      .then((d) => {
        setProgress(d.progress ?? {});
        setProduct(d.product ?? null);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  return (
    <div className="space-y-10">
      {TRACK_ORDER.map((track) => {
        const list = modules.filter((m) => m.track === track);
        if (!list.length) return null;
        const meta = tracks[track] ?? TRACK_META[track];
        return (
          <section key={track}>
            <div className="mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-500/90">
                {meta.label}
              </h2>
              <p className="text-xs text-stone-500">{meta.blurb}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {list.map((m) => {
                const pm = product?.modules?.[m.id];
                const pr = progress?.[m.id];
                return (
                  <Link
                    key={m.id}
                    href={`/modules/${m.slug}`}
                    className="group rounded-xl border border-stone-800 bg-stone-900/40 p-4 hover:border-amber-600/50 hover:bg-stone-900/70 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-stone-500">{m.id}</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {m.spine && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30">
                            spine
                          </span>
                        )}
                        {m.checkpoint && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 ring-1 ring-orange-500/40">
                            checkpoint
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 className="mt-1 font-medium text-stone-100 group-hover:text-white">
                      {m.title}
                    </h3>
                    <p className="mt-1 text-xs text-stone-400 leading-relaxed">{m.tagline}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {loaded ? (
                        <>
                          <BuildBadge status={pm?.status} />
                          <TestsBadge tests={pm?.tests} />
                          <GateBadge gate={pr?.gate} />
                        </>
                      ) : (
                        <span className="text-[11px] text-stone-600">cargando estado…</span>
                      )}
                      {!m.hasChapter && (
                        <span className="text-[11px] text-stone-600">· capítulo pendiente</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
