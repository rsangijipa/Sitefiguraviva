"use client";
import { useEffect, useRef } from "react";

interface CircularIndicatorProps {
  value: number;
}

export function CircularIndicator({ value }: CircularIndicatorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High-DPI support
    const rect = canvas.parentElement?.getBoundingClientRect() ?? {
      width: 80,
      height: 80,
    };
    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    let t = 0;

    const animate = () => {
      t += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = (rect.width * dpr) / 2;
      const cy = (rect.height * dpr) / 2;
      const baseRadius = Math.min(cx, cy) * 0.6;

      // Breathing rate: slower at low intensity, faster at high
      const cycleTime = 6 - (value / 10) * 4; // 4s at 0 → 0s at 10
      const breath = Math.sin((t / cycleTime) * Math.PI * 2) * 0.5 + 0.5;

      // Ring thickness scales with intensity
      const strokeWidth = 1 + (value / 10) * 5;

      // Alpha based on value and breath
      const alpha = 0.15 + (value / 10) * 0.7 * breath;

      // Color
      const primaryR = 0;
      const primaryG = 90;
      const primaryB = 31;
      const terraR = 150;
      const terraG = 85;
      const terraB = 31;

      let r: number, g: number, b: number;
      if (value <= 5) {
        const v = value / 5;
        r = Math.round(primaryR);
        g = Math.round(primaryG * v + terraR * (1 - v) * 0.3);
        b = Math.round(primaryB);
      } else {
        const v = (value - 5) / 5;
        r = Math.round(terraR * v + primaryR * (1 - v));
        g = Math.round(terraG * v + primaryG * (1 - v));
        b = Math.round(terraB * v + primaryB * (1 - v));
      }

      // Outer ring (main indicator)
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
      ctx.lineWidth = strokeWidth * dpr;
      ctx.stroke();

      // Inner glow ring for higher intensities
      if (value >= 4) {
        const innerAlpha = ((value - 4) / 6) * 0.3 * breath;
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius * 0.75, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r},${g},${b},${innerAlpha.toFixed(3)})`;
        ctx.lineWidth = strokeWidth * 0.5 * dpr;
        ctx.stroke();
      }

      // Center dot
      const dotSize = (1 + (value / 10) * 3) * dpr;
      ctx.beginPath();
      ctx.arc(cx, cy, dotSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${(alpha * 0.8).toFixed(3)})`;
      ctx.fill();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [value]);

  return (
    <div className="relative flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20">
      <canvas ref={canvasRef} style={{ background: "transparent" }} />
    </div>
  );
}
