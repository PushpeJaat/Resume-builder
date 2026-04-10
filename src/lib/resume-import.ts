import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { z } from "zod";
import { ensureResumeIds } from "@/lib/normalize-resume";
import { emptyResumeData, type ResumeData } from "@/types/resume";

const MAX_IMPORT_FILE_BYTES = 5 * 1024 * 1024;

const aiImportSchema = z.object({
  title: z.string().optional(),
  personal: z
    .object({
      fullName: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      location: z.string().optional(),
      links: z
        .array(
          z.object({
            label: z.string().optional(),
            url: z.string().optional(),
          }),
        )
        .optional(),
    })
    .optional(),
  summary: z.string().optional(),
  experience: z
    .array(
      z.object({
        company: z.string().optional(),
        role: z.string().optional(),
        start: z.string().optional(),
        end: z.string().optional(),
        bullets: z.array(z.string()).optional(),
      }),
    )
    .optional(),
  education: z
    .array(
      z.object({
        school: z.string().optional(),
        degree: z.string().optional(),
        start: z.string().optional(),
        end: z.string().optional(),
      }),
    )
    .optional(),
  skills: z
    .array(
      z.object({
        category: z.string().optional(),
        items: z.array(z.string()).optional(),
      }),
    )
    .optional(),
});

type ImportMode = "ai" | "heuristic";

export type ResumeImportResult = {
  data: ResumeData;
  titleSuggestion: string;
  mode: ImportMode;
  warning?: string;
};

export function validateResumeImportFile(file: File) {
  if (!file || file.size === 0) {
    throw new Error("Please choose a resume file to import.");
  }

  if (file.size > MAX_IMPORT_FILE_BYTES) {
    throw new Error("Resume upload must be 5 MB or smaller.");
  }

  const extension = getFileExtension(file.name);
  if (!["pdf", "docx", "txt", "md"].includes(extension)) {
    throw new Error("Supported files: PDF, DOCX, TXT, and MD.");
  }
}

export async function importResumeFromFile(file: File): Promise<ResumeImportResult> {
  validateResumeImportFile(file);
  const extractedText = await extractResumeText(file);

  if (!extractedText.trim()) {
    throw new Error("No readable text was found in that file.");
  }

  const aiParsed = await extractStructuredResumeWithAi(extractedText);
  if (aiParsed) {
    return {
      data: coerceResumeData(aiParsed),
      titleSuggestion: buildTitleSuggestion(aiParsed.title, aiParsed.personal?.fullName),
      mode: "ai",
    };
  }

  const heuristic = extractStructuredResumeHeuristically(extractedText);
  return {
    data: heuristic.data,
    titleSuggestion: heuristic.titleSuggestion,
    mode: "heuristic",
    warning: "AI import is not configured, so a best-effort parser was used.",
  };
}

async function extractResumeText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = getFileExtension(file.name);

  if (extension === "pdf") {
    let parser: PDFParse | null = null;
    try {
      parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      return result.text ?? "";
    } catch {
      throw new Error("Could not read text from that PDF. Try a text-based PDF, DOCX, TXT, or MD file.");
    } finally {
      if (parser) {
        await parser.destroy().catch(() => undefined);
      }
    }
  }

  if (extension === "docx") {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value ?? "";
    } catch {
      throw new Error("Could not read text from that DOCX file. Try saving it again as DOCX or upload TXT/MD instead.");
    }
  }

  return buffer.toString("utf8");
}

