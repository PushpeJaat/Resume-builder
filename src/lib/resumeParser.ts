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
  name?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  emailAddress?: unknown;
  phone?: unknown;
  phoneNumber?: unknown;
  mobile?: unknown;
  photoUrl?: unknown;
  avatarUrl?: unknown;
  image?: unknown;
  location?: unknown;
  city?: unknown;
  state?: unknown;
  country?: unknown;
  linkedin?: unknown;
  github?: unknown;
  portfolio?: unknown;
  website?: unknown;
  links?: unknown;
  socialLinks?: unknown;
  summary?: unknown;
  professionalSummary?: unknown;
  profile?: unknown;
  objective?: unknown;
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

type ParsedResumePayload = {
  personalInfo?: ParsedPersonalInfo;
  personal?: ParsedPersonalInfo;
  contact?: ParsedPersonalInfo;
  basics?: ParsedPersonalInfo;
  fullName?: unknown;
  name?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  emailAddress?: unknown;
  phone?: unknown;
  phoneNumber?: unknown;
  mobile?: unknown;
  photoUrl?: unknown;
  avatarUrl?: unknown;
  image?: unknown;
  location?: unknown;
  city?: unknown;
  state?: unknown;
  country?: unknown;
  summary?: unknown;
  professionalSummary?: unknown;
  profile?: unknown;
  objective?: unknown;
  experience?: ParsedExperience[];
  workExperience?: ParsedExperience[];
  employmentHistory?: ParsedExperience[];
  work_experience?: ParsedExperience[];
  education?: ParsedEducation[];
  educations?: ParsedEducation[];
  academicBackground?: ParsedEducation[];
  skills?: unknown;
  skillSet?: unknown;
  technicalSkills?: unknown;
  links?: unknown;
  socialLinks?: unknown;
  linkedin?: unknown;
  github?: unknown;
  portfolio?: unknown;
  website?: unknown;
};

