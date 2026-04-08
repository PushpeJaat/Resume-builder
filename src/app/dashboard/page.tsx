"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { UpgradeModal } from "@/components/upgrade/UpgradeModal";
import { getTemplateMeta } from "@/lib/templates/registry";

type ResumeRow = { id: string; title: string; templateId: string; updatedAt: string };
type DownloadRow = {
  id: string;
  createdAt: string;
  templateId: string;
  resumeTitle: string;
  resumeId: string;
};

export default function DashboardPage() {
  const [resumes, setResumes] = useState<ResumeRow[]>([]);
  const [downloads, setDownloads] = useState<DownloadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [r1, r2] = await Promise.all([fetch("/api/resumes"), fetch("/api/downloads")]);
    if (r1.ok) {
      const j = await r1.json();
      setResumes(j.resumes);
    }
    if (r2.ok) {
      const j = await r2.json();
      setDownloads(j.downloads);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function createResume() {
    const res = await fetch("/api/resumes", { method: "POST" });
    if (!res.ok) return;
    const { id } = await res.json();
    window.location.href = `/editor/${id}`;
  }

  async function deleteResume(id: string) {
    if (!confirm("Delete this resume?")) return;
    await fetch(`/api/resumes/${id}`, { method: "DELETE" });
    void refresh();
  }

  const recentActivityLabel = useMemo(() => {
    if (resumes.length === 0) return "No edits yet";
    const latest = resumes
      .map((resume) => new Date(resume.updatedAt).getTime())
      .sort((a, b) => b - a)[0];
    return new Date(latest).toLocaleDateString();
  }, [resumes]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-sky-100 blur-2xl" />
          <div className="absolute -bottom-20 left-6 h-36 w-36 rounded-full bg-cyan-100 blur-2xl" />

          <div className="relative flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-2xl">
              <p className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
                Workspace overview
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Build and ship better resumes</h1>
              <p className="mt-2 text-sm text-slate-600 sm:text-base">
                Track your documents, jump back into editing, and review download activity in one place.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setUpgradeOpen(true)}
                className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-900 hover:bg-amber-100"
              >
                Upgrade to Pro
              </button>
              <button
                type="button"
                onClick={() => void createResume()}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                Create new resume
              </button>
            </div>
          </div>

          <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">Total resumes</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{resumes.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">PDF downloads</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{downloads.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">Recent activity</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{recentActivityLabel}</p>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-5">
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-3">
            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-slate-900">Your documents</h2>
              <p className="mt-1 text-sm text-slate-500">Open, edit, or remove resumes from your workspace.</p>
            </div>

            {loading ? (
              <div className="space-y-3 p-6">
                <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
              </div>
            ) : resumes.length === 0 ? (
              <div className="p-6">
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <h3 className="text-lg font-semibold text-slate-900">No resumes yet</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Start with a blank resume or pick a template to create your first document.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => void createResume()}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      Create your first resume
                    </button>
                    <Link
                      href="/dashboard/templates"
                      className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
                    >
                      Browse templates
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {resumes.map((resume) => (
                  <li key={resume.id} className="px-5 py-4 sm:px-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <Link href={`/editor/${resume.id}`} className="text-base font-semibold text-slate-900 hover:text-sky-700">
                          {resume.title}
                        </Link>
                        <p className="mt-1 text-xs text-slate-500">
                          {getTemplateMeta(resume.templateId)?.name ?? resume.templateId} | Updated {new Date(resume.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/editor/${resume.id}`}
                          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => void deleteResume(resume.id)}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-slate-900">Download history</h2>
              <p className="mt-1 text-sm text-slate-500">Recent PDF exports from your account.</p>
            </div>

            {downloads.length === 0 ? (
              <div className="p-6">
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <p className="text-sm font-medium text-slate-700">No downloads yet</p>
                  <p className="mt-1 text-xs text-slate-500">Your export history will appear here after your first PDF download.</p>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {downloads.map((download) => (
                  <li key={download.id} className="px-5 py-4 sm:px-6">
                    <p className="text-sm font-medium text-slate-900">{download.resumeTitle}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {download.templateId} | {new Date(download.createdAt).toLocaleString()}
                    </p>
                    <Link
                      href={`/editor/${download.resumeId}`}
                      className="mt-2 inline-flex text-xs font-semibold text-sky-700 hover:text-sky-900"
                    >
                      Open resume
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}
