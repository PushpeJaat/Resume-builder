import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { htmlToPdfBuffer } from "@/lib/browserless";
import { renderResumeDocument } from "@/lib/templates/render";
import { resumeDataSchema, type ResumeData } from "@/types/resume";
import { ensureResumeIds } from "@/lib/normalize-resume";
import { assertResumeOwner } from "@/lib/resume-access";
import { getPlanDownloadAccess } from "@/lib/server/plan-access";

export const runtime = "nodejs";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const { error, resume } = await assertResumeOwner(id, session.user.id);
  if (error || !resume) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const planAccess = await getPlanDownloadAccess(session.user.id);

  if (planAccess.status === "NO_ACTIVE_PLAN") {
    return NextResponse.json(
      {
        error: "Your plan is inactive or expired. Please choose a plan to continue downloading.",
        code: "PLAN_REQUIRED",
        redirectTo: "/pricing",
      },
      { status: 402 },
    );
  }

  if (planAccess.status === "LIMIT_REACHED") {
    return NextResponse.json(
      {
        error: `Download limit reached. You can download up to ${planAccess.downloadLimit} resumes per plan period.`,
        code: "DOWNLOAD_LIMIT_REACHED",
        redirectTo: "/pricing",
        downloadsUsed: planAccess.downloadsUsed,
        downloadLimit: planAccess.downloadLimit,
      },
      { status: 403 },
    );
  }

  const parsed = resumeDataSchema.safeParse(resume.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid resume data" }, { status: 400 });
  }
  const data = ensureResumeIds(parsed.data) as ResumeData;

  const html = renderResumeDocument(resume.templateId, data);

  let pdf: ArrayBuffer;
  try {
    pdf = await htmlToPdfBuffer(html);
  } catch (e) {
    const message = e instanceof Error ? e.message : "PDF generation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  try {
    await prisma.downloadHistory.create({
      data: {
        userId: session.user.id,
        resumeId: id,
        templateId: resume.templateId,
      },
    });
  } catch (error) {
    // Download should still succeed even if analytics/history persistence fails.
    console.error("Failed to record download history", error);
  }

  const safeName = resume.title.replace(/[^\w\s-]/g, "").trim().slice(0, 80) || "resume";

  return new NextResponse(Buffer.from(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeName}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
