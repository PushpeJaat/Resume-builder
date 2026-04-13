import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { extractText } from "unpdf";

export type ExtractedResume = {
  fullName: string;
  email: string;
  phone: string;
  photoUrl: string;
  summary: string;
  skills: string[];
  education: Array<Record<string, unknown>>;
  workExperience: Array<Record<string, unknown>>;
};

export type ParseResumeMeta = {
  source: "unpdf" | "ocr";
  length: number;
  storage_path: string;
};

export type ParseResumePipelineResult = {
  rawText: string;
  meta: ParseResumeMeta;
  parsedResume?: ExtractedResume;
  geminiError?: string;
};

export class ResumePipelineError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "ResumePipelineError";
    this.status = status;
  }
}

const MAX_RESUME_BYTES = parsePositiveInt(process.env.MAX_RESUME_BYTES, 6 * 1024 * 1024);
const SIGNED_URL_TTL_SECONDS = parsePositiveInt(process.env.SUPABASE_SIGNED_URL_TTL_SECONDS, 10 * 60);
const MIN_EXTRACTED_TEXT_CHARS = parsePositiveInt(process.env.PDF_MIN_TEXT_CHARS, 500);
const FETCH_TIMEOUT_MS = parsePositiveInt(process.env.PDF_FETCH_TIMEOUT_MS, 8_000);
const UNPDF_TIMEOUT_MS = parsePositiveInt(process.env.UNPDF_TIMEOUT_MS, 8_000);
const OCR_TIMEOUT_MS = parsePositiveInt(process.env.OCR_TIMEOUT_MS, 15_000);
const OCR_MAX_RETRIES = parsePositiveInt(process.env.OCR_MAX_RETRIES, 1);
const OCR_MAX_PAGES = parsePositiveInt(process.env.OCR_MAX_PAGES, 5);
const OCR_RETRY_DELAY_MS = parsePositiveInt(process.env.OCR_RETRY_DELAY_MS, 300);
const GEMINI_TIMEOUT_MS = parsePositiveInt(process.env.GEMINI_TIMEOUT_MS, 45_000);
const GEMINI_MAX_OUTPUT_TOKENS = parsePositiveInt(process.env.GEMINI_MAX_OUTPUT_TOKENS, 8_192);
const TOTAL_PIPELINE_TIMEOUT_MS = parsePositiveInt(process.env.PARSE_RESUME_TOTAL_TIMEOUT_MS, 60_000);
const MIN_STEP_TIMEOUT_MS = 1_200;
const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";
const DEFAULT_STORAGE_BUCKET = "resume-uploads";

const SECTION_PATTERNS = [
  {
    canonical: "Experience",
    matchers: [
      /^experience$/i,
      /^work experience$/i,
      /^professional experience$/i,
      /^employment history$/i,
      /^career history$/i,
    ],
  },
  {
    canonical: "Education",
    matchers: [/^education$/i, /^academic background$/i, /^academic qualifications$/i],
  },
  {
    canonical: "Skills",
    matchers: [/^skills$/i, /^technical skills$/i, /^core skills$/i, /^competencies$/i],
  },
  {
    canonical: "Projects",
    matchers: [/^projects$/i, /^personal projects$/i, /^selected projects$/i],
  },
] as const;

const GEMINI_PROMPT = [
  "You are a resume parser.",
  "Convert the resume text into valid JSON only.",
  "Required JSON shape:",
  "{",
  '  "fullName": string,',
  '  "email": string,',
  '  "phone": string,',
  '  "photoUrl": string,',
  '  "summary": string,',
  '  "skills": string[],',
  '  "education": object[],',
  '  "workExperience": object[]',
  "}",
  "Rules:",
  "- Output JSON only. No markdown or code fences.",
  "- Keep missing values as empty strings or empty arrays.",
  "- Never invent links or personal data.",
  "- Keep education and workExperience entries concise.",
].join("\n");

type SupabaseStorageResult = {
  path: string;
  signedUrl: string;
};

type PdfBytesSourceResult = {
  pdfBytes: Uint8Array;
  storagePath: string;
};

type GeminiStructuredResult = {
  parsedResume?: ExtractedResume;
  error?: string;
};

