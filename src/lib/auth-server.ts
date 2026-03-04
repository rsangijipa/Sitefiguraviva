import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

/**
 * Validates the session cookie and returns the decoded token.
 * @throws Error if unauthenticated.
 */
export async function requireSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    throw new Error("Unauthenticated: Please log in.");
  }

  try {
    return await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch (error) {
    console.warn("[AUTH] Session cookie verification failed:", error);
    throw new Error("Invalid session. Correlation ID: " + Date.now());
  }
}

/**
 * Validates that the user has admin privileges.
 * @throws Error if not an admin.
 */
export async function requireAdmin() {
  const decodedToken = await requireSession();

  // 1. Fast path: check custom claims
  if (decodedToken.role === "admin" || decodedToken.admin === true) {
    return decodedToken;
  }

  // 2. Slow path: strict check against Firestore SSoT
  const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
  const userData = userDoc.data();

  if (
    userData?.role !== "admin" &&
    userData?.role !== "ADMIN" &&
    userData?.role !== "administrador"
  ) {
    console.error(
      `[SECURITY] Access denied for user ${decodedToken.email}. Missing admin role.`,
    );
    throw new Error("Access Denied: Administrative privileges required.");
  }

  return decodedToken;
}

/**
 * Validates that the user has staff (admin or tutor) privileges.
 */
export async function requireStaff() {
  const decodedToken = await requireSession();

  if (
    decodedToken.role === "admin" ||
    decodedToken.admin === true ||
    decodedToken.role === "tutor"
  ) {
    return decodedToken;
  }

  const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
  const userData = userDoc.data();

  const isStaffRole = ["admin", "ADMIN", "administrador", "tutor"].includes(
    userData?.role || "",
  );

  if (!isStaffRole) {
    throw new Error("Access Denied: Staff privileges required.");
  }

  return decodedToken;
}
