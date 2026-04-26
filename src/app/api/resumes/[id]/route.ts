import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resumeDataSchema } from "@/types/resume";
import { assertResumeOwner } from "@/lib/resume-access";
import { ensureResumeIds } from "@/lib/normalize-resume";
import { listTemplateIds } from "@/lib/templates/render";
import {
  apiSuccess,
  badRequestError,
  notFoundError,
  unauthorizedError,
  validationError,
} from "@/lib/api-response";
import { z } from "zod";

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  templateId: z.string().optional(),
  data: resumeDataSchema.optional(),
});

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedError();
  }
  const { id } = await ctx.params;
  const { error, resume } = await assertResumeOwner(id, session.user.id);
  if (error || !resume) {
    return notFoundError();
  }
  const full = await prisma.resume.findUnique({ where: { id } });
  return apiSuccess({ resume: full }, { code: "RESUME_FETCHED" });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedError();
  }
  const { id } = await ctx.params;
  const { error, resume } = await assertResumeOwner(id, session.user.id);
  if (error || !resume) {
    return notFoundError();
  }
  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return validationError(parsed.error.flatten(), "Invalid resume update payload.");
  }
  const { title, templateId, data } = parsed.data;
  const allowedTemplates = new Set(listTemplateIds());

  if (templateId !== undefined) {
    if (!allowedTemplates.has(templateId)) {
      return badRequestError("Invalid template");
    }
  }

  const normalizedData = data !== undefined ? ensureResumeIds(data) : undefined;

  const updated = await prisma.resume.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(templateId !== undefined ? { templateId } : {}),
      ...(normalizedData !== undefined ? { data: normalizedData as object } : {}),
    },
  });
  return apiSuccess({ resume: updated }, { code: "RESUME_UPDATED" });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedError();
  }
  const { id } = await ctx.params;
  const { error, resume } = await assertResumeOwner(id, session.user.id);
  if (error || !resume) {
    return notFoundError();
  }
  await prisma.resume.delete({ where: { id } });
  return apiSuccess({}, { code: "RESUME_DELETED" });
}
