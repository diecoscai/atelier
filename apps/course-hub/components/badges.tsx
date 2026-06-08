import type { BuildStatus, GateStatus } from "@/lib/types";

const BUILD_STYLE: Record<BuildStatus | "none", { label: string; cls: string }> = {
  shipped: { label: "shipped", cls: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30" },
  "in-progress": { label: "building", cls: "bg-amber-500/15 text-amber-300 ring-amber-500/30" },
  todo: { label: "todo", cls: "bg-stone-600/15 text-stone-400 ring-stone-600/30" },
  none: { label: "no iniciado", cls: "bg-stone-700/10 text-stone-500 ring-stone-700/30" },
};

export function BuildBadge({ status }: { status?: BuildStatus }) {
  const s = BUILD_STYLE[status ?? "none"];
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full ring-1 ${s.cls}`}>build: {s.label}</span>
  );
}

export function GateBadge({ gate }: { gate?: GateStatus }) {
  const passed = gate === "passed";
  return (
    <span
      className={`text-[11px] px-2 py-0.5 rounded-full ring-1 ${
        passed
          ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30"
          : "bg-stone-600/15 text-stone-400 ring-stone-600/30"
      }`}
    >
      gate: {passed ? "pasado" : "pendiente"}
    </span>
  );
}

export function TestsBadge({ tests }: { tests?: "pass" | "fail" }) {
  if (!tests) return null;
  return (
    <span
      className={`text-[11px] px-2 py-0.5 rounded-full ring-1 ${
        tests === "pass"
          ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30"
          : "bg-red-500/15 text-red-300 ring-red-500/30"
      }`}
    >
      tests: {tests}
    </span>
  );
}
