"use client";

import { useMemo } from "react";
import type { ResumeData } from "@/types/resume";
import { ResumePreview } from "@/components/ResumePreview";
import { buildResumeLayout } from "@/lib/layout/buildResumeLayout";

type Props = {
  templateId: string;
  data: ResumeData;
};

export function ResumePreviewFrame({ templateId, data }: Props) {
  const layout = useMemo(() => buildResumeLayout(data, templateId), [data, templateId]);

  return (
    <div className="h-full min-h-0 overflow-auto px-2 pt-2 pb-0 sm:px-3 sm:pt-3 sm:pb-1">
      <div className="mx-auto w-fit">
        <ResumePreview layout={layout} />
      </div>
    </div>
  );
}
