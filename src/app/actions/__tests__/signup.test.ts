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
const mockCreateUser = jest.fn();
const mockProfileUpsert = jest.fn();

jest.mock("@/infrastructure/supabase/server", () => ({
  createSupabaseServiceClient: () => ({
    auth: {
      admin: {
        createUser: (...args: unknown[]) => mockCreateUser(...args),
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
      return { upsert: (...args: unknown[]) => mockProfileUpsert(...args) };
    },
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
    mockRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 4,
      resetAt: Date.now() + 60000,
    });
    mockCourseMaybeSingle.mockResolvedValue({
      data: { id: "curso-gestalt", is_published: true },
    });
    mockCreateUser.mockResolvedValue({
      data: { user: { id: "uuid-123" } },
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
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it("refuses when the course does not exist", async () => {
    mockCourseMaybeSingle.mockResolvedValue({ data: null });

    const result = await registerForCourseAction(validInput);

    expect(result.success).toBe(false);
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it("refuses when the course is not published", async () => {
    mockCourseMaybeSingle.mockResolvedValue({
      data: { id: "curso-gestalt", is_published: false },
    });

    const result = await registerForCourseAction(validInput);

    expect(result.success).toBe(false);
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it("refuses a weak password before touching Supabase", async () => {
    const result = await registerForCourseAction({
      ...validInput,
      password: "123",
    });

    expect(result.success).toBe(false);
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it("refuses when the rate limit is exceeded", async () => {
    mockRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 60000,
    });

    const result = await registerForCourseAction(validInput);

    expect(result.success).toBe(false);
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it("creates the account, persists name/phone and records the course interest", async () => {
    const result = await registerForCourseAction(validInput);

    expect(result.success).toBe(true);

    expect(mockCreateUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "maria@example.com",
        password: "senha-forte-123",
        user_metadata: expect.objectContaining({
          full_name: "Maria Souza",
          phone: "(69) 99999-1234",
          course_interest: "curso-gestalt",
        }),
      }),
    );

    // The old client-side signup dropped the name on the floor.
    expect(mockProfileUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "uuid-123",
        email: "maria@example.com",
        display_name: "Maria Souza",
        role: "student",
        is_active: true,
      }),
    );
  });

  it("reports an already-registered email without leaking internals", async () => {
    mockCreateUser.mockResolvedValue({
      data: { user: null },
      error: {
        code: "email_exists",
        message: "A user with this email address has already been registered",
      },
    });

    const result = await registerForCourseAction(validInput);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/já/i);
    expect(result.error).not.toMatch(/supabase|email_exists/i);
  });
});
