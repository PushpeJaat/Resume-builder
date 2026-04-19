import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getPublishedBlogPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

function estimateReadTime(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `${minutes} min read`;
}

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

  const featuredPost = posts[0] ?? null;
  const latestPosts = featuredPost ? posts.slice(1) : posts;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteHeader theme="dark" />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-28 sm:px-6">
        <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(140deg,rgba(15,23,42,0.82)_0%,rgba(30,41,59,0.62)_38%,rgba(12,74,110,0.48)_100%)] p-8 shadow-2xl shadow-black/25 sm:p-10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">CVpilot Blog</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Actionable resume advice for faster job offers
            </h1>
            <p className="mt-4 text-base text-slate-300 sm:text-lg">
              Long-form, practical playbooks on resume writing, interviews, and landing better roles.
            </p>
          </div>
        </section>

        {featuredPost ? (
          <section className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Featured</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">{featuredPost.title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{featuredPost.excerpt}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="rounded-full border border-white/15 px-2.5 py-1 uppercase tracking-[0.13em] text-slate-300">
                {featuredPost.category}
              </span>
              <span>{estimateReadTime(featuredPost.content)}</span>
              <span>{new Date(featuredPost.createdAt).toLocaleDateString()}</span>
              <span>By {featuredPost.authorName}</span>
            </div>
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="mt-6 inline-flex items-center rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-105"
            >
              Read article
            </Link>
          </section>
        ) : null}

        {latestPosts.length > 0 ? (
          <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {latestPosts.map((post) => (
              <article key={post.id} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-white/[0.06]">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{post.category}</p>
                <h2 className="mt-2 text-xl font-semibold text-white">{post.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{post.excerpt}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{estimateReadTime(post.content)}</span>
                  <Link href={`/blog/${post.slug}`} className="text-sm font-semibold text-sky-300 transition hover:text-sky-200">
                    Read more
                  </Link>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.04] p-8 text-center shadow-xl shadow-black/20">
            <h2 className="text-xl font-semibold text-white">No blog posts published yet</h2>
            <p className="mt-2 text-sm text-slate-300">
              Admin can publish the first article from the new admin dashboard.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
