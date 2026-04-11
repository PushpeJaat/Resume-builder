import type { ResumeData } from "@/types/resume";

function createId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `id-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

/** Accepts parsed resume JSON; guarantees stable ids for list rows. */
export function ensureResumeIds(data: ResumeData): ResumeData {
  return {
    ...data,
    personal: {
      ...data.personal,
      photoUrl: data.personal.photoUrl?.trim() ?? "",
    },
    experience: data.experience.map((e) => ({
      ...e,
      id: e.id && e.id.length > 0 ? e.id : createId(),
    })),
    education: data.education.map((e) => ({
      ...e,
      id: e.id && e.id.length > 0 ? e.id : createId(),
    })),
    skills: data.skills.map((s) => ({
      ...s,
      id: s.id && s.id.length > 0 ? s.id : createId(),
    })),
  };
}
