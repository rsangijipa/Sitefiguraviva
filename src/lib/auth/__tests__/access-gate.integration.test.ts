import { verifySession } from "../server";
jest.mock("../server", () => ({ verifySession: jest.fn() }));
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
    jest.resetAllMocks();
    jest
      .mocked(verifySession)
      .mockResolvedValue({
        uid,
        isActive: true,
        isAdmin: false,
        isStaff: false,
      });
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

  it("derives admin preview from the verified session and checks course existence", async () => {
    jest
      .mocked(verifySession)
      .mockResolvedValue({ uid, isActive: true, isAdmin: true, isStaff: true });
    const result = await assertCanAccessCourse(uid, courseId, {
      isAdmin: true,
    });

    expect(result.isAdminOverride).toBe(true);
    expect(result.paymentMethod).toBe("admin");
    expect(getAdminCourse).toHaveBeenCalledWith(courseId);
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

describe("course identity and expiry boundaries", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest
      .mocked(verifySession)
      .mockResolvedValue({
        uid: "student",
        isActive: true,
        isAdmin: false,
        isStaff: false,
      });
    jest
      .mocked(getAdminCourse)
      .mockResolvedValue({
        id: "course",
        isPublished: true,
        status: "open",
      } as any);
    jest
      .mocked(findEnrollmentBySupabaseUser)
      .mockResolvedValue({ status: "active", paymentMethod: "pix" } as any);
  });
  it("rejects visitors before reading administrative data", async () => {
    jest.mocked(verifySession).mockResolvedValue(null);
    await expect(
      assertCanAccessCourse("student", "course", { isAdmin: true }),
    ).rejects.toMatchObject({ code: AccessErrorCode.AUTH_REQUIRED });
    expect(getAdminCourse).not.toHaveBeenCalled();
  });
  it("rejects another user's identity even for an admin", async () => {
    jest
      .mocked(verifySession)
      .mockResolvedValue({
        uid: "admin",
        isActive: true,
        isAdmin: true,
        isStaff: true,
      });
    await expect(
      assertCanAccessCourse("student", "course", { isAdmin: true }),
    ).rejects.toMatchObject({ code: AccessErrorCode.ACCESS_DENIED });
    expect(getAdminCourse).not.toHaveBeenCalled();
  });
  it("ignores forged admin flags", async () => {
    jest.mocked(findEnrollmentBySupabaseUser).mockResolvedValue(null);
    await expect(
      assertCanAccessCourse("student", "course", { isAdmin: true }),
    ).rejects.toMatchObject({ code: AccessErrorCode.ENROLLMENT_NOT_FOUND });
  });
  it.each(["not-a-date", "2000-01-01T00:00:00Z"])(
    "blocks invalid or expired access for Pix: %s",
    async (accessUntil) => {
      jest
        .mocked(findEnrollmentBySupabaseUser)
        .mockResolvedValue({
          status: "active",
          paymentMethod: "pix",
          accessUntil,
        } as any);
      await expect(
        assertCanAccessCourse("student", "course"),
      ).rejects.toBeInstanceOf(Error);
    },
  );
  it("allows only the assigned course team to preview draft lessons of a published course", async () => {
    jest
      .mocked(getAdminCourse)
      .mockResolvedValue({
        id: "course",
        isPublished: true,
        status: "closed",
        team: { student: { role: "author" } },
      } as any);
    expect(await assertCanAccessCourse("student", "course")).toMatchObject({
      isTeamPreview: true,
      isAdminOverride: false,
    });
    expect(findEnrollmentBySupabaseUser).not.toHaveBeenCalled();
  });
  it("does not grant course access from a global tutor role", async () => {
    jest
      .mocked(verifySession)
      .mockResolvedValue({
        uid: "student",
        isActive: true,
        isAdmin: false,
        isStaff: true,
      });
    jest.mocked(findEnrollmentBySupabaseUser).mockResolvedValue(null);
    await expect(
      assertCanAccessCourse("student", "course"),
    ).rejects.toBeInstanceOf(Error);
  });
  it("blocks a draft status even if the publication flag is inconsistent", async () => {
    jest
      .mocked(getAdminCourse)
      .mockResolvedValue({
        id: "course",
        isPublished: true,
        status: "draft",
      } as any);
    await expect(
      assertCanAccessCourse("student", "course"),
    ).rejects.toBeInstanceOf(Error);
  });
});
