const access = jest.fn(),
  session = jest.fn(),
  reads = jest.fn(),
  writes = jest.fn();
const query: any = {
  select: jest.fn(() => query),
  eq: jest.fn(() => query),
  order: jest.fn(() => query),
  limit: jest.fn(() => query),
  maybeSingle: (...args: unknown[]) => reads(...args),
  update: (...args: unknown[]) => {
    writes(...args);
    return query;
  },
  upsert: (...args: unknown[]) => {
    writes(...args);
    return Promise.resolve({ error: null });
  },
};
jest.mock("@/lib/auth/server", () => ({ verifySession: () => session() }));
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: () => ({ from: () => query }),
}));
jest.mock("@/lib/auth/access-gate", () => ({
  assertCanAccessCourse: (...args: unknown[]) => access(...args),
}));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@/app/actions/progress", () => ({ markLessonCompleted: jest.fn() }));
import { saveDraft, submitAssessment } from "../assessment";
import { markLessonCompleted } from "@/app/actions/progress";
const assessment = {
  id: "assessment",
  course_id: "course",
  status: "published",
  passing_score: 70,
  questions: [
    {
      id: "q",
      type: "multiple_choice",
      points: 10,
      options: [
        { id: "yes", isCorrect: true },
        { id: "no", isCorrect: false },
      ],
    },
  ],
};
beforeEach(() => {
  jest.clearAllMocks();
  session.mockResolvedValue({ uid: "student" });
  access.mockResolvedValue({});
  reads.mockResolvedValueOnce({ data: assessment, error: null });
});
it.each([saveDraft, submitAssessment])(
  "denies non-enrolled users before writes",
  async (action) => {
    access.mockRejectedValue(new Error("Forbidden"));
    await expect(action("assessment", {})).rejects.toThrow("Forbidden");
    expect(writes).not.toHaveBeenCalled();
  },
);
it("rejects unpublished assessments", async () => {
  reads
    .mockReset()
    .mockResolvedValue({ data: { ...assessment, status: "draft" } });
  await expect(saveDraft("assessment", {})).rejects.toThrow("unavailable");
  expect(writes).not.toHaveBeenCalled();
});
it("persists draft answers after authorization", async () => {
  reads.mockResolvedValueOnce({
    data: { id: "draft", status: "pending", attempt_number: 1 },
  });
  reads.mockResolvedValueOnce({ data: { id: "draft" } });
  await saveDraft("assessment", { q: "yes" });
  expect(writes).toHaveBeenCalledWith(
    expect.objectContaining({
      answers: [{ questionId: "q", selectedOptions: ["yes"] }],
    }),
  );
  expect(access.mock.invocationCallOrder[0]).toBeLessThan(
    writes.mock.invocationCallOrder[0],
  );
});
it("grades against server questions and persists to Supabase", async () => {
  reads.mockResolvedValueOnce({
    data: { id: "draft", status: "pending", attempt_number: 1 },
  });
  reads.mockResolvedValueOnce({ data: { id: "draft" } });
  const result = await submitAssessment("assessment", { q: "yes" });
  expect(result).toMatchObject({ passed: true, grade: 100 });
  expect(writes).toHaveBeenCalledWith(
    expect.objectContaining({ status: "graded", passed: true, score: 10 }),
  );
});
it("rejects duplicated multiple choice options", async () => {
  await expect(
    submitAssessment("assessment", { q: ["yes", "yes"] }),
  ).rejects.toThrow("Invalid selected");
  expect(writes).not.toHaveBeenCalled();
});
it("does not claim success when a concurrent submission closed the draft", async () => {
  reads.mockResolvedValueOnce({
    data: { id: "draft", status: "pending", attempt_number: 1 },
  });
  reads.mockResolvedValueOnce({ data: null });
  await expect(submitAssessment("assessment", { q: "yes" })).rejects.toThrow(
    "already submitted",
  );
});

it("does not create a fresh attempt after submission or grading", async () => {
  reads.mockResolvedValueOnce({ data: { id: "closed", status: "graded", attempt_number: 1 } });
  await expect(saveDraft("assessment", { q: "yes" })).rejects.toThrow("already submitted");
  expect(writes).not.toHaveBeenCalled();
});

it("updates assessment progress and completes the linked quiz after approval", async () => {
  reads.mockReset().mockResolvedValueOnce({ data: { ...assessment, lesson_id: "quiz-lesson" } });
  reads.mockResolvedValueOnce({ data: { id: "draft", status: "pending", attempt_number: 1 } });
  reads.mockResolvedValueOnce({ data: { id: "draft" } });
  reads.mockResolvedValueOnce({ data: { module_id: "module" } });
  jest.mocked(markLessonCompleted).mockResolvedValue({ success: true });
  const result = await submitAssessment("assessment", { q: "yes" });
  expect(result.progressSaved).toBe(true);
  expect(writes).toHaveBeenCalledWith(expect.objectContaining({
    user_id: "student", assessment_id: "assessment", passed: true, best_percentage: 100,
    submissions: ["draft"],
  }), { onConflict: "user_id,assessment_id" });
  expect(markLessonCompleted).toHaveBeenCalledWith("course", "module", "quiz-lesson");
});

it("leaves manual questions pending and does not approve or complete the lesson", async () => {
  reads.mockReset().mockResolvedValueOnce({ data: {
    ...assessment, lesson_id: "essay-lesson",
    questions: [{ id: "q", type: "essay", points: 10 }],
  } });
  reads.mockResolvedValueOnce({ data: { id: "draft", status: "pending", attempt_number: 1 } });
  reads.mockResolvedValueOnce({ data: { id: "draft" } });
  const result = await submitAssessment("assessment", { q: "My answer" });
  expect(result).toMatchObject({ passed: false, requiresManualGrading: true });
  expect(writes).toHaveBeenCalledWith(expect.objectContaining({ status: "submitted", passed: false }));
  expect(markLessonCompleted).not.toHaveBeenCalled();
});
