import { test as setup, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

const authDir = path.join(__dirname, "../playwright/.auth");

setup("authenticate student", async ({ page }) => {
  setup.skip(
    !process.env.STUDENT_EMAIL || !process.env.STUDENT_PASSWORD,
    "Set STUDENT_EMAIL and STUDENT_PASSWORD to run the student journeys.",
  );

  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  await page.goto("/auth");
  await page.waitForSelector('input[type="email"]', { state: "visible" });
  await page.fill('input[type="email"]', process.env.STUDENT_EMAIL);
  await page.fill('input[type="password"]', process.env.STUDENT_PASSWORD);

  await page.click('button:has-text("Entrar")');

  // Wait for redirect or error
  try {
    await page.waitForURL((url) => url.pathname.startsWith("/portal"), {
      timeout: 10000,
    });
  } catch (e) {
    // Find error message
    const errorText = await page
      .locator('div[class*="bg-red-50"]')
      .textContent()
      .catch(() => null);

    if (
      errorText?.includes("incorretos") ||
      errorText?.includes("não encontrado")
    ) {
      console.log("User not found or wrong password, attempting signup...");

      // Toggle to signup mode
      await page.click('button:has-text("Cadastre-se")');

      // Fill signup specific fields - using robust label-to-input association
      await page
        .locator('div:has(label:has-text("Nome Completo")) input')
        .fill("Student Test");
      await page
        .locator('div:has(label:has-text("Telefone (WhatsApp)")) input')
        .fill("(11) 99999-9999");

      // Re-fill email and password (just in case they were cleared by mode switch)
      await page
        .locator('div:has(label:has-text("E-mail")) input')
        .fill(process.env.STUDENT_EMAIL);
      await page
        .locator('div:has(label:has-text("Senha")) input')
        .fill(process.env.STUDENT_PASSWORD);

      // Accounts are now bound to a course: the submit button stays disabled
      // until one is picked, so the old flow clicked a dead button and timed
      // out. Pick the first real option.
      const courseSelect = page.locator("#course-interest");
      if ((await courseSelect.count()) === 0) {
        throw new Error(
          "No open course to sign up for, so a student account cannot be created " +
            "through the public form. Create the STUDENT_EMAIL account manually.",
        );
      }

      const firstCourseValue = await courseSelect
        .locator("option:not([value=''])")
        .first()
        .getAttribute("value");

      if (!firstCourseValue) {
        throw new Error(
          "The course selector has no published course, so sign-up cannot complete. " +
            "Publish a course or create the STUDENT_EMAIL account manually.",
        );
      }

      await courseSelect.selectOption(firstCourseValue);

      // Click "Criar Conta"
      await page.click('button:has-text("Criar Conta")');

      // Sign-up continues into the enrollment it was made for, so the landing
      // page is /inscricao/<courseId>; a returning session still lands on
      // /portal. Either one means the account exists and is signed in.
      await page.waitForURL(
        (url) =>
          url.pathname.startsWith("/portal") ||
          url.pathname.startsWith("/inscricao"),
        { timeout: 40000 },
      );
    } else {
      throw new Error(
        `Login failed and no auto-signup possible. Error: ${errorText?.trim() || "Unknown"}`,
      );
    }
  }

  await page
    .context()
    .storageState({ path: path.join(authDir, "student.json") });
});

setup("authenticate admin", async ({ page }) => {
  setup.skip(
    !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD,
    "Set ADMIN_EMAIL and ADMIN_PASSWORD to run the admin journeys.",
  );

  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  await page.goto("/admin/login");
  await page.waitForSelector('input[type="email"]', { state: "visible" });
  await page.fill('input[type="email"]', process.env.ADMIN_EMAIL);
  await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD);

  // Robust text-based locator for stability
  await page.click('button:has-text("Acessar Painel")');

  await page.waitForURL(
    (url) =>
      url.pathname.startsWith("/admin") && !url.pathname.includes("login"),
    { timeout: 30000 },
  );
  await page.context().storageState({ path: path.join(authDir, "admin.json") });
});
