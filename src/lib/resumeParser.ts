import { ensureResumeIds } from "@/lib/normalize-resume";
import { emptyResumeData, type ResumeData } from "@/types/resume";

const MAX_RESUME_UPLOAD_BYTES = 6 * 1024 * 1024;
const STORAGE_KEY = "resumeBuilder:parsedResume";

export type ResumeParseResult = {
  data: ResumeData;
  titleSuggestion: string;
  mode: "ai";
};

type ParsedPersonalInfo = {
  fullName?: unknown;
  email?: unknown;
  phone?: unknown;
  photoUrl?: unknown;
  location?: unknown;
  links?: unknown;
};

type ParsedExperience = {
  company?: unknown;
  role?: unknown;
  start?: unknown;
  end?: unknown;
  bullets?: unknown;
};

type ParsedEducation = {
  school?: unknown;
  degree?: unknown;
  start?: unknown;
  end?: unknown;
};

type ParsedSkillGroup = {
  category?: unknown;
  items?: unknown;
};

type ParsedResumePayload = {
  personalInfo?: ParsedPersonalInfo;
  personal?: ParsedPersonalInfo;
  fullName?: unknown;
  email?: unknown;
  phone?: unknown;
  photoUrl?: unknown;
  summary?: unknown;
  experience?: ParsedExperience[];
  workExperience?: ParsedExperience[];
  education?: ParsedEducation[];
  skills?: Array<ParsedSkillGroup | string>;
};

type ParseResumeApiPayload = {
  raw_text?: unknown;
  meta?: unknown;
  parsed_resume?: unknown;
  [key: string]: unknown;
};

export async function parseResumePdf(file: File): Promise<ResumeParseResult> {
  validateResumeUpload(file);

  const payload = await requestParseResume(file);
  const data = normalizeParsedResume(payload);
  const titleSuggestion = buildTitleSuggestion(data.personal.fullName);

  persistParsedResumeDraft({
    data,
    titleSuggestion,
    sourceFileName: file.name,
    parsedAt: new Date().toISOString(),
  });

  return {
    data,
    titleSuggestion,
    mode: "ai",
  };
}

export function readParsedResumeDraft() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  const parsed = safeJsonParse(raw);
  if (!isRecord(parsed) || !isRecord(parsed.data)) {
    return null;
  }

  return {
    data: normalizeParsedResume(parsed.data as ParsedResumePayload),
    titleSuggestion: toText(parsed.titleSuggestion),
    sourceFileName: toText(parsed.sourceFileName),
    parsedAt: toText(parsed.parsedAt),
  };
}

function validateResumeUpload(file: File) {
  if (!file || file.size === 0) {
    throw new Error("Please choose a PDF, DOCX, or JPG/JPEG resume to import.");
  }

  if (file.size > MAX_RESUME_UPLOAD_BYTES) {
    throw new Error("Resume upload must be 6 MB or smaller for fast extraction.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mime = (file.type || "").toLowerCase();
  const isPdfMime = mime.includes("pdf");
  const isDocxMime = mime.includes("officedocument.wordprocessingml.document");
  const isJpegMime = mime.includes("image/jpeg") || mime.includes("image/jpg");
  const isPdfExtension = extension === "pdf";
  const isDocxExtension = extension === "docx";
  const isJpegExtension = extension === "jpg" || extension === "jpeg";

  if (!isPdfMime && !isDocxMime && !isJpegMime && !isPdfExtension && !isDocxExtension && !isJpegExtension) {
    throw new Error("Only PDF, DOCX, or JPG/JPEG files are supported for AI resume import.");
  }
}

async function requestParseResume(file: File): Promise<ParsedResumePayload> {
  const formData = new FormData();
  formData.set("resume", file);

  const response = await fetch("/api/parse-resume", {
    method: "POST",
    body: formData,
  });

  const responseText = await response.text();
  const parsed = safeJsonParse(responseText);

  if (!response.ok) {
    const message =
      isRecord(parsed) && typeof parsed.error === "string"
        ? parsed.error
        : `Could not parse that file. Server returned ${response.status}.`;
    throw new Error(message);
  }

  if (!isRecord(parsed)) {
    throw new Error("Resume parser returned an invalid response.");
  }

  const structured = extractStructuredPayload(parsed as ParseResumeApiPayload);
  if (structured) {
    return structured;
  }

  if (typeof parsed.raw_text === "string" && parsed.raw_text.trim()) {
    return buildPayloadFromRawText(parsed.raw_text);
  }

  throw new Error("Resume parser returned an invalid response payload.");
}

function extractStructuredPayload(payload: ParseResumeApiPayload): ParsedResumePayload | null {
  if (isRecord(payload.parsed_resume)) {
    return payload.parsed_resume as ParsedResumePayload;
  }

  const structuredKeys = [
    "personalInfo",
    "personal",
    "fullName",
    "email",
    "phone",
    "summary",
    "experience",
    "workExperience",
    "education",
    "skills",
  ];

  if (structuredKeys.some((key) => key in payload)) {
    return payload as ParsedResumePayload;
  }

  return null;
}

function buildPayloadFromRawText(rawText: string): ParsedResumePayload {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const email = rawText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
  const phone = rawText.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0] ?? "";
  const skills = extractSkillsFromRawText(rawText);

  return {
    fullName: detectNameFromLines(lines),
    email,
    phone,
    summary: lines.slice(0, 12).join(" ").slice(0, 900),
    skills,
  };
}

function extractSkillsFromRawText(rawText: string): string[] {
  const section = extractSection(rawText, ["skills", "technical skills", "core skills"], [
    "experience",
    "education",
    "projects",
  ]);

  if (!section) {
    return [];
  }

  return toStringArray(section).slice(0, 40);
}

function extractSection(rawText: string, starts: string[], stops: string[]): string {
  const lines = rawText.split(/\r?\n/);
  let collecting = false;
  const out: string[] = [];

  for (const line of lines) {
    const normalized = line.trim().toLowerCase().replace(/[\s:_-]+$/g, "");

    if (!collecting && starts.some((start) => normalized === start)) {
      collecting = true;
      continue;
    }

    if (collecting && stops.some((stop) => normalized === stop)) {
      break;
    }

    if (collecting) {
      out.push(line.trim());
    }
  }

  return out.join("\n").trim();
}

function detectNameFromLines(lines: string[]): string {
  for (const line of lines.slice(0, 8)) {
    const clean = line.replace(/\s+/g, " ").trim();
    if (!clean) {
      continue;
    }

    if (clean.length > 60) {
      continue;
    }

    if (/@/.test(clean) || /\d{3,}/.test(clean)) {
      continue;
    }

    const words = clean.split(" ").filter(Boolean);
    if (words.length >= 2 && words.length <= 5) {
      return clean;
    }
  }

  return "";
}

function normalizeParsedResume(parsed: ParsedResumePayload): ResumeData {
  const base = emptyResumeData();
  const personal =
    (isRecord(parsed.personalInfo) ? parsed.personalInfo : null) ??
    (isRecord(parsed.personal) ? parsed.personal : null) ??
    {
      fullName: parsed.fullName,
      email: parsed.email,
      phone: parsed.phone,
      photoUrl: parsed.photoUrl,
    };

  const experienceSource = parsed.experience ?? parsed.workExperience;

  const normalized: ResumeData = {
    personal: {
      ...base.personal,
      fullName: toText(personal.fullName),
      email: toText(personal.email),
      phone: toText(personal.phone),
      photoUrl: normalizePhotoUrl(toText(personal.photoUrl)),
      location: toText(personal.location),
      links: normalizeLinks(personal.links),
    },
    summary: toText(parsed.summary),
    experience: normalizeExperience(experienceSource),
    education: normalizeEducation(parsed.education),
    skills: normalizeSkills(parsed.skills),
  };

  return ensureResumeIds(normalized);
}

function normalizeExperience(value: unknown): ResumeData["experience"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const row = isRecord(item) ? (item as ParsedExperience) : {};
      const bullets = toStringArray((row as Record<string, unknown>).bullets ?? (row as Record<string, unknown>).highlights);
      return {
        company: toText((row as Record<string, unknown>).company ?? (row as Record<string, unknown>).employer ?? (row as Record<string, unknown>).organization),
        role: toText((row as Record<string, unknown>).role ?? (row as Record<string, unknown>).title ?? (row as Record<string, unknown>).position),
        start: toText((row as Record<string, unknown>).start ?? (row as Record<string, unknown>).startDate ?? (row as Record<string, unknown>).from),
        end: toText((row as Record<string, unknown>).end ?? (row as Record<string, unknown>).endDate ?? (row as Record<string, unknown>).to),
        bullets,
      };
    })
    .filter((row) => row.company || row.role || row.bullets.length > 0);
}

