import { Loader2 } from "lucide-react";

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 pb-16 pt-28 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center gap-2 text-slate-300">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading articles...</span>
        </div>
        <div className="h-48 animate-pulse rounded-[28px] border border-white/10 bg-white/[0.04]" />
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <div className="h-44 animate-pulse rounded-[24px] border border-white/10 bg-white/[0.04]" />
          <div className="h-44 animate-pulse rounded-[24px] border border-white/10 bg-white/[0.04]" />
          <div className="h-44 animate-pulse rounded-[24px] border border-white/10 bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}
