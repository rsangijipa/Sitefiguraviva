const get = jest.fn(),
  write = jest.fn(),
  access = jest.fn(),
  session = jest.fn();
jest.mock("@/lib/firebase/admin", () => ({
  auth: { verifySessionCookie: () => session() },
  db: { collection: () => ({ doc: () => ({ get, set: write }) }) },
}));
jest.mock("next/headers", () => ({
  cookies: async () => ({ get: () => ({ value: "cookie" }) }),
}));
jest.mock("@/lib/auth/access-gate", () => ({
  assertCanAccessCourse: (...args: unknown[]) => access(...args),
}));
jest.mock(
  "@/features/gamification/application/awardCanonicalGamification.server",
  () => ({ awardCanonicalCompletion: jest.fn() }),
);
import { saveDraft, submitAssessment } from "../assessment";
beforeEach(() => {
  jest.clearAllMocks();
  session.mockResolvedValue({ uid: "student" });
  get.mockResolvedValue({
    exists: true,
    data: () => ({ courseId: "course", status: "published" }),
  });
  access.mockResolvedValue({});
  write.mockResolvedValue({});
});
it.each([saveDraft, submitAssessment])(
  "denies a non-enrolled student before writing",
  async (action) => {
    access.mockRejectedValue(new Error("Forbidden"));
    await expect(action("assessment", {})).rejects.toThrow("Forbidden");
    expect(write).not.toHaveBeenCalled();
  },
);
it("does not allow draft/unpublished assessments", async () => {
  get.mockResolvedValue({
    exists: true,
    data: () => ({ courseId: "course", status: "draft" }),
  });
  await expect(saveDraft("assessment", {})).rejects.toThrow("unavailable");
  expect(write).not.toHaveBeenCalled();
});
it("saves a draft only after validating course access", async () => {
  await saveDraft("assessment", { answer: "text" });
  expect(access).toHaveBeenCalledWith("student", "course");
  expect(access.mock.invocationCallOrder[0]).toBeLessThan(
    write.mock.invocationCallOrder[0],
  );
});
