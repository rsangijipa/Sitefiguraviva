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

/**
 * Canonical Server-Side Access Guard.
 * Validates enrollment status, course publication state, and subscription expiry.
 */
export async function assertCanAccessCourse(
  uid: string | undefined,
  courseId: string,
): Promise<AccessContext> {
  if (!uid) throw new AuthError();

  const enrollmentId = `${uid}_${courseId}`;
  const enrollmentSnap = await adminDb
    .collection("enrollments")
    .doc(enrollmentId)
    .get();

  if (!enrollmentSnap.exists) {
    throw new NotFoundError("Enrollment");
  }

  const enrollment = enrollmentSnap.data() as EnrollmentDoc;

  // 1. Enrollment Level Status Check
  if (enrollment.status === "pending") {
    throw new ForbiddenError("Enrollment is pending approval");
  }

  if (enrollment.status === "expired") {
    throw new ForbiddenError("Enrollment has expired");
  }

  if (enrollment.status !== "active" && enrollment.status !== "completed") {
    throw new ForbiddenError("Enrollment is not active");
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
      throw new ForbiddenError("Subscription period has ended");
    }
  }

  // 3. Course Level Visibility Check
  const courseSnap = await adminDb.collection("courses").doc(courseId).get();
  if (!courseSnap.exists) {
    throw new NotFoundError("Course");
  }

  const course = courseSnap.data() as CourseDoc;

  // Admin Override: If user is admin, they can see draft/closed courses
  const userSnap = await adminDb.collection("users").doc(uid).get();
  const userRole = userSnap.data()?.role;

  if (userRole === "admin") {
    return {
      uid,
      courseId,
      enrollmentId,
      paymentMethod: enrollment.paymentMethod || "free",
      courseVersion: enrollment.courseVersionAtEnrollment,
      accessUntil: enrollment.accessUntil?.toDate().toISOString(),
      isAdminOverride: true,
    };
  }

  if (!course.isPublished || course.status !== "open") {
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
