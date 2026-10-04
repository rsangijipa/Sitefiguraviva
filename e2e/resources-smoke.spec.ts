import { test, expect, type Page } from "@playwright/test";

async function openResource(page: Page, slug: string) {
  await page.goto(`/recursos/${slug}`);
  await page.getByRole("button", { name: "Recusar", exact: true }).click();
}

test.describe("Resources navigation and content", () => {
  test("Banco de Microcasos changes section and returns to the catalog", async ({ page }) => {
    await openResource(page, "banco-de-microcasos");
    const window = page.getByRole("region", { name: "Banco de Microcasos", exact: true });
    await expect(window).toBeVisible();
    const sections = page.getByRole("navigation", { name: "Seções do recurso" });
    await expect(sections.getByRole("button", { name: "Início", exact: true })).toHaveAttribute("aria-current", "page");
    await sections.getByRole("button", { name: "Minha exploração", exact: true }).click();
    await expect(sections.getByRole("button", { name: "Minha exploração", exact: true })).toHaveAttribute("aria-current", "page");
    await expect(window.getByRole("heading", { name: /O que permanece.*em campo/i })).toBeVisible();
    await page.getByRole("button", { name: "Voltar para Recursos", exact: true }).click();
    await expect(page).toHaveURL(/\/recursos$/);
    await expect(window).not.toBeVisible();
    await expect(page.getByRole("heading", { name: "O que você precisa agora?", exact: true })).toBeVisible();
    const group = page.getByRole("region", { name: "APRENDER", exact: true });
    await group.getByRole("link", { name: /^Banco de Microcasos\./ }).click();
    await expect(page).toHaveURL(/\/recursos\/banco-de-microcasos$/);
    await expect(window).toBeVisible();
  });

  test("Ciclo do Contato changes and resets the selected section", async ({ page }) => {
    await openResource(page, "ciclo-do-contato");
    const window = page.getByRole("region", { name: "Ciclo do Contato", exact: true });
    await expect(window).toBeVisible();
    const sections = page.getByRole("navigation", { name: "Seções do recurso" });
    await sections.getByRole("button", { name: "Guiado", exact: true }).click();
    await expect(sections.getByRole("button", { name: "Guiado", exact: true })).toHaveAttribute("aria-current", "page");
    await sections.getByRole("button", { name: "Início", exact: true }).click();
    await expect(sections.getByRole("button", { name: "Início", exact: true })).toHaveAttribute("aria-current", "page");
    await page.getByRole("button", { name: "Voltar para Recursos", exact: true }).click();
    await expect(page).toHaveURL(/\/recursos$/);
    await expect(window).not.toBeVisible();
  });

  test.describe("mobile viewport", () => {
    test.use({ viewport: { width: 360, height: 800 } });
    test("return control remains reachable at 360px", async ({ page }) => {
      await openResource(page, "banco-de-microcasos");
      const window = page.getByRole("region", { name: "Banco de Microcasos", exact: true });
      await expect(window).toBeVisible();
      const close = page.getByRole("button", { name: "Voltar para Recursos", exact: true });
      await expect(close).toBeInViewport();
      // Wait for the modal entry animation before measuring the touch target.
      await expect.poll(async () => {
        const box = await close.boundingBox();
        return Math.round(Math.min(box?.width ?? 0, box?.height ?? 0));
      }).toBeGreaterThanOrEqual(44);
      await close.click();
      await expect(page).toHaveURL(/\/recursos$/);
      await expect(window).not.toBeVisible();
    });
  });
});