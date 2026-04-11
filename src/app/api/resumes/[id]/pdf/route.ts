import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { htmlToPdfBuffer } from "@/lib/browserless";
import { renderResumeDocument } from "@/lib/templates/render";
import { resumeDataSchema, type ResumeData } from "@/types/resume";
import { ensureResumeIds } from "@/lib/normalize-resume";
import { assertResumeOwner } from "@/lib/resume-access";

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

  const reqUrl = new URL(req.url);
  const devBypass =
    process.env.NODE_ENV !== "production" && reqUrl.searchParams.get("devBypass") === "1";

  if (!devBypass) {
    const paidOrder = await prisma.paymentOrder.findFirst({
      where: {
        userId: session.user.id,
        resumeId: id,
        status: "PAID",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!paidOrder) {
      return NextResponse.json(
        { error: "Payment required. Complete payment to download this resume." },
        { status: 402 },
      );
    }
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
