import { registerForCourseAction } from "@/app/actions/signup";

jest.mock("next/headers", () => ({
  headers: jest.fn(() =>
    Promise.resolve({
      get: jest.fn(() => "203.0.113.10"),
    }),
  ),
}));

jest.mock("firebase-admin/firestore", () => ({
  Timestamp: { now: jest.fn(() => "MOCK_TIMESTAMP") },
}));

const mockRateLimit = jest.fn();
jest.mock("@/lib/rateLimit", () => ({
  rateLimit: (...args: unknown[]) => mockRateLimit(...args),
  getClientIdentifier: jest.fn(() => "203.0.113.10"),
  RateLimitPresets: { SIGNUP_ATTEMPT: { maxRequests: 5, windowMs: 600000 } },
}));

const mockCreateUser = jest.fn();
const mockSetCustomUserClaims = jest.fn();
const mockCourseGet = jest.fn();
const mockUserSet = jest.fn();

jest.mock("@/lib/firebase/admin", () => ({
  adminAuth: {
    createUser: (...args: unknown[]) => mockCreateUser(...args),
    setCustomUserClaims: (...args: unknown[]) =>
      mockSetCustomUserClaims(...args),
  },
  adminDb: {
    collection: jest.fn((name: string) => ({
      doc: jest.fn(() => {
        if (name === "courses") return { get: mockCourseGet };
        return { set: mockUserSet };
      }),
    })),
  },
}));

const validInput = {
  fullName: "Maria Souza",
  phone: "(69) 99999-1234",
  email: "Maria@Example.com",
  password: "senha-forte-123",
  courseId: "curso-gestalt",
};

const publishedCourse = {
  exists: true,
  data: () => ({ title: "Formação em Gestalt", isPublished: true }),
};

describe("registerForCourseAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 4,
      resetAt: Date.now() + 60000,
    });
    mockCourseGet.mockResolvedValue(publishedCourse);
    mockCreateUser.mockResolvedValue({ uid: "uid-123" });
    mockSetCustomUserClaims.mockResolvedValue(undefined);
    mockUserSet.mockResolvedValue(undefined);
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
    mockCourseGet.mockResolvedValue({ exists: false, data: () => undefined });

    const result = await registerForCourseAction(validInput);

    expect(result.success).toBe(false);
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it("refuses when the course is not published", async () => {
    mockCourseGet.mockResolvedValue({
      exists: true,
      data: () => ({ title: "Rascunho", isPublished: false }),
    });

    const result = await registerForCourseAction(validInput);

    expect(result.success).toBe(false);
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it("refuses a weak password before touching Firebase", async () => {
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
        displayName: "Maria Souza",
      }),
    );

    // The old client-side signup dropped name and phone on the floor.
    expect(mockUserSet).toHaveBeenCalledWith(
      expect.objectContaining({
        uid: "uid-123",
        email: "maria@example.com",
        displayName: "Maria Souza",
        phone: "(69) 99999-1234",
        role: "student",
        isActive: true,
        courseInterest: "curso-gestalt",
      }),
      expect.anything(),
    );

    expect(mockSetCustomUserClaims).toHaveBeenCalledWith("uid-123", {
      role: "student",
      admin: false,
      isActive: true,
    });
  });

  it("reports an already-registered email without leaking internals", async () => {
    mockCreateUser.mockRejectedValue({
      code: "auth/email-already-exists",
      message: "The email address is already in use by another account.",
    });

    const result = await registerForCourseAction(validInput);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/já/i);
    expect(result.error).not.toMatch(/firebase|auth\//i);
  });
});
