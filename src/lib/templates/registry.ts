export type TemplateMeta = {
  id: string;
  name: string;
  description: string;
  premium: boolean;
};

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "modern-professional",
    name: "Modern Professional",
    description: "Two-column layout with a confident sidebar accent.",
    premium: false,
  },
  {
    id: "minimal-clean",
    name: "Minimal Clean",
    description: "Single column, generous whitespace, typographic focus.",
    premium: false,
  },
  {
    id: "creative-designer",
    name: "Creative Designer",
    description: "Bold type, geometric accents, portfolio-forward.",
    premium: true,
  },
  {
    id: "executive-portrait",
    name: "Executive Portrait",
    description: "Leadership-focused layout with a polished profile photo header.",
    premium: false,
  },
  {
    id: "profile-edge",
    name: "Profile Edge",
    description: "Photo-led resume with a strong contact rail and resilient long-form sections.",
    premium: true,
  },
];

export function getTemplateMeta(id: string): TemplateMeta | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function isPremiumTemplate(id: string): boolean {
  return getTemplateMeta(id)?.premium ?? false;
}

export const DEFAULT_TEMPLATE_ID = "modern-professional";
