import { expect, test } from "@playwright/test";

const publicRoutes = [
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

for (const route of publicRoutes) {
  test(`${route} preserves the public visual contract`, async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));

    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.status(), `${route} should return 2xx`).toBeLessThan(300);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toBeVisible();

    await page
      .waitForLoadState("networkidle", { timeout: 10_000 })
      .catch(() => {});

    const horizontalOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(
      horizontalOverflow,
      `${route} should not overflow horizontally`,
    ).toBeLessThanOrEqual(1);

    const brokenImages = await page
      .locator("img")
      .evaluateAll((images: HTMLImageElement[]) =>
        images
          .filter((image) => image.complete && image.naturalWidth === 0)
          .map((image) => image.getAttribute("src") || "unknown image"),
      );
    expect(brokenImages, `${route} should not render broken images`).toEqual(
      [],
    );
    expect(pageErrors, `${route} should not throw page errors`).toEqual([]);
    expect(consoleErrors, `${route} should not log browser errors`).toEqual([]);
  });
}
