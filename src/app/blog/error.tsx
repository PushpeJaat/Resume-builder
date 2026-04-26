"use client";

import Link from "next/link";
import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function BlogError({ error, reset }: Props) {
  useEffect(() => {
    console.error("blog-route-error", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-28 text-white sm:px-6">
      <div className="mx-auto max-w-xl rounded-[28px] border border-white/10 bg-white/[0.05] p-8 shadow-2xl shadow-black/30">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">Blog temporarily unavailable</p>
        <h1 className="mt-3 text-2xl font-semibold">Could not load blog posts</h1>
        <p className="mt-2 text-sm text-slate-300">
          Please retry in a few seconds. The content service may be warming up.
        </p>
        {error.digest ? <p className="mt-2 text-xs text-slate-400">Error code: {error.digest}</p> : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
          >
            Retry
          </button>
          <Link
            href="/"
            className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
