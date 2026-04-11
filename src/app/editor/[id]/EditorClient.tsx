"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Bot,
  Check,
  Download,
  Loader2,
  Save,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { EditorLayout } from "@/components/editor/EditorLayout";
import { PreviewPanel } from "@/components/editor/PreviewPanel";
import { ResumeEditor } from "@/components/editor/ResumeEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TEMPLATES } from "@/lib/templates/registry";
import {
  demoResumeData,
  isResumeDataEmpty,
  resumeDataSchema,
  type ResumeData,
} from "@/types/resume";

type Props = { resumeId: string };

type SaveState = "idle" | "saving" | "saved" | "error";
type PdfState = "idle" | "loading" | "error";
type ImportState = "idle" | "loading" | "success" | "error";

export function EditorClient({ resumeId }: Props) {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const autoDownload = searchParams.get("autoDownload") === "1";

  const [title, setTitle] = useState("Senior Product Designer Resume");
  const [templateId, setTemplateId] = useState("modern-professional");
  const [data, setData] = useState<ResumeData>(demoResumeData());
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [pdfState, setPdfState] = useState<PdfState>("idle");

  const [importState, setImportState] = useState<ImportState>("idle");
  const [importError, setImportError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const isLoggedIn = Boolean(session?.user?.id);

  const loadResume = useCallback(async () => {
    setLoading(true);
    setNotFound(false);

    const response = await fetch(`/api/resumes/${resumeId}`);
    if (!response.ok) {
      setLoading(false);
      if (response.status === 404) {
        setNotFound(true);
      }
      return;
    }

    const payload = await response.json();
    const resume = payload.resume;
    setTitle(
      typeof resume.title === "string" && resume.title.trim().length > 0
        ? resume.title
        : "Senior Product Designer Resume",
    );
    setTemplateId(resume.templateId);

    const parsed = resumeDataSchema.safeParse(resume.data);
    const nextData = parsed.success ? parsed.data : demoResumeData();
    const shouldPrefillDemo = isResumeDataEmpty(nextData);
    setData(shouldPrefillDemo ? demoResumeData() : nextData);
    setLoading(false);
  }, [resumeId]);

  useEffect(() => {
    if (isLoggedIn) {
      void loadResume();
    } else if (status !== "loading") {
      setLoading(false);
    }
  }, [isLoggedIn, loadResume, status]);

  const persist = useCallback(
    async (patch: { title?: string; templateId?: string; data?: ResumeData }) => {
      if (!isLoggedIn) {
        return false;
      }

      setSaveState("saving");
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });

      if (!response.ok) {
        setSaveState("error");
        return false;
      }

      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 1400);
      return true;
    },
    [isLoggedIn, resumeId],
  );

  useEffect(() => {
    if (loading || !isLoggedIn) {
      return;
    }

    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(() => {
      void persist({ title, templateId, data });
    }, 750);

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [data, isLoggedIn, loading, persist, templateId, title]);

  const saveNow = useCallback(async () => {
    if (!isLoggedIn) {
      toast.info("Sign in to save your changes.");
      return;
    }

    if (timer.current) {
      clearTimeout(timer.current);
    }

    const success = await persist({ title, templateId, data });
    if (!success) {
      toast.error("Could not save right now.");
      return;
    }

    toast.success("Changes saved.");
  }, [data, isLoggedIn, persist, templateId, title]);

  const downloadPdf = useCallback(async () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    setPdfState("loading");
    const response = await fetch(`/api/resumes/${resumeId}/pdf`, { method: "POST" });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setPdfState("error");
      toast.error((payload?.error as string) || "Could not generate PDF.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${title.replace(/[^\w\s-]/g, "").trim() || "resume"}.pdf`;
    anchor.click();

    URL.revokeObjectURL(url);
    setPdfState("idle");
    toast.success("Resume downloaded.");
  }, [isLoggedIn, resumeId, title]);

  const autoDownloadFiredRef = useRef(false);

  useEffect(() => {
    if (!autoDownload || loading || !isLoggedIn || autoDownloadFiredRef.current) {
      return;
    }

    autoDownloadFiredRef.current = true;
    router.replace(`/editor/${resumeId}`, { scroll: false });
    const timeout = setTimeout(() => {
      void downloadPdf();
    }, 800);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDownload, isLoggedIn, loading]);

  const importResumeFile = useCallback(async (file: File) => {
    setImportState("loading");
    setImportError("");

    const formData = new FormData();
    formData.set("file", file);

    const response = await fetch("/api/resumes/import", {
      method: "POST",
      body: formData,
    });

    const responseText = await response.text();
    const payload = safeJsonParse(responseText) as
      | {
          data?: ResumeData;
          titleSuggestion?: string;
          mode?: "ai" | "heuristic";
          warning?: string;
          error?: string;
        }
      | null;

    if (!response.ok || !payload?.data) {
      const message =
        payload?.error ??
        extractImportErrorMessage(responseText) ??
        `Could not import that file. Server returned ${response.status}.`;
      setImportState("error");
      setImportError(message);
      toast.error(message);
      window.setTimeout(() => setImportState("idle"), 2800);
      return;
    }

    setData(payload.data);
    if (payload.titleSuggestion) {
      setTitle(payload.titleSuggestion);
    }

    setImportState("success");
    setImportError("");

    if (payload.warning) {
      toast.warning(payload.warning);
    }

    toast.success(
      payload.mode === "ai"
        ? "Resume extracted with AI and fields were auto-filled."
        : "Resume imported successfully.",
    );

    window.setTimeout(() => setImportState("idle"), 2200);
  }, []);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-dvh flex-col bg-slate-100">
        <div className="h-28 border-b border-slate-200 bg-white/70" />
        <div className="mx-auto flex w-full max-w-[1600px] flex-1 gap-6 p-4 lg:p-6">
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 lg:w-[54%]">
            <div className="h-10 animate-pulse rounded-xl bg-slate-200" />
            <div className="mt-4 space-y-3">
              <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
            </div>
          </div>
          <div className="hidden flex-1 rounded-2xl border border-slate-200 bg-white p-4 lg:block">
            <div className="h-full animate-pulse rounded-xl bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Resume not found</h2>
          <p className="mt-2 text-sm text-slate-500">
            This resume may have been deleted or you do not have access to it.
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard">
              <ArrowLeft className="size-4" />
              Back to dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[linear-gradient(180deg,#f3f5f8_0%,#f6f7f9_52%,#f1f5f9_100%)] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/76">
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center gap-3 px-4 py-4 lg:px-6">
          <Button variant="ghost" size="sm" className="rounded-xl text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-slate-900" asChild>
            <Link href={isLoggedIn ? "/dashboard" : "/"}>
              <ArrowLeft className="size-4" />
              {isLoggedIn ? "Dashboard" : "Home"}
            </Link>
          </Button>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Workspace</p>
            <h1 className="text-[1.06rem] font-semibold tracking-tight text-slate-900">Resume Editor</h1>
          </div>

          {isLoggedIn ? (
            <Badge
              variant="outline"
              className={`border transition-all duration-200 ${
                saveState === "saving"
                  ? "animate-pulse border-amber-200 bg-amber-50 text-amber-700"
                  : saveState === "saved"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : saveState === "error"
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-slate-200 bg-slate-50 text-slate-600"
              }`}
            >
              {saveState === "saving"
                ? "Saving"
                : saveState === "saved"
                  ? "Saved"
                  : saveState === "error"
                    ? "Save failed"
                    : "Auto-save on"}
            </Badge>
          ) : (
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
              Guest mode
            </Badge>
          )}

          {isLoggedIn ? (
            <Button variant="outline" className="hidden rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm lg:inline-flex" onClick={() => void saveNow()}>
              <Save className="size-4" />
              Save
            </Button>
          ) : null}

          <Button
            onClick={() => void downloadPdf()}
            disabled={pdfState === "loading"}
            className="hidden rounded-xl bg-slate-900 text-white shadow-[0_20px_45px_-30px_rgba(15,23,42,0.8)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_28px_52px_-30px_rgba(15,23,42,0.84)] lg:inline-flex"
          >
            {pdfState === "loading" ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating
              </>
            ) : (
              <>
                <Download className="size-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>

        <div className="mx-auto grid w-full max-w-[1600px] gap-3 px-4 pb-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-6">
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Resume Title</p>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Senior Product Designer Resume"
              className="h-11 rounded-xl border-slate-200 bg-white text-[15px] transition-all duration-200 focus-visible:border-sky-400 focus-visible:ring-sky-100"
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Template</p>
            <select
              value={templateId}
              onChange={(event) => setTemplateId(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-[15px] text-slate-900 shadow-sm outline-none transition-all duration-200 focus-visible:border-sky-400 focus-visible:ring-3 focus-visible:ring-sky-100"
            >
              {TEMPLATES.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1600px] min-h-0 flex-1 flex-col gap-4 px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+5.8rem)] lg:px-6 lg:pb-4">
        <section
          role="button"
          tabIndex={0}
          aria-label="Upload existing resume to auto-fill with AI"
          onClick={() => importState === "idle" && importInputRef.current?.click()}
          onKeyDown={(event) => {
            if ((event.key === "Enter" || event.key === " ") && importState === "idle") {
              event.preventDefault();
              importInputRef.current?.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragEnter={(event) => {
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
            if (file && importState === "idle") {
              void importResumeFile(file);
            }
          }}
          className={`editor-fade-rise editor-fade-rise-delay-1 relative overflow-hidden rounded-2xl border px-3.5 py-2.5 shadow-[0_18px_42px_-32px_rgba(15,23,42,0.55)] transition-all duration-300 ease-out ${
            dragActive
              ? "border-sky-300 bg-sky-50 ring-2 ring-sky-100"
              : importState === "loading"
                ? "border-amber-300 bg-amber-50 ring-2 ring-amber-100"
                : importState === "success"
                  ? "border-emerald-300 bg-emerald-50 ring-2 ring-emerald-100"
                  : importState === "error"
                    ? "border-red-300 bg-red-50 ring-2 ring-red-100"
                    : "border-slate-200 bg-white/80 hover:-translate-y-[1px] hover:border-slate-300 hover:bg-white hover:shadow-[0_24px_52px_-34px_rgba(15,23,42,0.66)]"
          }`}
        >
          <input
            ref={importInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.md,application/pdf,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) {
                void importResumeFile(file);
              }
            }}
          />

          <div className="flex items-center gap-3">
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                importState === "loading"
                  ? "bg-amber-100 text-amber-600"
                  : importState === "success"
                    ? "bg-emerald-100 text-emerald-600"
                    : importState === "error"
                      ? "bg-red-100 text-red-600"
                      : "bg-slate-100 text-slate-600"
              }`}
            >
              {importState === "loading" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : importState === "success" ? (
                <Check className="size-4" />
              ) : importState === "error" ? (
                <X className="size-4" />
              ) : (
                <UploadCloud className="size-4" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              {importState === "loading" ? (
                <p className="text-sm font-semibold text-amber-700">Extracting resume with AI...</p>
              ) : importState === "success" ? (
                <p className="text-sm font-semibold text-emerald-700">Resume imported and fields were filled.</p>
              ) : importState === "error" ? (
                <p className="text-sm font-semibold text-red-700">{importError || "Import failed."}</p>
              ) : dragActive ? (
                <p className="text-sm font-semibold text-sky-700">Drop file to auto-fill your resume.</p>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-800">Import an existing resume</p>
                  <p className="text-xs text-slate-500">
                    Drop PDF, DOCX, TXT, or Markdown and let AI extract your sections.
                  </p>
                </>
              )}
            </div>

            <div className="hidden items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-100 sm:flex">
              <Bot className="size-3.5" />
              AI Assist
            </div>
            <div className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm md:flex">
              <Sparkles className="size-3.5" />
              Choose File
            </div>
          </div>
        </section>

        <EditorLayout
          editor={<ResumeEditor data={data} onChange={setData} />}
          preview={<PreviewPanel templateId={templateId} data={data} />}
        />
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/92 px-3 pb-[calc(env(safe-area-inset-bottom)+0.7rem)] pt-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex w-full max-w-[1600px] gap-2">
          {isLoggedIn ? (
            <Button
              variant="outline"
              onClick={() => void saveNow()}
              className="h-12 flex-1 rounded-xl border-slate-300 bg-white text-slate-700 shadow-sm"
            >
              <Save className="size-4" />
              Save
            </Button>
          ) : null}
          <Button
            onClick={() => void downloadPdf()}
            disabled={pdfState === "loading"}
            className="h-12 flex-1 rounded-xl bg-slate-900 text-white shadow-[0_18px_32px_-24px_rgba(15,23,42,0.8)]"
          >
            {pdfState === "loading" ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating
              </>
            ) : (
              <>
                <Download className="size-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="max-w-md rounded-2xl p-0">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle>Sign in to download PDF</DialogTitle>
              <DialogDescription>
                Create a free account to export and keep your resume synced.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="grid gap-2 border-t border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
            <Button asChild>
              <Link href="/signup">Create account</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function extractImportErrorMessage(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
    return null;
  }
  return trimmed.slice(0, 240);
}
