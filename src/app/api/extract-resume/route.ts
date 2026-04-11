import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ExtractedResume = {
  fullName: string;
  email: string;
  phone: string;
  skills: string[];
  education: Array<Record<string, unknown>>;
  workExperience: Array<Record<string, unknown>>;
};

const EXTRACTION_PROMPT = [
  "Extract resume information from this PDF and return JSON only.",
  "Required fields:",
  "- fullName: string",
  "- email: string",
  "- phone: string",
  "- skills: string[]",
  "- education: object[]",
  "- workExperience: object[]",
  "Rules:",
  "- Do not include markdown or code fences.",
  "- If a value is missing, return empty string or empty array.",
  "- Keep education and workExperience as arrays of objects.",
].join("\n");

export async function POST(req: Request) {
  const formData = await req.formData().catch(() => null);
  const resume = formData?.get("resume");

  if (!isUploadableFile(resume)) {
    return NextResponse.json({ error: "A PDF file is required in form field 'resume'." }, { status: 400 });
  }

  if (resume.size <= 0) {
    return NextResponse.json({ error: "Uploaded resume file is empty." }, { status: 400 });
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!geminiApiKey) {
    return NextResponse.json({ error: "Missing GEMINI_API_KEY." }, { status: 500 });
  }

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return NextResponse.json(
      { error: "Missing Supabase server configuration variables." },
      { status: 500 },
    );
  }

  let base64Pdf = "";
  try {
    const fileBuffer = Buffer.from(await resume.arrayBuffer());
    base64Pdf = fileBuffer.toString("base64");
  } catch {
    return NextResponse.json({ error: "Failed to read uploaded resume file." }, { status: 400 });
  }

  let extractedResume: ExtractedResume;
  try {
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: EXTRACTION_PROMPT },
            {
              inlineData: {
                data: base64Pdf,
                mimeType: "application/pdf",
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0,
      },
    });

    const rawText = result.response.text();
    if (!rawText) {
      throw new Error("Gemini returned an empty response.");
    }

    const parsed = safeJsonParse(rawText);
    if (!parsed) {
      throw new Error("Gemini returned invalid JSON.");
    }

    extractedResume = normalizeExtractedResume(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gemini extraction failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const primaryInsert = await supabase
      .from("extracted_resumes")
      .insert([{ extracted_data: extractedResume, source_file_name: resume.name }]);

    if (primaryInsert.error) {
      throw primaryInsert.error;
    }
  } catch (error) {
    const message = getErrorMessage(error, "Failed to save extracted resume.");
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json(extractedResume, { status: 200 });
}

function normalizeExtractedResume(payload: unknown): ExtractedResume {
  const record = asRecord(payload);

  const normalized: ExtractedResume = {
    fullName: readText(record, ["fullName", "name"]),
    email: readText(record, ["email"]),
    phone: readText(record, ["phone", "phoneNumber"]),
    skills: normalizeSkills(record.skills),
    education: normalizeRecordArray(record.education),
    workExperience: normalizeRecordArray(record.workExperience ?? record.experience),
  };

  return normalized;
}

function normalizeSkills(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => asString(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[\n,|•]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeRecordArray(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => asRecord(entry))
    .filter((entry): entry is Record<string, unknown> => entry !== null);
}

function readText(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = asString(record[key]);
    if (value) {
      return value;
    }
  }

  return "";
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

function safeJsonParse(value: string): unknown | null {
  try {
    return JSON.parse(stripCodeFences(value));
  } catch {
    return null;
  }
}

function stripCodeFences(value: string) {
  return value.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/, "").trim();
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const record = error as Record<string, unknown>;
    const parts = [record.message, record.details, record.hint]
      .map((value) => (typeof value === "string" ? value.trim() : ""))
      .filter(Boolean);

    if (parts.length > 0) {
      return parts.join(" ");
    }
  }

  return fallback;
}
