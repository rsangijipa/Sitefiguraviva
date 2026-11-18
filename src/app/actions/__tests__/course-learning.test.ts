import { getMyCourseGradesAction } from "../course-grades";
import {
  getCourseCompletionReportAction,
  updateCourseReleaseAction,
} from "../admin/course-learning";
import { verifySession, requireAdmin } from "@/lib/auth/server";
import { assertCanAccessCourse } from "@/lib/auth/access-gate";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@/lib/auth/server", () => ({
  verifySession: jest.fn(),
  requireAdmin: jest.fn(),
}));
jest.mock("@/lib/auth/access-gate", () => ({ assertCanAccessCourse: jest.fn() }));
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: jest.fn(),
}));

type Call = { table: string; method: string; args: unknown[] };

/** Chainable query builder that resolves each table to canned rows. */
function fakeSupabase(tables: Record<string, unknown>) {
  const calls: Call[] = [];
  const builder = (table: string) => {
    const result = { data: tables[table] ?? [], error: null };
    const chain: any = {};
    for (const method of ["select", "eq", "in", "order", "update"]) {
      chain[method] = (...args: unknown[]) => {
        calls.push({ table, method, args });
        return chain;
      };
    }
    chain.maybeSingle = () => Promise.resolve(result);
    chain.then = (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve);
    return chain;
  };
  return { client: { from: builder }, calls };
}

beforeEach(() => jest.clearAllMocks());

describe("getMyCourseGradesAction", () => {
  it("reads only the signed-in student's submissions", async () => {
    (verifySession as jest.Mock).mockResolvedValue({ uid: "student-1" });
    (assertCanAccessCourse as jest.Mock).mockResolvedValue({});
    const { client, calls } = fakeSupabase({
      assessments: [
        {
          id: "a1",
          title: "Avaliação 1",
          lesson_id: "l1",
          is_required: true,
          passing_score: 70,
          created_at: "2026-10-01T00:00:00Z",
        },
      ],
      assessment_submissions: [],
    });
    (createSupabaseServiceClient as jest.Mock).mockReturnValue(client);

    const result = await getMyCourseGradesAction("course-1");

    expect(result.success).toBe(true);
    expect(result.data?.rows[0].status).toBe("not_started");
    expect(calls).toContainEqual({
      table: "assessment_submissions",
      method: "eq",
      args: ["user_id", "student-1"],
    });
    expect(calls).toContainEqual({
      table: "assessments",
      method: "eq",
      args: ["status", "published"],
    });
  });

  it("returns nothing without course access", async () => {
    (verifySession as jest.Mock).mockResolvedValue({ uid: "student-1" });
    (assertCanAccessCourse as jest.Mock).mockRejectedValue(new Error("denied"));

    const result = await getMyCourseGradesAction("course-1");

    expect(result.success).toBe(false);
    expect(createSupabaseServiceClient).not.toHaveBeenCalled();
  });
});

describe("admin course learning actions", () => {
  it("require an administrator", async () => {
    (requireAdmin as jest.Mock).mockRejectedValue(new Error("redirect"));
    await expect(updateCourseReleaseAction("c1", { mode: "free" })).rejects.toThrow();
    await expect(getCourseCompletionReportAction("c1")).rejects.toThrow();
    expect(createSupabaseServiceClient).not.toHaveBeenCalled();
  });

  it("saves only details.release and drops dates of other courses' modules", async () => {
    (requireAdmin as jest.Mock).mockResolvedValue({});
    const { client, calls } = fakeSupabase({
      course_modules: [{ id: "m1" }],
      courses: { details: { date: "abril", agenda: { sessions: [] } } },
    });
    (createSupabaseServiceClient as jest.Mock).mockReturnValue(client);

    const result = await updateCourseReleaseAction("c1", {
      mode: "sequential",
      moduleDates: { m1: "2026-12-01", "other-course-module": "2026-12-02" },
    });

    expect(result).toEqual({
      success: true,
      data: { mode: "sequential", moduleDates: { m1: "2026-12-01" } },
    });
    expect(calls).toContainEqual({
      table: "courses",
      method: "update",
      args: [
        {
          details: {
            date: "abril",
            agenda: { sessions: [] },
            release: { mode: "sequential", moduleDates: { m1: "2026-12-01" } },
          },
        },
      ],
    });
  });

  it("rejects invalid release dates", async () => {
    (requireAdmin as jest.Mock).mockResolvedValue({});
    const result = await updateCourseReleaseAction("c1", {
      mode: "free",
      moduleDates: { m1: "01/12/2026" },
    });
    expect(result).toEqual({
      success: false,
      message: "Use datas no formato AAAA-MM-DD.",
    });
  });
});
