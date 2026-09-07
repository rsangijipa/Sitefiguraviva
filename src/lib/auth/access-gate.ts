"use server";

import { CourseDoc } from "@/types/lms";
import {
  AccessErrorCode,
  AccessError,
  AccessContext,
  AuthError,
  NotFoundError,
} from "./access-types";
import { isCourseGloballyBlocked, isEnrollmentAllowed } from "./access-policy";
import { logger } from "@/lib/logger";
import { getAdminCourse } from "@/features/courses/infrastructure/supabaseAdminCourseRepository.server";
import { findEnrollmentBySupabaseUser } from "@/features/enrollments/infrastructure/supabaseEnrollmentRepository.server";

/**
 * Canonical Server-Side Access Guard.
 * Validates enrollment status, course publication state, and subscription expiry.
 */
export async function assertCanAccessCourse(
  uid: string | undefined,
  courseId: string,
  options?: {
    isAdmin?: boolean;
  },
): Promise<AccessContext> {
  if (!uid) throw new AuthError();

  // 0. Admin Override Gate - only from verified claims passed by caller
  if (options?.isAdmin === true) {
    return {
      uid,
      courseId,
      enrollmentId: `admin_${uid}_${courseId}`,
      paymentMethod: "admin",
      isAdminOverride: true,
    };
  }

  // 1. Course Level Visibility Check (Fetch FIRST to verify existence)
  const course = await getAdminCourse(courseId);
  if (!course) {
    throw new NotFoundError("Course");
  }

  // Policy: draft or archived block
  if (isCourseGloballyBlocked(course)) {
    const reason =
      course.isPublished === false
        ? AccessErrorCode.COURSE_NOT_PUBLISHED
        : AccessErrorCode.COURSE_ARCHIVED;

    logger.warn("Access Denied: Course Blocked", {
      courseId,
      uid,
      courseStatus: course.status,
      isPublished: course.isPublished,
      reason,
    });

    throw new AccessError(
      reason,
      `Course is ${course.isPublished === false ? "in draft" : course.status}`,
    );
  }

  // 2. Enrollment Lookup (deterministic ID + compatibility fallback)
  const enrollment = await findEnrollmentBySupabaseUser(uid, courseId);

  if (!enrollment) {
    logger.warn("Access Denied: No Enrollment", { courseId, uid });
    throw new AccessError(
      AccessErrorCode.ENROLLMENT_NOT_FOUND,
      "You are not enrolled in this course",
    );
  }

  // 3. Enrollment Level Status Check (Policy: active or completed)
  if (!isEnrollmentAllowed(enrollment as any)) {
    const reason =
      enrollment.status === "pending" ||
      enrollment.status === "pending_approval" ||
      enrollment.status === "awaiting_approval" ||
      enrollment.status === "awaiting_payment"
        ? AccessErrorCode.ENROLLMENT_PENDING
        : AccessErrorCode.ENROLLMENT_STATUS_NOT_ACTIVE;

    logger.warn("Access Denied: Enrollment Status", {
      courseId,
      uid,
      enrollmentStatus: enrollment.status,
      reason,
    });

    throw new AccessError(reason, `Enrollment status is ${enrollment.status}`);
  }

  // 4. Subscription Expiry Check
  if (enrollment.paymentMethod === "subscription") {
    if (!enrollment.accessUntil) {
      throw new AccessError(
        AccessErrorCode.CONFIG_ERROR,
        "Subscription missing accessUntil date",
      );
    }

    const now = Date.now();
    const expiry =
      typeof enrollment.accessUntil === "string"
        ? new Date(enrollment.accessUntil).getTime()
        : ((
            enrollment.accessUntil as unknown as { toMillis?: () => number }
          )?.toMillis?.() ?? Number.NaN);

    if (now >= expiry) {
      logger.warn("Access Denied: Subscription Expired", {
        courseId,
        uid,
        expiry,
      });
      throw new AccessError(
        AccessErrorCode.ENROLLMENT_EXPIRED,
        "Subscription period has ended",
      );
    }
  }

  return {
    uid,
    courseId,
    enrollmentId: enrollment.id || `profile_${uid}_${courseId}`,
    paymentMethod: enrollment.paymentMethod || "free",
    courseVersion: enrollment.courseVersionAtEnrollment,
    accessUntil: enrollment.accessUntil || undefined,
  };
}
