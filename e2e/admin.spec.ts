import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Admin Content Management', () => {

    test('should create and publish a new course @smoke', async ({ page }) => {
        // 1. Login
        await loginAsAdmin(page);

        // 2. Clear navigation to Admin Courses
        await page.goto('/admin/courses');

        // 3. Create new course
        const courseTitle = `E2E Test Course ${Date.now()}`;
        await page.click('button:has-text("Novo Curso")');

        // Wait for redirect to editor
        await page.waitForURL(/\/admin\/courses\/.+/);

        // 4. Fill basic info
        const titleInput = page.locator('input[placeholder*="Mestrado"]');
        await titleInput.fill(courseTitle);
        await page.click('button:has-text("Salvar Alterações")');

        // Verify toast
        await expect(page.locator('text=Curso salvo com sucesso')).toBeVisible();

        // 5. Publish Course
        await page.click('button:has-text("Configurações")');

        // Find the toggle button that is inside the same section as "Publicar Curso"
        const publishToggle = page.locator('section', { hasText: 'Publicar Curso' }).locator('button').first();
        await publishToggle.click();

        await page.click('button:has-text("Salvar Configurações")');
        await expect(page.locator('text=Configurações salvas')).toBeVisible({ timeout: 15000 });

        // 6. Verify status badge in editor header
        await expect(page.locator('h1').locator('..').locator('text=open, text=Publicado').first()).toBeVisible();
    });

});
