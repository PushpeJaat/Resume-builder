import Link from "next/link";

export interface TemplateCardProps {
  id: string;
  name: string;
  description: string;
  premium: boolean;
}
// Demo demo
export function TemplateCard({ id, name, description, premium }: TemplateCardProps) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Template Preview Area */}
      <div className="aspect-[3/4] bg-gradient-to-br from-slate-100 to-slate-50 relative overflow-hidden">
        {/* Mock resume preview */}
        <div className="p-4 h-full flex flex-col">
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="space-y-1">
              <div className={`h-3 ${
                id === "modern-professional" ? "w-32 bg-sky-600" :
                id === "minimal-clean" ? "w-28 bg-slate-900" :
                "w-32 bg-purple-600"
              } rounded`}></div>
              <div className="h-2 w-20 bg-slate-300 rounded"></div>
            </div>
            
            {/* Body preview */}
            <div className="space-y-2">
              <div className={`h-2 ${
                id === "modern-professional" ? "w-full bg-slate-300" :
                id === "minimal-clean" ? "w-full bg-slate-300" :
                "w-full bg-slate-300"
              } rounded`}></div>
              <div className="h-2 w-5/6 bg-slate-300 rounded"></div>
              <div className="h-2 w-4/6 bg-slate-300 rounded"></div>
            </div>

            {/* Content rows */}
            <div className="space-y-2 mt-4">
              <div className="h-2 w-24 bg-slate-300 rounded"></div>
              <div className="h-2 w-full bg-slate-200 rounded"></div>
              <div className="h-2 w-full bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>

        {/* Premium badge */}
        {premium && (
          <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1">
            <span className="text-xs font-semibold text-white">⭐ Premium</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-2">{name}</h3>
        <p className="text-sm text-slate-600 mb-4">{description}</p>
      </div>

      {/* Footer */}
      <div className="px-6 pb-6 flex gap-3">
        <Link
          href={`/templates/${id}`}
          className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors duration-200"
        >
          Preview
        </Link>
        <Link
          href={`/editor?template=${id}`}
          className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-gradient-to-r from-sky-600 to-cyan-600 text-sm font-semibold text-white shadow-md shadow-sky-600/20 hover:shadow-lg hover:shadow-sky-600/30 transition-all duration-200"
        >
          Use Template
        </Link>
      </div>
    </div>
  );
}
