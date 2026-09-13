import { useRef, useEffect, useState, useCallback } from "react";
import type { ParticleData, AudioStatus } from "../types";
import { getParticleColor } from "../utils/particle-colors";

const PARTICLES_PER_INTENSITY = 30;
const MAX_PARTICLES = 300;
const BROWNIAN_STRENGTH = 0.6;
const DAMPING = 0.985;
const DRIFT_SPEED = 0.02;
const LERP_FACTOR = 0.95;
const CANVAS_DPR_MAX = 2;

function lerp(current: number, target: number, factor: number): number {
  return current + (target - current) * factor;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function useIntensityCanvas(
  containerRef: React.RefObject<HTMLDivElement | null>,
  targetIntensity: number,
  onAudioStatus: (status: AudioStatus) => void,
): {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  frameCount: number;
} {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<ParticleData[]>([]);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const intensityRef = useRef(targetIntensity);
  const [frameCount, setFrameCount] = useState(0);

  // Keep ref in sync whenever target changes
  useEffect(() => {
    intensityRef.current = targetIntensity;
  }, [targetIntensity]);

  // Audio context for ambient tone
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  // Initialize audio
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const ctx = new AudioContext();
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(ctx.destination);

      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 220;
      osc.connect(gain);
      osc.start();

      audioCtxRef.current = ctx;
      gainNodeRef.current = gain;
      oscillatorRef.current = osc;
      onAudioStatus({ available: true, error: null });
    } catch {
      onAudioStatus({ available: false, error: "Áudio não disponível" });
    }
    return () => {
      audioCtxRef.current?.close();
    };
  }, []);

  // Update audio parameters based on intensity
  useEffect(() => {
    if (!audioCtxRef.current || !gainNodeRef.current || !oscillatorRef.current)
      return;
    const ctx = audioCtxRef.current;
    const gain = gainNodeRef.current;
    const osc = oscillatorRef.current;

    const normalizedIntensity = intensityRef.current / 10;
    const volume = Math.max(0, normalizedIntensity * 0.08);
    const frequency = 180 + normalizedIntensity * 140;

    gain.gain.setTargetAtTime(volume, ctx.currentTime, 0.1);
    osc.frequency.setTargetAtTime(frequency, ctx.currentTime, 0.1);
  }, [targetIntensity]);

  // Canvas resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect() ?? {
        width: 320,
        height: 200,
      };
      const dpr = Math.min(window.devicePixelRatio ?? 1, CANVAS_DPR_MAX);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Initialize particles
  useEffect(() => {
    const count = Math.floor(targetIntensity * PARTICLES_PER_INTENSITY);
    const rand = seededRandom(Date.now() & 0xffff);
    const list: ParticleData[] = [];

    for (let i = 0; i < Math.min(count, MAX_PARTICLES); i++) {
      list.push({
        x: rand() * 200 - 100,
        y: rand() * 200 - 100,
        vx: (rand() - 0.5) * BROWNIAN_STRENGTH,
        vy: (rand() - 0.5) * BROWNIAN_STRENGTH,
        baseRadius: 2 + rand() * 3,
        currentAlpha: 0.15 + rand() * 0.3,
        hueShift: rand() * 0.2 - 0.1,
        lifeOffset: rand() * Math.PI * 2,
      });
    }

    particlesRef.current = list;
  }, [targetIntensity]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const animate = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      timeRef.current += 1;
      const t = timeRef.current;

      // Smooth intensity interpolation
      intensityRef.current = lerp(
        intensityRef.current,
        targetIntensity,
        1 - LERP_FACTOR,
      );
      const currentIntensity = intensityRef.current;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Center point in canvas coords
      const cx = w / 2;
      const cy = h / 2;

      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Brownian motion
        p.vx += (Math.random() - 0.5) * BROWNIAN_STRENGTH;
        p.vy += (Math.random() - 0.5) * BROWNIAN_STRENGTH;

        // Drift toward center with orbital tendency
        const dx = cx - p.x;
        const dy = cy - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        const attraction = DRIFT_SPEED * (1 - currentIntensity / 15);
        p.vx += (dx / dist) * attraction;
        p.vy += (dy / dist) * attraction;

        // Orbital component (perpendicular to radial)
        const orbitStrength = currentIntensity * 0.003;
        p.vx += (-dy / dist) * orbitStrength * (i % 2 === 0 ? 1 : -1);
        p.vy += (dx / dist) * orbitStrength * (i % 2 === 0 ? 1 : -1);

        // Damping
        p.vx *= DAMPING;
        p.vy *= DAMPING;

        // Speed cap based on intensity
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const maxSpeed = 1 + currentIntensity * 0.5;
        if (speed > maxSpeed) {
          p.vx = (p.vx / speed) * maxSpeed;
          p.vy = (p.vy / speed) * maxSpeed;
        }

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Breathing alpha
        const breathe = Math.sin(t * 0.03 + p.lifeOffset) * 0.1;
        const alpha = p.currentAlpha + breathe + (currentIntensity / 10) * 0.2;

        // Color based on current intensity
        const color = getParticleColor(
          currentIntensity + p.hueShift * 10,
          Math.min(Math.max(alpha, 0.05), 0.8),
        );

        const radius = p.baseRadius * (1 + (currentIntensity / 10) * 0.5);

        ctx.beginPath();
        ctx.arc(p.x + cx, p.y + cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Glow effect for high-intensity particles
        if (currentIntensity >= 6 && i % 3 === 0) {
          ctx.beginPath();
          ctx.arc(p.x + cx, p.y + cy, radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = getParticleColor(currentIntensity, 0.03);
          ctx.fill();
        }
      }

      setFrameCount((c) => c + 1);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return { canvasRef, frameCount };
}
