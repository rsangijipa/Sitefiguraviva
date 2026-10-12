import { test, expect, type Page } from "@playwright/test";

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.getByRole("button", { name: "Recusar", exact: true }).click();
}

test.describe("Resources catalog and experiences", () => {
  test("catalog filters by category and opens a resource", async ({ page }) => {
    await open(page, "/recursos");
    const filters = page.getByRole("group", { name: "Filtrar por categoria" });
    await filters.getByRole("button", { name: /^Pausar/ }).click();
    await expect(filters.getByRole("button", { name: /^Pausar/ })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("heading", { name: "Perceber", exact: true })).toHaveCount(0);
    await page.getByRole("link", { name: "Abrir recurso: Igarapé" }).click();
    await expect(page).toHaveURL(/\/recursos\/igarape$/);
    await expect(page.getByRole("heading", { level: 1, name: "Igarapé" })).toBeVisible();
    await page.getByRole("link", { name: "Voltar para recursos" }).click();
    await expect(page).toHaveURL(/\/recursos$/);
  });

  test("legacy alias resolves to the canonical resource and mode", async ({ page }) => {
    await open(page, "/recursos/lago");
    await expect(page).toHaveURL(/\/recursos\/igarape\?modo=agua$/);
    await expect(page.getByText("Modo selecionado:")).toContainText("Água");
  });

  test("global floating controls stay available inside a resource", async ({ page }) => {
    await open(page, "/recursos/figura-e-fundo");
    const options = page.getByRole("button", { name: "Mais opções: tema" });
    await expect(options).toBeVisible();
    await options.click();
    await expect(page.getByRole("region", { name: "Aparência" })).toBeVisible();
    await page.keyboard.press("Escape");

    const scroller = page.locator("[data-scroll-root]");
    await scroller.evaluate((element) => element.scrollTo({ top: element.scrollHeight }));
    const backToTop = page.getByRole("button", { name: "Voltar ao topo da página" });
    await expect(backToTop).toBeVisible();
    await backToTop.click();
    await expect.poll(() => scroller.evaluate((element) => element.scrollTop)).toBe(0);
  });

  test.describe("mobile viewport", () => {
    test.use({ viewport: { width: 360, height: 800 } });
    test("return control remains reachable at 360px", async ({ page }) => {
      await open(page, "/recursos/igarape");
      const back = page.getByRole("link", { name: "Voltar para recursos" });
      await expect(back).toBeInViewport();
      const box = await back.boundingBox();
      expect(Math.round(Math.min(box?.width ?? 0, box?.height ?? 0))).toBeGreaterThanOrEqual(44);
      await back.click();
      await expect(page).toHaveURL(/\/recursos$/);
    });
  });
});
