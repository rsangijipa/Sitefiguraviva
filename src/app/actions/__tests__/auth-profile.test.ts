const getUser = jest.fn(),
  verify = jest.fn(),
  claims = jest.fn(),
  ensure = jest.fn(),
  maybeSingle = jest.fn(),
  update = jest.fn(),
  updateEq = jest.fn(),
  setCookie = jest.fn();
jest.mock("next/headers", () => ({
  cookies: async () => ({ set: setCookie }),
}));
jest.mock("@/lib/auth/server", () => ({ verifySession: () => verify() }));
jest.mock("@/lib/auth/supabase-session", () => ({
  getSupabaseSessionClaims: (token: string) => claims(token),
  readTokenExpirySeconds: () => 3600,
}));
jest.mock("@/lib/auth/user-service", () => ({
  ensureUserDoc: (input: unknown) => ensure(input),
}));
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: () => ({
    auth: { getUser },
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle }) }), update }),
  }),
}));
import { ensureUserProfileAction } from "../auth";
describe("profile sync identity binding", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getUser.mockResolvedValue({
      data: {
        user: {
          id: "new-user",
          email: "new@example.com",
          user_metadata: { role: "admin" },
        },
      },
      error: null,
    });
    ensure.mockResolvedValue({ success: true });
    claims.mockResolvedValue({
      uid: "new-user",
      email: "new@example.com",
      role: "student",
      isActive: true,
      admin: false,
      tutor: false,
    });
    verify.mockResolvedValue({
      uid: "old-admin",
      isAdmin: true,
      isActive: true,
    });
    maybeSingle.mockResolvedValue({
      data: { role: "student", is_active: true },
      error: null,
    });
    update.mockReturnValue({ eq: updateEq });
    updateEq.mockResolvedValue({ error: null });
  });
  it("uses the newly verified token rather than an old cookie", async () => {
    const result = await ensureUserProfileAction("new-token");
    expect(result.user?.uid).toBe("new-user");
    expect(result.user?.role).toBe("student");
    expect(verify).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith({ last_login_at: expect.any(String) });
    expect(setCookie).toHaveBeenCalledWith(
      "session",
      "new-token",
      expect.any(Object),
    );
  });
  it("never falls back to the old account for an invalid provided token", async () => {
    getUser.mockResolvedValue({
      data: { user: null },
      error: new Error("invalid"),
    });
    expect((await ensureUserProfileAction("invalid")).success).toBe(false);
    expect(verify).not.toHaveBeenCalled();
    expect(setCookie).not.toHaveBeenCalled();
  });
  it("does not write a cookie when profile lookup or update fails", async () => {
    maybeSingle.mockResolvedValueOnce({
      data: null,
      error: new Error("lookup"),
    });
    expect((await ensureUserProfileAction("new-token")).success).toBe(false);
    updateEq.mockResolvedValueOnce({ error: new Error("write") });
    expect((await ensureUserProfileAction("new-token")).success).toBe(false);
    expect(setCookie).not.toHaveBeenCalled();
  });
});
