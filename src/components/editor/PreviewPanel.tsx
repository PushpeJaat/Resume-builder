"use client";

import { ResumePreviewFrame } from "@/components/editor/ResumePreviewFrame";
import { cn } from "@/lib/utils";
import type { ResumeData } from "@/types/resume";

type PreviewPanelProps = {
  templateId: string;
  data: ResumeData;
  className?: string;
};

export function PreviewPanel({ templateId, data, className }: PreviewPanelProps) {
  return (
    <section className={cn("min-h-0 h-full", className)}>
      <div className="min-h-0 h-full">
        <ResumePreviewFrame templateId={templateId} data={data} />
      </div>
    </section>
  );
}
