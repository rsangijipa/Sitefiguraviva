"use client";
import { useRef } from "react";
import { useIntensityCanvas } from "../hooks/use-intensity-canvas";
import type { AudioStatus } from "../types";

interface ParticleFieldProps {
  targetIntensity: number;
  onAudioStatus: (status: AudioStatus) => void;
}

export function ParticleField({
  targetIntensity,
  onAudioStatus,
}: ParticleFieldProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { canvasRef } = useIntensityCanvas(
    containerRef,
    targetIntensity,
    onAudioStatus,
  );

  return (
    <div
      ref={containerRef}
      className="relative h-48 w-full overflow-hidden sm:h-64 md:h-72"
      role="img"
      aria-label={`Campo de partículas com intensidade ${Math.round(targetIntensity).toString()}`}
    >
      {/* Subtle radial gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-paper/30 to-paper" />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ background: "transparent" }}
      />
    </div>
  );
}
