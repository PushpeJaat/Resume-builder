import { expect, test } from "@playwright/test";
import {
  getLiveCredentials,
  loginWithCredentials,
} from "./helpers/live-auth";

test.describe("live authenticated resume flows", () => {
  test("creates a resume and downloads a real PDF", async ({ page }) => {
    const credentials = getLiveCredentials();
    test.skip(
      !credentials,
      "Set PLAYWRIGHT_LIVE_EMAIL and PLAYWRIGHT_LIVE_PASSWORD to run authenticated live tests.",
    );

    if (!credentials) {
      return;
    }

    await loginWithCredentials(page, credentials);

    await page.goto("/editor");

    const title = `Live E2E Resume ${Date.now()}`;
    await page.getByPlaceholder("Product Designer Resume").fill(title);
    await page.getByRole("button", { name: "Open Voice Editor" }).click();

    await expect(page).toHaveURL(/\/editor\/[^/?#]+$/);
    await expect(page.getByRole("heading", { name: "Resume Editor" })).toBeVisible();

    const createOrderResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url().includes("/api/payments/cashfree/create-order"),
    );

    const pdfApiResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        /\/api\/resumes\/[^/]+\/pdf/.test(response.url()),
    );

    const downloadPromise = page.waitForEvent("download", { timeout: 120_000 });

    await page.getByRole("button", { name: "Download PDF" }).first().click();

    const createOrderResponse = await createOrderResponsePromise;
    expect(createOrderResponse.ok()).toBeTruthy();

    const createOrderPayload = (await createOrderResponse
      .json()
      .catch(() => null)) as { alreadyPaid?: unknown } | null;

    expect(createOrderPayload?.alreadyPaid).toBe(true);

    const pdfApiResponse = await pdfApiResponsePromise;
    expect(pdfApiResponse.ok()).toBeTruthy();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
  });
});
