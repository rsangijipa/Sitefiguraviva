"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { gamificationService } from "@/services/gamificationService";
import BadgeDisplay from "./BadgeDisplay";
import { Loader2, Trophy, Flame } from "lucide-react";
import { UserGamificationProfile } from "@/types/gamification";
import { motion } from "framer-motion";

export default function GamificationProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserGamificationProfile | null>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;

      const [profileData, badgesData] = await Promise.all([
        gamificationService.getProfile(user.uid),
        gamificationService.getBadges(user.uid),
      ]);

      setProfile(profileData);
      setBadges(badgesData);
      setLoading(false);
    }
    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-gold" size={32} />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="bg-white rounded-2xl p-6 shadow-soft-md border border-stone-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-white shadow-lg">
            <Trophy size={32} />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">
              Nível {profile.level}
            </h3>
            <div className="text-3xl font-serif font-bold text-primary">
              {profile.totalXp} XP
            </div>
          </div>
        </div>

        <div className="h-12 w-px bg-stone-200 hidden md:block" />

        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${profile.currentStreak > 0 ? "bg-orange-100 text-orange-500" : "bg-stone-100 text-stone-400"}`}
          >
            <Flame
              size={24}
              fill={profile.currentStreak > 0 ? "currentColor" : "none"}
            />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Ofensiva
            </h3>
            <div className="text-xl font-bold text-stone-700">
              {profile.currentStreak} dias
            </div>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div>
        <h3 className="text-xl font-serif font-bold text-primary mb-6 flex items-center gap-2">
          Minhas Conquistas
          <span className="text-sm font-sans font-normal text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
            {profile.badges.length} / {badges.length}
          </span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {badges.map((badge) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <BadgeDisplay
                type={badge.type}
                title={badge.title}
                description={badge.description}
                isLocked={badge.isLocked}
                size="md"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
