"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ResumePreview } from "@/components/ResumePreview";
import { ResumePreviewFrame } from "@/components/editor/ResumePreviewFrame";
import { buildResumeLayout } from "@/lib/layout/buildResumeLayout";
import { shouldUseLayoutEngine } from "@/lib/templates/registry";
import { cn } from "@/lib/utils";
import type { ResumeData } from "@/types/resume";

type PreviewPanelProps = {
  templateId: string;
  data: ResumeData;
  className?: string;
};

function LayoutPreviewPanel({ templateId, data }: Omit<PreviewPanelProps, "className">) {
  const layout = useMemo(() => buildResumeLayout(data, templateId), [data, templateId]);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

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

      const nextScale = entry.contentRect.width / layout.page.width;
      setScale(Math.max(0.35, Math.min(1.35, nextScale)));
    });

    observer.observe(viewport);
    return () => observer.disconnect();
  }, [layout.page.width]);

  return (
    <div className="h-full min-h-0 overflow-auto px-2 pt-2 pb-0 sm:px-3 sm:pt-3 sm:pb-1">
      <div ref={viewportRef} className="mx-auto w-full max-w-[794px]">
        <ResumePreview layout={layout} scale={scale} />
      </div>
    </div>
  );
}

export function PreviewPanel({ templateId, data, className }: PreviewPanelProps) {
  const useLayoutEngine = shouldUseLayoutEngine(templateId);

  return (
    <section className={cn("min-h-0 h-full", className)}>
      <div className="min-h-0 h-full">
        {useLayoutEngine ? (
          <LayoutPreviewPanel templateId={templateId} data={data} />
        ) : (
          <ResumePreviewFrame templateId={templateId} data={data} />
        )}
      </div>
    </section>
  );
}
