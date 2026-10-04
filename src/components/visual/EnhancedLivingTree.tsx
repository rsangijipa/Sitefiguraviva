import React, {
  useId,
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import type { TimeOfDay, TreeTheme } from "./enhanced-tree-data";
import {
  ENHANCED_PETALS,
  STRUCTURED_BRANCHES,
  getThemedColor,
} from "./enhanced-tree-data";
import { natureAudio } from "./enhanced-tree-audio";

export interface EnhancedLivingTreeProps {
  className?: string;
  theme: TreeTheme;
  timeOfDay: TimeOfDay;
  windIntensity: number; // 0 (calm) to 2 (strong)
  windDirection: number; // -1 to 1
  leafFlutter: boolean;
  interactive: boolean;
  onCanopyClick?: (x: number, y: number) => void;
}

const FLYING_LEAVES = [
  { x: 124, y: 158, angle: -28, scale: 0.78, color: "#fe538b", delay: "-1.4s" },
  { x: 168, y: 116, angle: 34, scale: 0.62, color: "#fed701", delay: "-4.8s" },
  { x: 226, y: 90, angle: -18, scale: 0.72, color: "#01c94d", delay: "-2.7s" },
  { x: 286, y: 130, angle: 44, scale: 0.58, color: "#01a784", delay: "-6.3s" },
  { x: 324, y: 194, angle: -35, scale: 0.7, color: "#ff6fa4", delay: "-3.8s" },
  { x: 198, y: 216, angle: 12, scale: 0.54, color: "#f7c948", delay: "-0.5s" },
] as const;

export default function EnhancedLivingTree({
  className = "",
  theme,
  timeOfDay,
  windIntensity = 1,
  windDirection = 0.5,
  leafFlutter = true,
  interactive = true,
  onCanopyClick,
}: EnhancedLivingTreeProps) {
  const id = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);

  // Physics state for smooth spring-based cursor follow & wind gusts
  const physicsRef = useRef({
    currentBend: 0,
    targetBend: 0,
    currentY: 0,
    targetY: 0,
    velocity: 0,
    gustTime: 0,
    mouseWave: 0,
  });

  const [physicsState, setPhysicsState] = useState({
    trunkRot: 0,
    trunkTranslateX: 0,
    trunkTranslateY: 0,
    gustWave: 0,
  });

  // Animation loop with spring physics & traveling wind ripples
  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const p = physicsRef.current;
      p.gustTime += dt * (0.8 + windIntensity * 0.9);

      // Natural continuous wind oscillation with multi-harmonic frequency
      const naturalWind =
        Math.sin(p.gustTime * 1.1) * 0.8 * windIntensity +
        Math.sin(p.gustTime * 2.3) * 0.4 * windIntensity +
        Math.cos(p.gustTime * 0.4) * 0.5 * windIntensity * windDirection;

      const totalTarget = p.targetBend + naturalWind;

      // Spring damper equation: F = -k*x - c*v
      const k = 18; // Spring stiffness
      const damping = 4.5; // Damping
      const displacement = p.currentBend - totalTarget;
      const springForce = -k * displacement - damping * p.velocity;

      p.velocity += springForce * dt;
      p.currentBend += p.velocity * dt;

      // Smooth vertical compression when bending
      p.currentY += (p.targetY - p.currentY) * 0.1;

      // Update sound with natural wind rhythm
      if (windIntensity > 0) {
        natureAudio.updateWind(
          Math.abs(p.velocity) * 0.4 + windIntensity * 0.6,
        );
      }

      setPhysicsState({
        trunkRot: p.currentBend,
        trunkTranslateX: p.currentBend * 1.2,
        trunkTranslateY: Math.abs(p.currentBend) * 0.3 + p.currentY,
        gustWave: p.gustTime,
      });

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [windIntensity, windDirection]);

  // Pointer move handler: applies wind force impulse
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!interactive) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      // Impose interactive bend
      physicsRef.current.targetBend = normX * 3.2 * (0.5 + windIntensity * 0.5);
      physicsRef.current.targetY = normY * 1.5;
    },
    [interactive, windIntensity],
  );

  const handlePointerLeave = useCallback(() => {
    physicsRef.current.targetBend = 0;
    physicsRef.current.targetY = 0;
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Trigger branch wobble impulse
    physicsRef.current.velocity += Math.random() > 0.5 ? 4.5 : -4.5;
    natureAudio.playChime(1 + (Math.random() - 0.5) * 0.3);

    if (onCanopyClick) {
      onCanopyClick(clickX, clickY);
    }
  };

  // Memoized themed petal array
  const themedPetals = useMemo(() => {
    return ENHANCED_PETALS.map((petal) => ({
      ...petal,
      themedColor: getThemedColor(petal.color, theme),
    }));
  }, [theme]);

  // Group petals by cluster for staggered wave aerodynamics
  const clusterGroups = useMemo(() => {
    const groups: (typeof themedPetals)[] = Array.from({ length: 6 }, () => []);
    themedPetals.forEach((p) => {
      groups[p.cluster].push(p);
    });
    return groups;
  }, [themedPetals]);

  // Dynamic wash gradient based on season & time
  const canopyGlowColor = useMemo(() => {
    if (theme === "primavera") return ["#ff9ec6", "#fde047", "#86efac"];
    if (theme === "outono") return ["#ea580c", "#ca8a04", "#b91c1c"];
    if (theme === "aurora") return ["#c084fc", "#06b6d4", "#3b82f6"];
    return ["#FE538B", "#FED701", "#01C94D"]; // Figura Viva classic
  }, [theme]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-[454/523] select-none cursor-pointer group ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
    >
      <svg
        viewBox="0 0 454 523"
        preserveAspectRatio="xMidYMax meet"
        className="block w-full h-full overflow-visible transition-transform duration-300"
        role="img"
        aria-label="Árvore Orgânica Figura Viva"
      >
        <style>{`
          .enhanced-tree-flying-leaf {
            animation: enhanced-tree-leaf-flight 8s cubic-bezier(.28,.66,.48,1) infinite;
            transform-box: fill-box;
            transform-origin: center;
          }
          @keyframes enhanced-tree-leaf-flight {
            0%, 8% { opacity: 0; transform: translate(0, 0) rotate(0deg); }
            15% { opacity: .88; }
            58% { opacity: .72; transform: translate(54px, -24px) rotate(150deg); }
            100% { opacity: 0; transform: translate(148px, -68px) rotate(380deg); }
          }
          @media (prefers-reduced-motion: reduce) {
            .enhanced-tree-flying-leaf { animation: none; opacity: 0; }
          }
        `}</style>
        <defs>
          {/* Detailed Teardrop Petal contour with central midrib depression */}
          <path
            id={`${id}-master-petal`}
            d="M0 24 C-16 11 -21 -6 -10 -22 C-3 -30 8 -27 14 -18 C23 0 10 16 0 24 Z"
          />

          {/* Organic Wood Gradient with Bark Striations */}
          <linearGradient id={`${id}-bark-main`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3d2012" />
            <stop offset="28%" stopColor="#753e18" />
            <stop offset="55%" stopColor="#a36528" />
            <stop offset="78%" stopColor="#bf813d" />
            <stop offset="100%" stopColor="#4a2514" />
          </linearGradient>

          {/* Deeper back branch gradient */}
          <linearGradient id={`${id}-bark-deep`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2c160b" />
            <stop offset="50%" stopColor="#482512" />
            <stop offset="100%" stopColor="#2c160b" />
          </linearGradient>

          {/* Ambient Canopy Backwash */}
          <radialGradient id={`${id}-wash`} cx="52%" cy="40%" r="58%">
            <stop
              offset="0%"
              stopColor={canopyGlowColor[1]}
              stopOpacity="0.32"
            />
            <stop
              offset="45%"
              stopColor={canopyGlowColor[0]}
              stopOpacity="0.22"
            />
            <stop
              offset="85%"
              stopColor={canopyGlowColor[2]}
              stopOpacity="0.12"
            />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          {/* Ground Base Shadow */}
          <radialGradient id={`${id}-ground-shadow`} cx="50%" cy="50%" r="50%">
            <stop
              offset="0%"
              stopColor={timeOfDay === "crepusculo" ? "#0f0c16" : "#4a3525"}
              stopOpacity="0.45"
            />
            <stop
              offset="60%"
              stopColor={timeOfDay === "crepusculo" ? "#0f0c16" : "#4a3525"}
              stopOpacity="0.15"
            />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          {/* Soft Filter for ambient canopy glow */}
          <filter
            id={`${id}-glow`}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Ground Shadow & Moss Base */}
        <ellipse
          cx="194"
          cy="484"
          rx="145"
          ry="19"
          fill={`url(#${id}-ground-shadow)`}
        />
        {/* Soft grass/lichen tufts at the base */}
        <g opacity="0.4" fill="#607c3c">
          <ellipse cx="178" cy="480" rx="18" ry="4" />
          <ellipse cx="212" cy="482" rx="22" ry="5" />
        </g>

        {/* 2. Main Hierarchical Spring Sway Group (Anchored at Trunk Base 194, 478) */}
        <g
          style={{
            transformOrigin: "194px 478px",
            transform: `translate(${physicsState.trunkTranslateX}px, ${physicsState.trunkTranslateY}px) rotate(${physicsState.trunkRot}deg)`,
            transition: "transform 80ms ease-out",
          }}
        >
          {/* Radiant Canopy Atmosphere Aura */}
          <path
            d="M34 203 C21 177 42 129 76 99 C106 65 145 46 193 46 C232 30 260 20 288 39 C333 45 340 83 365 108 C406 146 429 188 418 238 C408 277 415 310 378 337 L355 383 C321 399 283 375 252 356 C229 345 214 349 193 343 C169 330 126 354 105 321 C82 300 61 285 49 252 Z"
            fill={`url(#${id}-wash)`}
            filter={`url(#${id}-glow)`}
          />

          {/* 3. Deep Background Branches (Atmospheric depth) */}
          <g
            fill="none"
            stroke={`url(#${id}-bark-deep)`}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.65"
          >
            {STRUCTURED_BRANCHES.filter((b) => b.depth === "back").map(
              (branch) => {
                const flexWobble =
                  Math.sin(physicsState.gustWave * 1.5 + branch.branchGroup) *
                  branch.flexFactor *
                  windIntensity *
                  0.8;
                return (
                  <path
                    key={branch.id}
                    d={branch.d}
                    strokeWidth={branch.width}
                    style={{
                      transformOrigin: "194px 340px",
                      transform: `rotate(${flexWobble}deg)`,
                    }}
                  />
                );
              },
            )}
          </g>

          {/* 4. Core Main Branches & Trunk */}
          <g
            fill="none"
            stroke={`url(#${id}-bark-main)`}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {STRUCTURED_BRANCHES.filter((b) => b.depth === "main").map(
              (branch) => {
                const flexWobble =
                  Math.sin(
                    physicsState.gustWave * 1.8 + branch.branchGroup * 0.7,
                  ) *
                  branch.flexFactor *
                  windIntensity *
                  0.9;
                return (
                  <path
                    key={branch.id}
                    d={branch.d}
                    strokeWidth={branch.width}
                    style={{
                      transformOrigin: "194px 360px",
                      transform: `rotate(${flexWobble}deg)`,
                      transition: "transform 150ms ease-out",
                    }}
                  />
                );
              },
            )}
          </g>

          {/* 5. Delicate Foreground Twigs & High Stems */}
          <g
            fill="none"
            stroke={`url(#${id}-bark-main)`}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {STRUCTURED_BRANCHES.filter((b) => b.depth === "front").map(
              (branch) => {
                const flexWobble =
                  Math.sin(
                    physicsState.gustWave * 2.4 + branch.branchGroup * 1.2,
                  ) *
                  branch.flexFactor *
                  windIntensity *
                  1.4;
                return (
                  <path
                    key={branch.id}
                    d={branch.d}
                    strokeWidth={branch.width}
                    style={{
                      transformOrigin: "194px 280px",
                      transform: `rotate(${flexWobble}deg)`,
                      transition: "transform 120ms ease-out",
                    }}
                  />
                );
              },
            )}
          </g>

          {/* 6. Wood Highlights & Bark Grain Grooves */}
          <g fill="none" strokeLinecap="round" opacity="0.6">
            <path
              d="M190 470 C183 432 199 399 187 358 M194 381 C209 348 230 338 251 324 M177 329 C163 302 158 271 163 248"
              stroke="#dfac62"
              strokeWidth="2.2"
            />
            <path
              d="M198 466 C194 440 199 419 194 397 M184 431 L187 415 M185 386 L188 366"
              stroke="#2e170c"
              strokeWidth="2.5"
            />
          </g>

          {/* 7. Organic Blooming Canopy (Petals with Fluid Wave Dynamics) */}
          {clusterGroups.map((groupPetals, clusterIdx) => {
            // Cluster aerodynamic delay & traveling wind wave
            const clusterPhaseLag = clusterIdx * 0.85;
            const clusterWaveRot =
              Math.sin(physicsState.gustWave * 1.4 - clusterPhaseLag) *
              (1.2 + clusterIdx * 0.4) *
              windIntensity *
              windDirection;
            const clusterSwayX =
              Math.cos(physicsState.gustWave * 1.1 - clusterPhaseLag) *
              1.5 *
              windIntensity;

            return (
              <g
                key={clusterIdx}
                style={{
                  transformOrigin: "210px 260px",
                  transform: `translate(${clusterSwayX}px, 0px) rotate(${clusterWaveRot}deg)`,
                  transition: "transform 140ms ease-out",
                }}
              >
                {groupPetals.map((petal) => {
                  // Individual micro-flutter in 3D: perspective scaleX breathing + micro angle oscillation
                  const microPhase =
                    physicsState.gustWave *
                      petal.flutterSpeed *
                      (leafFlutter ? 1.6 : 0.4) +
                    petal.phase;
                  const flutterAngle = leafFlutter
                    ? Math.sin(microPhase) * (2.5 + windIntensity * 3.5)
                    : 0;
                  const flutterScaleX = leafFlutter
                    ? petal.scale * (0.78 + 0.12 * Math.cos(microPhase * 1.2))
                    : petal.scale * 0.8;
                  const finalAngle = petal.angle + flutterAngle;

                  return (
                    <g
                      key={petal.id}
                      transform={`translate(${petal.x} ${petal.y}) rotate(${finalAngle}) scale(${flutterScaleX} ${petal.scale})`}
                    >
                      {/* Master petal body */}
                      <use
                        href={`#${id}-master-petal`}
                        fill={petal.themedColor}
                        fillOpacity={0.72}
                        stroke={petal.themedColor}
                        strokeOpacity={0.28}
                        strokeWidth="0.8"
                        style={{
                          transition: "fill 600ms ease, stroke 600ms ease",
                        }}
                      />

                      {/* Delicate internal leaf vein highlight for organic detail */}
                      <path
                        d="M0 16 Q1 -3 0 -15"
                        fill="none"
                        stroke="rgba(255,255,255,0.4)"
                        strokeWidth="0.75"
                        strokeLinecap="round"
                        opacity={0.65}
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}
        </g>

        <g aria-hidden="true" pointerEvents="none">
          {FLYING_LEAVES.map((leaf) => (
            <g
              key={`${leaf.x}-${leaf.y}`}
              className="enhanced-tree-flying-leaf"
              style={{ animationDelay: leaf.delay }}
            >
              <g
                transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle}) scale(${leaf.scale})`}
              >
                <use
                  href={`#${id}-master-petal`}
                  fill={leaf.color}
                  fillOpacity="0.9"
                  stroke={leaf.color}
                  strokeOpacity="0.35"
                  strokeWidth="0.8"
                />
                <path
                  d="M0 16 Q1 -3 0 -15"
                  fill="none"
                  stroke="rgba(255,255,255,0.45)"
                  strokeWidth="0.75"
                  strokeLinecap="round"
                />
              </g>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
