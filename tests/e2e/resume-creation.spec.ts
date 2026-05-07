import { expect, test } from "@playwright/test";
import { createAuthenticatedSession, mockAuthSession } from "./helpers/auth";

test.describe("resume creation", () => {
  test("creates a resume from editor landing and opens full editor", async ({
    page,
  }) => {
    await mockAuthSession(
      page,
      createAuthenticatedSession({
        id: "user-creator-1",
        email: "creator@example.com",
        name: "Resume Creator",
      }),
    );

    let capturedCreatePayload: Record<string, unknown> | null = null;

    await page.route(/\/api\/resumes$/, async (route) => {
      if (route.request().method() !== "POST") {
        await route.fallback();
        return;
      }

      capturedCreatePayload = route.request().postDataJSON() as Record<
        string,
        unknown
      >;

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "resume-e2e-created" }),
      });
    });

    await page.route("**/api/resumes/resume-e2e-created", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          resume: {
            id: "resume-e2e-created",
            title: "QA Engineer Resume",
            templateId: "modern-professional",
            data: {},
          },
        }),
      });
    });

    await page.goto("/editor");

    await page
      .getByPlaceholder("Product Designer Resume")
      .fill("QA Engineer Resume");
    await page.getByRole("button", { name: "Open Voice Editor" }).click();

    await expect(page).toHaveURL(/\/editor\/resume-e2e-created$/);
    expect(capturedCreatePayload).toEqual(
      expect.objectContaining({
        title: "QA Engineer Resume",
        templateId: expect.any(String),
        data: expect.any(Object),
      }),
    );
  });
});
