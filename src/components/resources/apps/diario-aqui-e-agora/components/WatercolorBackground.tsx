import { motion } from "motion/react";
import React from "react";
import { QuestionConfig } from "../types";

interface WatercolorBackgroundProps {
  currentQuestion?: QuestionConfig;
  isCompletion?: boolean;
  intensity?: "subtle" | "soft" | "minimal";
}

export const WatercolorBackground: React.FC<WatercolorBackgroundProps> = ({
  currentQuestion,
  isCompletion,
  intensity = "subtle",
}) => {
  // Color palette shifts per question step
  const blobColor1 =
    currentQuestion?.themeColor.blobColor1 ?? "rgba(195, 208, 205, 0.40)";
  const blobColor2 =
    currentQuestion?.themeColor.blobColor2 ?? "rgba(230, 222, 212, 0.38)";
  const accentNode = currentQuestion?.themeColor.accentNode ?? "#738a9c";

  const opacityMultiplier =
    intensity === "minimal" ? 0.4 : intensity === "soft" ? 1 : 0.75;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* Base warm rice-paper subtle gradient */}
      <div className="absolute inset-0 bg-[#fbf9f5] opacity-95 transition-colors duration-1000" />

      {/* SVG filter for organic watercolor pigment bleeding */}
      <svg className="hidden">
        <defs>
          <filter id="watercolor-filter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.015"
              numOctaves="3"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="24"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Primary watercolor wash top-right */}
      <motion.div
        animate={{
          backgroundColor: blobColor1,
          scale: [1, 1.05, 0.98, 1],
          x: [0, 18, -12, 0],
          y: [0, -15, 10, 0],
        }}
        transition={{
          backgroundColor: { duration: 1.8, ease: "easeInOut" },
          scale: { duration: 22, repeat: Infinity, ease: "easeInOut" },
          x: { duration: 26, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 24, repeat: Infinity, ease: "easeInOut" },
        }}
        style={{
          opacity: opacityMultiplier * 0.85,
          filter: "url(#watercolor-filter) blur(60px)",
        }}
        className="absolute -top-24 -right-20 h-[480px] w-[540px] rounded-[48%_52%_62%_38%/42%_58%_42%_58%]"
      />

      {/* Secondary watercolor wash bottom-left */}
      <motion.div
        animate={{
          backgroundColor: blobColor2,
          scale: [1, 0.96, 1.06, 1],
          x: [0, -20, 15, 0],
          y: [0, 15, -10, 0],
        }}
        transition={{
          backgroundColor: { duration: 1.8, ease: "easeInOut" },
          scale: { duration: 25, repeat: Infinity, ease: "easeInOut" },
          x: { duration: 28, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 22, repeat: Infinity, ease: "easeInOut" },
        }}
        style={{
          opacity: opacityMultiplier * 0.75,
          filter: "url(#watercolor-filter) blur(70px)",
        }}
        className="absolute -bottom-32 -left-28 h-[520px] w-[560px] rounded-[58%_42%_36%_64%/52%_48%_52%_48%]"
      />

      {/* Center wash that gently pulsates with presence */}
      <motion.div
        animate={{
          scale: isCompletion ? 1.2 : [1, 1.08, 1],
          opacity: [
            0.35 * opacityMultiplier,
            0.55 * opacityMultiplier,
            0.35 * opacityMultiplier,
          ],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          backgroundColor: accentNode,
          filter: "blur(90px)",
        }}
        className="absolute top-1/2 left-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full"
      />

      {/* Tiny organic specks/circles floating calmly */}
      <div className="absolute top-[18%] left-[12%] h-1.5 w-1.5 rounded-full bg-[#8c827a]/20 blur-[0.5px]" />
      <div className="absolute top-[32%] right-[14%] h-2.5 w-2.5 rounded-full bg-[#7a8b84]/20 blur-[1px]" />
      <div className="absolute bottom-[24%] right-[22%] h-2 w-2 rounded-full bg-[#9e877a]/15 blur-[0.5px]" />
      <div className="absolute bottom-[38%] left-[16%] h-3 w-3 rounded-full bg-[#88909e]/15 blur-[1px]" />
    </div>
  );
};
