import { Page, expect } from '@playwright/test';

export async function loginAsStudent(page: Page) {
    if (!process.env.STUDENT_EMAIL || !process.env.STUDENT_PASSWORD) {
        throw new Error('STUDENT_EMAIL or STUDENT_PASSWORD not set');
    }

    await page.goto('/login');

    // Check if we need to login
    if (page.url().includes('/login')) {
        await page.waitForSelector('input[type="email"]', { state: 'visible' });
        await page.fill('input[type="email"]', process.env.STUDENT_EMAIL);
        await page.fill('input[type="password"]', process.env.STUDENT_PASSWORD);

        // Use text-based locator for better reliability across designs
        const loginButton = page.locator('button:has-text("Acessar Portal")');
        await loginButton.click();

        // Wait for any portal page to settle
        await page.waitForURL(url => url.pathname.startsWith('/portal'), { timeout: 30000 });
    }

    // Final check for portal UI
    await page.waitForSelector('nav, main', { state: 'visible' });
    await expect(page).toHaveURL(/\/portal/);
}

export async function loginAsAdmin(page: Page) {
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
        throw new Error('ADMIN_EMAIL or ADMIN_PASSWORD not set');
    }

    await page.goto('/admin/login');

    // Check if we need to login
    if (page.url().includes('/admin/login')) {
        await page.waitForSelector('input[type="email"]', { state: 'visible' });
        await page.fill('input[type="email"]', process.env.ADMIN_EMAIL);
        await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD);

        // Use text-based locator
        const loginButton = page.locator('button:has-text("Acessar Painel")');
        await loginButton.click();

        // Wait for any admin page (excluding login) to settle
        await page.waitForURL(url => url.pathname.startsWith('/admin') && !url.pathname.includes('login'), { timeout: 30000 });
    }

    // Final check for admin UI
    await page.waitForSelector('nav, main, h1', { state: 'visible' });
    await expect(page).toHaveURL(/\/admin/);
}
