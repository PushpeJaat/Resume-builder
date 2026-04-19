"use client";

import { TEMPLATES } from "@/lib/templates/registry";
import { TemplateCard } from "./TemplateCard";

export function TemplatesSection() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_38%,#f8fafc_100%)] px-4 py-24 sm:px-6 lg:px-8">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-[-6rem] top-12 h-64 w-64 rounded-full bg-indigo-300/70 blur-3xl" />
        <div className="absolute right-[-4rem] top-20 h-80 w-80 rounded-full bg-violet-300/70 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-sky-200/70 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-indigo-700">Professional Templates</span>
            </div>
            
            <h2 className="mb-4 text-4xl font-bold text-slate-900 sm:text-5xl">
              Choose Your Template
            </h2>
            
            <p className="mx-auto mb-2 max-w-3xl text-lg text-slate-600">
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

        </div>
      </div>
    </section>
  );
}
