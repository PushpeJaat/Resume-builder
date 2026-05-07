import { expect, test } from "@playwright/test";
import { mockAuthSession } from "./helpers/auth";

test.describe("homepage", () => {
  test("renders hero content and CTAs", async ({ page }) => {
    await mockAuthSession(page, null);

    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /Build and update your resume/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: /Build faster with AI voice-first resume editing/i,
      }),
    ).toBeVisible();

    await expect(
      page.getByRole("link", { name: "Try voice commands" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Browse templates" }),
    ).toBeVisible();
  });
});
