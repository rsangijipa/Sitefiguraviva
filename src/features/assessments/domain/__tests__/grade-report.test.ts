import { buildGradeReport } from "../grade-report";

const assessment = (id: string, overrides = {}) => ({
  id,
  title: `Avaliação ${id}`,
  lessonId: `lesson-${id}`,
  isRequired: true,
  passingScore: 70,
  createdAt: `2026-10-0${id.length}T00:00:00Z`,
  ...overrides,
});

const submission = (assessmentId: string, overrides = {}) => ({
  assessmentId,
  attemptNumber: 1,
  status: "graded" as const,
  percentage: 80,
  passed: true,
  feedback: "Muito bem.",
  submittedAt: "2026-11-01T10:00:00Z",
  gradedAt: "2026-11-02T10:00:00Z",
  startedAt: "2026-11-01T09:00:00Z",
  ...overrides,
});

it("maps each assessment to the student's latest attempt", () => {
  const report = buildGradeReport(
    [assessment("a"), assessment("bb"), assessment("ccc"), assessment("dddd", { isRequired: false })],
    [
      submission("a", { attemptNumber: 1, percentage: 40, passed: false }),
      submission("a", { attemptNumber: 2, percentage: 90, passed: true }),
      submission("bb", { status: "submitted", passed: false, feedback: null, gradedAt: null }),
      submission("ccc", { status: "pending", submittedAt: null, gradedAt: null }),
    ],
  );

  expect(report.rows.map((r) => [r.assessmentId, r.status, r.percentage, r.attempts])).toEqual([
    ["a", "passed", 90, 2],
    ["bb", "awaiting_grading", null, 1],
    ["ccc", "in_progress", null, 0],
    ["dddd", "not_started", null, 0],
  ]);
  expect(report.requiredTotal).toBe(3);
  expect(report.requiredPassed).toBe(1);
  expect(report.average).toBe(90);
});

it("hides feedback until the attempt is graded", () => {
  const report = buildGradeReport(
    [assessment("a")],
    [submission("a", { status: "submitted", feedback: "rascunho do professor" })],
  );
  expect(report.rows[0].feedback).toBeNull();
});

it("reports a failing grade and no average without graded work", () => {
  expect(
    buildGradeReport([assessment("a")], [submission("a", { percentage: 50, passed: false })]).rows[0]
      .status,
  ).toBe("failed");
  expect(buildGradeReport([assessment("a")], []).average).toBeNull();
});
