import React, { useEffect, useRef } from "react";
import { FloatingPetal, AmbientParticle, TreeTheme, TimeOfDay } from "../types";
import { RAW_PETALS, getThemedColor } from "../data/treeData";

interface FloatingCanvasProps {
  theme: TreeTheme;
  timeOfDay: TimeOfDay;
  windSpeed: number; // e.g. 0.5 to 2.5
  windDirection: number; // -1 to 1
  enabled: boolean;
  onCanvasReady?: (triggerBurst: (x: number, y: number) => void) => void;
}

export default function FloatingCanvas({
  theme,
  timeOfDay,
  windSpeed,
  windDirection,
  enabled,
  onCanvasReady,
}: FloatingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const petalsRef = useRef<FloatingPetal[]>([]);
  const particlesRef = useRef<AmbientParticle[]>([]);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });
  const themeRef = useRef(theme);
  const timeOfDayRef = useRef(timeOfDay);
  const windSpeedRef = useRef(windSpeed);
  const windDirectionRef = useRef(windDirection);

  themeRef.current = theme;
  timeOfDayRef.current = timeOfDay;
  windSpeedRef.current = windSpeed;
  windDirectionRef.current = windDirection;

  // Helper to pick random petal color from tree data
  const getRandomCanopyColor = () => {
    const randomLeaf =
      RAW_PETALS[Math.floor(Math.random() * RAW_PETALS.length)];
    return getThemedColor(randomLeaf[4], themeRef.current);
  };

  const createPetal = (
    originX?: number,
    originY?: number,
    isBurst = false,
  ): FloatingPetal => {
    const canvas = canvasRef.current;
    const w = canvas?.width || 800;
    const h = canvas?.height || 900;

    // Position: either from specified origin, or near the tree canopy (center top)
    const startX = originX ?? w * 0.35 + Math.random() * (w * 0.3);
    const startY = originY ?? h * 0.15 + Math.random() * (h * 0.35);

    const color = getRandomCanopyColor();
    const scale = isBurst
      ? 0.7 + Math.random() * 0.8
      : 0.5 + Math.random() * 0.6;
    const maxLife = isBurst
      ? 220 + Math.random() * 140
      : 350 + Math.random() * 200;

    return {
      x: startX,
      y: startY,
      vx: isBurst
        ? (Math.random() - 0.5) * 4 + windDirectionRef.current * 2
        : (Math.random() - 0.2) * 1.2,
      vy: isBurst ? -Math.random() * 3 - 0.5 : 0.6 + Math.random() * 0.9,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.04,
      scale,
      color,
      opacity: 0.85,
      life: 0,
      maxLife,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.025 + Math.random() * 0.035,
    };
  };

  const spawnBurst = (x: number, y: number) => {
    const burstCount = 14 + Math.floor(Math.random() * 8);
    for (let i = 0; i < burstCount; i++) {
      petalsRef.current.push(createPetal(x, y, true));
    }
  };

  useEffect(() => {
    if (onCanvasReady) {
      onCanvasReady(spawnBurst);
    }
  }, [onCanvasReady]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Initialize ambient pollen spores / fireflies
    const particleCount = timeOfDayRef.current === "crepusculo" ? 36 : 24;
    const particles: AmbientParticle[] = [];
    const parentWidth = canvas.clientWidth || 800;
    const parentHeight = canvas.clientHeight || 900;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * parentWidth,
        y: Math.random() * parentHeight,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.2 - Math.random() * 0.35,
        size: 1.2 + Math.random() * 2.2,
        opacity: 0.3 + Math.random() * 0.4,
        baseOpacity: 0.3 + Math.random() * 0.4,
        color: timeOfDayRef.current === "crepusculo" ? "#e0b0ff" : "#f6d365",
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }
    particlesRef.current = particles;

    // Seed initial floating petals
    petalsRef.current = Array.from({ length: 8 }, () => createPetal());

    let frame = 0;

    const render = () => {
      frame++;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      ctx.clearRect(0, 0, w, h);

      if (enabled) {
        // Naturally detach new petals periodically based on wind
        const spawnInterval = Math.max(
          25,
          Math.floor(90 / (windSpeedRef.current || 1)),
        );
        if (frame % spawnInterval === 0 && petalsRef.current.length < 32) {
          petalsRef.current.push(createPetal());
        }

        // Render & update ambient glowing spores
        const pColor =
          timeOfDayRef.current === "crepusculo"
            ? "rgba(224, 180, 255,"
            : "rgba(246, 211, 101,";

        particlesRef.current.forEach((p) => {
          p.x += p.vx + windDirectionRef.current * 0.25 * windSpeedRef.current;
          p.y += p.vy;
          p.pulseOffset += p.pulseSpeed;

          // Mouse avoidance
          if (mouseRef.current.active) {
            const dx = p.x - mouseRef.current.x;
            const dy = p.y - mouseRef.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80 && dist > 0) {
              p.x += (dx / dist) * 1.5;
              p.y += (dy / dist) * 1.5;
            }
          }

          if (p.y < -10) p.y = h + 10;
          if (p.x < -10) p.x = w + 10;
          if (p.x > w + 10) p.x = -10;

          const dynamicAlpha =
            p.baseOpacity * (0.6 + 0.4 * Math.sin(p.pulseOffset));

          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `${pColor}${dynamicAlpha})`;
          ctx.shadowColor =
            timeOfDayRef.current === "crepusculo" ? "#c084fc" : "#fef08a";
          ctx.shadowBlur = p.size * 3;
          ctx.fill();
          ctx.restore();
        });

        // Render & update floating botanical petals
        for (let i = petalsRef.current.length - 1; i >= 0; i--) {
          const petal = petalsRef.current[i];
          petal.life++;

          // Aerodynamic drifting physics
          petal.wobblePhase += petal.wobbleSpeed;
          const wobble = Math.sin(petal.wobblePhase);

          // Horizontal drift is wind + aerodynamic lift oscillation
          const windPush =
            windDirectionRef.current * windSpeedRef.current * 1.2;
          petal.x += petal.vx + wobble * 0.8 + windPush;
          petal.y += petal.vy + Math.cos(petal.wobblePhase * 0.8) * 0.3;
          petal.rotation += petal.vRot + wobble * 0.015;

          // Cursor wind wave interaction
          if (mouseRef.current.active) {
            const dx = petal.x - mouseRef.current.x;
            const dy = petal.y - mouseRef.current.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 90 && dist > 0) {
              const force = (1 - dist / 90) * 3;
              petal.vx += (dx / dist) * force * 0.4;
              petal.vy += (dy / dist) * force * 0.4;
            }
          }

          // Gentle drag damping
          petal.vx *= 0.98;

          // Fade out at life end or bottom boundary
          const progress = petal.life / petal.maxLife;
          const alpha =
            progress > 0.8
              ? ((1 - progress) / 0.2) * petal.opacity
              : petal.opacity;

          // Draw organic petal using SVG teardrop curvature
          ctx.save();
          ctx.translate(petal.x, petal.y);
          ctx.rotate(petal.rotation);

          // 3D pitch/roll fluttering effect
          const scaleX =
            petal.scale * (0.55 + 0.45 * Math.cos(petal.wobblePhase * 1.4));
          const scaleY = petal.scale;
          ctx.scale(scaleX, scaleY);

          ctx.beginPath();
          // Precise mathematical teardrop/petal contour
          ctx.moveTo(0, 18);
          ctx.bezierCurveTo(-12, 8, -16, -6, -8, -16);
          ctx.bezierCurveTo(-2, -22, 6, -20, 10, -13);
          ctx.bezierCurveTo(17, 0, 7, 12, 0, 18);
          ctx.closePath();

          ctx.fillStyle = petal.color;
          ctx.globalAlpha = Math.max(0, alpha * 0.8);
          ctx.shadowColor = "rgba(0,0,0,0.06)";
          ctx.shadowBlur = 4;
          ctx.shadowOffsetY = 2;
          ctx.fill();

          // Subtle central delicate leaf vein highlight
          ctx.beginPath();
          ctx.moveTo(0, 14);
          ctx.quadraticCurveTo(1, -2, 0, -14);
          ctx.strokeStyle = "rgba(255,255,255,0.35)";
          ctx.lineWidth = 0.8;
          ctx.stroke();

          ctx.restore();

          if (
            petal.life >= petal.maxLife ||
            petal.y > h + 40 ||
            petal.x < -60 ||
            petal.x > w + 60
          ) {
            petalsRef.current.splice(i, 1);
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      mouseRef.current = {
        x: clientX - rect.left,
        y: clientY - rect.top,
        active: true,
      };
    };

    const handlePointerLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    window.addEventListener("mouseleave", handlePointerLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, [enabled]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
}
