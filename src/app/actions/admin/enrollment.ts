"use server";

import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { logAudit } from "@/lib/audit";
import { whatsappService } from "@/services/whatsappService";

// Helper to ensure admin
async function assertAdmin() {
  const sessionCookie = (await cookies()).get("session")?.value;
  if (!sessionCookie) throw new Error("Unauthenticated");
  const token = await adminAuth.verifySessionCookie(sessionCookie, true);
  if (!token.admin && token.role !== "admin") throw new Error("Forbidden");
  return token;
}

// Helper to send internal notification
async function sendNotification(
  uid: string,
  title: string,
  body: string,
  link: string = "/portal",
) {
  try {
    const notificationRef = adminDb
      .collection("users")
      .doc(uid)
      .collection("notifications");
    await notificationRef.add({
      title,
      body,
      link,
      isRead: false,
      createdAt: Timestamp.now(),
      type: "course_update",
    });
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
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

    // Fetch Course Revision and User Snapshot for SSoT
    const [courseSnap, userSnap] = await Promise.all([
      adminDb.collection("courses").doc(courseId).get(),
      adminDb.collection("users").doc(uid).get(),
    ]);

    if (!courseSnap.exists) throw new Error("Course not found");
    const courseData = courseSnap.data();
    const userData = userSnap.data();

    const enrollmentData = {
      uid,
      courseId,
      status: "active",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      enrolledBy: adminUser.email || "admin@system",
      reason: "Manual Admin Enrollment",
      courseVersionAtEnrollment: courseData?.contentRevision || 1,
      courseTitle: courseData?.title || "Curso",
      userName: userData?.displayName || normalizedEmail.split("@")[0],
    };

    await enrollmentRef.set(enrollmentData, { merge: true });

    await logAudit({
      actor: { uid: adminUser.uid, email: adminUser.email, role: "admin" },
      action: "ENROLLMENT_CREATED",
      target: { collection: "enrollments", id: enrollmentId },
      diff: { after: enrollmentData },
    });

    // Send Notification
    await sendNotification(
      uid,
      "Nova Matrícula!",
      `Você foi matriculado(a) no curso: ${enrollmentData.courseTitle}.`,
      `/portal/course/${courseId}`,
    );

    // Robust Access Control: Sync to User Doc
    await adminDb
      .collection("users")
      .doc(uid)
      .update({
        enrolledCourseIds: FieldValue.arrayUnion(courseId),
      });

    // Notify student via WhatsApp if phone exists
    if (userData?.phone) {
      await whatsappService.notifyEnrollment(
        userData.phone,
        userData.displayName || normalizedEmail.split("@")[0],
        enrollmentData.courseTitle,
      );
    }

    // Force cache revalidation for all relevant paths
    revalidatePath(`/portal/courses/${courseId}`);
    revalidatePath(`/portal/course/${courseId}`);
    revalidatePath(`/portal`);
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
    const adminUser = await assertAdmin();
    const enrollmentId = `${uid}_${courseId}`;

    await adminDb.collection("enrollments").doc(enrollmentId).update({
      status: "canceled",
      updatedAt: Timestamp.now(),
      reason,
    });

    await logAudit({
      actor: { uid: adminUser.uid, email: adminUser.email, role: "admin" },
      action: "ENROLLMENT_REVOKED",
      target: { collection: "enrollments", id: enrollmentId },
      diff: { after: { status: "canceled", reason } },
    });

    // Revoke access from User Doc
    await adminDb
      .collection("users")
      .doc(uid)
      .update({
        enrolledCourseIds: FieldValue.arrayRemove(courseId),
      });

    revalidatePath(`/portal`);
    return { success: true };
  } catch (error: any) {
    console.error("Revoke Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Batch enrolls multiple users by email.
 */
export async function batchEnrollUsers(emails: string[], courseId: string) {
  try {
    await assertAdmin();
    const results = {
      success: [] as string[],
      failed: [] as { email: string; error: string }[],
    };

    // Process in parallel with error isolation
    await Promise.all(
      emails.map(async (email) => {
        try {
          const res = await enrollUser(email, courseId);
          if (res.success) {
            results.success.push(email);
          } else {
            results.failed.push({ email, error: res.error || "Unknown error" });
          }
        } catch (err: any) {
          results.failed.push({ email, error: err.message });
        }
      }),
    );

    revalidatePath(`/admin/enrollments`);
    return { success: true, ...results };
  } catch (error: any) {
    console.error("Batch Enrollment Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Updates the status of an enrollment.
 * Ensures the user document's enrolledCourseIds is kept in sync.
 */
export async function updateEnrollmentStatus(
  uid: string,
  courseId: string,
  newStatus:
    | "pending_approval"
    | "active"
    | "completed"
    | "canceled"
    | "refunded",
) {
  try {
    const adminUser = await assertAdmin();
    const enrollmentId = `${uid}_${courseId}`;
    const enrollmentRef = adminDb.collection("enrollments").doc(enrollmentId);
    const userRef = adminDb.collection("users").doc(uid);

    await adminDb.runTransaction(async (tx) => {
      tx.update(enrollmentRef, {
        status: newStatus,
        updatedAt: FieldValue.serverTimestamp(),
      });

      if (newStatus === "active") {
        tx.update(userRef, {
          enrolledCourseIds: FieldValue.arrayUnion(courseId),
        });
      } else if (newStatus === "canceled" || newStatus === "refunded") {
        tx.update(userRef, {
          enrolledCourseIds: FieldValue.arrayRemove(courseId),
        });
      }
      // "completed" usually keeps access, so no change to enrolledCourseIds
    });

    revalidatePath(`/portal`);
    revalidatePath(`/portal/courses/${courseId}`);

    await logAudit({
      actor: { uid: adminUser.uid, email: adminUser.email, role: "admin" },
      action: "ENROLLMENT_STATUS_UPDATED",
      target: { collection: "enrollments", id: enrollmentId },
      diff: { after: { status: newStatus } },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Update Status Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Specifically approves a pending enrollment.
 */
export async function approveEnrollment(uid: string, courseId: string) {
  const adminUser = await assertAdmin();
  const res = await updateEnrollmentStatus(uid, courseId, "active");

  if (res.success) {
    const enrollmentId = `${uid}_${courseId}`;
    await adminDb.collection("enrollments").doc(enrollmentId).update({
      approvedBy: adminUser.uid,
      approvedAt: FieldValue.serverTimestamp(),
    });

    await logAudit({
      actor: { uid: adminUser.uid, email: adminUser.email, role: "admin" },
      action: "ENROLLMENT_APPROVED",
      target: { collection: "enrollments", id: enrollmentId },
      diff: { after: { status: "active", approvedBy: adminUser.uid } },
    });

    await sendNotification(
      uid,
      "Matrícula Aprovada!",
      "Sua matrícula foi aprovada. O acesso ao curso já está liberado!",
      `/portal/course/${courseId}`,
    );

    // Notify student via WhatsApp if phone exists
    const userDoc = await adminDb.collection("users").doc(uid).get();
    const userData = userDoc.data();
    if (userData?.phone) {
      const courseDoc = await adminDb.collection("courses").doc(courseId).get();
      await whatsappService.notifyEnrollment(
        userData.phone,
        userData.displayName || userData.email.split("@")[0],
        courseDoc.data()?.title || "Curso",
      );
    }
  }

  return res;
}
