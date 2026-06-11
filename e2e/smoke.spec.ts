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
      "/login",
      "/signup",
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
