jest.mock("next/headers", () => ({ headers: async () => new Headers() }));
const limit = jest.fn(),
  reset = jest.fn(),
  redirect = jest.fn();
jest.mock("@/lib/rateLimit", () => ({
  rateLimit: (...args: unknown[]) => limit(...args),
  getClientIdentifier: () => "trusted-ip",
  RateLimitPresets: { PASSWORD_RESET: { maxRequests: 3, windowMs: 600000 } },
}));
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseAuthServerClient: () => ({
    auth: { resetPasswordForEmail: reset },
  }),
}));
jest.mock("@/lib/auth/email-flow", () => ({
  getAuthEmailRedirect: (...args: unknown[]) => redirect(...args),
}));
import { requestPasswordResetAction } from "../password-reset";
beforeEach(() => {
  jest.clearAllMocks();
  limit.mockResolvedValue({ allowed: true });
  reset.mockResolvedValue({ error: null });
  redirect.mockReturnValue("https://example.com/auth/update-password");
});
it("normalizes email and uses server configured redirect", async () => {
  expect(await requestPasswordResetAction(" USER@example.com ")).toEqual({
    success: true,
  });
  expect(limit).toHaveBeenCalledWith(
    "trusted-ip",
    "password_reset_ip",
    expect.anything(),
  );
  expect(limit).toHaveBeenCalledWith(
    "user@example.com",
    "password_reset_email",
    expect.anything(),
  );
  expect(reset).toHaveBeenCalledWith("user@example.com", {
    redirectTo: "https://example.com/auth/update-password",
  });
  expect(redirect).toHaveBeenCalledWith("recovery");
});
it.each(["invalid", null, {}, "x".repeat(255) + "@example.com"])(
  "rejects invalid input without sending",
  async (email) => {
    expect((await requestPasswordResetAction(email)).success).toBe(false);
    expect(reset).not.toHaveBeenCalled();
    expect(limit).not.toHaveBeenCalled();
  },
);
it("blocks IP burst before Auth", async () => {
  limit.mockResolvedValue({ allowed: false });
  expect((await requestPasswordResetAction("user@example.com")).success).toBe(
    false,
  );
  expect(reset).not.toHaveBeenCalled();
});
it("suppresses repeated target emails without exposing account existence", async () => {
  limit
    .mockResolvedValueOnce({ allowed: true })
    .mockResolvedValueOnce({ allowed: false });
  expect(await requestPasswordResetAction("user@example.com")).toEqual({
    success: true,
  });
  expect(reset).not.toHaveBeenCalled();
});
it("does not send when distributed protection fails", async () => {
  limit.mockRejectedValue(new Error("backend unavailable"));
  expect((await requestPasswordResetAction("user@example.com")).success).toBe(
    false,
  );
  expect(reset).not.toHaveBeenCalled();
});
it("handles SDK and redirect configuration failures", async () => {
  reset.mockResolvedValue({ error: { message: "SMTP failure" } });
  expect((await requestPasswordResetAction("user@example.com")).success).toBe(
    false,
  );
  reset.mockClear();
  redirect.mockImplementation(() => {
    throw new Error("invalid config");
  });
  expect((await requestPasswordResetAction("user@example.com")).success).toBe(
    false,
  );
  expect(reset).not.toHaveBeenCalled();
});