function normalizeEducation(value: unknown): ResumeData["education"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const row = isRecord(item) ? (item as ParsedEducation) : {};
      return {
        school: toText((row as Record<string, unknown>).school ?? (row as Record<string, unknown>).institution ?? (row as Record<string, unknown>).college ?? (row as Record<string, unknown>).university),
        degree: toText((row as Record<string, unknown>).degree ?? (row as Record<string, unknown>).qualification ?? (row as Record<string, unknown>).program),
        start: toText((row as Record<string, unknown>).start ?? (row as Record<string, unknown>).startDate ?? (row as Record<string, unknown>).from),
        end: toText((row as Record<string, unknown>).end ?? (row as Record<string, unknown>).endDate ?? (row as Record<string, unknown>).to),
      };
    })
    .filter((row) => row.school || row.degree);
}

function normalizeSkills(value: unknown): ResumeData["skills"] {
  if (!Array.isArray(value)) {
    return [];
  }

  const textSkills = value.filter((item) => typeof item === "string").map((item) => toText(item));

  const grouped = value
    .filter((item) => isRecord(item))
    .map((item) => item as ParsedSkillGroup)
    .map((item) => ({
      category: toText(item.category) || "Core skills",
      items: toStringArray(item.items),
    }))
    .filter((item) => item.items.length > 0 || item.category.length > 0);

  if (textSkills.length > 0) {
    grouped.unshift({
      category: "Core skills",
      items: textSkills,
    });
  }

  return grouped.filter((item) => item.category || item.items.length > 0);
}

function normalizeLinks(value: unknown): ResumeData["personal"]["links"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        const url = toText(item);
        return {
          label: deriveLinkLabel(url),
          url,
        };
      }

      if (!isRecord(item)) {
        return { label: "", url: "" };
      }

      const label = toText(item.label);
      const url = toText(item.url);
      return {
        label: label || deriveLinkLabel(url),
        url,
      };
    })
    .filter((link) => link.label || link.url);
}

function deriveLinkLabel(url: string) {
  if (!url) {
    return "";
  }

  return url
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .split("/")[0]
    .trim();
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => toText(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[\n,|•]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizePhotoUrl(value: string) {
  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value) || /^data:image\//i.test(value)) {
    return value;
  }

  return "";
}

function persistParsedResumeDraft(value: {
  data: ResumeData;
  titleSuggestion: string;
  sourceFileName: string;
  parsedAt: string;
}) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Ignore localStorage write failures in private or locked-down contexts.
  }
}

function buildTitleSuggestion(fullName: string) {
  const trimmed = toText(fullName);
  return trimmed ? `${trimmed} Resume` : "Imported resume";
}

function toText(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
