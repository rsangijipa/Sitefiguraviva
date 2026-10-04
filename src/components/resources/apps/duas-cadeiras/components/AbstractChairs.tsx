import React from "react";
import { motion } from "motion/react";
import { ChairConfig, ChairId } from "../types";

interface AbstractChairsProps {
  activeChair: ChairId;
  onSelectChair: (chair: ChairId) => void;
  chairA: ChairConfig;
  chairB: ChairConfig;
  disabled?: boolean;
}

export const AbstractChairs: React.FC<AbstractChairsProps> = ({
  activeChair,
  onSelectChair,
  chairA,
  chairB,
  disabled = false,
}) => {
  const isA = activeChair === "A";

  return (
    <div className="relative w-full max-w-2xl mx-auto py-3 px-4 select-none">
      {/* Visual stage / ambient background */}
      <div className="relative flex items-center justify-between min-h-[190px] sm:min-h-[220px]">
        {/* Subtle ground plane / connection line */}
        <div className="absolute inset-x-8 bottom-6 h-px bg-stone-300/70" />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-5 w-2 h-2 rounded-full bg-stone-300" />

        {/* Spatial Spotlight Focus Indicator */}
        <motion.div
          className="absolute -bottom-2 w-48 sm:w-56 h-12 rounded-full pointer-events-none blur-xl bg-amber-500/10"
          animate={{
            left: isA ? "12%" : "60%",
            opacity: 1,
          }}
          transition={{
            type: "spring",
            stiffness: 140,
            damping: 22,
          }}
        />

        {/* CHAIR A (Facing Right) */}
        <motion.button
          type="button"
          id="chair-perspective-a"
          disabled={disabled}
          onClick={() => onSelectChair("A")}
          className={`group relative flex-1 flex flex-col items-center cursor-pointer transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 rounded-xl p-2 ${
            isA ? "opacity-100" : "opacity-45 hover:opacity-75"
          }`}
          animate={{
            scale: isA ? 1.05 : 0.94,
            y: isA ? -4 : 4,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
          aria-label={`Selecionar perspectiva da Cadeira A: ${chairA.name}`}
          aria-pressed={isA}
        >
          {/* Active status pill */}
          <div className="h-6 flex items-center mb-1">
            <span
              className={`text-xs font-medium tracking-wide uppercase px-2.5 py-0.5 rounded-full transition-colors ${
                isA
                  ? "bg-stone-900 text-stone-100 shadow-sm"
                  : "bg-stone-200/80 text-stone-500"
              }`}
            >
              {isA ? "Voz Ativa" : "Em Escuta"}
            </span>
          </div>

          {/* Minimalist Abstract Vector Chair A */}
          <div className="relative w-28 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full stroke-current transition-colors duration-300"
              fill="none"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Abstract Bauhaus Chair Silhouette facing right */}
              {/* Backrest: upright vertical minimal spine */}
              <line
                x1="34"
                y1="22"
                x2="34"
                y2="58"
                className={isA ? "stroke-stone-900" : "stroke-stone-400"}
              />
              <line
                x1="30"
                y1="25"
                x2="30"
                y2="52"
                strokeWidth="1.8"
                className={isA ? "stroke-amber-700/80" : "stroke-stone-300"}
              />
              {/* Seat: horizontal cantilever plane extending right */}
              <line
                x1="30"
                y1="58"
                x2="72"
                y2="58"
                strokeWidth="2.8"
                className={isA ? "stroke-stone-900" : "stroke-stone-400"}
              />
              {/* Front leg */}
              <line
                x1="66"
                y1="58"
                x2="66"
                y2="88"
                className={isA ? "stroke-stone-800" : "stroke-stone-400"}
              />
              {/* Back leg angled */}
              <line
                x1="34"
                y1="58"
                x2="28"
                y2="88"
                className={isA ? "stroke-stone-800" : "stroke-stone-400"}
              />
              {/* Slender ground shadow line */}
              <ellipse
                cx="48"
                cy="89"
                rx="24"
                ry="3"
                className={isA ? "fill-stone-300/60" : "fill-stone-200/40"}
                stroke="none"
              />
            </svg>

            {/* Subtle glow / presence dot */}
            {isA && (
              <motion.div
                layoutId="chair-active-dot"
                className="absolute top-8 left-6 w-2 h-2 rounded-full bg-amber-600"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </div>

          {/* Perspective Label */}
          <div className="text-center mt-1 w-full max-w-[170px]">
            <p className="text-xs tracking-wider uppercase text-stone-500 font-semibold">
              Cadeira A
            </p>
            <p className="text-sm font-semibold text-stone-900 truncate">
              {chairA.name || "Perspectiva A"}
            </p>
            {chairA.sublabel && (
              <p className="text-xs text-stone-500 truncate mt-0.5">
                {chairA.sublabel}
              </p>
            )}
          </div>
        </motion.button>

        {/* Center Tension / Exchange Axis Indicator */}
        <div className="flex flex-col items-center justify-center px-2 z-10">
          <div className="flex items-center space-x-1.5 py-1 px-3 rounded-full bg-stone-100 border border-stone-200 text-stone-500 text-xs shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
            <span className="font-mono text-[11px]">Diálogo</span>
          </div>
        </div>

        {/* CHAIR B (Facing Left) */}
        <motion.button
          type="button"
          id="chair-perspective-b"
          disabled={disabled}
          onClick={() => onSelectChair("B")}
          className={`group relative flex-1 flex flex-col items-center cursor-pointer transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 rounded-xl p-2 ${
            !isA ? "opacity-100" : "opacity-45 hover:opacity-75"
          }`}
          animate={{
            scale: !isA ? 1.05 : 0.94,
            y: !isA ? -4 : 4,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
          aria-label={`Selecionar perspectiva da Cadeira B: ${chairB.name}`}
          aria-pressed={!isA}
        >
          {/* Active status pill */}
          <div className="h-6 flex items-center mb-1">
            <span
              className={`text-xs font-medium tracking-wide uppercase px-2.5 py-0.5 rounded-full transition-colors ${
                !isA
                  ? "bg-stone-900 text-stone-100 shadow-sm"
                  : "bg-stone-200/80 text-stone-500"
              }`}
            >
              {!isA ? "Voz Ativa" : "Em Escuta"}
            </span>
          </div>

          {/* Minimalist Abstract Vector Chair B (Mirrored, facing left) */}
          <div className="relative w-28 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full stroke-current transition-colors duration-300"
              fill="none"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Abstract Bauhaus Chair Silhouette facing left */}
              {/* Backrest: upright vertical minimal spine */}
              <line
                x1="66"
                y1="22"
                x2="66"
                y2="58"
                className={!isA ? "stroke-stone-900" : "stroke-stone-400"}
              />
              <line
                x1="70"
                y1="25"
                x2="70"
                y2="52"
                strokeWidth="1.8"
                className={!isA ? "stroke-amber-700/80" : "stroke-stone-300"}
              />
              {/* Seat: horizontal cantilever plane extending left */}
              <line
                x1="70"
                y1="58"
                x2="28"
                y2="58"
                strokeWidth="2.8"
                className={!isA ? "stroke-stone-900" : "stroke-stone-400"}
              />
              {/* Front leg */}
              <line
                x1="34"
                y1="58"
                x2="34"
                y2="88"
                className={!isA ? "stroke-stone-800" : "stroke-stone-400"}
              />
              {/* Back leg angled */}
              <line
                x1="66"
                y1="58"
                x2="72"
                y2="88"
                className={!isA ? "stroke-stone-800" : "stroke-stone-400"}
              />
              {/* Slender ground shadow line */}
              <ellipse
                cx="52"
                cy="89"
                rx="24"
                ry="3"
                className={!isA ? "fill-stone-300/60" : "fill-stone-200/40"}
                stroke="none"
              />
            </svg>

            {/* Subtle glow / presence dot */}
            {!isA && (
              <motion.div
                layoutId="chair-active-dot"
                className="absolute top-8 right-6 w-2 h-2 rounded-full bg-amber-600"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </div>

          {/* Perspective Label */}
          <div className="text-center mt-1 w-full max-w-[170px]">
            <p className="text-xs tracking-wider uppercase text-stone-500 font-semibold">
              Cadeira B
            </p>
            <p className="text-sm font-semibold text-stone-900 truncate">
              {chairB.name || "Perspectiva B"}
            </p>
            {chairB.sublabel && (
              <p className="text-xs text-stone-500 truncate mt-0.5">
                {chairB.sublabel}
              </p>
            )}
          </div>
        </motion.button>
      </div>
    </div>
  );
};
