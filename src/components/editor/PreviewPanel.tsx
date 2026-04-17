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
    <section
      className={cn(
        "min-h-0 h-full w-full overflow-auto bg-slate-100 p-0 sm:p-2 flex justify-center items-start",
        className,
      )}
    >
      <div className="min-h-0 h-full w-full max-w-full flex justify-center">
        <ResumePreviewFrame templateId={templateId} data={data} />
      </div>
    </section>
  );
}
