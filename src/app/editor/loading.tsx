import { Loader2 } from "lucide-react";

export default function EditorLoading() {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-20 text-slate-800 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center gap-2 text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Preparing editor workspace...</span>
        </div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
          <div className="h-[70vh] animate-pulse rounded-3xl border border-slate-200 bg-white" />
          <div className="h-[70vh] animate-pulse rounded-3xl border border-slate-200 bg-white" />
        </div>
      </div>
    </div>
  );
}
