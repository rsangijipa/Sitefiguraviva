import {
  awardBadge,
  awardXp,
  getProfile as getProfileFromRepo,
  listProfiles,
  updateStreak as updateStreakFromRepo,
  type GamificationProfileRecord,
} from "@/features/gamification/infrastructure/supabaseGamificationRepository.server";
import { Timestamp } from "firebase/firestore";
import type { UserGamificationProfile } from "@/types/gamification";
import { logger } from "@/lib/logger";
import { processGamificationEvent } from "@/actions/gamification";

export const gamificationService = {
  /**
   * Get or initialize a user's gamification profile.
   */
  async getProfile(userId: string): Promise<UserGamificationProfile | null> {
    if (!userId) return null;

    try {
      const profile = await getProfileFromRepo(userId);
      return {
        uid: profile.userId,
        totalXp: profile.totalXp,
        level: profile.level,
        currentStreak: profile.currentStreak,
        longestStreak: profile.longestStreak,
        lastActivityDate: profile.lastActivityDate
          ? Timestamp.fromDate(new Date(profile.lastActivityDate))
          : null,
        badges: profile.badges,
        updatedAt: Timestamp.fromDate(new Date(profile.updatedAt)),
      };
    } catch (error) {
      logger.error("Error fetching gamification profile", error, { userId });
      return null;
    }
  },

  /**
   * Update User Streak (Securely via Server Action)
   */
  async updateStreak(userId: string) {
    if (!userId) return null;

    try {
      const result = await processGamificationEvent({
        actionType: "daily_login",
        metadata: { source: "client_service" },
      });

      if ((result as any).error) {
        logger.error(
          "Error updating streak via server action",
          (result as any).error,
        );
        return null;
      }

      const successResult = result as any;

      return {
        status: successResult.reason || "updated",
        xpResult: {
          xpAwarded: successResult.xpAwarded,
          leveledUp: successResult.leveledUp,
          newLevel: successResult.newLevel,
          newBadges: successResult.newBadges,
        },
      };
    } catch (error) {
      logger.error("Error updating streak", error, { userId });
      return null;
    }
  },

  /**
   * Process Course Completion (Securely via Server Action)
   */
  async onCourseCompletion(
    userId: string,
    courseId: string,
    courseTitle: string,
  ) {
    try {
      const result = await processGamificationEvent({
        actionType: "course_complete",
        courseId,
        metadata: { courseTitle },
      });

      if ((result as any).error) throw new Error((result as any).error);
      return result;
    } catch (error) {
      logger.error("Error processing course completion", error, {
        userId,
        courseId,
      });
    }
  },

  /**
   * Process Lesson Completion (Securely via Server Action)
   */
  async onLessonCompletion(userId: string, courseId: string, lessonId: string) {
    try {
      const result = await processGamificationEvent({
        actionType: "lesson_complete",
        courseId,
        lessonId,
      });

      if ((result as any).error) throw new Error((result as any).error);
      return result;
    } catch (error) {
      logger.error("Error processing lesson completion", error, {
        userId,
        courseId,
        lessonId,
      });
    }
  },

  /**
   * Get all badges for a user (Read-Only)
   */
  async getBadges(userId: string) {
    if (!userId) return [];

    try {
      const profile = await this.getProfile(userId);
      const earnedBadgeIds = profile?.badges || [];

      // Import static definitions
      const { badges } = await import("@/lib/gamification/badgesData");

      return badges
        .map((badge) => ({
          ...badge,
          isLocked: !earnedBadgeIds.includes(badge.id),
          earnedAt: null, // Could fetch if needed
        }))
        .sort((a, b) => {
          if (a.isLocked === b.isLocked) return a.order - b.order;
          return a.isLocked ? 1 : -1;
        });
    } catch (error) {
      logger.error("Error fetching user badges", error, { userId });
      return [];
    }
  },

  // Deprecated/Removed Client Writes
  async awardXp() {
    console.warn("awardXp is now server-only");
  },
  async awardBadge() {
    console.warn("awardBadge is now server-only");
  },
};
