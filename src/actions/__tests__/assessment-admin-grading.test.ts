import { saveManualGrading } from "../assessment";
import { readSubmissionDetail } from "@/features/assessments/infrastructure/adminAssessmentQueries.server";
import { manualGradeSubmission } from "../grading";
import { revalidatePath } from "next/cache";

jest.mock("@/lib/firebase/admin", () => ({ adminDb: {} }));
jest.mock("@/lib/auth/server", () => ({ verifySession: jest.fn() }));
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: jest.fn(),
}));
jest.mock("@/lib/rateLimit", () => ({
  rateLimit: jest.fn(),
  RateLimitPresets: {},
}));
jest.mock(
  "@/features/assessments/infrastructure/adminAssessmentQueries.server",
  () => ({
    readSubmissionDetail: jest.fn(),
    readSubmissionsPage: jest.fn(),
    readSubmissionMetrics: jest.fn(),
  }),
);
jest.mock("../grading", () => ({ manualGradeSubmission: jest.fn() }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

beforeEach(() => jest.clearAllMocks());

it("delegates only manual question scores, preserving authoritative auto-grades and submitted answers", async () => {
  jest.mocked(readSubmissionDetail).mockResolvedValue({
    assessment: {
      questions: [
        { id: "essay", type: "essay" },
        { id: "practical", type: "practical" },
        { id: "multiple", type: "multiple_choice" },
      ],
    },
  } as never);
  jest
    .mocked(manualGradeSubmission)
    .mockResolvedValue({ success: true } as never);
  const result = await saveManualGrading("submission", {
    answers: [
      { questionId: "essay", pointsEarned: 8, textAnswer: "Tampered text" },
      { questionId: "multiple", pointsEarned: 999 },
    ],
    feedback: "Feedback",
  });
  expect(manualGradeSubmission).toHaveBeenCalledWith(
    "submission",
    [
      { questionId: "essay", pointsEarned: 8 },
      { questionId: "practical", pointsEarned: 0 },
    ],
    "Feedback",
  );
  expect(result).toEqual({ success: true });
  expect(revalidatePath).toHaveBeenCalledWith("/admin/assessments/submissions");
});

it("does not grade when the authorized detail lookup fails", async () => {
  jest.mocked(readSubmissionDetail).mockRejectedValue(new Error("Forbidden"));
  expect(await saveManualGrading("submission", { answers: [] })).toEqual({
    error: "Erro ao salvar correção",
  });
  expect(manualGradeSubmission).not.toHaveBeenCalled();
});
