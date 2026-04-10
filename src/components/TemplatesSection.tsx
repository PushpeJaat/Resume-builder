"use client";

import Link from "next/link";
import { TEMPLATES } from "@/lib/templates/registry";
import { TemplateCard } from "./TemplateCard";

export function TemplatesSection() {
  return (
    <section className="relative overflow-hidden bg-slate-800 px-4 py-24 sm:px-6 lg:px-8">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-[-10rem] top-20 h-80 w-80 rounded-full bg-sky-500/15 blur-3xl" />
        <div className="absolute bottom-10 right-[-8rem] h-72 w-72 rounded-full bg-cyan-400/12 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.95),rgba(15,23,42,1))]" />
      </div>

      <div className="relative z-10">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-sky-200">Professional Templates</span>
            </div>
            
            <h2 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
              Choose Your Template
            </h2>
            
            <p className="mx-auto mb-2 max-w-3xl text-lg text-slate-300">
              Preview all our professional resume templates. Start building your perfect resume for free with a cleaner, faster editor flow.
            </p>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
            <p className="text-base font-medium text-slate-400">
              Start editing instantly. Create an account only when you want to save and export.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/editor"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-7 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/20 transition hover:brightness-105"
              >
                Start Building
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 px-7 py-3.5 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
