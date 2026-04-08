import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";

const posts = [
  {
    slug: "how-to-build-an-ats-friendly-resume",
    title: "How to Build an ATS-Friendly Resume in 2026",
    summary: "A practical checklist for keywords, layout, and readability so your resume passes screening systems.",
    category: "Career",
    readTime: "6 min read",
  },
  {
    slug: "resume-mistakes-that-cost-interviews",
    title: "7 Resume Mistakes That Cost Interviews",
    summary: "From weak achievement bullets to formatting issues, avoid these common blockers during hiring.",
    category: "Guides",
    readTime: "5 min read",
  },
  {
    slug: "best-resume-templates-for-tech-roles",
    title: "Best Resume Templates for Tech Roles",
    summary: "Compare minimal, modern, and creative templates by role, experience level, and hiring context.",
    category: "Templates",
    readTime: "4 min read",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteHeader theme="dark" />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-28 sm:px-6">
        <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/25 sm:p-10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">CVpilot Blog</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Actionable resume advice for faster job offers
            </h1>
            <p className="mt-4 text-base text-slate-300 sm:text-lg">
              Short, practical articles on resume writing, hiring trends, and template strategy.
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          {posts.map((post) => (
            <article key={post.slug} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-white/[0.06]">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{post.category}</p>
              <h2 className="mt-2 text-xl font-semibold text-white">{post.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{post.summary}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs text-slate-400">{post.readTime}</span>
                <Link href="/dashboard/templates" className="text-sm font-semibold text-sky-300 transition hover:text-sky-200">
                  Start from template
                </Link>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
