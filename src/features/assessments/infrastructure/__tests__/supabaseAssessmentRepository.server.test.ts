import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { createSupabaseChainMock } from "@/test-utils/supabaseMock";

const from = jest.fn();
jest.mock("@/infrastructure/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({ from }),
}));

import {
  getAssessment,
  getUserSubmissions,
  listCourseAssessments,
} from "../supabaseAssessmentRepository.server";

describe("supabaseAssessmentRepository", () => {
  beforeEach(() => {
    from.mockReset();
  });

  it("lists published assessments for a course", async () => {
    const chain = createSupabaseChainMock({
      data: [
        {
          id: "assess-1",
          course_id: "co-visar",
          lesson_id: null,
          title: "Quiz",
          description: "Desc",
          passing_score: 70,
          total_points: 10,
          questions: [],
          status: "published",
          created_by: "admin-1",
          created_at: "2026-09-05T10:00:00.000Z",
          updated_at: "2026-09-05T10:00:00.000Z",
        },
      ],
    });
    from.mockReturnValue(chain);

    const client = { from } as any;

    await expect(listCourseAssessments("co-visar", client)).resolves.toEqual([
      expect.objectContaining({ id: "assess-1", courseId: "co-visar" }),
    ]);
  });

  it("gets a user's submissions for an assessment", async () => {
    const chain = createSupabaseChainMock({
      data: [
        {
          id: "sub-1",
          assessment_id: "assess-1",
          user_id: "user-1",
          course_id: "co-visar",
          attempt_number: 1,
          answers: [],
          score: 10,
          percentage: 100,
          passed: true,
          status: "graded",
          feedback: null,
          graded_by: null,
          started_at: "2026-09-06T10:00:00.000Z",
          submitted_at: "2026-09-06T10:00:00.000Z",
          graded_at: null,
          created_at: "2026-09-06T10:00:00.000Z",
          updated_at: "2026-09-06T10:00:00.000Z",
        },
      ],
    });
    from.mockReturnValue(chain);

    const client = { from } as any;

    await expect(
      getUserSubmissions("user-1", "assess-1", client),
    ).resolves.toEqual([
      expect.objectContaining({ id: "sub-1", userId: "user-1" }),
    ]);
  });
});
