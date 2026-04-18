import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PLAN_DOWNLOAD_LIMIT } from "@/lib/plan-config";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteHeader theme="dark" />

      <main className="px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="mb-4 inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">
              One subscription
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Simple pricing that stays simple
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-300">
              One plan: INR 39 for 30 days. No credit card required, no recurring charges, one-time payment only.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/25">
              <h2 className="text-2xl font-semibold text-white">What you get</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                CVpilot gives you a full resume workflow with AI writing support, professional templates, and hassle-free PDF export.
              </p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  "Unlimited resume builds",
                  "Premium ATS-ready templates",
                  "AI-guided content suggestions",
                  "Resume import and export",
                  "Saved history & cloud access",
                  "Fast PDF download",
                  "One workspace for all resumes",
                  "Secure checkout with no surprises",
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
                <h3 className="text-xl font-semibold text-white mb-2">Single plan</h3>
                <div className="text-5xl font-bold text-white mb-2">INR 39</div>
                <p className="text-slate-300 mb-6">One-time payment · 30 days validity</p>
              </div>
              <ul className="space-y-4 mb-8 text-left">
                {[
                  "No credit card required",
                  "No recurring payment",
                  "One-time subscription",
                  "Valid for 30 days",
                  `Can download upto ${PLAN_DOWNLOAD_LIMIT} resumes`,
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-cyan-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-slate-200">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block w-full rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-3 text-center font-semibold text-slate-950 transition hover:brightness-105"
              >
                Pay INR 39 and export
              </Link>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
