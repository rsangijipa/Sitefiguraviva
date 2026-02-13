"use server";

import { adminDb, auth } from "@/lib/firebase/admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { cookies } from "next/headers";
import {
  XP_VALUES,
  verifyStreakStatus,
  calculateLevel,
} from "@/lib/gamification";
import { telemetry } from "@/lib/telemetry";

// ... imports remain the same

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
    | "course_complete"
    | "library_view";
  metadata?: Record<string, any>;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    telemetry.error(new Error("Gamification attempt without session"));
    return { error: "Unauthorized" };
  }

  try {
    const claims = await auth.verifySessionCookie(sessionCookie, true);
    const uid = claims.uid;
    if (!uid) return { error: "Unauthorized" };

    // 1. Deterministic Event ID (Idempotency Key)
    // Critical: naming must be unique per logical event, but constant for retries.
    let eventId = "";
    if (data.actionType === "daily_login") {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      eventId = `daily_login_${uid}_${today}`;
    } else if (data.actionType === "lesson_complete" && data.lessonId) {
      eventId = `lesson_complete_${uid}_${data.lessonId}`;
    } else if (data.actionType === "course_complete" && data.courseId) {
      eventId = `course_complete_${uid}_${data.courseId}`;
    } else {
      // Fallback for generic events (quiz?) - use timestamp if not unique restricted
      eventId = `event_${uid}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    }

    // 2. Transaction: Idempotency + State Update
    return await adminDb.runTransaction(async (transaction) => {
      // A. Check Idempotency
      const eventRef = adminDb.collection("gamification_events").doc(eventId);
      const eventSnap = await transaction.get(eventRef);

      if (eventSnap.exists) {
        // Event already processed. Return success to UI but do nothing.
        telemetry.track("gamification_idempotent_skip", { eventId, uid });
        return { success: true, processed: false, reason: "idempotent_skip" };
      }

      // B. Load User Profile
      const profileRef = adminDb.collection("gamification_profiles").doc(uid);
      const profileSnap = await transaction.get(profileRef);

      const profileData = profileSnap.exists ? profileSnap.data() : {};
      const profile = {
        totalXp: profileData?.totalXp || 0,
        level: profileData?.level || 1,
        currentStreak: profileData?.currentStreak || 0,
        longestStreak: profileData?.longestStreak || 0,
        lastActivityDate: profileData?.lastActivityDate || null,
        badges: profileData?.badges || [],
      };

      // C. Validation & Calculation
      let xpDelta = 0;
      let streakUpdate: any = {};
      const newBadges: string[] = [];

      switch (data.actionType) {
        case "daily_login":
          const streakStatus = verifyStreakStatus(profile.lastActivityDate); // Lib handles Timestamp
          if (streakStatus === "increment") {
            xpDelta = XP_VALUES.DAILY_LOGIN || 10;
            const next = profile.currentStreak + 1;
            streakUpdate = {
              currentStreak: next,
              longestStreak: Math.max(next, profile.longestStreak),
            };
            if (next === 7) newBadges.push("dedicated_learner_week");
            if (next === 30) newBadges.push("dedicated_learner_month");
          } else if (streakStatus === "reset") {
            xpDelta = XP_VALUES.DAILY_LOGIN || 5;
            streakUpdate = { currentStreak: 1 };
          } else {
            // "maintain": already logged in today, but maybe no XP awarded previously?
            // With idempotency key based on Date, we shouldn't reach here if we rely on eventId.
            // But if logic differs, safe to just update timestamp.
            streakUpdate = { updatedAt: FieldValue.serverTimestamp() };
          }
          break;

        case "lesson_complete":
          if (!data.lessonId || !data.courseId) throw new Error("Missing IDs");
          xpDelta = XP_VALUES.LESSON_COMPLETED || 50;
          if (!profile.badges.includes("first_lesson"))
            newBadges.push("first_lesson");
          break;

        case "course_complete":
          if (!data.courseId) throw new Error("Missing Course ID");
          xpDelta = XP_VALUES.COURSE_COMPLETED || 500;
          if (!profile.badges.includes("first_course"))
            newBadges.push("first_course");
          break;

        case "quiz_pass":
          xpDelta = XP_VALUES.QUIZ_PASSED || 100;
          break;

        case "library_view":
          xpDelta = 5;
          const libraryViews = (profileData?.libraryViews || 0) + 1;
          streakUpdate = { libraryViews };
          if (
            libraryViews >= 20 &&
            !profile.badges.includes("library_patron")
          ) {
            newBadges.push("library_patron");
          }
          break;
      }

      // D. Apply Updates
      const newTotalXp = (profile.totalXp || 0) + xpDelta;
      const newLevel = calculateLevel(newTotalXp);
      const leveledUp = newLevel > profile.level;

      const allUniqueBadges = Array.from(
        new Set([...profile.badges, ...newBadges]),
      );

      // E. Write to Ledger (Audit Trail)
      transaction.set(eventRef, {
        uid,
        actionType: data.actionType,
        eventId,
        xpAwarded: xpDelta,
        badgesEarned: newBadges,
        metadata: data.metadata || {},
        timestamp: FieldValue.serverTimestamp(),
        ip: "server-action",
      });

      // F. Update User Profile
      transaction.set(
        profileRef,
        {
          ...streakUpdate,
          totalXp: newTotalXp,
          level: newLevel,
          badges: allUniqueBadges,
          lastActivityDate: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      // G. Legacy Transaction Log (Optional, for backward compat if needed)
      // Keeping it purely for admin logs if dashboard relies on it
      if (xpDelta > 0) {
        const legacyRef = adminDb.collection("xp_transactions").doc();
        transaction.set(legacyRef, {
          userId: uid,
          amount: xpDelta,
          reason: data.actionType,
          eventId, // Link to idempotent event
          timestamp: FieldValue.serverTimestamp(),
        });
      }

      return {
        success: true,
        processed: true,
        xpAwarded: xpDelta,
        newLevel,
        leveledUp,
        newBadges,
      };
    });
  } catch (error) {
    telemetry.error(error, { actionType: data.actionType });
    return { error: "Could not process gamification event." };
  }
}
