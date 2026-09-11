import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import {
  awardBadge as awardBadgeRepository,
  awardXp as awardXpRepository,
  getProfile as getProfileRepository,
  updateStreak as updateStreakRepository,
} from "@/features/gamification/infrastructure/supabaseGamificationRepository.server";
import { XP_VALUES } from "@/lib/gamification";

/** Server facade kept for existing callers; Supabase is the source of truth. */
export const gamificationService = {
  async getProfile(userId: string) {
    if (!userId) return null;
    try {
      const profile = await getProfileRepository(
        userId,
        createSupabaseServiceClient() as any,
      );
      return {
        uid: profile.userId,
        totalXp: profile.totalXp,
        level: profile.level,
        currentStreak: profile.currentStreak,
        longestStreak: profile.longestStreak,
        lastActivityDate: profile.lastActivityDate,
        badges: profile.badges,
        updatedAt: profile.updatedAt,
      };
    } catch (error) {
      console.error("[Gamification] Profile read failed:", error);
      return null;
    }
  },

  async awardXp(
    userId: string,
    amount: number,
    reason: any,
    metadata?: Record<string, any>,
  ) {
    if (!userId || amount <= 0) return;
    return awardXpRepository(
      userId,
      amount,
      reason,
      metadata,
      createSupabaseServiceClient() as any,
    );
  },

  async updateStreak(userId: string) {
    if (!userId) return;
    return updateStreakRepository(userId, createSupabaseServiceClient() as any);
  },

  async awardBadge(userId: string, badgeId: string, courseId?: string) {
    if (!userId || !badgeId) return;
    return awardBadgeRepository(
      userId,
      badgeId,
      courseId,
      createSupabaseServiceClient() as any,
    );
  },

  async onCourseCompletion(
    userId: string,
    courseId: string,
    courseTitle: string,
  ) {
    await this.awardXp(
      userId,
      XP_VALUES.COURSE_COMPLETED || 500,
      "course_completed",
      { courseId, courseTitle },
    );
    const profile = await this.getProfile(userId);
    if (
      !profile?.badges.includes("course_completion_1") &&
      !profile?.badges.includes("first_steps")
    ) {
      await this.awardBadge(userId, "course_completion_1", courseId);
    }
    if (courseTitle?.toLowerCase().includes("formação completa em gestalt")) {
      await this.awardBadge(userId, "gestalt_master", courseId);
    }
  },

  async onLessonCompletion(userId: string, courseId: string, lessonId: string) {
    await this.awardXp(
      userId,
      XP_VALUES.LESSON_COMPLETED || 50,
      "lesson_completed",
      { courseId, lessonId },
    );
    const profile = await this.getProfile(userId);
    if (profile && !profile.badges.includes("first_steps")) {
      await this.awardBadge(userId, "first_steps", courseId);
    }
  },
};
