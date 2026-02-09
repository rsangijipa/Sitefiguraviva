import { adminDb } from "@/lib/firebase/admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
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
   * Get or initialize a user's gamification profile (Server-Side).
   */
  async getProfile(userId: string): Promise<UserGamificationProfile | null> {
    if (!userId) return null;

    try {
      const docRef = adminDb.collection("gamification_profiles").doc(userId);
      const snap = await docRef.get();

      if (snap.exists) {
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
        updatedAt: Timestamp.now() as any,
      };

      await docRef.set({
        ...newProfile,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return newProfile;
    } catch (error) {
      console.error(
        "[AdminGamificationService] Error fetching profile:",
        error,
      );
      return null;
    }
  },

  /**
   * Award XP to a user (Server-Side).
   */
  async awardXp(
    userId: string,
    amount: number,
    reason: XpTransaction["reason"],
    metadata?: Record<string, any>,
  ) {
    if (!userId || amount <= 0) return;

    try {
      const docRef = adminDb.collection("gamification_profiles").doc(userId);
      const profile = await this.getProfile(userId);

      if (!profile) return;

      const newTotalXp = profile.totalXp + amount;
      const newLevel = calculateLevel(newTotalXp);

      // Update Profile
      await docRef.update({
        totalXp: FieldValue.increment(amount),
        level: newLevel,
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Log Transaction
      const transId = `${userId}_${Date.now()}`;
      await adminDb
        .collection("xp_transactions")
        .doc(transId)
        .set({
          userId,
          amount,
          reason,
          metadata: metadata || {},
          timestamp: FieldValue.serverTimestamp(),
        });

      return { newTotalXp, newLevel, leveledUp: newLevel > profile.level };
    } catch (error) {
      console.error("[AdminGamificationService] Error awarding XP:", error);
    }
  },

  /**
   * Updates user streak (Server-Side).
   */
  async updateStreak(userId: string) {
    if (!userId) return;

    try {
      const docRef = adminDb.collection("gamification_profiles").doc(userId);
      const profile = await this.getProfile(userId);

      if (!profile) return;

      const status = verifyStreakStatus(profile.lastActivityDate as any);

      if (status === "maintain") return;

      let updates: any = {
        lastActivityDate: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      if (status === "increment") {
        const nextStreak = (profile.currentStreak || 0) + 1;
        updates.currentStreak = FieldValue.increment(1);
        if (nextStreak > (profile.longestStreak || 0)) {
          updates.longestStreak = nextStreak;
        }
        await this.awardXp(userId, XP_VALUES.DAILY_LOGIN, "daily_login");
      } else if (status === "reset") {
        updates.currentStreak = 1;
        await this.awardXp(userId, XP_VALUES.DAILY_LOGIN, "daily_login");
      }

      await docRef.update(updates);
    } catch (error) {
      console.error("[AdminGamificationService] Error updating streak:", error);
    }
  },

  /**
   * Award a badge (Server-Side).
   */
  async awardBadge(userId: string, badgeId: string, courseId?: string) {
    if (!userId || !badgeId) return;

    try {
      const docRef = adminDb.collection("gamification_profiles").doc(userId);
      const profile = await this.getProfile(userId);

      if (!profile || profile.badges.includes(badgeId)) return;

      await docRef.update({
        badges: FieldValue.arrayUnion(badgeId),
        updatedAt: FieldValue.serverTimestamp(),
      });

      const earnedId = `${userId}_${badgeId}`;
      await adminDb
        .collection("earned_badges")
        .doc(earnedId)
        .set({
          userId,
          badgeId,
          courseId: courseId || null,
          earnedAt: FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error("[AdminGamificationService] Error awarding badge:", error);
    }
  },
};
