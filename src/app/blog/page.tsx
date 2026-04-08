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
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-28 sm:px-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Resume Studio Blog</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Actionable resume advice for faster job offers
            </h1>
            <p className="mt-4 text-base text-slate-600 sm:text-lg">
              Short, practical articles on resume writing, hiring trends, and template strategy.
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          {posts.map((post) => (
            <article key={post.slug} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{post.category}</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">{post.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{post.summary}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs text-slate-500">{post.readTime}</span>
                <Link href="/dashboard/templates" className="text-sm font-semibold text-sky-700 hover:text-sky-900">
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
