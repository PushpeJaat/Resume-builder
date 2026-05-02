import { PricingSubscribeButton } from "@/components/PricingSubscribeButton";
import { SiteHeader } from "@/components/layout/SiteHeader";
import {
  ADVANCE_PLAN_DOWNLOAD_LIMIT,
  ADVANCE_PLAN_PRICE_INR,
  ADVANCE_VOICE_TOKEN_LIMIT,
  BASIC_PLAN_DOWNLOAD_LIMIT,
  BASIC_PLAN_PRICE_INR,
  BASIC_VOICE_TOKEN_LIMIT,
  PLAN_VALIDITY_DAYS,
} from "@/lib/plan-config";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteHeader theme="dark" />

      <main className="px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="mb-4 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
              Voice AI Plans
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Pick the plan for your AI voice workflow
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-300">
              Each plan includes a monthly voice-token allowance and PDF downloads. Speak in Hindi, English, or
              Hinglish and let AI update your resume instantly.
            </p>
          </div>

          <div className="mb-6 rounded-[28px] border border-cyan-400/20 bg-cyan-400/10 p-6 shadow-2xl shadow-cyan-500/10">
            <h2 className="text-2xl font-semibold text-white">AI voice feature included in both plans</h2>
            <p className="mt-2 text-sm text-cyan-100/95">
              Voice editing understands natural speech with mixed Hindi-English input and non-perfect grammar.
              Tokens are consumed only when you use AI voice commands.
            </p>
            <p className="mt-2 text-sm text-cyan-100/95">
              All users start with 100 free voice tokens. After that, upgrade to Basic or Advance to continue.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/25">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Basic</h2>
                  <p className="mt-1 text-sm text-slate-300">Great for regular monthly resume updates.</p>
                </div>
                <p className="rounded-full border border-white/15 bg-white/[0.03] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200">
                  {PLAN_VALIDITY_DAYS} days
                </p>
              </div>

              <div className="mt-5 text-4xl font-bold text-white">INR {BASIC_PLAN_PRICE_INR}</div>

              <ul className="mt-8 space-y-3">
                {[
                  `AI voice tokens: ${BASIC_VOICE_TOKEN_LIMIT} per ${PLAN_VALIDITY_DAYS} days`,
                  `Resume downloads: ${BASIC_PLAN_DOWNLOAD_LIMIT} per ${PLAN_VALIDITY_DAYS} days`,
                  "Voice commands in Hindi, English, or Hinglish",
                  "AI-assisted resume import and editing",
                  "ATS-friendly templates and PDF export",
                  "No recurring payment",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <svg className="h-5 w-5 text-cyan-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-slate-200">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <PricingSubscribeButton planTier="BASIC" buttonLabel="Choose Basic" />
              </div>
            </section>

            <section className="rounded-[28px] border border-cyan-300/35 bg-gradient-to-b from-cyan-500/14 to-sky-400/8 p-8 shadow-2xl shadow-cyan-500/15">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Advance</h2>
                  <p className="mt-1 text-sm text-cyan-100">Best for high-volume AI voice usage.</p>
                </div>
                <p className="rounded-full border border-cyan-300/40 bg-cyan-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-100">
                  Most Popular
                </p>
              </div>

              <div className="mt-5 text-4xl font-bold text-white">INR {ADVANCE_PLAN_PRICE_INR}</div>

              <ul className="mt-8 space-y-3">
                {[
                  `AI voice tokens: ${ADVANCE_VOICE_TOKEN_LIMIT} per ${PLAN_VALIDITY_DAYS} days`,
                  `Resume downloads: ${ADVANCE_PLAN_DOWNLOAD_LIMIT} per ${PLAN_VALIDITY_DAYS} days`,
                  "Priority-ready usage for frequent voice edits",
                  "Hindi, English, and Hinglish voice support",
                  "AI import, structured editing, and fast PDF export",
                  "No recurring payment",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-400/8 px-4 py-3">
                    <svg className="h-5 w-5 text-cyan-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-slate-200">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <PricingSubscribeButton planTier="ADVANCE" buttonLabel="Choose Advance" />
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
