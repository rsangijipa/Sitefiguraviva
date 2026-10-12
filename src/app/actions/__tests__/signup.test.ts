import {
  registerForCourseAction,
  resendConfirmationEmailAction,
} from "@/app/actions/signup";

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
  RateLimitPresets: { SIGNUP_ATTEMPT: { maxRequests: 5, windowMs: 600000 } },
}));

const mockCourseMaybeSingle = jest.fn();
const mockProfileMaybeSingle = jest.fn();
const mockSignUp = jest.fn();
const mockResend = jest.fn();
const mockDeleteUser = jest.fn();
const mockProfileInsert = jest.fn();

jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseAuthServerClient: () => ({
    auth: {
      signUp: mockSignUp,
      resend: mockResend,
    },
  }),
  createSupabaseServiceClient: () => ({
    auth: {
      admin: {
        deleteUser: mockDeleteUser,
        updateUserById: jest.fn(),
      },
    },
    from: (table: string) => {
      if (table === "courses") {
        return {
          select: () => ({
            eq: () => ({ maybeSingle: mockCourseMaybeSingle }),
          }),
        };
      }
      if (table === "profiles") {
        return {
          insert: (...args: unknown[]) => mockProfileInsert(...args),
          select: () => ({
            eq: () => ({ maybeSingle: mockProfileMaybeSingle }),
          }),
        };
      }
      return { insert: mockProfileInsert };
    },
  }),
}));

jest.mock("@/lib/auth/email-flow", () => ({
  getAuthEmailRedirect: jest.fn(
    (kind: string, courseId?: string) =>
      `https://www.institutofiguraviva.com.br/auth/${kind}${courseId ? `?courseId=${courseId}` : ""}`,
  ),
}));

const validInput = {
  fullName: "Maria Souza",
  phone: "(69) 99999-1234",
  email: "Maria@Example.com",
  password: "senha-forte-123",
  courseId: "curso-gestalt",
};

describe("registerForCourseAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDeleteUser.mockResolvedValue({ error: null });
    mockRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 4,
      resetAt: Date.now() + 60000,
    });
    mockCourseMaybeSingle.mockResolvedValue({
      data: { id: "curso-gestalt", is_published: true, status: "open" },
    });
    mockSignUp.mockResolvedValue({
      data: {
        user: {
          id: "uuid-123",
          identities: [{ id: "identity-1", user_id: "uuid-123" }],
        },
      },
      error: null,
    });
    mockProfileInsert.mockResolvedValue({ error: null });
  });

  it("refuses to create an account without a course", async () => {
    const result = await registerForCourseAction({
      ...validInput,
      courseId: "",
    });

    expect(result.success).toBe(false);
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("refuses when the course does not exist", async () => {
    mockCourseMaybeSingle.mockResolvedValue({ data: null });

    const result = await registerForCourseAction(validInput);

    expect(result.success).toBe(false);
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("refuses when the course is not published", async () => {
    mockCourseMaybeSingle.mockResolvedValue({
      data: { id: "curso-gestalt", is_published: false },
    });

    const result = await registerForCourseAction(validInput);

    expect(result.success).toBe(false);
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("refuses a weak password before touching Supabase", async () => {
    const result = await registerForCourseAction({
      ...validInput,
      password: "123",
    });

    expect(result.success).toBe(false);
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("refuses when the rate limit is exceeded", async () => {
    mockRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 60000,
    });

    const result = await registerForCourseAction(validInput);

    expect(result.success).toBe(false);
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("creates an unconfirmed, pending account via auth.signUp without auto-confirming", async () => {
    const result = await registerForCourseAction(validInput);
    expect(result).toEqual({
      success: true,
      courseId: "curso-gestalt",
      email: "maria@example.com",
      requiresAdminApproval: true,
      requiresEmailVerification: true,
    });
    expect(mockSignUp).toHaveBeenCalledWith({
      email: "maria@example.com",
      password: "senha-forte-123",
      options: {
        data: {
          full_name: "Maria Souza",
          phone: "(69) 99999-1234",
          course_interest: "curso-gestalt",
        },
        emailRedirectTo: expect.stringContaining("/auth/verify"),
      },
    });
    expect(mockProfileInsert).toHaveBeenCalledWith({
      id: "uuid-123",
      email: "maria@example.com",
      display_name: "Maria Souza",
      phone_number: "(69) 99999-1234",
      role: "student",
      is_active: false,
      registration_status: "pending",
    });
  });

  it("refuses duplicate registration when identities is empty (email enumeration protection)", async () => {
    mockSignUp.mockResolvedValue({
      data: {
        user: {
          id: "uuid-existing",
          identities: [],
        },
      },
      error: null,
    });

    const result = await registerForCourseAction(validInput);
    expect(result.success).toBe(false);
    expect(result.error).toContain("já tem uma conta");
    expect(mockProfileInsert).not.toHaveBeenCalled();
  });

  it("rejects a closed course and database failures", async () => {
    mockCourseMaybeSingle.mockResolvedValue({
      data: { is_published: true, status: "closed" },
      error: null,
    });
    expect((await registerForCourseAction(validInput)).success).toBe(false);
    mockCourseMaybeSingle.mockResolvedValue({
      data: { is_published: true, status: "open" },
      error: { message: "DB failure" },
    });
    expect((await registerForCourseAction(validInput)).success).toBe(false);
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("cleans up the auth user if profile insertion fails to prevent orphaned auth accounts", async () => {
    mockProfileInsert.mockResolvedValue({
      error: { message: "database unavailable" },
    });
    const result = await registerForCourseAction(validInput);
    expect(result.success).toBe(false);
    expect(mockDeleteUser).toHaveBeenCalledWith("uuid-123");
  });
});

describe("resendConfirmationEmailAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 4,
      resetAt: Date.now() + 60000,
    });
    mockResend.mockResolvedValue({ data: {}, error: null });
    mockProfileMaybeSingle.mockResolvedValue({
      data: { id: "uuid-1", is_active: false, registration_status: "pending" },
    });
  });

  it("rejects invalid email formats", async () => {
    const result = await resendConfirmationEmailAction("invalid-email");
    expect(result.success).toBe(false);
    expect(result.message).toContain("válido");
    expect(mockResend).not.toHaveBeenCalled();
  });

  it("enforces rate limits", async () => {
    mockRateLimit.mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 120000,
    });
    const result = await resendConfirmationEmailAction("user@example.com");
    expect(result.success).toBe(false);
    expect(result.message).toContain("Muitas tentativas");
    expect(mockResend).not.toHaveBeenCalled();
  });

  it("resends confirmation email for pending accounts", async () => {
    const result = await resendConfirmationEmailAction("aluno@example.com");
    expect(result.success).toBe(true);
    expect(mockResend).toHaveBeenCalledWith({
      type: "signup",
      email: "aluno@example.com",
      options: {
        emailRedirectTo: expect.stringContaining("/auth/verify"),
      },
    });
  });

  it("notifies already active accounts to log in instead", async () => {
    mockProfileMaybeSingle.mockResolvedValueOnce({
      data: { id: "uuid-active", is_active: true, registration_status: "approved" },
    });
    const result = await resendConfirmationEmailAction("ativo@example.com");
    expect(result.success).toBe(false);
    expect(result.message).toContain("já foi confirmado");
    expect(mockResend).not.toHaveBeenCalled();
  });
});
