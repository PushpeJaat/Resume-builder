"use client";

import Link from "next/link";
import { TEMPLATES } from "@/lib/templates/registry";
import { TemplateCard } from "./TemplateCard";

export function TemplatesSection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-slate-50/50 to-white">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-40 h-80 w-80 rounded-full bg-sky-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-40 h-80 w-80 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/50 bg-sky-50/50 px-4 py-2 mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-sky-600">Professional Templates</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Choose Your Template
            </h2>
            
            <p className="text-lg text-slate-600 max-w-3xl mx-auto mb-2">
              Preview all our professional resume templates. Start building your perfect resume for free—no sign-up required.
            </p>
          </div>

          {/* Templates Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {TEMPLATES.map((template) => (
              <TemplateCard
                key={template.id}
                id={template.id}
                name={template.name}
                description={template.description}
              />
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-20 text-center">
            <p className="text-base font-medium text-slate-500">
              Ready to get started? Create a free account in seconds.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-7 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
