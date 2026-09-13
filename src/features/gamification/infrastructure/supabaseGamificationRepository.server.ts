import "server-only";

import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import type { TableRow } from "@/infrastructure/supabase/database.types";
import type { Json } from "@/infrastructure/supabase/database.types";

type ProfileRow = TableRow<"gamification_profiles">;
type TransactionRow = TableRow<"xp_transactions">;
type BadgeRow = TableRow<"earned_badges">;
export type GamificationReason = TransactionRow["reason"];

export interface GamificationProfileRecord {
  userId: string;
  totalXp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  badges: string[];
  createdAt?: string;
  updatedAt: string;
}

function mapProfileRow(row: ProfileRow): GamificationProfileRecord {
  return {
    userId: row.user_id,
    totalXp: row.total_xp,
    level: row.level,
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    lastActivityDate: row.last_activity_date,
    badges: row.badges,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getProfile(
  userId: string,
  supabase = createSupabaseServiceClient(),
): Promise<GamificationProfileRecord> {
  const { data, error } = await supabase
    .from("gamification_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  if (data) {
    return mapProfileRow(data as ProfileRow);
  }

  return {
    userId,
    totalXp: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    badges: [],
    updatedAt: new Date().toISOString(),
  };
}

export async function listProfiles(
  supabase = createSupabaseServiceClient(),
): Promise<GamificationProfileRecord[]> {
  const { data, error } = await supabase
    .from("gamification_profiles")
    .select("*")
    .order("total_xp", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapProfileRow(row as ProfileRow));
}

/** Trusted-only atomic award. The caller creates a deterministic event key. */
export async function awardXp(
  input: {
    userId: string;
    amount: number;
    reason: GamificationReason;
    eventKey: string;
    metadata?: Record<string, unknown>;
  },
  supabase = createSupabaseServiceClient(),
): Promise<{
  newTotalXp: number;
  newLevel: number;
  leveledUp: boolean;
  awarded: boolean;
}> {
  if (!input.userId || input.amount <= 0 || !input.eventKey)
    throw new Error("Invalid gamification award");
  const previous = await getProfile(input.userId, supabase);
  const { data, error } = await supabase.rpc("grant_xp_idempotent", {
    p_user_id: input.userId,
    p_amount: input.amount,
    p_reason: input.reason,
    p_event_key: input.eventKey,
    p_metadata: (input.metadata ?? {}) as Json,
  });
  if (error) throw error;
  const result = data?.[0];
  if (!result)
    throw new Error("Gamification ledger did not return an award result");
  return {
    newTotalXp: result.new_total_xp,
    newLevel: result.new_level,
    leveledUp: result.new_level > previous.level,
    awarded: result.awarded,
  };
}

export async function awardBadge(
  userId: string,
  badgeId: string,
  courseId?: string,
  supabase = createSupabaseServiceClient(),
): Promise<void> {
  if (!userId || !badgeId) return;

  const profile = await getProfile(userId, supabase);
  if (profile.badges.includes(badgeId)) return;

  const nextBadges = [...profile.badges, badgeId];
  const { error: profileError } = await supabase
    .from("gamification_profiles")
    .upsert({
      user_id: userId,
      badges: nextBadges,
      updated_at: new Date().toISOString(),
    });

  if (profileError) throw profileError;

  const { error: badgeError } = await supabase.from("earned_badges").insert({
    user_id: userId,
    badge_id: badgeId,
    course_id: courseId || null,
    earned_at: new Date().toISOString(),
  } satisfies Partial<BadgeRow>);

  if (badgeError) throw badgeError;
}

export async function updateStreak(
  userId: string,
  supabase = createSupabaseServiceClient(),
): Promise<void> {
  if (!userId) return;
  const profile = await getProfile(userId, supabase);
  const lastActivity = profile.lastActivityDate
    ? new Date(profile.lastActivityDate)
    : null;
  const today = new Date();

  if (lastActivity && today.toDateString() === lastActivity.toDateString()) {
    return;
  }

  const shouldReset =
    !lastActivity ||
    today.getTime() - lastActivity.getTime() > 48 * 60 * 60 * 1000;
  const nextStreak = shouldReset ? 1 : profile.currentStreak + 1;

  const { error } = await supabase.from("gamification_profiles").upsert({
    user_id: userId,
    current_streak: nextStreak,
    longest_streak: Math.max(profile.longestStreak, nextStreak),
    last_activity_date: today.toISOString(),
    updated_at: today.toISOString(),
  });

  if (error) throw error;
}
