import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RotateCcw, Compass, Sparkles } from "lucide-react";
import {
  EmotionFamily,
  RelatedEmotion,
  EmotionNuance,
  ExplorationLevel,
} from "../types";
import {
  describeAnnularSector,
  polarToCartesian,
  computeRadialOffset,
  calculateTextRotation,
} from "../utils/svgMath";

interface EmotionWheelProps {
  families: EmotionFamily[];
  selectedFamily: EmotionFamily | null;
  selectedEmotion: RelatedEmotion | null;
  selectedNuance: EmotionNuance | null;
  onSelectFamily: (family: EmotionFamily) => void;
  onSelectEmotion: (emotion: RelatedEmotion) => void;
  onSelectNuance: (nuance: EmotionNuance) => void;
  onReset: () => void;
  onOpenCustomModal: () => void;
}

export const EmotionWheel: React.FC<EmotionWheelProps> = ({
  families,
  selectedFamily,
  selectedEmotion,
  selectedNuance,
  onSelectFamily,
  onSelectEmotion,
  onSelectNuance,
  onReset,
  onOpenCustomModal,
}) => {
  const [hoveredFamily, setHoveredFamily] = useState<string | null>(null);
  const [hoveredEmotion, setHoveredEmotion] = useState<string | null>(null);
  const [hoveredNuance, setHoveredNuance] = useState<string | null>(null);

  const cx = 360;
  const cy = 360;

  // Geometry dimensions
  const rCenter = 70;
  const rRing1Inner = 78;
  const rRing1Outer = 162;
  const rRing2Inner = 172;
  const rRing2Outer = 248;
  const rRing3Inner = 258;
  const rRing3Outer = 338;

  // Current level determination
  const currentLevel: ExplorationLevel = selectedNuance
    ? 3
    : selectedEmotion
      ? 2
      : selectedFamily
        ? 1
        : 1;

  // Ring 1 calculation (7 Families)
  const numFamilies = families.length;
  const familyAngleSpan = 360 / numFamilies;
  const gap1 = 1.4;

  // Ring 2 calculation (4 related emotions of selected family)
  const relatedEmotions = selectedFamily ? selectedFamily.relatedEmotions : [];
  const emotionAngleSpan = 360 / (relatedEmotions.length || 4);
  const gap2 = 1.6;

  // Ring 3 calculation (4 nuances of selected emotion)
  const nuances = selectedEmotion ? selectedEmotion.nuances : [];
  const nuanceAngleSpan = 360 / (nuances.length || 4);
  const gap3 = 1.8;

  return (
    <div
      className="relative w-full max-w-[620px] mx-auto flex flex-col items-center select-none"
      id="wheel-container"
    >
      {/* Level breadcrumb & instructions */}
      <div
        className="w-full flex items-center justify-between px-2 mb-3 text-xs text-[#6B635B]"
        id="wheel-status-bar"
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-medium text-[#2C2723]">
            <Compass className="w-3.5 h-3.5 text-[#8C684F]" />
            Camadas:
          </span>
          <div className="flex items-center gap-1.5 font-medium">
            <span
              className={`px-2 py-0.5 rounded transition-colors ${
                selectedFamily
                  ? "bg-[#EAE2D5] text-[#2C2723] font-semibold border border-[#D0C4B4]"
                  : "bg-[#F2ECE3] text-[#7A7168]"
              }`}
            >
              1. Família
            </span>
            <span className="text-[#B5AAA0]">→</span>
            <span
              className={`px-2 py-0.5 rounded transition-colors ${
                selectedEmotion
                  ? "bg-[#EAE2D5] text-[#2C2723] font-semibold border border-[#D0C4B4]"
                  : selectedFamily
                    ? "bg-[#F5F0E8] text-[#5C544D] border border-dashed border-[#DDD2C4]"
                    : "bg-[#F5F0E8] text-[#A69B91]"
              }`}
            >
              2. Emoção
            </span>
            <span className="text-[#B5AAA0]">→</span>
            <span
              className={`px-2 py-0.5 rounded transition-colors ${
                selectedNuance
                  ? "bg-[#EAE2D5] text-[#2C2723] font-semibold border border-[#D0C4B4]"
                  : selectedEmotion
                    ? "bg-[#F5F0E8] text-[#5C544D] border border-dashed border-[#DDD2C4]"
                    : "bg-[#F5F0E8] text-[#A69B91]"
              }`}
            >
              3. Nuance
            </span>
          </div>
        </div>

        {/* Quick Reset button */}
        {(selectedFamily || selectedEmotion || selectedNuance) && (
          <button
            type="button"
            id="btn-wheel-reset"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-xs text-[#5C544D] hover:text-[#211E1C] px-2 py-1 rounded bg-[#EFE9DF] hover:bg-[#E5DDCF] border border-[#DDD3C6] transition-colors focus-visible:outline-2 focus-visible:outline-[#3E3833]"
            title="Reiniciar exploração da roda"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reiniciar</span>
          </button>
        )}
      </div>

      {/* Responsive SVG Wheel */}
      <div className="relative w-full aspect-square flex items-center justify-center p-1 sm:p-2">
        <svg
          viewBox="0 0 720 720"
          className="w-full h-full max-h-[600px] drop-shadow-sm overflow-visible"
          role="region"
          aria-label="Roda interativa das emoções e nuances afetivas"
        >
          <defs>
            {/* Subtle filter for selected tactile elevation */}
            <filter
              id="tactile-shadow"
              x="-10%"
              y="-10%"
              width="130%"
              height="130%"
            >
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="3"
                floodColor="#2C2723"
                floodOpacity="0.15"
              />
            </filter>
            <filter
              id="elevated-shadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="4"
                stdDeviation="5"
                floodColor="#1F1B18"
                floodOpacity="0.22"
              />
            </filter>
          </defs>

          {/* Background guide rings */}
          <circle
            cx={cx}
            cy={cy}
            r={rRing3Outer + 3}
            fill="none"
            stroke="#E8DFD3"
            strokeWidth="1.5"
            strokeDasharray="4 6"
          />
          <circle
            cx={cx}
            cy={cy}
            r={rRing2Outer + 2}
            fill="none"
            stroke="#E8DFD3"
            strokeWidth="1"
          />

          {/* RING 3: NUANCES (Layer 3) */}
          <g
            id="wheel-ring-nuances"
            role="group"
            aria-label="Camada 3: Nuances da experiência"
          >
            {selectedEmotion ? (
              nuances.map((nuance, idx) => {
                const startAngle = idx * nuanceAngleSpan + gap3 / 2;
                const endAngle = (idx + 1) * nuanceAngleSpan - gap3 / 2;
                const midAngle = (startAngle + endAngle) / 2;
                const isSelected = selectedNuance?.id === nuance.id;
                const isHovered = hoveredNuance === nuance.id;

                // Radial offset for selected state (shape change)
                const offset = isSelected
                  ? computeRadialOffset(midAngle, 8)
                  : { x: 0, y: 0 };
                const textPos = polarToCartesian(
                  cx,
                  cy,
                  (rRing3Inner + rRing3Outer) / 2,
                  midAngle,
                );
                const textRotation = calculateTextRotation(midAngle);

                // Marker pin position on outer edge for selected shape
                const pinPos = polarToCartesian(
                  cx,
                  cy,
                  rRing3Outer + (isSelected ? 2 : 0),
                  midAngle,
                );

                const pathD = describeAnnularSector(
                  cx,
                  cy,
                  rRing3Inner,
                  isSelected ? rRing3Outer + 6 : rRing3Outer,
                  startAngle,
                  endAngle,
                );

                return (
                  <g
                    key={nuance.id}
                    transform={`translate(${offset.x}, ${offset.y})`}
                    className="cursor-pointer transition-transform duration-200"
                    onMouseEnter={() => setHoveredNuance(nuance.id)}
                    onMouseLeave={() => setHoveredNuance(null)}
                    onClick={() => onSelectNuance(nuance)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectNuance(nuance);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Nuance ${nuance.label}. ${isSelected ? "Selecionada." : "Clique para selecionar."}`}
                    aria-pressed={isSelected}
                    filter={
                      isSelected
                        ? "url(#elevated-shadow)"
                        : isHovered
                          ? "url(#tactile-shadow)"
                          : undefined
                    }
                  >
                    {/* Sector path */}
                    <path
                      d={pathD}
                      fill={
                        isSelected
                          ? selectedFamily?.accent.color || "#8C684F"
                          : isHovered
                            ? "#EAE1D4"
                            : "#F5EFE6"
                      }
                      stroke={
                        isSelected
                          ? "#1F1B18"
                          : isHovered
                            ? "#6B6056"
                            : "#D5C9BA"
                      }
                      strokeWidth={isSelected ? "2.5" : "1.2"}
                      strokeDasharray={isSelected ? "none" : undefined}
                      className="transition-colors duration-200 outline-none focus-visible:stroke-[#1F1B18] focus-visible:stroke-[3px]"
                    />

                    {/* Shape accent: Distinct double border line when selected */}
                    {isSelected && (
                      <path
                        d={describeAnnularSector(
                          cx,
                          cy,
                          rRing3Inner + 4,
                          rRing3Outer + 2,
                          startAngle + 1,
                          endAngle - 1,
                        )}
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="1.2"
                        strokeOpacity="0.4"
                      />
                    )}

                    {/* Geometric notch/pin marker on outer perimeter (Border + Shape state) */}
                    {isSelected && (
                      <circle
                        cx={pinPos.x}
                        cy={pinPos.y}
                        r="4.5"
                        fill="#1F1B18"
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                      />
                    )}

                    {/* Label */}
                    <text
                      x={textPos.x}
                      y={textPos.y}
                      transform={`rotate(${textRotation}, ${textPos.x}, ${textPos.y})`}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={isSelected ? "#FFFFFF" : "#2D2621"}
                      fontSize={isSelected ? "14" : "13"}
                      fontWeight={isSelected ? "600" : "500"}
                      letterSpacing="0.02em"
                      className="pointer-events-none select-none font-sans"
                    >
                      {nuance.label}
                    </text>
                  </g>
                );
              })
            ) : (
              /* Serene placeholder guide when no emotion is selected */
              <g opacity="0.6">
                <path
                  d={describeAnnularSector(
                    cx,
                    cy,
                    rRing3Inner,
                    rRing3Outer,
                    0,
                    360,
                  )}
                  fill="#FAF7F2"
                  stroke="#E4DCD0"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                />
                <text
                  x={cx}
                  y={cy - (rRing3Inner + rRing3Outer) / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#998E82"
                  fontSize="12"
                  fontStyle="italic"
                  className="pointer-events-none select-none"
                >
                  {selectedFamily
                    ? "Selecione uma emoção para abrir nuances"
                    : "Aguardando seleção da família"}
                </text>
              </g>
            )}
          </g>

          {/* RING 2: RELATED EMOTIONS (Layer 2) */}
          <g
            id="wheel-ring-emotions"
            role="group"
            aria-label="Camada 2: Emoções relacionadas"
          >
            {selectedFamily ? (
              relatedEmotions.map((emotion, idx) => {
                const startAngle = idx * emotionAngleSpan + gap2 / 2;
                const endAngle = (idx + 1) * emotionAngleSpan - gap2 / 2;
                const midAngle = (startAngle + endAngle) / 2;
                const isSelected = selectedEmotion?.id === emotion.id;
                const isHovered = hoveredEmotion === emotion.id;

                // Shape modification on selected state: radial offset
                const offset = isSelected
                  ? computeRadialOffset(midAngle, 6)
                  : { x: 0, y: 0 };
                const textPos = polarToCartesian(
                  cx,
                  cy,
                  (rRing2Inner + rRing2Outer) / 2,
                  midAngle,
                );
                const textRotation = calculateTextRotation(midAngle);

                // Small geometric diamond pin on border
                const notchPos = polarToCartesian(
                  cx,
                  cy,
                  rRing2Outer + (isSelected ? 2 : 0),
                  midAngle,
                );

                const pathD = describeAnnularSector(
                  cx,
                  cy,
                  rRing2Inner,
                  isSelected ? rRing2Outer + 4 : rRing2Outer,
                  startAngle,
                  endAngle,
                );

                return (
                  <g
                    key={emotion.id}
                    transform={`translate(${offset.x}, ${offset.y})`}
                    className="cursor-pointer transition-transform duration-200"
                    onMouseEnter={() => setHoveredEmotion(emotion.id)}
                    onMouseLeave={() => setHoveredEmotion(null)}
                    onClick={() => onSelectEmotion(emotion)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectEmotion(emotion);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Emoção ${emotion.label}. ${isSelected ? "Selecionada." : "Clique para explorar nuances."}`}
                    aria-pressed={isSelected}
                    filter={
                      isSelected
                        ? "url(#elevated-shadow)"
                        : isHovered
                          ? "url(#tactile-shadow)"
                          : undefined
                    }
                  >
                    <path
                      d={pathD}
                      fill={
                        isSelected
                          ? selectedFamily.accent.light
                          : isHovered
                            ? "#EAE2D5"
                            : "#F2ECE2"
                      }
                      stroke={
                        isSelected
                          ? "#1F1B18"
                          : isHovered
                            ? "#61564C"
                            : "#D0C4B4"
                      }
                      strokeWidth={isSelected ? "2.5" : "1.2"}
                      className="transition-colors duration-200 outline-none focus-visible:stroke-[#1F1B18] focus-visible:stroke-[3px]"
                    />

                    {/* Selected state border highlight */}
                    {isSelected && (
                      <path
                        d={describeAnnularSector(
                          cx,
                          cy,
                          rRing2Inner + 3,
                          rRing2Outer + 1,
                          startAngle + 1,
                          endAngle - 1,
                        )}
                        fill="none"
                        stroke={selectedFamily.accent.border}
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                    )}

                    {/* Shape accent indicator (Diamond notch for Level 2) */}
                    {isSelected && (
                      <rect
                        x={notchPos.x - 3.5}
                        y={notchPos.y - 3.5}
                        width="7"
                        height="7"
                        transform={`rotate(45, ${notchPos.x}, ${notchPos.y})`}
                        fill="#1F1B18"
                        stroke="#FAF8F5"
                        strokeWidth="1"
                      />
                    )}

                    {/* Label */}
                    <text
                      x={textPos.x}
                      y={textPos.y}
                      transform={`rotate(${textRotation}, ${textPos.x}, ${textPos.y})`}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#241E1A"
                      fontSize={isSelected ? "14" : "13"}
                      fontWeight={isSelected ? "600" : "500"}
                      letterSpacing="0.02em"
                      className="pointer-events-none select-none font-sans"
                    >
                      {emotion.label}
                    </text>
                  </g>
                );
              })
            ) : (
              /* Serene placeholder guide when no family selected */
              <g opacity="0.6">
                <path
                  d={describeAnnularSector(
                    cx,
                    cy,
                    rRing2Inner,
                    rRing2Outer,
                    0,
                    360,
                  )}
                  fill="#F8F4EE"
                  stroke="#E2D8CB"
                  strokeWidth="1"
                  strokeDasharray="3 5"
                />
                <text
                  x={cx}
                  y={cy - (rRing2Inner + rRing2Outer) / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#998E82"
                  fontSize="12"
                  fontStyle="italic"
                  className="pointer-events-none select-none"
                >
                  Selecione uma família interna
                </text>
              </g>
            )}
          </g>

          {/* RING 1: EMOTION FAMILIES (Core / Layer 1) */}
          <g
            id="wheel-ring-families"
            role="group"
            aria-label="Camada 1: Grandes famílias emocionais"
          >
            {families.map((family, idx) => {
              const startAngle = idx * familyAngleSpan + gap1 / 2;
              const endAngle = (idx + 1) * familyAngleSpan - gap1 / 2;
              const midAngle = (startAngle + endAngle) / 2;
              const isSelected = selectedFamily?.id === family.id;
              const isHovered = hoveredFamily === family.id;

              // Shape change on selection: radial displacement
              const offset = isSelected
                ? computeRadialOffset(midAngle, 6)
                : { x: 0, y: 0 };
              const textPos = polarToCartesian(
                cx,
                cy,
                (rRing1Inner + rRing1Outer) / 2,
                midAngle,
              );
              const textRotation = calculateTextRotation(midAngle);

              // Indicator dot on outer border of selected family
              const markerPos = polarToCartesian(
                cx,
                cy,
                rRing1Outer + (isSelected ? 3 : 0),
                midAngle,
              );

              const pathD = describeAnnularSector(
                cx,
                cy,
                rRing1Inner,
                isSelected ? rRing1Outer + 4 : rRing1Outer,
                startAngle,
                endAngle,
              );

              // Split name for graceful radial display if it has '&'
              const parts = family.name.split(" & ");
              const mainWord = parts[0];
              const secondWord = parts.length > 1 ? `& ${parts[1]}` : "";

              return (
                <g
                  key={family.id}
                  transform={`translate(${offset.x}, ${offset.y})`}
                  className="cursor-pointer transition-transform duration-200"
                  onMouseEnter={() => setHoveredFamily(family.id)}
                  onMouseLeave={() => setHoveredFamily(null)}
                  onClick={() => onSelectFamily(family)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectFamily(family);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Família ${family.name}. ${isSelected ? "Selecionada." : "Clique para explorar."}`}
                  aria-pressed={isSelected}
                  filter={
                    isSelected
                      ? "url(#elevated-shadow)"
                      : isHovered
                        ? "url(#tactile-shadow)"
                        : undefined
                  }
                >
                  {/* Sector path */}
                  <path
                    d={pathD}
                    fill={
                      isSelected
                        ? family.accent.light
                        : isHovered
                          ? "#EAE3D7"
                          : "#EDE5DA"
                    }
                    stroke={
                      isSelected ? "#1F1B18" : isHovered ? "#61564C" : "#CEBFAD"
                    }
                    strokeWidth={isSelected ? "2.5" : "1.2"}
                    className="transition-colors duration-200 outline-none focus-visible:stroke-[#1F1B18] focus-visible:stroke-[3px]"
                  />

                  {/* Inner accent ring line showing family nuance */}
                  <path
                    d={describeAnnularSector(
                      cx,
                      cy,
                      rRing1Inner + 2,
                      rRing1Inner + 5,
                      startAngle + 0.5,
                      endAngle - 0.5,
                    )}
                    fill={family.accent.color}
                    opacity={isSelected ? "1" : "0.65"}
                  />

                  {/* Selected state physical shape indicator: raised border + circle marker */}
                  {isSelected && (
                    <>
                      <path
                        d={describeAnnularSector(
                          cx,
                          cy,
                          rRing1Inner + 6,
                          rRing1Outer + 1,
                          startAngle + 1,
                          endAngle - 1,
                        )}
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="1.2"
                        strokeOpacity="0.5"
                      />
                      <circle
                        cx={markerPos.x}
                        cy={markerPos.y}
                        r="3.5"
                        fill="#1F1B18"
                        stroke="#FFFFFF"
                        strokeWidth="1"
                      />
                    </>
                  )}

                  {/* Two-line text label */}
                  <g
                    transform={`rotate(${textRotation}, ${textPos.x}, ${textPos.y})`}
                  >
                    <text
                      x={textPos.x}
                      y={textPos.y - (secondWord ? 7 : 0)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#211B17"
                      fontSize="12.5"
                      fontWeight={isSelected ? "700" : "600"}
                      letterSpacing="0.01em"
                      className="pointer-events-none select-none font-sans"
                    >
                      {mainWord}
                    </text>
                    {secondWord && (
                      <text
                        x={textPos.x}
                        y={textPos.y + 8}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#544B43"
                        fontSize="9.5"
                        fontWeight="400"
                        className="pointer-events-none select-none font-sans"
                      >
                        {secondWord}
                      </text>
                    )}
                  </g>
                </g>
              );
            })}
          </g>

          {/* CENTER HUB: Interactive Reset / Perceptual Center */}
          <g
            id="wheel-center-hub"
            className="cursor-pointer transition-all duration-200"
            onClick={onReset}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onReset();
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Centro da roda: clique para reiniciar a exploração"
          >
            {/* Soft decorative shadow/border ring */}
            <circle
              cx={cx}
              cy={cy}
              r={rCenter}
              fill="#F9F6F0"
              stroke="#D4C8B8"
              strokeWidth="2"
              className="hover:fill-[#F2EDE4] transition-colors duration-150 focus-visible:stroke-[#1F1B18] focus-visible:stroke-[3px]"
            />
            <circle
              cx={cx}
              cy={cy}
              r={rCenter - 7}
              fill="none"
              stroke="#E8DFC8"
              strokeWidth="1"
              strokeDasharray="2 3"
            />

            {/* Inner icon & label */}
            <g transform={`translate(${cx - 10}, ${cy - 24})`}>
              <RotateCcw className="w-5 h-5 text-[#7A6B5D]" />
            </g>
            <text
              x={cx}
              y={cy + 4}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#2C2723"
              fontSize="11"
              fontWeight="600"
              letterSpacing="0.04em"
              className="pointer-events-none select-none font-sans"
            >
              PERCEBER
            </text>
            <text
              x={cx}
              y={cy + 20}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#7A6F65"
              fontSize="9"
              letterSpacing="0.02em"
              className="pointer-events-none select-none font-sans"
            >
              {selectedFamily ? "voltar ao início" : "toque ao redor"}
            </text>
          </g>
        </svg>
      </div>

      {/* Auxiliary option: "Não encontrei uma palavra" */}
      <div className="mt-2 text-center" id="custom-word-prompt-area">
        <button
          type="button"
          id="btn-custom-word"
          onClick={onOpenCustomModal}
          className="inline-flex items-center gap-1.5 text-xs text-[#524942] hover:text-[#1F1B18] px-3.5 py-1.5 rounded-full bg-[#EDE6DC] hover:bg-[#E2D8CC] border border-[#D5C9BB] transition-colors focus-visible:outline-2 focus-visible:outline-[#2C2723]"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#8C684F]" />
          <span>Não encontrei uma palavra que expresse o momento</span>
        </button>
      </div>
    </div>
  );
};
