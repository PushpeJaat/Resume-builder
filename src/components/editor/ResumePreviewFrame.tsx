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
    <div
      ref={viewportRef}
      className="relative h-full min-h-0 w-full max-w-full sm:overflow-visible overflow-auto sm:flex block justify-center items-start"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <div
        style={{
          width: A4_WIDTH_PX,
          minWidth: "100%",
          transform: `scale(${zoom})`,
          transformOrigin: "top center",
          transition: "transform 0.2s cubic-bezier(.4,0,.2,1)",
        }}
      >
        <iframe
          ref={iframeRef}
          srcDoc={documentHtml}
          title="Resume preview"
          style={{
            width: "100%",
            height: frameHeight,
            border: "none",
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 16px 0 rgba(15,23,42,0.10)",
          }}
          className="block w-full rounded-xl shadow-md"
        />
      </div>
    </div>
  );
}
