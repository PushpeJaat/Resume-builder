import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      category: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return NextResponse.json({
    posts: posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      authorName: post.author?.name || post.author?.email || "CVpilot Team",
    })),
  });
}
