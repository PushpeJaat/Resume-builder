import type { ResumeData } from "@/types/resume";
import {
  A4_PAGE,
  FONT_FAMILY,
  type ResumeElement,
  type ResumeLayout,
  type TextElement,
} from "@/shared/layoutSchema";
import { DEFAULT_TEMPLATE_ID } from "@/lib/templates/registry";

const PAGE_BOTTOM = 64;

type TemplateVariant = {
  headerColor: string;
  textColor: string;
  metaColor: string;
  dividerColor: string;
  titleColor: string;
  bulletIndent: number;
};

type TemplateGeometry = {
  kind: "single" | "sidebar" | "topband";
  left: number;
  width: number;
  top: number;
  sectionGap: number;
  nameSize: number;
  metaSize: number;
};

type TemplateStyle = {
  variant: TemplateVariant;
  geometry: TemplateGeometry;
};

const DEFAULT_VARIANT: TemplateVariant = {
  headerColor: "#0f172a",
  textColor: "#1f2937",
  metaColor: "#475569",
  dividerColor: "#d1d5db",
  titleColor: "#111827",
  bulletIndent: 6,
};

const TEMPLATE_VARIANTS: Record<string, TemplateVariant> = {
  "modern-professional": DEFAULT_VARIANT,
  "minimal-clean": {
    headerColor: "#111827",
    textColor: "#1f2937",
    metaColor: "#6b7280",
    dividerColor: "#e5e7eb",
    titleColor: "#111827",
    bulletIndent: 4,
  },
  "creative-designer": {
    headerColor: "#7c2d12",
    textColor: "#1f2937",
    metaColor: "#9a3412",
    dividerColor: "#fdba74",
    titleColor: "#9a3412",
    bulletIndent: 8,
  },
  "executive-portrait": {
    headerColor: "#0f172a",
    textColor: "#111827",
    metaColor: "#374151",
    dividerColor: "#cbd5e1",
    titleColor: "#0f172a",
    bulletIndent: 6,
  },
  "profile-edge": {
    headerColor: "#0b3b66",
    textColor: "#1f2937",
    metaColor: "#0f4c81",
    dividerColor: "#93c5fd",
    titleColor: "#0b3b66",
    bulletIndent: 8,
  },
  "canva-standard": {
    headerColor: "#1d4ed8",
    textColor: "#1f2937",
    metaColor: "#1e40af",
    dividerColor: "#93c5fd",
    titleColor: "#1d4ed8",
    bulletIndent: 7,
  },
  luminary: {
    headerColor: "#7c5a03",
    textColor: "#1f2937",
    metaColor: "#92400e",
    dividerColor: "#facc15",
    titleColor: "#78350f",
    bulletIndent: 6,
  },
  "slate-sidebar": {
    headerColor: "#0f172a",
    textColor: "#1e293b",
    metaColor: "#334155",
    dividerColor: "#94a3b8",
    titleColor: "#0f172a",
    bulletIndent: 6,
  },
  "aurora-glass": {
    headerColor: "#0f766e",
    textColor: "#134e4a",
    metaColor: "#0f766e",
    dividerColor: "#5eead4",
    titleColor: "#0f766e",
    bulletIndent: 7,
  },
  "nova-noir": {
    headerColor: "#111827",
    textColor: "#1f2937",
    metaColor: "#4b5563",
    dividerColor: "#6b7280",
    titleColor: "#111827",
    bulletIndent: 6,
  },
};

const SINGLE_GEOMETRY: TemplateGeometry = {
  kind: "single",
  left: 44,
  width: 507,
  top: 48,
  sectionGap: 16,
  nameSize: 26,
  metaSize: 11,
};

