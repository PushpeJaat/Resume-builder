"use client";

import Link from "next/link";
import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ResumeScoreError({ error, reset }: Props) {
  useEffect(() => {
    console.error("resume-score-route-error", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/70">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">Resume score unavailable</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">Could not open this tool</h1>
        <p className="mt-2 text-sm text-slate-600">Please retry now or return to home and try again.</p>
        {error.digest ? <p className="mt-2 text-xs text-slate-500">Error code: {error.digest}</p> : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
