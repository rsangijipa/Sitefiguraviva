import {
  startAssessmentAttempt,
  submitAssessmentAttempt,
} from "@/actions/assessment";
import { auth, adminDb } from "@/lib/firebase/admin";

jest.mock("next/headers", () => ({
  cookies: jest.fn(() =>
    Promise.resolve({
      get: jest.fn((name) => {
        if (name === "session") return { value: "valid-token" };
        return undefined;
      }),
    }),
  ),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/rateLimit", () => ({
  rateLimit: jest.fn(async () => ({
    allowed: true,
    remaining: 999,
    resetAt: Date.now() + 60_000,
  })),
  RateLimitPresets: {
    SUBMIT_ASSIGNMENT: { points: 5, windowMs: 60_000 },
  },
}));

jest.mock("@/lib/firebase/admin", () => {
  const assessmentDocGet = jest.fn();
  const submissionDocGet = jest.fn();
  const submissionDocUpdate = jest.fn();
  const assessmentSubmissionsWhereGet = jest.fn();
  const assessmentSubmissionsAdd = jest.fn();

  const assessmentSubmissionsCollection = {
    where: jest.fn(() => ({
      where: jest.fn(() => ({
        get: assessmentSubmissionsWhereGet,
      })),
    })),
    add: assessmentSubmissionsAdd,
    doc: jest.fn(() => ({
      get: submissionDocGet,
      update: submissionDocUpdate,
    })),
  };

  const assessmentsCollection = {
    doc: jest.fn(() => ({
      get: assessmentDocGet,
    })),
  };

  const collectionMock = jest.fn((name: string) => {
    if (name === "assessments") return assessmentsCollection;
    if (name === "assessmentSubmissions")
      return assessmentSubmissionsCollection;
    throw new Error(`Unexpected collection: ${name}`);
  });

  return {
    auth: {
      verifySessionCookie: jest.fn(),
    },
    adminDb: {
      collection: collectionMock,
    },
    __mocks: {
      assessmentDocGet,
      submissionDocGet,
      submissionDocUpdate,
      assessmentSubmissionsWhereGet,
      assessmentSubmissionsAdd,
      collectionMock,
    },
  };
});

const firebaseModule = jest.requireMock("@/lib/firebase/admin");
const mocks = firebaseModule.__mocks as {
  assessmentDocGet: jest.Mock;
  submissionDocGet: jest.Mock;
  submissionDocUpdate: jest.Mock;
  assessmentSubmissionsWhereGet: jest.Mock;
  assessmentSubmissionsAdd: jest.Mock;
  collectionMock: jest.Mock;
};

describe("assessment attempts server actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (auth.verifySessionCookie as jest.Mock).mockResolvedValue({
      uid: "user-123",
      role: "student",
    });
  });

  describe("startAssessmentAttempt", () => {
    it("creates a new submission with incremented attempt number", async () => {
      mocks.assessmentDocGet.mockResolvedValue({
        exists: true,
        data: () => ({ id: "a1", courseId: "course-1" }),
      });
      mocks.assessmentSubmissionsWhereGet.mockResolvedValue({
        docs: [{ data: () => ({ attemptNumber: 1 }) }],
      });
      mocks.assessmentSubmissionsAdd.mockResolvedValue({ id: "sub-2" });

      const result = await startAssessmentAttempt("a1", "course-1");

      expect(result).toEqual({ success: true, submissionId: "sub-2" });
      expect(mocks.assessmentSubmissionsAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          assessmentId: "a1",
          userId: "user-123",
          courseId: "course-1",
          status: "pending",
          attemptNumber: 2,
        }),
      );
    });

    it("rejects when assessment course does not match", async () => {
      mocks.assessmentDocGet.mockResolvedValue({
        exists: true,
        data: () => ({ id: "a1", courseId: "other-course" }),
      });

      const result = await startAssessmentAttempt("a1", "course-1");
      expect(result).toEqual({ error: "Curso da avaliação inválido" });
    });
  });

  describe("submitAssessmentAttempt", () => {
    it("updates submission for owner", async () => {
      mocks.submissionDocGet.mockResolvedValue({
        exists: true,
        data: () => ({ userId: "user-123", assessmentId: "a1" }),
      });
      mocks.submissionDocUpdate.mockResolvedValue(undefined);

      const result = await submitAssessmentAttempt("sub-1", [
        { questionId: "q1", selectedOptions: ["opt1"] },
      ]);

      expect(result).toEqual({ success: true });
      expect(mocks.submissionDocUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "submitted",
          answers: [{ questionId: "q1", selectedOptions: ["opt1"] }],
        }),
      );
    });

    it("rejects spoofed submission updates from another user", async () => {
      mocks.submissionDocGet.mockResolvedValue({
        exists: true,
        data: () => ({ userId: "attacker-target" }),
      });

      const result = await submitAssessmentAttempt("sub-1", []);
      expect(result).toEqual({ error: "Acesso negado" });
      expect(mocks.submissionDocUpdate).not.toHaveBeenCalled();
    });
  });
});
