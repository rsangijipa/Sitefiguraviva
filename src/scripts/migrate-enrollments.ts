import { adminDb } from "@/lib/firebase/admin";
import { logAudit } from "@/lib/audit";

/**
 * Migration script to standardize all enrollment IDs to {uid}_{courseId}.
 * Legacy format often used {courseId}_{uid}.
 */
export async function migrateEnrollmentIds() {
  console.log("Starting enrollment ID migration...");

  const enrollmentsSnap = await adminDb.collection("enrollments").get();
  let migratedCount = 0;
  let skippedCount = 0;

  for (const doc of enrollmentsSnap.docs) {
    const data = doc.data();
    const currentId = doc.id;
    const { uid, userId, courseId } = data;

    const targetUid = uid || userId;
    if (!targetUid || !courseId) {
      console.warn(`[Skip] Doc ${currentId} missing uid or courseId`);
      skippedCount++;
      continue;
    }

    const correctId = `${targetUid}_${courseId}`;

    if (currentId !== correctId) {
      console.log(`[Migrate] ${currentId} -> ${correctId}`);

      // Atomic move: Create new, Delete old
      const batch = adminDb.batch();
      const newRef = adminDb.collection("enrollments").doc(correctId);
      const oldRef = adminDb.collection("enrollments").doc(currentId);

      batch.set(newRef, {
        ...data,
        uid: targetUid, // Ensure field consistency
        userId: targetUid,
        updatedAt: new Date(),
        migrationSourceId: currentId,
      });
      batch.delete(oldRef);

      await batch.commit();
      migratedCount++;
    } else {
      skippedCount++;
    }
  }

  console.log(
    `Migration finished. Migrated: ${migratedCount}, Skipped/Correct: ${skippedCount}`,
  );

  await logAudit({
    actor: { uid: "system-migration", role: "admin" },
    action: "MIGRATION_ENROLLMENT_IDS",
    target: {
      collection: "enrollments",
      id: "all",
      summary: `Migrated ${migratedCount} enrollments to deterministic ID format.`,
    },
  });

  return { migratedCount, skippedCount };
}
