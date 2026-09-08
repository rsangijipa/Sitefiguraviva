"use client";

import { useAuth } from "@/context/AuthContext";
import { DashboardShell } from "@/components/portal/shell/DashboardShell";
import { OfflineIndicator } from "@/components/portal/OfflineIndicator";
import { OnboardingModal } from "@/components/portal/OnboardingModal";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useEffect } from "react";
import { gamificationService } from "@/services/gamificationService";
import { useGamificationFeedback } from "@/context/GamificationContext";

export function PortalClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const { showXpGain, showLevelUp, showBadgeEarned } =
    useGamificationFeedback();

  useEffect(() => {
    if (user?.uid) {
      gamificationService.updateStreak(user.uid).then((result) => {
        if (result?.xpResult) {
          if (result.xpResult.xpAwarded > 0) {
            showXpGain(result.xpResult.xpAwarded);
          }
          if (result.xpResult.leveledUp) {
            showLevelUp(result.xpResult.newLevel);
          }
          if (result.xpResult.newBadges?.length) {
            import("@/lib/gamification").then(({ BADGE_DEFINITIONS }) => {
              result.xpResult.newBadges.forEach((badgeId: string) => {
                const badge = BADGE_DEFINITIONS.find((b) => b.id === badgeId);
                if (badge) {
                  showBadgeEarned({
                    id: badge.id,
                    title: badge.title,
                    description: badge.description,
                  });
                }
              });
            });
          }
        }
      });
    }
  }, [user?.uid, showXpGain, showLevelUp, showBadgeEarned]);

  return (
    <DashboardShell>
      <OfflineIndicator />
      <div className="px-4 py-2 md:px-8 md:py-4 pb-0 max-w-7xl mx-auto w-full">
        <Breadcrumbs />
      </div>
      <OnboardingModal />
      {children}
    </DashboardShell>
  );
}
