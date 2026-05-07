import type { Page } from "@playwright/test";

type PlanTier = "FREE" | "BASIC" | "ADVANCE";

export type MockSession = {
  user: {
    id: string;
    email: string;
    name: string;
    plan: PlanTier;
  };
  expires?: string;
};

const DEFAULT_SESSION_EXPIRY = "2999-01-01T00:00:00.000Z";

export function createAuthenticatedSession(
  overrides?: Partial<MockSession["user"]>,
): MockSession {
  return {
    user: {
      id: "user-e2e-1",
      email: "e2e@example.com",
      name: "E2E User",
      plan: "BASIC",
      ...overrides,
    },
    expires: DEFAULT_SESSION_EXPIRY,
  };
}

export async function mockAuthSession(
  page: Page,
  session: MockSession | null,
): Promise<void> {
  await page.route("**/api/auth/session**", async (route) => {
    if (session === null) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "null",
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ...session,
        expires: session.expires ?? DEFAULT_SESSION_EXPIRY,
      }),
    });
  });
}
