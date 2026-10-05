jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: jest.fn(),
}));

import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { buildAdminDashboardKPIs } from "../kpi";

type Query = {
  table: string;
  columns?: string;
  options?: { head?: boolean; count?: string };
  filters: Record<string, unknown>;
  limit?: number;
};
const queries: Query[] = [];
let failedTable: string | undefined;

function client() {
  return {
    from: (table: string) => {
      const query: Query = { table, filters: {} };
      queries.push(query);
      const builder = {
        select: (columns: string, options?: Query["options"]) => {
          query.columns = columns;
          query.options = options;
          return builder;
        },
        eq: (key: string, value: unknown) => {
          query.filters[key] = value;
          return builder;
        },
        in: (key: string, value: unknown) => {
          query.filters[key] = value;
          return builder;
        },
        gte: (key: string, value: unknown) => {
          query.filters[key] = value;
          return builder;
        },
        order: () => builder,
        limit: (value: number) => {
          query.limit = value;
          return builder;
        },
        then: (resolve: (value: unknown) => unknown) => {
          if (table === failedTable)
            return Promise.resolve({
              data: null,
              count: null,
              error: new Error("unavailable"),
            }).then(resolve);
          let count = 0;
          let data: unknown[] = [];
          if (table === "profiles") count = query.filters.created_at ? 12 : 120;
          if (table === "enrollments") {
            count = query.filters.status === "pending_approval" ? 27 : 82;
            if (!query.options?.head)
              data = Array.from({ length: 5 }, (_, i) => ({
                id: "e" + i,
                user_id: null,
                course_id: "c",
                status: "pending_approval",
              }));
          }
          if (table === "courses") {
            count =
              query.filters.status === "open"
                ? 7
                : query.filters.status === "draft"
                  ? 3
                  : 12;
            if (!query.options?.head) data = [{ id: "c", title: "Curso" }];
          }
          if (table === "assessment_submissions") count = 9;
          return Promise.resolve({ count, data, error: null }).then(resolve);
        },
      };
      return builder;
    },
  };
}

describe("admin dashboard metrics", () => {
  beforeEach(() => {
    queries.length = 0;
    failedTable = undefined;
    jest.mocked(createSupabaseServiceClient).mockReturnValue(client() as any);
  });

  it("uses exact pending counts independently of the five displayed records", async () => {
    const result = await buildAdminDashboardKPIs();
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      totalUsers: 120,
      accessGranted: 82,
      pendingEnrollmentCount: 27,
      publishedCourses: 7,
      draftCourses: 3,
      newUsers30Days: 12,
      submissionsToGrade: 9,
    });
    expect(result.data?.pendingEnrollments).toHaveLength(5);
    expect(
      queries.find((q) => q.table === "enrollments" && q.limit === 5)?.options,
    ).toEqual({ count: "exact" });
  });

  it("counts published courses and submitted assessments with their actual status filters", async () => {
    await buildAdminDashboardKPIs();
    expect(
      queries.find((q) => q.table === "courses" && q.filters.status === "open")
        ?.filters,
    ).toEqual({ status: "open", is_published: true });
    expect(
      queries.find((q) => q.table === "assessment_submissions")?.filters,
    ).toEqual({ status: "submitted" });
    const cutoff = queries.find(
      (q) => q.table === "profiles" && q.filters.created_at,
    )?.filters.created_at as string;
    expect(
      Math.abs(Date.now() - new Date(cutoff).getTime() - 30 * 86400000),
    ).toBeLessThan(1000);
  });

  it("returns an unavailable state rather than false zeroes when a metric query fails", async () => {
    failedTable = "courses";
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    try {
      const result = await buildAdminDashboardKPIs();
      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
    } finally {
      spy.mockRestore();
    }
  });
});
