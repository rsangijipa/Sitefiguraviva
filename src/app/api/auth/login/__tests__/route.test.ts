/** @jest-environment node */
const getUser = jest.fn(),
  setCookie = jest.fn(),
  ensureProfile = jest.fn(),
  getClaims = jest.fn(),
  limit = jest.fn();
jest.mock("next/headers", () => ({
  cookies: async () => ({ set: setCookie }),
}));
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: () => ({ auth: { getUser } }),
}));
jest.mock("@/lib/auth/user-service", () => ({
  ensureUserDoc: (...args: unknown[]) => ensureProfile(...args),
}));
jest.mock("@/lib/auth/supabase-session", () => ({
  getSupabaseSessionClaims: (...args: unknown[]) => getClaims(...args),
}));
jest.mock("@/lib/rateLimit", () => ({
  rateLimit: (...args: unknown[]) => limit(...args),
  getClientIdentifier: () => "ip",
  RateLimitPresets: { SESSION_SYNC: {} },
}));
import { POST } from "../route";
const origin = "https://www.institutofiguraviva.com.br";
const request = (
  headers: Record<string, string> = {},
  body = JSON.stringify({ accessToken: "verified-token" }),
) =>
  new Request(origin + "/api/auth/login", {
    method: "POST",
    headers: { origin, "content-type": "application/json", ...headers },
    body,
  });
describe("session creation trust boundary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    limit.mockResolvedValue({ allowed: true });
    getUser.mockResolvedValue({
      data: { user: { id: "student-1", email: "student@example.com" } },
      error: null,
    });
    ensureProfile.mockResolvedValue({ success: true });
    getClaims.mockResolvedValue({ uid: "student-1", isActive: true });
  });
  it("rejects cross-site simple POST before validating a token", async () => {
    expect(
      (
        await POST(
          request({
            origin: "https://attacker.example",
            "content-type": "text/plain",
          }),
        )
      ).status,
    ).toBe(403);
    expect(getUser).not.toHaveBeenCalled();
    expect(setCookie).not.toHaveBeenCalled();
  });
  it("rejects missing origins and non-JSON content", async () => {
    const missing = request();
    missing.headers.delete("origin");
    expect((await POST(missing)).status).toBe(403);
    expect((await POST(request({ "content-type": "text/plain" }))).status).toBe(
      415,
    );
  });
  it("returns 400 for malformed JSON or absent tokens", async () => {
    expect((await POST(request({}, "{"))).status).toBe(400);
    expect((await POST(request({}, "null"))).status).toBe(400);
    expect(setCookie).not.toHaveBeenCalled();
  });
  it("never creates a cookie for invalid or disabled accounts", async () => {
    getUser.mockResolvedValueOnce({
      data: { user: null },
      error: new Error("invalid"),
    });
    expect((await POST(request())).status).toBe(401);
    getClaims.mockResolvedValueOnce(null);
    expect((await POST(request())).status).toBe(403);
    expect(setCookie).not.toHaveBeenCalled();
  });
  it("requires a verified identity and active app profile", async () => {
    expect((await POST(request())).status).toBe(200);
    expect(ensureProfile).toHaveBeenCalledWith(
      expect.objectContaining({ uid: "student-1" }),
    );
    expect(setCookie).toHaveBeenCalledWith(
      "session",
      "verified-token",
      expect.objectContaining({ httpOnly: true, sameSite: "lax" }),
    );
  });
  it("returns temporary unavailability without validating identity or writing a cookie", async () => {
    const unavailable = new Error("unavailable");
    unavailable.name = "RateLimitUnavailableError";
    limit.mockRejectedValue(unavailable);
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(response.headers.get("retry-after")).toBe("30");
    expect(setCookie).not.toHaveBeenCalled();
    expect(getUser).not.toHaveBeenCalled();
  });
});
