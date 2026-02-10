"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { gamificationService } from "@/services/gamificationService";
import { useToast } from "@/context/ToastContext";
import { LevelUpModal } from "./LevelUpModal";

export default function GamificationTrigger() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{
    badge?: { slug: string; name: string; description: string };
    xp?: number;
  }>({});

  useEffect(() => {
    async function checkBadges() {
      if (!user) return;

      const profile = await gamificationService.getProfile(user.uid);
      if (!profile) return;

      const earnedBadges = profile.badges || [];
      let newBadge = null;

      // BADGE: PIONEER (Primeiro Login - Early Adopters)
      if (!earnedBadges.includes("pioneer_student")) {
        // Lógica real: verificar data de criação da conta < 01/03/2026
        const creationTime = user.metadata.creationTime;
        const cutoffDate = new Date("2026-03-01T00:00:00Z"); // Data limite para ser "Pioneiro"

        if (creationTime && new Date(creationTime) < cutoffDate) {
          await gamificationService.awardBadge(user.uid, "pioneer_student");
          newBadge = {
            slug: "pioneer_student",
            name: "Pioneiro",
            description:
              "Bem-vindo à jornada! Você faz parte dos primeiros alunos.",
          };
        }
      }

      // BADGE: DEDICATED (Streak > 7)
      if (
        !earnedBadges.includes("dedicated_learner") &&
        profile.currentStreak >= 7
      ) {
        await gamificationService.awardBadge(user.uid, "dedicated_learner");
        newBadge = {
          slug: "dedicated_learner",
          name: "Dedicado",
          description: "Você estudou 7 dias seguidos. Continue assim!",
        };
      }

      if (newBadge) {
        setModalData({ badge: newBadge, xp: 50 }); // 50 XP fixo por badge por enquanto
        setModalOpen(true);
      }
    }

    checkBadges();
  }, [user]);

  return (
    <LevelUpModal
      isOpen={modalOpen}
      onClose={() => setModalOpen(false)}
      badge={modalData.badge}
      xpEarned={modalData.xp}
    />
  );
}
