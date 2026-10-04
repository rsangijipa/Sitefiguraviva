import "server-only";

import { verifySession } from "./server";
import {
  AccessErrorCode,
  AccessError,
  AccessContext,
  AuthError,
  NotFoundError,
  ForbiddenError,
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
  _options?: {
    isAdmin?: boolean;
  },
): Promise<AccessContext> {
  const session = await verifySession();
  if (!session || !session.isActive) throw new AuthError();
  if (uid !== undefined && uid !== session.uid) throw new ForbiddenError();
  uid = session.uid;
  if (typeof courseId !== "string" || !courseId.trim() || courseId.length > 200)
    throw new ForbiddenError();

  const course = await getAdminCourse(courseId);
  if (!course) throw new NotFoundError("Course");

  // The persisted session and course assignment decide preview privileges.
  // The legacy isAdmin argument is deliberately ignored.
  const teamRole = course.team?.[uid]?.role;
  const teamPreview =
    course.isPublished === true &&
    ["open", "closed"].includes(course.status) &&
    ["author", "tutor", "admin"].includes(teamRole || "");
  if (session.isAdmin || teamPreview) {
    return {
      uid,
      courseId,
      enrollmentId: "preview_" + uid + "_" + courseId,
      paymentMethod: "admin",
      isAdminOverride: session.isAdmin,
      isTeamPreview: teamPreview && !session.isAdmin,
    };
  }

  // Policy: draft or archived block
  if (isCourseGloballyBlocked(course)) {
    const reason =
      course.status === "archived"
        ? AccessErrorCode.COURSE_ARCHIVED
        : AccessErrorCode.COURSE_NOT_PUBLISHED;

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
  if (enrollment.accessUntil || enrollment.paymentMethod === "subscription") {
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

    if (!Number.isFinite(expiry)) {
      throw new AccessError(
        AccessErrorCode.CONFIG_ERROR,
        "Invalid access expiry",
      );
    }
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

/** Internal guard for consumers that derive identity entirely from the session. */
export async function assertCurrentCourseAccess(courseId: string) {
  return assertCanAccessCourse(undefined, courseId);
}
