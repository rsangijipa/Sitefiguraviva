import { test, expect } from "@playwright/test";

test.describe("Smoke Tests - Core Routes", () => {
  test.setTimeout(120000); // 2 minutes to allow for Next.js dev server compilation on first load

  test("smoke: home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Figura Viva/i);
  });

  test("smoke: public core routes are accessible", async ({ page }) => {
    const routes = [
      "/",
      "/auth",
      "/curso",
      "/blog",
      "/public-library",
      "/public-gallery",
    ];

    for (const route of routes) {
      const response = await page.goto(route);
      // Assert that the page returns a success status (200 OK or 3xx Redirect)
      expect(response?.ok()).toBeTruthy();
    }
  });
});

test("core public routes have one main landmark and unique main-content anchor", async ({
  page,
}) => {
  for (const route of [
    "/",
    "/auth",
    "/curso",
    "/blog",
    "/contato",
    "/termos",
  ]) {
    await page.goto(route);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("#main-content")).toHaveCount(1);
  }
});
test("authentication uses a fresh CSP nonce and hydrates under the policy", async ({
  page,
}) => {
  const violations: string[] = [];
  page.on("console", (message) => {
    // The isolated read-only API uses a separate loopback port, intentionally
    // excluded from the production connect-src policy. Keep all script errors.
    const fixtureConnection =
      /http:\/\/127\.0\.0\.1:\d+/.test(message.text()) &&
      /connect-src|Refused to connect/.test(message.text());
    if (
      message.type() === "error" &&
      /Content Security Policy|Refused to execute/.test(message.text()) &&
      !fixtureConnection
    )
      violations.push(message.text());
  });
  const response = await page.goto("/auth");
  const policy = response?.headers()["content-security-policy"] || "";
  const nonce = policy.match(/'nonce-([^']+)'/)?.[1];
  expect(nonce).toBeTruthy();
  const freshResponse = await page.request.get("/auth");
  expect(freshResponse.headers()["content-security-policy"]).not.toContain(
    `'nonce-${nonce}'`,
  );
  expect(
    policy.split(";").find((value) => value.trim().startsWith("script-src")),
  ).not.toContain("unsafe-inline");
  // Validate parser-inserted scripts in the actual server response. Trusted
  // Next runtime scripts added after hydration are allowed by strict-dynamic.
  const nonces = await page.evaluate(
    (html) =>
      Array.from(
        new DOMParser()
          .parseFromString(html, "text/html")
          .querySelectorAll("script"),
      )
        .filter(
          (e) =>
            e.getAttribute("src")?.includes("_next") ||
            e.textContent?.includes("self.__next_f"),
        )
        .map((e) => (e as HTMLScriptElement).nonce),
    await response!.text(),
  );
  expect(nonces.length).toBeGreaterThan(0);
  expect(nonces.every((value) => value === nonce)).toBeTruthy();
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await page.locator('input[type="email"]').fill("fixture@example.invalid");
  await expect(page.locator('input[type="email"]')).toHaveValue(
    "fixture@example.invalid",
  );
  expect(violations).toEqual([]);
});
