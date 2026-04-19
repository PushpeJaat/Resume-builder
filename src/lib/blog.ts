import { prisma } from "@/lib/prisma";

export type PublishedBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  authorName: string;
};

export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return base || "blog-post";
}

export async function createUniqueBlogSlug(input: string): Promise<string> {
  const base = slugify(input);
  let candidate = base;
  let suffix = 1;

  while (true) {
    const exists = await prisma.blogPost.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!exists) {
      return candidate;
    }

    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

export async function getPublishedBlogPosts(): Promise<PublishedBlogPost[]> {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return posts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    authorName: post.author?.name || post.author?.email || "CVpilot Team",
  }));
}

export async function getPublishedBlogPostBySlug(slug: string): Promise<PublishedBlogPost | null> {
  const post = await prisma.blogPost.findFirst({
    where: {
      slug,
      isPublished: true,
    },
    include: {
      author: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!post) {
    return null;
  }

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    authorName: post.author?.name || post.author?.email || "CVpilot Team",
  };
}