export async function parseResumeFile(file: File): Promise<ParseResumePipelineResult> {
  const deadline = Date.now() + TOTAL_PIPELINE_TIMEOUT_MS;

  validateUploadedPdf(file);

  const { pdfBytes, storagePath } = await resolvePdfBytes(file, deadline);

  const unpdfText = await extractWithUnpdf(pdfBytes, deadline);
  const shouldUseOcr = !unpdfText || unpdfText.trim().length < MIN_EXTRACTED_TEXT_CHARS;
  let usedOcr = false;
  let rawTextCandidate = unpdfText;

  if (shouldUseOcr) {
    try {
      rawTextCandidate = await extractWithGoogleVision(pdfBytes, deadline);
      usedOcr = true;
    } catch {
      // Fall back to unpdf text when OCR dependencies are unavailable.
      rawTextCandidate = unpdfText;
    }
  }

  const cleanedText = cleanAndNormalizeText(rawTextCandidate);

  if (!cleanedText) {
    throw new ResumePipelineError(
      "Could not extract meaningful text from this PDF. Try a clearer resume export.",
      422,
    );
  }

  const geminiResult = await parseWithGeminiFromText(cleanedText, deadline);

  return {
    rawText: cleanedText,
    meta: {
      source: usedOcr ? "ocr" : "unpdf",
      length: cleanedText.length,
      storage_path: storagePath,
    },
    parsedResume: geminiResult.parsedResume,
    geminiError: geminiResult.error,
  };
}

async function resolvePdfBytes(file: File, deadline: number): Promise<PdfBytesSourceResult> {
  if (hasSupabaseStorageConfig()) {
    try {
      const supabase = createServerSupabaseClient();
      const { path, signedUrl } = await uploadAndSignPdf(supabase, file);
      const pdfBytes = await fetchSignedPdfBytes(signedUrl, deadline);
      return {
        pdfBytes,
        storagePath: path,
      };
    } catch {
      // If storage upload/sign fails, continue with direct bytes so extraction still works.
    }
  }

  const directBytes = new Uint8Array(await file.arrayBuffer());
  if (directBytes.byteLength === 0) {
    throw new ResumePipelineError("Uploaded resume file is empty.", 400);
  }

  return {
    pdfBytes: directBytes,
    storagePath: "direct-upload",
  };
}

function hasSupabaseStorageConfig() {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}

