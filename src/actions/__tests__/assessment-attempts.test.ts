import {
  startAssessmentAttempt,
  submitAssessmentAttempt,
} from "@/actions/assessment";
import { verifySession } from "@/lib/auth/server";
import {
  startSupabaseAssessmentAttempt,
  submitSupabaseAssessmentAttempt,
} from "@/features/assessments/infrastructure/supabaseAssessmentLifecycle.server";

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

jest.mock("@/lib/auth/server", () => ({
  verifySession: jest.fn(),
  requireAdmin: jest.fn(),
}));

jest.mock(
  "@/features/assessments/infrastructure/supabaseAssessmentLifecycle.server",
  () => ({
    startSupabaseAssessmentAttempt: jest.fn(),
    submitSupabaseAssessmentAttempt: jest.fn(),
    gradeSupabaseAssessmentAttempt: jest.fn(),
  }),
);

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

describe("assessment attempts server actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (verifySession as jest.Mock).mockResolvedValue({
      uid: "user-123",
      role: "student",
    });
  });

  describe("startAssessmentAttempt", () => {
    it("creates a new submission with incremented attempt number", async () => {
      (startSupabaseAssessmentAttempt as jest.Mock).mockResolvedValue({
        success: true,
        submissionId: "sub-2",
      });

      const result = await startAssessmentAttempt("a1", "course-1");

      expect(result).toEqual({ success: true, submissionId: "sub-2" });
      expect(startSupabaseAssessmentAttempt).toHaveBeenCalledWith(
        "user-123",
        "a1",
        "course-1",
      );
    });

    it("rejects when assessment course does not match", async () => {
      (startSupabaseAssessmentAttempt as jest.Mock).mockResolvedValue({
        error: "Curso da avaliação inválido",
      });

      const result = await startAssessmentAttempt("a1", "course-1");
      expect(result).toEqual({ error: "Curso da avaliação inválido" });
    });
  });

  describe("submitAssessmentAttempt", () => {
    it("updates submission for owner", async () => {
      (submitSupabaseAssessmentAttempt as jest.Mock).mockResolvedValue({
        success: true,
      });

      const result = await submitAssessmentAttempt("sub-1", [
        { questionId: "q1", selectedOptions: ["opt1"] },
      ]);

      expect(result).toEqual({ success: true });
      expect(submitSupabaseAssessmentAttempt).toHaveBeenCalledWith(
        "user-123",
        "sub-1",
        [{ questionId: "q1", selectedOptions: ["opt1"] }],
      );
    });

    it("rejects spoofed submission updates from another user", async () => {
      (submitSupabaseAssessmentAttempt as jest.Mock).mockResolvedValue({
        error: "Acesso negado",
      });

      const result = await submitAssessmentAttempt("sub-1", []);
      expect(result).toEqual({ error: "Acesso negado" });
      expect(submitSupabaseAssessmentAttempt).toHaveBeenCalledWith(
        "user-123",
        "sub-1",
        [],
      );
    });
  });
});
