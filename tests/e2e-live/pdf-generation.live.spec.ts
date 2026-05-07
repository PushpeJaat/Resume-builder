import { expect, test } from "@playwright/test";

test.describe("live pdf generation", () => {
  test("guest flow prompts auth before PDF generation", async ({ page }) => {
    await page.goto("/editor");

    await page.getByRole("button", { name: "Download PDF" }).first().click();

    await expect(
      page.getByRole("heading", { name: "Sign in to save and download" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Create account" })).toBeVisible();
  });
});
