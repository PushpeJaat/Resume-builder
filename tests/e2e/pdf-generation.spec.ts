import { expect, test } from "@playwright/test";
import { createAuthenticatedSession, mockAuthSession } from "./helpers/auth";

test.describe("pdf generation", () => {
  test("downloads PDF when payment is already active", async ({ page }) => {
    await mockAuthSession(
      page,
      createAuthenticatedSession({
        id: "user-pdf-1",
        email: "pdf@example.com",
        name: "PDF User",
      }),
    );

    await page.route("**/api/resumes/resume-pdf-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          resume: {
            id: "resume-pdf-1",
            title: "QA Engineer Resume",
            templateId: "modern-professional",
            data: {},
          },
        }),
      });
    });

    await page.route("**/api/payments/cashfree/create-order", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ alreadyPaid: true }),
      });
    });

    await page.route("**/api/resumes/resume-pdf-1/pdf", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/pdf",
        body: Buffer.from("%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF"),
      });
    });

    await page.goto("/editor/resume-pdf-1");

    await expect(page.getByRole("heading", { name: "Resume Editor" })).toBeVisible();

    const orderRequest = page.waitForRequest(
      (request) =>
        request.method() === "POST" &&
        request.url().includes("/api/payments/cashfree/create-order"),
    );
    const pdfRequest = page.waitForRequest(
      (request) =>
        request.method() === "POST" &&
        request.url().includes("/api/resumes/resume-pdf-1/pdf"),
    );
    const downloadPromise = page.waitForEvent("download");

    await page.getByRole("button", { name: "Download PDF" }).first().click();

    await orderRequest;
    await pdfRequest;

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("QA Engineer Resume.pdf");

    await expect(page.getByText("Resume downloaded.")).toBeVisible();
  });
});
