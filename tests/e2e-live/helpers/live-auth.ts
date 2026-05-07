import { expect, type Page } from "@playwright/test";

export type LiveCredentials = {
  email: string;
  password: string;
};

export function getLiveCredentials(): LiveCredentials | null {
  const email = process.env.PLAYWRIGHT_LIVE_EMAIL?.trim();
  const password = process.env.PLAYWRIGHT_LIVE_PASSWORD?.trim();

  if (!email || !password) {
    return null;
  }

  return { email, password };
}

export async function loginWithCredentials(
  page: Page,
  credentials: LiveCredentials,
): Promise<void> {
  await page.goto("/login");

  await page.getByPlaceholder("you@example.com").fill(credentials.email);
  await page.locator("input[type='password']").first().fill(credentials.password);
  await page.locator("form button[type='submit']").click();

  await expect(page).toHaveURL(/\/dashboard\/templates|\/editor\/resume-restore/, {
    timeout: 30_000,
  });

  if (page.url().includes("/editor/resume-restore")) {
    await page.goto("/dashboard/templates");
  }
}
