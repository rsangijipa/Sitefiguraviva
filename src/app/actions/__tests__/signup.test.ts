import { registerForCourseAction } from "@/app/actions/signup";

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
const mockSignUp = jest.fn();
const mockSignOut = jest.fn();
const mockProfileUpsert = jest.fn();

jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: () => ({
    from: (table: string) => {
      if (table === "courses") {
        return {
          select: () => ({
            eq: () => ({ maybeSingle: mockCourseMaybeSingle }),
          }),
        };
      }
      return { upsert: (...args: unknown[]) => mockProfileUpsert(...args) };
    },
  }),
  createSupabaseAuthServerClient: () => ({
    auth: { signUp: mockSignUp, signOut: mockSignOut },
  }),
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
    process.env.NEXT_PUBLIC_BASE_URL = "https://www.institutofiguraviva.com.br";
    mockSignOut.mockResolvedValue({ error: null });
    mockRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 4,
      resetAt: Date.now() + 60000,
    });
    mockCourseMaybeSingle.mockResolvedValue({
      data: { id: "curso-gestalt", is_published: true, status: "open" },
    });
    mockSignUp.mockResolvedValue({
      data: { user: { id: "uuid-123" }, session: null },
      error: null,
    });
    mockProfileUpsert.mockResolvedValue({ error: null });
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

  it("requests email confirmation without writing profiles or granting a session", async () => {
    const result = await registerForCourseAction(validInput);
    expect(result).toEqual({
      success: true,
      courseId: "curso-gestalt",
      requiresEmailConfirmation: true,
    });
    expect(mockSignUp).toHaveBeenCalledWith({
      email: "maria@example.com",
      password: "senha-forte-123",
      options: {
        emailRedirectTo:
          "https://www.institutofiguraviva.com.br/auth/confirm?courseId=curso-gestalt",
        data: {
          full_name: "Maria Souza",
          phone: "(69) 99999-1234",
          course_interest: "curso-gestalt",
        },
      },
    });
    expect(mockProfileUpsert).not.toHaveBeenCalled();
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
  it("never writes an obfuscated existing account response into profiles", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: { id: "fake-existing-id", identities: [] }, session: null },
      error: null,
    });
    expect((await registerForCourseAction(validInput)).success).toBe(true);
    expect(mockProfileUpsert).not.toHaveBeenCalled();
  });
  it("fails closed when confirmation is disabled and a session is returned", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: { id: "uuid" }, session: { access_token: "unexpected" } },
      error: null,
    });
    expect((await registerForCourseAction(validInput)).success).toBe(false);
    expect(mockSignOut).toHaveBeenCalled();
    expect(mockProfileUpsert).not.toHaveBeenCalled();
  });
  it("reports delivery failures without leaking provider details", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { code: "smtp_error", message: "private SMTP detail" },
    });
    const result = await registerForCourseAction(validInput);
    expect(result.success).toBe(false);
    expect(result.error).not.toMatch(/private|smtp_error/);
  });
});
