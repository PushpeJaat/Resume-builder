"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ResumeData } from "@/types/resume";
import { renderResumeDocument } from "@/lib/templates/render";

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1122;

type Props = {
  templateId: string;
  data: ResumeData;
};

export function ResumePreviewFrame({ templateId, data }: Props) {
  const html = useMemo(() => renderResumeDocument(templateId, data), [templateId, data]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0.65);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      const nextScale = entry.contentRect.width / A4_WIDTH_PX;
      setScale(Math.max(0.35, Math.min(1, nextScale)));
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="h-full min-h-0 overflow-auto px-2 pt-2 pb-0 sm:px-3 sm:pt-3 sm:pb-1">
      <div ref={containerRef} className="relative mx-auto w-full max-w-[794px] overflow-hidden" style={{ aspectRatio: "210 / 297" }}>
        <div
          className="absolute left-0 top-0"
          style={{
            width: A4_WIDTH_PX,
            height: A4_HEIGHT_PX,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <iframe
            title="Resume live preview"
            srcDoc={html}
            style={{ width: A4_WIDTH_PX, height: A4_HEIGHT_PX, border: "none", display: "block" }}
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}
