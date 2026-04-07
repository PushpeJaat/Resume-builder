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
            
            <p className="text-sm text-slate-500 max-w-2xl mx-auto">
              Premium templates unlock advanced features. Download requires account creation.
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
                premium={template.premium}
              />
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-20 text-center">
            <p className="text-lg text-slate-600 mb-6">
              Ready to get started?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-gradient-to-r from-sky-600 to-cyan-600 text-white font-semibold shadow-lg shadow-sky-600/30 hover:shadow-xl hover:shadow-sky-600/40 hover:from-sky-700 hover:to-cyan-700 transition-all duration-300"
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 rounded-lg border border-slate-300 text-slate-900 font-semibold hover:bg-slate-50 transition-colors duration-200"
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
