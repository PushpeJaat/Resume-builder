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
];

export function getTemplateMeta(id: string): TemplateMeta | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function isPremiumTemplate(id: string): boolean {
  return getTemplateMeta(id)?.premium ?? false;
}

export const DEFAULT_TEMPLATE_ID = "modern-professional";
