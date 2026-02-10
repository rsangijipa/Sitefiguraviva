import { db } from "@/lib/firebase/client";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { UserGamificationProfile, XpTransaction } from "@/types/gamification";
import { logger } from "@/lib/logger";
import { processGamificationEvent } from "@/actions/gamification";

export const gamificationService = {
  /**
   * Get or initialize a user's gamification profile.
   */
  async getProfile(userId: string): Promise<UserGamificationProfile | null> {
    if (!userId) return null;

    try {
      const docRef = doc(db, "gamification_profiles", userId);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        return snap.data() as UserGamificationProfile;
      }

      // Initialize default profile structure in memory
      // We don't write here because client writes are disabled.
      // The server action will create it if needed, or we rely on sign-up triggers.
      return {
        uid: userId,
        totalXp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        badges: [],
        updatedAt: Timestamp.now(),
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
