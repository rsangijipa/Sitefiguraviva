import {
  isCourseGloballyBlocked,
  isEnrollmentAllowed,
  canConsumeCourse,
} from "../access-policy";
import { CourseDoc, EnrollmentDoc } from "@/types/lms";

describe("Access Policy Logic", () => {
  const mockCourse = (overrides = {}): CourseDoc =>
    ({
      id: "c1",
      title: "Test Course",
      isPublished: true,
      status: "open",
      ...overrides,
    }) as any;

  const mockEnrollment = (overrides = {}): EnrollmentDoc =>
    ({
      userId: "u1",
      courseId: "c1",
      status: "active",
      ...overrides,
    }) as any;

  describe("isCourseGloballyBlocked", () => {
    it("should block unpublished courses", () => {
      expect(isCourseGloballyBlocked(mockCourse({ isPublished: false }))).toBe(
        true,
      );
    });

    it("should block archived courses", () => {
      expect(isCourseGloballyBlocked(mockCourse({ status: "archived" }))).toBe(
        true,
      );
    });

    it("should not block open courses", () => {
      expect(isCourseGloballyBlocked(mockCourse({ status: "open" }))).toBe(
        false,
      );
    });

    it("should not block closed courses", () => {
      expect(isCourseGloballyBlocked(mockCourse({ status: "closed" }))).toBe(
        false,
      );
    });
  });

  describe("isEnrollmentAllowed", () => {
    it("should allow active status", () => {
      expect(isEnrollmentAllowed(mockEnrollment({ status: "active" }))).toBe(
        true,
      );
    });

    it("should allow completed status", () => {
      expect(isEnrollmentAllowed(mockEnrollment({ status: "completed" }))).toBe(
        true,
      );
    });

    it("should deny pending status", () => {
      expect(isEnrollmentAllowed(mockEnrollment({ status: "pending" }))).toBe(
        false,
      );
    });

    it("should deny expired status", () => {
      expect(isEnrollmentAllowed(mockEnrollment({ status: "expired" }))).toBe(
        false,
      );
    });

    it("should deny null enrollment", () => {
      expect(isEnrollmentAllowed(null)).toBe(false);
    });
  });

  describe("canConsumeCourse (Integration)", () => {
    it("should allow access to closed course for active student", () => {
      const course = mockCourse({ status: "closed" });
      const enrollment = mockEnrollment({ status: "active" });
      expect(canConsumeCourse(course, enrollment)).toBe(true);
    });

    it("should allow access to closed course for completed student", () => {
      const course = mockCourse({ status: "closed" });
      const enrollment = mockEnrollment({ status: "completed" });
      expect(canConsumeCourse(course, enrollment)).toBe(true);
    });

    it("should deny access to archived course even for active student", () => {
      const course = mockCourse({ status: "archived" });
      const enrollment = mockEnrollment({ status: "active" });
      expect(canConsumeCourse(course, enrollment)).toBe(false);
    });

    it("should deny access to draft course even for active student", () => {
      const course = mockCourse({ isPublished: false });
      const enrollment = mockEnrollment({ status: "active" });
      expect(canConsumeCourse(course, enrollment)).toBe(false);
    });
  });
});
