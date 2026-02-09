"use server";

import { requireAdmin } from "@/lib/auth/server";
import { adminDb } from "@/lib/firebase/admin";
import { UserRole, UserStatus, AuditLog } from "@/types/user";
import { Timestamp } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";

import { auditService } from "@/services/auditService";

// Removed local logAudit helper in favor of centralized auditService

// --- Actions ---

export async function updateUserRole(targetUid: string, newRole: UserRole) {
  const adminClaims = await requireAdmin(); // Throws invalid-session or unauthorized
  const actorUid = adminClaims.uid;

  if (newRole === "admin" && adminClaims.uid === targetUid) {
    // Prevent self-demotion if applied logic needed, but self-promotion is main risk usually protected by requireAdmin
    // Here admin is already admin.
  }

  try {
    const userRef = adminDb.collection("users").doc(targetUid);
    const userDoc = await userRef.get();
    const oldRole = userDoc.data()?.role || "student";

    // 1. Update Firestore Doc
    await userRef.set(
      {
        role: newRole,
        updatedAt: Timestamp.now(),
      },
      { merge: true },
    );

    // 2. Set Custom Claims (so idToken is valid immediately)
    // We only set 'admin' claim if role is admin.
    // For 'tutor' we might want a 'tutor' claim, but currently we rely on DB for that permissions mostly.
    // But for consistency:
    const claims = { admin: newRole === "admin", tutor: newRole === "tutor" };
    // Note: setCustomUserClaims overwrites existing claims.
    await import("@/lib/firebase/admin").then((m) =>
      m.adminAuth.setCustomUserClaims(targetUid, claims),
    );

    // 3. Audit
    await auditService.logEvent({
      eventType: "USER_ROLE_UPDATED",
      actor: { uid: actorUid, email: adminClaims.email },
      target: { id: targetUid, collection: "users" },
      diff: {
        before: { role: oldRole },
        after: { role: newRole },
      },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("updateUserRole error:", error);
    return { success: false, error: "Failed to update role" };
  }
}

export async function toggleUserStatus(
  targetUid: string,
  newStatus: UserStatus,
  reason?: string,
) {
  const adminClaims = await requireAdmin();
  const actorUid = adminClaims.uid;

  if (targetUid === actorUid) {
    return { success: false, error: "You cannot change your own status." };
  }

  try {
    const userRef = adminDb.collection("users").doc(targetUid);
    const userDoc = await userRef.get();
    const oldStatus = userDoc.data()?.status || "active";

    const updateData: any = {
      status: newStatus,
      updatedAt: Timestamp.now(),
    };

    if (newStatus === "disabled") {
      updateData.disabledAt = Timestamp.now();
      updateData.disabledBy = actorUid;
      updateData.disabledReason = reason || "No reason provided";

      // Disable in Auth (Revoke tokens)
      await import("@/lib/firebase/admin").then((m) => {
        m.adminAuth.updateUser(targetUid, { disabled: true });
        m.adminAuth.revokeRefreshTokens(targetUid);
      });
    } else {
      // Re-enable
      updateData.disabledAt = null;
      updateData.disabledBy = null;
      updateData.disabledReason = null;

      await import("@/lib/firebase/admin").then((m) =>
        m.adminAuth.updateUser(targetUid, { disabled: false }),
      );
    }

    await userRef.set(updateData, { merge: true });

    await auditService.logEvent({
      eventType: newStatus === "disabled" ? "USER_DISABLED" : "USER_ENABLED",
      actor: { uid: actorUid, email: adminClaims.email },
      target: { id: targetUid, collection: "users" },
      diff: {
        before: { status: oldStatus },
        after: { status: newStatus },
      },
      payload: { reason },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("toggleUserStatus error:", error);
    return { success: false, error: "Failed to update user status" };
  }
}
