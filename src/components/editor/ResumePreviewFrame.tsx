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

  const zoom = useMemo(() => {
    if (!viewportSize.width || !viewportSize.height) {
      return 0.72;
    }

    const horizontalFit = (viewportSize.width - 24) / A4_WIDTH_PX;
    const verticalFit = (viewportSize.height - 24) / A4_BASE_HEIGHT_PX;
    return Math.min(1, Math.max(0.42, Math.min(horizontalFit, verticalFit)));
  }, [viewportSize.height, viewportSize.width]);

  const zoomLabel = `${Math.round(zoom * 100)}%`;

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

  return (
    <div className="relative h-full min-h-0">
      <div className="pointer-events-none absolute right-2 top-2 z-10 rounded-full bg-slate-900/70 px-2 py-0.5 text-[10px] font-medium text-white/95 backdrop-blur sm:right-3 sm:top-3">
        {zoomLabel}
      </div>

      <div ref={viewportRef} className="h-full min-h-0 overflow-auto px-2 py-2 sm:px-3 sm:py-3">
        <div className="flex min-h-full w-full items-start justify-center sm:items-center">
          <div
            className="transition-[width,min-height] duration-300 ease-out"
            style={{
              width: `${A4_WIDTH_PX * zoom}px`,
              minHeight: `${A4_BASE_HEIGHT_PX * zoom}px`,
            }}
          >
            <div
              className="origin-top-left transition-transform duration-300 ease-out"
              style={{
                width: `${A4_WIDTH_PX}px`,
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
              }}
            >
              <iframe
                ref={iframeRef}
                title="Resume preview"
                srcDoc={documentHtml}
                className="block border-0 bg-white shadow-[0_22px_54px_-32px_rgba(15,23,42,0.55)]"
                style={{
                  width: `${A4_WIDTH_PX}px`,
                  height: `${frameHeight}px`,
                }}
                sandbox="allow-same-origin allow-popups"
                onLoad={() => {
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
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
