/** @jest-environment node */
const rpc = jest.fn(),
  claims = jest.fn(),
  limit = jest.fn();
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: () => ({ rpc }),
}));
jest.mock("@/lib/auth/supabase-session", () => ({
  getBearerSupabaseSessionClaims: () => claims(),
}));
jest.mock("@/lib/rateLimit", () => ({
  rateLimit: () => limit(),
  RateLimitPresets: { APPLICATION_SUBMIT: {} },
}));
import { POST } from "../route";
const body = {
  courseId: "course-a",
  answers: {
    fullName: "Maria Souza",
    phone: "69999991234",
    profession: "Psicóloga",
  },
  consent: { lgpd: true },
};
const req = (value: any) =>
  ({
    text: async () =>
      typeof value === "string" ? value : JSON.stringify(value),
  }) as any;
describe("application contract", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    claims.mockResolvedValue({ uid: "user-1", isActive: true });
    limit.mockResolvedValue({ allowed: true });
    rpc.mockResolvedValue({
      data: { applicationId: "user-1_course-a", status: "submitted" },
      error: null,
    });
  });
  it("binds identity and uses the atomic application operation", async () => {
    const response = await POST(req(body));
    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith("submit_course_application", {
      p_user: "user-1",
      p_course: "course-a",
      p_answers: body.answers,
    });
  });
  it("rejects malformed JSON and empty answers", async () => {
    expect((await POST(req("{"))).status).toBe(400);
    expect((await POST(req({ ...body, answers: {} }))).status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });
  it("requires explicit consent", async () => {
    expect(
      (await POST(req({ ...body, consent: { lgpd: false } }))).status,
    ).toBe(400);
    expect((await POST(req({ ...body, consent: undefined }))).status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });
  it("rejects unavailable courses without exposing database detail", async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { code: "P0001", message: "private DB detail" },
    });
    const response = await POST(req(body));
    expect(response.status).toBe(400);
    expect(JSON.stringify(await response.json())).not.toContain("private");
  });
  it("preserves the finalized status returned by the transaction", async () => {
    rpc.mockResolvedValue({
      data: { applicationId: "id", status: "enrolled" },
      error: null,
    });
    const response = await POST(req(body));
    expect((await response.json()).status).toBe("enrolled");
  });
  it("denies inactive profiles and exhausted rate limits", async () => {
    claims.mockResolvedValue({ uid: "user-1", isActive: false });
    expect((await POST(req(body))).status).toBe(401);
    claims.mockResolvedValue({ uid: "user-1", isActive: true });
    limit.mockResolvedValue({ allowed: false });
    expect((await POST(req(body))).status).toBe(429);
    expect(rpc).not.toHaveBeenCalled();
  });
});
