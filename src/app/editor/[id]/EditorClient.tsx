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
  const [importState, setImportState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

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

  const importResumeFile = useCallback(
    async (file: File) => {
      setImportState("loading");
      setImportMessage(null);
      const formData = new FormData();
      formData.set("file", file);

      const res = await fetch("/api/resumes/import", {
        method: "POST",
        body: formData,
      });

      const json = (await res.json().catch(() => null)) as
        | { data?: ResumeData; titleSuggestion?: string; mode?: "ai" | "heuristic"; warning?: string; error?: string }
        | null;

      if (!res.ok || !json?.data) {
        setImportState("error");
        setImportMessage(json?.error ?? "Could not import that resume.");
        return;
      }

      setData(json.data);
      if (json.titleSuggestion) {
        setTitle(json.titleSuggestion);
      }
      setImportState("success");
      setImportMessage(
        json.warning ?? (json.mode === "ai" ? "Resume imported with AI extraction." : "Resume imported with the fallback parser."),
      );
    },
    [],
  );

  const onImportInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    await importResumeFile(file);
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
        <AppHeader />
        <div className="flex min-h-0 flex-1 flex-col border-t border-slate-200 lg:flex-row">
          <aside className="flex w-full flex-col border-slate-200 bg-white lg:w-[min(440px,100%)] lg:border-r lg:shrink-0">
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
              <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
              <div className="h-8 flex-1 animate-pulse rounded-lg bg-slate-200" />
            </div>
            <div className="flex-1 space-y-4 p-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
                  <div className="mt-3 space-y-2">
                    <div className="h-8 w-full animate-pulse rounded-lg bg-slate-200" />
                    <div className="h-8 w-full animate-pulse rounded-lg bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 p-4">
              <div className="h-10 w-full animate-pulse rounded-xl bg-slate-200" />
            </div>
          </aside>
          <main className="flex-1 p-4">
            <div className="h-full w-full animate-pulse rounded-2xl bg-slate-100" />
          </main>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <AppHeader />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Resume not found</h2>
            <p className="mt-2 max-w-xs text-sm text-slate-500">
              This resume may have been deleted or you don&apos;t have access to it.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Back to dashboard
            </Link>
          </div>
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
            <Link
              href="/dashboard"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </Link>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="min-w-[140px] flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-400/20"
              placeholder="Resume title"
            />
            <span
              className={`shrink-0 text-xs font-medium transition-colors ${
                saveState === "saving"
                  ? "text-amber-500"
                  : saveState === "saved"
                    ? "text-emerald-600"
                    : saveState === "error"
                      ? "text-red-500"
                      : "text-transparent select-none"
              }`}
            >
              {saveState === "saving"
                ? "Saving…"
                : saveState === "saved"
                  ? "Saved ✓"
                  : saveState === "error"
                    ? "Save failed"
                    : "–"}
            </span>
          </div>
          {premiumLockedExport ? (
            <div className="flex items-center gap-2 border-b border-violet-100 bg-violet-50 px-4 py-2.5">
              <span className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-violet-700">
                Pro
              </span>
              <span className="text-xs text-violet-800">
                template selected —{" "}
                <button
                  type="button"
                  className="font-semibold underline decoration-violet-400 underline-offset-2 hover:text-violet-900"
                  onClick={() => setUpgradeOpen(true)}
                >
                  upgrade to export PDF
                </button>
              </span>
            </div>
          ) : null}
          <div className="border-b border-slate-100 px-4 py-4">
            <input
              ref={importInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.md,application/pdf,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(event) => void onImportInputChange(event)}
            />
            <div
              role="button"
              tabIndex={0}
              onClick={() => importInputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  importInputRef.current?.click();
                }
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setDragActive(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setDragActive(false);
                const file = event.dataTransfer.files?.[0];
                if (file) {
                  void importResumeFile(file);
                }
              }}
              className={`rounded-2xl border border-dashed p-4 text-left transition ${
                dragActive ? "border-sky-400 bg-sky-50" : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100/80"
              }`}
            >
              <p className="text-sm font-semibold text-slate-900">Import an existing resume</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Drop a PDF, DOCX, TXT, or Markdown resume here. We&apos;ll extract the content and populate the editor automatically.
              </p>
              <div className="mt-3 inline-flex items-center rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
                {importState === "loading" ? "Importing..." : "Choose file"}
              </div>
              {importMessage ? (
                <p className={`mt-3 text-xs ${importState === "error" ? "text-red-600" : "text-emerald-600"}`}>{importMessage}</p>
              ) : null}
            </div>
          </div>
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              {pdfState === "loading" ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Preparing PDF…
                </>
              ) : premiumLockedExport ? (
                "Upgrade to Download"
              ) : (
                "Download PDF"
              )}
            </button>
            {pdfError && !premiumLockedExport ? (
              <p className="mt-2 text-center text-xs text-red-600">{pdfError}</p>
            ) : null}
          </div>
        </aside>
        <main className="relative flex min-h-[50vh] min-w-0 flex-1 flex-col overflow-hidden lg:min-h-0">
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Preview</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">Live</span>
          </div>
          <div className="flex-1 overflow-auto bg-slate-100 p-4">
            <ResumePreviewFrame templateId={templateId} data={data} />
          </div>
        </main>
      </div>
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}
