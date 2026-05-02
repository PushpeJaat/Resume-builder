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
  Mic,
  Save,
  Square,
  Sparkles,
  UploadCloud,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { ExtractionLoaderOverlay } from "@/components/editor/ExtractionLoaderOverlay";
import { EditorLayout } from "@/components/editor/EditorLayout";
import { PreviewPanel } from "@/components/editor/PreviewPanel";
import { ResumeEditor } from "@/components/editor/ResumeEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/BrandMark";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TEMPLATES } from "@/lib/templates/registry";
import { parseResumePdf } from "@/lib/resumeParser";
import { elapsedMs, nowMs, recordLatencyMetric } from "@/lib/latency-metrics";
import {
  demoResumeData,
  isResumeDataEmpty,
  resumeDataSchema,
  type ResumeData,
} from "@/types/resume";
import { resolveApiMessage, type ApiEnvelope } from "@/lib/api-client";

type Props = { resumeId: string };

type SaveState = "idle" | "saving" | "saved" | "error";
type PdfState = "idle" | "loading" | "error";
type ImportState = "idle" | "loading" | "success" | "error";
type PaymentState = "idle" | "creating-order" | "checkout" | "verifying";
type VoiceState = "idle" | "listening" | "processing" | "success" | "error";
type VoiceLangMode = "auto" | "en-IN" | "hi-IN";

type VoiceCommandApiResponse = {
  code?: string;
  status?: "applied" | "clarification";
  assistantReply?: string;
  changeSummary?: string;
  nextData?: ResumeData;
  tokenLimit?: number;
  tokensUsed?: number;
  tokensRemaining?: number;
  planTier?: string;
  redirectTo?: string;
  error?: string;
  latency?: {
    path?: "fast-router" | "openai";
    totalMs?: number;
    modelMs?: number | null;
  };
};

type SpeechRecognitionAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
};

type SpeechRecognitionErrorEventLike = {
  error: string;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructorLike = new () => SpeechRecognitionLike;

function mapSpeechRecognitionError(errorCode: string) {
  switch (errorCode) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone permission is blocked. Please allow microphone access and try again.";
    case "audio-capture":
      return "No microphone was found. Please check your audio input device.";
    case "no-speech":
      return "No speech detected. Please speak again.";
    case "network":
      return "Speech recognition network issue. Please try again.";
    default:
      return "Voice input failed. Please try again.";
  }
}

function normalizeSpeechReplyText(text: string) {
  return text
    .replace(/[\u2022\u25CF\u25E6]/g, ",")
    .replace(/[|]/g, ",")
    .replace(/\s+/g, " ")
    .trim();
}

function splitSpeechChunks(text: string, maxChunkLength = 180) {
  const source = normalizeSpeechReplyText(text);
  if (!source) {
    return [] as string[];
  }

  const sentenceLikeChunks = source.match(/[^.!?]+[.!?]?/g) ?? [source];
  const chunks: string[] = [];
  let current = "";

  for (const part of sentenceLikeChunks) {
    const candidate = `${current} ${part}`.trim();
    if (!current) {
      current = part.trim();
      continue;
    }

    if (candidate.length <= maxChunkLength) {
      current = candidate;
      continue;
    }

    chunks.push(current.trim());
    current = part.trim();
  }

  if (current) {
    chunks.push(current.trim());
  }

  return chunks;
}

const PREMIUM_TTS_ENABLED = parseClientBoolean(process.env.NEXT_PUBLIC_VOICE_PREMIUM_TTS, false);
const PREMIUM_TTS_TIMEOUT_MS = parseClientPositiveInt(process.env.NEXT_PUBLIC_VOICE_PREMIUM_TTS_TIMEOUT_MS, 5_500);
const AUTO_VOICE_RECOGNITION_LANG = parseAutoVoiceRecognitionLang(process.env.NEXT_PUBLIC_VOICE_AUTO_RECOGNITION_LANG);
const VOICE_CLIENT_LATENCY_LOGS_ENABLED = parseClientBoolean(process.env.NEXT_PUBLIC_VOICE_LATENCY_LOGS, true);
const VOICE_CLIENT_LATENCY_LOG_EVERY = parseClientPositiveInt(process.env.NEXT_PUBLIC_VOICE_LATENCY_LOG_EVERY, 8);

function parseClientPositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt((value ?? "").trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseClientBoolean(value: string | undefined, fallback: boolean) {
  const normalized = (value ?? "").trim().toLowerCase();
  if (!normalized) {
    return fallback;
  }

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
}

function parseAutoVoiceRecognitionLang(value: string | undefined) {
  const normalized = (value ?? "").trim().toLowerCase();
  if (normalized === "hi-in") {
    return "hi-IN" as const;
  }

  if (normalized === "en-in") {
    return "en-IN" as const;
  }

  return null;
}

function recordVoiceClientLatency(metric: string, durationMs: number, meta?: Record<string, unknown>) {
  return recordLatencyMetric(metric, durationMs, {
    enabled: VOICE_CLIENT_LATENCY_LOGS_ENABLED,
    logEvery: VOICE_CLIENT_LATENCY_LOG_EVERY,
    windowSize: 240,
    meta,
  });
}

type CashfreeCheckoutMode = "production";
type CashfreeCheckoutFactory = (config: { mode: CashfreeCheckoutMode }) => {
  checkout: (payload: { paymentSessionId: string; redirectTarget?: "_self" | "_blank" | "_modal" }) => Promise<unknown>;
};

declare global {
  interface Window {
    Cashfree?: CashfreeCheckoutFactory;
    webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
    SpeechRecognition?: SpeechRecognitionConstructorLike;
  }
}

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
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");

  const [importState, setImportState] = useState<ImportState>("idle");
  const [importError, setImportError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [voiceError, setVoiceError] = useState("");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceReply, setVoiceReply] = useState("");
  const [voiceChangeSummary, setVoiceChangeSummary] = useState("");
  const [voiceTokenStats, setVoiceTokenStats] = useState<{ limit: number; remaining: number; planTier: string } | null>(null);
  const [voiceLangMode, setVoiceLangMode] = useState<VoiceLangMode>("auto");
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);
  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(true);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const voiceTranscriptRef = useRef("");
  const voiceFinalTranscriptRef = useRef("");
  const preferredSpeechVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const premiumAudioRef = useRef<HTMLAudioElement | null>(null);
  const premiumAudioUrlRef = useRef<string | null>(null);
  const premiumAudioAbortRef = useRef<AbortController | null>(null);

  const isLoggedIn = Boolean(session?.user?.id);
  const isDownloadBusy =
    pdfState === "loading" ||
    paymentState === "creating-order" ||
    paymentState === "checkout" ||
    paymentState === "verifying";

  const downloadLabel =
    paymentState === "creating-order"
      ? "Starting payment"
      : paymentState === "checkout"
        ? "Opening payment"
        : paymentState === "verifying"
          ? "Verifying payment"
          : pdfState === "loading"
            ? "Generating"
            : "Download PDF";

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

  const redirectToPlanIfNeeded = useCallback(
    (payload: { code?: unknown; error?: unknown; redirectTo?: unknown } | null, fallbackMessage: string) => {
      const redirectTo = typeof payload?.redirectTo === "string" ? payload.redirectTo : "";
      if (!redirectTo) {
        return false;
      }

      const message = resolveApiMessage(payload as ApiEnvelope | null, fallbackMessage, {
        PLAN_REQUIRED: "Your plan is inactive or expired. Choose a plan to continue downloading.",
        DOWNLOAD_LIMIT_REACHED: "Download limit reached for your current plan.",
      });
      toast.error(message);
      router.push(redirectTo);
      return true;
    },
    [router],
  );

  const generatePdf = useCallback(
    async () => {
      setPdfState("loading");

      const response = await fetch(`/api/resumes/${resumeId}/pdf`, { method: "POST" });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          code?: unknown;
          error?: unknown;
          redirectTo?: unknown;
        } | null;

        if (redirectToPlanIfNeeded(payload, "Please choose a plan to continue downloading.")) {
          setPdfState("idle");
          return false;
        }

        setPdfState("error");
        toast.error(
          resolveApiMessage(payload as ApiEnvelope | null, "Could not generate PDF.", {
            UPSTREAM_ERROR: "PDF generation is temporarily unavailable. Please retry in a moment.",
            BAD_REQUEST: "Resume data is invalid. Please refresh and try again.",
          }),
        );
        return false;
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
      return true;
    },
    [redirectToPlanIfNeeded, resumeId, title],
  );

  const downloadPdf = useCallback(async () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    setPaymentState("creating-order");

    type CreateOrderResponse = {
      alreadyPaid?: boolean;
      planActive?: boolean;
      redirectTo?: string;
      code?: string;
      orderId?: string;
      paymentSessionId?: string;
      mode?: CashfreeCheckoutMode;
      error?: string;
    };

    type VerifyOrderResponse = {
      paid?: boolean;
      orderStatus?: string;
      redirectTo?: string;
      code?: string;
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
        if (redirectToPlanIfNeeded(orderPayload, "Please choose a plan to continue downloading.")) {
          setPaymentState("idle");
          return;
        }

        setPaymentState("idle");
        toast.error(
          resolveApiMessage(orderPayload as ApiEnvelope | null, "Could not create payment order.", {
            BAD_REQUEST: "Payment request is invalid. Please refresh and try again.",
            NOT_FOUND: "Resume not found. Please create a new resume and try again.",
            INTERNAL_ERROR: "Payment is not configured right now. Please try again later.",
            UPSTREAM_ERROR: "Payment provider is temporarily unavailable.",
          }),
        );
        return;
      }

      if (orderPayload?.alreadyPaid) {
        setPaymentState("idle");
        void generatePdf();
        return;
      }

      if (!orderPayload?.paymentSessionId || !orderPayload.orderId) {
        setPaymentState("idle");
        toast.error(
          resolveApiMessage(orderPayload as ApiEnvelope | null, "Payment session is missing. Please try again.", {
            UPSTREAM_ERROR: "Payment provider did not return a valid session. Please retry.",
          }),
        );
        return;
      }

      const mode: CashfreeCheckoutMode = "production";
      const cashfreeFactory = await loadCashfreeSdk();
      const cashfree = cashfreeFactory({ mode });

      setPaymentState("checkout");
      await cashfree.checkout({
        paymentSessionId: orderPayload.paymentSessionId,
        redirectTarget: "_modal",
      });

      setPaymentState("verifying");

      const verifyResponse = await fetch("/api/payments/cashfree/verify-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId,
          orderId: orderPayload.orderId,
        }),
      });

      const verifyPayload = (await verifyResponse.json().catch(() => null)) as VerifyOrderResponse | null;

      if (!verifyResponse.ok) {
        if (redirectToPlanIfNeeded(verifyPayload, "Please choose a plan to continue downloading.")) {
          setPaymentState("idle");
          return;
        }

        setPaymentState("idle");
        toast.error(
          resolveApiMessage(verifyPayload as ApiEnvelope | null, "Could not verify payment.", {
            BAD_REQUEST: "Payment verification request is invalid.",
            NOT_FOUND: "Payment order not found. Please retry checkout.",
            INTERNAL_ERROR: "Payment verification is temporarily unavailable.",
            UPSTREAM_ERROR: "Payment provider did not confirm your payment yet.",
          }),
        );
        return;
      }

      if (!verifyPayload?.paid) {
        setPaymentState("idle");
        toast.info("Payment is not completed yet. Please complete the checkout to download.");
        return;
      }

      toast.success("Payment successful. Preparing your PDF...");
      setPaymentState("idle");
      void generatePdf();
    } catch (error) {
      setPaymentState("idle");
      const message = error instanceof Error ? error.message : "Payment failed. Please try again.";
      toast.error(message);
    }
  }, [generatePdf, isLoggedIn, loadCashfreeSdk, redirectToPlanIfNeeded, resumeId]);

  const autoDownloadFiredRef = useRef(false);

  const handleGoBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/dashboard/templates");
  }, [router]);

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

  const getSpeechRecognitionCtor = useCallback((): SpeechRecognitionConstructorLike | null => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
  }, []);

  const resolveRecognitionLanguage = useCallback((mode: VoiceLangMode) => {
    if (mode === "en-IN") {
      return "en-IN";
    }

    if (mode === "hi-IN") {
      return "hi-IN";
    }

    if (AUTO_VOICE_RECOGNITION_LANG) {
      return AUTO_VOICE_RECOGNITION_LANG;
    }

    if (typeof window !== "undefined") {
      const browserLocale = (window.navigator.language ?? "").toLowerCase();
      if (browserLocale.startsWith("hi")) {
        return "hi-IN";
      }
    }

    return "en-IN";
  }, []);

  const resolveSpeechLanguage = useCallback((mode: VoiceLangMode, text: string) => {
    if (mode === "en-IN") {
      return "en-IN";
    }

    if (mode === "hi-IN") {
      return "hi-IN";
    }

    return /[\u0900-\u097F]/.test(text) ? "hi-IN" : "en-IN";
  }, []);

  const pickBestSpeechVoice = useCallback((lang: string): SpeechSynthesisVoice | null => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return null;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      return null;
    }

    const preferredNameHints = ["google", "microsoft", "natural", "neural"];
    const targetBase = lang.toLowerCase().split("-")[0] ?? "en";

    const scored = voices
      .map((voice) => {
        const voiceLang = voice.lang.toLowerCase();
        const voiceName = voice.name.toLowerCase();
        let score = 0;

        if (voiceLang === lang.toLowerCase()) {
          score += 50;
        }

        if (voiceLang.startsWith(`${targetBase}-`)) {
          score += 30;
        }

        if (voice.localService) {
          score += 10;
        }

        if (preferredNameHints.some((hint) => voiceName.includes(hint))) {
          score += 10;
        }

        return { voice, score };
      })
      .sort((a, b) => b.score - a.score);

    return scored[0]?.voice ?? null;
  }, []);

  const stopPremiumVoicePlayback = useCallback(() => {
    if (premiumAudioAbortRef.current) {
      premiumAudioAbortRef.current.abort();
      premiumAudioAbortRef.current = null;
    }

    if (premiumAudioRef.current) {
      premiumAudioRef.current.pause();
      premiumAudioRef.current = null;
    }

    if (premiumAudioUrlRef.current) {
      URL.revokeObjectURL(premiumAudioUrlRef.current);
      premiumAudioUrlRef.current = null;
    }
  }, []);

  const speakPremiumVoiceReply = useCallback(
    async (text: string, locale: string) => {
      if (!PREMIUM_TTS_ENABLED || typeof window === "undefined") {
        return false;
      }

      stopPremiumVoicePlayback();

      const startedAt = nowMs();
      const abortController = new AbortController();
      premiumAudioAbortRef.current = abortController;
      const timeoutId = window.setTimeout(() => abortController.abort(), PREMIUM_TTS_TIMEOUT_MS);

      try {
        const response = await fetch(`/api/resumes/${resumeId}/voice-reply`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abortController.signal,
          body: JSON.stringify({
            text,
            locale,
          }),
        });

        if (!response.ok) {
          return false;
        }

        const audioBlob = await response.blob();
        if (!(audioBlob instanceof Blob) || audioBlob.size === 0) {
          return false;
        }

        const objectUrl = URL.createObjectURL(audioBlob);
        premiumAudioUrlRef.current = objectUrl;

        const audio = new Audio(objectUrl);
        audio.preload = "auto";
        premiumAudioRef.current = audio;
        await audio.play();

        recordVoiceClientLatency("voice.client.premium_tts_ms", elapsedMs(startedAt), {
          provider: response.headers.get("X-Voice-TTS-Provider") ?? "openai",
          model: response.headers.get("X-Voice-TTS-Model") ?? "",
        });

        audio.onended = () => {
          if (premiumAudioRef.current === audio) {
            premiumAudioRef.current = null;
          }

          if (premiumAudioUrlRef.current === objectUrl) {
            URL.revokeObjectURL(objectUrl);
            premiumAudioUrlRef.current = null;
          }
        };

        audio.onerror = () => {
          if (premiumAudioRef.current === audio) {
            premiumAudioRef.current = null;
          }

          if (premiumAudioUrlRef.current === objectUrl) {
            URL.revokeObjectURL(objectUrl);
            premiumAudioUrlRef.current = null;
          }
        };

        return true;
      } catch (error) {
        const isAbortError = error instanceof DOMException && error.name === "AbortError";
        if (!isAbortError) {
          recordVoiceClientLatency("voice.client.premium_tts_error_ms", elapsedMs(startedAt), {
            message: error instanceof Error ? error.message : "premium tts failed",
          });
        }

        return false;
      } finally {
        window.clearTimeout(timeoutId);
        if (premiumAudioAbortRef.current === abortController) {
          premiumAudioAbortRef.current = null;
        }
      }
    },
    [resumeId, stopPremiumVoicePlayback],
  );

  const speakAssistantReply = useCallback(
    async (text: string) => {
      if (!voiceReplyEnabled || typeof window === "undefined") {
        return;
      }

      const cleaned = normalizeSpeechReplyText(text);
      if (!cleaned) {
        return;
      }

      const lang = resolveSpeechLanguage(voiceLangMode, cleaned);
      const usedPremiumTts = await speakPremiumVoiceReply(cleaned, lang);
      if (usedPremiumTts) {
        return;
      }

      if (!("speechSynthesis" in window)) {
        return;
      }

      const synth = window.speechSynthesis;
      if (synth.speaking || synth.pending) {
        synth.cancel();
      }

      const startedAt = nowMs();
      const chunks = splitSpeechChunks(cleaned);
      const fallbackVoice = pickBestSpeechVoice(lang);
      const selectedVoice = preferredSpeechVoiceRef.current ?? fallbackVoice;
      if (selectedVoice) {
        preferredSpeechVoiceRef.current = selectedVoice;
      }

      for (let index = 0; index < chunks.length; index += 1) {
        const chunk = chunks[index];
        const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.lang = lang;
        utterance.voice = selectedVoice ?? null;
        utterance.rate = 1.03;
        utterance.pitch = 1;
        utterance.volume = 1;

        if (index === 0) {
          utterance.onstart = () => {
            recordVoiceClientLatency("voice.client.browser_tts_start_ms", elapsedMs(startedAt), {
              chunks: chunks.length,
              lang,
            });
          };
        }

        synth.speak(utterance);
      }
    },
    [pickBestSpeechVoice, resolveSpeechLanguage, speakPremiumVoiceReply, voiceLangMode, voiceReplyEnabled],
  );

  const submitVoiceCommand = useCallback(
    async (rawTranscript: string) => {
      const transcript = rawTranscript.trim();
      if (!transcript) {
        setVoiceState("error");
        setVoiceError("Could not hear your command. Please try again.");
        return;
      }

      setVoiceState("processing");
      setVoiceError("");

      const abortController = new AbortController();
      const timeoutId = window.setTimeout(() => abortController.abort(), 15_000);
      const commandStartedAt = nowMs();

      try {
        const response = await fetch(`/api/resumes/${resumeId}/voice-command`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abortController.signal,
          body: JSON.stringify({
            transcript,
            locale: resolveRecognitionLanguage(voiceLangMode),
            currentData: data,
          }),
        });

        const payload = (await response.json().catch(() => null)) as VoiceCommandApiResponse | null;
        recordVoiceClientLatency("voice.client.command_ms", elapsedMs(commandStartedAt), {
          ok: response.ok,
          status: payload?.status ?? "error",
          path: payload?.latency?.path ?? "unknown",
        });

        if (typeof payload?.latency?.totalMs === "number") {
          recordVoiceClientLatency("voice.client.api_total_ms", payload.latency.totalMs, {
            path: payload?.latency?.path ?? "unknown",
          });
        }

        if (typeof payload?.latency?.modelMs === "number" && payload.latency.modelMs > 0) {
          recordVoiceClientLatency("voice.client.api_model_ms", payload.latency.modelMs, {
            path: payload?.latency?.path ?? "unknown",
          });
        }

        if (!response.ok) {
          const message =
            typeof payload?.error === "string" && payload.error.trim()
              ? payload.error
              : "Could not process voice command right now.";
          setVoiceState("error");
          setVoiceError(message);
          toast.error(message);

          const redirectTo = typeof payload?.redirectTo === "string" ? payload.redirectTo : "";
          if (redirectTo) {
            router.push(redirectTo);
          }

          return;
        }

        const assistantReply =
          typeof payload?.assistantReply === "string" && payload.assistantReply.trim().length > 0
            ? payload.assistantReply.trim()
            : "I understood your request and updated the resume. Any other changes you want?";

        const changeSummary =
          typeof payload?.changeSummary === "string" ? payload.changeSummary.trim() : "";

        if (
          typeof payload?.tokenLimit === "number" &&
          typeof payload?.tokensRemaining === "number" &&
          typeof payload?.planTier === "string"
        ) {
          setVoiceTokenStats({
            limit: payload.tokenLimit,
            remaining: payload.tokensRemaining,
            planTier: payload.planTier,
          });
        }

        setVoiceReply(assistantReply);
        setVoiceChangeSummary(changeSummary);
          void speakAssistantReply(assistantReply);

        if (payload?.status === "clarification") {
          setVoiceState("success");
          toast.info(changeSummary || "I need one clarification before applying that change.");
          return;
        }

        if (!payload?.nextData) {
          setVoiceState("error");
          setVoiceError("Voice command did not return valid resume data.");
          toast.error("Voice command could not update the resume.");
          return;
        }

        setData(payload.nextData);
        setVoiceState("success");
        toast.success(changeSummary || "Voice command applied.");
      } catch (error) {
        const isAbortError = error instanceof DOMException && error.name === "AbortError";
        const message = isAbortError
          ? "Voice command took too long. Please try a shorter command."
          : error instanceof Error
            ? error.message
            : "Voice command failed. Please try again.";

        recordVoiceClientLatency("voice.client.command_error_ms", elapsedMs(commandStartedAt), {
          abort: isAbortError,
          message,
        });

        setVoiceState("error");
        setVoiceError(message);
        toast.error(message);
      } finally {
        window.clearTimeout(timeoutId);
      }
    },
    [data, resolveRecognitionLanguage, resumeId, router, speakAssistantReply, voiceLangMode],
  );

  const startVoiceCapture = useCallback(() => {
    if (voiceState === "processing") {
      return;
    }

    const SpeechRecognitionCtor = getSpeechRecognitionCtor();
    if (!SpeechRecognitionCtor) {
      setVoiceState("error");
      setVoiceError("Speech recognition is not supported in this browser.");
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    stopPremiumVoicePlayback();

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    voiceFinalTranscriptRef.current = "";
    voiceTranscriptRef.current = "";

    setVoiceTranscript("");
    setVoiceError("");
    setVoiceReply("");
    setVoiceChangeSummary("");
    setVoiceState("listening");

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = resolveRecognitionLanguage(voiceLangMode);
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interimTranscript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const text = result?.[0]?.transcript?.trim() ?? "";
        if (!text) {
          continue;
        }

        if (result.isFinal) {
          voiceFinalTranscriptRef.current = `${voiceFinalTranscriptRef.current} ${text}`.trim();
        } else {
          interimTranscript = `${interimTranscript} ${text}`.trim();
        }
      }

      const mergedTranscript = `${voiceFinalTranscriptRef.current} ${interimTranscript}`.trim();
      voiceTranscriptRef.current = mergedTranscript;
      setVoiceTranscript(mergedTranscript);
    };

    recognition.onerror = (event) => {
      const message = mapSpeechRecognitionError(event.error);
      setVoiceState("error");
      setVoiceError(message);
      toast.error(message);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      const transcript = (voiceFinalTranscriptRef.current || voiceTranscriptRef.current).trim();

      if (!transcript) {
        setVoiceState("idle");
        return;
      }

      void submitVoiceCommand(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [
    getSpeechRecognitionCtor,
    resolveRecognitionLanguage,
    stopPremiumVoicePlayback,
    submitVoiceCommand,
    voiceLangMode,
    voiceState,
  ]);

  const stopVoiceCapture = useCallback(() => {
    if (!recognitionRef.current) {
      return;
    }

    recognitionRef.current.stop();
  }, []);

  const focusVoiceAssistant = useCallback(
    (startListening: boolean) => {
      if (typeof document !== "undefined") {
        const section = document.getElementById("voice-assistant-panel");
        section?.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      if (startListening && voiceState !== "listening" && voiceState !== "processing") {
        startVoiceCapture();
      }
    },
    [startVoiceCapture, voiceState],
  );

  useEffect(() => {
    setSpeechRecognitionSupported(Boolean(getSpeechRecognitionCtor()));
  }, [getSpeechRecognitionCtor]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const synth = window.speechSynthesis;
    const refreshPreferredVoice = () => {
      const lang = resolveSpeechLanguage(voiceLangMode, voiceReply || "hello");
      preferredSpeechVoiceRef.current = pickBestSpeechVoice(lang);
    };

    refreshPreferredVoice();
    synth.addEventListener("voiceschanged", refreshPreferredVoice);

    return () => {
      synth.removeEventListener("voiceschanged", refreshPreferredVoice);
    };
  }, [pickBestSpeechVoice, resolveSpeechLanguage, voiceLangMode, voiceReply]);

  useEffect(() => {
    if (voiceReplyEnabled) {
      return;
    }

    stopPremiumVoicePlayback();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, [stopPremiumVoicePlayback, voiceReplyEnabled]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      stopPremiumVoicePlayback();

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stopPremiumVoicePlayback]);

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
      setImportError("");
      toast.success("Resume extracted with AI and fields were auto-filled.");
      window.setTimeout(() => setImportState("idle"), 2200);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not import that file.";
      setImportState("error");
      setImportError(message);
      toast.error(message);
      window.setTimeout(() => setImportState("idle"), 2800);
    }
  }, []);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-dvh flex-col bg-slate-100">
        <div className="h-28 border-b border-slate-200 bg-white/70" />
        <div className="mx-auto flex w-full max-w-[1600px] flex-1 gap-6 p-4 xl:p-6">
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 xl:w-[54%]">
            <div className="h-10 animate-pulse rounded-xl bg-slate-200" />
            <div className="mt-4 space-y-3">
              <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
            </div>
          </div>
          <div className="hidden flex-1 rounded-2xl border border-slate-200 bg-white p-4 xl:block">
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
            <Link href="/account">
              <ArrowLeft className="size-4" />
              Back to profile
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[radial-gradient(1200px_circle_at_0%_0%,rgba(186,230,253,0.48),transparent_55%),radial-gradient(900px_circle_at_100%_8%,rgba(254,226,226,0.42),transparent_50%),radial-gradient(900px_circle_at_50%_100%,rgba(254,243,199,0.38),transparent_52%),linear-gradient(180deg,#f8fafc_0%,#fefce8_48%,#ecfeff_100%)] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/76">
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center gap-3 px-4 py-4 lg:px-6">
          <BrandMark size="sm" className="hidden lg:inline-flex" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-xl text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-slate-900"
            onClick={handleGoBack}
          >
            <ArrowLeft className="size-4" />
            Back
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

          <Button
            type="button"
            onClick={
              voiceState === "listening"
                ? stopVoiceCapture
                : () => focusVoiceAssistant(true)
            }
            disabled={!speechRecognitionSupported || voiceState === "processing"}
            className="rounded-xl bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-300 text-slate-950 shadow-[0_20px_45px_-30px_rgba(14,165,233,0.9)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105"
          >
            {voiceState === "listening" ? <Square className="size-4" /> : <Mic className="size-4" />}
            {voiceState === "listening" ? "Stop Voice" : "Voice Command"}
          </Button>

          {isLoggedIn ? (
            <Button variant="outline" className="hidden rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm xl:inline-flex" onClick={() => void saveNow()}>
              <Save className="size-4" />
              Save
            </Button>
          ) : null}

          <Button
            onClick={() => void downloadPdf()}
            disabled={isDownloadBusy}
            className="hidden rounded-xl bg-slate-900 text-white shadow-[0_20px_45px_-30px_rgba(15,23,42,0.8)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_28px_52px_-30px_rgba(15,23,42,0.84)] xl:inline-flex"
          >
            {isDownloadBusy ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {downloadLabel}
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

      <main className="mx-auto flex w-full max-w-[1600px] min-h-0 flex-1 flex-col gap-4 px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+5.8rem)] lg:px-6 xl:pb-4">
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
            accept=".pdf,.docx,.jpg,.jpeg,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/jpg"
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
                    Drop a PDF, DOCX, or JPG/JPEG and let AI extract your sections.
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

        <section
          id="voice-assistant-panel"
          className={`relative overflow-hidden rounded-2xl border px-3.5 py-3 shadow-[0_18px_42px_-32px_rgba(15,23,42,0.55)] transition-all duration-300 ease-out ${
            voiceState === "listening"
              ? "border-sky-300 bg-sky-50 ring-2 ring-sky-100"
              : voiceState === "processing"
                ? "border-amber-300 bg-amber-50 ring-2 ring-amber-100"
                : voiceState === "error"
                  ? "border-red-300 bg-red-50 ring-2 ring-red-100"
                  : "border-cyan-300/80 bg-cyan-50/55 ring-1 ring-cyan-100"
          }`}
        >
          <div className="flex flex-wrap items-start gap-3">
            <div
              className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                voiceState === "listening"
                  ? "bg-sky-100 text-sky-700"
                  : voiceState === "processing"
                    ? "bg-amber-100 text-amber-700"
                    : voiceState === "error"
                      ? "bg-red-100 text-red-700"
                      : "bg-slate-100 text-slate-600"
              }`}
            >
              {voiceState === "processing" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : voiceState === "listening" ? (
                <Mic className="size-4" />
              ) : (
                <Bot className="size-4" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800">Talk to AI and edit your resume</p>
              <p className="text-xs text-slate-500">
                Speak in Hindi, English, or Hinglish. Even broken grammar commands will be understood.
              </p>
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              <select
                value={voiceLangMode}
                onChange={(event) => setVoiceLangMode(event.target.value as VoiceLangMode)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 outline-none transition-all duration-200 focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-100"
              >
                <option value="auto">Auto (Hinglish)</option>
                <option value="en-IN">English</option>
                <option value="hi-IN">Hindi</option>
              </select>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-lg"
                onClick={() => setVoiceReplyEnabled((value) => !value)}
                title={voiceReplyEnabled ? "Disable spoken reply" : "Enable spoken reply"}
              >
                {voiceReplyEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
                {voiceReplyEnabled ? "Voice reply" : "Silent"}
              </Button>

              <Button
                type="button"
                size="sm"
                className="h-9 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                onClick={voiceState === "listening" ? stopVoiceCapture : startVoiceCapture}
                disabled={!speechRecognitionSupported || voiceState === "processing"}
              >
                {voiceState === "listening" ? (
                  <>
                    <Square className="size-4" />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic className="size-4" />
                    {voiceState === "processing" ? "Processing" : "Speak"}
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="mt-2.5 space-y-1.5">
            {voiceState === "listening" ? (
              <p className="text-xs font-semibold text-sky-700">Listening... speak your resume change now.</p>
            ) : null}

            {voiceTranscript ? (
              <p className="text-xs text-slate-600">
                Heard: <span className="font-medium text-slate-800">{voiceTranscript}</span>
              </p>
            ) : null}

            {voiceReply ? (
              <p className="text-xs text-slate-600">
                Assistant: <span className="font-medium text-slate-800">{voiceReply}</span>
              </p>
            ) : null}

            {voiceChangeSummary ? <p className="text-xs text-emerald-700">{voiceChangeSummary}</p> : null}

            {voiceTokenStats ? (
              <p className="text-xs text-cyan-700">
                Voice tokens: {voiceTokenStats.remaining}/{voiceTokenStats.limit} remaining ({voiceTokenStats.planTier})
              </p>
            ) : null}

            {voiceReplyEnabled ? (
              <p className="text-xs text-slate-500">
                Voice output: {PREMIUM_TTS_ENABLED ? "Premium neural TTS with browser fallback" : "Browser speech"}
              </p>
            ) : null}

            {voiceError ? <p className="text-xs text-red-700">{voiceError}</p> : null}

            {!speechRecognitionSupported ? (
              <p className="text-xs text-red-700">
                This browser does not support live speech recognition. Please use a Chromium-based browser.
              </p>
            ) : null}
          </div>
        </section>

        <EditorLayout
          editor={<ResumeEditor data={data} onChange={setData} />}
          preview={<PreviewPanel templateId={templateId} data={data} />}
          previewFooter={(
            <Button
              type="button"
              onClick={() => void downloadPdf()}
              disabled={isDownloadBusy}
              className="h-11 w-full rounded-xl bg-slate-900 text-white shadow-[0_18px_32px_-24px_rgba(15,23,42,0.8)]"
            >
              {isDownloadBusy ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {downloadLabel}
                </>
              ) : (
                <>
                  <Download className="size-4" />
                  Download PDF
                </>
              )}
            </Button>
          )}
        />
      </main>

      {importState === "loading" ? <ExtractionLoaderOverlay /> : null}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/92 px-3 pb-[calc(env(safe-area-inset-bottom)+0.7rem)] pt-3 backdrop-blur-xl xl:hidden">
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
            disabled={isDownloadBusy}
            className="h-12 flex-1 rounded-xl bg-slate-900 text-white shadow-[0_18px_32px_-24px_rgba(15,23,42,0.8)]"
          >
            {isDownloadBusy ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {downloadLabel}
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
              <DialogTitle>Sign in to download Ready-Resume</DialogTitle>
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
