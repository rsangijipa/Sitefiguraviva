import { test, expect } from '@playwright/test';

test('smoke: home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Figura Viva/i);
});

test('smoke: public routes are accessible', async ({ page }) => {
    const routes = ['/', '/blog', '/cursos']; // Add other public routes

    for (const route of routes) {
        const response = await page.goto(route);
        expect(response?.ok()).toBeTruthy();
    }
});
