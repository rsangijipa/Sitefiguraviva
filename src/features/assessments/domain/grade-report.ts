/**
 * Student-facing grade report for one course, modelled on Moodle's user
 * grade report. Pure: built from published assessments and the student's
 * own submissions (never from answer keys).
 */

export type GradeStatus =
  | "not_started"
  | "in_progress"
  | "awaiting_grading"
  | "passed"
  | "failed";

export interface GradeAssessmentInput {
  id: string;
  title: string;
  lessonId: string | null;
  isRequired: boolean;
  passingScore: number;
  createdAt: string;
}

export interface GradeSubmissionInput {
  assessmentId: string;
  attemptNumber: number;
  status: "pending" | "submitted" | "graded";
  percentage: number;
  passed: boolean;
  feedback: string | null;
  submittedAt: string | null;
  gradedAt: string | null;
  startedAt: string;
}

export interface GradeRow {
  assessmentId: string;
  title: string;
  lessonId: string | null;
  isRequired: boolean;
  passingScore: number;
  status: GradeStatus;
  percentage: number | null;
  feedback: string | null;
  submittedAt: string | null;
  gradedAt: string | null;
  attempts: number;
}

export interface GradeReport {
  rows: GradeRow[];
  requiredTotal: number;
  requiredPassed: number;
  /** Mean percentage of graded assessments, or null when none is graded. */
  average: number | null;
}

function statusOf(submission?: GradeSubmissionInput): GradeStatus {
  if (!submission) return "not_started";
  if (submission.status === "pending") return "in_progress";
  if (submission.status === "submitted") return "awaiting_grading";
  return submission.passed ? "passed" : "failed";
}

export function buildGradeReport(
  assessments: GradeAssessmentInput[],
  submissions: GradeSubmissionInput[],
): GradeReport {
  const byAssessment = new Map<string, GradeSubmissionInput[]>();
  for (const submission of submissions) {
    const list = byAssessment.get(submission.assessmentId) ?? [];
    list.push(submission);
    byAssessment.set(submission.assessmentId, list);
  }

  const rows = [...assessments]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((assessment): GradeRow => {
      const attempts = (byAssessment.get(assessment.id) ?? []).sort(
        (a, b) =>
          b.attemptNumber - a.attemptNumber ||
          b.startedAt.localeCompare(a.startedAt),
      );
      const latest = attempts[0];
      const status = statusOf(latest);
      return {
        assessmentId: assessment.id,
        title: assessment.title,
        lessonId: assessment.lessonId,
        isRequired: assessment.isRequired,
        passingScore: assessment.passingScore,
        status,
        percentage:
          status === "passed" || status === "failed"
            ? Math.round(latest.percentage)
            : null,
        feedback: status === "passed" || status === "failed" ? latest.feedback : null,
        submittedAt: latest?.submittedAt ?? null,
        gradedAt: latest?.gradedAt ?? null,
        attempts: attempts.filter((a) => a.status !== "pending").length,
      };
    });

  const graded = rows.filter((row) => row.percentage !== null);
  const required = rows.filter((row) => row.isRequired);
  return {
    rows,
    requiredTotal: required.length,
    requiredPassed: required.filter((row) => row.status === "passed").length,
    average: graded.length
      ? Math.round(
          graded.reduce((sum, row) => sum + (row.percentage ?? 0), 0) /
            graded.length,
        )
      : null,
  };
}

export const GRADE_STATUS_LABEL: Record<GradeStatus, string> = {
  not_started: "Não iniciada",
  in_progress: "Em andamento",
  awaiting_grading: "Aguardando correção",
  passed: "Aprovado",
  failed: "Abaixo da nota mínima",
};
