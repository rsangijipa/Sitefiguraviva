const claims = jest.fn(),
  expiry = jest.fn(),
  set = jest.fn(),
  remove = jest.fn(),
  audit = jest.fn();
jest.mock("@/lib/auth/server", () => ({ verifySession: jest.fn() }));
jest.mock("@/lib/auth/supabase-session", () => ({
  getSupabaseSessionClaims: () => claims(),
  readTokenExpirySeconds: () => expiry(),
}));
jest.mock("@/lib/audit", () => ({
  logAudit: (...args: unknown[]) => audit(...args),
}));
jest.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => ({ value: "backup-token" }),
    set,
    delete: remove,
  }),
}));
jest.mock("next/navigation", () => ({
  redirect: () => {
    throw new Error("REDIRECT");
  },
}));
import { stopImpersonation } from "../authAdmin";
beforeEach(() => {
  jest.clearAllMocks();
  claims.mockResolvedValue({ uid: "admin", admin: true, isActive: true });
  expiry.mockReturnValue(120);
  audit.mockResolvedValue(undefined);
});
it.each([
  { uid: "student", admin: false, isActive: true },
  { uid: "disabled-admin", admin: true, isActive: false },
])(
  "rejects a historical backup without active administrator permissions",
  async (session) => {
    claims.mockResolvedValue(session);
    await expect(stopImpersonation()).rejects.toThrow("REDIRECT");
    expect(set).not.toHaveBeenCalled();
    expect(audit).not.toHaveBeenCalled();
    expect(remove).toHaveBeenCalledWith("admin_session_backup");
  },
);
it("keeps restored cookie expiry inside the verified token lifetime", async () => {
  expect(await stopImpersonation()).toEqual({ success: true });
  expect(set).toHaveBeenCalledWith(
    "session",
    "backup-token",
    expect.objectContaining({ maxAge: 120, sameSite: "lax", httpOnly: true }),
  );
});
it("does not restore a backup token without a remaining lifetime", async () => {
  expiry.mockReturnValue(null);
  await expect(stopImpersonation()).rejects.toThrow("REDIRECT");
  expect(set).not.toHaveBeenCalled();
});
