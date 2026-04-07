"use client";

import { useCallback, useEffect, useState } from "react";
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

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Your resumes</h1>
            <p className="mt-1 text-sm text-slate-600">Open the editor to change content, templates, and export PDFs.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setUpgradeOpen(true)}
              className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-900 hover:bg-violet-100"
            >
              Upgrade to Pro
            </button>
            <button
              type="button"
              onClick={() => void createResume()}
              className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
            >
              New resume
            </button>
          </div>
        </div>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3 sm:px-6">
            <h2 className="text-sm font-semibold text-slate-900">All documents</h2>
          </div>
          {loading ? (
            <p className="p-6 text-sm text-slate-500">Loading…</p>
          ) : resumes.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No resumes yet. Create one to get started.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {resumes.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
                  <div>
                    <Link href={`/editor/${r.id}`} className="font-semibold text-slate-900 hover:text-sky-700">
                      {r.title}
                    </Link>
                    <p className="text-xs text-slate-500">
                      Template: {getTemplateMeta(r.templateId)?.name ?? r.templateId} · Updated{" "}
                      {new Date(r.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/editor/${r.id}`}
                      className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => void deleteResume(r.id)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3 sm:px-6">
            <h2 className="text-sm font-semibold text-slate-900">Download history</h2>
            <p className="text-xs text-slate-500">Logged each time Browserless returns a PDF.</p>
          </div>
          {downloads.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No downloads yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {downloads.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{d.resumeTitle}</p>
                    <p className="text-xs text-slate-500">
                      {d.templateId} · {new Date(d.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Link
                    href={`/editor/${d.resumeId}`}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-800"
                  >
                    Open resume
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}
