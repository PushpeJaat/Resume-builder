import type { ResumeData } from "@/types/resume";
import {
  A4_PAGE,
  FONT_FAMILY,
  type ResumeElement,
  type ResumeLayout,
  type TextElement,
} from "@/shared/layoutSchema";

const PAGE_TOP = 48;
const PAGE_BOTTOM = 64;
const LEFT = 44;
const CONTENT_WIDTH = 507;
const SECTION_GAP = 16;

export function buildResumeLayout(data: ResumeData): ResumeLayout {
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
    color: "#0f172a",
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
      color: "#334155",
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
    color: "#d1d5db",
  });
  advance(14);

  if (data.summary.trim()) {
    pushSectionTitle(elements, pageIndex, "summary-title", "PROFESSIONAL SUMMARY", cursorY);
    advance(20);
    pushText("summary", data.summary, {
      x: LEFT,
      y: cursorY,
      width: CONTENT_WIDTH,
      fontSize: 11,
      lineHeight: 1.45,
      fontFamily: FONT_FAMILY,
      fontWeight: "normal",
      color: "#1f2937",
      letterSpacing: 0,
    });
    advance(SECTION_GAP);
  }

  if (data.experience.length > 0) {
    ensureSpace(38);
    pushSectionTitle(elements, pageIndex, "experience-title", "EXPERIENCE", cursorY);
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
        color: "#0f172a",
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
          color: "#475569",
          letterSpacing: 0,
        });
        advance(4);
      }

      for (const [bulletIndex, bullet] of exp.bullets.entries()) {
        pushText(`exp-bullet-${expIndex}-${bulletIndex}`, `• ${bullet}`, {
          x: LEFT + 6,
          y: cursorY,
          width: CONTENT_WIDTH - 6,
          fontSize: 10.5,
          lineHeight: 1.35,
          fontFamily: FONT_FAMILY,
          fontWeight: "normal",
          color: "#1f2937",
          letterSpacing: 0,
        });
        advance(2);
      }

      advance(10);
    }
  }

  if (data.education.length > 0) {
    ensureSpace(36);
    pushSectionTitle(elements, pageIndex, "education-title", "EDUCATION", cursorY);
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
        color: "#0f172a",
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
        color: "#475569",
        letterSpacing: 0,
      });
      advance(8);
    }
  }

  if (data.skills.length > 0) {
    ensureSpace(36);
    pushSectionTitle(elements, pageIndex, "skills-title", "SKILLS", cursorY);
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
        color: "#1f2937",
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
    color: "#111827",
    letterSpacing: 0,
  });
}
