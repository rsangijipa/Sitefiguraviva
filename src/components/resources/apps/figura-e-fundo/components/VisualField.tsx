import React, { useState } from "react";
import { VisualElementItem, ExperienceStage } from "../types";
import { SVG_SHAPES, WatercolorFilters } from "./AquarelaElements";

interface VisualFieldProps {
  elements: VisualElementItem[];
  stage: ExperienceStage;
  selectedElementId: string | null;
  onSelectElement: (id: string) => void;
  hoveredElementId: string | null;
  setHoveredElementId: (id: string | null) => void;
  customBackgroundOpacity?: number;
}

export const VisualField: React.FC<VisualFieldProps> = ({
  elements,
  stage,
  selectedElementId,
  onSelectElement,
  hoveredElementId,
  setHoveredElementId,
  customBackgroundOpacity,
}) => {
  const isRevealed = stage === "revealed";
  const isSelecting = stage === "selecting";

  // Render individual element graphics based on its category and id
  const renderElementGraphic = (
    el: VisualElementItem,
    isSelected: boolean,
    isOther: boolean,
  ) => {
    // Opacity calculation based on whether it is selected or part of the background
    let effectiveOpacity = el.fillOpacity;
    let strokeOpacity = el.strokeOpacity ?? 0.8;
    let scaleMultiplier = 1;

    if (isRevealed) {
      if (isSelected) {
        effectiveOpacity = 1;
        strokeOpacity = 1;
        scaleMultiplier = 1.05;
      } else if (isOther) {
        // Reduz a proeminência dos demais, sem apagá-los
        const baseReduced =
          customBackgroundOpacity !== undefined
            ? customBackgroundOpacity
            : 0.22;
        effectiveOpacity = Math.min(el.fillOpacity, 0.9) * baseReduced;
        strokeOpacity = Math.min(el.strokeOpacity ?? 0.8, 0.9) * baseReduced;
        scaleMultiplier = 0.98;
      }
    }

    const isHovered = hoveredElementId === el.id;
    const transformStyle = {
      transformOrigin: `${el.position.x}px ${el.position.y}px`,
      transform: `scale(${scaleMultiplier * (isHovered && isSelecting ? 1.03 : 1)})`,
      transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
    };

    return (
      <g
        key={el.id}
        id={`visual-elem-${el.id}`}
        className={`cursor-pointer transition-all duration-700 ${
          el.motionClass ? el.motionClass : ""
        } ${isSelected ? "z-20" : "z-10"}`}
        style={transformStyle}
        onClick={() => {
          if (stage === "selecting" || stage === "revealed") {
            onSelectElement(el.id);
          }
        }}
        onMouseEnter={() => setHoveredElementId(el.id)}
        onMouseLeave={() => setHoveredElementId(null)}
      >
        {/* Invisible wider hit area for easy clicking */}
        <circle
          cx={el.position.x + 80}
          cy={el.position.y + 70}
          r={90}
          fill="transparent"
          className="pointer-events-auto"
        />

        {/* Specific graphic rendering based on element type */}
        {el.category === "forma" && (
          <g
            transform={`translate(${el.position.x}, ${el.position.y}) scale(${el.scale ?? 1}) rotate(${
              el.rotation ?? 0
            })`}
          >
            <path
              d={
                el.id.includes("grafite")
                  ? SVG_SHAPES.watercolorDense
                  : el.id.includes("seixo")
                    ? SVG_SHAPES.organicPebble
                    : SVG_SHAPES.watercolorStain1
              }
              fill={el.color}
              fillOpacity={effectiveOpacity}
              filter={isSelected ? "url(#figure-glow)" : "url(#aquarela-bleed)"}
              className="transition-all duration-700"
            />
            {/* Soft inner texture ring */}
            <path
              d={SVG_SHAPES.watercolorStain2}
              fill={el.color}
              fillOpacity={effectiveOpacity * 0.4}
              transform="scale(0.8) translate(25, 25)"
              className="transition-all duration-700"
            />
          </g>
        )}

        {el.category === "ramo" && (
          <g
            transform={`translate(${el.position.x}, ${el.position.y}) scale(${el.scale ?? 1}) rotate(${
              el.rotation ?? 0
            })`}
          >
            {/* Branch stems */}
            <path
              d={SVG_SHAPES.botanicalBranch}
              fill="none"
              stroke={el.strokeColor}
              strokeWidth={
                isSelected ? (el.strokeWidth ?? 2) * 1.3 : (el.strokeWidth ?? 2)
              }
              strokeOpacity={strokeOpacity}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={isSelected ? "url(#figure-glow)" : undefined}
              className="transition-all duration-700"
            />
            {/* Botanical leaves along branch */}
            <g transform="translate(130, 175) rotate(-25)">
              <path
                d={SVG_SHAPES.leaf1}
                fill={el.strokeColor}
                fillOpacity={effectiveOpacity * 0.8}
                stroke={el.strokeColor}
                strokeWidth={1}
                strokeOpacity={strokeOpacity}
              />
            </g>
            <g transform="translate(195, 95) rotate(35)">
              <path
                d={SVG_SHAPES.leaf2}
                fill={el.strokeColor}
                fillOpacity={effectiveOpacity * 0.8}
                stroke={el.strokeColor}
                strokeWidth={1}
                strokeOpacity={strokeOpacity}
              />
            </g>
            <g transform="translate(80, 120) rotate(-40)">
              <path
                d={SVG_SHAPES.leaf1}
                fill={el.strokeColor}
                fillOpacity={effectiveOpacity * 0.8}
                stroke={el.strokeColor}
                strokeWidth={1}
                strokeOpacity={strokeOpacity}
              />
            </g>
            <g transform="translate(165, 85) rotate(-15)">
              <path
                d={SVG_SHAPES.leaf2}
                fill={el.strokeColor}
                fillOpacity={effectiveOpacity * 0.8}
                stroke={el.strokeColor}
                strokeWidth={1}
                strokeOpacity={strokeOpacity}
              />
            </g>
            <g transform="translate(235, 50) rotate(50)">
              <path
                d={SVG_SHAPES.leaf1}
                fill={el.strokeColor}
                fillOpacity={effectiveOpacity * 0.8}
                stroke={el.strokeColor}
                strokeWidth={1}
                strokeOpacity={strokeOpacity}
              />
            </g>
          </g>
        )}

        {el.category === "linha" && (
          <g
            transform={`translate(${el.position.x}, ${el.position.y}) scale(${el.scale ?? 1}) rotate(${
              el.rotation ?? 0
            })`}
          >
            <path
              d={SVG_SHAPES.contourLine}
              fill="none"
              stroke={el.strokeColor}
              strokeWidth={
                isSelected
                  ? (el.strokeWidth ?? 1.6) * 1.5
                  : (el.strokeWidth ?? 1.6)
              }
              strokeOpacity={strokeOpacity}
              strokeLinecap="round"
              filter={isSelected ? "url(#figure-glow)" : undefined}
              className="transition-all duration-700"
            />
            {el.id === "par-linhas" && (
              <path
                d={SVG_SHAPES.contourLineSubtle}
                fill="none"
                stroke={el.strokeColor}
                strokeWidth={
                  isSelected
                    ? (el.strokeWidth ?? 1.6) * 1.5
                    : (el.strokeWidth ?? 1.6)
                }
                strokeOpacity={strokeOpacity * 0.9}
                strokeLinecap="round"
                transform="translate(10, 20)"
                className="transition-all duration-700"
              />
            )}
          </g>
        )}

        {el.category === "fragmentos" && (
          <g
            transform={`translate(${el.position.x}, ${el.position.y}) scale(${el.scale ?? 1}) rotate(${
              el.rotation ?? 0
            })`}
          >
            {/* Scatter cluster of delicate watercolor particles / pigment drops */}
            <circle
              cx="20"
              cy="15"
              r="5"
              fill={el.color}
              fillOpacity={effectiveOpacity}
            />
            <circle
              cx="35"
              cy="40"
              r="3.5"
              fill={el.color}
              fillOpacity={effectiveOpacity * 0.9}
            />
            <circle
              cx="65"
              cy="20"
              r="6"
              fill={el.color}
              fillOpacity={effectiveOpacity}
            />
            <circle
              cx="85"
              cy="55"
              r="4.2"
              fill={el.color}
              fillOpacity={effectiveOpacity * 0.85}
            />
            <circle
              cx="45"
              cy="70"
              r="3"
              fill={el.color}
              fillOpacity={effectiveOpacity * 0.75}
            />
            <circle
              cx="10"
              cy="85"
              r="4.8"
              fill={el.color}
              fillOpacity={effectiveOpacity * 0.8}
            />
            <circle
              cx="105"
              cy="30"
              r="5.5"
              fill={el.color}
              fillOpacity={effectiveOpacity * 0.9}
            />
            <circle
              cx="120"
              cy="75"
              r="3.2"
              fill={el.color}
              fillOpacity={effectiveOpacity * 0.7}
            />
            <circle
              cx="70"
              cy="95"
              r="4.5"
              fill={el.color}
              fillOpacity={effectiveOpacity * 0.85}
            />
            {el.id === "enxame-fragmentos" && (
              <>
                <circle
                  cx="50"
                  cy="120"
                  r="5"
                  fill={el.color}
                  fillOpacity={effectiveOpacity}
                />
                <circle
                  cx="95"
                  cy="110"
                  r="6"
                  fill={el.color}
                  fillOpacity={effectiveOpacity * 0.9}
                />
                <circle
                  cx="140"
                  cy="50"
                  r="4"
                  fill={el.color}
                  fillOpacity={effectiveOpacity * 0.8}
                />
                <circle
                  cx="150"
                  cy="95"
                  r="5.2"
                  fill={el.color}
                  fillOpacity={effectiveOpacity * 0.85}
                />
                <circle
                  cx="30"
                  cy="140"
                  r="3.8"
                  fill={el.color}
                  fillOpacity={effectiveOpacity * 0.75}
                />
                <circle
                  cx="80"
                  cy="145"
                  r="4.6"
                  fill={el.color}
                  fillOpacity={effectiveOpacity * 0.9}
                />
              </>
            )}
          </g>
        )}

        {/* Hover / selection subtle focal ring */}
        {isHovered && isSelecting && (
          <circle
            cx={el.position.x + 60}
            cy={el.position.y + 60}
            r={50}
            fill="none"
            stroke="#1F1E1D"
            strokeWidth="0.75"
            strokeDasharray="4 4"
            className="anim-pulse-gaze opacity-50 pointer-events-none"
          />
        )}
      </g>
    );
  };

  return (
    <div className="relative w-full aspect-[16/11] max-h-[560px] rounded-2xl overflow-hidden border border-[#E3DFD5] bg-[#FBF9F5] shadow-[0_4px_24px_rgba(0,0,0,0.03)] select-none">
      {/* Subtle paper grain background */}
      <div className="absolute inset-0 paper-texture pointer-events-none opacity-60" />

      {/* SVG Canvas for figure-ground field */}
      <svg
        viewBox="0 0 680 440"
        className="w-full h-full relative z-10"
        preserveAspectRatio="xMidYMid meet"
      >
        <WatercolorFilters />

        {/* Subtle decorative background watermarks */}
        <g opacity="0.04" className="pointer-events-none">
          <circle
            cx="340"
            cy="220"
            r="180"
            fill="none"
            stroke="#222"
            strokeWidth="0.8"
          />
          <circle
            cx="340"
            cy="220"
            r="280"
            fill="none"
            stroke="#222"
            strokeWidth="0.5"
            strokeDasharray="3 6"
          />
        </g>

        {/* Render elements in layer order */}
        {elements.map((el) => {
          const isSelected = selectedElementId === el.id;
          const isOther = selectedElementId !== null && !isSelected;
          return renderElementGraphic(el, isSelected, isOther);
        })}
      </svg>

      {/* Dynamic Status Badge (Figure vs Ground indicator) */}
      {isRevealed && selectedElementId && (
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto z-20 flex items-center gap-3 bg-[#FFFFFF]/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-[#E3DFD5] shadow-sm text-xs text-[#4A4744]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2C2A29]" />
            <span className="font-medium text-[#1F1E1D]">Figura:</span>
            <span>
              {elements.find((e) => e.id === selectedElementId)?.name}
            </span>
          </div>
          <span className="text-[#C4BEB3]">|</span>
          <div className="flex items-center gap-1.5 text-[#6E6A65]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C4BEB3]/60" />
            <span>Fundo: Demais elementos recuados</span>
          </div>
        </div>
      )}

      {/* Gentle helper tooltip when in selecting mode */}
      {isSelecting && !selectedElementId && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-[#FFFFFF]/85 backdrop-blur-sm px-4 py-2 rounded-full border border-[#E3DFD5] shadow-sm text-xs text-[#5E5A55] tracking-wide animate-fade-in">
          Toque ou clique no elemento que saltou primeiro aos seus olhos
        </div>
      )}
    </div>
  );
};
