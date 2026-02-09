import { test, expect } from "@playwright/test";

test("simple test", async ({ page }) => {
  console.log("Running simple test...");
  await page.goto("https://example.com");
  await expect(page).toHaveTitle(/Example/);
  console.log("Simple test passed!");
});
