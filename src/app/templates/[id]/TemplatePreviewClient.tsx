"use client";

import { useState } from "react";
import Link from "next/link";

interface TemplatePreviewClientProps {
  templateId: string;
}

export function TemplatePreviewClient({
  templateId,
}: TemplatePreviewClientProps) {
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href={`/editor?template=${templateId}`}
          className="flex-1 inline-flex items-center justify-center px-6 py-4 rounded-lg bg-gradient-to-r from-sky-600 to-cyan-600 text-white font-semibold shadow-lg shadow-sky-600/30 hover:shadow-xl hover:shadow-sky-600/40 hover:from-sky-700 hover:to-cyan-700 transition-all duration-300"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit & Create Resume
        </Link>

        <button
          onClick={() => setShowSignInPrompt(true)}
          className="flex-1 inline-flex items-center justify-center px-6 py-4 rounded-lg border-2 border-slate-300 text-slate-900 font-semibold hover:bg-slate-50 transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF
        </button>
      </div>

      {/* Sign-in prompt modal */}
      {showSignInPrompt && (
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
                Create a free account to download your resume as PDF and save all your resume data securely.
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
                onClick={() => setShowSignInPrompt(false)}
                className="w-full mt-4 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
