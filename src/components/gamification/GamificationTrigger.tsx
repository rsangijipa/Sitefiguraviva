"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { gamificationService } from "@/services/gamificationService";
import { useToast } from "@/context/ToastContext";

export default function GamificationTrigger() {
  const { user } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    async function checkBadges() {
      if (!user) return;

      const profile = await gamificationService.getProfile(user.uid);
      if (!profile) return;

      const earnedBadges = profile.badges || [];

      // BADGE: PIONEER (Primeiro Login - Simulado para todos por enquanto)
      if (!earnedBadges.includes("pioneer_student")) {
        // Lógica real: verificar data de criação da conta < X
        // Por enquanto, vamos dar para todos que entrarem como incentivo inicial
        await gamificationService.awardBadge(user.uid, "pioneer_student");
        addToast("Nova Conquista: Pioneiro! Bem-vindo à jornada.", "success");
      }

      // BADGE: DEDICATED (Streak > 7)
      if (
        !earnedBadges.includes("dedicated_learner") &&
        profile.currentStreak >= 7
      ) {
        await gamificationService.awardBadge(user.uid, "dedicated_learner");
        addToast(
          "Nova Conquista: Dedicado! 7 dias seguidos de estudo.",
          "success",
        );
      }
    }

    checkBadges();
  }, [user, addToast]);

  return null; // Componente lógico, sem renderização
}
