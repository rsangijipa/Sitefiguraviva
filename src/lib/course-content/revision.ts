import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { logAuditInTransaction } from "@/lib/audit";

export type CourseContentChange =
  | "course-updated"
  | "module-created"
  | "module-updated"
  | "module-deleted"
  | "lesson-created"
  | "lesson-updated"
  | "lesson-deleted"
  | "lesson-content-updated";

type AuditActor = {
  uid: string;
  email?: string;
  role?: string;
};

export async function touchCourseRevision(
  courseId: string,
  reason: CourseContentChange,
  actor: AuditActor,
): Promise<{ previousRevision: number; revision: number }> {
  const courseRef = adminDb.collection("courses").doc(courseId);

  return adminDb.runTransaction(async (transaction) => {
    const courseSnapshot = await transaction.get(courseRef);
    if (!courseSnapshot.exists) {
      throw new Error("Course not found.");
    }

    const previousRevision = Number(
      courseSnapshot.data()?.contentRevision ?? 1,
    );
    const revision = previousRevision + 1;

    transaction.update(courseRef, {
      contentRevision: revision,
      updatedAt: FieldValue.serverTimestamp(),
    });
    logAuditInTransaction(transaction, {
      action: "COURSE_CONTENT_CHANGED",
      actor,
      target: { collection: "courses", id: courseId },
      metadata: { reason, previousRevision, revision },
    });

    return { previousRevision, revision };
  });
}
