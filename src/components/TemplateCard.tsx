"use client";

import { useMemo } from "react";
import Link from "next/link";
import { renderResumeDocument } from "@/lib/templates/render";
import type { ResumeData } from "@/types/resume";

const DEMO_PHOTO = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320" fill="none">
    <rect width="320" height="320" rx="36" fill="#E0F2FE"/>
    <circle cx="160" cy="118" r="58" fill="#7DD3FC"/>
    <path d="M73 286c20-52 55-78 87-78s67 26 87 78" fill="#1D4ED8"/>
  </svg>
`)}`;

const DEMO_DATA: ResumeData = {
  personal: {
    fullName: "Jane Doe",
    email: "jane.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    photoUrl: DEMO_PHOTO,
    links: [
      { label: "Portfolio", url: "https://portfolio.example.com" },
      { label: "LinkedIn", url: "https://linkedin.com/in/janedoe" },
    ],
  },
  summary:
    "Experienced product designer with 6+ years creating intuitive digital experiences for SaaS companies.",
  experience: [
    {
      company: "Design Studio Inc.",
      role: "Senior Product Designer",
      start: "2021",
      end: "Present",
      bullets: [
        "Led design system overhaul, improving team efficiency by 40%",
        "Directed user research for 5+ major product launches",
      ],
    },
    {
      company: "Tech Innovations Ltd.",
      role: "Product Designer",
      start: "2018",
      end: "2021",
      bullets: [
        "Designed and shipped mobile app used by 100K+ users",
        "Reduced onboarding friction by 60% through iterative testing",
      ],
    },
  ],
  education: [
    {
      school: "California Institute of Design",
      degree: "Bachelor of Fine Arts",
      start: "2014",
      end: "2018",
    },
  ],
  skills: [
    { category: "Design Tools", items: ["Figma", "Adobe XD", "Sketch"] },
    { category: "Skills", items: ["UI/UX Design", "User Research", "Prototyping"] },
  ],
};

export interface TemplateCardProps {
  id: string;
  name: string;
  description: string;
}

export function TemplateCard({ id, name, description }: TemplateCardProps) {
  const html = useMemo(() => renderResumeDocument(id, DEMO_DATA), [id]);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60">
      {/* Actual template preview */}
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-50">
        <div className="pointer-events-none absolute inset-0 origin-top-left scale-[0.28] overflow-hidden" style={{ width: "357%", height: "357%" }}>
          <iframe
            title={`${name} preview`}
            srcDoc={html}
            className="h-full w-full border-0 bg-white"
            sandbox="allow-same-origin"
            tabIndex={-1}
          />
        </div>
        {/* Overlay for click-through */}
        <Link
          href={`/templates/${id}`}
          className="absolute inset-0 z-10"
          aria-label={`Preview ${name}`}
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-bold text-slate-900">{name}</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>

        {/* Footer buttons */}
        <div className="mt-5 flex gap-2.5">
          <Link
            href={`/templates/${id}`}
            className="flex-1 inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Preview
          </Link>
          <Link
            href={`/editor?template=${id}`}
            className="flex-1 inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Use Template
          </Link>
        </div>
      </div>
    </div>
  );
}
