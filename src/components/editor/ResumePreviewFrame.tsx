"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ResumeData } from "@/types/resume";
import { renderResumeDocument } from "@/lib/templates/render";

const A4_WIDTH_PX = 794;
const A4_BASE_HEIGHT_PX = 1123;

type Props = {
  templateId: string;
  data: ResumeData;
};

export function ResumePreviewFrame({ templateId, data }: Props) {
  const documentHtml = useMemo(() => renderResumeDocument(templateId, data), [templateId, data]);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const [frameHeight, setFrameHeight] = useState(A4_BASE_HEIGHT_PX);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const pageCount = Math.max(1, Math.ceil(frameHeight / A4_BASE_HEIGHT_PX));
  const pageIndexes = useMemo(() => Array.from({ length: pageCount }, (_, index) => index), [pageCount]);

  const zoom = useMemo(() => {
    if (!viewportSize.width || !viewportSize.height) {
      return 0.72;
    }

    const horizontalFit = (viewportSize.width - 24) / A4_WIDTH_PX;
    const verticalFit = (viewportSize.height - 24) / A4_BASE_HEIGHT_PX;
    return Math.min(1, Math.max(0.42, Math.min(horizontalFit, verticalFit)));
  }, [viewportSize.height, viewportSize.width]);

  useEffect(() => {
    const viewportElement = viewportRef.current;
    if (!viewportElement) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }
      setViewportSize({
        width: Math.floor(entry.contentRect.width),
        height: Math.floor(entry.contentRect.height),
      });
    });

    observer.observe(viewportElement);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const syncHeight = () => {
      const iframe = iframeRef.current;
      const contentDocument = iframe?.contentDocument;
      if (!contentDocument) {
        return;
      }

      const nextHeight = Math.max(
        contentDocument.documentElement.scrollHeight,
        contentDocument.body.scrollHeight,
        A4_BASE_HEIGHT_PX,
      );
      setFrameHeight(nextHeight);
    };

    const first = window.setTimeout(syncHeight, 90);
    const second = window.setTimeout(syncHeight, 480);

    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
    };
  }, [documentHtml]);

  const syncHeightFromFrame = () => {
    const iframe = iframeRef.current;
    const contentDocument = iframe?.contentDocument;
    if (!contentDocument) {
      return;
    }

    const nextHeight = Math.max(
      contentDocument.documentElement.scrollHeight,
      contentDocument.body.scrollHeight,
      A4_BASE_HEIGHT_PX,
    );
    setFrameHeight(nextHeight);
  };

  return (
    <div className="relative h-full min-h-0">
      <div ref={viewportRef} className="h-full min-h-0 overflow-auto px-2 pt-2 pb-0 sm:px-3 sm:pt-3 sm:pb-1">
        <div className="flex min-h-full w-full items-start justify-center">
          <div className="flex flex-col items-center gap-3 pb-1">
            {pageIndexes.map((pageIndex) => (
              <div
                key={`resume-page-${pageIndex}`}
                className="relative overflow-hidden rounded-[2px] border border-slate-200/85 bg-white shadow-[0_24px_52px_-34px_rgba(15,23,42,0.58)]"
                style={{
                  width: `${A4_WIDTH_PX * zoom}px`,
                  height: `${A4_BASE_HEIGHT_PX * zoom}px`,
                }}
              >
                <iframe
                  ref={pageIndex === 0 ? iframeRef : undefined}
                  title={`Resume preview page ${pageIndex + 1}`}
                  srcDoc={documentHtml}
                  className="absolute left-0 top-0 block border-0 bg-white"
                  style={{
                    width: `${A4_WIDTH_PX}px`,
                    height: `${frameHeight}px`,
                    transform: `scale(${zoom}) translateY(-${pageIndex * A4_BASE_HEIGHT_PX}px)`,
                    transformOrigin: "top left",
                  }}
                  sandbox="allow-same-origin allow-popups"
                  onLoad={pageIndex === 0 ? syncHeightFromFrame : undefined}
                />

                <div className="pointer-events-none absolute right-2.5 top-2 rounded-full border border-slate-300/80 bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Page {pageIndex + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
