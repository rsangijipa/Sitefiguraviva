import { test, expect } from "@playwright/test";
import { loginAsStudent } from "./helpers";
import { execFileSync } from "node:child_process";
import path from "node:path";

test.describe("EAD pilot: resume, progress and certificate", () => {
  test.skip(
    !process.env.E2E_COURSE_ID,
    "Configure an explicit isolated EAD pilot.",
  );
  // Completion consumes the fixture. Retries would no longer prove the transition.
  test.describe.configure({ retries: 0 });
  test.beforeAll(() => {
    execFileSync(
      process.execPath,
      [path.resolve(__dirname, "../scripts/e2e-preflight.mjs"), "--ead-pilot"],
      {
        env: process.env,
        windowsHide: true,
        timeout: 10_000,
      },
    );
  });

  test("persists the selected lesson and issues this course's certificate", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const courseId = process.env.E2E_COURSE_ID!;
    const courseTitle = process.env.E2E_COURSE_TITLE!;
    const lessonId = process.env.E2E_FINAL_LESSON_ID!;
    const lessonTitle = process.env.E2E_FINAL_LESSON_TITLE!;
    const lobby = `/portal/course/${encodeURIComponent(courseId)}`;

    await loginAsStudent(page);
    await page.goto(lobby);
    await expect(
      page.getByRole("heading", { name: courseTitle, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Certificado Indisponível", { exact: true }),
    ).toBeVisible();

    // The old resume target must differ so a missing write cannot pass using seeded data.
    await page
      .getByRole("button", { name: "Continuar Estudando", exact: true })
      .click();
    await expect(page).toHaveURL((url) =>
      Boolean(url.searchParams.get("lesson")),
    );
    expect(new URL(page.url()).searchParams.get("lesson")).not.toBe(lessonId);

    await page.goto(`${lobby}?tab=modules`);
    await page.getByText(lessonTitle, { exact: true }).click();
    await expect(page).toHaveURL(
      (url) => url.searchParams.get("lesson") === lessonId,
    );
    await expect(
      page.getByRole("heading", { name: lessonTitle, exact: true }),
    ).toBeVisible();
    const progress = page.getByTestId("lesson-sidebar-progress");
    await expect(progress).toBeVisible();
    const counts = (await progress.innerText()).match(/(\d+)\s*\/\s*(\d+)/);
    expect(counts, "Pilot must expose lesson progress").not.toBeNull();
    const completed = Number(counts![1]);
    const total = Number(counts![2]);
    expect(total).toBeGreaterThanOrEqual(2);
    expect(completed, "Only the final text lesson may remain incomplete").toBe(
      total - 1,
    );
    await expect(page.getByTestId("mark-lesson-complete")).toBeVisible();

    // Full navigation discards client state and reads persisted course data.
    await page.goto(lobby);
    await page
      .getByRole("button", { name: "Continuar Estudando", exact: true })
      .click();
    await expect(page).toHaveURL(
      (url) => url.searchParams.get("lesson") === lessonId,
    );
    await expect(
      page.getByRole("heading", { name: lessonTitle, exact: true }),
    ).toBeVisible();

    await page.getByTestId("mark-lesson-complete").click();
    const fullProgress = new RegExp(`${total}\\s*/\\s*${total}\\s*Aulas`);
    await expect(progress).toHaveText(fullProgress);
    await page.reload();
    await expect(progress).toHaveText(fullProgress);
    await expect(page.getByTestId("mark-lesson-complete")).toHaveCount(0);

    await page.goto(lobby);
    const issued = page.getByTestId("certificate-issued");
    const issue = page.getByTestId("issue-certificate-button");
    await expect(issue.or(issued)).toBeVisible();
    if (await issue.isVisible()) await issue.click();
    await expect(issued).toBeVisible();
    await expect(page.locator(`a[href="${lobby}/certificate"]`)).toBeVisible();
    await page.reload();
    await expect(issued).toBeVisible();

    await page.goto("/portal/certificates");
    const card = page.getByTestId("portal-certificate-card").filter({
      has: page.getByRole("heading", { name: courseTitle, exact: true }),
    });
    await expect(card).toHaveCount(1);
    await card.getByRole("button", { name: "Baixar", exact: true }).click();
    await expect(page).toHaveURL(/\/portal\/certificates\/[^/?#]+$/);
  });
});
