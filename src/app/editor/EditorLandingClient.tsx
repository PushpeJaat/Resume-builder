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
import {
  DEFAULT_TEMPLATE_ID,
  getTemplateMeta,
  TEMPLATES,
} from "@/lib/templates/registry";
import { parseResumePdf, readParsedResumeDraft } from "@/lib/resumeParser";
import { demoResumeData, type ResumeData } from "@/types/resume";

type ImportState = "idle" | "loading" | "success" | "error";
type ActionState = "idle" | "saving" | "downloading";

type CashfreeCheckoutMode = "sandbox" | "production";
type CashfreeCheckoutFactory = (config: { mode: CashfreeCheckoutMode }) => {
  checkout: (payload: { paymentSessionId: string; redirectTarget?: "_self" | "_blank" | "_modal" }) => Promise<unknown>;
};

declare global {
  interface Window {
    Cashfree?: CashfreeCheckoutFactory;
  }
}

export default function EditorLandingClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const rawTemplate = searchParams.get("template") ?? DEFAULT_TEMPLATE_ID;
  const initialTemplate = getTemplateMeta(rawTemplate) ? rawTemplate : DEFAULT_TEMPLATE_ID;

  const [templateId, setTemplateId] = useState(initialTemplate);
  const [title, setTitle] = useState("Senior Product Designer Resume");
  const [data, setData] = useState<ResumeData>(demoResumeData());
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [actionState, setActionState] = useState<ActionState>("idle");
  const [importState, setImportState] = useState<ImportState>("idle");
  const [importError, setImportError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const importInputRef = useRef<HTMLInputElement | null>(null);

  const currentTemplate = TEMPLATES.find((template) => template.id === templateId);

  useEffect(() => {
    const draft = readParsedResumeDraft();
    if (!draft) {
      return;
    }

    setData(draft.data);
    if (draft.titleSuggestion) {
      setTitle(draft.titleSuggestion);
    }
  }, []);

  const importResumeFile = useCallback(async (file: File) => {
    setImportState("loading");
    setImportError("");

    try {
      const payload = await parseResumePdf(file);
      setData(payload.data);
      if (payload.titleSuggestion) {
        setTitle(payload.titleSuggestion);
      }

      setImportState("success");
      toast.success("Resume extracted with AI and fields were auto-filled.");
      window.setTimeout(() => setImportState("idle"), 2200);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not import that PDF.";
      setImportState("error");
      setImportError(message);
      toast.error(message);
      window.setTimeout(() => setImportState("idle"), 3000);
    }
  }, []);

  const loadCashfreeSdk = useCallback(async (): Promise<CashfreeCheckoutFactory> => {
    if (typeof window === "undefined") {
      throw new Error("Cashfree checkout is only available in browser.");
    }

    if (window.Cashfree) {
      return window.Cashfree;
    }

    await new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>("script[data-cashfree-sdk='true']");

      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Could not load Cashfree SDK.")), {
          once: true,
        });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.async = true;
      script.dataset.cashfreeSdk = "true";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Could not load Cashfree SDK."));
      document.body.appendChild(script);
    });

    if (!window.Cashfree) {
      throw new Error("Cashfree SDK is unavailable.");
    }

    return window.Cashfree;
  }, []);

  const downloadResumePdf = useCallback(async (resumeId: string, fallbackTitle: string) => {
    const response = await fetch(`/api/resumes/${resumeId}/pdf`, { method: "POST" });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      toast.error((payload?.error as string) || "Could not generate PDF.");
      return false;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${fallbackTitle.replace(/[^\w\s-]/g, "").trim() || "resume"}.pdf`;
    anchor.click();

    URL.revokeObjectURL(url);
    toast.success("Resume downloaded.");
    return true;
  }, []);

  const runPaidDownload = useCallback(
    async (resumeId: string, fallbackTitle: string) => {
      type CreateOrderResponse = {
        alreadyPaid?: boolean;
        orderId?: string;
        paymentSessionId?: string;
        mode?: CashfreeCheckoutMode;
        error?: string;
      };

      type VerifyOrderResponse = {
        paid?: boolean;
        error?: string;
      };

      try {
        const orderResponse = await fetch("/api/payments/cashfree/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeId }),
        });

        const orderPayload = (await orderResponse.json().catch(() => null)) as CreateOrderResponse | null;

        if (!orderResponse.ok) {
          toast.error(orderPayload?.error || "Could not create payment order.");
          return false;
        }

        if (orderPayload?.alreadyPaid) {
          return downloadResumePdf(resumeId, fallbackTitle);
        }

        if (!orderPayload?.paymentSessionId || !orderPayload.orderId) {
          toast.error("Payment session is missing. Please try again.");
          return false;
        }

        const mode = orderPayload.mode === "production" ? "production" : "sandbox";
        const cashfreeFactory = await loadCashfreeSdk();
        const cashfree = cashfreeFactory({ mode });

        await cashfree.checkout({
          paymentSessionId: orderPayload.paymentSessionId,
          redirectTarget: "_modal",
        });

        const verifyResponse = await fetch("/api/payments/cashfree/verify-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeId, orderId: orderPayload.orderId }),
        });

        const verifyPayload = (await verifyResponse.json().catch(() => null)) as VerifyOrderResponse | null;

        if (!verifyResponse.ok) {
          toast.error(verifyPayload?.error || "Could not verify payment.");
          return false;
        }

        if (!verifyPayload?.paid) {
          toast.info("Payment is not completed yet. Please complete checkout to download.");
          return false;
        }

        toast.success("Payment successful. Preparing your PDF...");
        return downloadResumePdf(resumeId, fallbackTitle);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Payment failed. Please try again.";
        toast.error(message);
        return false;
      }
    },
    [downloadResumePdf, loadCashfreeSdk],
  );

  const createResume = useCallback(
    async (mode: "save" | "download") => {
      if (!session?.user?.id) {
        try {
          sessionStorage.setItem(
            "pendingResume",
            JSON.stringify({
              templateId,
              data,
              title: title.trim() || `My ${currentTemplate?.name ?? "Resume"}`,
            }),
          );
        } catch {
          // sessionStorage may be unavailable in strict browser contexts.
        }

        setShowAuthModal(true);
        toast.info("Create a free account to save and proceed to secure payment for download.");
        return;
      }

      setActionState(mode === "save" ? "saving" : "downloading");
      try {
        const resumeTitle = title.trim() || `My ${currentTemplate?.name ?? "Resume"}`;
        const response = await fetch("/api/resumes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateId,
            data,
            title: resumeTitle,
          }),
        });

        if (!response.ok) {
          toast.error("Could not create resume right now.");
          return;
        }

        const payload = (await response.json()) as { id: string };
        if (mode === "download") {
          await runPaidDownload(payload.id, resumeTitle);
          return;
        }

        router.push(`/editor/${payload.id}`);
      } finally {
        setActionState("idle");
      }
    },
    [currentTemplate?.name, data, router, runPaidDownload, session?.user?.id, templateId, title],
  );

  return (
    <div className="flex min-h-dvh flex-col bg-[linear-gradient(180deg,#f3f5f8_0%,#f6f7f9_52%,#f1f5f9_100%)] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/76">
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center gap-3 px-4 py-4 lg:px-6">
          <Button variant="ghost" size="sm" className="rounded-xl text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-slate-900" asChild>
            <Link href="/">
              <ArrowLeft className="size-4" />
              Home
            </Link>
          </Button>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Workspace</p>
            <h1 className="text-[1.06rem] font-semibold tracking-tight text-slate-900">Resume Editor</h1>
          </div>

          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
            {session?.user?.id ? "Signed in" : "Guest mode"}
          </Badge>

          <Button
            variant="outline"
            onClick={() => void createResume("save")}
            disabled={actionState !== "idle"}
            className="hidden rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm lg:inline-flex"
          >
            {actionState === "saving" ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving
              </>
            ) : (
              <>
                <Save className="size-4" />
                Save
              </>
            )}
          </Button>

          <Button
            onClick={() => void createResume("download")}
            disabled={actionState !== "idle"}
            className="hidden rounded-xl bg-slate-900 text-white shadow-[0_20px_45px_-30px_rgba(15,23,42,0.8)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_28px_52px_-30px_rgba(15,23,42,0.84)] lg:inline-flex"
          >
            {actionState === "downloading" ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Preparing
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
              placeholder="Product Designer Resume"
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
            accept=".pdf,application/pdf"
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
                    Drop a PDF and let AI extract your sections.
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
          <Button
            variant="outline"
            onClick={() => void createResume("save")}
            disabled={actionState !== "idle"}
            className="h-12 flex-1 rounded-xl border-slate-300 bg-white text-slate-700 shadow-sm"
          >
            {actionState === "saving" ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving
              </>
            ) : (
              <>
                <Save className="size-4" />
                Save
              </>
            )}
          </Button>
          <Button
            onClick={() => void createResume("download")}
            disabled={actionState !== "idle"}
            className="h-12 flex-1 rounded-xl bg-slate-900 text-white shadow-[0_18px_32px_-24px_rgba(15,23,42,0.8)]"
          >
            {actionState === "downloading" ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Preparing
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
              <DialogTitle>Sign in to save and download</DialogTitle>
              <DialogDescription>
                Create a free account and we will continue right where you left off.
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
