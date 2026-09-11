"use client";

import { useQuery } from "@tanstack/react-query";
import { listProfiles } from "@/features/gamification/infrastructure/supabaseGamificationRepository.server";

export const useAllGamificationProfiles = () => {
  return useQuery({
    queryKey: ["admin_gamification_profiles"],
    queryFn: async () => {
      const profiles = await listProfiles();
      return profiles.map((profile) => ({
        uid: profile.userId,
        totalXp: profile.totalXp,
        level: profile.level,
        currentStreak: profile.currentStreak,
        longestStreak: profile.longestStreak,
        lastActivityDate: profile.lastActivityDate,
        badges: profile.badges,
      }));
    },
  });
};
