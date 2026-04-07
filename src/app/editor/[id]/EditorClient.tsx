"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { ResumeEditor } from "@/components/editor/ResumeEditor";
import { ResumePreviewFrame } from "@/components/editor/ResumePreviewFrame";
import { UpgradeModal } from "@/components/upgrade/UpgradeModal";
import { emptyResumeData, resumeDataSchema, type ResumeData } from "@/types/resume";
import { isPremiumTemplate } from "@/lib/templates/registry";

type Props = { resumeId: string };

export function EditorClient({ resumeId }: Props) {
  const { data: session, status } = useSession();
  const [title, setTitle] = useState("");
  const [templateId, setTemplateId] = useState("modern-professional");
  const [data, setData] = useState<ResumeData>(emptyResumeData());
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [pdfState, setPdfState] = useState<"idle" | "loading" | "error">("idle");
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    const res = await fetch(`/api/resumes/${resumeId}`);
    if (!res.ok) {
      setLoading(false);
      if (res.status === 404) setNotFound(true);
      return;
    }
    const json = await res.json();
    const r = json.resume;
    setTitle(r.title);
    setTemplateId(r.templateId);
    const parsed = resumeDataSchema.safeParse(r.data);
    setData(parsed.success ? parsed.data : emptyResumeData());
    setLoading(false);
  }, [resumeId]);

  useEffect(() => {
    void load();
  }, [load]);

  const persist = useCallback(
    async (patch: { title?: string; templateId?: string; data?: ResumeData }) => {
      setSaveState("saving");
      const res = await fetch(`/api/resumes/${resumeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        setSaveState("error");
        return;
      }
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1500);
    },
    [resumeId],
  );

  useEffect(() => {
    if (loading) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void persist({ title, templateId, data });
    }, 750);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [title, templateId, data, loading, persist]);

  const downloadPdf = async () => {
    setPdfState("loading");
    setPdfError(null);
    const res = await fetch(`/api/resumes/${resumeId}/pdf`, { method: "POST" });
    if (res.status === 403) {
      setPdfState("error");
      setPdfError("This template requires Pro for PDF export.");
      setUpgradeOpen(true);
      return;
    }
    if (!res.ok) {
      const j = await res.json().catch(() => null);
      setPdfState("error");
      setPdfError((j?.error as string) || "Could not generate PDF.");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^\w\s-]/g, "").trim() || "resume"}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    setPdfState("idle");
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <AppHeader />
        <div className="flex flex-1 items-center justify-center text-sm text-slate-500">Loading editor…</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <AppHeader />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-lg font-semibold text-slate-900">Resume not found</p>
          <Link href="/dashboard" className="text-sm font-semibold text-sky-600 hover:text-sky-800">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const plan = session.user.plan;
  const premiumLockedExport = isPremiumTemplate(templateId) && plan !== "PREMIUM";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <AppHeader />
      <div className="flex min-h-0 flex-1 flex-col border-t border-slate-200 lg:flex-row">
        <aside className="flex w-full flex-col border-slate-200 bg-white lg:w-[min(440px,100%)] lg:border-r lg:shrink-0">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3">
            <Link href="/dashboard" className="text-sm font-medium text-sky-600 hover:text-sky-800">
              ← Dashboard
            </Link>
            <span className="text-slate-300">|</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="min-w-[160px] flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
              placeholder="Resume title"
            />
            <span className="text-xs text-slate-400">
              {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : saveState === "error" ? "Save failed" : ""}
            </span>
          </div>
          {premiumLockedExport ? (
            <div className="border-b border-violet-100 bg-violet-50 px-4 py-2 text-xs text-violet-900">
              You are previewing a <strong>Pro</strong> template.{" "}
              <button type="button" className="font-semibold underline" onClick={() => setUpgradeOpen(true)}>
                Upgrade
              </button>{" "}
              to download the PDF.
            </div>
          ) : null}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <ResumeEditor
              data={data}
              onChange={setData}
              templateId={templateId}
              onTemplateId={setTemplateId}
              userPlan={plan}
              onPremiumIntent={() => setUpgradeOpen(true)}
            />
          </div>
          <div className="border-t border-slate-200 bg-white p-4">
            <button
              type="button"
              onClick={() => void downloadPdf()}
              disabled={pdfState === "loading" || premiumLockedExport}
              className="w-full rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {pdfState === "loading" ? "Preparing PDF…" : "Download PDF"}
            </button>
            {pdfError ? <p className="mt-2 text-center text-xs text-red-600">{pdfError}</p> : null}
          </div>
        </aside>
        <main className="relative flex min-h-[50vh] min-w-0 flex-1 flex-col p-4 lg:min-h-0">
          <ResumePreviewFrame templateId={templateId} data={data} />
        </main>
      </div>
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}
