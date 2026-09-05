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
      "/instituto",
      "/instituto/fundadora",
      "/instituto/manifesto",
      "/formacoes",
      "/recursos",
      "/recursos/arvore-da-awareness",
      "/blog",
      "/public-library",
      "/public-gallery",
      "/auth",
    ];

    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status(), `${route} should return 2xx`).toBeLessThan(
        300,
      );
    }
  });
});