const TEMPLATE_STYLES: Record<string, TemplateStyle> = {
  "modern-professional": {
    variant: TEMPLATE_VARIANTS["modern-professional"],
    geometry: SINGLE_GEOMETRY,
  },
  "minimal-clean": {
    variant: TEMPLATE_VARIANTS["minimal-clean"],
    geometry: {
      kind: "single",
      left: 56,
      width: 483,
      top: 58,
      sectionGap: 18,
      nameSize: 24,
      metaSize: 10.5,
    },
  },
  "creative-designer": {
    variant: TEMPLATE_VARIANTS["creative-designer"],
    geometry: {
      kind: "topband",
      left: 44,
      width: 507,
      top: 138,
      sectionGap: 16,
      nameSize: 28,
      metaSize: 11,
    },
  },
  "executive-portrait": {
    variant: TEMPLATE_VARIANTS["executive-portrait"],
    geometry: {
      kind: "single",
      left: 46,
      width: 503,
      top: 52,
      sectionGap: 16,
      nameSize: 27,
      metaSize: 11,
    },
  },
  "profile-edge": {
    variant: TEMPLATE_VARIANTS["profile-edge"],
    geometry: {
      kind: "sidebar",
      left: 212,
      width: 343,
      top: 54,
      sectionGap: 14,
      nameSize: 23,
      metaSize: 10,
    },
  },
  "canva-standard": {
    variant: TEMPLATE_VARIANTS["canva-standard"],
    geometry: {
      kind: "sidebar",
      left: 214,
      width: 339,
      top: 52,
      sectionGap: 14,
      nameSize: 24,
      metaSize: 10,
    },
  },
  luminary: {
    variant: TEMPLATE_VARIANTS.luminary,
    geometry: {
      kind: "topband",
      left: 50,
      width: 495,
      top: 148,
      sectionGap: 16,
      nameSize: 29,
      metaSize: 11,
    },
  },
  "slate-sidebar": {
    variant: TEMPLATE_VARIANTS["slate-sidebar"],
    geometry: {
      kind: "sidebar",
      left: 214,
      width: 339,
      top: 52,
      sectionGap: 14,
      nameSize: 24,
      metaSize: 10,
    },
  },
  "aurora-glass": {
    variant: TEMPLATE_VARIANTS["aurora-glass"],
    geometry: {
      kind: "topband",
      left: 46,
      width: 503,
      top: 140,
      sectionGap: 15,
      nameSize: 27,
      metaSize: 10.8,
    },
  },
  "nova-noir": {
    variant: TEMPLATE_VARIANTS["nova-noir"],
    geometry: {
      kind: "sidebar",
      left: 214,
      width: 339,
      top: 52,
      sectionGap: 14,
      nameSize: 24,
      metaSize: 10,
    },
  },
};

