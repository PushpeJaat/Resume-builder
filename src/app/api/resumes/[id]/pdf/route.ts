import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { htmlToPdfBuffer } from "@/lib/browserless";
import { buildResumeLayout } from "@/lib/layout/buildResumeLayout";
import { shouldAllowBrowserlessFallback, shouldForceBrowserlessPdf } from "@/lib/pdf/enginePolicy";
import { generatePDF } from "@/lib/pdf/generatePDF";
import { shouldUseLayoutEngine } from "@/lib/templates/registry";
import { renderResumeDocument } from "@/lib/templates/render";
import { resumeDataSchema, type ResumeData } from "@/types/resume";
import { ensureResumeIds } from "@/lib/normalize-resume";
import { assertResumeOwner } from "@/lib/resume-access";
import {
  apiError,
  badRequestError,
  notFoundError,
  unauthorizedError,
  upstreamError,
} from "@/lib/api-response";
import { getPlanDownloadAccess } from "@/lib/server/plan-access";

export const runtime = "nodejs";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorizedError();
  }
  const { id } = await ctx.params;
  const { error, resume } = await assertResumeOwner(id, session.user.id);
  if (error || !resume) {
    return notFoundError();
  }

  const planAccess = await getPlanDownloadAccess(session.user.id);

  if (planAccess.status === "NO_ACTIVE_PLAN") {
    return apiError({
      status: 402,
      code: "PLAN_REQUIRED",
      error: "Your plan is inactive or expired. Please choose a plan to continue downloading.",
      extra: {
        redirectTo: "/pricing",
      },
    });
  }

  if (planAccess.status === "LIMIT_REACHED") {
    return apiError({
      status: 403,
      code: "DOWNLOAD_LIMIT_REACHED",
      error: `Download limit reached. You can download up to ${planAccess.downloadLimit} resumes per plan period.`,
      extra: {
        redirectTo: "/pricing",
        downloadsUsed: planAccess.downloadsUsed,
        downloadLimit: planAccess.downloadLimit,
      },
    });
  }

  const parsed = resumeDataSchema.safeParse(resume.data);
  if (!parsed.success) {
    return badRequestError("Invalid resume data");
  }
  const data = ensureResumeIds(parsed.data) as ResumeData;

  const useLayoutEngine = shouldUseLayoutEngine(resume.templateId);
  const forceBrowserless = shouldForceBrowserlessPdf();
  const allowBrowserlessFallback = shouldAllowBrowserlessFallback();

  let browserlessReason: "forced" | "template-not-migrated" | "layout-error" | null = null;
  let pdfBytes: Uint8Array | null = null;

  if (!forceBrowserless && useLayoutEngine) {
    try {
      const layout = buildResumeLayout(data, resume.templateId);
      pdfBytes = await generatePDF(layout);
    } catch (error) {
      browserlessReason = "layout-error";
      const message = error instanceof Error ? error.message : "Layout PDF generation failed";
      console.error("Layout PDF generation failed", {
        resumeId: id,
        templateId: resume.templateId,
        message,
      });

      if (!allowBrowserlessFallback) {
        return upstreamError(message);
      }
    }
  } else if (forceBrowserless) {
    browserlessReason = "forced";
  } else {
    browserlessReason = "template-not-migrated";
  }

  if (!pdfBytes) {
    if (!browserlessReason) {
      browserlessReason = "template-not-migrated";
    }

    console.info("Using Browserless PDF renderer", {
      resumeId: id,
      templateId: resume.templateId,
      reason: browserlessReason,
    });

    const html = renderResumeDocument(resume.templateId, data);

    try {
      const pdf = await htmlToPdfBuffer(html);
      pdfBytes = new Uint8Array(pdf);
    } catch (e) {
      const message = e instanceof Error ? e.message : "PDF generation failed";
      return upstreamError(message);
    }
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

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeName}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
