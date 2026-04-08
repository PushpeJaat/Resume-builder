import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Completely Free
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Build, edit, and download professional resumes at no cost. Just create a free account to export your PDF.
            </p>
          </div>

          <div className="rounded-2xl border-2 border-sky-500 bg-white p-8 shadow-lg max-w-md mx-auto">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Free Plan</h3>
              <div className="text-3xl font-bold text-slate-900 mb-4">$0</div>
              <p className="text-slate-600 mb-6">Everything you need to build a great resume</p>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "All 5 professional templates",
                "Full customization",
                "Live preview",
                "PDF export",
                "Resume import (PDF, DOCX, TXT)",
                "Unlimited resumes",
                "Secure cloud storage",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-600">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="block w-full rounded-lg bg-gradient-to-r from-sky-600 to-cyan-600 px-4 py-3 text-center font-semibold text-white hover:from-sky-700 hover:to-cyan-700 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