type ParseResumeApiPayload = {
  raw_text?: unknown;
  meta?: unknown;
  parsed_resume?: unknown;
  parsedResume?: unknown;
  data?: unknown;
  result?: unknown;
  resume?: unknown;
  payload?: unknown;
  output?: unknown;
  response?: unknown;
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
  const endpoints = isLikelyPdf(file) ? ["/api/extract-resume"] : ["/api/parse-resume"];

  let lastError = "";

  for (const endpoint of endpoints) {
    const formData = new FormData();
    formData.set("resume", file);

    const response = await fetch(endpoint, {
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

      lastError =
        endpoint === "/api/extract-resume"
          ? `AI structured parsing failed: ${message}`
          : message;
      continue;
    }

    if (!isRecord(parsed)) {
      lastError = "Resume parser returned an invalid response.";
      continue;
    }

    const structured = extractStructuredPayload(parsed as ParseResumeApiPayload);
    if (structured && hasMeaningfulStructuredData(structured)) {
      return structured;
    }

    if (typeof parsed.raw_text === "string" && parsed.raw_text.trim()) {
      return buildPayloadFromRawText(parsed.raw_text);
    }

    lastError = "Resume parser returned an invalid response payload.";
  }

  throw new Error(lastError || "Could not parse that file right now.");
}

function isLikelyPdf(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mime = (file.type || "").toLowerCase();
  return extension === "pdf" || mime.includes("pdf");
}

function extractStructuredPayload(payload: ParseResumeApiPayload): ParsedResumePayload | null {
  const directParsed = parseStructuredCandidate(payload.parsed_resume ?? payload.parsedResume);
  if (directParsed) {
    return directParsed;
  }

  const wrappers = [
    payload.data,
    payload.result,
    payload.resume,
    payload.payload,
    payload.output,
    payload.response,
  ];
  for (const wrapper of wrappers) {
    const wrapperRecord = isRecord(wrapper) ? (wrapper as ParseResumeApiPayload) : null;
    if (!wrapperRecord) {
      continue;
    }

    const nestedParsed = parseStructuredCandidate(wrapperRecord.parsed_resume ?? wrapperRecord.parsedResume);
    if (nestedParsed) {
      return nestedParsed;
    }

    if (hasStructuredKeys(wrapperRecord)) {
      return wrapperRecord as ParsedResumePayload;
    }
  }

  if (hasStructuredKeys(payload)) {
    return payload as ParsedResumePayload;
  }

  return null;
}

function parseStructuredCandidate(value: unknown): ParsedResumePayload | null {
  if (isRecord(value)) {
    return value as ParsedResumePayload;
  }

  if (typeof value === "string") {
    const parsed = safeJsonParse(value);
    if (isRecord(parsed)) {
      return parsed as ParsedResumePayload;
    }
  }

  return null;
}

function hasStructuredKeys(payload: Record<string, unknown>) {
  const structuredKeys = [
    "personalInfo",
    "personal_info",
    "personal",
    "contact",
    "basics",
    "fullName",
    "full_name",
    "name",
    "firstName",
    "first_name",
    "lastName",
    "last_name",
    "email",
    "emailAddress",
    "email_address",
    "phone",
    "phoneNumber",
    "phone_number",
    "mobile",
    "summary",
    "professionalSummary",
    "professional_summary",
    "profile",
    "objective",
    "experience",
    "workExperience",
    "employmentHistory",
    "employment_history",
    "work_experience",
    "education",
    "educations",
    "academicBackground",
    "academic_background",
    "skills",
    "skillSet",
    "skill_set",
    "technicalSkills",
    "technical_skills",
  ];

  if (structuredKeys.some((key) => key in payload)) {
    return true;
  }

  return false;
}

function hasMeaningfulStructuredData(payload: ParsedResumePayload) {
  const record = payload as unknown as Record<string, unknown>;

  const rootSignals = [
    payload.fullName,
    payload.name,
    payload.email,
    payload.emailAddress,
    payload.phone,
    payload.phoneNumber,
    payload.summary,
    payload.professionalSummary,
    payload.profile,
    payload.objective,
    payload.experience,
    payload.workExperience,
    payload.employmentHistory,
    payload.work_experience,
    payload.education,
    payload.educations,
    payload.academicBackground,
    payload.skills,
    payload.skillSet,
    payload.technicalSkills,
    record.personal_info,
    record.work_experience,
    record.technical_skills,
  ];

  return rootSignals.some((value) => {
    if (typeof value === "string") {
      return value.trim().length > 0;
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (isRecord(value)) {
      return Object.keys(value).length > 0;
    }

    return false;
  });
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

  const root = parsed as unknown as Record<string, unknown>;
  const personal =
    (isRecord(parsed.personalInfo) ? parsed.personalInfo : null) ??
    (isRecord((parsed as Record<string, unknown>).personal_info)
      ? ((parsed as Record<string, unknown>).personal_info as ParsedPersonalInfo)
      : null) ??
    (isRecord(parsed.personal) ? parsed.personal : null) ??
    (isRecord(parsed.contact) ? parsed.contact : null) ??
    (isRecord(parsed.basics) ? parsed.basics : null) ??
    {};

  const fullName = readTextFromRecords([personal, root], ["fullName", "full_name", "name", "candidate_name"]);
  const firstName = readTextFromRecords([personal, root], ["firstName", "first_name", "givenName", "given_name"]);
  const lastName = readTextFromRecords([personal, root], ["lastName", "last_name", "familyName", "family_name", "surname"]);

  const email = readTextFromRecords([personal, root], ["email", "emailAddress", "email_address", "mail"]);
  const phone = readTextFromRecords([personal, root], ["phone", "phoneNumber", "phone_number", "mobile", "contactNumber", "contact_number"]);
  const photoUrl = normalizePhotoUrl(
    readTextFromRecords([personal, root], [
      "photoUrl",
      "photo_url",
      "profilePhotoUrl",
      "profile_photo_url",
      "photo",
      "avatarUrl",
      "avatar_url",
      "image",
      "picture",
    ]),
  );

  const summary = readTextFromRecords([root, personal], [
    "summary",
    "professionalSummary",
    "professional_summary",
    "profile",
    "objective",
    "about",
  ]);

  const location = buildLocationFromRecords([personal, root]);
  const linksSource =
    personal.links ??
    personal.socialLinks ??
    (personal as Record<string, unknown>).social_links ??
    root.links ??
    root.socialLinks ??
    root.social_links ??
    buildSocialLinkCandidates([personal, root]);

  const experienceSource =
    parsed.experience ??
    parsed.workExperience ??
    (parsed as Record<string, unknown>).work_experience ??
    parsed.employmentHistory ??
    (parsed as Record<string, unknown>).employment_history ??
    parsed.work_experience ??
    root.experience ??
    root.workExperience ??
    root.work_experience ??
    root.employmentHistory ??
    root.employment_history ??
    root.work_experience;

  const educationSource =
    parsed.education ??
    parsed.educations ??
    parsed.academicBackground ??
    (parsed as Record<string, unknown>).academic_background ??
    root.education ??
    root.educations ??
    root.academicBackground ??
    root.academic_background;

  const skillsSource =
    parsed.skills ??
    parsed.skillSet ??
    (parsed as Record<string, unknown>).skill_set ??
    parsed.technicalSkills ??
    (parsed as Record<string, unknown>).technical_skills ??
    root.skills ??
    root.skillSet ??
    root.skill_set ??
    root.technicalSkills ??
    root.technical_skills;

  const normalized: ResumeData = {
    personal: {
      ...base.personal,
      fullName: fullName || [firstName, lastName].filter(Boolean).join(" ").trim(),
      email,
      phone,
      photoUrl,
      location,
      links: normalizeLinks(linksSource),
    },
    summary,
    experience: normalizeExperience(experienceSource),
    education: normalizeEducation(educationSource),
    skills: normalizeSkills(skillsSource),
  };

  return ensureResumeIds(normalized);
}

function buildLocationFromRecords(records: Array<Record<string, unknown>>) {
  const direct = readTextFromRecords(records, ["location", "address", "cityState", "city_state"]);
  if (direct) {
    return direct;
  }

  const city = readTextFromRecords(records, ["city", "town", "city_name"]);
  const state = readTextFromRecords(records, ["state", "region", "province", "state_name"]);
  const country = readTextFromRecords(records, ["country"]);

  const parts = [city, state, country].filter(Boolean);
  return parts.join(", ").trim();
}

function buildSocialLinkCandidates(records: Array<Record<string, unknown>>) {
  const pairs = [
    {
      label: "LinkedIn",
      keys: ["linkedin", "linkedIn", "linkedinUrl", "linkedin_url", "linkedinProfile", "linkedin_profile"],
    },
    {
      label: "GitHub",
      keys: ["github", "githubUrl", "github_url", "githubProfile", "github_profile"],
    },
    {
      label: "Portfolio",
      keys: ["portfolio", "portfolioUrl", "portfolio_url", "website", "site", "url"],
    },
  ];

  const links: Array<{ label: string; url: string }> = [];

  for (const pair of pairs) {
    const url = readTextFromRecords(records, pair.keys);
    if (!url) {
      continue;
    }

    links.push({
      label: pair.label,
      url,
    });
  }

  return links;
}

function readTextFromRecords(records: Array<Record<string, unknown>>, keys: string[]) {
  for (const record of records) {
    for (const key of keys) {
      const value = toText(record[key]);
      if (value) {
        return value;
      }
    }
  }

  return "";
}

function normalizeExperience(value: unknown): ResumeData["experience"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const row = isRecord(item) ? (item as Record<string, unknown>) : {};
      const bullets = toStringArray(
        row.bullets ??
          row.highlights ??
          row.responsibilities ??
          row.achievements ??
          row.description ??
          row.bullet_points,
      );

      const end = toText(row.end ?? row.endDate ?? row.end_date ?? row.to ?? row.dateTo ?? row.date_to);
      const isCurrent = row.current === true || toText(row.current).toLowerCase() === "true";

      return {
        company: toText(
          row.company ?? row.companyName ?? row.company_name ?? row.employer ?? row.organization,
        ),
        role: toText(row.role ?? row.title ?? row.position ?? row.jobTitle ?? row.job_title),
        start: toText(row.start ?? row.startDate ?? row.start_date ?? row.from ?? row.dateFrom ?? row.date_from),
        end: end || (isCurrent ? "Present" : ""),
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
      const row = isRecord(item) ? (item as Record<string, unknown>) : {};

      const degree = toText(
        row.degree ??
          row.degreeName ??
          row.degree_name ??
          row.qualification ??
          row.program ??
          row.course ??
          row.fieldOfStudy ??
          row.field_of_study ??
          row.specialization,
      );

      const end = toText(
        row.end ?? row.endDate ?? row.end_date ?? row.to ?? row.year ?? row.graduationYear ?? row.graduation_year,
      );

      return {
        school: toText(
          row.school ??
            row.schoolName ??
            row.school_name ??
            row.institution ??
            row.institutionName ??
            row.institution_name ??
            row.college ??
            row.university,
        ),
        degree,
        start: toText(row.start ?? row.startDate ?? row.start_date ?? row.from),
        end,
      };
    })
    .filter((row) => row.school || row.degree);
}

function normalizeSkills(value: unknown): ResumeData["skills"] {
  const grouped: ResumeData["skills"] = [];
  const coreSkills = new Set<string>();

  const pushGroup = (categoryValue: unknown, itemsValue: unknown) => {
    const category = toText(categoryValue) || "Core skills";
    const items = Array.from(new Set(toStringArray(itemsValue)));

    if (items.length === 0) {
      return;
    }

    const existing = grouped.find((group) => group.category.toLowerCase() === category.toLowerCase());
    if (existing) {
      existing.items = Array.from(new Set([...existing.items, ...items]));
      return;
    }

    grouped.push({
      category,
      items,
    });
  };

  const absorbRecord = (record: Record<string, unknown>) => {
    const explicitItems =
      record.items ??
      record.skills ??
      record.skill_items ??
      record.keywords ??
      record.values ??
      record.technologies ??
      record.tools;

    if (explicitItems !== undefined) {
      pushGroup(
        record.category ?? record.skill_category ?? record.group ?? record.title ?? record.name,
        explicitItems,
      );
      return;
    }

    const singleSkill = toText(record.skill ?? record.value ?? record.label ?? record.name);
    if (singleSkill) {
      coreSkills.add(singleSkill);
      return;
    }

    // Some Gemini payloads send category-keyed objects, for example: { technical: ["React", "Node"] }.
    for (const [key, candidate] of Object.entries(record)) {
      if (["category", "group", "title", "name"].includes(key)) {
        continue;
      }

      if (Array.isArray(candidate) || typeof candidate === "string") {
        pushGroup(key, candidate);
      }
    }
  };

  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === "string" || typeof item === "number") {
        const token = toText(item);
        if (token) {
          coreSkills.add(token);
        }
        continue;
      }

      if (isRecord(item)) {
        absorbRecord(item as Record<string, unknown>);
      }
    }
  } else if (isRecord(value)) {
    absorbRecord(value as Record<string, unknown>);
  } else if (typeof value === "string") {
    for (const item of toStringArray(value)) {
      coreSkills.add(item);
    }
  }

  if (coreSkills.size > 0) {
    pushGroup("Core skills", Array.from(coreSkills));
  }

  return grouped.filter((item) => item.category || item.items.length > 0);
}

