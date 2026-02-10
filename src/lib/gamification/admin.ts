import { adminDb } from "@/lib/firebase/admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { XP_VALUES } from "@/lib/gamification";

const COLLECTION_PROFILES = "gamification_profiles";
const COLLECTION_TRANSACTIONS = "xp_transactions";
const COLLECTION_EARNED_BADGES = "earned_badges";

export const gamificationAdmin = {
  /**
   * Get or initialize a user's gamification profile (Server Side).
   */
  async getProfile(userId: string) {
    const docRef = adminDb.collection(COLLECTION_PROFILES).doc(userId);
    const snap = await docRef.get();

    if (snap.exists) {
      return snap.data();
    }

    // Initialize if doesn't exist
    const newProfile = {
      uid: userId,
      totalXp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      badges: [],
      updatedAt: Timestamp.now(),
    };

    await docRef.set(newProfile);
    return newProfile;
  },

  /**
   * Award XP to a user (Server Side).
   */
  async awardXp(
    userId: string,
    amount: number,
    reason: string,
    metadata?: Record<string, any>,
  ) {
    if (!userId || amount <= 0) return;

    try {
      const docRef = adminDb.collection(COLLECTION_PROFILES).doc(userId);
      const profile = await this.getProfile(userId);

      if (!profile) return;

      const newTotalXp = (profile.totalXp || 0) + amount;
      const newLevel = Math.floor(newTotalXp / 500) + 1;

      // Update Profile
      await docRef.update({
        totalXp: FieldValue.increment(amount),
        level: newLevel,
        updatedAt: Timestamp.now(),
      });

      // Log Transaction
      const transRef = adminDb
        .collection(COLLECTION_TRANSACTIONS)
        .doc(`${userId}_${Date.now()}`);

      await transRef.set({
        userId,
        amount,
        reason,
        metadata: metadata || {},
        timestamp: Timestamp.now(),
      });

      console.log(
        `[Gamification] Awarded ${amount} XP to ${userId} for ${reason}`,
      );

      return {
        newTotalXp,
        newLevel,
        leveledUp: newLevel > (profile.level || 1),
      };
    } catch (error) {
      console.error("[Gamification] Error awarding XP:", error);
    }
  },

  /**
   * Award a badge to a user (Server Side).
   */
  async awardBadge(userId: string, badgeId: string, courseId?: string) {
    if (!userId || !badgeId) return;

    try {
      const docRef = adminDb.collection(COLLECTION_PROFILES).doc(userId);
      const profile = await this.getProfile(userId);

      if (!profile || (profile.badges || []).includes(badgeId)) return;

      await docRef.update({
        badges: FieldValue.arrayUnion(badgeId),
        updatedAt: Timestamp.now(),
      });

      const earnedBadgeRef = adminDb
        .collection(COLLECTION_EARNED_BADGES)
        .doc(`${userId}_${badgeId}`);

      await earnedBadgeRef.set({
        userId,
        badgeId,
        courseId: courseId || null,
        earnedAt: Timestamp.now(),
      });

      console.log(`[Gamification] Awarded badge ${badgeId} to ${userId}`);
      return true;
    } catch (error) {
      console.error("[Gamification] Error awarding badge:", error);
      return false;
    }
  },

  /**
   * Process Course Completion Logic
   */
  async onCourseCompletion(
    userId: string,
    courseId: string,
    courseTitle: string,
  ) {
    console.log(
      `[Gamification] Processing completion for ${userId} in ${courseId}`,
    );

    // 1. Award XP for Course Completion
    await this.awardXp(
      userId,
      XP_VALUES.COURSE_COMPLETED || 500,
      "course_completed",
      { courseId, courseTitle },
    );

    // 2. Check for "First Step" Badge (First Course Completed)
    const profile = await this.getProfile(userId);
    const earnedBadges = profile?.badges || [];

    if (!earnedBadges.includes("course_completion_1")) {
      const awarded = await this.awardBadge(
        userId,
        "course_completion_1",
        courseId,
      );
      if (awarded) {
        console.log(`[Gamification] User ${userId} earned 'First Step' badge!`);
      }
    }

    // 3. Check for specific courses (Example: Gestalt Master)
    // In a real app, we'd check tags or categories of the course
    if (
      courseTitle &&
      courseTitle.toLowerCase().includes("formação completa em gestalt")
    ) {
      await this.awardBadge(userId, "gestalt_master", courseId);
    }
  },
};
