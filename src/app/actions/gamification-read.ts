"use server";

import { verifySession, requireAdmin } from "@/lib/auth/server";
import {
  getProfile,
  listProfiles,
} from "@/features/gamification/infrastructure/supabaseGamificationRepository.server";

/** Client-safe read boundary. Never accept a user ID from the browser. */
export async function getMyGamificationProfile() {
  const session = await verifySession();
  if (!session?.uid) return null;
  return getProfile(session.uid);
}

export async function getAdminGamificationProfiles() {
  await requireAdmin();
  return listProfiles();
}
