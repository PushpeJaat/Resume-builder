"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Bot,
  Check,
  ChevronDown,
  Download,
  Eye,
  FileText,
  Loader2,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { ResumeEditor } from "@/components/editor/ResumeEditor";
import { ResumePreviewFrame } from "@/components/editor/ResumePreviewFrame";
import { TEMPLATES, getTemplateMeta, DEFAULT_TEMPLATE_ID } from "@/lib/templates/registry";
import { emptyResumeData, type ResumeData } from "@/types/resume";

export default function EditorLandingClient() {
  const searchParams = useSearchParams();
  const rawTemplate = searchParams.get("template") ?? DEFAULT_TEMPLATE_ID;
  const initialTemplate = getTemplateMeta(rawTemplate) ? rawTemplate : DEFAULT_TEMPLATE_ID;

  const [templateId, setTemplateId] = useState(initialTemplate);
  const [data, setData] = useState<ResumeData>(emptyResumeData());
  const { data: session } = useSession();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);

  // Import state
  const [importState, setImportState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [importError, setImportError] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const templateMenuRef = useRef<HTMLDivElement | null>(null);

  const currentTemplate = TEMPLATES.find((t) => t.id === templateId);

  /* â”€â”€ Import â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const importResumeFile = async (file: File) => {
    setImportState("loading");
    setImportError("");
    const formData = new FormData();
    formData.set("file", file);
    const res = await fetch("/api/resumes/import", { method: "POST", body: formData });
    const json = (await res.json().catch(() => null)) as
      | { data?: ResumeData; mode?: "ai" | "heuristic"; warning?: string; error?: string }
      | null;

    if (!res.ok || !json?.data) {
      const message = json?.error ?? "Could not import that file.";
      setImportState("error");
      setImportError(message);
      toast.error(message);
      setTimeout(() => setImportState("idle"), 3000);
      return;
    }
    setData(json.data);
    setImportState("success");
    setImportError("");
    if (json.warning) {
      toast.warning(json.warning);
    }
    toast.success(
      json.mode === "ai"
        ? "Resume extracted with AI â€” fields auto-filled!"
        : "Resume imported successfully.",
    );
    setTimeout(() => setImportState("idle"), 3000);
  };

  /* â”€â”€ Download (gate with auth) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const handleDownload = () => {
    if (session?.user) return; // logged-in users should use the saved editor
    try {
      sessionStorage.setItem(
        "pendingResume",
        JSON.stringify({
          templateId,
          data,
          title: `My ${currentTemplate?.name ?? "Resume"}`,
        }),
      );
    } catch {
      // sessionStorage unavailable â€” continue
    }
    setShowAuthModal(true);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 text-white">
      <AppHeader />

      {/* â”€â”€ Toolbar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex shrink-0 items-center gap-2 border-b border-white/10 bg-slate-900/70 px-4 py-2.5 backdrop-blur-xl">
        <Link
          href="/"
          className="mr-1 flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>

        <div className="h-4 w-px bg-white/10" />

        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
          {currentTemplate?.name ?? "Resume Editor"}
        </span>

        {!session?.user && (
          <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-200">
            Guest mode
          </span>
        )}

        {/* Template switcher */}
        <div ref={templateMenuRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowTemplateMenu((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            <Eye className="h-3.5 w-3.5 text-slate-400" />
            <span className="max-w-[120px] truncate">{currentTemplate?.name ?? "Template"}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>
          {showTemplateMenu && (
            <div className="absolute right-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-white/10 bg-slate-800 shadow-2xl shadow-black/40">
              <div className="p-1.5">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => { setTemplateId(t.id); setShowTemplateMenu(false); }}
                    className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-white/5 ${templateId === t.id ? "bg-sky-500/10 text-sky-300" : "text-slate-200"}`}
                  >
                    <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${templateId === t.id ? "bg-sky-400" : "bg-white/20"}`} />
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="mt-0.5 text-xs leading-tight text-slate-400">{t.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Download */}
        <button
          type="button"
          onClick={handleDownload}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:brightness-110"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </button>
      </div>

      {/* â”€â”€ AI Import Dropzone (full width) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload existing resume to auto-fill with AI"
        onClick={() => importState === "idle" && importInputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && importState === "idle") {
            e.preventDefault();
            importInputRef.current?.click();
          }
        }}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          const file = e.dataTransfer.files?.[0];
          if (file && importState === "idle") void importResumeFile(file);
        }}
        className={`relative shrink-0 cursor-pointer border-b transition-all duration-300 ${
          dragActive
            ? "border-sky-500/60 bg-sky-500/10"
            : importState === "loading"
            ? "border-amber-500/20 bg-amber-500/5"
            : importState === "success"
            ? "border-emerald-500/30 bg-emerald-500/5"
            : importState === "error"
            ? "border-red-500/30 bg-red-500/5"
            : "border-white/8 bg-white/[0.02] hover:bg-white/[0.04]"
        }`}
      >
        <input
          ref={importInputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md,application/pdf,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void importResumeFile(file);
          }}
        />

        <div className="flex items-center gap-4 px-5 py-3.5">
          {/* Icon */}
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
            importState === "loading" ? "bg-amber-400/15" :
            importState === "success" ? "bg-emerald-400/15" :
            importState === "error" ? "bg-red-400/15" :
            dragActive ? "bg-sky-400/20" : "bg-sky-500/10"
          }`}>
            {importState === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
            ) : importState === "success" ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : importState === "error" ? (
              <X className="h-4 w-4 text-red-400" />
            ) : (
              <UploadCloud className={`h-4 w-4 ${dragActive ? "text-sky-300" : "text-sky-400"}`} />
            )}
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1">
            {importState === "loading" ? (
              <p className="text-sm font-semibold text-amber-300">Extracting your resume with AIâ€¦</p>
            ) : importState === "success" ? (
              <p className="text-sm font-semibold text-emerald-300">Fields auto-filled! Review and adjust as needed.</p>
            ) : importState === "error" ? (
              <p className="text-sm font-semibold text-red-300">{importError || "Import failed. Try a different file or format."}</p>
            ) : dragActive ? (
              <p className="text-sm font-semibold text-sky-200">Drop your resume here to auto-fill</p>
            ) : (
              <>
                <p className="text-sm font-semibold text-slate-200">Already have a resume? Import &amp; auto-fill</p>
                <p className="text-xs text-slate-500">Drop a PDF, DOCX, TXT or Markdown file â€” AI extracts all sections instantly</p>
              </>
            )}
          </div>

          {/* AI badge */}
          <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-sky-500/20 bg-sky-500/8 px-3 py-1">
            <Bot className="h-3 w-3 text-sky-400" />
            <span className="text-xs font-semibold text-sky-300">AI Extract</span>
          </div>

          {importState === "idle" && !dragActive && (
            <div className="hidden shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 sm:flex">
              <Sparkles className="h-3.5 w-3.5 text-sky-400" />
              Choose file
            </div>
          )}
        </div>

        {/* Animated loading bar */}
        {importState === "loading" && (
          <div className="absolute bottom-0 left-0 h-0.5 w-full overflow-hidden">
            <div className="h-full w-1/3 animate-[slide_1.4s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          </div>
        )}
      </div>

      {/* â”€â”€ Main columns â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex min-h-0 flex-1">
        {/* Left: Editor panel */}
        <aside className="flex w-[42%] min-w-[320px] flex-col border-r border-white/8 bg-slate-900/40">
          <div className="flex shrink-0 items-center gap-2 border-b border-white/8 bg-white/[0.02] px-4 py-2">
            <FileText className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Content</span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <ResumeEditor data={data} onChange={setData} dark />
          </div>
        </aside>

        {/* Right: Preview panel */}
        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-950">
          <div className="flex shrink-0 items-center justify-between border-b border-white/8 bg-white/[0.02] px-4 py-2">
            <div className="flex items-center gap-2">
              <Eye className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Live Preview</span>
            </div>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
              Matches PDF
            </span>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <ResumePreviewFrame templateId={templateId} data={data} />
          </div>
        </main>
      </div>

      {/* â”€â”€ Auth modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setShowAuthModal(false)}
        >
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-8 shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 ring-1 ring-sky-500/20">
                <Download className="h-7 w-7 text-sky-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Sign in to download</h2>
              <p className="mt-2 text-sm text-slate-400">
                Create a free account to download your resume as a polished PDF.
              </p>
              <div className="mt-6 space-y-3">
                <Link
                  href="/signup"
                  className="block w-full rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-3 text-center font-semibold text-slate-950 transition hover:brightness-110"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/login"
                  className="block w-full rounded-xl border border-white/10 px-4 py-3 text-center font-semibold text-slate-100 transition hover:bg-white/5"
                >
                  Sign In
                </Link>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="mt-4 w-full px-4 py-2 text-sm text-slate-500 transition hover:text-white"
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
