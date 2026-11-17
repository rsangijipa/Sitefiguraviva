import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { loginAsStudent } from "./helpers";

type Fixture = {
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  privateText: string;
};
type GateFixtures = Record<"active" | "pending" | "expired" | "draft", Fixture>;
const fixturePath = process.env.E2E_ENROLLMENT_FIXTURE;
const fixtures: GateFixtures | undefined = fixturePath
  ? JSON.parse(readFileSync(fixturePath, "utf8"))
  : undefined;

// These are real read-only browser journeys against explicitly provisioned staging.
// Local action/guard transitions are covered separately in enrollment-access-lifecycle.test.ts.
test.describe("Enrollment access with explicit fixtures", () => {
  test.skip(
    !fixtures,
    "Configure E2E_ENROLLMENT_FIXTURE in isolated staging; these journeys are not validated locally.",
  );
  test.beforeAll(() => {
    execFileSync(
      process.execPath,
      [path.resolve(__dirname, "../scripts/e2e-preflight.mjs")],
      {
        env: process.env,
        windowsHide: true,
        timeout: 10000,
      },
    );
    if (!/^[a-f0-9]{7,40}$/.test(process.env.E2E_RELEASE_SHA ?? ""))
      throw new Error("Configure E2E_RELEASE_SHA for the version under test");
    if (
      !process.env.SECOND_STUDENT_EMAIL ||
      !process.env.SECOND_STUDENT_PASSWORD
    )
      throw new Error("Configure the second isolated student account");
    if (process.env.SECOND_STUDENT_EMAIL === process.env.STUDENT_EMAIL)
      throw new Error("The second student must be a distinct account");
    for (const name of ["active", "pending", "expired", "draft"] as const) {
      const fixture = fixtures?.[name];
      if (
        !fixture ||
        ![fixture.courseId, fixture.lessonId].every((id) =>
          /^[A-Za-z0-9_-]{1,128}$/.test(id),
        ) ||
        !fixture.lessonTitle?.trim() ||
        !fixture.privateText?.trim()
      )
        throw new Error(`Invalid enrollment fixture: ${name}`);
    }
    if (
      new Set(Object.values(fixtures!).map((fixture) => fixture.courseId))
        .size !== 4
    )
      throw new Error("Each enrollment state needs a distinct fixture course");
  });
  test.beforeEach(async ({ page }, info) => {
    info.annotations.push({
      type: "release",
      description: process.env.E2E_RELEASE_SHA!,
    });
    await loginAsStudent(page);
  });

  test("an active enrollment can read its published lesson", async ({
    page,
  }) => {
    const fixture = fixtures!.active;
    await page.goto(
      `/portal/course/${fixture.courseId}/lesson/${fixture.lessonId}`,
    );
    await expect(
      page.getByRole("heading", { name: fixture.lessonTitle, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(fixture.privateText, { exact: true }),
    ).toBeVisible();
  });
  for (const status of ["pending", "expired", "draft"] as const) {
    test(`${status} blocks a direct lesson URL`, async ({ page }) => {
      const fixture = fixtures![status];
      const response = await page.goto(
        `/portal/course/${fixture.courseId}/lesson/${fixture.lessonId}`,
      );
      expect(response?.status()).toBeLessThan(500);
      await expect(page).toHaveURL(
        (url) =>
          url.pathname.startsWith("/portal") &&
          !url.pathname.includes("/lesson/"),
      );
      await expect(
        page.getByText(fixture.privateText, { exact: true }),
      ).toHaveCount(0);
    });
  }
  test("the second student cannot read the first student's lesson", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    try {
      const page = await context.newPage();
      await page.goto(new URL("/auth", process.env.BASE_URL).href);
      await page
        .locator('input[type="email"]')
        .fill(process.env.SECOND_STUDENT_EMAIL!);
      await page
        .locator('input[type="password"]')
        .fill(process.env.SECOND_STUDENT_PASSWORD!);
      await page.getByRole("button", { name: "Entrar", exact: true }).click();
      await expect(page).toHaveURL((url) => url.pathname.startsWith("/portal"));
      const fixture = fixtures!.active;
      const response = await page.goto(
        new URL(
          `/portal/course/${fixture.courseId}/lesson/${fixture.lessonId}`,
          process.env.BASE_URL,
        ).href,
      );
      expect(response?.status()).toBeLessThan(500);
      await expect(page).toHaveURL(
        (url) =>
          url.pathname.startsWith("/portal") &&
          !url.pathname.includes("/lesson/"),
      );
      await expect(
        page.getByText(fixture.privateText, { exact: true }),
      ).toHaveCount(0);
    } finally {
      await context.close();
    }
  });
});
