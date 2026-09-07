import { randomUUID } from "crypto";
import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import type { TableRow } from "@/infrastructure/supabase/database.types";

type ProfileRow = TableRow<"gamification_profiles">;
type TransactionRow = TableRow<"xp_transactions">;
type BadgeRow = TableRow<"earned_badges">;

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
  supabase = createSupabaseBrowserClient(),
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
  supabase = createSupabaseBrowserClient(),
): Promise<GamificationProfileRecord[]> {
  const { data, error } = await supabase
    .from("gamification_profiles")
    .select("*")
    .order("total_xp", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapProfileRow(row as ProfileRow));
}

export async function awardXp(
  userId: string,
  amount: number,
  reason: TransactionRow["reason"],
  metadata?: Record<string, unknown>,
  supabase = createSupabaseBrowserClient(),
): Promise<{
  newTotalXp: number;
  newLevel: number;
  leveledUp: boolean;
} | void> {
  if (!userId || amount <= 0) return;

  const profile = await getProfile(userId, supabase);
  const newTotalXp = profile.totalXp + amount;
  const newLevel = Math.max(1, Math.floor(newTotalXp / 100) + 1);

  const profileUpdate = {
    user_id: userId,
    total_xp: newTotalXp,
    level: newLevel,
    updated_at: new Date().toISOString(),
  };

  const { error: updateError } = await supabase
    .from("gamification_profiles")
    .upsert(profileUpdate);

  if (updateError) throw updateError;

  const { error: txError } = await supabase.from("xp_transactions").insert({
    id: randomUUID(),
    user_id: userId,
    amount,
    reason,
    metadata: (metadata || {}) as any,
    timestamp: new Date().toISOString(),
  });

  if (txError) throw txError;

  return {
    newTotalXp,
    newLevel,
    leveledUp: newLevel > profile.level,
  };
}

export async function awardBadge(
  userId: string,
  badgeId: string,
  courseId?: string,
  supabase = createSupabaseBrowserClient(),
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
    id: randomUUID(),
    user_id: userId,
    badge_id: badgeId,
    course_id: courseId || null,
    earned_at: new Date().toISOString(),
  } satisfies Partial<BadgeRow>);

  if (badgeError) throw badgeError;
}

export async function updateStreak(
  userId: string,
  supabase = createSupabaseBrowserClient(),
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
