import { GoogleGenerativeAI, SchemaType, type ResponseSchema } from "@google/generative-ai";
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
const DEFAULT_GEMINI_MODEL = "gemini-1.5-flash";
const DEFAULT_GEMINI_TIMEOUT_MS = 8000;
const DEFAULT_MAX_OUTPUT_TOKENS = 2400;
const RETRY_MIN_OUTPUT_TOKENS = 3800;
const RETRY_TIMEOUT_BONUS_MS = 10000;
const HOBBY_TIER_SAFE_TIMEOUT_MS = 8000;
const MEANINGFUL_DATA_ERROR =
  "Could not extract meaningful data from this PDF. Try a cleaner text-based PDF or an OCR-enabled export.";

const RESUME_RESPONSE_SCHEMA: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    fullName: { type: SchemaType.STRING },
    email: { type: SchemaType.STRING },
    phone: { type: SchemaType.STRING },
    photoUrl: { type: SchemaType.STRING },
    summary: { type: SchemaType.STRING },
    skills: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
    education: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          school: { type: SchemaType.STRING, nullable: true },
          degree: { type: SchemaType.STRING, nullable: true },
          start: { type: SchemaType.STRING, nullable: true },
          end: { type: SchemaType.STRING, nullable: true },
          details: { type: SchemaType.STRING, nullable: true },
        },
      },
    },
    workExperience: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          company: { type: SchemaType.STRING, nullable: true },
          role: { type: SchemaType.STRING, nullable: true },
          start: { type: SchemaType.STRING, nullable: true },
          end: { type: SchemaType.STRING, nullable: true },
          bullets: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            nullable: true,
          },
        },
      },
    },
  },
  required: ["fullName", "email", "phone", "photoUrl", "summary", "skills", "education", "workExperience"],
};

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
  "- If a value is clearly present in the PDF, do not leave it empty.",
  "- photoUrl must be a real http(s) URL or data:image URL if explicitly present; otherwise return empty string.",
  "- Keep education and workExperience as arrays of objects.",
].join("\n");

const COMPACT_EXTRACTION_PROMPT = [
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
  "- Keep output compact for multi-page resumes:",
  "  - summary max 90 words.",
  "  - skills max 20 items.",
  "  - education max 8 objects.",
  "  - workExperience max 8 objects.",
  "  - bullets max 4 items per role and 20 words per bullet.",
  "- Prefer the most recent and most relevant entries when trimming.",
].join("\n");

