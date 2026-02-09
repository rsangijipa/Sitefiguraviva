"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Star, Trophy, Flame } from "lucide-react";

interface GamificationFeedback {
  type: "xp" | "level_up" | "badge";
  amount?: number;
  title?: string;
  id: string;
}

interface GamificationContextType {
  showXpGain: (amount: number) => void;
  showLevelUp: (level: number) => void;
  showBadgeEarned: (title: string) => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(
  undefined,
);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [feedbacks, setFeedbacks] = useState<GamificationFeedback[]>([]);

  const addFeedback = useCallback(
    (feedback: Omit<GamificationFeedback, "id">) => {
      const id = Math.random().toString(36).substring(7);
      setFeedbacks((prev) => [...prev, { ...feedback, id }]);
      setTimeout(() => {
        setFeedbacks((prev) => prev.filter((f) => f.id !== id));
      }, 4000);
    },
    [],
  );

  const showXpGain = (amount: number) => addFeedback({ type: "xp", amount });
  const showLevelUp = (level: number) =>
    addFeedback({ type: "level_up", title: `Nível ${level}` });
  const showBadgeEarned = (title: string) =>
    addFeedback({ type: "badge", title });

  return (
    <GamificationContext.Provider
      value={{ showXpGain, showLevelUp, showBadgeEarned }}
    >
      {children}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {feedbacks.map((f) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              className="bg-white border border-stone-100 shadow-xl rounded-2xl px-4 py-3 flex items-center gap-3 min-w-[200px]"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  f.type === "xp"
                    ? "bg-gold/10 text-gold"
                    : f.type === "level_up"
                      ? "bg-primary/10 text-primary"
                      : "bg-orange-100 text-orange-600"
                }`}
              >
                {f.type === "xp" && <Star size={20} className="fill-current" />}
                {f.type === "level_up" && <Trophy size={20} />}
                {f.type === "badge" && (
                  <Flame size={20} className="fill-current" />
                )}
              </div>
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none mb-1">
                  {f.type === "xp"
                    ? "XP Recebido"
                    : f.type === "level_up"
                      ? "Novo Nível!"
                      : "Conquista!"}
                </p>
                <p className="text-sm font-bold text-stone-800">
                  {f.type === "xp" ? `+${f.amount} XP` : f.title}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </GamificationContext.Provider>
  );
};

export const useGamificationFeedback = () => {
  const context = useContext(GamificationContext);
  if (!context)
    throw new Error(
      "useGamificationFeedback must be used within GamificationProvider",
    );
  return context;
};
