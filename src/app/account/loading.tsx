import { Loader2 } from "lucide-react";

export default function AccountLoading() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-20 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center gap-2 text-slate-300">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading your account workspace...</span>
        </div>
        <div className="space-y-4">
          <div className="h-36 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]" />
          <div className="h-72 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]" />
          <div className="h-56 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}
