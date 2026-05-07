import { expect, test } from "@playwright/test";

test.describe("live resume creation", () => {
  test("guest flow prompts auth when trying to create a resume", async ({ page }) => {
    await page.goto("/editor");

    await page
      .getByPlaceholder("Product Designer Resume")
      .fill("Live E2E Resume Check");
    await page.getByRole("button", { name: "Open Voice Editor" }).click();

    await expect(
      page.getByRole("heading", { name: "Sign in to save and download" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  });
});
