"use server";

import { requireAdmin } from "@/lib/auth/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { UserRole, UserStatus } from "@/types/user";
import { Timestamp } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";

import { auditService } from "@/lib/audit";

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
    const isActive = userDoc.data()?.isActive !== false;

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
    const claims = {
      role: newRole,
      admin: newRole === "admin" && isActive,
      tutor: newRole === "tutor" && isActive,
      isActive,
    };
    // Note: setCustomUserClaims overwrites existing claims.
    await adminAuth.setCustomUserClaims(targetUid, claims);

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
    const oldIsActive = userDoc.data()?.isActive;

    const updateData: any = {
      status: newStatus,
      isActive: newStatus !== "disabled",
      updatedAt: Timestamp.now(),
    };

    if (newStatus === "disabled") {
      updateData.disabledAt = Timestamp.now();
      updateData.disabledBy = actorUid;
      updateData.disabledReason = reason || "No reason provided";

      // Disable in Auth (Revoke tokens)
      await adminAuth.updateUser(targetUid, { disabled: true });
      await adminAuth.revokeRefreshTokens(targetUid);
    } else {
      // Re-enable
      updateData.disabledAt = null;
      updateData.disabledBy = null;
      updateData.disabledReason = null;

      await adminAuth.updateUser(targetUid, { disabled: false });
    }

    await userRef.set(updateData, { merge: true });

    const role = (userDoc.data()?.role || "student") as UserRole;
    const isActive = newStatus !== "disabled";
    await adminAuth.setCustomUserClaims(targetUid, {
      role,
      admin: role === "admin" && isActive,
      tutor: role === "tutor" && isActive,
      isActive,
    });

    await auditService.logEvent({
      eventType: newStatus === "disabled" ? "USER_DISABLED" : "USER_ENABLED",
      actor: { uid: actorUid, email: adminClaims.email },
      target: { id: targetUid, collection: "users" },
      diff: {
        before: { status: oldStatus, isActive: oldIsActive },
        after: { status: newStatus, isActive: newStatus !== "disabled" },
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

export async function listUsersForAdmin(
  pageToken?: string,
  pageSize: number = 100,
) {
  await requireAdmin();

  try {
    const authPage = await adminAuth.listUsers(
      Math.min(pageSize, 1000),
      pageToken,
    );
    const authUsers = authPage.users;

    const profileMap = new Map<string, any>();
    await Promise.all(
      authUsers.map(async (u) => {
        const snap = await adminDb.collection("users").doc(u.uid).get();
        profileMap.set(u.uid, snap.exists ? snap.data() : null);
      }),
    );

    const merged = authUsers.map((u) => {
      const p = profileMap.get(u.uid) || {};
      const isActive = p?.isActive !== undefined ? p.isActive : !u.disabled;
      return {
        id: u.uid,
        uid: u.uid,
        email: u.email || p?.email || null,
        displayName: p?.displayName || u.displayName || null,
        photoURL: p?.photoURL || u.photoURL || null,
        role: p?.role || "student",
        isActive,
        status: isActive ? "active" : "disabled",
        profileCompletion: Number(p?.profileCompletion || 0),
        phoneNumber: p?.phoneNumber || null,
        createdAt: p?.createdAt || null,
        lastLogin: p?.lastLogin || u.metadata?.lastSignInTime || null,
      };
    });

    return {
      success: true,
      users: merged,
      nextPageToken: authPage.pageToken || null,
    };
  } catch (error) {
    console.error("listUsersForAdmin error:", error);
    return {
      success: false,
      error: "Failed to list users",
      users: [] as any[],
    };
  }
}
