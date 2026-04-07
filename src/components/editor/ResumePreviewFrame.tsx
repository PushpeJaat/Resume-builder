"use client";

import { useMemo } from "react";
import type { ResumeData } from "@/types/resume";
import { renderResumeDocument } from "@/lib/templates/render";

type Props = {
  templateId: string;
  data: ResumeData;
};

export function ResumePreviewFrame({ templateId, data }: Props) {
  const doc = useMemo(() => renderResumeDocument(templateId, data), [templateId, data]);

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
            transform: "scale(0.72)",
            transformOrigin: "top center",
          }}
        >
          <iframe
            title="Resume preview"
            srcDoc={doc}
            className="block min-h-[297mm] w-[210mm] rounded-sm border-0 bg-white"
            sandbox="allow-same-origin allow-popups"
          />
        </div>
      </div>
    </div>
  );
}
