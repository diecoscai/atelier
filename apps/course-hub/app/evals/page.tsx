export default function EvalsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-stone-50">Eval dashboard</h1>
      <p className="text-sm text-stone-400 max-w-2xl">
        El artefacto público de M2: métricas de retrieval/generación en el tiempo y comparación de
        estrategias, leídas de los <code className="text-stone-300">eval-results/*.json</code> que el
        harness de Grounded escupe.
      </p>
      <div className="rounded-xl border border-dashed border-stone-700 bg-stone-900/30 p-8 text-center">
        <p className="text-sm text-stone-500">
          Se activa en <span className="text-amber-500">F2</span>, cuando M2 produzca el primer
          golden dataset y sus métricas.
        </p>
      </div>
    </div>
  );
}
