import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { parseResumeFile, ResumePipelineError } from "@/lib/server/resume-parsing";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const formData = await req.formData().catch(() => null);
  const resume = formData?.get("resume");

  if (!isUploadableFile(resume)) {
    return NextResponse.json(
      { error: "A PDF file is required in form field 'resume'." },
      { status: 400 },
    );
  }

  try {
    const result = await parseResumeFile(resume);

    if (!result.parsedResume) {
      const reason = result.geminiError?.trim();
      return NextResponse.json(
        {
          error: reason
            ? `Structured AI parsing failed: ${reason}`
            : "Structured AI parsing is unavailable. Configure GEMINI_API_KEY to return parsed resume JSON.",
        },
        { status: 422 },
      );
    }

    const created = await prisma.extractedResume.create({
      data: {
        extractedData: result.parsedResume as Prisma.InputJsonValue,
        sourceFileName: resume.name || "resume.pdf",
      },
    });

    return NextResponse.json({
      ...result.parsedResume,
      parsed_resume: result.parsedResume,
      extraction: {
        id: created.id,
        source_file_name: created.sourceFileName,
        created_at: created.createdAt.toISOString(),
        created_at_readable: formatReadableDate(created.createdAt),
      },
    }, {
      status: 200,
      headers: {
        "X-Resume-Parse-Source": result.meta.source,
      },
    });
  } catch (error) {
    if (error instanceof ResumePipelineError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "Failed to extract resume.";
    return NextResponse.json({ error: message }, { status: 500 });
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