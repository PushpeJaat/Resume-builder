import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { importResumeFromFile } from "@/lib/resume-import";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "A resume file is required." }, { status: 400 });
  }

  try {
    const result = await importResumeFromFile(file);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not import resume.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
