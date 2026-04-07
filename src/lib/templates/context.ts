import type { ResumeData } from "@/types/resume";

/** Shape passed to Handlebars (placeholders / {{#each}}). */
export type TemplateContext = {
  personal: ResumeData["personal"] & {
    hasLinks: boolean;
  };
  summary: string;
  hasSummary: boolean;
  experience: (ResumeData["experience"][number] & {
    hasBullets: boolean;
  })[];
  hasExperience: boolean;
  education: ResumeData["education"];
  hasEducation: boolean;
  skills: (ResumeData["skills"][number] & {
    hasItems: boolean;
    itemsJoined: string;
  })[];
  hasSkills: boolean;
};

export function toTemplateContext(data: ResumeData): TemplateContext {
  const links = data.personal.links.filter((l) => l.label.trim() || l.url.trim());
  return {
    personal: {
      ...data.personal,
      links,
      hasLinks: links.length > 0,
    },
    summary: data.summary,
    hasSummary: data.summary.trim().length > 0,
    experience: data.experience.map((e) => ({
      ...e,
      hasBullets: e.bullets.some((b) => b.trim().length > 0),
    })),
    hasExperience: data.experience.length > 0,
    education: data.education,
    hasEducation: data.education.length > 0,
    skills: data.skills.map((s) => {
      const trimmed = s.items.map((i) => i.trim()).filter(Boolean);
      return {
        ...s,
        hasItems: trimmed.length > 0,
        itemsJoined: trimmed.join(", "),
      };
    }),
    hasSkills: data.skills.length > 0,
  };
}
