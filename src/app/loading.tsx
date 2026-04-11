import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_42%,#f8fafc_100%)] px-6">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-lg shadow-slate-200/60">
        <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
        <p className="text-sm font-medium text-slate-700">Loading your workspace...</p>
      </div>
    </div>
  );
}
