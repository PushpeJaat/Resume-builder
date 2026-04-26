"use client";

import Link from "next/link";
import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardTemplatesError({ error, reset }: Props) {
  useEffect(() => {
    console.error("dashboard-templates-route-error", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_45%,#f8fafc_100%)] px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">Templates error</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">Could not load template gallery</h1>
        <p className="mt-2 text-sm text-slate-600">Retry now, or return to dashboard and continue from there.</p>
        {error.digest ? <p className="mt-2 text-xs text-slate-500">Error code: {error.digest}</p> : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Retry
          </button>
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
