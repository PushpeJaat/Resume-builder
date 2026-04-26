import { Loader2 } from "lucide-react";

export default function ResumeEditorLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-lg shadow-slate-200/70">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm font-medium">Loading your resume editor...</span>
      </div>
    </div>
  );
}
