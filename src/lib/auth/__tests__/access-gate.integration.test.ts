import { assertCanAccessCourse } from "../access-gate";
import { AccessErrorCode } from "../access-types";
import { getAdminCourse } from "@/features/courses/infrastructure/supabaseAdminCourseRepository.server";
import { findEnrollmentBySupabaseUser } from "@/features/enrollments/infrastructure/supabaseEnrollmentRepository.server";

jest.mock(
  "@/features/courses/infrastructure/supabaseAdminCourseRepository.server",
  () => ({
    getAdminCourse: jest.fn(),
  }),
);

jest.mock(
  "@/features/enrollments/infrastructure/supabaseEnrollmentRepository.server",
  () => ({
    findEnrollmentBySupabaseUser: jest.fn(),
  }),
);

jest.mock("@/lib/logger", () => ({
  logger: {
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

describe("assertCanAccessCourse", () => {
  const uid = "user_123";
  const courseId = "course_456";

  beforeEach(() => {
    jest.clearAllMocks();
    (getAdminCourse as jest.Mock).mockResolvedValue({
      isPublished: true,
      status: "open",
      id: courseId,
    });
    (findEnrollmentBySupabaseUser as jest.Mock).mockResolvedValue({
      id: `${uid}_${courseId}`,
      status: "active",
      paymentMethod: "pix",
      courseId,
      userId: uid,
    });
  });

  it("allows admin override without course or enrollment reads", async () => {
    const result = await assertCanAccessCourse(uid, courseId, {
      isAdmin: true,
    });

    expect(result.isAdminOverride).toBe(true);
    expect(result.paymentMethod).toBe("admin");
    expect(getAdminCourse).not.toHaveBeenCalled();
    expect(findEnrollmentBySupabaseUser).not.toHaveBeenCalled();
  });

  it("denies draft courses", async () => {
    (getAdminCourse as jest.Mock).mockResolvedValue({
      isPublished: false,
      status: "draft",
      id: courseId,
    });

    await expect(assertCanAccessCourse(uid, courseId)).rejects.toThrow(
      expect.objectContaining({ code: AccessErrorCode.COURSE_NOT_PUBLISHED }),
    );
  });

  it("denies archived courses", async () => {
    (getAdminCourse as jest.Mock).mockResolvedValue({
      isPublished: true,
      status: "archived",
      id: courseId,
    });

    await expect(assertCanAccessCourse(uid, courseId)).rejects.toThrow(
      expect.objectContaining({ code: AccessErrorCode.COURSE_ARCHIVED }),
    );
  });

  it("allows closed courses for active enrollment", async () => {
    (getAdminCourse as jest.Mock).mockResolvedValue({
      isPublished: true,
      status: "closed",
      id: courseId,
    });

    const result = await assertCanAccessCourse(uid, courseId);

    expect(result.courseId).toBe(courseId);
    expect(result.paymentMethod).toBe("pix");
  });

  it("allows completed enrollment", async () => {
    (findEnrollmentBySupabaseUser as jest.Mock).mockResolvedValue({
      id: `${uid}_${courseId}`,
      status: "completed",
      paymentMethod: "free",
      courseId,
      userId: uid,
    });

    const result = await assertCanAccessCourse(uid, courseId);

    expect(result.paymentMethod).toBe("free");
  });

  it("denies missing enrollment", async () => {
    (findEnrollmentBySupabaseUser as jest.Mock).mockResolvedValue(null);

    await expect(assertCanAccessCourse(uid, courseId)).rejects.toThrow(
      expect.objectContaining({ code: AccessErrorCode.ENROLLMENT_NOT_FOUND }),
    );
  });

  it("denies pending enrollment", async () => {
    (findEnrollmentBySupabaseUser as jest.Mock).mockResolvedValue({
      id: `${uid}_${courseId}`,
      status: "pending",
      courseId,
      userId: uid,
    });

    await expect(assertCanAccessCourse(uid, courseId)).rejects.toThrow(
      expect.objectContaining({ code: AccessErrorCode.ENROLLMENT_PENDING }),
    );
  });

  it("denies inactive enrollment status", async () => {
    (findEnrollmentBySupabaseUser as jest.Mock).mockResolvedValue({
      id: `${uid}_${courseId}`,
      status: "expired",
      courseId,
      userId: uid,
    });

    await expect(assertCanAccessCourse(uid, courseId)).rejects.toThrow(
      expect.objectContaining({
        code: AccessErrorCode.ENROLLMENT_STATUS_NOT_ACTIVE,
      }),
    );
  });

  it("denies expired subscriptions", async () => {
    (findEnrollmentBySupabaseUser as jest.Mock).mockResolvedValue({
      status: "active",
      paymentMethod: "subscription",
      accessUntil: {
        toMillis: () => Date.now() - 1000,
        toDate: () => new Date(Date.now() - 1000),
      },
    });

    await expect(assertCanAccessCourse(uid, courseId)).rejects.toThrow(
      expect.objectContaining({ code: AccessErrorCode.ENROLLMENT_EXPIRED }),
    );
  });
});
