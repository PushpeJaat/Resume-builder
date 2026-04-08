import { redirect } from "next/navigation";
import { getTemplateMeta } from "@/lib/templates/registry";
import { renderResumeDocument } from "@/lib/templates/render";
import type { ResumeData } from "@/types/resume";
import Link from "next/link";

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{template.name}</h1>
            <p className="text-sm text-slate-600 mt-1">{template.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-slate-900 hover:bg-slate-100 transition-colors duration-200"
            >
              Back
            </Link>
            <Link
              href={`/editor?template=${id}`}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-gradient-to-r from-sky-600 to-cyan-600 text-white font-semibold shadow-md shadow-sky-600/20 hover:shadow-lg hover:shadow-sky-600/30 transition-all duration-200"
            >
              Use This Template
            </Link>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-slate-100 rounded-lg overflow-hidden shadow-xl p-8">
          <div className="bg-white rounded shadow">
            <div
              className="aspect-[8.5/11] overflow-auto"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>

        {/* Info */}
        <div className="mt-12 max-w-2xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Template Features</h2>
          <ul className="space-y-2 text-slate-700 mb-8">
            <li className="flex items-start gap-3">
              <span className="text-sky-600 font-bold mt-1">✓</span>
              <span>Professional design optimized for ATS (Applicant Tracking Systems)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-sky-600 font-bold mt-1">✓</span>
              <span>Pixel-perfect rendering on screen and in print</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-sky-600 font-bold mt-1">✓</span>
              <span>Customizable layout and sections</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-sky-600 font-bold mt-1">✓</span>
              <span>One-click PDF export with perfect formatting</span>
            </li>
            {template.premium && (
              <li className="flex items-start gap-3">
                <span className="text-purple-600 font-bold mt-1">⭐</span>
                <span>Premium template with exclusive design elements</span>
              </li>
            )}
          </ul>

          <div className="p-6 rounded-lg bg-blue-50 border border-blue-200 mb-8">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> To download your resume as PDF, you&apos;ll need to create a free account. This ensures your resume is securely stored and you can access it anytime.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/editor?template=${id}`}
              className="flex-1 inline-flex items-center justify-center px-6 py-4 rounded-lg bg-gradient-to-r from-sky-600 to-cyan-600 text-white font-semibold shadow-lg shadow-sky-600/30 hover:shadow-xl hover:shadow-sky-600/40 hover:from-sky-700 hover:to-cyan-700 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit & Create Resume
            </Link>

            <Link
              href="/signup"
              className="flex-1 inline-flex items-center justify-center px-6 py-4 rounded-lg border-2 border-slate-300 text-slate-900 font-semibold hover:bg-slate-50 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download as PDF
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
