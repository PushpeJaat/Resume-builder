import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getTemplateMeta } from "@/lib/templates/registry";
import { renderResumeDocument } from "@/lib/templates/render";
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
    "Experienced product designer with 6+ years creating intuitive digital experiences for SaaS companies. Passionate about solving complex problems through thoughtful design.",
  experience: [
    {
      company: "Design Studio Inc.",
      role: "Senior Product Designer",
      start: "2021",
      end: "Present",
      bullets: [
        "Led design system overhaul, improving team efficiency by 40%",
        "Directed user research for 5+ major product launches",
        "Mentored junior designers and conducted design critiques",
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
        "Collaborated cross-functionally with engineering and product teams",
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
    { category: "Design Tools", items: ["Figma", "Adobe XD", "Sketch", "Protopie"] },
    { category: "Skills", items: ["UI/UX Design", "User Research", "Wireframing", "Prototyping", "Design Systems"] },
    { category: "Soft Skills", items: ["Communication", "Leadership", "Problem Solving", "Collaboration"] },
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
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-white/[0.04] px-6 py-5 shadow-2xl shadow-black/20">
          <div>
            <h1 className="text-2xl font-bold text-white">{template.name}</h1>
            <p className="mt-1 text-sm text-slate-300">{template.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-white/10 px-4 py-2.5 text-slate-200 transition hover:bg-white/5"
            >
              Back
            </Link>
            <Link
              href={`/editor?template=${id}`}
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 px-6 py-2.5 font-semibold text-slate-950 shadow-md shadow-sky-500/20 transition hover:brightness-105"
            >
              Use This Template
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20">
            <div className="rounded-2xl bg-slate-100 p-6">
              <div className="overflow-hidden rounded-lg bg-white shadow-xl">
                <div className="aspect-[8.5/11] overflow-auto" dangerouslySetInnerHTML={{ __html: html }} />
              </div>
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
                  <strong>Note:</strong> You can start editing immediately. Create a free account only when you want to download the PDF and store it in your workspace.
                </p>
              </div>
            </section>

            <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20">
              <div className="flex flex-col gap-4">
                <Link
                  href={`/editor?template=${id}`}
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 px-6 py-4 font-semibold text-slate-950 shadow-lg shadow-sky-500/20 transition hover:brightness-105"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit & Create Resume
                </Link>

                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-lg border border-white/10 px-6 py-4 font-semibold text-slate-200 transition hover:bg-white/5"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Create Account to Download
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
