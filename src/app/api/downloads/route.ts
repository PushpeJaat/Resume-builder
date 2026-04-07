import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await prisma.downloadHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      resume: { select: { title: true } },
    },
  });
  return NextResponse.json({
    downloads: items.map((d) => ({
      id: d.id,
      createdAt: d.createdAt,
      templateId: d.templateId,
      resumeTitle: d.resume.title,
      resumeId: d.resumeId,
    })),
  });
}
