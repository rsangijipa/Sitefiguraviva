import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";

type BackfillOptions = {
  dryRun?: boolean;
};

export async function backfillUserProfiles(options: BackfillOptions = {}) {
  const { dryRun = true } = options;
  const usersSnap = await adminDb.collection("users").get();

  let scanned = 0;
  let changed = 0;
  let committed = 0;

  let batch = adminDb.batch();
  let ops = 0;

  for (const userDoc of usersSnap.docs) {
    scanned += 1;
    const data = userDoc.data() as Record<string, any>;

    const inferredIsActive =
      typeof data.isActive === "boolean"
        ? data.isActive
        : data.status === "disabled"
          ? false
          : true;

    const patch: Record<string, any> = {};

    if (!data.uid) patch.uid = userDoc.id;
    if (data.isActive === undefined) patch.isActive = inferredIsActive;
    if (!data.status) patch.status = inferredIsActive ? "active" : "disabled";
    if (!data.createdAt) patch.createdAt = FieldValue.serverTimestamp();

    if (Object.keys(patch).length === 0) continue;

    patch.updatedAt = FieldValue.serverTimestamp();
    changed += 1;

    if (!dryRun) {
      batch.set(userDoc.ref, patch, { merge: true });
      ops += 1;

      if (ops >= 400) {
        await batch.commit();
        committed += ops;
        batch = adminDb.batch();
        ops = 0;
      }
    }
  }

  if (!dryRun && ops > 0) {
    await batch.commit();
    committed += ops;
  }

  return {
    dryRun,
    scanned,
    changed,
    committed,
  };
}
