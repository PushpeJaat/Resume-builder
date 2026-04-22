import { PDFDocument } from "pdf-lib";
import type { ResumeLayout } from "@/shared/layoutSchema";
import { generatePDF } from "@/lib/pdf/generatePDF";
import {
  getTemplateMeta,
  getTemplateRenderEngine,
  TEMPLATES,
} from "@/lib/templates/registry";
import { buildResumeLayout } from "./buildResumeLayout";
import { PARITY_FIXTURES, type ParityFixture } from "./parityFixtures";

export type ParityFixtureResult = {
  fixtureId: string;
  fixtureLabel: string;
  previewPageCount: number;
  pdfPageCount: number;
  pageCountMatches: boolean;
};

export type TemplateParityResult = {
  templateId: string;
  templateName: string;
  renderEngine: "html" | "layout";
  fixtures: ParityFixtureResult[];
  allFixturesMatched: boolean;
};

export function getPreviewPageCount(layout: ResumeLayout): number {
  const maxPageIndex = layout.elements.reduce((max, element) => Math.max(max, element.pageIndex), 0);
  return maxPageIndex + 1;
}

async function runFixtureParityCheck(templateId: string, fixture: ParityFixture): Promise<ParityFixtureResult> {
  const layout = buildResumeLayout(fixture.data, templateId);
  const previewPageCount = getPreviewPageCount(layout);
  const pdfBytes = await generatePDF(layout);
  const pdf = await PDFDocument.load(pdfBytes);
  const pdfPageCount = pdf.getPageCount();

  return {
    fixtureId: fixture.id,
    fixtureLabel: fixture.label,
    previewPageCount,
    pdfPageCount,
    pageCountMatches: previewPageCount === pdfPageCount,
  };
}

export async function runTemplateParityChecks(options?: {
  templateIds?: string[];
  fixtures?: ParityFixture[];
}): Promise<TemplateParityResult[]> {
  const templateIds = options?.templateIds ?? TEMPLATES.map((template) => template.id);
  const fixtures = options?.fixtures ?? PARITY_FIXTURES;

  const results: TemplateParityResult[] = [];

  for (const templateId of templateIds) {
    const templateMeta = getTemplateMeta(templateId);

    if (!templateMeta) {
      continue;
    }

    const fixtureResults: ParityFixtureResult[] = [];
    for (const fixture of fixtures) {
      fixtureResults.push(await runFixtureParityCheck(templateId, fixture));
    }

    results.push({
      templateId,
      templateName: templateMeta.name,
      renderEngine: getTemplateRenderEngine(templateId),
      fixtures: fixtureResults,
      allFixturesMatched: fixtureResults.every((fixture) => fixture.pageCountMatches),
    });
  }

  return results;
}
