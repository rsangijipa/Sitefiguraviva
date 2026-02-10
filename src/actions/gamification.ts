"use server";

import { adminDb, auth } from "@/lib/firebase/admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { cookies } from "next/headers";
import {
  XP_VALUES,
  verifyStreakStatus,
  calculateLevel,
} from "@/lib/gamification";

/**
 * Server-Side Action to process gamification events securely.
 */
export async function processGamificationEvent(data: {
  courseId?: string;
  lessonId?: string;
  actionType:
    | "lesson_complete"
    | "quiz_pass"
    | "daily_login"
    | "course_complete";
  metadata?: Record<string, any>;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) return { error: "Unauthorized" };

  try {
    const claims = await auth.verifySessionCookie(sessionCookie, true);
    const uid = claims.uid;
    if (!uid) return { error: "Unauthorized" };

    // Deterministic Event ID
    let eventId = "";
    if (data.actionType === "daily_login") {
      const today = new Date().toISOString().split("T")[0];
      eventId = `${uid}_daily_login_${today}`;
    } else {
      eventId = `${uid}_${data.courseId || "global"}_${data.lessonId || "global"}_${data.actionType}`;
    }

    // Transaction for Atomicity (XP + Level + Streak + Badges)
    return await adminDb.runTransaction(async (transaction) => {
      // 1. Idempotency Check
      const eventRef = adminDb.collection("gamification_events").doc(eventId);
      const eventSnap = await transaction.get(eventRef);

      if (eventSnap.exists) {
        return { success: true, alreadyProcessed: true };
      }

      // 2. Get User Profile
      const profileRef = adminDb.collection("gamification_profiles").doc(uid);
      const profileSnap = await transaction.get(profileRef);
      // Explicit casting to any to access fields safely
      const profileData = profileSnap.exists ? profileSnap.data() : {};
      const profile = {
        totalXp: profileData?.totalXp || 0,
        level: profileData?.level || 1,
        currentStreak: profileData?.currentStreak || 0,
        longestStreak: profileData?.longestStreak || 0,
        lastActivityDate: profileData?.lastActivityDate || null,
        badges: profileData?.badges || [],
      };

      // 3. Validation & XP Logic
      let xpDelta = 0;
      let streakUpdate = {};

      if (data.actionType === "daily_login") {
        // verifyStreakStatus expects a Firestore Timestamp (check lib/gamification.ts)
        // profile.lastActivityDate is from Admin SDK.
        const streakStatus = verifyStreakStatus(
          profile.lastActivityDate as any,
        );

        if (streakStatus === "maintain") {
          // Already handled in time window, but event didn't exist?
          // Trust idempotent eventId. If we are here, we award.
          // But if verifyStreakStatus says maintain, it means we logged in TODAY already.
          // So maybe eventId from 'today' string is different from 'maintain' logic?
          // Let's increment nothing but record event.
          return {
            success: true,
            alreadyProcessed: true,
            reason: "Streak maintained",
          };
        } else if (streakStatus === "increment") {
          const nextStreak = profile.currentStreak + 1;
          streakUpdate = {
            currentStreak: nextStreak,
            longestStreak: Math.max(nextStreak, profile.longestStreak),
          };
          xpDelta = XP_VALUES.DAILY_LOGIN || 10;
        } else if (streakStatus === "reset") {
          streakUpdate = { currentStreak: 1 };
          xpDelta = XP_VALUES.DAILY_LOGIN || 10;
        }
      } else if (
        data.actionType === "lesson_complete" &&
        data.courseId &&
        data.lessonId
      ) {
        // Proof of Work
        const progressRef = adminDb
          .collection("progress")
          .doc(`${uid}_${data.courseId}`);
        const progressSnap = await transaction.get(progressRef);

        if (!progressSnap.exists) throw new Error("Progress not found");

        const lessonProgress =
          progressSnap.data()?.lessonProgress?.[data.lessonId];
        if (!lessonProgress?.completed) {
          console.warn(
            `[Security] Spoof attempt ${uid} lesson ${data.lessonId}`,
          );
          throw new Error("Lesson not completed");
        }
        xpDelta = XP_VALUES.LESSON_COMPLETED || 50;
      } else if (data.actionType === "course_complete" && data.courseId) {
        // Proof of Work
        const progressRef = adminDb
          .collection("progress")
          .doc(`${uid}_${data.courseId}`);
        const progressSnap = await transaction.get(progressRef);
        if (!progressSnap.exists || !progressSnap.data()?.completed) {
          throw new Error("Course not completed");
        }
        xpDelta = XP_VALUES.COURSE_COMPLETED || 500;
      } else if (data.actionType === "quiz_pass") {
        xpDelta = XP_VALUES.QUIZ_PASSED || 100;
      }

      // 4. Badge Logic (Internal)
      const newBadges: string[] = [];
      const awardBadge = (badgeId: string) => {
        if (!profile.badges.includes(badgeId) && !newBadges.includes(badgeId)) {
          newBadges.push(badgeId);
        }
      };

      if (data.actionType === "lesson_complete") {
        awardBadge("first_steps"); // First lesson badge
      }
      if (data.actionType === "course_complete") {
        awardBadge("course_completion_1"); // First course badge
        if (data.metadata?.courseTitle?.toLowerCase().includes("gestalt")) {
          awardBadge("gestalt_master");
        }
      }

      // Check Pioneer (First Login / Early Adopter)
      if (!profile.badges.includes("pioneer_student")) {
        try {
          const userRecord = await auth.getUser(uid);
          const creationTime = new Date(userRecord.metadata.creationTime);
          const cutoff = new Date("2026-03-01T00:00:00Z");
          if (creationTime < cutoff) {
            awardBadge("pioneer_student");
          }
        } catch (e) {
          console.error("Error checking pioneer badge:", e);
        }
      }

      // Check Dedicated (Streak > 7)
      if (!profile.badges.includes("dedicated_learner")) {
        const currentStreak =
          (streakUpdate as any).currentStreak || profile.currentStreak;
        if (currentStreak >= 7) {
          awardBadge("dedicated_learner");
        }
      }

      // 5. Calculate New State
      const newTotalXp = profile.totalXp + xpDelta;
      const newLevel = calculateLevel(newTotalXp);
      const leveledUp = newLevel > profile.level;
      const allBadges = [...profile.badges, ...newBadges];

      // 6. Writes
      // A. Event
      transaction.set(eventRef, {
        uid,
        actionType: data.actionType,
        xpAmount: xpDelta,
        badgesEarned: newBadges,
        metadata: data.metadata || {},
        timestamp: Timestamp.now(),
        userAgent: "Server Action",
      });

      // B. Profile
      transaction.set(
        profileRef,
        {
          totalXp: newTotalXp,
          level: newLevel,
          badges: allBadges,
          lastActivityDate: Timestamp.now(),
          updatedAt: Timestamp.now(),
          ...streakUpdate,
        },
        { merge: true },
      );

      // C. Transaction Log (Legacy)
      if (xpDelta > 0) {
        const transRef = adminDb.collection("xp_transactions").doc();
        transaction.set(transRef, {
          userId: uid,
          amount: xpDelta,
          reason: data.actionType,
          timestamp: Timestamp.now(),
          metadata: data.metadata || {},
        });
      }

      // D. Earned Badges Log
      newBadges.forEach((badgeId) => {
        const earnedRef = adminDb
          .collection("earned_badges")
          .doc(`${uid}_${badgeId}`);
        transaction.set(earnedRef, {
          userId: uid,
          badgeId,
          courseId: data.courseId || null,
          earnedAt: Timestamp.now(),
        });
      });

      return {
        success: true,
        xpAwarded: xpDelta,
        newLevel,
        leveledUp,
        newBadges, // Return for UI toast
      };
    });
  } catch (error) {
    console.error("Process Gamification Event Error:", error);
    return { error: "Internal Server Error" };
  }
}
