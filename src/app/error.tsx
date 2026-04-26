"use client";

import Link from "next/link";
import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error("global-error-boundary", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_45%,#f8fafc_100%)] px-6 py-16 text-slate-950">
        <main className="mx-auto flex max-w-xl flex-col items-start gap-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70">
          <p className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-rose-700">
            Application error
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
          <p className="text-sm text-slate-600">
            The page failed to render. You can retry now, or return to home and continue building your resume.
          </p>
          {error.digest ? (
            <p className="text-xs text-slate-500">Error code: {error.digest}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-3">
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
        </main>
      </body>
    </html>
  );
}
