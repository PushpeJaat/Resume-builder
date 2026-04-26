import { Loader2 } from "lucide-react";

export default function DashboardTemplatesLoading() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_38%,#f8fafc_100%)] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center gap-2 text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading templates...</span>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 sm:gap-6 lg:gap-8">
          <div className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          <div className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          <div className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          <div className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          <div className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          <div className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        </div>
      </div>
    </div>
  );
}
