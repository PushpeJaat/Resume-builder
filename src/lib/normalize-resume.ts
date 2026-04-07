import { randomUUID } from "crypto";
import type { ResumeData } from "@/types/resume";

/** Accepts parsed resume JSON; guarantees stable ids for list rows. */
export function ensureResumeIds(data: ResumeData): ResumeData {
  return {
    ...data,
    experience: data.experience.map((e) => ({
      ...e,
      id: e.id && e.id.length > 0 ? e.id : randomUUID(),
    })),
    education: data.education.map((e) => ({
      ...e,
      id: e.id && e.id.length > 0 ? e.id : randomUUID(),
    })),
    skills: data.skills.map((s) => ({
      ...s,
      id: s.id && s.id.length > 0 ? s.id : randomUUID(),
    })),
  };
}
