import { assertCanAccessCourse } from "../access-gate";
import { AccessErrorCode, AccessError } from "../access-types";
import { adminDb } from "@/lib/firebase/admin";
import { logger } from "@/lib/logger";

// Mocking Firebase Admin
jest.mock("@/lib/firebase/admin", () => ({
  adminDb: {
    collection: jest.fn(),
  },
}));

// Mocking Logger
jest.mock("@/lib/logger", () => ({
  logger: {
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

describe("assertCanAccessCourse Integration Gate", () => {
  const uid = "user_123";
  const courseId = "course_456";

  const mockSnapshot = (data: any = null) => ({
    exists: !!data,
    data: () => data,
    id: data?.id || "doc_id",
  });

  const mockCollection = (docs: Record<string, any>) => ({
    doc: jest.fn((id: string) => ({
      get: jest.fn(async () => mockSnapshot(docs[id])),
    })),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should allow ADMIN override regardless of enrollment", async () => {
    (adminDb.collection as jest.Mock).mockImplementation((name) => {
      if (name === "users") return mockCollection({ [uid]: { role: "admin" } });
      return mockCollection({});
    });

    const result = await assertCanAccessCourse(uid, courseId);
    expect(result.isAdminOverride).toBe(true);
    expect(result.paymentMethod).toBe("admin");
  });

  it("should DENY if course is in DRAFT", async () => {
    (adminDb.collection as jest.Mock).mockImplementation((name) => {
      if (name === "users")
        return mockCollection({ [uid]: { role: "student" } });
      if (name === "courses")
        return mockCollection({
          [courseId]: { isPublished: false, status: "draft" },
        });
      return mockCollection({});
    });

    await expect(assertCanAccessCourse(uid, courseId)).rejects.toThrow(
      expect.objectContaining({ code: AccessErrorCode.COURSE_NOT_PUBLISHED }),
    );
  });

  it("should DENY if course is ARCHIVED", async () => {
    (adminDb.collection as jest.Mock).mockImplementation((name) => {
      if (name === "users")
        return mockCollection({ [uid]: { role: "student" } });
      if (name === "courses")
        return mockCollection({
          [courseId]: { isPublished: true, status: "archived" },
        });
      return mockCollection({});
    });

    await expect(assertCanAccessCourse(uid, courseId)).rejects.toThrow(
      expect.objectContaining({ code: AccessErrorCode.COURSE_ARCHIVED }),
    );
  });

  it("should ALLOW access to CLOSED course if student is ACTIVE", async () => {
    (adminDb.collection as jest.Mock).mockImplementation((name) => {
      if (name === "users")
        return mockCollection({ [uid]: { role: "student" } });
      if (name === "courses")
        return mockCollection({
          [courseId]: { isPublished: true, status: "closed" },
        });
      if (name === "enrollments")
        return mockCollection({
          [`${uid}_${courseId}`]: { status: "active", paymentMethod: "pix" },
        });
      return mockCollection({});
    });

    const result = await assertCanAccessCourse(uid, courseId);
    expect(result.courseId).toBe(courseId);
    expect(result.paymentMethod).toBe("pix");
  });

  it("should ALLOW access via LEGACY profile fallback", async () => {
    (adminDb.collection as jest.Mock).mockImplementation((name) => {
      if (name === "users")
        return mockCollection({
          [uid]: { role: "student", enrolledCourseIds: [courseId] },
        });
      if (name === "courses")
        return mockCollection({
          [courseId]: { isPublished: true, status: "open" },
        });
      if (name === "enrollments") return mockCollection({}); // No enrollment doc
      return mockCollection({});
    });

    const result = await assertCanAccessCourse(uid, courseId);
    expect(result.paymentMethod).toBe("legacy");
    expect(result.enrollmentId).toContain("legacy");
  });

  it("should DENY access if enrollment is PENDING", async () => {
    (adminDb.collection as jest.Mock).mockImplementation((name) => {
      if (name === "users")
        return mockCollection({ [uid]: { role: "student" } });
      if (name === "courses")
        return mockCollection({
          [courseId]: { isPublished: true, status: "open" },
        });
      if (name === "enrollments")
        return mockCollection({
          [`${uid}_${courseId}`]: { status: "pending" },
        });
      return mockCollection({});
    });

    await expect(assertCanAccessCourse(uid, courseId)).rejects.toThrow(
      expect.objectContaining({ code: AccessErrorCode.ENROLLMENT_PENDING }),
    );
  });

  it("should DENY access if enrollment is EXPIRED", async () => {
    (adminDb.collection as jest.Mock).mockImplementation((name) => {
      if (name === "users")
        return mockCollection({ [uid]: { role: "student" } });
      if (name === "courses")
        return mockCollection({
          [courseId]: { isPublished: true, status: "open" },
        });
      if (name === "enrollments")
        return mockCollection({
          [`${uid}_${courseId}`]: { status: "expired" },
        });
      return mockCollection({});
    });

    await expect(assertCanAccessCourse(uid, courseId)).rejects.toThrow(
      expect.objectContaining({
        code: AccessErrorCode.ENROLLMENT_STATUS_NOT_ACTIVE,
      }),
    );
  });

  it("should DENY access if subscription is EXPIRED", async () => {
    const expiredDate = {
      toMillis: () => Date.now() - 1000,
      toDate: () => new Date(Date.now() - 1000),
    };

    (adminDb.collection as jest.Mock).mockImplementation((name) => {
      if (name === "users")
        return mockCollection({ [uid]: { role: "student" } });
      if (name === "courses")
        return mockCollection({
          [courseId]: { isPublished: true, status: "open" },
        });
      if (name === "enrollments")
        return mockCollection({
          [`${uid}_${courseId}`]: {
            status: "active",
            paymentMethod: "subscription",
            accessUntil: expiredDate,
          },
        });
      return mockCollection({});
    });

    await expect(assertCanAccessCourse(uid, courseId)).rejects.toThrow(
      expect.objectContaining({ code: AccessErrorCode.ENROLLMENT_EXPIRED }),
    );
  });
});
