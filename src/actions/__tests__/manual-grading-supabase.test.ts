/** @jest-environment node */
const staff = jest.fn();
const scopedPage = jest.fn();
jest.mock(
  "@/features/assessments/infrastructure/adminAssessmentQueries.server",
  () => ({ readSubmissionsPage: (...args: unknown[]) => scopedPage(...args) }),
);
const author = jest.fn();
const reads = jest.fn();
const update = jest.fn();
const upsert = jest.fn();
const notifications = jest.fn();
const award = jest.fn();
const filters = jest.fn();
jest.mock("server-only", () => ({}));
jest.mock("@/lib/firebase/admin", () => ({ auth: {}, adminDb: {} }));
jest.mock("@/lib/auth/server", () => ({
  requireStaff: () => staff(),
  verifySession: jest.fn(),
}));
jest.mock("@/lib/auth/authoring-gate", () => ({
  assertCanAuthorCourse: (...args: unknown[]) => author(...args),
}));
jest.mock("@/lib/rateLimit", () => ({
  rateLimit: async () => ({ allowed: true }),
}));
jest.mock(
  "@/features/progress/application/recordLessonProgress.server",
  () => ({ recordLessonProgress: jest.fn() }),
);
jest.mock(
  "@/features/notifications/infrastructure/supabaseNotificationRepository.server",
  () => ({
    createNotification: (...args: unknown[]) => notifications(...args),
  }),
);
jest.mock(
  "@/features/gamification/application/awardCanonicalGamification.server",
  () => ({ awardCanonicalCompletion: (...args: unknown[]) => award(...args) }),
);
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: () => ({
    from: (table: string) => {
      const q = {
        select: () => q,
        in: () => reads(table),
        eq: (...args: unknown[]) => {
          filters(...args);
          return q;
        },
        maybeSingle: () => reads(table),
        update: (value: unknown) => {
          update(table, value);
          return q;
        },
        upsert: (value: unknown, options: unknown) => {
          upsert(table, value, options);
          return Promise.resolve({ error: null });
        },
      };
      return q;
    },
  }),
}));
import { manualGradeSubmission, getPendingSubmissions } from "../grading";
const submission = {
  id: "submission",
  user_id: "student",
  course_id: "course",
  assessment_id: "assessment",
  status: "submitted",
  attempt_number: 1,
  updated_at: "v1",
  answers: [
    { questionId: "mc", selectedOptions: ["yes"], pointsEarned: 2 },
    { questionId: "essay", textAnswer: "Resposta", pointsEarned: 0 },
  ],
};
const assessment = {
  id: "assessment",
  course_id: "course",
  lesson_id: null,
  title: "Avaliação",
  passing_score: 70,
  questions: [
    {
      id: "mc",
      type: "multiple_choice",
      points: 2,
      options: [
        { id: "yes", isCorrect: true },
        { id: "no", isCorrect: false },
      ],
    },
    { id: "essay", type: "essay", points: 8 },
  ],
};
beforeEach(() => {
  jest.clearAllMocks();
  staff.mockResolvedValue({ uid: "teacher" });
  author.mockResolvedValue({ uid: "teacher" });
  reads.mockReset();
  reads
    .mockResolvedValueOnce({ data: submission, error: null })
    .mockResolvedValueOnce({ data: assessment, error: null })
    .mockResolvedValueOnce({ data: { id: "submission" }, error: null })
    .mockResolvedValueOnce({ data: null, error: null });
});
it("rejects a student before reading any submission", async () => {
  staff.mockRejectedValue(new Error("Forbidden"));
  expect(
    await manualGradeSubmission("submission", [
      { questionId: "essay", pointsEarned: 6 },
    ]),
  ).toHaveProperty("error");
  expect(reads).not.toHaveBeenCalled();
  expect(update).not.toHaveBeenCalled();
});
it("rejects tutors not assigned to the submission course", async () => {
  author.mockRejectedValue(new Error("Forbidden"));
  expect(
    await manualGradeSubmission("submission", [
      { questionId: "essay", pointsEarned: 6 },
    ]),
  ).toHaveProperty("error");
  expect(author).toHaveBeenCalledWith("course");
  expect(update).not.toHaveBeenCalled();
});
it("grades canonical Supabase submission and preserves automatic points", async () => {
  expect(
    await manualGradeSubmission(
      "submission",
      [{ questionId: "essay", pointsEarned: 6 }],
      "Feedback",
    ),
  ).toEqual({
    success: true,
    score: 8,
    totalPoints: 10,
    percentage: 80,
    passed: true,
    progressSaved: true,
  });
  expect(update).toHaveBeenCalledWith(
    "assessment_submissions",
    expect.objectContaining({
      status: "graded",
      score: 8,
      graded_by: "teacher",
      feedback: "Feedback",
    }),
  );
  expect(filters).toHaveBeenCalledWith("updated_at", "v1");
  expect(upsert).toHaveBeenCalledWith(
    "assessment_progress",
    expect.objectContaining({ passed: true, user_id: "student" }),
    { onConflict: "user_id,assessment_id" },
  );
});
it.each([-1, 9, NaN])(
  "rejects out-of-range manual points %s",
  async (pointsEarned) => {
    expect(
      await manualGradeSubmission("submission", [
        { questionId: "essay", pointsEarned },
      ]),
    ).toHaveProperty("error");
    expect(update).not.toHaveBeenCalled();
  },
);
it("does not accept client edits to automatic scores", async () => {
  expect(
    await manualGradeSubmission("submission", [
      { questionId: "mc", pointsEarned: 2 },
      { questionId: "essay", pointsEarned: 6 },
    ]),
  ).toHaveProperty("error");
  expect(update).not.toHaveBeenCalled();
});
it("does not overwrite a concurrent grading revision", async () => {
  reads.mockReset();
  reads
    .mockResolvedValueOnce({ data: submission, error: null })
    .mockResolvedValueOnce({ data: assessment, error: null })
    .mockResolvedValueOnce({ data: null, error: null });
  expect(
    await manualGradeSubmission("submission", [
      { questionId: "essay", pointsEarned: 6 },
    ]),
  ).toHaveProperty("error");
  expect(upsert).not.toHaveBeenCalled();
});

