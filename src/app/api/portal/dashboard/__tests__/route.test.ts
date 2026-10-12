/** @jest-environment node */
const claims = jest.fn();
const from = jest.fn();
jest.mock("@/lib/auth/supabase-session", () => ({ getBearerSupabaseSessionClaims: () => claims() }));
jest.mock("@/infrastructure/supabase/server", () => ({ createSupabaseServiceClient: () => ({ from }) }));
import { GET } from "../route";
function query(data: unknown[]) {
  const result: any = { data, error: null };
  result.select = jest.fn(() => result);
  result.eq = jest.fn(() => result);
  result.order = jest.fn(() => Promise.resolve({ data, error: null }));
  result.in = jest.fn(() => Promise.resolve({ data, error: null }));
  return result;
}
beforeEach(() => jest.clearAllMocks());
it("rejects inactive sessions before reading any courses", async () => {
  claims.mockResolvedValue({ uid: "student", isActive: false });
  expect((await GET(new Request("https://example.test/api/portal/dashboard"))).status).toBe(401);
  expect(from).not.toHaveBeenCalled();
});
it("preserves Postgres ISO dates and enrollment order without exposing internal fields", async () => {
  claims.mockResolvedValue({ uid: "student", isActive: true });
  const enrolledAt = "2026-10-04T12:00:00+00:00";
  const expiresAt = "2027-10-04T12:00:00+00:00";
  const enrollments = query([
    { id: "e2", course_id: "two", enrolled_at: enrolledAt, access_until: expiresAt, legacy_payload: "private" },
    { id: "e1", course_id: "one", enrolled_at: "2026-01-01T12:00:00+00:00", access_until: null },
  ]);
  from.mockImplementation((table: string) => table === "enrollments" ? enrollments : query([{id:"one",title:"One"},{id:"two",title:"Two"}]));
  const response = await GET(new Request("https://example.test/api/portal/dashboard"));
  const body = await response.json();
  expect(enrollments.eq).toHaveBeenCalledWith("user_id", "student");
  expect(body.enrolledCourses.map((row: any) => row.id)).toEqual(["two", "one"]);
  expect(body.enrolledCourses[0].enrollment).toMatchObject({enrolledAt, accessExpiresAt: expiresAt});
  expect(body.enrolledCourses[1].enrollment.accessExpiresAt).toBeNull();
  expect(body.enrolledCourses[0].enrollment).not.toHaveProperty("legacy_payload");
});
