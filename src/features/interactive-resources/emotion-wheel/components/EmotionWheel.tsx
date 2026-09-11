"use client";

import React from "react";
import { EmotionFamily, EmotionNuance, EmotionSelectionEntry } from "../types";

interface EmotionWheelProps {
  families: EmotionFamily[];
  selectedEntries: EmotionSelectionEntry[];
  activeFamilyId: string | null;
  onSelectFamily: (familyId: string) => void;
  onSelectNuance: (nuance: EmotionNuance, family: EmotionFamily) => void;
}

export const EmotionWheel: React.FC<EmotionWheelProps> = ({
  families,
  selectedEntries,
  activeFamilyId,
  onSelectFamily,
  onSelectNuance,
}) => {
  // SVG Wheel layout calculation (6 families distributed around 360 degrees)
  const size = 520;
  const center = size / 2;
  const radiusOuter = 230;
  const radiusInner = 110;
  const centerRadius = 85;

  const sliceAngle = 360 / families.length;

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[500px] h-auto drop-shadow-sm select-none"
        aria-label="Roda das Emoções interativa"
      >
        <defs>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Outer Ring / Sectors for Families & Nuances */}
        {families.map((family, index) => {
          const startAngle = index * sliceAngle - 90;
          const endAngle = (index + 1) * sliceAngle - 90;
          const isSelectedFamily = activeFamilyId === family.id;

          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;

          const x1 = center + radiusOuter * Math.cos(startRad);
          const y1 = center + radiusOuter * Math.sin(startRad);
          const x2 = center + radiusOuter * Math.cos(endRad);
          const y2 = center + radiusOuter * Math.sin(endRad);

          const ix1 = center + radiusInner * Math.cos(endRad);
          const iy1 = center + radiusInner * Math.sin(endRad);
          const ix2 = center + radiusInner * Math.cos(startRad);
          const iy2 = center + radiusInner * Math.sin(startRad);

          const largeArc = sliceAngle > 180 ? 1 : 0;
          const pathData = `M ${x1} ${y1} A ${radiusOuter} ${radiusOuter} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${radiusInner} ${radiusInner} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;

          // Mid angle for labels
          const midAngle = startAngle + sliceAngle / 2;
          const midRad = (midAngle * Math.PI) / 180;
          const labelRadius = (radiusOuter + radiusInner) / 2;
          const lx = center + labelRadius * Math.cos(midRad);
          const ly = center + labelRadius * Math.sin(midRad);

          return (
            <g key={family.id} className="cursor-pointer group">
              <path
                d={pathData}
                fill={isSelectedFamily ? "#F1E9DB" : "#FDFAF4"}
                stroke="#D8CFBE"
                strokeWidth={isSelectedFamily ? "3" : "1.5"}
                className="transition-all duration-200 hover:fill-[#F1E9DB]"
                onClick={() => onSelectFamily(family.id)}
                role="button"
                tabIndex={0}
                aria-label={`Família ${family.name}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onSelectFamily(family.id);
                  }
                }}
              />

              {/* Family Label */}
              <text
                x={lx}
                y={ly - 10}
                textAnchor="middle"
                dominantBaseline="central"
                className="font-serif text-[15px] font-bold fill-[#005A1F] pointer-events-none"
              >
                {family.name}
              </text>

              {/* Nuances mini pills or buttons inside sector */}
              {family.nuances.map((nuance, nIdx) => {
                const subAngle =
                  startAngle +
                  (sliceAngle / (family.nuances.length + 1)) * (nIdx + 1);
                const subRad = (subAngle * Math.PI) / 180;
                const sx = center + (labelRadius + 5) * Math.cos(subRad);
                const sy = center + (labelRadius + 5) * Math.sin(subRad);
                const isChosen = selectedEntries.some(
                  (e) => e.labelSnapshot === nuance.label,
                );

                return (
                  <g
                    key={nuance.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectNuance(nuance, family);
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Nuance ${nuance.label}`}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={sx}
                      cy={sy + 12}
                      r="16"
                      fill={isChosen ? "#005A1F" : "#FDFAF4"}
                      stroke="#07614C"
                      strokeWidth={isChosen ? "2" : "1"}
                      className="transition-transform hover:scale-110"
                    />
                    <text
                      x={sx}
                      y={sy + 12}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className={`text-[9px] font-medium pointer-events-none ${
                        isChosen ? "fill-white font-bold" : "fill-[#262B22]"
                      }`}
                    >
                      {nuance.label.substring(0, 6)}..
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Center Hub */}
        <circle
          cx={center}
          cy={center}
          r={centerRadius}
          fill="#FDFAF4"
          stroke="#005A1F"
          strokeWidth="3"
          filter="url(#shadow)"
        />
        <text
          x={center}
          y={center - 8}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-serif text-lg font-bold fill-[#005A1F]"
        >
          Agora
        </text>
        <text
          x={center}
          y={center + 14}
          textAnchor="middle"
          dominantBaseline="central"
          className="text-[11px] fill-[#6B6B63]"
        >
          Toque para explorar
        </text>
      </svg>
    </div>
  );
};
