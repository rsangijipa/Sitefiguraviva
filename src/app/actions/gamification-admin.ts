"use server";

import { requireAdmin } from "@/lib/auth/server";
import { gamificationService } from "@/lib/gamification/gamificationService";
import { auditService } from "@/lib/audit";
import { revalidatePath } from "next/cache";

/**
 * Manually award XP to a user from the Admin panel.
 */
export async function awardManualXp(
  userId: string,
  amount: number,
  reason: string,
) {
  const adminClaims = await requireAdmin();

  if (!userId || amount === 0) return { error: "Invalid data" };

  try {
    await gamificationService.awardXp(userId, amount, "admin_reward", {
      adminId: adminClaims.uid,
      adminEmail: adminClaims.email,
      reason,
    });

    await auditService.logEvent({
      eventType: "ADMIN_XP_AWARDED",
      actor: { uid: adminClaims.uid, email: adminClaims.email },
      target: { id: userId, collection: "gamification_profiles" },
      payload: { amount, reason },
    });

    revalidatePath("/admin/gamification");
    return { success: true };
  } catch (error) {
    console.error("awardManualXp error:", error);
    return { error: "Failed to award XP" };
  }
}

/**
 * Manually award a badge to a user from the Admin panel.
 */
export async function awardManualBadge(userId: string, badgeId: string) {
  const adminClaims = await requireAdmin();

  if (!userId || !badgeId) return { error: "Invalid data" };

  try {
    await gamificationService.awardBadge(userId, badgeId);

    await auditService.logEvent({
      eventType: "ADMIN_BADGE_AWARDED",
      actor: { uid: adminClaims.uid, email: adminClaims.email },
      target: { id: userId, collection: "gamification_profiles" },
      payload: { badgeId },
    });

    revalidatePath("/admin/gamification");
    return { success: true };
  } catch (error) {
    console.error("awardManualBadge error:", error);
    return { error: "Failed to award badge" };
  }
}
