"use client";
import { useEffect, useRef, type MutableRefObject } from "react";

/** Pétala de lótus (ponta voltada para cima, origem no centro). */
const PETAL = "M0 0 C26 -34 30 -96 0 -132 C-30 -96 -26 -34 0 0Z";
const LAYERS = [
  { id: "a", count: 16, fill: "url(#bm-outer)", scale: 1, spin: 0.9, open: [0.6, 1.0], range: [0.62, 1.0] },
  { id: "b", count: 12, fill: "url(#bm-mid)", scale: 0.82, spin: -1.4, open: [0.55, 1.0], range: [0.58, 0.96] },
  { id: "c", count: 8, fill: "url(#bm-inner)", scale: 0.62, spin: 2.1, open: [0.5, 1.0], range: [0.54, 0.92] },
] as const;

/**
 * Mandala de lótus em camadas. O nível de respiração (0 = expirado, 1 = cheio) abre e fecha as pétalas,
 * muda o brilho central e o halo; cada camada gira devagar em sentido e ritmo próprios.
 */
export function BreathMandala({ level, motion }: { level: MutableRefObject<number>; motion: boolean }) {
  const layers = useRef<(SVGGElement | null)[]>([]);
  const core = useRef<SVGCircleElement | null>(null);
  const halo = useRef<SVGCircleElement | null>(null);
  const rays = useRef<SVGGElement | null>(null);

  useEffect(() => {
    let frame = 0, last = performance.now(), time = 0;
    const apply = () => {
      const l = level.current;
      LAYERS.forEach((layer, index) => {
        const element = layers.current[index]; if (!element) return;
        const s = (layer.range[0] + (layer.range[1] - layer.range[0]) * l) * layer.scale;
        element.style.transform = `rotate(${motion ? time * layer.spin : index * 11}deg) scale(${s})`;
        element.style.setProperty("--open", String(layer.open[0] + (layer.open[1] - layer.open[0]) * l));
      });
      if (core.current) { core.current.setAttribute("r", String(16 + l * 14)); core.current.style.opacity = String(0.55 + l * 0.45); }
      if (halo.current) { halo.current.setAttribute("r", String(150 + l * 38)); halo.current.style.opacity = String(0.14 + l * 0.2); }
      if (rays.current) rays.current.style.transform = `rotate(${motion ? time * 0.5 : 0}deg) scale(${0.8 + l * 0.35})`;
    };
    apply();
    if (!motion) return;
    const tick = (now: number) => { frame = requestAnimationFrame(tick); time += Math.min(0.1, (now - last) / 1000); last = now; apply(); };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [level, motion]);

  return <svg className="bm" viewBox="-200 -200 400 400" aria-hidden="true">
    <defs>
      <radialGradient id="bm-outer" cx="50%" cy="85%" r="95%"><stop offset="0" stopColor="#e8f3e4" stopOpacity=".95" /><stop offset=".55" stopColor="#9fd0b4" stopOpacity=".78" /><stop offset="1" stopColor="#3f8f6a" stopOpacity=".6" /></radialGradient>
      <radialGradient id="bm-mid" cx="50%" cy="85%" r="95%"><stop offset="0" stopColor="#fff3d6" stopOpacity=".96" /><stop offset=".6" stopColor="#f2c58f" stopOpacity=".84" /><stop offset="1" stopColor="#d98a5f" stopOpacity=".66" /></radialGradient>
      <radialGradient id="bm-inner" cx="50%" cy="85%" r="95%"><stop offset="0" stopColor="#fff0ee" stopOpacity=".98" /><stop offset=".6" stopColor="#f5b7c4" stopOpacity=".88" /><stop offset="1" stopColor="#d9708f" stopOpacity=".72" /></radialGradient>
      <radialGradient id="bm-core" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#fffbe6" /><stop offset=".55" stopColor="#facd29" stopOpacity=".92" /><stop offset="1" stopColor="#e49a2f" stopOpacity="0" /></radialGradient>
      <radialGradient id="bm-halo" cx="50%" cy="50%" r="50%"><stop offset=".6" stopColor="#5fb08a" stopOpacity="0" /><stop offset=".85" stopColor="#5fb08a" stopOpacity=".5" /><stop offset="1" stopColor="#5fb08a" stopOpacity="0" /></radialGradient>
      <filter id="bm-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation=".7" /><feDropShadow dx="0" dy="2" stdDeviation="2.4" floodColor="#1e4d36" floodOpacity=".28" /></filter>
      <filter id="bm-blur"><feGaussianBlur stdDeviation="6" /></filter>
    </defs>
    <circle ref={halo} r="160" fill="url(#bm-halo)" style={{ opacity: 0.2 }} />
    <g ref={rays} className="bm-rays" stroke="#bd6d2d" strokeOpacity=".35" strokeWidth="1" strokeLinecap="round">
      {Array.from({ length: 36 }, (_, i) => <line key={i} x1="0" y1="-158" x2="0" y2={i % 3 === 0 ? -184 : -172} transform={`rotate(${i * 10})`} />)}
    </g>
    {LAYERS.map((layer, index) => <g key={layer.id} ref={element => { layers.current[index] = element; }} className="bm-layer" filter="url(#bm-soft)">
      {Array.from({ length: layer.count }, (_, i) => <g key={i} className="bm-petal" style={{ ["--a" as string]: `${(360 / layer.count) * i}deg` }}>
        <path d={PETAL} fill={layer.fill} stroke="#ffffff" strokeOpacity=".55" strokeWidth=".8" />
        <path d="M0 -10 C4 -50 4 -90 0 -118" fill="none" stroke="#ffffff" strokeOpacity=".5" strokeWidth=".9" />
        <path d="M0 -6 C-9 -42 -11 -80 -4 -112 M0 -6 C9 -42 11 -80 4 -112" fill="none" stroke="#7a5a2e" strokeOpacity=".16" strokeWidth=".7" />
      </g>)}
    </g>)}
    <circle r="30" fill="url(#bm-core)" filter="url(#bm-blur)" opacity=".7" />
    <g fill="#bd6d2d" fillOpacity=".75">{Array.from({ length: 18 }, (_, i) => <circle key={i} cx={Math.cos((i / 18) * Math.PI * 2) * 22} cy={Math.sin((i / 18) * Math.PI * 2) * 22} r="1.8" />)}</g>
    <circle ref={core} r="22" fill="url(#bm-core)" />
  </svg>;
}
