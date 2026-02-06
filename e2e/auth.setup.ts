import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const authDir = path.join(__dirname, '../playwright/.auth');

setup('authenticate student', async ({ page }) => {
    if (!process.env.STUDENT_EMAIL || !process.env.STUDENT_PASSWORD) {
        throw new Error('STUDENT_EMAIL or STUDENT_PASSWORD not set');
    }

    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
    }

    await page.goto('/login');
    await page.waitForSelector('input[type="email"]', { state: 'visible' });
    await page.fill('input[type="email"]', process.env.STUDENT_EMAIL);
    await page.fill('input[type="password"]', process.env.STUDENT_PASSWORD);

    // Robust text-based locator for stability
    await page.click('button:has-text("Acessar Portal")');

    await page.waitForURL(url => url.pathname.startsWith('/portal'), { timeout: 30000 });
    await page.context().storageState({ path: path.join(authDir, 'student.json') });
});

setup('authenticate admin', async ({ page }) => {
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
        throw new Error('ADMIN_EMAIL or ADMIN_PASSWORD not set');
    }

    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
    }

    await page.goto('/admin/login');
    await page.waitForSelector('input[type="email"]', { state: 'visible' });
    await page.fill('input[type="email"]', process.env.ADMIN_EMAIL);
    await page.fill('input[type="password"]', process.env.ADMIN_PASSWORD);

    // Robust text-based locator for stability
    await page.click('button:has-text("Acessar Painel")');

    await page.waitForURL(url => url.pathname.startsWith('/admin') && !url.pathname.includes('login'), { timeout: 30000 });
    await page.context().storageState({ path: path.join(authDir, 'admin.json') });
});
