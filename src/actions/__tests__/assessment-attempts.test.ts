const session = jest.fn(),
  access = jest.fn(),
  reads = jest.fn(),
  start = jest.fn(),
  submit = jest.fn(),
  limited = jest.fn();
const query = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  maybeSingle: () => reads(),
};
jest.mock("@/lib/auth/server", () => ({ verifySession: () => session() }));
jest.mock("@/lib/auth/access-gate", () => ({
  assertCanAccessCourse: (...args: unknown[]) => access(...args),
}));
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: () => ({ from: () => query }),
}));
jest.mock("@/app/actions/assessment", () => ({
  startAttempt: (...args: unknown[]) => start(...args),
  submitAssessment: (...args: unknown[]) => submit(...args),
}));
jest.mock("@/lib/rateLimit", () => ({
  rateLimit: () => limited(),
  RateLimitPresets: { SUBMIT_ASSIGNMENT: {} },
}));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
import {
  startAssessmentAttempt,
  submitAssessmentAttempt,
  gradeAssessment,
} from "../assessment";

beforeEach(() => {
  jest.clearAllMocks();
  reads.mockReset();
  session.mockResolvedValue({ uid: "student", isActive: true });
  access.mockResolvedValue({});
  limited.mockResolvedValue({ allowed: true });
  start.mockResolvedValue({
    success: true,
    submissionId: "attempt",
    answers: [],
  });
  submit.mockResolvedValue({
    success: true,
    submissionId: "attempt",
    progressSaved: true,
  });
});
afterEach(() => jest.restoreAllMocks());
function pending() {
  reads.mockResolvedValueOnce({
    data: {
      id: "attempt",
      user_id: "student",
      course_id: "course",
      assessment_id: "quiz",
      status: "pending",
    },
  });
}
it("uses the canonical idempotent draft rather than a second persistence system", async () => {
  expect(await startAssessmentAttempt("quiz", "course")).toMatchObject({
    success: true,
    submissionId: "attempt",
  });
  expect(start).toHaveBeenCalledWith("quiz", "course");
});
it("does not acknowledge a failed draft write", async () => {
  start.mockRejectedValueOnce(new Error("private backend details"));
  jest.spyOn(console, "error").mockImplementation(() => {});
  expect(await startAssessmentAttempt("quiz", "course")).toHaveProperty(
    "error",
  );
});
it("checks ownership and access and discards client supplied grades", async () => {
  pending();
  expect(
    await submitAssessmentAttempt("attempt", [
      {
        questionId: "q",
        booleanAnswer: false,
        pointsEarned: 1000,
        isCorrect: true,
      },
    ]),
  ).toMatchObject({ success: true });
  expect(query.eq).toHaveBeenCalledWith("user_id", "student");
  expect(access).toHaveBeenCalledWith("student", "course");
  expect(submit).toHaveBeenCalledWith("quiz", { q: false }, "attempt");
});
it("preserves private attachment metadata for canonical ownership validation", async () => {
  pending();
  const file = {
    storagePath: "student/attempt/q/file.pdf",
    fileName: "file.pdf",
    mimeType: "application/pdf",
    fileSize: 10,
  };
  await submitAssessmentAttempt("attempt", [{ questionId: "q", ...file }]);
  expect(submit).toHaveBeenCalledWith("quiz", { q: file }, "attempt");
});
it.each(["missing", "access", "database", "closed"])(
  "rejects %s attempts before submitting",
  async (mode) => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    if (mode === "missing") reads.mockResolvedValue({ data: null });
    else if (mode === "database")
      reads.mockResolvedValue({ data: null, error: new Error("offline") });
    else {
      reads.mockResolvedValue({
        data: {
          id: "attempt",
          course_id: "course",
          status: mode === "closed" ? "graded" : "pending",
        },
      });
      if (mode === "access")
        access.mockRejectedValueOnce(new Error("Forbidden"));
    }
    expect(await submitAssessmentAttempt("attempt", [])).toHaveProperty(
      "error",
    );
    expect(submit).not.toHaveBeenCalled();
  },
);
it("keeps grading result reads idempotent", async () => {
  reads.mockImplementation(async () => ({
    data: {
      course_id: "course",
      assessment_id: "quiz",
      status: "graded",
      score: 10,
      percentage: 100,
      passed: true,
      total_points: 10,
    },
  }));
  expect(await gradeAssessment("attempt")).toMatchObject({
    percentage: 100,
    passed: true,
    requiresManualReview: false,
  });
  expect(await gradeAssessment("attempt")).toMatchObject({ percentage: 100 });
  expect(submit).not.toHaveBeenCalled();
});
it("cannot submit when persistence fails or rate limiting denies the request", async () => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  pending();
  submit.mockRejectedValueOnce(new Error("offline"));
  expect(await submitAssessmentAttempt("attempt", [])).toHaveProperty("error");
  submit.mockClear();
  pending();
  limited.mockResolvedValueOnce({ allowed: false });
  expect(await submitAssessmentAttempt("attempt", [])).toHaveProperty("error");
  expect(submit).not.toHaveBeenCalled();
});
