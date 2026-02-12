"use client";

import { useAuth } from "@/context/AuthContext";
import { DashboardShell } from "@/components/portal/shell/DashboardShell";
import { SWRegistration } from "@/components/portal/SWRegistration";
import { OfflineIndicator } from "@/components/portal/OfflineIndicator";
import { PWAInstallBanner } from "@/components/portal/PWAInstallBanner";
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
      <SWRegistration />
      <OfflineIndicator />
      <PWAInstallBanner />
      {children}
    </DashboardShell>
  );
}
