"use server";

import { auth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

/**
 * Enrolls a lead (application) into a course.
 * If the user does not exist in Firebase Auth or Firestore, checking by EMAIL, it creates them.
 */
export async function enrollLead(
  applicationId: string,
  data: {
    email: string;
    name: string;
    phone?: string;
    courseId: string;
    courseName?: string;
    // application info
    applicationData?: any;
  },
) {
  // 1. Verify Admin Access
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) return { error: "Unauthorized" };

  let claims;
  try {
    claims = await auth.verifySessionCookie(sessionCookie, true);
    if (claims.role !== "admin") {
      return { error: "Forbidden" };
    }
  } catch (e) {
    return { error: "Unauthorized" };
  }

  try {
    let userId = "";
    let isNewUser = false;
    if (!data.email) return { error: "Email é obrigatório para matrícula." };
    const normalizedEmail = data.email.toLowerCase().trim();

    // 2. Check if user exists in Auth
    try {
      const userRecord = await auth.getUserByEmail(normalizedEmail);
      userId = userRecord.uid;
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        // Create new user
        console.log(`[EnrollLead] Creating new user for ${normalizedEmail}`);
        const newUser = await auth.createUser({
          email: normalizedEmail,
          displayName: data.name,
          emailVerified: true, // Manual admin enrollment implies verification
        });
        userId = newUser.uid;
        isNewUser = true;
      } else {
        throw error;
      }
    }

    // 3. Ensure Firestore User Doc exists
    const userRef = adminDb.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      console.log(`[EnrollLead] Creating Firestore doc for ${userId}`);
      await userRef.set({
        uid: userId,
        email: normalizedEmail,
        displayName: data.name,
        role: "student",
        createdAt: FieldValue.serverTimestamp(),
        phone: data.phone || null,
        photoURL: null,
        isActive: true,
        metadata: {
          source: "admin_enrollment",
          originalApplicationId: applicationId,
        },
      });
    }

    // 4. Create Enrollment
    // Use composite ID to prevent duplicates
    const enrollmentId = `${userId}_${data.courseId}`;
    const finalEnrollmentRef = adminDb
      .collection("enrollments")
      .doc(enrollmentId);

    console.log(`[EnrollLead] Creating enrollment ${enrollmentId}`);
    await finalEnrollmentRef.set(
      {
        uid: userId,
        userName: data.name,
        userEmail: normalizedEmail,
        userPhone: data.phone || null,
        courseId: data.courseId,
        courseName: data.courseName || "Curso",
        status: "active",
        enrolledAt: FieldValue.serverTimestamp(),
        applicationId,
        enrolledBy: "admin_manual",
        paymentStatus: "paid", // Assuming manual enrollment implies payment/grant
        paymentMethod: "manual",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        progressSummary: {
          completedLessonsCount: 0,
          totalLessons: 0, // Will be updated by triggers or first access
          percent: 0,
        },
      },
      { merge: true },
    );

    // 5. Update Application Status
    await adminDb.collection("applications").doc(applicationId).update({
      status: "enrolled",
      enrolledAt: FieldValue.serverTimestamp(),
      userId: userId, // Link application to user now
    });

    // 6. Audit Logging
    await import("@/services/auditService").then((m) =>
      m.auditService.logEvent({
        eventType: "LEAD_ENROLLED",
        actor: { uid: claims.uid, email: claims.email },
        target: { id: userId, collection: "enrollments" },
        payload: {
          applicationId,
          courseId: data.courseId,
          isNewUser,
        },
      }),
    );

    // 7. Robust Access Control: Store courseId in User Doc
    await adminDb
      .collection("users")
      .doc(userId)
      .update({
        enrolledCourseIds: FieldValue.arrayUnion(data.courseId),
      });

    // 8. Send Password Reset / Welcome Email (Optional)
    let passwordResetLink = null;
    if (isNewUser) {
      passwordResetLink = await auth.generatePasswordResetLink(normalizedEmail);
      // In a real app, you would send this via SendGrid/Resend
      console.log(
        `[EnrollLead] Password Reset Link for new user: ${passwordResetLink}`,
      );
    }

    revalidatePath("/admin/applications");
    revalidatePath("/admin/users");
    revalidatePath("/admin/enrollments");
    revalidatePath(`/portal/course/${data.courseId}`);
    revalidatePath(`/portal`);

    return { success: true, userId, isNewUser, passwordResetLink };
  } catch (error: any) {
    console.error("Enrollment error:", error);
    return { error: error.message || "Falha na matrícula" };
  }
}
