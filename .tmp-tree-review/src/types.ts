export type PetalTuple = readonly [number, number, number, number, string];

export interface PetalData {
  id: number;
  x: number;
  y: number;
  angle: number;
  scale: number;
  color: string;
  cluster: number; // 0: left low, 1: left high, 2: apex, 3: right high, 4: right cascade, 5: center
  phase: number;
  flutterSpeed: number;
  depth: number; // 0 (back) to 1 (front)
}

export interface FloatingPetal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  scale: number;
  color: string;
  opacity: number;
  life: number;
  maxLife: number;
  wobblePhase: number;
  wobbleSpeed: number;
}

export interface AmbientParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  baseOpacity: number;
  color: string;
  pulseSpeed: number;
  pulseOffset: number;
}

export type TreeTheme = "figura-viva" | "primavera" | "aurora" | "outono";

export type TimeOfDay = "tarde" | "crepusculo" | "alvorada";

export interface TreeSettings {
  windIntensity: number; // 0 (calm) to 2 (strong)
  windDirection: number; // -1 (left) to 1 (right)
  theme: TreeTheme;
  timeOfDay: TimeOfDay;
  particlesEnabled: boolean;
  interactiveWind: boolean;
  audioEnabled: boolean;
  leafFlutter: boolean;
}