const SALVAGE_EXTRACTION_PROMPT = [
  "Extract resume information from this PDF and return JSON only.",
  "Important: prioritize finding any real fields instead of returning empty values.",
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
  "- If at least one contact/detail is visible, include it.",
  "- Use concise values and avoid long prose.",
  "- If truly unavailable, return empty string or empty array.",
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

  let extractedResume: ExtractedResume | null = null;
  try {
    const modelName = (process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL).trim() || DEFAULT_GEMINI_MODEL;
    const geminiTimeoutMs = parsePositiveInt(process.env.GEMINI_TIMEOUT_MS, DEFAULT_GEMINI_TIMEOUT_MS);
    const maxOutputTokens = parsePositiveInt(process.env.GEMINI_MAX_OUTPUT_TOKENS, DEFAULT_MAX_OUTPUT_TOKENS);
    const retryOutputTokens = Math.max(maxOutputTokens, RETRY_MIN_OUTPUT_TOKENS);
    const isTightTimeoutBudget = geminiTimeoutMs <= HOBBY_TIER_SAFE_TIMEOUT_MS;

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const allAttempts = [
      {
        prompt: EXTRACTION_PROMPT,
        outputTokens: maxOutputTokens,
        timeoutMs: geminiTimeoutMs,
        timeoutMessage: "Gemini extraction timed out. Try a smaller file.",
      },
      {
        prompt: COMPACT_EXTRACTION_PROMPT,
        outputTokens: retryOutputTokens,
        timeoutMs: geminiTimeoutMs + RETRY_TIMEOUT_BONUS_MS,
        timeoutMessage: "Gemini extraction timed out while retrying a compact pass.",
      },
      {
        prompt: SALVAGE_EXTRACTION_PROMPT,
        outputTokens: retryOutputTokens,
        timeoutMs: geminiTimeoutMs + RETRY_TIMEOUT_BONUS_MS,
        timeoutMessage: "Gemini extraction timed out while retrying a salvage pass.",
      },
    ] as const;

    // On tight budgets (e.g. Vercel Hobby), use a single compact pass so we can
    // return gracefully before platform execution limits terminate the function.
    const attempts = isTightTimeoutBudget ? [allAttempts[1]] : allAttempts;

    let lastAttemptMessage = "Gemini returned invalid JSON.";

    for (const attempt of attempts) {
      try {
        const result = await withTimeout(
          model.generateContent({
            contents: [
              {
                role: "user",
                parts: [
                  { text: attempt.prompt },
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
              responseSchema: RESUME_RESPONSE_SCHEMA,
              temperature: 0,
              maxOutputTokens: attempt.outputTokens,
            },
          }),
          attempt.timeoutMs,
          attempt.timeoutMessage,
        );

        const rawText = result.response.text();
        if (!rawText) {
          lastAttemptMessage = "Gemini returned an empty response.";
          continue;
        }

        const parsed = parseGeminiJson(rawText);
        if (!parsed) {
          lastAttemptMessage = "Gemini returned invalid JSON.";
          continue;
        }

        const candidate = normalizeExtractedResume(parsed);
        if (hasMeaningfulExtraction(candidate)) {
          extractedResume = candidate;
          break;
        }

        lastAttemptMessage = "Gemini returned empty structured resume data.";
      } catch (error) {
        lastAttemptMessage = error instanceof Error ? error.message : "Gemini extraction failed.";
      }
    }

    if (!extractedResume) {
      if (/timed out/i.test(lastAttemptMessage)) {
        throw new Error(lastAttemptMessage);
      }

      return NextResponse.json({ error: MEANINGFUL_DATA_ERROR }, { status: 422 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gemini extraction failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (!extractedResume) {
    return NextResponse.json({ error: MEANINGFUL_DATA_ERROR }, { status: 422 });
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
  const personalInfo = asRecord(record.personalInfo ?? record.personal);

  const normalized: ExtractedResume = {
    fullName: readTextFromRecords([record, personalInfo], ["fullName", "name"]),
    email: readTextFromRecords([record, personalInfo], ["email"]),
    phone: readTextFromRecords([record, personalInfo], ["phone", "phoneNumber"]),
    photoUrl: normalizePhotoUrl(
      readTextFromRecords([record, personalInfo], ["photoUrl", "profilePhotoUrl", "photo", "avatarUrl"]),
    ),
    summary: readTextFromRecords([record, personalInfo], ["summary", "professionalSummary", "profile", "objective"]),
    skills: normalizeSkills(record.skills ?? personalInfo.skills),
    education: normalizeRecordArray(record.education ?? personalInfo.education),
    workExperience: normalizeRecordArray(
      record.workExperience ?? record.experience ?? personalInfo.workExperience ?? personalInfo.experience,
    ),
  };

  return normalized;
}

function normalizeSkills(value: unknown): string[] {
  if (Array.isArray(value)) {
    const tokens = value
      .flatMap((item) => {
        if (typeof item === "string" || typeof item === "number") {
          return [asString(item)];
        }

        if (typeof item !== "object" || item === null) {
          return [];
        }

        const record = item as Record<string, unknown>;
        const direct = asString(record.skill ?? record.name ?? record.value ?? record.category);
        if (direct) {
          return [direct];
        }

        const nested = normalizeSkills(record.items ?? record.skills ?? record.keywords);
        return nested;
      })
      .filter(Boolean);

    return Array.from(new Set(tokens));
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

function readTextFromRecords(records: Array<Record<string, unknown>>, keys: string[]) {
  for (const record of records) {
    const value = readText(record, keys);
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

function parseGeminiJson(value: string): unknown | null {
  const cleaned = stripCodeFences(value);
  const candidates = new Set<string>();

  if (cleaned) {
    candidates.add(cleaned);
  }

  const objectCandidate = extractJsonCandidate(cleaned, "{", "}");
  if (objectCandidate) {
    candidates.add(objectCandidate);
  }

  const arrayCandidate = extractJsonCandidate(cleaned, "[", "]");
  if (arrayCandidate) {
    candidates.add(arrayCandidate);
  }

  for (const candidate of extractBalancedJsonCandidates(cleaned)) {
    candidates.add(candidate);
  }

  for (const candidate of candidates) {
    const parsed = safeJsonParse(candidate);
    if (parsed !== null) {
      return parsed;
    }

    const sanitized = stripTrailingCommas(candidate);
    if (sanitized !== candidate) {
      const parsedSanitized = safeJsonParse(sanitized);
      if (parsedSanitized !== null) {
        return parsedSanitized;
      }
    }
  }

  return null;
}

function extractBalancedJsonCandidates(value: string): string[] {
  const out: string[] = [];

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char !== "{" && char !== "[") {
      continue;
    }

    const end = findBalancedJsonEnd(value, index);
    if (end <= index) {
      continue;
    }

    out.push(value.slice(index, end + 1).trim());
  }

  return out;
}

function findBalancedJsonEnd(value: string, startIndex: number) {
  const openChar = value[startIndex];
  const closeChar = openChar === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escaping = false;

  for (let index = startIndex; index < value.length; index += 1) {
    const char = value[index];

    if (inString) {
      if (escaping) {
        escaping = false;
      } else if (char === "\\") {
        escaping = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === openChar) {
      depth += 1;
      continue;
    }

    if (char === closeChar) {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}

function stripTrailingCommas(value: string) {
  return value.replace(/,\s*([}\]])/g, "$1");
}

function extractJsonCandidate(value: string, openChar: "{" | "[", closeChar: "}" | "]") {
  const start = value.indexOf(openChar);
  const end = value.lastIndexOf(closeChar);
  if (start < 0 || end <= start) {
    return "";
  }

  return value.slice(start, end + 1).trim();
}

function stripCodeFences(value: string) {
  return value
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown) {
  if (typeof value === "string") {
    return value.replace(/\s+/g, " ").trim();
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "";
  }

  return "";
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

function hasMeaningfulExtraction(data: ExtractedResume) {
  return Boolean(
    data.fullName ||
      data.email ||
      data.phone ||
      data.photoUrl ||
      data.summary ||
      data.skills.length > 0 ||
      data.education.length > 0 ||
      data.workExperience.length > 0,
  );
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
