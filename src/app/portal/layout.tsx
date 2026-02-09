"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SWRegistration } from "@/components/portal/SWRegistration";
import { OfflineIndicator } from "@/components/portal/OfflineIndicator";
import { DashboardShell } from "@/components/portal/shell/DashboardShell";
import { gamificationService } from "@/services/gamificationService";
import { useGamificationFeedback } from "@/context/GamificationContext";
import { XP_VALUES } from "@/lib/gamification";
import GamificationTrigger from "@/components/gamification/GamificationTrigger";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showXpGain, showLevelUp } = useGamificationFeedback();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.uid) {
      gamificationService.updateStreak(user.uid).then((result) => {
        if (result?.xpResult) {
          showXpGain(XP_VALUES.DAILY_LOGIN);
          if (result.xpResult.leveledUp) {
            showLevelUp(result.xpResult.newLevel);
          }
        }
      });
    }
  }, [user?.uid, showXpGain, showLevelUp]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCF9]">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardShell>
      <SWRegistration />
      <OfflineIndicator />
      {children}
    </DashboardShell>
  );
}
