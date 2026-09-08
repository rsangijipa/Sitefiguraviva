"use server";

import { requireAdmin } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { UserRole, UserStatus } from "@/types/user";
import { revalidatePath } from "next/cache";

import { auditService } from "@/lib/audit";
import { deepSafeSerialize } from "@/lib/utils";

/**
 * User accounts are created exclusively through Supabase Auth
 * (registerForCourseAction, admin OAuth login) — nothing writes to Firebase
 * Auth anymore. This file used to manage users entirely through the
 * Firebase Admin SDK (adminAuth.listUsers/updateUser/deleteUser +
 * Firestore's `users` collection), which meant every account created after
 * the Supabase migration was completely invisible to "Usuários &
 * Permissões" and "Alunos & Matrículas" in the admin panel — the exact
 * symptom of a student who signs up never appearing for the admin to find.
 */

const ROLE_MAP: Record<string, UserRole> = {
  admin: "admin",
  administrador: "admin",
  tutor: "tutor",
  student: "student",
};

function normalizeRole(role: unknown): UserRole {
  return ROLE_MAP[String(role || "").toLowerCase()] || "student";
}

export async function updateUserRole(targetUid: string, newRole: UserRole) {
  const adminClaims = await requireAdmin();
  const actorUid = adminClaims.uid;

  try {
    const supabase = createSupabaseServiceClient();
    const { data: before } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", targetUid)
      .maybeSingle();

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq("id", targetUid);
    if (error) throw error;

    await auditService.logEvent({
      eventType: "USER_ROLE_UPDATED",
      actor: { uid: actorUid, email: adminClaims.email },
      target: { id: targetUid, collection: "profiles" },
      diff: {
        before: { role: before?.role || "student" },
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

  const isActive = newStatus !== "disabled";

  try {
    const supabase = createSupabaseServiceClient();
    const { data: before } = await supabase
      .from("profiles")
      .select("is_active")
      .eq("id", targetUid)
      .maybeSingle();

    const { error } = await supabase
      .from("profiles")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", targetUid);
    if (error) throw error;

    // Belt-and-suspenders: also block sign-in at the auth layer, not just
    // the app-level `is_active` gate.
    await supabase.auth.admin
      .updateUserById(targetUid, {
        ban_duration: isActive ? "none" : "87600000h", // ~10,000 years
      })
      .catch((err) =>
        console.error("toggleUserStatus: auth ban update failed:", err),
      );

    await auditService.logEvent({
      eventType: isActive ? "USER_ENABLED" : "USER_DISABLED",
      actor: { uid: actorUid, email: adminClaims.email },
      target: { id: targetUid, collection: "profiles" },
      diff: {
        before: { isActive: before?.is_active },
        after: { isActive },
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

export async function deleteUser(targetUid: string) {
  const adminClaims = await requireAdmin();
  const actorUid = adminClaims.uid;

  if (targetUid === actorUid) {
    return {
      success: false,
      error: "Você não pode excluir sua própria conta.",
    };
  }

  try {
    const supabase = createSupabaseServiceClient();

    await supabase.auth.admin.deleteUser(targetUid).catch((err) => {
      // Already gone from Auth (e.g. previously deleted) — still clean the
      // profile row rather than failing the whole action.
      console.error("deleteUser: auth delete failed:", err);
    });

    await supabase.from("profiles").delete().eq("id", targetUid);

    await auditService.logEvent({
      eventType: "USER_DELETED",
      actor: { uid: actorUid, email: adminClaims.email },
      target: { id: targetUid, collection: "profiles" },
      payload: { deletedAt: new Date().toISOString() },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("deleteUser error:", error);
    return {
      success: false,
      error: error.message || "Erro ao excluir usuário",
    };
  }
}

export async function listUsersForAdmin(
  pageToken?: string,
  pageSize: number = 100,
) {
  await requireAdmin();

  try {
    const supabase = createSupabaseServiceClient();
    const page = pageToken ? parseInt(pageToken, 10) || 1 : 1;
    const perPage = Math.min(pageSize, 1000);

    const [
      { data: authPage, error: authError },
      { data: profiles, error: profileError },
    ] = await Promise.all([
      supabase.auth.admin.listUsers({ page, perPage }),
      supabase.from("profiles").select("*"),
    ]);

    if (authError) throw authError;
    if (profileError) throw profileError;

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    const merged = (authPage?.users || []).map((u) => {
      const p = profileMap.get(u.id);
      const isActive = p?.is_active ?? true;
      return {
        id: u.id,
        uid: u.id,
        email: u.email || p?.email || null,
        displayName:
          p?.display_name || (u.user_metadata as any)?.full_name || null,
        photoURL: p?.photo_url || null,
        role: normalizeRole(p?.role),
        isActive,
        status: isActive ? "active" : "disabled",
        profileCompletion: 0,
        phoneNumber: (u.user_metadata as any)?.phone || null,
        createdAt: p?.created_at || u.created_at || null,
        lastLogin: p?.last_login_at || u.last_sign_in_at || null,
      };
    });

    const hasNextPage = (authPage?.users?.length || 0) >= perPage;

    return {
      success: true,
      users: deepSafeSerialize(merged),
      nextPageToken: hasNextPage ? String(page + 1) : null,
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
