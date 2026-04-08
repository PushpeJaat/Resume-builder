import Link from "next/link";

export interface TemplateCardProps {
  id: string;
  name: string;
  description: string;
  premium: boolean;
}
// Demo demo
export function TemplateCard({ id, name, description, premium }: TemplateCardProps) {
  const accentColor =
    id === "modern-professional"
      ? "bg-sky-600"
      : id === "minimal-clean"
        ? "bg-slate-900"
        : "bg-violet-600";

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60">
      {/* Accent strip */}
      <div className={`h-1 w-full ${accentColor}`} />

      {/* Template Preview Area */}
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-50">
        <div className="flex h-full flex-col p-5">
          {/* Mock header */}
          <div className="space-y-1.5">
            <div className={`h-3 w-32 rounded ${accentColor}`} />
            <div className="h-2 w-20 rounded bg-slate-300" />
            <div className="h-1.5 w-28 rounded bg-slate-200" />
          </div>

          {/* Divider */}
          <div className={`my-3 h-px w-full ${id === "minimal-clean" ? "bg-slate-900/20" : id === "modern-professional" ? "bg-sky-200" : "bg-violet-200"}`} />

          {/* Mock body */}
          <div className="flex-1 space-y-3">
            <div className="space-y-1.5">
              <div className="h-2 w-20 rounded bg-slate-400/60" />
              <div className="h-1.5 w-full rounded bg-slate-200" />
              <div className="h-1.5 w-5/6 rounded bg-slate-200" />
              <div className="h-1.5 w-4/6 rounded bg-slate-200" />
            </div>
            <div className="space-y-1.5">
              <div className="h-2 w-16 rounded bg-slate-400/60" />
              <div className="h-1.5 w-full rounded bg-slate-200" />
              <div className="h-1.5 w-full rounded bg-slate-200" />
              <div className="h-1.5 w-3/4 rounded bg-slate-200" />
            </div>
            <div className="space-y-1.5">
              <div className="h-2 w-14 rounded bg-slate-400/60" />
              <div className="flex flex-wrap gap-1.5">
                <div className="h-4 w-10 rounded bg-slate-200" />
                <div className="h-4 w-12 rounded bg-slate-200" />
                <div className="h-4 w-8 rounded bg-slate-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Premium badge */}
        {premium && (
          <div className="absolute right-3 top-3 rounded-full bg-violet-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
            Pro
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-bold text-slate-900">{name}</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>

        {/* Footer buttons */}
        <div className="mt-5 flex gap-2.5">
          <Link
            href={`/templates/${id}`}
            className="flex-1 inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Preview
          </Link>
          <Link
            href={`/editor?template=${id}`}
            className="flex-1 inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Use Template
          </Link>
        </div>
      </div>
    </div>
  );
}
