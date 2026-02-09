"use server";

import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { Enrollment } from "@/types/schema";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// Helper to ensure admin
async function assertAdmin() {
  const sessionCookie = (await cookies()).get("session")?.value;
  if (!sessionCookie) throw new Error("Unauthenticated");
  const token = await adminAuth.verifySessionCookie(sessionCookie, true);
  if (!token.admin && token.role !== "admin") throw new Error("Forbidden");
  return token;
}

/**
 * Enrolls a user in a course.
 * If user does not exist, creates a placeholder account (staging user).
 */
export async function enrollUser(email: string, courseId: string) {
  try {
    const adminUser = await assertAdmin();
    const normalizedEmail = email.toLowerCase().trim();

    let uid: string;

    try {
      const userRecord = await adminAuth.getUserByEmail(normalizedEmail);
      uid = userRecord.uid;
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        // Create placeholder user
        const newUser = await adminAuth.createUser({
          email: normalizedEmail,
          emailVerified: false,
          displayName: normalizedEmail.split("@")[0], // Fallback name
          disabled: false,
        });
        uid = newUser.uid;

        // Create Firestore User Doc placeholder
        await adminDb.collection("users").doc(uid).set({
          uid,
          email: normalizedEmail,
          role: "student",
          isActive: true,
          createdAt: Timestamp.now(),
          isPlaceholder: true,
        });
      } else {
        throw error;
      }
    }

    const enrollmentId = `${uid}_${courseId}`;
    const enrollmentRef = adminDb.collection("enrollments").doc(enrollmentId);

    const enrollmentData: Enrollment = {
      uid,
      courseId,
      status: "active",
      createdAt: Timestamp.now() as any,
      updatedAt: Timestamp.now() as any,
      enrolledBy: adminUser.email || "admin@system",
      reason: "Manual Admin Enrollment",
    };

    await enrollmentRef.set(enrollmentData, { merge: true });

    // Force cache revalidation if needed
    revalidatePath(`/portal/courses/${courseId}`);
    revalidatePath(`/admin/users/${uid}`);

    return { success: true, uid, enrollmentId };
  } catch (error: any) {
    console.error("Enrollment Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Revokes access (locks enrollment).
 */
export async function revokeAccess(
  uid: string,
  courseId: string,
  reason: string = "Admin Revoke",
) {
  try {
    await assertAdmin();
    const enrollmentId = `${uid}_${courseId}`;

    await adminDb.collection("enrollments").doc(enrollmentId).update({
      status: "locked",
      updatedAt: Timestamp.now(),
      reason,
    });

    revalidatePath(`/portal`);
    return { success: true };
  } catch (error: any) {
    console.error("Revoke Error:", error);
    return { success: false, error: error.message };
  }
}
