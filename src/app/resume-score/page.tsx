"use client";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Badge } from "@/components/ui/badge";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { resolveApiMessage, type ApiEnvelope } from "@/lib/api-client";

const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = new Set(["pdf", "doc", "docx", "txt"]);
const ACCEPTED_MIME_PARTS = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

function validateResumeUpload(file: File) {
  if (file.size === 0) {
    return "The selected file is empty.";
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return "Resume must be 6 MB or smaller for fast scoring.";
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mime = (file.type || "").toLowerCase();
  const validType = ACCEPTED_EXTENSIONS.has(extension) || ACCEPTED_MIME_PARTS.some((item) => mime.includes(item));

  if (!validType) {
    return "Upload a PDF, DOC, DOCX, or TXT file.";
  }

  return "";
}

function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-400 border-t-transparent" />
        <div className="text-lg font-semibold text-indigo-700 animate-pulse">Scoring your resume with AI...</div>
      </div>
    </div>
  );
}

export default function ResumeScorePage() {
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const activeRequestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      activeRequestRef.current?.abort();
    };
  }, []);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    const validationError = validateResumeUpload(file);
    if (validationError) {
      setScore(null);
      setFeedback("");
      setError(validationError);
      input.value = "";
      return;
    }

    activeRequestRef.current?.abort();
    const controller = new AbortController();
    activeRequestRef.current = controller;

    setLoading(true);
    setScore(null);
    setFeedback("");
    setError("");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("/api/resume-score", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      const data = (await res.json().catch(() => null)) as
        | (ApiEnvelope & { score?: unknown; feedback?: unknown })
        | null;

      if (!res.ok) {
        throw new Error(
          resolveApiMessage(data, "Could not score this resume right now.", {
            BAD_REQUEST: "Please upload a valid PDF, DOC, DOCX, or TXT file under 6 MB.",
            UNPROCESSABLE_ENTITY: "We could not extract readable text. Try a clearer text-based file.",
            INTERNAL_ERROR: "Scoring is temporarily unavailable. Please try again shortly.",
          }),
        );
      }

      if (typeof data?.score !== "number") {
        throw new Error("Resume scoring returned an invalid response.");
      }

      setScore(data.score);
      setFeedback(typeof data?.feedback === "string" ? data.feedback : "Scoring completed.");
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") {
        return;
      }

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong while scoring your resume.",
      );
    } finally {
      if (activeRequestRef.current === controller) {
        activeRequestRef.current = null;
      }

      setLoading(false);
      input.value = "";
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 relative">
      <SiteHeader theme="light" />
      <main className="mx-auto max-w-xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <Badge variant="outline" className="rounded-full border-indigo-200 bg-white px-3 py-1 text-indigo-700">
            Resume Score
          </Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">Get Your Resume Score</h1>
          <p className="mt-2 text-base text-slate-600">Upload your resume to receive an instant score and actionable feedback.</p>
        </div>
        <div className="rounded-2xl bg-white p-8 shadow-md">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFile}
            className="mb-4 block w-full rounded border border-slate-200 px-4 py-2 text-sm"
            disabled={loading}
          />

          {error ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
          ) : null}

          {score !== null && (
            <div className="mt-6 text-center">
              <div className="text-5xl font-bold text-indigo-700">{score}%</div>
              <div className="mt-2 text-base text-slate-700">{feedback}</div>
            </div>
          )}
        </div>
      </main>
      {loading && <LoadingOverlay />}
    </div>
  );
}
