"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminGamificationProfiles } from "@/app/actions/gamification-read";
import { mapGamificationProfileToClient } from "@/services/gamificationService";

export const useAllGamificationProfiles = () => {
  return useQuery({
    queryKey: ["admin_gamification_profiles"],
    queryFn: async () => {
      return (await getAdminGamificationProfiles()).map(
        mapGamificationProfileToClient,
      );
    },
  });
};
