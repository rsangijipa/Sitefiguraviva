import { adminDb } from "@/lib/firebase/admin";
import { UserDoc } from "@/types/lms";

export async function getUserByUid(uid: string): Promise<UserDoc | null> {
  if (!uid) return null;

  const snapshot = await adminDb.collection("users").doc(uid).get();
  if (!snapshot.exists) return null;

  return {
    uid,
    ...snapshot.data(),
  } as UserDoc;
}
