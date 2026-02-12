"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { gamificationService } from "@/services/gamificationService";
import { Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export function UserXPBadge() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchProfile() {
      try {
        const data = await gamificationService.getProfile(user?.uid || "");
        setProfile(data);
      } catch (e) {
        console.error("XP Badge Error:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();

    // Poll for updates every 30 seconds if wanted, or just rely on manual refreshes
    // For now, just once is fine as most XP updates happen via GamificationTrigger which shows a modal
  }, [user]);

  if (!user || loading || !profile) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-3 px-3 py-1.5 bg-yellow-50/50 rounded-full border border-yellow-100/50 shadow-sm"
    >
      <div className="flex items-center gap-1">
        <TrendingUp size={14} className="text-yellow-600" />
        <span className="text-[10px] font-bold text-yellow-700 uppercase tracking-wider">
          Nível {profile.level || 1}
        </span>
      </div>

      <div className="h-4 w-px bg-yellow-200" />

      <div className="flex items-center gap-1.5">
        <Sparkles size={14} className="text-primary animate-pulse" />
        <span className="text-xs font-bold text-primary tabular-nums">
          {profile.totalXp || 0}{" "}
          <span className="text-[10px] opacity-60 ml-0.5">XP</span>
        </span>
      </div>

      {profile.currentStreak > 0 && (
        <>
          <div className="h-4 w-px bg-yellow-200" />
          <div className="flex items-center gap-1">
            <span className="text-xs">🔥</span>
            <span className="text-xs font-bold font-mono text-orange-600">
              {profile.currentStreak}d
            </span>
          </div>
        </>
      )}
    </motion.div>
  );
}
