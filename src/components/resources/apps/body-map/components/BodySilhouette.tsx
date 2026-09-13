import type { RegionId, Sensation } from "../types";
import { regions } from "../data/regions";
import { sensations } from "../data/sensations";

const regionPositions: Record<RegionId, { x: string; y: string }> = {
  head: { x: "50%", y: "10%" },
  neck: { x: "50%", y: "20%" },
  chest: { x: "50%", y: "31%" },
  abdomen: { x: "50%", y: "46%" },
  "left-arm": { x: "15%", y: "43%" },
  "right-arm": { x: "85%", y: "43%" },
  "left-leg": { x: "42%", y: "73%" },
  "right-leg": { x: "58%", y: "73%" },
  feet: { x: "50%", y: "95%" },
};

const headPath =
  "M110 18 C92 18 81 31 81 51 C81 72 89 88 103 94 C107 96 113 96 117 94 C131 88 139 72 139 51 C139 31 128 18 110 18 Z";

const neckPath =
  "M96 87 C98 96 97 104 91 112 C95 120 101 124 110 124 C119 124 125 120 129 112 C123 104 122 96 124 87 C117 92 103 92 96 87 Z";

const torsoPath =
  "M91 108 C78 110 66 114 56 121 C61 140 65 161 68 182 C71 202 73 220 79 236 C84 249 84 261 78 278 C87 287 98 292 110 292 C122 292 133 287 142 278 C136 261 136 249 141 236 C147 220 149 202 152 182 C155 161 159 140 164 121 C154 114 142 110 129 108 C125 118 119 123 110 123 C101 123 95 118 91 108 Z";

const leftArmPath =
  "M58 121 C48 124 41 131 38 142 C33 160 30 181 27 202 C24 224 20 247 17 269 C15 280 11 290 12 301 C13 313 18 322 24 330 C28 335 33 332 34 327 C36 320 33 311 31 302 C32 291 36 281 39 272 C44 251 49 231 53 211 C58 190 63 169 68 149 C71 137 68 127 58 121 Z";

const rightArmPath =
  "M162 121 C172 124 179 131 182 142 C187 160 190 181 193 202 C196 224 200 247 203 269 C205 280 209 290 208 301 C207 313 202 322 196 330 C192 335 187 332 186 327 C184 320 187 311 189 302 C188 291 184 281 181 272 C176 251 171 231 167 211 C162 190 157 169 152 149 C149 137 152 127 162 121 Z";

const leftLegPath =
  "M78 274 C73 295 71 318 72 341 C73 363 77 384 77 398 C77 418 72 440 70 461 C69 476 67 486 62 494 C57 502 66 507 84 503 C91 502 95 498 93 493 C90 487 86 485 84 477 C83 462 87 442 91 422 C96 399 100 374 102 350 C104 326 104 302 101 284 C94 283 86 280 78 274 Z";

const rightLegPath =
  "M142 274 C147 295 149 318 148 341 C147 363 143 384 143 398 C143 418 148 440 150 461 C151 476 153 486 158 494 C163 502 154 507 136 503 C129 502 125 498 127 493 C130 487 134 485 136 477 C137 462 133 442 129 422 C124 399 120 374 118 350 C116 326 116 302 119 284 C126 283 134 280 142 274 Z";

const leftFootPath =
  "M70 461 C69 476 67 486 62 494 C57 502 66 507 84 503 C91 502 95 498 93 493 C90 487 86 485 84 477 C80 470 75 465 70 461 Z";

const rightFootPath =
  "M150 461 C151 476 153 486 158 494 C163 502 154 507 136 503 C129 502 125 498 127 493 C130 487 134 485 136 477 C140 470 145 465 150 461 Z";

interface BodySilhouetteProps {
  selectedRegion: RegionId;
  marks: Record<RegionId, Sensation | undefined>;
  onRegionSelect: (id: RegionId) => void;
}

