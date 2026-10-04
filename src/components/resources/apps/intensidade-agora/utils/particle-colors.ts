const primaryR = 0;
const primaryG = 90;
const primaryB = 31;

const terraR = 150;
const terraG = 85;
const terraB = 31;

const mutedR = 107;
const mutedG = 107;
const mutedB = 99;

export function getParticleColor(intensity: number, alpha: number): string {
  if (intensity <= 4) {
    const t = intensity / 4;
    const r = Math.round(mutedR + (primaryR - mutedR) * t);
    const g = Math.round(mutedG + (primaryG - mutedG) * t);
    const b = Math.round(mutedB + (primaryB - mutedB) * t);
    return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
  }
  if (intensity <= 7) {
    const t = (intensity - 4) / 3;
    const r = Math.round(primaryR + (terraR - primaryR) * t);
    const g = Math.round(primaryG + (terraG - primaryG) * t);
    const b = Math.round(primaryB + (terraB - primaryB) * t);
    return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
  }
  const t = (intensity - 7) / 3;
  const r = Math.round(terraR + Math.round((255 - terraR) * t * 0.15));
  const g = Math.round(terraG + Math.round(200 - terraG) * t * 0.15);
  const b = Math.round(terraB);
  return `rgba(${r},${g},${b},${Math.min(alpha + t * 0.15, 1).toFixed(3)})`;
}

export function getIndicatorColor(intensity: number): string {
  return getParticleColor(intensity, 1);
}

export function getIntensityLabel(value: number): string {
  if (value <= 1) return "quase imperceptível";
  if (value <= 3) return "suave";
  if (value <= 5) return "moderada";
  if (value <= 7) return "elevada";
  if (value <= 9) return "intensa";
  return "muito presente";
}
