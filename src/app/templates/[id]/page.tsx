import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getTemplateMeta } from "@/lib/templates/registry";
import { renderResumeDocument } from "@/lib/templates/render";
import { TemplatePreviewClient } from "./TemplatePreviewClient";
import type { ResumeData } from "@/types/resume";

const DEMO_PHOTO = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320" fill="none">
    <rect width="320" height="320" rx="36" fill="#E0F2FE"/>
    <circle cx="160" cy="118" r="58" fill="#7DD3FC"/>
    <path d="M73 286c20-52 55-78 87-78s67 26 87 78" fill="#1D4ED8"/>
  </svg>
`)}`;

const DEFAULT_RESUME_DATA: ResumeData = {
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
    "Senior Product Designer with 8+ years building data-driven SaaS products. Proven record leading 0→1 design for enterprise platforms, scaling design systems, and translating complex workflows into intuitive interfaces. Passionate about accessibility, cross-functional collaboration, and measurable impact.",
  experience: [
    {
      company: "Notion",
      role: "Senior Product Designer",
      start: "2022",
      end: "Present",
      bullets: [
        "Spearheaded redesign of the Blocks editor, increasing weekly active users by 34%",
        "Built and maintained a 400-component design system adopted by 12 product teams",
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
        "Owned end-to-end mobile app redesign, improving session length by 55%",
        "Partnered with engineering to reduce design-to-ship cycle by 3 weeks on average",
      ],
    },
    {
      company: "Airbnb",
      role: "UX Designer",
      start: "2017",
      end: "2019",
      bullets: [
        "Redesigned host onboarding flow, reducing drop-off by 42%",
        "Conducted 80+ usability sessions, synthesizing insights into product roadmap",
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
    { category: "Development", items: ["HTML/CSS", "React basics", "Storybook", "Zeplin"] },
    { category: "Soft Skills", items: ["Leadership", "Stakeholder Mgmt", "Public Speaking"] },
  ],
};

export default async function TemplatePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = getTemplateMeta(id);

  if (!template) {
    redirect("/");
  }

  const html = renderResumeDocument(id, DEFAULT_RESUME_DATA);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteHeader theme="dark" />
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-4 shadow-2xl shadow-black/20 sm:rounded-[28px] sm:px-6 sm:py-5">
          <div className="min-w-0 flex-1">
            <h1 className="truncate whitespace-nowrap text-xl font-bold text-white sm:text-2xl">{template.name}</h1>
            <p className="mt-0.5 text-xs text-slate-300 sm:mt-1 sm:text-sm">{template.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/5"
            >
              Back
            </Link>
            <Link
              href={`/editor?template=${id}`}
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-1.5 text-sm font-semibold text-slate-950 shadow-md shadow-sky-500/20 transition hover:brightness-105 sm:py-2"
            >
              Use Template
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          {/* Left: live scaled preview */}
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20">
            <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
              <TemplatePreviewClient templateId={id} html={html} />
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20">
              <h2 className="mb-4 text-2xl font-bold text-white">Template Features</h2>
              <ul className="mb-8 space-y-2 text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="mt-1 font-bold text-sky-300">✓</span>
                  <span>Professional design optimized for ATS (Applicant Tracking Systems)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 font-bold text-sky-300">✓</span>
                  <span>Pixel-perfect rendering on screen and in print</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 font-bold text-sky-300">✓</span>
                  <span>Customizable layout and sections</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 font-bold text-sky-300">✓</span>
                  <span>One-click PDF export with perfect formatting</span>
                </li>
              </ul>

              <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-6">
                <p className="text-sm text-sky-100">
                  <strong>Note:</strong> This page is for live template preview. Click on &quot;Use Template&quot; to open the
                  full editor and build your resume.
                </p>
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20">
              <div className="flex flex-col gap-4">
                <Link
                  href={`/editor?template=${id}`}
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/20 transition hover:brightness-105 sm:py-3"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit &amp; Create Resume
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