function normalizeLinks(value: unknown): ResumeData["personal"]["links"] {
  const normalized: ResumeData["personal"]["links"] = [];

  const pushLink = (labelValue: unknown, urlValue: unknown) => {
    const label = toText(labelValue);
    const url = toText(urlValue);

    if (!label && !url) {
      return;
    }

    normalized.push({
      label: label || deriveLinkLabel(url),
      url,
    });
  };

  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === "string") {
        pushLink("", item);
        continue;
      }

      if (!isRecord(item)) {
        continue;
      }

      const record = item as Record<string, unknown>;
      pushLink(
        record.label ?? record.name ?? record.platform ?? record.type,
        record.url ?? record.link ?? record.value ?? record.href,
      );
    }
  } else if (isRecord(value)) {
    const record = value as Record<string, unknown>;
    for (const [label, url] of Object.entries(record)) {
      pushLink(label, url);
    }
  }

  return normalized.filter((link) => link.label || link.url);
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
    return value
      .flatMap((item) => {
        const text = toText(item);
        if (text) {
          return [text];
        }

        if (!isRecord(item)) {
          return [];
        }

        const record = item as Record<string, unknown>;
        const nestedText =
          toText(record.text) ||
          toText(record.value) ||
          toText(record.description) ||
          toText(record.content) ||
          toText(record.bullet);

        return nestedText ? [nestedText] : [];
      })
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[\n,;|•]/)
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
  if (typeof value === "string") {
    return value.replace(/\s+/g, " ").trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return "";
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
