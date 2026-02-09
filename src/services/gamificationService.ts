import { db } from "@/lib/firebase/client";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  arrayUnion,
  Timestamp,
} from "firebase/firestore";
import {
  UserGamificationProfile,
  XpTransaction,
  EarnedBadge,
} from "@/types/gamification";
import {
  calculateLevel,
  verifyStreakStatus,
  XP_VALUES,
} from "@/lib/gamification";
import { logger } from "@/lib/logger";

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

      // Initialize if doesn't exist
      const newProfile: UserGamificationProfile = {
        uid: userId,
        totalXp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        badges: [],
        updatedAt: Timestamp.now(), // Since serverTimestamp() is for writes
      };

      await setDoc(docRef, {
        ...newProfile,
        updatedAt: serverTimestamp(),
      });

      return newProfile;
    } catch (error) {
      logger.error("Error fetching gamification profile", error, { userId });
      return null;
    }
  },

  /**
   * Award XP to a user.
   */
  async awardXp(
    userId: string,
    amount: number,
    reason: XpTransaction["reason"],
    metadata?: Record<string, any>,
  ) {
    if (!userId || amount <= 0) return;

    try {
      const docRef = doc(db, "gamification_profiles", userId);
      const profile = await this.getProfile(userId);

      if (!profile) return;

      const newTotalXp = profile.totalXp + amount;
      const newLevel = calculateLevel(newTotalXp);

      // Update Profile
      await updateDoc(docRef, {
        totalXp: increment(amount),
        level: newLevel,
        updatedAt: serverTimestamp(),
      });

      // Log Transaction
      const transactionId = doc(db, "xp_transactions", "temp").id; // Mock ID for path
      const transRef = doc(
        db,
        "xp_transactions",
        `${userId}_${Timestamp.now().toMillis()}`,
      );
      await setDoc(transRef, {
        userId,
        amount,
        reason,
        metadata: metadata || {},
        timestamp: serverTimestamp(),
      });

      // Special handling for Level Up
      if (newLevel > profile.level) {
        // Trigger Level Up notification (client-side can listen or we can emit)
        logger.info("User leveled up", { userId, newLevel });
      }

      return { newTotalXp, newLevel, leveledUp: newLevel > profile.level };
    } catch (error) {
      logger.error("Error awarding XP", error, { userId, amount, reason });
    }
  },

  async updateStreak(userId: string) {
    if (!userId) return null;

    try {
      const docRef = doc(db, "gamification_profiles", userId);
      const profile = await this.getProfile(userId);

      if (!profile) return null;

      const status = verifyStreakStatus(profile.lastActivityDate);

      if (status === "maintain") return null; // Already handled today

      let updates: any = {
        lastActivityDate: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      let xpResult = null;

      if (status === "increment" || status === "reset") {
        if (status === "increment") {
          const nextStreak = (profile.currentStreak || 0) + 1;
          updates.currentStreak = increment(1);
          if (nextStreak > (profile.longestStreak || 0)) {
            updates.longestStreak = nextStreak;
          }
        } else {
          updates.currentStreak = 1;
        }

        // Daily login bonus
        xpResult = await this.awardXp(
          userId,
          XP_VALUES.DAILY_LOGIN,
          "daily_login",
        );
      }

      await updateDoc(docRef, updates);
      return { status, xpResult };
    } catch (error) {
      logger.error("Error updating streak", error, { userId });
      return null;
    }
  },

  /**
   * Award a badge to a user.
   */
  async awardBadge(userId: string, badgeId: string, courseId?: string) {
    if (!userId || !badgeId) return;

    try {
      const docRef = doc(db, "gamification_profiles", userId);
      const profile = await this.getProfile(userId);

      if (!profile || profile.badges.includes(badgeId)) return;

      await updateDoc(docRef, {
        badges: arrayUnion(badgeId),
        updatedAt: serverTimestamp(),
      });

      const earnedBadgeRef = doc(db, "earned_badges", `${userId}_${badgeId}`);
      await setDoc(earnedBadgeRef, {
        userId,
        badgeId,
        courseId: courseId || null,
        earnedAt: serverTimestamp(),
      });

      logger.info("Badge awarded", { userId, badgeId });
    } catch (error) {
      logger.error("Error awarding badge", error, { userId, badgeId });
    }
  },

  /**
   * Get all badges for a user, including locked ones.
   */
  async getBadges(userId: string) {
    if (!userId) return [];

    try {
      // Fetch User Profile
      const profile = await this.getProfile(userId);
      const earnedBadgeIds = profile?.badges || [];

      // In a real app, badges metadata would come from a 'badges' collection
      // For now, we use the static definitions from badgesData.ts
      const { badges } = await import("@/lib/gamification/badgesData");

      return badges
        .map((badge) => ({
          ...badge,
          isLocked: !earnedBadgeIds.includes(badge.id),
          earnedAt: null, // We could fetch earned date from earned_badges subcollection if needed
        }))
        .sort((a, b) => {
          // Sort: Unlocked first, then by order
          if (a.isLocked === b.isLocked) return a.order - b.order;
          return a.isLocked ? 1 : -1;
        });
    } catch (error) {
      logger.error("Error fetching user badges", error, { userId });
      return [];
    }
  },
};
