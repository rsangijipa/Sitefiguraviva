"use server";

import { revalidatePath } from "next/cache";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { assertIsTutorOrAdmin } from "@/lib/auth/authoring-gate";

async function hasContent(courseId: string) {
  const modulesSnap = await adminDb
    .collection("courses")
    .doc(courseId)
    .collection("modules")
    .limit(1)
    .get();
  if (modulesSnap.empty) return false;

  // Check if at least one module has lessons
  const firstModule = modulesSnap.docs[0];
  const lessonsSnap = await firstModule.ref
    .collection("lessons")
    .limit(1)
    .get();
  return !lessonsSnap.empty;
}

export async function toggleCourseStatus(
  courseId: string,
  currentStatus: string,
) {
  try {
    await assertIsTutorOrAdmin();
  } catch (e) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const newStatus = currentStatus === "open" ? "draft" : "open";
    const isPublished = newStatus === "open";

    if (isPublished) {
      const valid = await hasContent(courseId);
      if (!valid) {
        return {
          success: false,
          error: "Cannot publish empty course. Add modules and lessons first.",
        };
      }
    }

    const courseRef = adminDb.collection("courses").doc(courseId);
    const courseDoc = await courseRef.get();
    const oldData = courseDoc.data();

    const updates: any = {
      status: newStatus,
      isPublished: isPublished,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (isPublished) {
      updates.publishedAt = FieldValue.serverTimestamp();
    }

    await courseRef.update(updates);

    // Audit Trail
    const cookieStore = await import("next/headers").then((m) => m.cookies());
    const session = cookieStore.get("session")?.value;
    const actor = await adminAuth.verifySessionCookie(session || "", true);

    await import("@/lib/audit").then((m) =>
      m.auditService.logEvent({
        eventType: "COURSE_STATUS_UPDATED",
        actor: { uid: actor.uid, email: actor.email },
        target: { id: courseId, collection: "courses" },
        diff: {
          before: { status: currentStatus, isPublished: oldData?.isPublished },
          after: { status: newStatus, isPublished },
        },
      }),
    );

    // Revalidate all relevant paths
    revalidatePath("/admin/courses");
    revalidatePath("/");
    revalidatePath("/curso");
    revalidatePath(`/curso/${courseId}`);
    revalidatePath(`/portal/courses`); // Student dashboard

    return { success: true, newStatus, isPublished };
  } catch (error) {
    console.error("Failed to toggle course status:", error);
    return { success: false, error: "Database update failed" };
  }
}

/**
 * Increments the contentRevision of a course, effectively creating a new academic version.
 * This is useful when major content changes are made and we want new certificates to reflect this.
 */
export async function bumpCourseRevision(courseId: string) {
  try {
    await assertIsTutorOrAdmin();
    const courseRef = adminDb.collection("courses").doc(courseId);
    const courseDoc = await courseRef.get();
    if (!courseDoc.exists) throw new Error("Course not found");

    const data = courseDoc.data();
    const oldRevision = data?.contentRevision || 1;
    const newRevision = oldRevision + 1;

    await courseRef.update({
      contentRevision: newRevision,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Audit Trail
    const cookieStore = await import("next/headers").then((m) => m.cookies());
    const session = cookieStore.get("session")?.value;
    const actor = await adminAuth.verifySessionCookie(session || "", true);

    await import("@/lib/audit").then((m) =>
      m.auditService.logEvent({
        eventType: "COURSE_VERSION_BUMPED",
        actor: { uid: actor.uid, email: actor.email },
        target: { id: courseId, collection: "courses" },
        payload: { oldRevision, newRevision },
      }),
    );

    revalidatePath(`/curso/${courseId}`);
    revalidatePath(`/admin/courses/${courseId}`);

    return { success: true, newRevision };
  } catch (error: any) {
    console.error("Failed to bump course revision:", error);
    return { success: false, error: error.message };
  }
}
