"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface ActivityChartProps {
  data: { date: string; xp: number }[];
}

export default function ActivityChart({ data }: ActivityChartProps) {
  const maxXP = useMemo(() => Math.max(...data.map((d) => d.xp), 100), [data]);

  return (
    <div className="bg-white rounded-xl border border-stone-100 p-6 shadow-soft-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-stone-800 flex items-center gap-2">
          Atividade Semanal{" "}
          <span className="text-xs font-normal text-stone-400 bg-stone-50 px-2 py-0.5 rounded-full">
            XP
          </span>
        </h3>
      </div>

      <div className="flex items-end justify-between gap-2 h-40">
        {data.map((day, index) => {
          const heightPercent = (day.xp / maxXP) * 100;
          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="relative w-full flex justify-center h-full items-end">
                {/* Tooltip */}
                <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-800 text-white text-[10px] px-2 py-1 rounded mb-1 pointer-events-none whitespace-nowrap z-10">
                  {day.xp} XP
                </div>

                {/* Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPercent}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`w-full max-w-[24px] rounded-t-lg transition-colors ${
                    day.xp > 0
                      ? "bg-primary/20 group-hover:bg-primary"
                      : "bg-stone-50"
                  }`}
                />
              </div>
              <span
                className={`text-[10px] font-bold uppercase ${
                  index === data.length - 1 ? "text-primary" : "text-stone-400"
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
