import { verifyEmailOtpAction } from "@/app/actions/verify-email";

jest.mock("next/headers", () => ({
  headers: jest.fn(() =>
    Promise.resolve({
      get: jest.fn(() => "203.0.113.10"),
    }),
  ),
}));

const mockRateLimit = jest.fn();
jest.mock("@/lib/rateLimit", () => ({
  rateLimit: (...args: unknown[]) => mockRateLimit(...args),
  getClientIdentifier: jest.fn(() => "203.0.113.10"),
}));

const mockVerifyOtp = jest.fn();
jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseAuthServerClient: () => ({
    auth: {
      verifyOtp: mockVerifyOtp,
    },
  }),
}));

describe("verifyEmailOtpAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 9,
      resetAt: Date.now() + 60000,
    });
    mockVerifyOtp.mockResolvedValue({
      data: { user: { id: "user-1", email: "aluno@example.com" } },
      error: null,
    });
  });

  it("verifies a valid token hash successfully", async () => {
    const result = await verifyEmailOtpAction("token_hash_123456", "email");
    expect(result).toEqual({
      success: true,
      emailConfirmed: true,
    });
    expect(mockVerifyOtp).toHaveBeenCalledWith({
      token_hash: "token_hash_123456",
      type: "email",
    });
  });

  it("rejects short or empty tokens before calling Supabase", async () => {
    const result = await verifyEmailOtpAction("123", "email");
    expect(result.success).toBe(false);
    expect(result.error).toContain("inválido");
    expect(mockVerifyOtp).not.toHaveBeenCalled();
  });

  it("enforces rate limits on verification attempts", async () => {
    mockRateLimit.mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 60000,
    });
    const result = await verifyEmailOtpAction("token_hash_123456", "email");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Muitas tentativas");
    expect(mockVerifyOtp).not.toHaveBeenCalled();
  });

  it("returns a friendly error message when token is expired or invalid", async () => {
    mockVerifyOtp.mockResolvedValue({
      data: { user: null },
      error: { message: "Token has expired or is invalid" },
    });
    const result = await verifyEmailOtpAction("token_expired_123456", "email");
    expect(result.success).toBe(false);
    expect(result.error).toContain("inválido ou expirado");
  });

  it("retries with fallback type signup if email fails", async () => {
    mockVerifyOtp
      .mockResolvedValueOnce({
        data: { user: null },
        error: { message: "Invalid OTP type" },
      })
      .mockResolvedValueOnce({
        data: { user: { id: "user-1", email: "aluno@example.com" } },
        error: null,
      });

    const result = await verifyEmailOtpAction("token_hash_123456", "email");
    expect(result).toEqual({
      success: true,
      emailConfirmed: true,
    });
    expect(mockVerifyOtp).toHaveBeenCalledTimes(2);
    expect(mockVerifyOtp).toHaveBeenNthCalledWith(1, {
      token_hash: "token_hash_123456",
      type: "email",
    });
    expect(mockVerifyOtp).toHaveBeenNthCalledWith(2, {
      token_hash: "token_hash_123456",
      type: "signup",
    });
  });
});