async function extractStructuredResumeWithAi(rawText: string): Promise<z.infer<typeof aiImportSchema> | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
  const baseUrl = (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Convert resume text into structured JSON for a resume editor. Return only valid JSON. Preserve exact facts. Do not invent values. Keep bullets concise. Use empty strings or empty arrays when data is missing.",
        },
        {
          role: "user",
          content: JSON.stringify({
            schema: {
              title: "optional title suggestion",
              personal: {
                fullName: "",
                email: "",
                phone: "",
                location: "",
                links: [{ label: "", url: "" }],
              },
              summary: "",
              experience: [{ company: "", role: "", start: "", end: "", bullets: [""] }],
              education: [{ school: "", degree: "", start: "", end: "" }],
              skills: [{ category: "", items: [""] }],
            },
            resumeText: rawText.slice(0, 22000),
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    return null;
  }

  const json = (await response.json().catch(() => null)) as
    | { choices?: Array<{ message?: { content?: string | null } }> }
    | null;
  const content = json?.choices?.[0]?.message?.content;
  if (!content) {
    return null;
  }

  const parsedJson = safeJsonParse(stripCodeFences(content));
  const parsed = aiImportSchema.safeParse(parsedJson);
  return parsed.success ? parsed.data : null;
}

function extractStructuredResumeHeuristically(rawText: string): { data: ResumeData; titleSuggestion: string } {
  const normalized = normalizeText(rawText);
  const sections = splitSections(normalized);
  const lines = normalized.split("\n").map((line) => line.trim()).filter(Boolean);
  const data = emptyResumeData();

  data.personal.fullName = guessFullName(lines);
  data.personal.email = normalized.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
  data.personal.phone = guessPhone(normalized);
  data.personal.location = guessLocation(lines);
  data.personal.links = dedupeLinks(extractLinks(normalized));
  data.summary = guessSummary(sections.summary, sections.profile, sections.header);
  data.experience = parseExperienceBlocks(sections.experience || sections.work || sections.employment || "");
  data.education = parseEducationBlocks(sections.education || "");
  data.skills = parseSkillGroups(sections.skills || sections.technologies || "");

  return {
    data: ensureResumeIds(data),
    titleSuggestion: buildTitleSuggestion(undefined, data.personal.fullName),
  };
}

function coerceResumeData(value: z.infer<typeof aiImportSchema>): ResumeData {
  const base = emptyResumeData();
  const merged: ResumeData = {
    personal: {
      ...base.personal,
      fullName: cleanText(value.personal?.fullName),
      email: cleanText(value.personal?.email),
      phone: cleanText(value.personal?.phone),
      location: cleanText(value.personal?.location),
      links: (value.personal?.links ?? [])
        .map((link) => ({
          label: cleanText(link.label),
          url: cleanText(link.url),
        }))
        .filter((link) => link.label || link.url),
    },
    summary: cleanText(value.summary),
    experience: (value.experience ?? [])
      .map((job) => ({
        company: cleanText(job.company),
        role: cleanText(job.role),
        start: cleanText(job.start),
        end: cleanText(job.end),
        bullets: (job.bullets ?? []).map(cleanText).filter(Boolean),
      }))
      .filter((job) => job.company || job.role || job.bullets.length > 0),
    education: (value.education ?? [])
      .map((item) => ({
        school: cleanText(item.school),
        degree: cleanText(item.degree),
        start: cleanText(item.start),
        end: cleanText(item.end),
      }))
      .filter((item) => item.school || item.degree),
    skills: (value.skills ?? [])
      .map((group) => ({
        category: cleanText(group.category),
        items: (group.items ?? []).map(cleanText).filter(Boolean),
      }))
      .filter((group) => group.category || group.items.length > 0),
  };

  return ensureResumeIds(merged);
}

function splitSections(text: string): Record<string, string> {
  const lines = text.split("\n");
  const sections: Record<string, string[]> = { header: [] };
  let current = "header";

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const heading = mapHeading(line);
    if (heading) {
      current = heading;
      sections[current] ??= [];
      continue;
    }
    sections[current] ??= [];
    sections[current].push(rawLine);
  }

  return Object.fromEntries(Object.entries(sections).map(([key, value]) => [key, value.join("\n").trim()]));
}

function mapHeading(line: string): string | null {
  const normalized = line.toLowerCase().replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
  const lookup: Record<string, string> = {
    summary: "summary",
    profile: "profile",
    objective: "summary",
    about: "profile",
    experience: "experience",
    "work experience": "experience",
    "professional experience": "experience",
    employment: "employment",
    "work history": "work",
    education: "education",
    skills: "skills",
    "technical skills": "skills",
    technologies: "technologies",
  };

  return lookup[normalized] ?? null;
}

function parseExperienceBlocks(sectionText: string) {
  return parseBlocks(sectionText).map((block) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const bullets = lines.filter((line) => /^[\-•*]/.test(line)).map((line) => line.replace(/^[\-•*]\s*/, ""));
    const dateLine = lines.find((line) => /(?:19|20)\d{2}|present|current/i.test(line)) ?? "";
    const roleCompanyLine = lines.find((line) => line !== dateLine && !/^[\-•*]/.test(line)) ?? "";
    const roleCompany = splitRoleCompany(roleCompanyLine, lines[1] ?? "");
    const narrative = lines
      .filter((line) => line !== dateLine && line !== roleCompanyLine && !/^[\-•*]/.test(line))
      .filter(Boolean);

    return {
      company: roleCompany.company,
      role: roleCompany.role,
      start: extractDateRange(dateLine).start,
      end: extractDateRange(dateLine).end,
      bullets: [...bullets, ...narrative].filter(Boolean),
    };
  }).filter((item) => item.company || item.role || item.bullets.length > 0);
}

