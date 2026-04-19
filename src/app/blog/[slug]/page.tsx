import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getPublishedBlogPostBySlug } from "@/lib/blog";

export const dynamic = "force-dynamic";

function splitParagraphs(content: string): string[] {
  return content
    .split(/\n\s*\n/g)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0);
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const paragraphs = splitParagraphs(post.content);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteHeader theme="dark" />
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-28 sm:px-6">
        <Link
          href="/blog"
          className="inline-flex items-center rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
        >
          Back to Blog
        </Link>

        <article className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-7 shadow-2xl shadow-black/25 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">{post.category}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">{post.title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            <span>By {post.authorName}</span>
          </div>

          <div className="mt-8 space-y-5 text-[15px] leading-8 text-slate-200 sm:text-base">
            {paragraphs.length > 0
              ? paragraphs.map((paragraph, index) => <p key={`${post.id}-paragraph-${index}`}>{paragraph}</p>)
              : <p>{post.content}</p>}
          </div>
        </article>
      </main>
    </div>
  );
}
