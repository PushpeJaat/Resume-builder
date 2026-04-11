import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ExtractedResume = {
  fullName: string;
  email: string;
  phone: string;
  photoUrl: string;
  summary: string;
  skills: string[];
  education: Array<Record<string, unknown>>;
  workExperience: Array<Record<string, unknown>>;
};

const MAX_RESUME_BYTES = 3 * 1024 * 1024;
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const DEFAULT_GEMINI_TIMEOUT_MS = 20000;
const DEFAULT_MAX_OUTPUT_TOKENS = 1200;

const EXTRACTION_PROMPT = [
  "Extract resume information from this PDF and return JSON only.",
  "Required fields:",
  "- fullName: string",
  "- email: string",
  "- phone: string",
  "- photoUrl: string",
  "- summary: string",
  "- skills: string[]",
  "- education: object[]",
  "- workExperience: object[]",
  "Rules:",
  "- Do not include markdown or code fences.",
  "- If a value is missing, return empty string or empty array.",
  "- photoUrl must be a real http(s) URL or data:image URL if explicitly present; otherwise return empty string.",
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

  if (resume.size > MAX_RESUME_BYTES) {
    return NextResponse.json(
      { error: "Resume PDF is too large for fast AI extraction. Please upload a file up to 3 MB." },
      { status: 400 },
    );
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
    const modelName = DEFAULT_GEMINI_MODEL;
    const geminiTimeoutMs = parsePositiveInt(process.env.GEMINI_TIMEOUT_MS, DEFAULT_GEMINI_TIMEOUT_MS);
    const maxOutputTokens = parsePositiveInt(process.env.GEMINI_MAX_OUTPUT_TOKENS, DEFAULT_MAX_OUTPUT_TOKENS);

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await withTimeout(
      model.generateContent({
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
          maxOutputTokens,
        },
      }),
      geminiTimeoutMs,
      "Gemini extraction timed out. Try a smaller file.",
    );

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

    const insertId = createExtractedResumeId();

    const primaryInsert = await supabase
      .from("extracted_resumes")
      .insert([
        {
          id: insertId,
          extracted_data: extractedResume,
          source_file_name: resume.name,
        },
      ]);

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
    photoUrl: normalizePhotoUrl(readText(record, ["photoUrl", "profilePhotoUrl", "photo", "avatarUrl"])),
    summary: readText(record, ["summary", "professionalSummary", "profile", "objective"]),
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

function createExtractedResumeId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `er-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizePhotoUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed) || /^data:image\//i.test(trimmed)) {
    return trimmed;
  }

  return "";
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt((value ?? "").trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(message));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}
