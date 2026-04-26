import { z } from "zod";
import { auth } from "@/auth";
import { createUniqueBlogSlug } from "@/lib/blog";
import {
  apiSuccess,
  forbiddenError,
  unauthorizedError,
  validationError,
} from "@/lib/api-response";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const createBlogSchema = z.object({
  title: z.string().trim().min(8, "Title should be at least 8 characters").max(180),
  excerpt: z.string().trim().max(320).optional(),
  content: z.string().trim().min(40, "Content should be at least 40 characters"),
  category: z.string().trim().min(2).max(40).optional(),
  isPublished: z.boolean().optional(),
});

function ensureExcerpt(excerpt: string | undefined, content: string): string {
  if (excerpt && excerpt.length > 0) {
    return excerpt;
  }

  const normalized = content.replace(/\s+/g, " ").trim();
  if (normalized.length <= 180) {
    return normalized;
  }

  return `${normalized.slice(0, 177).trimEnd()}...`;
}

async function ensureAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: unauthorizedError() };
  }

  if (!isAdminEmail(session.user.email)) {
    return { error: forbiddenError() };
  }

  return { session };
}

export async function GET() {
  const gate = await ensureAdmin();
  if (gate.error) {
    return gate.error;
  }

  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return apiSuccess(
    {
      posts: posts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        isPublished: post.isPublished,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        authorName: post.author?.name || post.author?.email || "CVpilot Team",
      })),
    },
    { code: "ADMIN_BLOGS_LISTED" },
  );
}

export async function POST(request: Request) {
  const gate = await ensureAdmin();
  if (gate.error || !gate.session) {
    return gate.error;
  }

  const json = (await request.json().catch(() => null)) as unknown;
  const parsed = createBlogSchema.safeParse(json);

  if (!parsed.success) {
    return validationError(parsed.error.flatten(), "Invalid blog payload.");
  }

  const { title, excerpt, content, category, isPublished } = parsed.data;
  const slug = await createUniqueBlogSlug(title);

  const post = await prisma.blogPost.create({
    data: {
      title,
      slug,
      excerpt: ensureExcerpt(excerpt, content),
      content,
      category: category || "Guides",
      isPublished: isPublished ?? true,
      authorId: gate.session.user.id,
    },
  });

  return apiSuccess(
    {
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        isPublished: post.isPublished,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      },
    },
    { code: "ADMIN_BLOG_CREATED" },
  );
}
