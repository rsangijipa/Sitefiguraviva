import { getCourseData } from "@/lib/courseService";
import { assertCanAccessCourse } from "@/lib/auth/access-gate";
import { AccessError, AccessErrorCode } from "@/lib/auth/access-types";
import {
  getCourseSnapshot,
  getLessonsSnapshot,
  getModulesSnapshot,
} from "@/lib/repositories/courseRepository.server";
import { findEnrollmentForCourse } from "@/lib/repositories/enrollmentRepository.server";

jest.mock("@/lib/auth/access-gate", () => ({
  assertCanAccessCourse: jest.fn(),
}));

jest.mock("@/lib/repositories/courseRepository.server", () => ({
  getCourseSnapshot: jest.fn(),
  getModulesSnapshot: jest.fn(),
  getLessonsSnapshot: jest.fn(),
}));

jest.mock("@/lib/repositories/enrollmentRepository.server", () => ({
  findEnrollmentForCourse: jest.fn(),
}));

jest.mock("@/lib/firebase/admin", () => {
  const progressQuery = {
    where: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({
      docs: [
        {
          id: "progress-1",
          data: () => ({
            lessonId: "lesson-1",
            status: "completed",
            percent: 100,
          }),
        },
      ],
    }),
  };

  return {
    db: {
      collection: jest.fn((name: string) => {
        if (name === "progress") return progressQuery;
        return {};
      }),
      batch: jest.fn(),
    },
  };
});

describe("getCourseData", () => {
  const courseId = "course-1";
  const uid = "user-1";

  const docSnapshot = (id: string, data: Record<string, any>) => ({
    id,
    exists: true,
    data: () => data,
  });

  const missingDocSnapshot = (id: string) => ({
    id,
    exists: false,
    data: () => undefined,
  });

  const querySnapshot = (docs: any[]) => ({ docs });

  beforeEach(() => {
    jest.clearAllMocks();
    (assertCanAccessCourse as jest.Mock).mockResolvedValue({
      uid,
      courseId,
      enrollmentId: `${uid}_${courseId}`,
      paymentMethod: "pix",
    });
    (getCourseSnapshot as jest.Mock).mockResolvedValue(
      docSnapshot(courseId, {
        title: "Curso P0",
        isPublished: true,
        status: "open",
        createdAt: { seconds: 1 },
        updatedAt: { seconds: 2 },
      }),
    );
    (getModulesSnapshot as jest.Mock).mockResolvedValue(
      querySnapshot([
        docSnapshot("module-1", {
          title: "Modulo 1",
          order: 1,
          createdAt: { seconds: 1 },
          updatedAt: { seconds: 2 },
        }),
      ]),
    );
    (getLessonsSnapshot as jest.Mock).mockResolvedValue(
      querySnapshot([
        docSnapshot("lesson-1", {
          moduleId: "module-1",
          courseId,
          title: "Aula 1",
          order: 1,
          type: "video",
          updatedAt: { seconds: 2 },
        }),
      ]),
    );
    (findEnrollmentForCourse as jest.Mock).mockResolvedValue({
      id: `${uid}_${courseId}`,
      data: { uid, courseId, status: "active" },
      snapshot: docSnapshot(`${uid}_${courseId}`, {
        uid,
        courseId,
        status: "active",
        createdAt: { seconds: 1 },
      }),
    });
  });

  it("returns the same course DTO shape for an enrolled student", async () => {
    const data = await getCourseData(courseId, uid, false);

    expect(data).toEqual(
      expect.objectContaining({
        isAccessDenied: false,
        course: expect.objectContaining({
          id: courseId,
          title: "Curso P0",
          totalLessons: 1,
        }),
        enrollment: expect.objectContaining({
          id: `${uid}_${courseId}`,
          status: "active",
          progressSummary: expect.objectContaining({
            completedLessonsCount: 1,
            totalLessons: 1,
            percent: 100,
          }),
        }),
      }),
    );
    expect(data?.modules[0].lessons[0]).toEqual(
      expect.objectContaining({ id: "lesson-1", isCompleted: true }),
    );
  });

  it("returns admin data without requiring enrollment", async () => {
    (assertCanAccessCourse as jest.Mock).mockResolvedValue({
      uid,
      courseId,
      enrollmentId: `admin_${uid}_${courseId}`,
      paymentMethod: "admin",
      isAdminOverride: true,
    });

    const data = await getCourseData(courseId, uid, true);

    expect(data?.isAccessDenied).toBe(false);
    expect(data?.enrollment).toBeUndefined();
    expect(findEnrollmentForCourse).not.toHaveBeenCalled();
  });

  it("keeps course metadata with access denied flag for pending enrollment", async () => {
    (assertCanAccessCourse as jest.Mock).mockRejectedValue(
      new AccessError(AccessErrorCode.ENROLLMENT_PENDING),
    );

    const data = await getCourseData(courseId, uid, false);

    expect(data?.isAccessDenied).toBe(true);
    expect(data?.course.id).toBe(courseId);
  });

  it("returns null when course document is missing", async () => {
    (getCourseSnapshot as jest.Mock).mockResolvedValue(
      missingDocSnapshot(courseId),
    );

    await expect(getCourseData(courseId, uid, false)).resolves.toBeNull();
  });
});
