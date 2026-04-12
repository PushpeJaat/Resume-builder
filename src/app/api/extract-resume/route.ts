import { NextResponse } from "next/server";

import { parseResumeFile, ResumePipelineError } from "@/lib/server/resume-parsing";

export const runtime = "nodejs";

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
      return NextResponse.json(
        {
          error:
            "Structured AI parsing is unavailable. Configure GEMINI_API_KEY to return parsed resume JSON.",
        },
        { status: 422 },
      );
    }

    return NextResponse.json(result.parsedResume, {
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