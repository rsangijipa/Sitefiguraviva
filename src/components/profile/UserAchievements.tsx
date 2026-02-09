"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { gamificationService } from "@/services/gamificationService";
import { UserGamificationProfile } from "@/types/gamification";
import { BADGE_DEFINITIONS } from "@/lib/gamification";
import {
  Award,
  Lock,
  Star,
  Trophy,
  Footprints,
  Flame,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, any> = {
  Footprints,
  Flame,
  GraduationCap,
  Award,
  Trophy,
  Star,
};

export function UserAchievements() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserGamificationProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      gamificationService.getProfile(user.uid).then((p) => {
        setProfile(p);
        setLoading(false);
      });
    }
  }, [user?.uid]);

  if (loading)
    return <div className="animate-pulse h-48 bg-stone-50 rounded-2xl" />;

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-stone-100 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-serif font-bold text-stone-800 flex items-center gap-2">
          <Trophy size={20} className="text-gold" />
          Conquistas & Nível
        </h2>
        <div className="text-right">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none mb-1">
            Total acumulado
          </p>
          <p className="text-xl font-bold text-primary">
            {profile?.totalXp || 0} XP
          </p>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {BADGE_DEFINITIONS.map((def) => {
          const isEarned = profile?.badges.includes(def.id);
          const Icon = ICON_MAP[def.icon] || Award;

          return (
            <div
              key={def.id}
              className={cn(
                "flex flex-col items-center p-4 rounded-xl border transition-all text-center group",
                isEarned
                  ? "bg-white border-stone-100 shadow-sm hover:shadow-md"
                  : "bg-stone-50/50 border-stone-100 opacity-60 grayscale",
              )}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110",
                  isEarned
                    ? "bg-gold/10 text-gold"
                    : "bg-stone-200 text-stone-400",
                )}
              >
                {isEarned ? <Icon size={24} /> : <Lock size={20} />}
              </div>
              <p className="text-xs font-bold text-stone-800 mb-1">
                {def.title}
              </p>
              <p className="text-[10px] text-stone-400 leading-tight">
                {def.description}
              </p>

              {isEarned && (
                <div className="mt-2 text-[8px] font-bold text-gold uppercase tracking-tighter">
                  Conquistado
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!profile?.badges.length && !loading && (
        <div className="bg-stone-50 rounded-xl p-6 text-center border border-dashed border-stone-200">
          <Star size={32} className="text-stone-300 mx-auto mb-2" />
          <p className="text-sm text-stone-500">
            Continue estudando para desbloquear sua primeira conquista!
          </p>
        </div>
      )}
    </div>
  );
}