function validateUploadedPdf(file: File) {
  if (!file || file.size <= 0) {
    throw new ResumePipelineError("Uploaded resume file is empty.", 400);
  }

  if (file.size > MAX_RESUME_BYTES) {
    const maxMb = Math.floor(MAX_RESUME_BYTES / (1024 * 1024));
    throw new ResumePipelineError(
      `Resume PDF is too large. Please upload a file up to ${maxMb} MB.`,
      400,
    );
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const isPdfMime = (file.type ?? "").toLowerCase().includes("pdf");
  if (extension !== "pdf" && !isPdfMime) {
    throw new ResumePipelineError("Only PDF files are supported.", 400);
  }
}

function createServerSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new ResumePipelineError("Missing Supabase server configuration variables.", 500);
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function uploadAndSignPdf(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  file: File,
): Promise<SupabaseStorageResult> {
  const bucket = (process.env.SUPABASE_RESUME_BUCKET ?? DEFAULT_STORAGE_BUCKET).trim() || DEFAULT_STORAGE_BUCKET;
  const safeName = sanitizeFilename(file.name || "resume.pdf");
  const path = `${new Date().toISOString().slice(0, 10)}/${createUploadId()}-${safeName}`;

  const uploadResult = await supabase.storage.from(bucket).upload(path, file, {
    contentType: "application/pdf",
    upsert: false,
    cacheControl: "3600",
  });

  if (uploadResult.error) {
    throw new ResumePipelineError(getErrorMessage(uploadResult.error, "Failed to upload PDF to storage."), 500);
  }

  const signedUrlResult = await supabase.storage.from(bucket).createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (signedUrlResult.error || !signedUrlResult.data?.signedUrl) {
    throw new ResumePipelineError(
      getErrorMessage(signedUrlResult.error, "Failed to create signed URL for uploaded PDF."),
      500,
    );
  }

  return {
    path,
    signedUrl: signedUrlResult.data.signedUrl,
  };
}

async function fetchSignedPdfBytes(signedUrl: string, deadline: number): Promise<Uint8Array> {
  const response = await fetchWithTimeout(signedUrl, {
    method: "GET",
    headers: {
      Accept: "application/pdf",
    },
    timeoutMs: clampTimeoutToDeadline(
      FETCH_TIMEOUT_MS,
      deadline,
      "Timed out while downloading resume PDF from storage.",
    ),
    timeoutMessage: "Timed out while downloading resume PDF from storage.",
  });

  if (!response.ok) {
    throw new ResumePipelineError(
      `Failed to download uploaded PDF (${response.status}).`,
      response.status >= 500 ? 502 : 500,
    );
  }

  const bytes = await readResponseBodyWithLimit(response, MAX_RESUME_BYTES);

  if (bytes.byteLength === 0) {
    throw new ResumePipelineError("Downloaded PDF is empty.", 400);
  }

  return bytes;
}

async function extractWithUnpdf(pdfBytes: Uint8Array, deadline: number): Promise<string> {
  try {
    const result = await withTimeout(
      extractText(pdfBytes, { mergePages: true }),
      clampTimeoutToDeadline(UNPDF_TIMEOUT_MS, deadline, "unpdf extraction timed out."),
      "unpdf extraction timed out.",
    );

    return result.text;
  } catch (error) {
    const message = getErrorMessage(error, "unpdf extraction failed.");
    throw new ResumePipelineError(message, 500);
  }
}

async function extractWithGoogleVision(pdfBytes: Uint8Array, deadline: number): Promise<string> {
  const apiKey = process.env.GOOGLE_VISION_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new ResumePipelineError(
      "Missing GOOGLE_VISION_API_KEY for OCR fallback. Configure it in server environment variables.",
      500,
    );
  }

  const base64Pdf = Buffer.from(pdfBytes).toString("base64");
  const endpoint = `https://vision.googleapis.com/v1/files:annotate?key=${encodeURIComponent(apiKey)}`;
  const requestBody = {
    requests: [
      {
        inputConfig: {
          mimeType: "application/pdf",
          content: base64Pdf,
        },
        features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
        pages: buildPages(OCR_MAX_PAGES),
      },
    ],
  };

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= OCR_MAX_RETRIES + 1; attempt += 1) {
    try {
      const timeoutMs = clampTimeoutToDeadline(
        OCR_TIMEOUT_MS,
        deadline,
        "Google Vision OCR request timed out.",
      );

      const response = await fetchWithTimeout(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        timeoutMs,
        timeoutMessage: "Google Vision OCR request timed out.",
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Google Vision OCR failed (${response.status}): ${text.slice(0, 300)}`);
      }

      const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
      const ocrText = readVisionText(payload);
      if (!ocrText.trim()) {
        throw new Error("Google Vision OCR returned empty text.");
      }

      return ocrText;
    } catch (error) {
      lastError = error;
      if (attempt <= OCR_MAX_RETRIES) {
        const delayMs = Math.min(OCR_RETRY_DELAY_MS * attempt, Math.max(0, getRemainingMs(deadline) - 500));
        if (delayMs > 0) {
          await delay(delayMs);
        }
      }
    }
  }

  throw new ResumePipelineError(getErrorMessage(lastError, "Google Vision OCR failed."), 502);
}

function cleanAndNormalizeText(input: string): string {
  const withoutControlChars = input
    .replace(/\r\n/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ");

  const lines = withoutControlChars
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 0)
    .map((line) => normalizeSectionHeading(line));

  const dedupedLines = lines.filter((line, index) => {
    const previous = lines[index - 1];
    return line !== previous;
  });

  return dedupedLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function normalizeSectionHeading(line: string): string {
  const compact = line.replace(/[\s:_-]+$/g, "").trim();
  for (const section of SECTION_PATTERNS) {
    if (section.matchers.some((matcher) => matcher.test(compact))) {
      return section.canonical;
    }
  }

  return line;
}

async function parseWithGeminiFromText(text: string, deadline: number): Promise<GeminiStructuredResult> {
  const geminiApiKey = (process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? "").trim();
  if (!geminiApiKey) {
    return {
      error: "GEMINI_API_KEY is missing.",
    };
  }

  if (getRemainingMs(deadline) < MIN_STEP_TIMEOUT_MS) {
    return {
      error: "Not enough time left for Gemini structured parsing.",
    };
  }

  const configuredModel = (process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL).trim() || DEFAULT_GEMINI_MODEL;
  const configuredModelDeprecated = isDeprecatedGeminiModelName(configuredModel);

  const configuredApiVersion = (process.env.GEMINI_API_VERSION ?? "").trim();
  const baseApiVersionCandidates = uniqueStrings([
    configuredApiVersion,
    "v1",
    "v1beta",
  ]).filter((version) => version === "v1" || version === "v1beta");

  const modelCandidates = uniqueStrings([
    ...(configuredModelDeprecated ? [] : [configuredModel]),
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    DEFAULT_GEMINI_MODEL,
  ]);

  const prompt = `${GEMINI_PROMPT}\n\nResume text:\n${text.slice(0, 45_000)}`;
  const genAI = new GoogleGenerativeAI(geminiApiKey);

  const attemptErrors: string[] = [];

  for (const modelName of modelCandidates) {
    const apiVersionCandidates = isPreviewGeminiModel(modelName)
      ? uniqueStrings([configuredApiVersion, "v1beta"])
      : baseApiVersionCandidates;

    for (const apiVersion of apiVersionCandidates) {
      const model = genAI.getGenerativeModel(
        { model: modelName },
        {
          apiVersion,
        },
      );

      const generationConfigs = [
        {
          responseMimeType: "application/json",
          temperature: 0,
          maxOutputTokens: GEMINI_MAX_OUTPUT_TOKENS,
        },
      ];

      for (const generationConfig of generationConfigs) {
        try {
          const result = await withTimeout(
            model.generateContent({
              contents: [
                {
                  role: "user",
                  parts: [{ text: prompt }],
                },
              ],
              generationConfig,
            }),
            clampTimeoutToDeadline(
              GEMINI_TIMEOUT_MS,
              deadline,
              "Gemini structured extraction timed out.",
            ),
            "Gemini structured extraction timed out.",
          );

          const raw = typeof result.response?.text === "function" ? result.response.text() : "";
          const parsed = parseGeminiJson(raw);
          if (!parsed) {
            attemptErrors.push(`${modelName} (${apiVersion}) returned non-JSON output.`);
            continue;
          }

          const normalized = normalizeExtractedResume(parsed);
          if (hasMeaningfulExtraction(normalized)) {
            return {
              parsedResume: normalized,
            };
          }

          attemptErrors.push(`${modelName} (${apiVersion}) returned empty structured fields.`);
        } catch (error) {
          attemptErrors.push(`${modelName} (${apiVersion}): ${sanitizeErrorMessage(
            getErrorMessage(error, "Gemini structured extraction failed."),
          )}`);
        }
      }
    }
  }

  const nonDeprecatedErrors = attemptErrors.filter((entry) => !isDeprecatedModelError(entry));
  const nonCompatibilityErrors = nonDeprecatedErrors.filter(
    (entry) =>
      !isGenerationConfigCompatibilityError(entry) &&
      !isModelVersionCompatibilityError(entry),
  );
  const baseError =
    nonCompatibilityErrors[0] ??
    nonDeprecatedErrors[0] ??
    attemptErrors[0] ??
    "Gemini returned no structured data.";

  const prefixedError = configuredModelDeprecated
    ? `Configured GEMINI_MODEL '${configuredModel}' is deprecated. ${baseError}`
    : baseError;

  return {
    error: prefixedError,
  };
}

function normalizeExtractedResume(payload: unknown): ExtractedResume {
  const record = asRecord(payload);
  const personal = asRecord(record.personal ?? record.personalInfo);

  return {
    fullName: readTextFromRecords([record, personal], ["fullName", "name"]),
    email: readTextFromRecords([record, personal], ["email"]),
    phone: readTextFromRecords([record, personal], ["phone", "phoneNumber"]),
    photoUrl: normalizePhotoUrl(
      readTextFromRecords([record, personal], ["photoUrl", "profilePhotoUrl", "photo", "avatarUrl"]),
    ),
    summary: readTextFromRecords([record, personal], ["summary", "professionalSummary", "profile", "objective"]),
    skills: normalizeSkills(record.skills ?? personal.skills),
    education: normalizeRecordArray(record.education ?? personal.education),
    workExperience: normalizeRecordArray(
      record.workExperience ?? record.experience ?? personal.workExperience ?? personal.experience,
    ),
  };
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

        return normalizeSkills(record.items ?? record.skills ?? record.keywords);
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
    .filter((entry): entry is Record<string, unknown> => Object.keys(entry).length > 0);
}

function readTextFromRecords(records: Array<Record<string, unknown>>, keys: string[]) {
  for (const record of records) {
    for (const key of keys) {
      const value = asString(record[key]);
      if (value) {
        return value;
      }
    }
  }

  return "";
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

function parseGeminiJson(value: string): unknown | null {
  const cleaned = stripCodeFences(value);
  const candidates = [
    cleaned,
    extractJsonCandidate(cleaned, "{", "}"),
    extractJsonCandidate(cleaned, "[", "]"),
  ].filter(Boolean);

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

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function isDeprecatedGeminiModelName(modelName: string) {
  const normalized = modelName.trim().toLowerCase();
  return (
    normalized === "gemini-2.0-flash-lite" ||
    normalized === "models/gemini-2.0-flash-lite" ||
    normalized.includes("gemini-2.0-flash-lite") ||
    normalized === "gemini-1.5-flash-latest" ||
    normalized === "models/gemini-1.5-flash-latest" ||
    normalized.includes("gemini-1.5-flash-latest")
  );
}

function isDeprecatedModelError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("no longer available to new users") ||
    normalized.includes("model is no longer available") ||
    normalized.includes("gemini-2.0-flash-lite") ||
    normalized.includes("gemini-1.5-flash-latest") ||
    normalized.includes("not found for api version v1beta")
  );
}

function isGenerationConfigCompatibilityError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("responsemimetype") &&
    (normalized.includes("unknown name") || normalized.includes("generation_config"))
  );
}

function isPreviewGeminiModel(modelName: string) {
  const normalized = modelName.toLowerCase();
  return normalized.includes("preview") || normalized.includes("-latest");
}

function isModelVersionCompatibilityError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("not found for api version") ||
    normalized.includes("is not found for api version") ||
    (normalized.includes("api version") && normalized.includes("not supported for generatecontent"))
  );
}

function sanitizeErrorMessage(message: string) {
  return message.replace(/\s+/g, " ").trim().slice(0, 260);
}

function extractJsonCandidate(value: string, openChar: "{" | "[", closeChar: "}" | "]") {
  const start = value.indexOf(openChar);
  const end = value.lastIndexOf(closeChar);
  if (start < 0 || end <= start) {
    return "";
  }

  return value.slice(start, end + 1).trim();
}

function stripTrailingCommas(value: string) {
  return value.replace(/,\s*([}\]])/g, "$1");
}

function stripCodeFences(value: string) {
  return value
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

function safeJsonParse(value: string): unknown | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown) {
  if (typeof value === "string") {
    return value.replace(/\s+/g, " ").trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return "";
}

function readVisionText(payload: Record<string, unknown> | null): string {
  if (!payload || !Array.isArray(payload.responses) || payload.responses.length === 0) {
    return "";
  }

  const first = asRecord(payload.responses[0]);
  const fullText = asRecord(first.fullTextAnnotation).text;
  if (typeof fullText === "string" && fullText.trim()) {
    return fullText;
  }

  const textAnnotations = first.textAnnotations;
  if (Array.isArray(textAnnotations) && textAnnotations.length > 0) {
    const description = asRecord(textAnnotations[0]).description;
    if (typeof description === "string") {
      return description;
    }
  }

  const errorMessage = asRecord(first.error).message;
  if (typeof errorMessage === "string" && errorMessage.trim()) {
    throw new Error(errorMessage);
  }

  return "";
}

function buildPages(maxPages: number) {
  return Array.from({ length: Math.max(1, maxPages) }, (_, index) => index + 1);
}

function sanitizeFilename(name: string) {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120)
    .toLowerCase() || "resume.pdf";
}

function createUploadId() {
  if (typeof crypto?.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

async function readResponseBodyWithLimit(response: Response, maxBytes: number): Promise<Uint8Array> {
  if (!response.body) {
    const fallback = new Uint8Array(await response.arrayBuffer());
    if (fallback.byteLength > maxBytes) {
      throw new ResumePipelineError("Downloaded PDF exceeded size limit.", 400);
    }
    return fallback;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    if (!value) {
      continue;
    }

    total += value.byteLength;
    if (total > maxBytes) {
      throw new ResumePipelineError("Downloaded PDF exceeded size limit.", 400);
    }

    chunks.push(value);
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return merged;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeoutMs: number; timeoutMessage: string },
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort(options.timeoutMessage);
  }, options.timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new ResumePipelineError(options.timeoutMessage, 504);
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new ResumePipelineError(message, 504));
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

async function delay(ms: number) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getRemainingMs(deadline: number) {
  return deadline - Date.now();
}

function clampTimeoutToDeadline(preferredTimeoutMs: number, deadline: number, timeoutMessage: string) {
  const remainingMs = getRemainingMs(deadline);
  if (remainingMs <= MIN_STEP_TIMEOUT_MS) {
    throw new ResumePipelineError(timeoutMessage, 504);
  }

  return Math.max(MIN_STEP_TIMEOUT_MS, Math.min(preferredTimeoutMs, remainingMs));
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt((value ?? "").trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ResumePipelineError) {
    return error.message;
  }

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