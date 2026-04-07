import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { emptyResumeData } from "@/types/resume";
import { DEFAULT_TEMPLATE_ID } from "@/lib/templates/registry";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const resumes = await prisma.resume.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      templateId: true,
      updatedAt: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ resumes });
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const resume = await prisma.resume.create({
    data: {
      userId: session.user.id,
      title: "Untitled resume",
      templateId: DEFAULT_TEMPLATE_ID,
      data: emptyResumeData() as object,
    },
    select: { id: true },
  });
  return NextResponse.json({ id: resume.id });
}
