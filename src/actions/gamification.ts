"use server";

import { z } from "zod";
import { verifySession } from "@/lib/auth/server";
import {
  awardDailyLogin,
  awardLibraryView,
} from "@/features/gamification/application/awardCanonicalGamification.server";

const clientEvent = z.discriminatedUnion("actionType", [
  z.object({ actionType: z.literal("daily_login") }),
  z.object({
    actionType: z.literal("library_view"),
    resourceId: z.string().min(1).max(128),
  }),
]);

/** Client events intentionally exclude completion/quiz awards: those are server-derived. */
export async function processGamificationEvent(raw: unknown) {
  const session = await verifySession();
  if (!session) return { error: "Unauthorized" };
  const parsed = clientEvent.safeParse(raw);
  if (!parsed.success) return { error: "Unsupported gamification event" };
  try {
    const result =
      parsed.data.actionType === "daily_login"
        ? await awardDailyLogin(session.uid)
        : await awardLibraryView(session.uid, parsed.data.resourceId);
    return {
      success: true,
      processed: result.awarded,
      xpAwarded: result.awarded ? result.newTotalXp : 0,
      newLevel: result.newLevel,
      leveledUp: result.leveledUp,
    };
  } catch {
    return { error: "Could not process gamification event." };
  }
}
