import React from "react";
import { motion } from "motion/react";
import { QuestionConfig } from "../types";

interface OrganicBranchProps {
  questions: QuestionConfig[];
  currentIndex: number;
  onSelectStep?: (index: number) => void;
  isFinished?: boolean;
}

export const OrganicBranch: React.FC<OrganicBranchProps> = ({
  questions,
  currentIndex,
  onSelectStep,
  isFinished = false,
}) => {
  // 5 milestones along the branch
  // We compute gentle organic coords along an elegant curved branch
  const nodePositions = [
    { x: 40, y: 32 },
    { x: 130, y: 24 },
    { x: 220, y: 36 },
    { x: 310, y: 22 },
    { x: 400, y: 30 },
  ];

  return (
    <div
      id="organic-branch-traversal"
      className="relative mx-auto w-full max-w-[440px] px-4 py-2 select-none"
      aria-label="Travessia de percepção no momento presente"
    >
      <svg
        viewBox="0 0 440 60"
        className="w-full h-auto overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="branchGrad"
            x1="0"
            y1="0"
            x2="440"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#8d847a" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#7a8b83" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#8a7e93" stopOpacity="0.4" />
          </linearGradient>

          <filter id="gentle-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Main organic curved branch / twig */}
        <path
          d="M 20 36 C 70 28, 100 20, 150 26 C 200 32, 230 42, 280 26 C 330 14, 370 34, 420 28"
          stroke="url(#branchGrad)"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeDasharray="1 0"
        />

        {/* Delicate secondary branchlets / tiny organic twigs */}
        <path
          d="M 95 24 C 105 16, 115 14, 122 17"
          stroke="#8d847a"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.3"
        />
        <path
          d="M 180 30 C 190 38, 202 42, 212 39"
          stroke="#7a8b83"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.35"
        />
        <path
          d="M 270 27 C 278 19, 290 17, 298 20"
          stroke="#856a5d"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.3"
        />
        <path
          d="M 360 25 C 370 32, 382 35, 390 32"
          stroke="#6b6e82"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.35"
        />

        {/* Little organic leaves/sprouts */}
        <path
          d="M 122 17 C 125 13, 129 14, 128 18 C 127 21, 123 20, 122 17 Z"
          fill="#7a8b83"
          opacity="0.45"
        />
        <path
          d="M 298 20 C 302 16, 306 18, 304 22 C 302 24, 299 23, 298 20 Z"
          fill="#856a5d"
          opacity="0.4"
        />

        {/* Organic nodes along the path */}
        {questions.map((q, idx) => {
          const pos = nodePositions[idx] || { x: 40 + idx * 80, y: 30 };
          const isActive = !isFinished && idx === currentIndex;
          const isPassed = isFinished || idx < currentIndex;
          const isUpcoming = !isFinished && idx > currentIndex;

          return (
            <g
              key={q.id}
              onClick={() => onSelectStep && onSelectStep(idx)}
              className={onSelectStep ? "cursor-pointer group" : ""}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onSelectStep?.(idx);
                }
              }}
              aria-label={`Momento ${idx + 1}: ${q.question}`}
            >
              {/* Active breathing halo */}
              {isActive && (
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r="14"
                  fill={q.themeColor.primary}
                  initial={{ opacity: 0.1, scale: 0.8 }}
                  animate={{
                    opacity: [0.15, 0.32, 0.15],
                    scale: [1, 1.35, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  filter="url(#gentle-glow)"
                />
              )}

              {/* Node outer organic ring */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isActive ? 7 : isPassed ? 5.5 : 4.5}
                fill={isPassed ? "#fbf9f5" : "#fbf9f5"}
                stroke={
                  isActive
                    ? q.themeColor.primary
                    : isPassed
                      ? "#69746e"
                      : "#bfb8ad"
                }
                strokeWidth={isActive ? 2 : 1.5}
                className="transition-all duration-500 group-hover:stroke-[#4a4744]"
              />

              {/* Node inner core */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isActive ? 3.5 : isPassed ? 3 : 1.5}
                fill={
                  isActive
                    ? q.themeColor.primary
                    : isPassed
                      ? "#69746e"
                      : "#bfb8ad"
                }
                className="transition-all duration-500"
              />

              {/* Subtle hover tooltip / touch area enlargement */}
              <circle cx={pos.x} cy={pos.y} r="18" fill="transparent" />
            </g>
          );
        })}
      </svg>

      {/* Discreet step indicator label */}
      <div className="flex justify-between items-center px-2 text-[11px] text-[#857f77] tracking-wider uppercase font-medium">
        <span>Atenção</span>
        <span>Corpo</span>
        <span>Sensação</span>
        <span>Necessidade</span>
        <span>Permanência</span>
      </div>
    </div>
  );
};
