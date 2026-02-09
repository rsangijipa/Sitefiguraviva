"use client";

import { useAuth } from "@/context/AuthContext";
import { gamificationService } from "@/services/gamificationService";
import { useToast } from "@/context/ToastContext";
import { useEffect } from "react";

export function useGamification() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const checkAndAwardBadge = async (badgeId: string, condition: boolean) => {
    if (!user || !condition) return;

    // Check if user already has badge (optimization to avoid unnecessary writes)
    // Ideally this check happens on server/service, but client-side check saves a call
    const profile = await gamificationService.getProfile(user.uid);
    if (profile?.badges?.includes(badgeId)) return;

    await gamificationService.awardBadge(user.uid, badgeId);

    // Notify User
    addToast(`Nova Conquista Desbloqueada!`, "success");
  };

  return {
    awardBadge: gamificationService.awardBadge,
    checkAndAwardBadge,
  };
}
