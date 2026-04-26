import { Loader2 } from "lucide-react";

export default function ResumeScoreLoading() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex items-center gap-2 text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading resume score tool...</span>
        </div>
        <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      </div>
    </div>
  );
}