export function buildResumeLayout(data: ResumeData, templateId: string): ResumeLayout {
  const style = TEMPLATE_STYLES[templateId] ?? TEMPLATE_STYLES[DEFAULT_TEMPLATE_ID] ?? {
    variant: DEFAULT_VARIANT,
    geometry: SINGLE_GEOMETRY,
  };
  const { variant, geometry } = style;

  const elements: ResumeElement[] = [];

  let pageIndex = 0;
  let cursorY = geometry.top;

  if (geometry.kind === "sidebar") {
    elements.push({
      type: "rect",
      id: "sidebar-bg",
      pageIndex: 0,
      x: 0,
      y: 0,
      width: 190,
      height: A4_PAGE.height,
      color: variant.dividerColor,
    });
  }

  if (geometry.kind === "topband") {
    elements.push({
      type: "rect",
      id: "top-band",
      pageIndex: 0,
      x: 0,
      y: 0,
      width: A4_PAGE.width,
      height: 112,
      color: variant.headerColor,
    });
  }

  const advance = (amount: number) => {
    cursorY += amount;
  };

  const ensureSpace = (height: number) => {
    if (cursorY + height <= A4_PAGE.height - PAGE_BOTTOM) {
      return;
    }
    pageIndex += 1;
    cursorY = 48;
  };

  const pushText = (id: string, content: string, options: Omit<TextElement, "type" | "id" | "content" | "pageIndex">) => {
    if (!content.trim()) {
      return;
    }

    const estimatedLineCount = Math.max(1, Math.ceil(content.length / Math.max(1, Math.floor(options.width / (options.fontSize * 0.56)))));
    const estimatedHeight = estimatedLineCount * options.fontSize * options.lineHeight;
    ensureSpace(estimatedHeight + 8);
    const y = cursorY;

    elements.push({
      type: "text",
      id,
      pageIndex,
      content,
      ...options,
      y,
    });

    cursorY += estimatedHeight;
  };

  pushText("name", data.personal.fullName || "Untitled Resume", {
    x: geometry.left,
    y: cursorY,
    width: geometry.width,
    fontSize: geometry.nameSize,
    lineHeight: 1.1,
    fontFamily: FONT_FAMILY,
    fontWeight: "bold",
    color: geometry.kind === "topband" ? "#ffffff" : variant.headerColor,
    letterSpacing: 0,
  });
  advance(8);

  const contactParts = [data.personal.email, data.personal.phone, data.personal.location]
    .map((part) => part.trim())
    .filter(Boolean);
  if (contactParts.length > 0) {
    pushText("contact", contactParts.join(" | "), {
      x: geometry.left,
      y: cursorY,
      width: geometry.width,
      fontSize: geometry.metaSize,
      lineHeight: 1.3,
      fontFamily: FONT_FAMILY,
      fontWeight: "normal",
      color: geometry.kind === "topband" ? "#e2e8f0" : variant.metaColor,
      letterSpacing: 0,
    });
    advance(6);
  }

  elements.push({
    type: "line",
    id: `header-line-${pageIndex}`,
    pageIndex,
    x: geometry.left,
    y: cursorY,
    width: geometry.width,
    strokeWidth: 1,
    color: variant.dividerColor,
  });
  advance(14);

  if (data.summary.trim()) {
    pushSectionTitle(elements, pageIndex, "summary-title", "PROFESSIONAL SUMMARY", cursorY, variant, geometry);
    advance(20);
    pushText("summary", data.summary, {
      x: geometry.left,
      y: cursorY,
      width: geometry.width,
      fontSize: 11,
      lineHeight: 1.45,
      fontFamily: FONT_FAMILY,
      fontWeight: "normal",
      color: variant.textColor,
      letterSpacing: 0,
    });
    advance(geometry.sectionGap);
  }

  if (data.experience.length > 0) {
    ensureSpace(38);
    pushSectionTitle(elements, pageIndex, "experience-title", "EXPERIENCE", cursorY, variant, geometry);
    advance(20);

    for (const [expIndex, exp] of data.experience.entries()) {
      ensureSpace(58);
      pushText(`exp-role-${expIndex}`, `${exp.role} - ${exp.company}`, {
        x: geometry.left,
        y: cursorY,
        width: geometry.width,
        fontSize: 12,
        lineHeight: 1.25,
        fontFamily: FONT_FAMILY,
        fontWeight: "bold",
        color: variant.headerColor,
        letterSpacing: 0,
      });
      advance(2);

      const duration = [exp.start, exp.end].filter(Boolean).join(" - ");
      if (duration) {
        pushText(`exp-duration-${expIndex}`, duration, {
          x: geometry.left,
          y: cursorY,
          width: geometry.width,
          fontSize: 10,
          lineHeight: 1.25,
          fontFamily: FONT_FAMILY,
          fontWeight: "normal",
          color: variant.metaColor,
          letterSpacing: 0,
        });
        advance(4);
      }

      for (const [bulletIndex, bullet] of exp.bullets.entries()) {
        pushText(`exp-bullet-${expIndex}-${bulletIndex}`, `• ${bullet}`, {
          x: geometry.left + variant.bulletIndent,
          y: cursorY,
          width: geometry.width - variant.bulletIndent,
          fontSize: 10.5,
          lineHeight: 1.35,
          fontFamily: FONT_FAMILY,
          fontWeight: "normal",
          color: variant.textColor,
          letterSpacing: 0,
        });
        advance(2);
      }

      advance(10);
    }
  }

  if (data.education.length > 0) {
    ensureSpace(36);
    pushSectionTitle(elements, pageIndex, "education-title", "EDUCATION", cursorY, variant, geometry);
    advance(20);

    for (const [eduIndex, edu] of data.education.entries()) {
      pushText(`edu-${eduIndex}`, `${edu.degree} - ${edu.school}`, {
        x: geometry.left,
        y: cursorY,
        width: geometry.width,
        fontSize: 11,
        lineHeight: 1.35,
        fontFamily: FONT_FAMILY,
        fontWeight: "bold",
        color: variant.headerColor,
        letterSpacing: 0,
      });
      advance(2);
      pushText(`edu-duration-${eduIndex}`, `${edu.start} - ${edu.end}`, {
        x: geometry.left,
        y: cursorY,
        width: geometry.width,
        fontSize: 10,
        lineHeight: 1.25,
        fontFamily: FONT_FAMILY,
        fontWeight: "normal",
        color: variant.metaColor,
        letterSpacing: 0,
      });
      advance(8);
    }
  }

  if (data.skills.length > 0) {
    ensureSpace(36);
    pushSectionTitle(elements, pageIndex, "skills-title", "SKILLS", cursorY, variant, geometry);
    advance(20);

    for (const [skillIndex, skill] of data.skills.entries()) {
      const label = skill.category.trim() ? `${skill.category}: ` : "";
      const items = skill.items.join(", ");
      pushText(`skill-${skillIndex}`, `${label}${items}`, {
        x: geometry.left,
        y: cursorY,
        width: geometry.width,
        fontSize: 10.5,
        lineHeight: 1.35,
        fontFamily: FONT_FAMILY,
        fontWeight: "normal",
        color: variant.textColor,
        letterSpacing: 0,
      });
      advance(6);
    }
  }

  return {
    page: A4_PAGE,
    elements,
  };
}

function pushSectionTitle(
  elements: ResumeElement[],
  pageIndex: number,
  id: string,
  content: string,
  y: number,
  variant: TemplateVariant,
  geometry: TemplateGeometry,
) {
  elements.push({
    type: "text",
    id,
    pageIndex,
    x: geometry.left,
    y,
    width: geometry.width,
    content,
    fontSize: 10,
    lineHeight: 1.1,
    fontFamily: FONT_FAMILY,
    fontWeight: "bold",
    color: variant.titleColor,
    letterSpacing: 0,
  });
}
