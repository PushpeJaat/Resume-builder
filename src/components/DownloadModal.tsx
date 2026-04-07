"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface DownloadModalProps {
  templateName: string;
  resumeId?: string;
  onClose: () => void;
}

export function DownloadModal({
  templateName,
  resumeId,
  onClose,
}: DownloadModalProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    if (!resumeId) {
      setError("Resume ID is missing.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/resumes/${resumeId}/pdf`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${templateName.toLowerCase().replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setIsLoading(false);
    }
  }

  if (!session?.user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md mx-4 p-8 animate-in fade-in zoom-in-95 duration-300">
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
              Create a free account or sign in to download your resume as PDF and unlock all features.
            </p>

            <div className="space-y-3">
              <Link
                href={`/signup?redirect=/templates/${templateName}`}
                className="block w-full px-4 py-3 rounded-lg bg-gradient-to-r from-sky-600 to-cyan-600 text-white font-semibold text-center hover:from-sky-700 hover:to-cyan-700 transition-all duration-200"
              >
                Create Free Account
              </Link>
              <Link
                href={`/login?callbackUrl=/templates/${templateName}`}
                className="block w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 font-semibold text-center hover:bg-slate-50 transition-colors duration-200"
              >
                Sign In
              </Link>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-4 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md mx-4 p-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center">
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Download Your Resume
          </h2>
          <p className="text-slate-600 mb-6">
            Your resume will be downloaded as a PDF file in the {templateName} template.
          </p>

          <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left text-sm text-slate-600">
            <p>
              <strong>Template:</strong> {templateName}
            </p>
            <p className="mt-1">
              <strong>Format:</strong> PDF (A4, 8.5×11&quot;)
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleDownload}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-300 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 font-semibold hover:bg-slate-50 disabled:bg-slate-50 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
