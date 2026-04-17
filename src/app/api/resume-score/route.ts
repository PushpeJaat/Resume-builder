import { NextRequest, NextResponse } from "next/server";
import { scoreResume } from "@/lib/server/resume-scoring";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("resume");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  // For simplicity, treat all as text. In production, parse PDF/DOCX properly.
  const text = buffer.toString("utf8");
  const { score, feedback } = await scoreResume(text);
  return NextResponse.json({ score, feedback });
}
