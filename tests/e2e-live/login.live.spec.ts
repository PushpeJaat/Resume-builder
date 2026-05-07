import { expect, test } from "@playwright/test";

test.describe("live login", () => {
  test("shows error on invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByPlaceholder("you@example.com").fill("invalid-e2e@example.com");
    await page.locator("input[type='password']").first().fill("invalid-e2e-password");
    await page.locator("form button[type='submit']").click();

    await expect(
      page.getByText("Invalid email or password. Please try again."),
    ).toBeVisible();
  });
});
