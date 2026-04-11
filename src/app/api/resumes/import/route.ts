import { NextResponse } from "next/server";
import { importResumeFromFile } from "@/lib/resume-import";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const formData = await req.formData().catch(() => null);
  const file = formData ? formData.get("file") : null;

  if (!isUploadedFile(file)) {
    return NextResponse.json({ error: "A resume file is required." }, { status: 400 });
  }

  try {
    const result = await importResumeFromFile(file as File);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not import resume.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

function isUploadedFile(value: FormDataEntryValue | null | undefined): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "arrayBuffer" in value &&
    "size" in value &&
    "name" in value
  );
}
