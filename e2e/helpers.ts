import { Page, expect } from "@playwright/test";

/**
 * The authenticated journeys need real accounts, which only exist where
 * someone configured them. Throwing when they are absent made the whole e2e
 * command fail, so CI could never go green and the public smoke tests never
 * got a chance to report. Specs gate on these flags and skip instead.
 */
export const HAS_STUDENT_CREDENTIALS = Boolean(
  process.env.STUDENT_EMAIL && process.env.STUDENT_PASSWORD,
);

export const HAS_ADMIN_CREDENTIALS = Boolean(
  process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD,
);

export const MISSING_STUDENT_CREDENTIALS =
  "Set STUDENT_EMAIL and STUDENT_PASSWORD to run the student journeys.";

export const MISSING_ADMIN_CREDENTIALS =
  "Set ADMIN_EMAIL and ADMIN_PASSWORD to run the admin journeys.";

export async function loginAsStudent(page: Page) {
  if (!process.env.STUDENT_EMAIL || !process.env.STUDENT_PASSWORD) {
    throw new Error("STUDENT_EMAIL or STUDENT_PASSWORD not set");
  }

  await page.goto("/auth");

  // Check if we need to login
  if (page.url().includes("/auth")) {
    await page.waitForSelector('input[type="email"]', { state: "visible" });
    await page.fill('input[type="email"]', process.env.STUDENT_EMAIL);
    await page.fill('input[type="password"]', process.env.STUDENT_PASSWORD);

    // Use text-based locator for better reliability across designs
    const loginButton = page.locator('button:has-text("Entrar")');
    await loginButton.click();

    // Wait for any portal page to settle
    await page.waitForURL((url) => url.pathname.startsWith("/portal"), {
      timeout: 30000,
    });
  }

  // Final check for portal UI
  await page.waitForSelector("nav, main", { state: "visible" });
  await expect(page).toHaveURL(/\/portal/);
}

export async function loginAsAdmin(page: Page) {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_EMAIL or ADMIN_PASSWORD not set");
  }

  await page.goto("/admin/login");

  // Check if we need to login
  if (page.url().includes("/admin/login")) {
    await page.waitForSelector('input[type="email"]', { state: "visible" });
    await page.fill('input[type="email"]', process.env.ADMIN_EMAIL);
    await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD);

    // Use text-based locator
    const loginButton = page.locator('button:has-text("Acessar Painel")');
    await loginButton.click();

    // Wait for any admin page (excluding login) to settle
    await page.waitForURL(
      (url) =>
        url.pathname.startsWith("/admin") && !url.pathname.includes("login"),
      { timeout: 30000 },
    );
  }

  // Final check for admin UI
  await page.waitForSelector("nav, main, h1", { state: "visible" });
  await expect(page).toHaveURL(/\/admin/);
}
