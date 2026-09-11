import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { FieldDynamic, RelationalMovementType } from "../types";

interface RelationalFieldCanvasProps {
  fieldDynamic?: FieldDynamic;
  selectedMovementType?: RelationalMovementType | null;
  interactiveDistance?: number;
  onDistanceChange?: (dist: number) => void;
  interactiveMode?: boolean;
}

export const RelationalFieldCanvas: React.FC<RelationalFieldCanvasProps> = ({
  fieldDynamic,
  selectedMovementType,
  interactiveDistance,
  onDistanceChange,
  interactiveMode = false,
}) => {
  // Determine separation distance
  const currentDistance =
    interactiveDistance !== undefined
      ? interactiveDistance
      : (fieldDynamic?.separationDistance ?? 110);

  // Normalized distance: 20 (touching/fusion) to 220 (distant retreat)
  const halfGap = Math.max(12, currentDistance / 2);
  const boundaryState = fieldDynamic?.boundaryState ?? "clear";
  const tension = fieldDynamic?.tensionLevel ?? "low";

  // Dynamic visual parameters based on boundary state
  const isConfluent = boundaryState === "confluent" || currentDistance < 50;
  const isWithdrawn = boundaryState === "withdrawn" || currentDistance > 170;
  const isRigid = boundaryState === "rigid";
  const isClear = boundaryState === "clear";

  // Shapes colors: organic earth/mineral palette
  const selfColor = isRigid ? "#96705B" : isConfluent ? "#BD7B5C" : "#A0785D"; // Terracotta clay

  const otherColor = isRigid ? "#5B6E67" : isConfluent ? "#4E7F72" : "#5C766F"; // Sage mineral

  return (
    <div
      id="relational-field-container"
      className="relative w-full rounded-2xl bg-gradient-to-b from-[#FAF8F5] via-[#F4F1EA] to-[#ECE7DD] border border-[#E3DDD1] p-5 sm:p-7 shadow-xs overflow-hidden"
    >
      {/* Subtle background ambient contour lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="field-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#C9BEAC" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#C9BEAC" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#field-glow)" />
          <ellipse
            cx="50%"
            cy="50%"
            rx="180"
            ry="90"
            fill="none"
            stroke="#C9BEAC"
            strokeWidth="0.8"
            strokeDasharray="3 4"
          />
          <ellipse
            cx="50%"
            cy="50%"
            rx="280"
            ry="140"
            fill="none"
            stroke="#C9BEAC"
            strokeWidth="0.6"
            strokeDasharray="4 6"
          />
        </svg>
      </div>

      {/* Top Header: Relational State Status */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#E4DDD1]">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
              isConfluent
                ? "bg-[#BD7B5C] ring-4 ring-[#BD7B5C]/20"
                : isWithdrawn
                  ? "bg-[#5B6E67] ring-4 ring-[#5B6E67]/20"
                  : "bg-[#688176] ring-4 ring-[#688176]/20"
            }`}
          />
          <span className="text-xs font-semibold tracking-wider uppercase text-[#6B6357]">
            {fieldDynamic?.label || "Campo Relacional em Equilíbrio"}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#7A7164]">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EDE8DF] border border-[#DDD5C7]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8F8474]" />
            Tensão no Campo:{" "}
            <strong className="font-medium text-[#4D4539] capitalize">
              {tension === "low"
                ? "Baixa / Serena"
                : tension === "moderate"
                  ? "Moderada"
                  : "Alta / Retratil"}
            </strong>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EDE8DF] border border-[#DDD5C7]">
            Distância:{" "}
            <strong className="font-medium text-[#4D4539]">
              {Math.round(currentDistance)} unidades
            </strong>
          </span>
        </div>
      </div>

      {/* Main SVG Field Canvas */}
      <div className="relative w-full h-64 sm:h-72 flex items-center justify-center">
        <svg
          viewBox="0 0 600 280"
          className="w-full h-full max-w-2xl select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradients for Organism A (Eu) */}
            <linearGradient id="grad-self" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C49B80" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#8C634B" stopOpacity="0.95" />
            </linearGradient>

            {/* Gradients for Organism B (Outro) */}
            <linearGradient id="grad-other" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7E9E94" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#4A655D" stopOpacity="0.95" />
            </linearGradient>

            {/* Filter for subtle biological organic blur */}
            <filter
              id="organic-softness"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" />
            </filter>
          </defs>

          {/* Central Contact Axis line */}
          <line
            x1="80"
            y1="140"
            x2="520"
            y2="140"
            stroke="#D6CDBD"
            strokeWidth="1"
            strokeDasharray="2 4"
            opacity="0.6"
          />

          {/* Interpenetration zone when close (Confluence indicator) */}
          {isConfluent && (
            <motion.ellipse
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.45, scale: 1 }}
              transition={{ duration: 0.6 }}
              cx="300"
              cy="140"
              rx={Math.max(10, 60 - halfGap)}
              ry="45"
              fill="#A98871"
              opacity="0.3"
              filter="url(#organic-softness)"
            />
          )}

          {/* Field A: O Eu (Left organic shape) */}
          <motion.g
            animate={{
              x: 300 - halfGap - 60,
              scale: isConfluent ? [1, 1.03, 1] : isWithdrawn ? 0.92 : 1,
            }}
            transition={{
              x: { type: "spring", stiffness: 85, damping: 18 },
              scale: { repeat: Infinity, duration: 4.5, ease: "easeInOut" },
            }}
          >
            {/* Pulsing subtle aura */}
            <motion.path
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.15, 0.25, 0.15],
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              d="M -50 -10 C -50 -45, -20 -60, 10 -55 C 45 -50, 60 -20, 55 15 C 50 50, 15 60, -20 50 C -50 40, -50 15, -50 -10 Z"
              fill={selfColor}
            />

            {/* Primary organic shape */}
            <motion.path
              d={
                isRigid
                  ? "M -45 -15 C -45 -45, -15 -50, 15 -45 C 45 -40, 50 -10, 45 20 C 40 45, 10 50, -20 45 C -45 40, -45 10, -45 -15 Z"
                  : "M -48 -8 C -48 -40, -18 -54, 14 -48 C 42 -42, 54 -15, 48 18 C 42 46, 12 54, -18 46 C -44 38, -48 16, -48 -8 Z"
              }
              fill="url(#grad-self)"
              stroke={isRigid ? "#6E4933" : isClear ? "#EADBCF" : "#8A5E44"}
              strokeWidth={isRigid ? "2.5" : "1.5"}
              strokeDasharray={isConfluent ? "4 2" : "none"}
              className="transition-colors duration-700"
            />

            {/* Core nucleus */}
            <circle cx="0" cy="0" r="5" fill="#FAF6F0" opacity="0.8" />

            {/* Label */}
            <text
              x="0"
              y="72"
              textAnchor="middle"
              className="text-[11px] font-medium tracking-wide uppercase fill-[#6E5748]"
            >
              Campo do Eu
            </text>
          </motion.g>

          {/* Contact Boundary Zone (in the middle between both fields) */}
          <motion.g
            animate={{
              opacity: isWithdrawn ? 0.2 : 1,
            }}
            transition={{ duration: 0.5 }}
          >
            {/* Harmonic Boundary Line (Present when differentiated contact is achieved) */}
            {isClear && (
              <motion.g
                initial={{ opacity: 0, scaleY: 0.5 }}
                animate={{ opacity: 0.9, scaleY: 1 }}
                transition={{ duration: 0.5 }}
              >
                <line
                  x1="300"
                  y1="75"
                  x2="300"
                  y2="205"
                  stroke="#7A6D5D"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeDasharray="2 3"
                />
                <circle cx="300" cy="140" r="4" fill="#6E5D4B" />
                <text
                  x="300"
                  y="62"
                  textAnchor="middle"
                  className="text-[10px] font-semibold uppercase tracking-wider fill-[#736353]"
                >
                  Fronteira Viva
                </text>
              </motion.g>
            )}

            {/* Confluent / Fusion warning line */}
            {isConfluent && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <text
                  x="300"
                  y="70"
                  textAnchor="middle"
                  className="text-[10px] font-semibold uppercase tracking-wider fill-[#995535]"
                >
                  Confluência / Perda de Limite
                </text>
              </motion.g>
            )}

            {/* Distant / Retracted space indicator */}
            {isWithdrawn && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <line
                  x1={300 - halfGap + 20}
                  y1="140"
                  x2={300 + halfGap - 20}
                  y2="140"
                  stroke="#A89F91"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />
                <text
                  x="300"
                  y="125"
                  textAnchor="middle"
                  className="text-[10px] font-semibold uppercase tracking-wider fill-[#807669]"
                >
                  Vácuo / Afastamento
                </text>
              </motion.g>
            )}
          </motion.g>

          {/* Field B: O Outro (Right organic shape) */}
          <motion.g
            animate={{
              x: 300 + halfGap + 60,
              scale: isConfluent ? [1, 1.02, 1] : isWithdrawn ? 0.92 : 1,
            }}
            transition={{
              x: { type: "spring", stiffness: 85, damping: 18 },
              scale: {
                repeat: Infinity,
                duration: 4.8,
                ease: "easeInOut",
                delay: 0.5,
              },
            }}
          >
            {/* Pulsing subtle aura */}
            <motion.path
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.15, 0.25, 0.15],
              }}
              transition={{
                repeat: Infinity,
                duration: 4.2,
                ease: "easeInOut",
                delay: 0.8,
              }}
              d="M -15 -50 C 20 -50, 50 -20, 55 10 C 50 45, 20 60, -10 55 C -45 50, -60 20, -55 -15 C -50 -45, -30 -50, -15 -50 Z"
              fill={otherColor}
            />

            {/* Primary organic shape */}
            <motion.path
              d={
                isRigid
                  ? "M -15 -45 C 15 -45, 45 -15, 45 15 C 40 45, 10 50, -15 45 C -45 40, -50 10, -45 -20 C -40 -45, -30 -45, -15 -45 Z"
                  : "M -14 -48 C 18 -48, 48 -18, 48 14 C 42 42, 14 54, -14 48 C -42 42, -54 14, -48 -14 C -42 -42, -30 -48, -14 -48 Z"
              }
              fill="url(#grad-other)"
              stroke={isRigid ? "#3A4C46" : isClear ? "#DCE8E3" : "#4E6861"}
              strokeWidth={isRigid ? "2.5" : "1.5"}
              strokeDasharray={isConfluent ? "4 2" : "none"}
              className="transition-colors duration-700"
            />

            {/* Core nucleus */}
            <circle cx="0" cy="0" r="5" fill="#FAF6F0" opacity="0.8" />

            {/* Label */}
            <text
              x="0"
              y="72"
              textAnchor="middle"
              className="text-[11px] font-medium tracking-wide uppercase fill-[#465A54]"
            >
              Campo do Outro
            </text>
          </motion.g>
        </svg>
      </div>

      {/* Dynamic description of the visual phenomenon */}
      <div className="relative z-10 mt-3 pt-3 border-t border-[#E5DFD4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <p className="text-[#595247] leading-relaxed max-w-xl">
          <strong className="font-semibold text-[#3D362C]">
            Morfologia Relacional:{" "}
          </strong>
          {fieldDynamic?.organicDescription ||
            "Formas orgânicas que representam a respiração de contato entre dois organismos. Ao escolher uma resposta, a distância física e a membrana de fronteira se reorganizam."}
        </p>

        {/* Interactive exploration slider */}
        {interactiveMode && onDistanceChange && (
          <div className="flex items-center gap-2 bg-[#EDE8DE] px-3 py-1.5 rounded-lg border border-[#DDD5C7] w-full sm:w-auto shrink-0">
            <span className="text-[11px] text-[#6E6558] font-medium whitespace-nowrap">
              Distância manual:
            </span>
            <input
              type="range"
              min="20"
              max="220"
              value={Math.round(currentDistance)}
              onChange={(e) => onDistanceChange(Number(e.target.value))}
              className="w-24 sm:w-28 accent-[#7E6A55] cursor-pointer"
            />
            <span className="text-[11px] font-mono font-medium text-[#4D4539] w-7 text-right">
              {Math.round(currentDistance)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
