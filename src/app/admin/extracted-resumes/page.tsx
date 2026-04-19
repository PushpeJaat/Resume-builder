"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Loader2 } from "lucide-react";

type ExtractedResumeRow = {
  id: string;
  source_file_name: string;
  created_at: string;
  created_at_readable: string;
  full_name: string;
  email: string;
  phone: string;
  summary_preview: string;
};

type LoadState = "loading" | "ready" | "unauthorized" | "forbidden" | "error";

export default function AdminExtractedResumesPage() {
  const [rows, setRows] = useState<ExtractedResumeRow[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  const load = useCallback(async () => {
    setLoadState("loading");

    const response = await fetch("/api/admin/extracted-resumes", {
      cache: "no-store",
    });

    if (response.status === 401) {
      setLoadState("unauthorized");
      return;
    }

    if (response.status === 403) {
      setLoadState("forbidden");
      return;
    }

    if (!response.ok) {
      setLoadState("error");
      return;
    }

    const payload = (await response.json().catch(() => null)) as
      | { extracted_resumes?: ExtractedResumeRow[] }
      | null;

    setRows(Array.isArray(payload?.extracted_resumes) ? payload.extracted_resumes : []);
    setLoadState("ready");
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <section className="relative overflow-hidden rounded-[28px] border border-cyan-300/20 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.16),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(56,189,248,0.14),_transparent_30%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/35 to-transparent" />

          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100">
                Admin
              </p>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">Extracted resumes</h1>
              <p className="mt-2 text-sm text-slate-300">
                Review parsed resume records with readable timestamps and source file metadata.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/admin/dashboard"
                className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
              >
                Back to admin dashboard
              </Link>
              <button
                type="button"
                onClick={() => void signOut({ callbackUrl: "/admin" })}
                className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
              >
                Log out
              </button>
              <button
                type="button"
                onClick={() => void load()}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-105"
              >
                <Loader2 className={`h-4 w-4 ${loadState === "loading" ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>
        </section>

        {loadState === "loading" ? (
          <section className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20">
            <div className="space-y-3">
              <div className="h-12 animate-pulse rounded-xl bg-white/10" />
              <div className="h-12 animate-pulse rounded-xl bg-white/10" />
              <div className="h-12 animate-pulse rounded-xl bg-white/10" />
              <div className="h-12 animate-pulse rounded-xl bg-white/10" />
            </div>
          </section>
        ) : null}

        {loadState === "unauthorized" ? (
          <section className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.04] p-6 text-center shadow-2xl shadow-black/20">
            <h2 className="text-lg font-semibold text-white">Sign in required</h2>
            <p className="mt-2 text-sm text-slate-400">You need to sign in before viewing admin extracted resumes.</p>
            <Link
              href="/admin"
              className="mt-4 inline-flex rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-105"
            >
              Go to admin sign in
            </Link>
          </section>
        ) : null}

        {loadState === "forbidden" ? (
          <section className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.04] p-6 text-center shadow-2xl shadow-black/20">
            <h2 className="text-lg font-semibold text-white">Admin access only</h2>
            <p className="mt-2 text-sm text-slate-400">
              Your account is not listed in ADMIN_EMAILS or ADMIN_EMAIL.
            </p>
          </section>
        ) : null}

        {loadState === "error" ? (
          <section className="mt-8 rounded-[24px] border border-red-300/25 bg-red-500/10 p-6 text-center shadow-2xl shadow-black/20">
            <h2 className="text-lg font-semibold text-red-100">Could not load extracted resumes</h2>
            <p className="mt-2 text-sm text-red-100/80">Please try again. If this keeps failing, check server logs.</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-4 rounded-lg border border-red-200/40 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/20"
            >
              Retry
            </button>
          </section>
        ) : null}

        {loadState === "ready" ? (
          <section className="mt-8 rounded-[24px] border border-cyan-300/20 bg-white/[0.04] shadow-2xl shadow-black/20">
            <div className="border-b border-cyan-200/15 px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-white">extracted_resumes</h2>
              <p className="mt-1 text-sm text-slate-400">Latest 200 extracted records from AI parsing.</p>
            </div>

            {rows.length === 0 ? (
              <div className="p-6">
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-center">
                  <p className="text-sm font-medium text-white">No extracted resumes yet</p>
                  <p className="mt-1 text-xs text-slate-400">Records will appear here after `/api/extract-resume` is used.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm text-slate-200">
                  <thead className="border-b border-white/10 bg-white/[0.03] text-[11px] uppercase tracking-[0.15em] text-slate-400">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Source file</th>
                      <th className="px-5 py-3 font-semibold">Name</th>
                      <th className="px-5 py-3 font-semibold">Email</th>
                      <th className="px-5 py-3 font-semibold">Phone</th>
                      <th className="px-5 py-3 font-semibold">created_at_readable</th>
                      <th className="px-5 py-3 font-semibold">Summary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {rows.map((row) => (
                      <tr key={row.id}>
                        <td className="px-5 py-4 align-top">
                          <p className="max-w-[220px] truncate font-semibold text-white">{row.source_file_name || "-"}</p>
                          <p className="mt-1 text-[11px] text-slate-400">{row.id}</p>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 align-top text-sm text-white">{row.full_name || "-"}</td>
                        <td className="whitespace-nowrap px-5 py-4 align-top text-sm text-slate-200">{row.email || "-"}</td>
                        <td className="whitespace-nowrap px-5 py-4 align-top text-sm text-slate-200">{row.phone || "-"}</td>
                        <td className="whitespace-nowrap px-5 py-4 align-top text-sm text-cyan-200">
                          <p>{row.created_at_readable || "-"}</p>
                          <p className="mt-1 text-[11px] text-slate-400">{row.created_at}</p>
                        </td>
                        <td className="px-5 py-4 align-top text-sm text-slate-300">{row.summary_preview || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}
      </main>
    </div>
  );
}
