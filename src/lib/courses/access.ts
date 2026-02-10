import { adminDb } from "@/lib/firebase/admin";

/**
 * Verifies if a user has active access to a course.
 * MUST be used in Server Components or Server Actions.
 *
 * @param uid The user's UID
 * @param courseId The course ID
 * @throws Error if access is denied.
 */
export async function assertCanAccessCourse(uid: string, courseId: string) {
  if (!uid || !courseId) {
    throw new Error("Access Denied: Missing credentials.");
  }

  // 1. Check Enrollment SSoT
  const enrollmentId = `${uid}_${courseId}`;
  const enrollmentSnap = await adminDb
    .collection("enrollments")
    .doc(enrollmentId)
    .get();

  if (!enrollmentSnap.exists) {
    throw new Error(`Access Denied: Not enrolled in course ${courseId}.`);
  }

  const data = enrollmentSnap.data();

  // 2. Strict Status Check
  if (data?.status !== "active" && data?.status !== "completed") {
    throw new Error(`Access Denied: Enrollment is ${data?.status}.`);
  }

  return true;
}
