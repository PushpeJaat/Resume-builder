"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ResumeData } from "@/types/resume";
import { renderResumeDocument } from "@/lib/templates/render";

type Props = {
  templateId: string;
  data: ResumeData;
};

export function ResumePreviewFrame({ templateId, data }: Props) {
  const doc = useMemo(() => renderResumeDocument(templateId, data), [templateId, data]);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [frameHeight, setFrameHeight] = useState(1123);
  const previewScale = 0.72;

  useEffect(() => {
    const syncHeight = () => {
      const iframe = iframeRef.current;
      const contentDocument = iframe?.contentDocument;
      if (!contentDocument) return;
      const nextHeight = Math.max(
        contentDocument.documentElement.scrollHeight,
        contentDocument.body.scrollHeight,
        1123,
      );
      setFrameHeight(nextHeight);
    };

    const first = window.setTimeout(syncHeight, 80);
    const second = window.setTimeout(syncHeight, 500);
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
    };
  }, [doc]);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-slate-100/80 shadow-inner">
      <div className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm backdrop-blur">
        Live preview · matches PDF output
      </div>
      <div className="flex min-h-0 flex-1 justify-center overflow-auto p-4 pt-12">
        <div
          className="origin-top shadow-2xl transition-transform duration-300 ease-out"
          style={{
            width: "210mm",
            height: `${frameHeight * previewScale}px`,
            transform: `scale(${previewScale})`,
            transformOrigin: "top center",
          }}
        >
          <iframe
            ref={iframeRef}
            title="Resume preview"
            srcDoc={doc}
            className="block w-[210mm] rounded-sm border-0 bg-white"
            style={{ height: `${frameHeight}px` }}
            onLoad={() => {
              const iframe = iframeRef.current;
              const contentDocument = iframe?.contentDocument;
              if (!contentDocument) return;
              const nextHeight = Math.max(
                contentDocument.documentElement.scrollHeight,
                contentDocument.body.scrollHeight,
                1123,
              );
              setFrameHeight(nextHeight);
            }}
            sandbox="allow-same-origin allow-popups"
          />
        </div>
      </div>
    </div>
  );
}
