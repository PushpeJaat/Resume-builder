import type { ResumeData } from "@/types/resume";
import {
  A4_PAGE,
  FONT_FAMILY,
  type ResumeElement,
  type ResumeLayout,
  type TextElement,
} from "@/shared/layoutSchema";
import { DEFAULT_TEMPLATE_ID } from "@/lib/templates/registry";

const PAGE_TOP = 48;
const PAGE_BOTTOM = 64;
const LEFT = 44;
const CONTENT_WIDTH = 507;
const SECTION_GAP = 16;

type TemplateVariant = {
  headerColor: string;
  textColor: string;
  metaColor: string;
  dividerColor: string;
  titleColor: string;
  bulletIndent: number;
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

export function buildResumeLayout(data: ResumeData, templateId: string): ResumeLayout {
  const variant = TEMPLATE_VARIANTS[templateId] ?? TEMPLATE_VARIANTS[DEFAULT_TEMPLATE_ID] ?? DEFAULT_VARIANT;
  const elements: ResumeElement[] = [];

  let pageIndex = 0;
  let cursorY = PAGE_TOP;

  const advance = (amount: number) => {
    cursorY += amount;
  };

  const ensureSpace = (height: number) => {
    if (cursorY + height <= A4_PAGE.height - PAGE_BOTTOM) {
      return;
    }
    pageIndex += 1;
    cursorY = PAGE_TOP;
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
    x: LEFT,
    y: cursorY,
    width: CONTENT_WIDTH,
    fontSize: 26,
    lineHeight: 1.1,
    fontFamily: FONT_FAMILY,
    fontWeight: "bold",
    color: variant.headerColor,
    letterSpacing: 0,
  });
  advance(8);

  const contactParts = [data.personal.email, data.personal.phone, data.personal.location]
    .map((part) => part.trim())
    .filter(Boolean);
  if (contactParts.length > 0) {
    pushText("contact", contactParts.join(" | "), {
      x: LEFT,
      y: cursorY,
      width: CONTENT_WIDTH,
      fontSize: 11,
      lineHeight: 1.3,
      fontFamily: FONT_FAMILY,
      fontWeight: "normal",
      color: variant.metaColor,
      letterSpacing: 0,
    });
    advance(6);
  }

  elements.push({
    type: "line",
    id: `header-line-${pageIndex}`,
    pageIndex,
    x: LEFT,
    y: cursorY,
    width: CONTENT_WIDTH,
    strokeWidth: 1,
    color: variant.dividerColor,
  });
  advance(14);

  if (data.summary.trim()) {
    pushSectionTitle(elements, pageIndex, "summary-title", "PROFESSIONAL SUMMARY", cursorY, variant);
    advance(20);
    pushText("summary", data.summary, {
      x: LEFT,
      y: cursorY,
      width: CONTENT_WIDTH,
      fontSize: 11,
      lineHeight: 1.45,
      fontFamily: FONT_FAMILY,
      fontWeight: "normal",
      color: variant.textColor,
      letterSpacing: 0,
    });
    advance(SECTION_GAP);
  }

  if (data.experience.length > 0) {
    ensureSpace(38);
    pushSectionTitle(elements, pageIndex, "experience-title", "EXPERIENCE", cursorY, variant);
    advance(20);

    for (const [expIndex, exp] of data.experience.entries()) {
      ensureSpace(58);
      pushText(`exp-role-${expIndex}`, `${exp.role} - ${exp.company}`, {
        x: LEFT,
        y: cursorY,
        width: CONTENT_WIDTH,
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
          x: LEFT,
          y: cursorY,
          width: CONTENT_WIDTH,
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
          x: LEFT + variant.bulletIndent,
          y: cursorY,
          width: CONTENT_WIDTH - variant.bulletIndent,
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
    pushSectionTitle(elements, pageIndex, "education-title", "EDUCATION", cursorY, variant);
    advance(20);

    for (const [eduIndex, edu] of data.education.entries()) {
      pushText(`edu-${eduIndex}`, `${edu.degree} - ${edu.school}`, {
        x: LEFT,
        y: cursorY,
        width: CONTENT_WIDTH,
        fontSize: 11,
        lineHeight: 1.35,
        fontFamily: FONT_FAMILY,
        fontWeight: "bold",
        color: variant.headerColor,
        letterSpacing: 0,
      });
      advance(2);
      pushText(`edu-duration-${eduIndex}`, `${edu.start} - ${edu.end}`, {
        x: LEFT,
        y: cursorY,
        width: CONTENT_WIDTH,
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
    pushSectionTitle(elements, pageIndex, "skills-title", "SKILLS", cursorY, variant);
    advance(20);

    for (const [skillIndex, skill] of data.skills.entries()) {
      const label = skill.category.trim() ? `${skill.category}: ` : "";
      const items = skill.items.join(", ");
      pushText(`skill-${skillIndex}`, `${label}${items}`, {
        x: LEFT,
        y: cursorY,
        width: CONTENT_WIDTH,
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
) {
  elements.push({
    type: "text",
    id,
    pageIndex,
    x: LEFT,
    y,
    width: CONTENT_WIDTH,
    content,
    fontSize: 10,
    lineHeight: 1.1,
    fontFamily: FONT_FAMILY,
    fontWeight: "bold",
    color: variant.titleColor,
    letterSpacing: 0,
  });
}
