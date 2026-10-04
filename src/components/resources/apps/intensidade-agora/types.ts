export interface ParticleData {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  currentAlpha: number;
  hueShift: number;
  lifeOffset: number;
}

export interface ObservationRecord {
  id: string;
  intensity: number;
  label: string;
  bodySensation: string;
  need: string;
  timestamp: number;
}

export interface AudioStatus {
  available: boolean;
  error: string | null;
}