function parseEducationBlocks(sectionText: string) {
  return parseBlocks(sectionText).map((block) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const dateLine = lines.find((line) => /(?:19|20)\d{2}|present|current/i.test(line)) ?? "";
    const [school = "", degree = ""] = lines.filter((line) => line !== dateLine);
    const dates = extractDateRange(dateLine);
    return {
      school,
      degree,
      start: dates.start,
      end: dates.end,
    };
  }).filter((item) => item.school || item.degree);
}

function parseSkillGroups(sectionText: string) {
  const blocks = parseBlocks(sectionText);
  if (blocks.length === 0 && sectionText.trim()) {
    return [{ category: "Core skills", items: splitSkillItems(sectionText) }].filter((group) => group.items.length > 0);
  }

  return blocks
    .map((block) => {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      const colonLine = lines.find((line) => line.includes(":"));
      if (colonLine) {
        const [category, rawItems] = colonLine.split(/:(.+)/).map((part) => part?.trim() ?? "");
        return {
          category: category || "Core skills",
          items: splitSkillItems(rawItems || lines.slice(1).join(", ")),
        };
      }

      return {
        category: "Core skills",
        items: splitSkillItems(lines.join(", ")),
      };
    })
    .filter((group) => group.category || group.items.length > 0);
}

function parseBlocks(sectionText: string): string[] {
  return normalizeText(sectionText)
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}

function splitSkillItems(value: string): string[] {
  return value
    .split(/[•,|]/)
    .map((item) => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
}

function splitRoleCompany(primaryLine: string, secondaryLine: string) {
  const separators = [/\s+at\s+/i, /\s+\|\s+/, /\s+-\s+/, /,\s+/];
  for (const separator of separators) {
    const parts = primaryLine.split(separator).map((part) => part.trim()).filter(Boolean);
    if (parts.length >= 2) {
      return { role: parts[0], company: parts.slice(1).join(" ") };
    }
  }

  if (secondaryLine && !/(?:19|20)\d{2}|present|current/i.test(secondaryLine)) {
    return { role: primaryLine, company: secondaryLine };
  }

  return { role: primaryLine, company: "" };
}

function extractDateRange(value: string) {
  const normalized = value.replace(/[–—]/g, "-");
  const parts = normalized.split("-").map((part) => part.trim()).filter(Boolean);
  return {
    start: parts[0] ?? "",
    end: parts[1] ?? (parts[0] && /present|current/i.test(parts[0]) ? parts[0] : ""),
  };
}

function guessSummary(...sources: Array<string | undefined>) {
  for (const source of sources) {
    const cleaned = cleanText(source);
    if (cleaned && cleaned.length > 60) {
      return cleaned.slice(0, 900);
    }
  }
  return "";
}

function guessFullName(lines: string[]) {
  return (
    lines.find((line) => {
      if (line.length < 3 || line.length > 60) return false;
      if (/@|https?:\/\//i.test(line)) return false;
      if (/\d{3,}/.test(line)) return false;
      return /^[A-Za-z][A-Za-z\s.'-]+$/.test(line);
    }) ?? ""
  );
}

function guessPhone(text: string) {
  return text.match(/(\+?\d[\d\s().-]{7,}\d)/)?.[0]?.trim() ?? "";
}

function guessLocation(lines: string[]) {
  return (
    lines.find((line) => !/@|https?:\/\//i.test(line) && /,/.test(line) && !/experience|education|skills/i.test(line)) ?? ""
  );
}

function extractLinks(text: string) {
  return [...text.matchAll(/https?:\/\/[^\s)]+/gi)].map((match) => {
    const url = match[0].replace(/[),.;]+$/, "");
    const label = url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0] ?? url;
    return { label, url };
  });
}

function dedupeLinks(links: Array<{ label: string; url: string }>) {
  const seen = new Set<string>();
  return links.filter((link) => {
    const key = link.url.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildTitleSuggestion(title?: string, fullName?: string) {
  const normalizedTitle = cleanText(title);
  if (normalizedTitle) return normalizedTitle.slice(0, 80);
  const normalizedName = cleanText(fullName);
  return normalizedName ? `${normalizedName} Resume` : "Imported resume";
}

function normalizeText(value: string) {
  return value
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanText(value?: string | null) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function getFileExtension(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function stripCodeFences(value: string) {
  return value.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/, "").trim();
}

function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
