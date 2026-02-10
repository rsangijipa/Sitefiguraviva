"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface ActivityChartProps {
  data: { date: string; xp: number }[];
}

export default function ActivityChart({ data }: ActivityChartProps) {
  const maxXP = useMemo(() => Math.max(...data.map((d) => d.xp), 100), [data]);

  return (
    <div className="bg-white rounded-xl border border-stone-100 p-6 shadow-soft-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-agedGold/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="font-bold text-ink flex items-center gap-2 text-sm uppercase tracking-wider font-serif">
          Atividade Semanal{" "}
          <span className="text-[10px] font-bold text-agedGold bg-agedGold/10 px-2 py-0.5 rounded-sm tracking-widest">
            XP
          </span>
        </h3>
      </div>

      <div className="flex items-end justify-between gap-2 h-40 relative z-10">
        {data.map((day, index) => {
          const heightPercent = (day.xp / maxXP) * 100;
          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center gap-3 group cursor-pointer"
            >
              <div className="relative w-full flex justify-center h-full items-end">
                {/* Premium Tooltip */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 bg-white border border-agedGold/30 text-ink text-[10px] font-bold px-3 py-1.5 rounded-sm shadow-xl pointer-events-none whitespace-nowrap z-20 font-serif italic">
                  {day.xp} XP
                </div>

                {/* Bar with motion-safe animation */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPercent}%` }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.05,
                    ease: "easeOut",
                  }}
                  className={`w-full max-w-[20px] rounded-t-sm transition-all duration-500 shadow-sm motion-safe:block ${
                    day.xp > 0
                      ? "bg-agedGold/20 group-hover:bg-agedGold shadow-[0_0_15px_rgba(197,160,91,0.1)] group-hover:shadow-[0_0_20px_rgba(197,160,91,0.3)]"
                      : "bg-stone-50"
                  }`}
                />
              </div>
              <span
                className={`text-[9px] font-bold uppercase tracking-tighter transition-colors ${
                  index === data.length - 1 ? "text-agedGold" : "text-stone-300"
                }`}
              >
                {day.date}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
