import { expect, test } from "@playwright/test";
import { mockAuthSession } from "./helpers/auth";

test.describe("login", () => {
  test("shows an inline error for invalid credentials", async ({ page }) => {
    await mockAuthSession(page, null);

    await page.route("**/api/auth/csrf**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ csrfToken: "test-csrf-token" }),
      });
    });

    await page.route("**/api/auth/callback/credentials**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          url: "http://localhost:3000/login?error=CredentialsSignin",
        }),
      });
    });

    await page.goto("/login");

    await page.getByPlaceholder("you@example.com").fill("wrong@example.com");
    await page.locator("input[type='password']").first().fill("incorrect-password");

    const authRequest = page.waitForRequest(
      (request) =>
        request.method() === "POST" &&
        request.url().includes("/api/auth/callback/credentials"),
    );

    await page.locator("form button[type='submit']").click();

    await authRequest;

    await expect(
      page.getByText("Invalid email or password. Please try again."),
    ).toBeVisible();
  });
});
