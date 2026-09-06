"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";

interface FiguraVivaTreeProps {
  className?: string;
  title?: string;
  interactive?: boolean;
}

const leaves = [
  [86, 126, "#D4AF37"],
  [123, 92, "#B9C66B"],
  [158, 72, "#8EA65A"],
  [198, 62, "#D4AF37"],
  [236, 78, "#A4B85F"],
  [274, 105, "#D4AF37"],
  [314, 132, "#8EA65A"],
  [102, 168, "#B9C66B"],
  [145, 142, "#D4AF37"],
  [190, 128, "#8EA65A"],
  [236, 143, "#B9C66B"],
  [283, 165, "#D4AF37"],
] as const;

export default function FiguraVivaTree({
  className = "",
  title,
  interactive = true,
}: FiguraVivaTreeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!media) return;
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!interactive || reducedMotion || event.pointerType === "touch") return;
    const bounds = rootRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 8;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 5;
    setOffset({ x, y });
  };

  return (
    <div
      ref={rootRef}
      className={`w-full max-w-[460px] ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setOffset({ x: 0, y: 0 })}
      data-testid="figura-viva-tree"
    >
      <svg
        viewBox="0 0 400 420"
        className="h-auto w-full opacity-50"
        style={{
          transform: `translate(${reducedMotion ? 0 : offset.x}px, ${
            reducedMotion ? 0 : offset.y
          }px)`,
          transition: "transform 700ms cubic-bezier(.2,.7,.25,1)",
        }}
        role={title ? "img" : undefined}
        aria-hidden={title ? undefined : true}
        aria-label={title}
      >
        <defs>
          <linearGradient id="figura-tree-wash" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#D4AF37" stopOpacity=".25" />
            <stop offset="1" stopColor="#78916A" stopOpacity=".1" />
          </linearGradient>
        </defs>
        <path
          d="M48 196C70 92 157 32 244 58c70 20 112 82 108 148-5 82-77 115-143 90-70-27-143-4-161-100Z"
          fill="url(#figura-tree-wash)"
        />
        <g
          fill="none"
          stroke="#60422D"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M197 400C190 328 198 255 200 179C201 123 194 82 177 47"
            strokeWidth="11"
          />
          <path
            d="M199 221C164 183 132 157 86 143M198 190C230 153 266 132 314 127M199 267C157 244 121 230 76 234M199 252C244 218 281 205 336 210"
            strokeWidth="6"
          />
          <path
            d="M179 146C151 117 133 88 124 60M229 157C255 115 271 88 277 54M150 246C122 267 100 292 89 320M252 229C284 248 306 270 319 301"
            strokeWidth="3"
          />
        </g>
        <g>
          {leaves.map(([cx, cy, fill], index) => (
            <ellipse
              key={`${cx}-${cy}-${index}`}
              cx={cx}
              cy={cy}
              rx="17"
              ry="9"
              fill={fill}
              opacity=".72"
              transform={`rotate(${index % 2 ? -28 : 28} ${cx} ${cy})`}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
