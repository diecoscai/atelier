import Link from "next/link";
import { notFound } from "next/navigation";
import { MODULES, getModule } from "@/lib/course.config";
import { getModuleContent } from "@/lib/content";
import { Markdown } from "@/components/markdown";
import { ModulePanel } from "@/components/module-panel";
import type { ModuleParsedDoc } from "@/lib/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return MODULES.map((m) => ({ slug: m.slug }));
}

function Section({ title, doc, empty }: { title: string; doc?: ModuleParsedDoc; empty: string }) {
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-500/90">{title}</h2>
      {doc ? <Markdown>{doc.body}</Markdown> : <p className="text-xs text-stone-600 italic">{empty}</p>}
    </section>
  );
}

export default async function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const def = getModule(slug);
  if (!def) notFound();

  const content = getModuleContent(slug);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/" className="text-xs text-stone-500 hover:text-stone-300">← mapa</Link>
        <div className="mt-2 flex items-center gap-2">
          <span className="font-mono text-xs text-stone-500">{def.id}</span>
          {def.spine && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30">spine</span>
          )}
          {def.checkpoint && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 ring-1 ring-orange-500/40">checkpoint</span>
          )}
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-50">{def.title}</h1>
        <p className="mt-1 text-sm text-stone-400">{def.tagline}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_280px] md:items-start">
        <div className="space-y-8 order-2 md:order-1">
          <Section title="Lección" doc={content.leccion} empty="Capítulo aún no escrito." />
          <Section title="Práctica" doc={content.practica} empty="Feature a construir: pendiente." />
          <Section
            title="Criterios de defensa"
            doc={content.criteriosDefensa}
            empty="Qué tenés que poder explicar/build/defender: pendiente."
          />
          <Section
            title="Pruebas — tests + defense drills"
            doc={content.pruebas}
            empty="Capa 1 (tests/evals) y capa 2 (defense drills): pendiente."
          />
        </div>
        <div className="order-1 md:order-2 md:sticky md:top-20">
          <ModulePanel moduleId={def.id} />
        </div>
      </div>
    </div>
  );
}
