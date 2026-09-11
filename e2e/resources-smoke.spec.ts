import { test, expect } from "@playwright/test";

test.describe("Resources shell (ResourceNavigation + ResourceWindow)", () => {
  test.setTimeout(180000);

  test("opens Banco de Microcasos: shell renders with tabs, close button, and no leftover Operation header", async ({
    page,
  }) => {
    await page.goto("/recursos");
    await expect(
      page.getByRole("button", { name: /Banco de Microcasos/ }).first(),
    ).toBeVisible({ timeout: 60000 });

    await page
      .getByRole("button", { name: /Banco de Microcasos/ })
      .first()
      .click();

    const window = page.getByRole("region", { name: "Banco de Microcasos" });
    await expect(window).toBeVisible({ timeout: 30000 });

    // Navigation card above the window
    await expect(
      page.getByRole("button", { name: /voltar para recursos/i }),
    ).toBeVisible();
    const tablist = page.getByRole("tablist");
    await expect(tablist).toBeVisible();
    await expect(tablist.getByRole("tab", { name: "Início" })).toBeVisible();
    await expect(
      tablist.getByRole("tab", { name: "Minha exploração" }),
    ).toBeVisible();

    // Window header: ONLY the close button (no title, no back button inside)
    const closeButton = page.getByRole("button", {
      name: "Fechar Banco de Microcasos",
    });
    await expect(closeButton).toBeVisible();
    await expect(page.getByRole("button", { name: "Voltar" })).toHaveCount(0);

    // Tab switch navigates inside the app
    await tablist.getByRole("tab", { name: "Minha exploração" }).click();
    await expect(
      tablist.getByRole("tab", { name: "Minha exploração" }),
    ).toHaveAttribute("aria-selected", "true");
    await expect(
      page.getByRole("heading", { name: /Minha exploração/i }),
    ).toBeVisible();

    // Close button exits the experience
    await closeButton.click();
    await expect(window).not.toBeVisible();
  });

  test("opens Ciclo do Contato: tab switching updates the window scroll target", async ({
    page,
  }) => {
    await page.goto("/recursos");
    await expect(
      page.getByRole("button", { name: /Ciclo del Contato/ }).first(),
    ).toBeVisible({ timeout: 60000 });

    await page
      .getByRole("button", { name: /Ciclo del Contato/ })
      .first()
      .click();

    const window = page.getByRole("region", { name: "Ciclo del Contato" });
    await expect(window).toBeVisible({ timeout: 30000 });

    const tablist = page.getByRole("tablist");
    await expect(tablist.getByRole("tab", { name: "Guiado" })).toBeVisible();

    await tablist.getByRole("tab", { name: "Guiado" }).click();
    await expect(tablist.getByRole("tab", { name: "Guiado" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    // Re-select Início resets selection state
    await tablist.getByRole("tab", { name: "Início" }).click();
    await expect(tablist.getByRole("tab", { name: "Início" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await page
      .getByRole("button", { name: "Fechar Ciclo del Contato" })
      .click();
    await expect(window).not.toBeVisible();
  });

  test.describe("mobile viewport", () => {
    test.use({ viewport: { width: 360, height: 800 } });

    test("shell stays usable and close button is reachable at 360px", async ({
      page,
    }) => {
      await page.goto("/recursos");
      await expect(
        page.getByRole("button", { name: /Banco de Microcasos/ }).first(),
      ).toBeVisible({ timeout: 60000 });

      await page
        .getByRole("button", { name: /Banco de Microcasos/ })
        .first()
        .click();

      const window = page.getByRole("region", { name: "Banco de Microcasos" });
      await expect(window).toBeVisible({ timeout: 30000 });
      await expect(
        page.getByRole("button", { name: "Fechar Banco de Microcasos" }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: /voltar para recursos/i }),
      ).toBeVisible();

      await page
        .getByRole("button", { name: "Fechar Banco de Microcasos" })
        .click();
      await expect(window).not.toBeVisible();
    });
  });
});
