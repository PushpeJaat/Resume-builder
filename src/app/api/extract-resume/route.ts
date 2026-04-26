import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  apiError,
  apiSuccess,
  badRequestError,
  internalServerError,
  statusToErrorCode,
  unprocessableEntityError,
} from "@/lib/api-response";
import { parseResumeFile, ResumePipelineError } from "@/lib/server/resume-parsing";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const formData = await req.formData().catch(() => null);
  const resume = formData?.get("resume");

  if (!isUploadableFile(resume)) {
    return badRequestError("A PDF file is required in form field 'resume'.");
  }

  try {
    const result = await parseResumeFile(resume);

    if (!result.parsedResume) {
      const reason = result.parserError?.trim();
      return unprocessableEntityError(
        reason
          ? `Structured AI parsing failed: ${reason}`
          : "Structured AI parsing is unavailable. Configure OPENAI_API_KEY to return parsed resume JSON.",
      );
    }

    const created = await prisma.extractedResume.create({
      data: {
        extractedData: result.parsedResume as Prisma.InputJsonValue,
        sourceFileName: resume.name || "resume.pdf",
      },
    });

    return apiSuccess(
      {
        ...result.parsedResume,
        parsed_resume: result.parsedResume,
        extraction: {
          id: created.id,
          source_file_name: created.sourceFileName,
          created_at: created.createdAt.toISOString(),
          created_at_readable: formatReadableDate(created.createdAt),
        },
      },
      {
        code: "RESUME_EXTRACTED",
        headers: {
          "X-Resume-Parse-Source": result.meta.source,
        },
      },
    );
  } catch (error) {
    if (error instanceof ResumePipelineError) {
      return apiError({
        status: error.status,
        code: statusToErrorCode(error.status),
        error: error.message,
      });
    }

    const message = error instanceof Error ? error.message : "Failed to extract resume.";
    return internalServerError(message);
  }
}

function formatReadableDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: true,
  }).format(value);
}

function isUploadableFile(value: FormDataEntryValue | null | undefined): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "arrayBuffer" in value &&
    typeof (value as { arrayBuffer?: unknown }).arrayBuffer === "function" &&
    "name" in value &&
    "size" in value
  );
}