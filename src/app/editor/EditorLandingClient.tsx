"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { AppHeader } from "@/components/layout/AppHeader";
import { ResumeEditor } from "@/components/editor/ResumeEditor";
import { ResumePreviewFrame } from "@/components/editor/ResumePreviewFrame";
import { getTemplateMeta, DEFAULT_TEMPLATE_ID } from "@/lib/templates/registry";
import { emptyResumeData, type ResumeData } from "@/types/resume";

export default function EditorLandingClient() {
  const searchParams = useSearchParams();
  const rawTemplate = searchParams.get("template") ?? DEFAULT_TEMPLATE_ID;
  const initialTemplate = getTemplateMeta(rawTemplate) ? rawTemplate : DEFAULT_TEMPLATE_ID;
  const [templateId] = useState(initialTemplate);
  const [data, setData] = useState<ResumeData>(emptyResumeData());
  const { data: session } = useSession();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <AppHeader />
      <div className="flex min-h-0 flex-1 border-t border-slate-200">
        {/* Left: Data input (40% width) */}
        <aside className="flex w-2/5 min-w-[340px] flex-col border-r border-slate-200 bg-white">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3">
            <Link
              href="/"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Home
            </Link>
            <span className="flex-1 text-sm font-semibold text-slate-900">
              {getTemplateMeta(templateId)?.name ?? "Resume Editor"}
            </span>
            {!session?.user && (
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">
                Guest mode
              </span>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <ResumeEditor data={data} onChange={setData} />
          </div>
          <div className="border-t border-slate-200 bg-white p-4">
            <button
              type="button"
              onClick={() => {
                if (session?.user) {
                  // Signed-in users would already be on /editor/[id]
                  // This is guest mode - prompt sign in
                }
                setShowAuthModal(true);
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Download PDF
            </button>
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

      {/* Auth modal */}
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
