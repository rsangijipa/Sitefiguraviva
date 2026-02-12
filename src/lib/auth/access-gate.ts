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

  // 1. Course Level Visibility Check (Fetch FIRST to verify existence)
  const courseSnap = await adminDb.collection("courses").doc(courseId).get();
  if (!courseSnap.exists) {
    throw new NotFoundError("Course");
  }
  const course = courseSnap.data() as CourseDoc;

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

  let enrollment = enrollmentSnap.exists
    ? (enrollmentSnap.data() as EnrollmentDoc)
    : null;

  if (!enrollment) {
    logger.warn("Access Denied: No Enrollment", { courseId, uid });
    throw new AccessError(
      AccessErrorCode.ENROLLMENT_NOT_FOUND,
      "You are not enrolled in this course",
    );
  }

  // 3. Enrollment Level Status Check (Policy: active or completed)
  if (!isEnrollmentAllowed(enrollment)) {
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
    const expiry = enrollment.accessUntil.toMillis();

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
    enrollmentId: enrollmentSnap.id || `profile_${uid}_${courseId}`,
    paymentMethod: enrollment.paymentMethod || "free",
    courseVersion: enrollment.courseVersionAtEnrollment,
    accessUntil: enrollment.accessUntil?.toDate().toISOString(),
  };
}
