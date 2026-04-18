"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ResumeData } from "@/types/resume";
import { renderResumeDocument } from "@/lib/templates/render";

const A4_WIDTH_PX = 794;
const A4_BASE_HEIGHT_PX = 1123;
const CONTINUATION_TOP_INSET_PX = 28;
const CONTINUATION_BOTTOM_INSET_PX = 28;
const DEFAULT_LINE_HEIGHT_PX = 22;
const SINGLE_PAGE_EPSILON_PX = 6;

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
  const [lineHeightPx, setLineHeightPx] = useState(DEFAULT_LINE_HEIGHT_PX);

  const safeLineHeightPx = useMemo(() => {
    const normalized = Math.round(lineHeightPx);
    if (!Number.isFinite(normalized)) {
      return DEFAULT_LINE_HEIGHT_PX;
    }
    return Math.max(14, Math.min(40, normalized));
  }, [lineHeightPx]);

  const continuationStartPx = useMemo(() => {
    const snapped = Math.floor(A4_BASE_HEIGHT_PX / safeLineHeightPx) * safeLineHeightPx;
    return Math.max(safeLineHeightPx, snapped);
  }, [safeLineHeightPx]);

  const continuationStepPx = useMemo(() => {
    const usableHeight = A4_BASE_HEIGHT_PX - CONTINUATION_TOP_INSET_PX - CONTINUATION_BOTTOM_INSET_PX;
    const snapped = Math.floor(usableHeight / safeLineHeightPx) * safeLineHeightPx;
    return Math.max(safeLineHeightPx, snapped);
  }, [safeLineHeightPx]);

  const pageCount = useMemo(() => {
    if (frameHeight <= A4_BASE_HEIGHT_PX + SINGLE_PAGE_EPSILON_PX) {
      return 1;
    }

    const remainingHeight = Math.max(frameHeight - continuationStartPx, 0);
    const continuationPages = Math.max(1, Math.ceil(remainingHeight / continuationStepPx));
    return 1 + continuationPages;
  }, [continuationStartPx, continuationStepPx, frameHeight]);

  const pageOffsets = useMemo(
    () =>
      Array.from({ length: pageCount }, (_, pageIndex) => {
        if (pageIndex === 0) {
          return 0;
        }
        return continuationStartPx + (pageIndex - 1) * continuationStepPx;
      }),
    [continuationStartPx, continuationStepPx, pageCount],
  );

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

  const syncFrameMetrics = useCallback(() => {
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

    const styleTarget = contentDocument.body ?? contentDocument.documentElement;
    const resolvedLineHeight = Number.parseFloat(window.getComputedStyle(styleTarget).lineHeight);
    if (Number.isFinite(resolvedLineHeight) && resolvedLineHeight > 0) {
      setLineHeightPx(resolvedLineHeight);
    }
  }, []);

  useEffect(() => {
    const first = window.setTimeout(syncFrameMetrics, 90);
    const second = window.setTimeout(syncFrameMetrics, 480);

    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
    };
  }, [documentHtml, syncFrameMetrics]);

  return (
    <div className="relative h-full min-h-0">
      <div ref={viewportRef} className="h-full min-h-0 overflow-auto px-2 pt-2 pb-0 sm:px-3 sm:pt-3 sm:pb-1">
        <div className="flex min-h-full w-full items-start justify-center">
          <div className="flex flex-col items-center gap-3 pb-1">
            {pageOffsets.map((pageOffset, pageIndex) => {
              const isFirstPage = pageIndex === 0;
              const pageTopInset = isFirstPage ? 0 : CONTINUATION_TOP_INSET_PX;
              const pageBottomInset = isFirstPage ? 0 : CONTINUATION_BOTTOM_INSET_PX;

              return (
                <div
                  key={`resume-page-${pageIndex}`}
                  className="relative overflow-hidden rounded-[2px] border border-slate-200/85 bg-white shadow-[0_24px_52px_-34px_rgba(15,23,42,0.58)]"
                  style={{
                    width: `${A4_WIDTH_PX * zoom}px`,
                    height: `${A4_BASE_HEIGHT_PX * zoom}px`,
                  }}
                >
                  <div
                    className="absolute inset-x-0 overflow-hidden"
                    style={{
                      top: `${pageTopInset * zoom}px`,
                      bottom: `${pageBottomInset * zoom}px`,
                    }}
                  >
                    <iframe
                      ref={isFirstPage ? iframeRef : undefined}
                      title={`Resume preview page ${pageIndex + 1}`}
                      srcDoc={documentHtml}
                      className="absolute left-0 top-0 block border-0 bg-white"
                      style={{
                        width: `${A4_WIDTH_PX}px`,
                        height: `${frameHeight}px`,
                        transform: `scale(${zoom}) translateY(-${pageOffset}px)`,
                        transformOrigin: "top left",
                      }}
                      sandbox="allow-same-origin allow-popups"
                      onLoad={isFirstPage ? syncFrameMetrics : undefined}
                    />
                  </div>

                  {pageCount > 1 ? (
                    <div className="pointer-events-none absolute right-2.5 top-2 rounded-full border border-slate-300/80 bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Page {pageIndex + 1}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
