import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resumeDataSchema } from "@/types/resume";
import { assertResumeOwner } from "@/lib/resume-access";
import { ensureResumeIds } from "@/lib/normalize-resume";
import { listTemplateIds } from "@/lib/templates/render";
import { z } from "zod";

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  templateId: z.string().optional(),
  data: resumeDataSchema.optional(),
});

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const { error, resume } = await assertResumeOwner(id, session.user.id);
  if (error || !resume) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const full = await prisma.resume.findUnique({ where: { id } });
  return NextResponse.json({ resume: full });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const { error, resume } = await assertResumeOwner(id, session.user.id);
  if (error || !resume) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { title, templateId, data } = parsed.data;
  const allowedTemplates = new Set(listTemplateIds());

  if (templateId !== undefined) {
    if (!allowedTemplates.has(templateId)) {
      return NextResponse.json({ error: "Invalid template" }, { status: 400 });
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
  return NextResponse.json({ resume: updated });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const { error, resume } = await assertResumeOwner(id, session.user.id);
  if (error || !resume) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.resume.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
