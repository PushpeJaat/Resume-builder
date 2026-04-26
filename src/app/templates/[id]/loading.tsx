import { Loader2 } from "lucide-react";

export default function TemplatePreviewLoading() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-24 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center gap-2 text-slate-300">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading template preview...</span>
        </div>
        <div className="h-20 animate-pulse rounded-[24px] border border-white/10 bg-white/[0.04]" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="h-[640px] animate-pulse rounded-[28px] border border-white/10 bg-white/[0.04]" />
          <div className="h-[640px] animate-pulse rounded-[28px] border border-white/10 bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}
