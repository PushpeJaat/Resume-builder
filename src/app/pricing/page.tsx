import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteHeader theme="dark" />

      <main className="px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="mb-4 inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">
              Simple pricing
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Completely Free
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-300">
              Build, edit, and download professional resumes at no cost. Just create a free account to export your PDF.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/25">
              <h2 className="text-2xl font-semibold text-white">Everything included</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                CVpilot keeps the product simple: one free workspace, all templates unlocked, and account creation only when you want secure exports and saved history.
              </p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  "All 6 professional templates",
                  "Full customization",
                  "Live preview",
                  "PDF export",
                  "Resume import (PDF, DOCX, TXT)",
                  "Unlimited resumes",
                  "Secure cloud storage",
                  "Download history",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <svg className="h-5 w-5 text-cyan-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-slate-200">{feature}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mx-auto w-full max-w-md rounded-[28px] border border-sky-400/25 bg-gradient-to-b from-sky-500/10 to-cyan-400/5 p-8 shadow-2xl shadow-sky-500/10">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Free Plan</h3>
                <div className="text-4xl font-bold text-white mb-4">$0</div>
                <p className="text-slate-300 mb-6">Everything you need to build a great resume</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Start editing without sign in",
                  "Create account only to export",
                  "Save resumes to your workspace",
                  "Modern ATS-ready designs",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-cyan-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-200">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block w-full rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-3 text-center font-semibold text-slate-950 transition hover:brightness-105"
              >
                Get Started Free
              </Link>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
