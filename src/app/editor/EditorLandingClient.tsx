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
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 text-white">
      <AppHeader />
      <div className="flex min-h-0 flex-1 border-t border-white/10">
        <aside className="flex w-2/5 min-w-[340px] flex-col border-r border-white/10 bg-white/[0.04] backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-4 py-3">
            <Link
              href="/"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-slate-400 transition hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Home
            </Link>
            <span className="flex-1 text-sm font-semibold text-white">
              {getTemplateMeta(templateId)?.name ?? "Resume Editor"}
            </span>
            {!session?.user && (
              <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-200">
                Guest mode
              </span>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <ResumeEditor data={data} onChange={setData} />
          </div>
          <div className="border-t border-white/10 bg-white/[0.03] p-4">
            <button
              type="button"
              onClick={() => {
                if (session?.user) {
                  return;
                }
                // Persist resume data in sessionStorage so it can be restored after auth
                try {
                  sessionStorage.setItem(
                    "pendingResume",
                    JSON.stringify({
                      templateId,
                      data,
                      title: `My ${getTemplateMeta(templateId)?.name ?? "Resume"}`,
                    }),
                  );
                } catch {
                  // sessionStorage unavailable — continue anyway
                }
                setShowAuthModal(true);
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-105"
            >
              Download PDF
            </button>
          </div>
        </aside>

        <main className="relative flex min-h-0 w-3/5 flex-col overflow-hidden">
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Preview</span>
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-xs font-medium text-slate-300">Live</span>
          </div>
          <div className="flex-1 overflow-auto bg-slate-900 p-4">
            <ResumePreviewFrame templateId={templateId} data={data} />
          </div>
        </main>
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950 p-8 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky-400/10">
                <svg className="h-6 w-6 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="mb-2 text-2xl font-bold text-white">Sign In to Download</h2>
              <p className="mb-6 text-slate-300">
                Create a free account or sign in to download your resume as PDF.
              </p>
              <div className="space-y-3">
                <Link
                  href="/signup"
                  className="block w-full rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-3 text-center font-semibold text-slate-950 transition hover:brightness-105"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/login"
                  className="block w-full rounded-lg border border-white/10 px-4 py-3 text-center font-semibold text-slate-100 transition hover:bg-white/5"
                >
                  Sign In
                </Link>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="mt-4 w-full px-4 py-2 text-slate-400 transition hover:text-white"
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
