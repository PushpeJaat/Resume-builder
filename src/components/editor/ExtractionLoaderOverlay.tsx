"use client";

export function ExtractionLoaderOverlay() {
  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/45 backdrop-blur-[2px]" aria-hidden="true">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-60 w-60 items-center justify-center">
        <div className="absolute inset-0 animate-[spin_4.2s_linear_infinite] rounded-full border-[3px] border-cyan-200/30 border-t-cyan-400 border-r-sky-500 shadow-[0_0_70px_rgba(34,211,238,0.35)]" />
        <div className="absolute inset-6 animate-[spin_3.4s_linear_infinite_reverse] rounded-full border-[3px] border-sky-200/25 border-t-sky-300 border-r-cyan-300" />
        <div className="absolute inset-12 animate-pulse rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.42)_0%,rgba(34,211,238,0.12)_45%,rgba(15,23,42,0)_70%)]" />

        <div className="absolute h-10 w-10 animate-[pulse_1.45s_ease-in-out_infinite] rounded-xl bg-[linear-gradient(135deg,#0891b2,#22d3ee)] shadow-[0_0_40px_rgba(34,211,238,0.55)]" />

        <div className="absolute h-3 w-3 animate-[ping_1.8s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full bg-cyan-200" />
        </div>
        <p className="text-center text-sm font-medium text-cyan-50/95">
          Your information is extracting by AI
        </p>
      </div>
    </div>
  );
}
