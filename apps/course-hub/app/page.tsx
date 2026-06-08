import { MODULES, TRACK_LABELS } from "@/lib/course.config";
import { hasChapter } from "@/lib/content";
import { CourseMap, type MapModule } from "@/components/course-map";

export default function Home() {
  // Built at build time: static module list + whether each chapter exists.
  // Live overlays (build status, gate) are fetched client-side in <CourseMap/>.
  const modules: MapModule[] = MODULES.map((m) => ({
    id: m.id,
    slug: m.slug,
    track: m.track,
    title: m.title,
    tagline: m.tagline,
    checkpoint: m.checkpoint,
    spine: m.spine,
    hasChapter: hasChapter(m.slug),
  }));

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <p className="text-xs font-mono uppercase tracking-widest text-amber-500/80">
          producto-curso · AI Engineer
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-50">
          El taller donde construyo <span className="text-amber-500">Grounded</span> y me forjo
          como AI Engineer.
        </h1>
        <p className="max-w-2xl text-sm text-stone-400 leading-relaxed">
          Cada módulo es una pieza del RAG SaaS de producción. El entregable no es el código: es
          poder <span className="text-amber-400">defender cada decisión</span> con mis números. El
          hard gate de un módulo se pasa cuando el build shippeó <em>y</em> aprobé su defense drill.
        </p>
      </section>

      <CourseMap modules={modules} tracks={TRACK_LABELS} />
    </div>
  );
}
