import { test, expect } from '@playwright/test';
import { loginAsStudent } from './helpers';

test.describe('Student Portal Experience', () => {

    test('should see active enrollments and course content @smoke', async ({ page }) => {
        // 1. Login
        await loginAsStudent(page);

        // 2. Clear navigation to Courses
        await page.goto('/portal/courses');

        // 3. Check for course cards
        const courseCard = page.locator('a[href*="/portal/course/"]').first();
        await expect(courseCard).toBeVisible({ timeout: 15000 });

        // 4. Open Course
        const courseTitle = await courseCard.locator('h3').textContent();
        await courseCard.click();

        // 5. Verify Course Header
        await expect(page.locator('h1')).toContainText(courseTitle || '', { timeout: 15000 });
    });

});
