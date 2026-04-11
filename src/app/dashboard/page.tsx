"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { getTemplateMeta } from "@/lib/templates/registry";

type ResumeRow = { id: string; title: string; templateId: string; updatedAt: string };
type DownloadRow = {
  id: string;
  createdAt: string;
  templateId: string;
  resumeTitle: string;
  resumeId: string;
};
type AdminPaymentRow = {
  id: string;
  provider: string;
  orderId: string;
  status: "CREATED" | "PAID" | "FAILED" | "CANCELLED" | "EXPIRED";
  providerStatus: string | null;
  amountInPaise: number;
  currency: string;
  createdAt: string;
  paymentConfirmedAt: string | null;
  resumeId: string;
  resumeTitle: string;
  resumeTemplateId: string;
  userId: string;
  userEmail: string;
  userName: string | null;
};

export default function DashboardPage() {
  const [resumes, setResumes] = useState<ResumeRow[]>([]);
  const [downloads, setDownloads] = useState<DownloadRow[]>([]);
  const [adminPayments, setAdminPayments] = useState<AdminPaymentRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingResume, setCreatingResume] = useState(false);
  const [deletingResumeId, setDeletingResumeId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [r1, r2, r3] = await Promise.all([
      fetch("/api/resumes"),
      fetch("/api/downloads"),
      fetch("/api/admin/payments", { cache: "no-store" }),
    ]);
    if (r1.ok) {
      const j = await r1.json();
      setResumes(j.resumes);
    }
    if (r2.ok) {
      const j = await r2.json();
      setDownloads(j.downloads);
    }
    if (r3.ok) {
      const j = await r3.json();
      setAdminPayments(j.payments as AdminPaymentRow[]);
    } else {
      setAdminPayments(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function createResume() {
    setCreatingResume(true);
    try {
      const res = await fetch("/api/resumes", { method: "POST" });
      if (!res.ok) return;
      const { id } = await res.json();
      window.location.href = `/editor/${id}`;
    } finally {
      setCreatingResume(false);
    }
  }

  async function deleteResume(id: string) {
    if (!confirm("Delete this resume?")) return;
    setDeletingResumeId(id);
    try {
      await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      void refresh();
    } finally {
      setDeletingResumeId(null);
    }
  }

  const recentActivityLabel = useMemo(() => {
    if (resumes.length === 0) return "No edits yet";
    const latest = resumes
      .map((resume) => new Date(resume.updatedAt).getTime())
      .sort((a, b) => b - a)[0];
    return new Date(latest).toLocaleDateString();
  }, [resumes]);

  function statusBadgeClass(status: AdminPaymentRow["status"]): string {
    if (status === "PAID") return "border-emerald-300/40 bg-emerald-500/15 text-emerald-200";
    if (status === "FAILED") return "border-red-300/35 bg-red-500/15 text-red-200";
    if (status === "CANCELLED") return "border-rose-300/35 bg-rose-500/15 text-rose-200";
    if (status === "EXPIRED") return "border-amber-300/35 bg-amber-500/15 text-amber-200";
    return "border-sky-300/35 bg-sky-500/15 text-sky-200";
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.18),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(34,211,238,0.16),_transparent_28%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          <div className="relative flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-2xl">
              <p className="inline-flex items-center rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-200">
                Workspace overview
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Build and ship better resumes</h1>
              <p className="mt-2 text-sm text-slate-300 sm:text-base">
                Track your documents, jump back into editing, and review download activity in one place.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void createResume()}
                disabled={creatingResume}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {creatingResume ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {creatingResume ? "Creating..." : "Create new resume"}
              </button>
            </div>
          </div>

          <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-wider text-slate-400">Total resumes</p>
              <p className="mt-1 text-2xl font-bold text-white">{resumes.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-wider text-slate-400">PDF downloads</p>
              <p className="mt-1 text-2xl font-bold text-white">{downloads.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-wider text-slate-400">Recent activity</p>
              <p className="mt-1 text-2xl font-bold text-white">{recentActivityLabel}</p>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-5">
          <section className="rounded-[24px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 lg:col-span-3">
            <div className="border-b border-white/10 px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-white">Your documents</h2>
              <p className="mt-1 text-sm text-slate-400">Open, edit, or remove resumes from your workspace.</p>
            </div>

            {loading ? (
              <div className="space-y-3 p-6">
                <div className="h-14 animate-pulse rounded-xl bg-white/10" />
                <div className="h-14 animate-pulse rounded-xl bg-white/10" />
                <div className="h-14 animate-pulse rounded-xl bg-white/10" />
              </div>
            ) : resumes.length === 0 ? (
              <div className="p-6">
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
                  <h3 className="text-lg font-semibold text-white">No resumes yet</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Start with a blank resume or pick a template to create your first document.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => void createResume()}
                      disabled={creatingResume}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {creatingResume ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {creatingResume ? "Creating..." : "Create your first resume"}
                    </button>
                    <Link
                      href="/dashboard/templates"
                      className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
                    >
                      Browse templates
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-white/10">
                {resumes.map((resume) => (
                  <li key={resume.id} className="px-5 py-4 sm:px-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <Link href={`/editor/${resume.id}`} className="text-base font-semibold text-white transition hover:text-sky-300">
                          {resume.title}
                        </Link>
                        <p className="mt-1 text-xs text-slate-400">
                          {getTemplateMeta(resume.templateId)?.name ?? resume.templateId} | Updated {new Date(resume.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/editor/${resume.id}`}
                          className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => void deleteResume(resume.id)}
                          disabled={deletingResumeId === resume.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingResumeId === resume.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                          {deletingResumeId === resume.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-[24px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 lg:col-span-2">
            <div className="border-b border-white/10 px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-white">Download history</h2>
              <p className="mt-1 text-sm text-slate-400">Recent PDF exports from your account.</p>
            </div>

            {downloads.length === 0 ? (
              <div className="p-6">
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-center">
                  <p className="text-sm font-medium text-white">No downloads yet</p>
                  <p className="mt-1 text-xs text-slate-400">Your export history will appear here after your first PDF download.</p>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-white/10">
                {downloads.map((download) => (
                  <li key={download.id} className="px-5 py-4 sm:px-6">
                    <p className="text-sm font-medium text-white">{download.resumeTitle}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {download.templateId} | {new Date(download.createdAt).toLocaleString()}
                    </p>
                    <Link
                      href={`/editor/${download.resumeId}`}
                      className="mt-2 inline-flex text-xs font-semibold text-sky-300 transition hover:text-sky-200"
                    >
                      Open resume
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {adminPayments !== null ? (
          <section className="mt-8 rounded-[24px] border border-cyan-300/20 bg-white/[0.04] shadow-2xl shadow-black/20">
            <div className="border-b border-cyan-200/15 px-5 py-4 sm:px-6">
              <p className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100">
                Admin
              </p>
              <h2 className="mt-3 text-base font-semibold text-white">Payment orders</h2>
              <p className="mt-1 text-sm text-slate-400">Status by resume and customer (latest 120 orders).</p>
            </div>

            {adminPayments.length === 0 ? (
              <div className="p-6">
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-center">
                  <p className="text-sm font-medium text-white">No payment orders yet</p>
                  <p className="mt-1 text-xs text-slate-400">Orders will appear here after checkout is started.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm text-slate-200">
                  <thead className="border-b border-white/10 bg-white/[0.03] text-[11px] uppercase tracking-[0.15em] text-slate-400">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Order</th>
                      <th className="px-5 py-3 font-semibold">Customer</th>
                      <th className="px-5 py-3 font-semibold">Resume</th>
                      <th className="px-5 py-3 font-semibold">Amount</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold">Created</th>
                      <th className="px-5 py-3 font-semibold">Paid at</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {adminPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="whitespace-nowrap px-5 py-4">
                          <p className="font-semibold text-white">{payment.orderId}</p>
                          <p className="mt-1 text-xs text-slate-400">{payment.provider.toUpperCase()}</p>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <p className="text-sm text-white">{payment.userName || "-"}</p>
                          <p className="mt-1 text-xs text-slate-400">{payment.userEmail}</p>
                        </td>
                        <td className="px-5 py-4">
                          <Link href={`/editor/${payment.resumeId}`} className="font-semibold text-sky-300 transition hover:text-sky-200">
                            {payment.resumeTitle}
                          </Link>
                          <p className="mt-1 text-xs text-slate-400">{payment.resumeTemplateId}</p>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          {(payment.amountInPaise / 100).toLocaleString("en-IN", {
                            style: "currency",
                            currency: payment.currency,
                          })}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${statusBadgeClass(payment.status)}`}>
                            {payment.status}
                          </span>
                          {payment.providerStatus ? (
                            <p className="mt-1 text-[11px] text-slate-400">Gateway: {payment.providerStatus}</p>
                          ) : null}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-300">
                          {new Date(payment.createdAt).toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-300">
                          {payment.paymentConfirmedAt
                            ? new Date(payment.paymentConfirmedAt).toLocaleString()
                            : "-"}
                        </td>
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
