import { requireAdmin } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import {
  readAdminAssessments,
  saveAdminAssessment,
  removeAdminAssessment,
} from "../adminAssessmentManagement.server";
jest.mock("@/lib/auth/server", () => ({ requireAdmin: jest.fn() }));
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: jest.fn(),
}));
jest.mock("@/lib/audit", () => ({ logAudit: jest.fn() }));
const result = jest.fn(),
  single = jest.fn(),
  insert = jest.fn(),
  update = jest.fn();
let chain: Record<string, jest.Mock>;
const question = {
  id: "q",
  title: "Pergunta",
  type: "true_false" as const,
  points: 10,
  order: 1,
  correctAnswer: false,
};
const row = {
  id: "a",
  course_id: "c",
  title: "Avaliação",
  description: "",
  questions: [question],
  passing_score: 70,
  total_points: 10,
  status: "draft",
  is_required: true,
};
beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(requireAdmin)
    .mockResolvedValue({
      uid: "admin",
      email: "admin@example.invalid",
    } as never);
  result.mockResolvedValue({ data: [], error: null });
  single.mockResolvedValue({ data: { id: "a" }, error: null });
  chain = {
    select: jest.fn(() => chain),
    order: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    delete: jest.fn(() => chain),
    insert: insert.mockImplementation(() => chain),
    update: update.mockImplementation(() => chain),
    single,
    then: jest.fn((resolve, reject) => result().then(resolve, reject)),
  };
  jest
    .mocked(createSupabaseServiceClient)
    .mockReturnValue({ from: jest.fn(() => chain) } as never);
});
it("returns an empty Supabase list without a legacy backend fallback", async () => {
  expect(await readAdminAssessments()).toEqual([]);
});
it("requires admin access before any privileged query", async () => {
  jest.mocked(requireAdmin).mockRejectedValue(new Error("Forbidden"));
  await expect(readAdminAssessments()).rejects.toThrow("Forbidden");
  expect(createSupabaseServiceClient).not.toHaveBeenCalled();
});
it("preserves zero passing score and stores required status with server-owned points", async () => {
  await saveAdminAssessment({
    courseId: "c",
    title: "Teste",
    questions: [question],
    passingScore: 0,
    isRequired: true,
    totalPoints: 9999,
  });
  expect(insert).toHaveBeenCalledWith(
    expect.objectContaining({
      passing_score: 0,
      is_required: true,
      total_points: 10,
      created_by: "admin",
    }),
  );
});
it("preserves questions and total points during a title-only edit", async () => {
  result.mockResolvedValue({ data: [row], error: null });
  await saveAdminAssessment({ title: "Novo título" }, "a");
  expect(update).toHaveBeenCalledWith(
    expect.objectContaining({
      total_points: 10,
      questions: [question],
      is_required: true,
    }),
  );
});
it("propagates database write errors instead of confirming success", async () => {
  single.mockResolvedValue({ data: null, error: new Error("write failed") });
  await expect(
    saveAdminAssessment({
      courseId: "c",
      title: "Teste",
      questions: [question],
    }),
  ).rejects.toThrow("write failed");
});
it("rejects a deletion that did not affect a row", async () => {
  single.mockResolvedValue({ data: null, error: new Error("row missing") });
  await expect(removeAdminAssessment("missing")).rejects.toThrow("row missing");
});
it("rejects duplicate question IDs before writing", async () => {
  await expect(
    saveAdminAssessment({
      courseId: "c",
      title: "Teste",
      questions: [question, question],
    }),
  ).rejects.toThrow("identificadores únicos");
  expect(insert).not.toHaveBeenCalled();
});