it("uses scoped canonical pending submissions without falling back on empty results", async () => {
  scopedPage.mockResolvedValue({ submissions: [], users: {} });
  expect(await getPendingSubmissions("course")).toEqual({ submissions: [] });
  expect(scopedPage).toHaveBeenCalledWith({
    status: "submitted",
    pageSize: 50,
    courseId: "course",
  });
  expect(reads).not.toHaveBeenCalled();
});
it("joins names and titles while preserving ISO dates for GradingDashboard", async () => {
  scopedPage.mockResolvedValue({
    submissions: [
      {
        id: "submission",
        assessmentId: "assessment",
        userId: "student",
        submittedAt: "2026-10-05T00:00:00Z",
      },
    ],
    users: { student: { displayName: "Aluno", email: "aluno@example.test" } },
  });
  reads.mockReset();
  reads.mockResolvedValue({
    data: [{ id: "assessment", title: "Atividade" }],
    error: null,
  });
  expect(await getPendingSubmissions()).toEqual({
    submissions: [
      expect.objectContaining({
        studentName: "Aluno",
        studentEmail: "aluno@example.test",
        assessmentTitle: "Atividade",
        submittedAtDate: "2026-10-05T00:00:00Z",
      }),
    ],
  });
});
it("fails closed when course-scoped reading is forbidden", async () => {
  scopedPage.mockRejectedValue(new Error("Forbidden"));
  expect(await getPendingSubmissions("unassigned")).toHaveProperty("error");
  expect(reads).not.toHaveBeenCalled();
});

it("recomputes forged objective points from actual answers rather than trusting stored grading", async () => {
  reads.mockReset();
  reads
    .mockResolvedValueOnce({
      data: {
        ...submission,
        answers: [
          {
            questionId: "mc",
            selectedOptions: ["no"],
            pointsEarned: 100,
            isCorrect: true,
          },
          {
            questionId: "tf",
            booleanAnswer: false,
            pointsEarned: 100,
            isCorrect: true,
          },
          { questionId: "essay", textAnswer: "Resposta" },
        ],
      },
      error: null,
    })
    .mockResolvedValueOnce({
      data: {
        ...assessment,
        questions: [
          ...assessment.questions,
          { id: "tf", type: "true_false", points: 2, correctAnswer: true },
        ],
      },
      error: null,
    })
    .mockResolvedValueOnce({ data: { id: "submission" }, error: null })
    .mockResolvedValueOnce({ data: null, error: null });
  const result = await manualGradeSubmission("submission", [
    { questionId: "essay", pointsEarned: 6 },
  ]);
  expect(result).toEqual(
    expect.objectContaining({
      success: true,
      score: 6,
      totalPoints: 12,
      percentage: 50,
      passed: false,
    }),
  );
  expect(update).toHaveBeenCalledWith(
    "assessment_submissions",
    expect.objectContaining({
      answers: expect.arrayContaining([
        expect.objectContaining({
          questionId: "mc",
          pointsEarned: 0,
          isCorrect: false,
        }),
        expect.objectContaining({
          questionId: "tf",
          pointsEarned: 0,
          isCorrect: false,
        }),
      ]),
    }),
  );
});
