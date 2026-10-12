"use server";

import { requireAdmin } from "@/lib/auth/server";
import {
  awardXp,
  awardBadge,
} from "@/features/gamification/infrastructure/supabaseGamificationRepository.server";
import { randomUUID } from "node:crypto";
import { BADGE_DEFINITIONS } from "@/lib/gamification";
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

  if (
    !userId ||
    !Number.isSafeInteger(amount) ||
    amount <= 0 ||
    amount > 100000 ||
    !reason?.trim() ||
    reason.length > 1000
  )
    return { error: "Informe um valor inteiro positivo e um motivo." };

  try {
    await awardXp({
      userId,
      amount,
      reason: "admin_reward",
      eventKey: `admin:${randomUUID()}`,
      metadata: {
        adminId: adminClaims.uid,
        reason: reason.trim(),
      },
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

  if (!userId || !BADGE_DEFINITIONS.some((badge) => badge.id === badgeId))
    return { error: "Conquista inválida." };

  try {
    await awardBadge(userId, badgeId);

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
