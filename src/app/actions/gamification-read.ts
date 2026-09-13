"use server";

import { verifySession } from "@/lib/auth/server";
import { getProfile } from "@/features/gamification/infrastructure/supabaseGamificationRepository.server";

/** Client-safe read boundary. Never accept a user ID from the browser. */
export async function getMyGamificationProfile() {
  const session = await verifySession();
  if (!session?.uid) return null;
  return getProfile(session.uid);
}
