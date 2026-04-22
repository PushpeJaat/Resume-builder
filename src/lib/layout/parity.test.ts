import assert from "node:assert/strict";
import test from "node:test";
import { runTemplateParityChecks } from "./parityChecks";

test("layout preview page count equals generated PDF page count for all template fixtures", async () => {
  const results = await runTemplateParityChecks();

  const mismatches = results.flatMap((result) => {
    return result.fixtures
      .filter((fixture) => !fixture.pageCountMatches)
      .map((fixture) => {
        return `${result.templateId} / ${fixture.fixtureId}: preview=${fixture.previewPageCount}, pdf=${fixture.pdfPageCount}`;
      });
  });

  assert.equal(
    mismatches.length,
    0,
    `Found parity mismatches:\n${mismatches.join("\n")}`,
  );
});
