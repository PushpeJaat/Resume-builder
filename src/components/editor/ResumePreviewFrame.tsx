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
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const firstPageIframeRef = useRef<HTMLIFrameElement | null>(null);
  const [scale, setScale] = useState(0.65);
  const [frameHeight, setFrameHeight] = useState(A4_HEIGHT_PX);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
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

    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  const syncFrameMetrics = () => {
    const iframe = firstPageIframeRef.current;
    const contentDocument = iframe?.contentDocument;
    if (!contentDocument) {
      return;
    }

    const nextHeight = Math.max(
      contentDocument.documentElement.scrollHeight,
      contentDocument.body.scrollHeight,
      A4_HEIGHT_PX,
    );

    setFrameHeight(nextHeight);
  };

  useEffect(() => {
    const t1 = window.setTimeout(syncFrameMetrics, 120);
    const t2 = window.setTimeout(syncFrameMetrics, 620);
    const t3 = window.setTimeout(syncFrameMetrics, 1800);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
    // html controls layout changes after template/data switches
  }, [html]);

  const pageCount = Math.max(1, Math.ceil(frameHeight / A4_HEIGHT_PX));
  const pageOffsets = Array.from({ length: pageCount }, (_, index) => index * A4_HEIGHT_PX);

  return (
    <div className="h-full min-h-0 overflow-auto px-2 pt-2 pb-0 sm:px-3 sm:pt-3 sm:pb-1">
      <div ref={viewportRef} className="mx-auto flex w-full max-w-[794px] flex-col items-center gap-3">
        {pageOffsets.map((pageOffset, pageIndex) => (
          <div
            key={`resume-preview-page-${pageIndex}`}
            className="relative overflow-hidden rounded-[2px] border border-slate-200/85 bg-white shadow-[0_24px_52px_-34px_rgba(15,23,42,0.58)]"
            style={{
              width: A4_WIDTH_PX * scale,
              height: A4_HEIGHT_PX * scale,
            }}
          >
            <iframe
              ref={pageIndex === 0 ? firstPageIframeRef : undefined}
              title={`Resume live preview page ${pageIndex + 1}`}
              srcDoc={html}
              style={{
                width: A4_WIDTH_PX,
                height: frameHeight,
                border: "none",
                display: "block",
                transform: `scale(${scale}) translateY(-${pageOffset}px)`,
                transformOrigin: "top left",
              }}
              sandbox="allow-same-origin"
              onLoad={pageIndex === 0 ? syncFrameMetrics : undefined}
            />

            {pageCount > 1 ? (
              <div className="pointer-events-none absolute right-2.5 top-2 rounded-full border border-slate-300/80 bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Page {pageIndex + 1}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