export function BodySilhouette({
  selectedRegion,
  marks,
  onRegionSelect,
}: BodySilhouetteProps) {
  const sensationColorFor = (id: RegionId) => {
    const mark = marks[id];
    return sensations.find((sensation) => sensation.value === mark)?.cssColor;
  };

  const regionFill = (id: RegionId) => {
    const markColor = sensationColorFor(id);

    if (markColor) return markColor;
    if (selectedRegion === id) return "rgb(var(--color-primary) / 0.12)";
    return "transparent";
  };

  const regionOpacity = (id: RegionId) => (marks[id] ? 0.28 : 1);

  return (
    <div className="relative mx-auto h-[34rem] w-full max-w-[22rem] sm:h-[38rem]">
      <svg
        viewBox="0 0 220 520"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="body-surface" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgb(var(--color-paper))" />
            <stop offset="58%" stopColor="rgb(var(--color-surface))" />
            <stop offset="100%" stopColor="rgb(var(--color-paper))" />
          </linearGradient>
          <radialGradient id="body-depth" cx="50%" cy="38%" r="66%">
            <stop offset="0%" stopColor="rgb(var(--color-primary) / 0.035)" />
            <stop offset="72%" stopColor="rgb(var(--color-primary) / 0.012)" />
            <stop offset="100%" stopColor="rgb(var(--color-primary) / 0)" />
          </radialGradient>
          <filter id="body-shadow" x="-20%" y="-10%" width="140%" height="130%">
            <feDropShadow
              dx="0"
              dy="3"
              stdDeviation="4"
              floodColor="rgb(var(--color-primary) / 0.09)"
            />
          </filter>
        </defs>

        <g
          fill="url(#body-surface)"
          stroke="rgb(var(--color-border) / 0.78)"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#body-shadow)"
        >
          <path d={headPath} />
          <ellipse cx="79.5" cy="56" rx="3.8" ry="8.5" />
          <ellipse cx="140.5" cy="56" rx="3.8" ry="8.5" />
          <path d={neckPath} />
          <path d={torsoPath} />
          <path d={leftArmPath} />
          <path d={rightArmPath} />
          <path d={leftLegPath} />
          <path d={rightLegPath} />
        </g>

        <g
          fill="none"
          stroke="rgb(var(--color-primary) / 0.13)"
          strokeWidth="0.9"
          strokeLinecap="round"
        >
          <path d="M94 126 C99 132 104 135 110 135 C116 135 121 132 126 126" />
          <path d="M82 145 C91 140 101 138 110 138 C119 138 129 140 138 145" />
          <path d="M110 142 C109 164 109 183 110 203" />
          <path d="M91 218 C98 222 103 224 110 224 C117 224 122 222 129 218" />
          <ellipse cx="110" cy="214" rx="1.8" ry="2.4" />
          <path d="M79 279 C89 286 99 289 110 289 C121 289 131 286 141 279" />
          <path d="M73 371 C80 374 88 375 96 372" />
          <path d="M124 372 C132 375 140 374 147 371" />
          <path d="M69 458 C75 461 81 462 87 459" />
          <path d="M133 459 C139 462 145 461 151 458" />
        </g>

        <g fill="url(#body-depth)" pointerEvents="none">
          <path d={headPath} />
          <path d={neckPath} />
          <path d={torsoPath} />
          <path d={leftArmPath} />
          <path d={rightArmPath} />
          <path d={leftLegPath} />
          <path d={rightLegPath} />
        </g>

        <g pointerEvents="none" stroke="none">
          <path
            d={headPath}
            fill={regionFill("head")}
            opacity={regionOpacity("head")}
          />
          <path
            d={neckPath}
            fill={regionFill("neck")}
            opacity={regionOpacity("neck")}
          />
          <path
            d="M59 121 C67 114 79 110 91 108 C95 118 101 123 110 123 C119 123 125 118 129 108 C141 110 153 114 161 121 C156 144 153 166 150 190 C136 196 124 199 110 199 C96 199 84 196 70 190 C67 166 64 144 59 121 Z"
            fill={regionFill("chest")}
            opacity={regionOpacity("chest")}
          />
          <path
            d="M70 188 C84 194 96 197 110 197 C124 197 136 194 150 188 C148 205 146 222 141 236 C136 249 136 261 142 278 C133 287 122 292 110 292 C98 292 87 287 78 278 C84 261 84 249 79 236 C74 222 72 205 70 188 Z"
            fill={regionFill("abdomen")}
            opacity={regionOpacity("abdomen")}
          />
          <path
            d={leftArmPath}
            fill={regionFill("left-arm")}
            opacity={regionOpacity("left-arm")}
          />
          <path
            d={rightArmPath}
            fill={regionFill("right-arm")}
            opacity={regionOpacity("right-arm")}
          />
          <path
            d={leftLegPath}
            fill={regionFill("left-leg")}
            opacity={regionOpacity("left-leg")}
          />
          <path
            d={rightLegPath}
            fill={regionFill("right-leg")}
            opacity={regionOpacity("right-leg")}
          />
          <path
            d={leftFootPath}
            fill={regionFill("feet")}
            opacity={regionOpacity("feet")}
          />
          <path
            d={rightFootPath}
            fill={regionFill("feet")}
            opacity={regionOpacity("feet")}
          />
        </g>
      </svg>

      <div
        role="img"
        aria-label="Mapa corporal interativo com regiões marcáveis"
        className="absolute inset-0 h-full w-full"
      >
        {regions.map((region) => {
          const isSelected = region.id === selectedRegion;
          const mark = marks[region.id];
          const pos = regionPositions[region.id];
          const sensationColor = sensationColorFor(region.id);

          return (
            <button
              key={region.id}
              type="button"
              aria-label={`${region.label}${mark ? `: ${mark}` : ": sem marcação"}`}
              aria-pressed={isSelected}
              onClick={() => onRegionSelect(region.id)}
              className="group absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              style={{ left: pos.x, top: pos.y }}
            >
              <span
                className={`block rounded-full border-2 shadow-sm transition-all duration-200 ease-out-soft group-hover:scale-110 ${
                  mark
                    ? "border-paper"
                    : isSelected
                      ? "border-primary"
                      : "border-primary/35 bg-paper/95"
                }`}
                style={{
                  width: mark ? "18px" : isSelected ? "16px" : "13px",
                  height: mark ? "18px" : isSelected ? "16px" : "13px",
                  backgroundColor: mark
                    ? (sensationColor ?? undefined)
                    : isSelected
                      ? "rgb(var(--color-primary))"
                      : undefined,
                }}
              />
              {mark ? (
                <span
                  className="pointer-events-none absolute h-7 w-7 animate-pulse rounded-full opacity-20"
                  style={{ backgroundColor: sensationColor }}
                />
              ) : null}
              <span className="sr-only">{region.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
