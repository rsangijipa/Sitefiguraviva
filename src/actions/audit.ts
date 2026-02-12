"use server";

import { adminDb, auth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { deepSafeSerialize } from "@/lib/utils";

export async function getAuditLogs(limitCount = 50, startAfterDocId?: string) {
  // 1. Auth Check (Next.js 15)
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return { error: "Unauthorized" };

  try {
    const claims = await auth.verifySessionCookie(sessionCookie, true);
    if (claims.role !== "admin") return { error: "Forbidden" };

    // 2. Query
    let query = adminDb
      .collection("audit_logs")
      .orderBy("timestamp", "desc")
      .limit(limitCount);

    if (startAfterDocId) {
      const lastDoc = await adminDb
        .collection("audit_logs")
        .doc(startAfterDocId)
        .get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }

    const snapshot = await query.get();
    const logs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Serialize timestamps
      timestamp: doc.data().timestamp?.toDate().toISOString(),
    }));

    return { success: true, logs: deepSafeSerialize(logs) };
  } catch (error) {
    console.error("Failed to fetch audit logs", error);
    return { error: "Internal Server Error" };
  }
}
