"use server";

import { adminDb } from "@/lib/firebase/admin";
import { EnrollmentDoc, CourseDoc } from "@/types/lms";
import {
  AccessErrorCode,
  AccessError,
  AccessContext,
  AuthError,
  ForbiddenError,
  NotFoundError,
  ContentUnavailableError,
} from "./access-types";
import { isCourseGloballyBlocked, isEnrollmentAllowed } from "./access-policy";
import { logger } from "@/lib/logger";

/**
 * Canonical Server-Side Access Guard.
 * Validates enrollment status, course publication state, and subscription expiry.
 */
export async function assertCanAccessCourse(
  uid: string | undefined,
  courseId: string,
): Promise<AccessContext> {
  if (!uid) throw new AuthError();

  // 0. Admin Override Gate - FAST PATH
  const userSnap = await adminDb.collection("users").doc(uid).get();
  const userData = userSnap.data();
  const isAdmin = userData?.role?.toLowerCase().trim() === "admin";

  if (isAdmin) {
    return {
      uid,
      courseId,
      enrollmentId: `admin_${uid}_${courseId}`,
      paymentMethod: "admin",
      isAdminOverride: true,
    };
  }

  const enrollmentId = `${uid}_${courseId}`;
  const altEnrollmentId = `${courseId}_${uid}`;

  let enrollmentSnap = await adminDb
    .collection("enrollments")
    .doc(enrollmentId)
    .get();

  // Try alternate ID if first one fails
  if (!enrollmentSnap.exists) {
    enrollmentSnap = await adminDb
      .collection("enrollments")
      .doc(altEnrollmentId)
      .get();
  }

  // Final Fallback: Check if course is in user doc (legacy format)
  if (
    !enrollmentSnap.exists &&
    userData?.enrolledCourseIds?.includes(courseId)
  ) {
    return {
      uid,
      courseId,
      enrollmentId: `legacy_${uid}_${courseId}`,
      paymentMethod: "legacy",
    };
  }

  if (!enrollmentSnap.exists) {
    logger.warn("Access Denied: Enrollment Not Found", { courseId, uid });
    throw new NotFoundError("Enrollment");
  }

  const enrollment = enrollmentSnap.data() as EnrollmentDoc;

  // 1. Enrollment Level Status Check (Policy: active or completed)
  if (!isEnrollmentAllowed(enrollment)) {
    logger.warn("Access Denied: Enrollment Inactive", {
      courseId,
      uid,
      enrollmentStatus: enrollment.status,
      reason: "ENROLLMENT_INACTIVE",
    });

    if (enrollment.status === "pending") {
      throw new ForbiddenError("Enrollment is pending approval");
    }
    if (enrollment.status === "expired") {
      throw new ForbiddenError("Enrollment has expired");
    }
    throw new ForbiddenError(`Enrollment is ${enrollment.status}`);
  }

  // 2. Subscription Expiry Check
  if (enrollment.paymentMethod === "subscription") {
    if (!enrollment.accessUntil) {
      throw new AccessError(
        AccessErrorCode.CONFIG_ERROR,
        "Subscription missing accessUntil date",
      );
    }

    const now = Date.now();
    const expiry = enrollment.accessUntil.toMillis();

    if (now >= expiry) {
      logger.warn("Access Denied: Subscription Expired", {
        courseId,
        uid,
        expiry,
      });
      throw new ForbiddenError("Subscription period has ended");
    }
  }

  // 3. Course Level Visibility Check
  const courseSnap = await adminDb.collection("courses").doc(courseId).get();
  if (!courseSnap.exists) {
    throw new NotFoundError("Course");
  }

  const course = courseSnap.data() as CourseDoc;

  // Policy: draft or archived block
  if (isCourseGloballyBlocked(course)) {
    logger.warn("Access Denied: Course Unavailable", {
      courseId,
      uid,
      courseStatus: course.status,
      isPublished: course.isPublished,
      reason: "COURSE_UNAVAILABLE",
    });
    throw new ContentUnavailableError("Course is not available for students");
  }

  return {
    uid,
    courseId,
    enrollmentId,
    paymentMethod: enrollment.paymentMethod || "free",
    courseVersion: enrollment.courseVersionAtEnrollment,
    accessUntil: enrollment.accessUntil?.toDate().toISOString(),
  };
}
