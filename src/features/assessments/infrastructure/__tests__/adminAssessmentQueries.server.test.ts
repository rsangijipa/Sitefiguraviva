import { createSupabaseChainMock } from "@/test-utils/supabaseMock";
import { verifySession } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import {
  readSubmissionDetail,
  readSubmissionsPage,
  readSubmissionMetrics,
} from "../adminAssessmentQueries.server";

jest.mock("server-only", () => ({}));
jest.mock("@/lib/auth/server", () => ({ verifySession: jest.fn() }));
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: jest.fn(),
}));
const from = jest.fn();
const row = {
  id: "00000000-0000-4000-8000-000000000001",
  course_id: "course-a",
  user_id: "student",
  assessment_id: "quiz",
  status: "submitted",
  answers: [{ questionId: "essay", textAnswer: "Answer" }],
  score: 0,
  percentage: 0,
  passed: false,
  attempt_number: 1,
  created_at: "2026-10-04T12:00:00Z",
  started_at: "2026-10-04T12:00:00Z",
  submitted_at: "2026-10-04T13:00:00Z",
};
beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(verifySession)
    .mockResolvedValue({
      uid: "admin",
      isActive: true,
      isAdmin: true,
      isStaff: true,
    });
  jest.mocked(createSupabaseServiceClient).mockReturnValue({ from } as never);
});

it("rejects missing/inactive/student sessions before creating a privileged client", async () => {
  for (const session of [
    null,
    { uid: "student", isActive: true, isAdmin: false, isStaff: false },
    { uid: "admin", isActive: false, isAdmin: true, isStaff: true },
  ]) {
    jest.mocked(verifySession).mockResolvedValue(session);
    await expect(readSubmissionsPage({})).rejects.toThrow("Forbidden");
  }
  expect(createSupabaseServiceClient).not.toHaveBeenCalled();
});

it("filters before pagination and maps Supabase submissions and profiles for the admin UI", async () => {
  const submissions = createSupabaseChainMock({
    data: [row, { ...row, id: "next" }],
  });
  const profiles = createSupabaseChainMock({
    data: [
      {
        id: "student",
        display_name: "Student",
        email: "student@example.test",
        role: "student",
        is_active: true,
      },
    ],
  });
  from.mockImplementation((table: string) =>
    table === "profiles" ? profiles : submissions,
  );
  const result = await readSubmissionsPage({
    status: "submitted",
    pageSize: 1,
  });
  expect(submissions.eq).toHaveBeenCalledWith("status", "submitted");
  expect(submissions.limit).toHaveBeenCalledWith(2);
  expect(result).toMatchObject({
    hasMore: true,
    lastVisible: row.id,
    submissions: [
      {
        userId: "student",
        courseId: "course-a",
        assessmentId: "quiz",
        answers: row.answers,
      },
    ],
    users: { student: { displayName: "Student" } },
  });
});

it("limits tutor queues and metrics to assigned courses", async () => {
  jest
    .mocked(verifySession)
    .mockResolvedValue({
      uid: "tutor",
      isActive: true,
      isAdmin: false,
      isStaff: true,
    });
  const courses = createSupabaseChainMock({
    data: [
      { id: "course-a", team: { tutor: { role: "tutor" } } },
      { id: "unrelated", team: {} },
    ],
  });
  const submissions = createSupabaseChainMock({ count: 3, data: [] });
  from.mockImplementation((table: string) =>
    table === "courses" ? courses : submissions,
  );
  await readSubmissionsPage({});
  await readSubmissionMetrics();
  expect(submissions.in).toHaveBeenCalledWith("course_id", ["course-a"]);
  expect(submissions.in.mock.calls).toHaveLength(3);
});

it("returns no detail for an unauthorized course and never fetches the student profile or answer key", async () => {
  jest
    .mocked(verifySession)
    .mockResolvedValue({
      uid: "tutor",
      isActive: true,
      isAdmin: false,
      isStaff: true,
    });
  const courses = createSupabaseChainMock({
    data: [{ id: "course-a", team: { tutor: { role: "tutor" } } }],
  });
  const submission = createSupabaseChainMock({ data: null });
  from.mockImplementation((table: string) =>
    table === "courses" ? courses : submission,
  );
  expect(await readSubmissionDetail("other-submission")).toBeNull();
  expect(submission.in).toHaveBeenCalledWith("course_id", ["course-a"]);
  expect(from.mock.calls.map(([table]) => table)).toEqual([
    "courses",
    "assessment_submissions",
  ]);
});

it("fails closed when Supabase errors rather than returning legacy submissions", async () => {
  from.mockReturnValue(
    createSupabaseChainMock({ error: new Error("database unavailable") }),
  );
  await expect(readSubmissionsPage({})).rejects.toThrow("database unavailable");
});

it("hydrates detail with the submitted answers and grading rubric from the same course", async () => {
  const submission = createSupabaseChainMock({ data: row });
  const profile = createSupabaseChainMock({
    data: { id: "student", display_name: "Student" },
  });
  const assessment = createSupabaseChainMock({
    data: {
      id: "quiz",
      course_id: "course-a",
      questions: [{ id: "essay", type: "essay", rubric: "Rubric" }],
    },
  });
  from.mockImplementation(
    (table: string) =>
      ({
        assessment_submissions: submission,
        profiles: profile,
        assessments: assessment,
      })[table],
  );
  const detail = await readSubmissionDetail(row.id);
  expect(detail?.submission.answers).toEqual(row.answers);
  expect(detail?.assessment?.questions).toEqual([
    { id: "essay", type: "essay", rubric: "Rubric" },
  ]);
  expect(assessment.eq).toHaveBeenCalledWith("course_id", "course-a");
});
