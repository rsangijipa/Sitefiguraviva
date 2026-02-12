import { EnrollmentDoc, CourseDoc } from "@/types/lms";

/**
 * SSoT: Single Source of Truth for LMS Access Policy.
 * Centralizes rules for course consumption.
 *
 * Objectives:
 * 1. Relax "closed" status for existing students.
 * 2. Allow access for "completed" students.
 * 3. Strict block for "archived" or unpublished (draft) courses.
 */

export const BLOCKED_COURSE_STATUSES = ["archived"];

/**
 * Checks if the course is unavailable for everyone (students).
 */
export function isCourseGloballyBlocked(course: CourseDoc): boolean {
  // Drafts are blocked for students
  if (course.isPublished === false) return true;

  // Explicitly archived courses are blocked
  if (BLOCKED_COURSE_STATUSES.includes(course.status)) return true;

  return false;
}

/**
 * Checks if the user's enrollment status allows content consumption.
 */
export function isEnrollmentAllowed(
  enrollment: EnrollmentDoc | null | undefined,
): boolean {
  if (!enrollment) return false;

  const allowedStatuses = ["active", "completed"];
  return allowedStatuses.includes(enrollment.status);
}

/**
 * Final Policy: Can this user consume this course content?
 */
export function canConsumeCourse(
  course: CourseDoc,
  enrollment: EnrollmentDoc | null | undefined,
  isAdmin: boolean = false,
): boolean {
  // 0. Admin override - Admins can see everything except archived
  if (isAdmin) {
    if (course.status === "archived") return false;
    return true;
  }

  // 1. Hard deny overrides everything: archiving or draft
  if (isCourseGloballyBlocked(course)) return false;

  // 2. Enrollment check: active or completed allows access even if course is "closed"
  if (isEnrollmentAllowed(enrollment)) return true;

  // 3. Otherwise barred
  return false;
}
