import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, unauthorizedError } from "@/lib/api-response";
import { emptyResumeData } from "@/types/resume";
import { DEFAULT_TEMPLATE_ID } from "@/lib/templates/registry";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedError();
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
  return apiSuccess({ resumes }, { code: "RESUMES_LISTED" });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedError();
  }

  let title = "Untitled resume";
  let templateId = DEFAULT_TEMPLATE_ID;
  let data: object = emptyResumeData() as object;

  try {
    const body = await request.json() as { title?: unknown; templateId?: unknown; data?: unknown };
    if (typeof body.title === "string" && body.title.trim()) title = body.title.trim();
    if (typeof body.templateId === "string" && body.templateId) templateId = body.templateId;
    if (body.data && typeof body.data === "object" && !Array.isArray(body.data)) data = body.data as object;
  } catch {
    // No body or invalid JSON — use defaults
  }

  const resume = await prisma.resume.create({
    data: { userId: session.user.id, title, templateId, data },
    select: { id: true },
  });
  return apiSuccess({ id: resume.id }, { code: "RESUME_CREATED" });
}
