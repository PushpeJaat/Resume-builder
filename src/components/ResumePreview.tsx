"use client";

import Image from "next/image";
import { useMemo } from "react";
import type { CSSProperties } from "react";
import { resumeLayoutSchema, type ResumeElement, type ResumeLayout } from "@/shared/layoutSchema";
import { createCanvasMeasure, wrapText } from "@/shared/textWrap";

type Props = {
  layout: ResumeLayout;
  scale?: number;
  maxPages?: number;
};

export function ResumePreview({ layout, scale = 1, maxPages }: Props) {
  const parsed = useMemo(() => resumeLayoutSchema.parse(layout), [layout]);
  const measure = useMemo(() => createCanvasMeasure(), []);

  const pageCount = useMemo(() => {
    const maxPageIndex = parsed.elements.reduce((max, element) => Math.max(max, element.pageIndex), 0);
    const totalPages = maxPageIndex + 1;
    if (typeof maxPages === "number" && Number.isFinite(maxPages)) {
      return Math.max(1, Math.min(totalPages, Math.floor(maxPages)));
    }

    return totalPages;
  }, [maxPages, parsed.elements]);

  return (
    <div style={{ width: parsed.page.width * scale }}>
      <style>{`
        .resume-preview-page {
          position: relative;
          background: #fff;
          margin: 0 0 12px;
          box-shadow: 0 18px 40px -28px rgba(2, 6, 23, 0.45);
          overflow: hidden;
        }
        .resume-preview-text {
          position: absolute;
          white-space: pre-wrap;
          word-break: break-word;
          overflow-wrap: anywhere;
          margin: 0;
          padding: 0;
        }
      `}</style>

      {Array.from({ length: pageCount }).map((_, pageIndex) => {
        const pageElements = parsed.elements.filter((element) => element.pageIndex === pageIndex);

        return (
          <div
            key={`page-${pageIndex}`}
            className="resume-preview-page"
            style={{
              width: parsed.page.width * scale,
              height: parsed.page.height * scale,
            }}
          >
            {pageElements.map((element) => renderElement(element, parsed.page.height, measure, scale))}
          </div>
        );
      })}
    </div>
  );
}

function renderElement(
  element: ResumeElement,
  pageHeight: number,
  measure: ReturnType<typeof createCanvasMeasure>,
  scale: number,
) {
  if (element.type === "rect") {
    const strokeWidth = typeof element.strokeWidth === "number" ? element.strokeWidth : 0;
    const strokeColor = typeof element.strokeColor === "string" ? element.strokeColor : "";
    const hasStroke = strokeWidth > 0 && strokeColor.length > 0;

    const style: CSSProperties = {
      position: "absolute",
      left: element.x * scale,
      top: element.y * scale,
      width: element.width * scale,
      height: element.height * scale,
      backgroundColor: element.color,
      borderRadius: typeof element.cornerRadius === "number" ? element.cornerRadius * scale : undefined,
      border: hasStroke ? `${strokeWidth * scale}px solid ${strokeColor}` : undefined,
      opacity: element.opacity,
    };

    return <div key={element.id} style={style} />;
  }

  if (element.type === "circle") {
    const diameter = element.radius * 2;
    const strokeWidth = typeof element.strokeWidth === "number" ? element.strokeWidth : 0;
    const strokeColor = typeof element.strokeColor === "string" ? element.strokeColor : "";
    const hasStroke = strokeWidth > 0 && strokeColor.length > 0;

    const style: CSSProperties = {
      position: "absolute",
      left: (element.cx - element.radius) * scale,
      top: (element.cy - element.radius) * scale,
      width: diameter * scale,
      height: diameter * scale,
      borderRadius: "9999px",
      backgroundColor: element.color,
      border: hasStroke ? `${strokeWidth * scale}px solid ${strokeColor}` : undefined,
      opacity: element.opacity,
    };

    return <div key={element.id} style={style} />;
  }

  if (element.type === "line") {
    const style: CSSProperties = {
      position: "absolute",
      left: element.x * scale,
      top: element.y * scale,
      width: element.width * scale,
      height: element.strokeWidth * scale,
      backgroundColor: element.color,
    };

    return <div key={element.id} style={style} />;
  }

  if (element.type === "image") {
    const width = Math.max(1, Math.round(element.width * scale));
    const height = Math.max(1, Math.round(element.height * scale));

    const style: CSSProperties = {
      position: "absolute",
      left: element.x * scale,
      top: element.y * scale,
      width,
      height,
      objectFit: element.fit,
    };

    return <Image key={element.id} src={element.src} alt="Profile" width={width} height={height} unoptimized style={style} />;
  }

  const lineHeightPx = element.fontSize * element.lineHeight;
  const lines = wrapText(element.content, element.width, element, measure);

  return (
    <div key={element.id}>
      {lines.map((line, lineIndex) => {
        const style: CSSProperties = {
          position: "absolute",
          left: element.x * scale,
          top: (element.y + lineHeightPx * lineIndex) * scale,
          width: element.width * scale,
          fontFamily: element.fontFamily,
          fontWeight: element.fontWeight,
          fontSize: element.fontSize * scale,
          lineHeight: `${lineHeightPx * scale}px`,
          color: element.color,
          letterSpacing: `${element.letterSpacing * scale}px`,
          maxHeight: pageHeight * scale,
        };

        return (
          <div key={`${element.id}-${lineIndex}`} className="resume-preview-text" style={style}>
            {line}
          </div>
        );
      })}
    </div>
  );
}
