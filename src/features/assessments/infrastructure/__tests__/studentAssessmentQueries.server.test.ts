/** @jest-environment node */
const session = jest.fn(),
  rpc = jest.fn(),
  access = jest.fn(),
  authClient = jest.fn();
jest.mock("server-only", () => ({}));
jest.mock("@/lib/auth/server", () => ({ verifySession: () => session() }));
jest.mock("next/headers", () => ({
  cookies: async () => ({ get: () => ({ value: "verified-token" }) }),
}));
jest.mock("@/lib/auth/access-gate", () => ({
  assertCanAccessCourse: (...args: unknown[]) => access(...args),
}));
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseAuthServerClient: (...args: unknown[]) => authClient(...args),
}));
import { getStudentAssessmentForSession } from "../studentAssessmentQueries.server";
const published = {
  id: "exam",
  course_id: "course",
  status: "published",
  title: "Quiz",
  passing_score: 70,
  total_points: 1,
  questions: [
    {
      id: "q",
      type: "multiple_choice",
      points: 1,
      correctAnswer: true,
      rubric: "secret rubric",
      correctOption: "answer",
      correctOptions: ["answer"],
      explanation: "secret explanation",
      options: [{ id: "answer", text: "Option", isCorrect: true }],
    },
  ],
};
beforeEach(() => {
  jest.clearAllMocks();
  session.mockResolvedValue({ uid: "student" });
  authClient.mockReturnValue({ rpc });
  access.mockResolvedValue({});
  rpc.mockResolvedValue({ data: published, error: null });
});
it("requests the projection as the verified user and strips staff answer keys", async () => {
  const result = await getStudentAssessmentForSession("exam");
  expect(authClient).toHaveBeenCalledWith("verified-token");
  expect(rpc).toHaveBeenCalledWith("get_student_assessment", {
    p_assessment_id: "exam",
  });
  expect(access).toHaveBeenCalledWith("student", "course");
  expect(result).toMatchObject({
    id: "exam",
    courseId: "course",
    passingScore: 70,
  });
  expect(result?.questions[0]).toEqual({
    id: "q",
    type: "multiple_choice",
    points: 1,
    options: [{ id: "answer", text: "Option" }],
  });
});
it("returns no data when the user is not enrolled according to the RPC", async () => {
  rpc.mockResolvedValue({ data: null, error: null });
  expect(await getStudentAssessmentForSession("exam")).toBeNull();
});
it("never renders drafts even for staff preview", async () => {
  rpc.mockResolvedValue({
    data: { ...published, status: "draft" },
    error: null,
  });
  expect(await getStudentAssessmentForSession("exam")).toBeNull();
  expect(access).not.toHaveBeenCalled();
});
it("rejects when the course gate denies the current caller", async () => {
  access.mockRejectedValue(new Error("No enrollment"));
  await expect(getStudentAssessmentForSession("exam")).rejects.toThrow(
    "No enrollment",
  );
});
it("never fetches assessment data without a verified session", async () => {
  session.mockResolvedValue(null);
  expect(await getStudentAssessmentForSession("exam")).toBeNull();
  expect(authClient).not.toHaveBeenCalled();
});
