import { assertCanAccessCourse } from "../access-gate";
import { AccessErrorCode } from "../access-types";
import { getCourseSnapshot } from "@/lib/repositories/courseRepository.server";
import { findEnrollmentForCourse } from "@/lib/repositories/enrollmentRepository.server";

jest.mock("@/lib/repositories/courseRepository.server", () => ({
  getCourseSnapshot: jest.fn(),
}));

jest.mock("@/lib/repositories/enrollmentRepository.server", () => ({
  findEnrollmentForCourse: jest.fn(),
}));

jest.mock("@/lib/logger", () => ({
  logger: {
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

describe("assertCanAccessCourse", () => {
  const uid = "user_123";
  const courseId = "course_456";

  const mockSnapshot = (data: any = null, id = "doc_id") => ({
    exists: !!data,
    data: () => data,
    id,
  });

  const mockEnrollment = (data: any, id = `${uid}_${courseId}`) => ({
    id,
    data,
    snapshot: mockSnapshot(data, id),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (getCourseSnapshot as jest.Mock).mockResolvedValue(
      mockSnapshot({ isPublished: true, status: "open" }, courseId),
    );
    (findEnrollmentForCourse as jest.Mock).mockResolvedValue(
      mockEnrollment({ status: "active", paymentMethod: "pix" }),
    );
  });

  it("allows admin override without course or enrollment reads", async () => {
    const result = await assertCanAccessCourse(uid, courseId, {
      isAdmin: true,
    });

    expect(result.isAdminOverride).toBe(true);
    expect(result.paymentMethod).toBe("admin");
    expect(getCourseSnapshot).not.toHaveBeenCalled();
    expect(findEnrollmentForCourse).not.toHaveBeenCalled();
  });

  it("denies draft courses", async () => {
    (getCourseSnapshot as jest.Mock).mockResolvedValue(
      mockSnapshot({ isPublished: false, status: "draft" }, courseId),
    );

    await expect(assertCanAccessCourse(uid, courseId)).rejects.toThrow(
      expect.objectContaining({ code: AccessErrorCode.COURSE_NOT_PUBLISHED }),
    );
  });

  it("denies archived courses", async () => {
    (getCourseSnapshot as jest.Mock).mockResolvedValue(
      mockSnapshot({ isPublished: true, status: "archived" }, courseId),
    );

    await expect(assertCanAccessCourse(uid, courseId)).rejects.toThrow(
      expect.objectContaining({ code: AccessErrorCode.COURSE_ARCHIVED }),
    );
  });

  it("allows closed courses for active enrollment", async () => {
    (getCourseSnapshot as jest.Mock).mockResolvedValue(
      mockSnapshot({ isPublished: true, status: "closed" }, courseId),
    );

    const result = await assertCanAccessCourse(uid, courseId);

    expect(result.courseId).toBe(courseId);
    expect(result.paymentMethod).toBe("pix");
  });

  it("allows completed enrollment", async () => {
    (findEnrollmentForCourse as jest.Mock).mockResolvedValue(
      mockEnrollment({ status: "completed", paymentMethod: "free" }),
    );

    const result = await assertCanAccessCourse(uid, courseId);

    expect(result.paymentMethod).toBe("free");
  });

  it("denies missing enrollment", async () => {
    (findEnrollmentForCourse as jest.Mock).mockResolvedValue(null);

    await expect(assertCanAccessCourse(uid, courseId)).rejects.toThrow(
      expect.objectContaining({ code: AccessErrorCode.ENROLLMENT_NOT_FOUND }),
    );
  });

  it("denies pending enrollment", async () => {
    (findEnrollmentForCourse as jest.Mock).mockResolvedValue(
      mockEnrollment({ status: "pending" }),
    );

    await expect(assertCanAccessCourse(uid, courseId)).rejects.toThrow(
      expect.objectContaining({ code: AccessErrorCode.ENROLLMENT_PENDING }),
    );
  });

  it("denies inactive enrollment status", async () => {
    (findEnrollmentForCourse as jest.Mock).mockResolvedValue(
      mockEnrollment({ status: "expired" }),
    );

    await expect(assertCanAccessCourse(uid, courseId)).rejects.toThrow(
      expect.objectContaining({
        code: AccessErrorCode.ENROLLMENT_STATUS_NOT_ACTIVE,
      }),
    );
  });

  it("denies expired subscriptions", async () => {
    (findEnrollmentForCourse as jest.Mock).mockResolvedValue(
      mockEnrollment({
        status: "active",
        paymentMethod: "subscription",
        accessUntil: {
          toMillis: () => Date.now() - 1000,
          toDate: () => new Date(Date.now() - 1000),
        },
      }),
    );

    await expect(assertCanAccessCourse(uid, courseId)).rejects.toThrow(
      expect.objectContaining({ code: AccessErrorCode.ENROLLMENT_EXPIRED }),
    );
  });
});
