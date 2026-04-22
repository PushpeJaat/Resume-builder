export type TemplateRenderEngine = "html" | "layout";

export type TemplateMeta = {
  id: string;
  name: string;
  description: string;
  renderEngine: TemplateRenderEngine;
};

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "modern-professional",
    name: "Modern Professional",
    description: "Two-column layout with a confident sidebar accent.",
    renderEngine: "layout",
  },
  {
    id: "minimal-clean",
    name: "Minimal Clean",
    description: "Single column, generous whitespace, typographic focus.",
    renderEngine: "layout",
  },
  {
    id: "creative-designer",
    name: "Creative Designer",
    description: "Bold type, geometric accents, portfolio-forward.",
    renderEngine: "layout",
  },
  {
    id: "executive-portrait",
    name: "Executive Portrait",
    description: "Leadership-focused layout with a polished profile photo header.",
    renderEngine: "layout",
  },
  {
    id: "profile-edge",
    name: "Profile Edge",
    description: "Photo-led resume with a strong contact rail and resilient long-form sections.",
    renderEngine: "html",
  },
  {
    id: "canva-standard",
    name: "Canva Standard",
    description: "Canva-inspired blue sidebar layout with crisp cards and polished A4 hierarchy.",
    renderEngine: "layout",
  },
  {
    id: "luminary",
    name: "Luminary",
    description: "Magazine-quality layout with a full-bleed dark header, circular photo, and gold editorial accents.",
    renderEngine: "html",
  },
  {
    id: "slate-sidebar",
    name: "Slate Sidebar",
    description: "Dark slate sidebar with clean white main panel — professional and easy to scan.",
    renderEngine: "layout",
  },
  {
    id: "aurora-glass",
    name: "Aurora Glass",
    description: "Glassmorphism-style layout with floating gradients and vibrant visual accents.",
    renderEngine: "html",
  },
  {
    id: "nova-noir",
    name: "Nova Noir",
    description: "Canva-grade dark editorial template with cinematic arc backgrounds and neon highlights.",
    renderEngine: "html",
  },
  {
    id: "sunrise-strata",
    name: "Sunrise Strata",
    description: "Warm gradient editorial template with layered accents, soft glows, and modern section cards.",
    renderEngine: "html",
  },
];

export function getTemplateMeta(id: string): TemplateMeta | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export const DEFAULT_TEMPLATE_ID = "modern-professional";

export function getTemplateRenderEngine(templateId: string): TemplateRenderEngine {
  const fallback = getTemplateMeta(DEFAULT_TEMPLATE_ID)?.renderEngine ?? "html";
  return getTemplateMeta(templateId)?.renderEngine ?? fallback;
}

export function shouldUseLayoutEngine(templateId: string): boolean {
  return getTemplateRenderEngine(templateId) === "layout";
}
