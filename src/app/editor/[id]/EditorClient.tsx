"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { ResumeEditor } from "@/components/editor/ResumeEditor";
import { ResumePreviewFrame } from "@/components/editor/ResumePreviewFrame";
import { emptyResumeData, resumeDataSchema, type ResumeData } from "@/types/resume";

type Props = { resumeId: string };

export function EditorClient({ resumeId }: Props) {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const autoDownload = searchParams.get("autoDownload") === "1";
  const [title, setTitle] = useState("");
  const [templateId, setTemplateId] = useState("modern-professional");
  const [data, setData] = useState<ResumeData>(emptyResumeData());
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [pdfState, setPdfState] = useState<"idle" | "loading" | "error">("idle");
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [importState, setImportState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const isLoggedIn = Boolean(session?.user?.id);

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
    if (isLoggedIn) {
      void load();
    } else if (status !== "loading") {
      setLoading(false);
    }
  }, [load, isLoggedIn, status]);

  // Auto-trigger PDF download when redirected here after sign-in with ?autoDownload=1
  const autoDownloadFiredRef = useRef(false);
  useEffect(() => {
    if (!autoDownload || loading || !isLoggedIn || autoDownloadFiredRef.current) return;
    autoDownloadFiredRef.current = true;
    // Strip the query param from the URL so a refresh doesn't re-trigger
    router.replace(`/editor/${resumeId}`, { scroll: false });
    // Small delay so the preview/iframe has a chance to settle before PDF request
    const t = setTimeout(() => void downloadPdf(), 800);
    return () => clearTimeout(t);
    // downloadPdf is defined below; eslint-disable-next-line is intentional
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDownload, loading, isLoggedIn]);

  const persist = useCallback(
    async (patch: { title?: string; templateId?: string; data?: ResumeData }) => {
      if (!isLoggedIn) return;
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
    [resumeId, isLoggedIn],
  );

  useEffect(() => {
    if (loading || !isLoggedIn) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void persist({ title, templateId, data });
    }, 750);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [title, templateId, data, loading, persist, isLoggedIn]);

  const downloadPdf = async () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    setPdfState("loading");
    setPdfError(null);
    const res = await fetch(`/api/resumes/${resumeId}/pdf`, { method: "POST" });
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
        <div className="flex min-h-0 flex-1 border-t border-slate-200">
          <aside className="flex w-2/5 min-w-[340px] flex-col border-r border-slate-200 bg-white">
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
              href="/"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <AppHeader />
      <div className="flex min-h-0 flex-1 border-t border-slate-200">
        {/* Left: Data input (40% width) */}
        <aside className="flex w-2/5 min-w-[340px] flex-col border-r border-slate-200 bg-white">
          {/* Title bar */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3">
            <Link
              href={isLoggedIn ? "/dashboard" : "/"}
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              {isLoggedIn ? "Dashboard" : "Home"}
            </Link>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="min-w-[140px] flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-400/20"
              placeholder="Resume title"
            />
            {isLoggedIn && (
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
                  ? "Saving\u2026"
                  : saveState === "saved"
                    ? "Saved \u2713"
                    : saveState === "error"
                      ? "Save failed"
                      : "\u2013"}
              </span>
            )}
          </div>
          {/* Import section */}
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
                Drop a PDF, DOCX, TXT, or Markdown resume here.
              </p>
              <div className="mt-3 inline-flex items-center rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
                {importState === "loading" ? "Importing..." : "Choose file"}
              </div>
              {importMessage ? (
                <p className={`mt-3 text-xs ${importState === "error" ? "text-red-600" : "text-emerald-600"}`}>{importMessage}</p>
              ) : null}
            </div>
          </div>
          {/* Resume editor form */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <ResumeEditor data={data} onChange={setData} />
          </div>
          {/* Download button */}
          <div className="border-t border-slate-200 bg-white p-4">
            <button
              type="button"
              onClick={() => void downloadPdf()}
              disabled={pdfState === "loading"}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              {pdfState === "loading" ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Preparing PDF&hellip;
                </>
              ) : (
                "Download PDF"
              )}
            </button>
            {pdfError ? (
              <p className="mt-2 text-center text-xs text-red-600">{pdfError}</p>
            ) : null}
          </div>
        </aside>

        {/* Right: Live resume preview (60% width) */}
        <main className="relative flex min-h-0 w-3/5 flex-col overflow-hidden">
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Preview</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">Live</span>
          </div>
          <div className="flex-1 overflow-auto bg-slate-100 p-4">
            <ResumePreviewFrame templateId={templateId} data={data} />
          </div>
        </main>
      </div>

      {/* Auth modal for download */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Sign In to Download
              </h2>
              <p className="text-slate-600 mb-6">
                Create a free account or sign in to download your resume as PDF.
              </p>
              <div className="space-y-3">
                <Link
                  href="/signup"
                  className="block w-full px-4 py-3 rounded-lg bg-gradient-to-r from-sky-600 to-cyan-600 text-white font-semibold text-center hover:from-sky-700 hover:to-cyan-700 transition-all duration-200"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/login"
                  className="block w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 font-semibold text-center hover:bg-slate-50 transition-colors duration-200"
                >
                  Sign In
                </Link>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full mt-4 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
