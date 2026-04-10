"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image, { type StaticImageData } from "next/image";
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
    fullName: "Alexandra Reid",
    email: "alex.reid@example.com",
    phone: "+1 (415) 555-0192",
    location: "San Francisco, CA",
    photoUrl: DEMO_PHOTO,
    links: [
      { label: "LinkedIn", url: "https://linkedin.com/in/alexreid" },
      { label: "Portfolio", url: "https://alexreid.design" },
      { label: "GitHub", url: "https://github.com/alexreid" },
    ],
  },
  summary:
    "Senior Product Designer with 8+ years building data-driven SaaS products. Proven record leading 0→1 design for enterprise platforms, scaling design systems, and translating complex workflows into intuitive interfaces. Passionate about accessibility and measurable impact.",
  experience: [
    {
      company: "Notion",
      role: "Senior Product Designer",
      start: "2022",
      end: "Present",
      bullets: [
        "Spearheaded redesign of the Blocks editor, increasing WAU by 34%",
        "Built a 400-component design system adopted by 12 product teams",
        "Led accessibility audit and remediation, achieving WCAG 2.1 AA compliance",
        "Mentored 4 junior designers through structured growth frameworks",
      ],
    },
    {
      company: "Figma",
      role: "Product Designer",
      start: "2019",
      end: "2022",
      bullets: [
        "Designed FigJam whiteboard tool from prototype to launch (2M+ users day 1)",
        "Owned mobile app redesign, improving session length by 55%",
        "Reduced design-to-ship cycle by 3 weeks through tighter eng collaboration",
      ],
    },
    {
      company: "Airbnb",
      role: "UX Designer",
      start: "2017",
      end: "2019",
      bullets: [
        "Redesigned host onboarding flow, reducing drop-off by 42%",
        "Conducted 80+ usability sessions synthesized into product roadmap",
      ],
    },
  ],
  education: [
    {
      school: "Rhode Island School of Design",
      degree: "BFA in Graphic Design",
      start: "2013",
      end: "2017",
    },
  ],
  skills: [
    { category: "Design Tools", items: ["Figma", "Framer", "Adobe XD", "Protopie", "Sketch"] },
    { category: "Research", items: ["User Interviews", "Usability Testing", "A/B Testing", "Journey Mapping"] },
    { category: "Development", items: ["HTML/CSS", "React", "Storybook", "Zeplin"] },
    { category: "Soft Skills", items: ["Leadership", "Stakeholder Mgmt", "Public Speaking"] },
  ],
};

/** Scales an A4 iframe (794×1122 px) to exactly fill its container. */
function ScaledIframe({ html, name }: { html: string; name: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.35);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / 794);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden" style={{ aspectRatio: "210 / 297" }}>
      <div
        className="pointer-events-none absolute left-0 top-0"
        style={{ width: 794, height: 1122, transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        <iframe
          title={`${name} preview`}
          srcDoc={html}
          style={{ width: 794, height: 1122, border: "none", display: "block" }}
          sandbox="allow-same-origin"
          tabIndex={-1}
        />
      </div>
    </div>
  );
}

export interface TemplateCardProps {
  id: string;
  name: string;
  description: string;
  previewImageSrc?: string | StaticImageData;
  previewImageAlt?: string;
  previewHref?: string;
  actionHref?: string;
  actionLabel?: string;
  external?: boolean;
}

export function TemplateCard({
  id,
  name,
  description,
  previewImageSrc,
  previewImageAlt,
  previewHref,
  actionHref,
  actionLabel = "Use Template",
  external = false,
}: TemplateCardProps) {
  const html = useMemo(() => renderResumeDocument(id, DEMO_DATA), [id]);
  const resolvedPreviewHref = previewHref ?? `/templates/${id}`;
  const resolvedActionHref = actionHref ?? `/editor?template=${id}`;
  const linkProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-sky-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-sky-400 hover:shadow-xl hover:shadow-sky-100/80">
      {/* Actual template preview */}
      <div className="relative overflow-hidden bg-slate-50">
        {previewImageSrc ? (
          <div className="aspect-[210/297]">
            <Image
              src={previewImageSrc}
              alt={previewImageAlt ?? `${name} preview`}
              fill
              sizes="(min-width: 1280px) 24rem, (min-width: 768px) 33vw, 100vw"
              className="object-cover object-top"
            />
          </div>
        ) : (
          <ScaledIframe html={html} name={name} />
        )}
        {/* Overlay for click-through */}
        <Link
          href={resolvedPreviewHref}
          className="absolute inset-0 z-10"
          aria-label={`Preview ${name}`}
          {...linkProps}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col p-4">
        <h3 className="mb-3 truncate whitespace-nowrap text-sm font-bold text-slate-900 sm:text-base">{name}</h3>
        {/* Footer buttons */}
        <div className="flex gap-1.5 sm:gap-2">
          <Link
            href={resolvedPreviewHref}
            className="inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 px-2 py-1.5 text-[11px] font-semibold text-slate-950 shadow-md shadow-sky-400/30 transition hover:brightness-110 sm:px-4 sm:py-2 sm:text-sm"
            {...linkProps}
          >
            Preview
          </Link>
          <Link
            href={resolvedActionHref}
            className="inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1.5 text-[11px] font-semibold text-white transition hover:bg-slate-700 sm:px-4 sm:py-2 sm:text-sm"
            {...linkProps}
          >
            <span className="sm:hidden">Use</span>
            <span className="hidden sm:inline">{actionLabel}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
