"use client";

import { gamificationService } from "@/services/gamificationService";

/**
 * Hook for gamification utilities.
 * Note: Badge awarding is now server-side only via processGamificationEvent action.
 */
export function useGamification() {
  return {
    getProfile: gamificationService.getProfile,
    getBadges: gamificationService.getBadges,
    updateStreak: gamificationService.updateStreak,
    onCourseCompletion: gamificationService.onCourseCompletion,
    onLessonCompletion: gamificationService.onLessonCompletion,
  };
}
