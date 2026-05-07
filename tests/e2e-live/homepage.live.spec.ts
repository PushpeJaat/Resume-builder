import { expect, test } from "@playwright/test";

test.describe("live homepage", () => {
  test("renders core landing content", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /Build and update your resume/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Try voice commands" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Browse templates" }),
    ).toBeVisible();
  });
});
