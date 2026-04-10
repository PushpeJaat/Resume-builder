export type TemplateMeta = {
  id: string;
  name: string;
  description: string;
};

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "modern-professional",
    name: "Modern Professional",
    description: "Two-column layout with a confident sidebar accent.",
  },
  {
    id: "minimal-clean",
    name: "Minimal Clean",
    description: "Single column, generous whitespace, typographic focus.",
  },
  {
    id: "creative-designer",
    name: "Creative Designer",
    description: "Bold type, geometric accents, portfolio-forward.",
  },
  {
    id: "executive-portrait",
    name: "Executive Portrait",
    description: "Leadership-focused layout with a polished profile photo header.",
  },
  {
    id: "profile-edge",
    name: "Profile Edge",
    description: "Photo-led resume with a strong contact rail and resilient long-form sections.",
  },
  {
    id: "canva-standard",
    name: "Canva Standard",
    description: "Canva-inspired blue sidebar layout with crisp cards and polished A4 hierarchy.",
  },
  {
    id: "luminary",
    name: "Luminary",
    description: "Magazine-quality layout with a full-bleed dark header, circular photo, and gold editorial accents.",
  },
];

export function getTemplateMeta(id: string): TemplateMeta | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export const DEFAULT_TEMPLATE_ID = "modern-professional";
