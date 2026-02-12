"use server";

import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { DecodedIdToken } from "firebase-admin/auth";

/**
 * Idempotent operation to ensure a user document exists in Firestore.
 * This is called during session verification to maintain SSoT.
 */
export async function ensureUserDoc(decodedToken: DecodedIdToken) {
  const { uid, email, display_name, picture } = decodedToken;
  const userRef = adminDb.collection("users").doc(uid);

  try {
    const snap = await userRef.get();

    if (!snap.exists) {
      console.log(`[ensureUserDoc] Creating new user doc for ${uid}`);
      await userRef.set({
        uid,
        email: email || "",
        displayName: display_name || email?.split("@")[0] || "Usuário",
        photoURL: picture || null,
        role: "student",
        isActive: true,
        enrolledCourseIds: [],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        lastLogin: FieldValue.serverTimestamp(),
      });
    } else {
      // Update last login and basic info if needed (keeping it lightweight)
      await userRef.update({
        lastLogin: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        // email: email || snap.data()?.email, // Optional: sync email if changed
      });
    }
    return { success: true };
  } catch (error) {
    console.error("[ensureUserDoc] Error:", error);
    return { success: false, error };
  }
}
