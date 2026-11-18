"use client";
import { useEffect, useRef, useState } from "react";

type Mode = "cor" | "forma" | "textura" | "espaco";
const MODES: { id: Mode; label: string; prompt: string }[] = [
  { id: "cor", label: "Uma cor", prompt: "Escolha uma cor e procure por ela no lugar em que você está. Deixe o olhar pousar onde ela aparecer." },
  { id: "forma", label: "Uma forma", prompt: "Acompanhe a forma que muda devagar. Depois, procure formas parecidas ao seu redor: círculos, linhas, cantos." },
  { id: "textura", label: "Uma textura", prompt: "Veja o movimento fino, como grãos ou fios. Imagine tocar algo com essa textura: macio, áspero, liso?" },
  { id: "espaco", label: "O espaço", prompt: "Perceba as camadas de perto e de longe. Onde seu olhar encontra mais amplitude no ambiente?" },
];
const COLORS = [{ name: "Verde-petróleo", hex: "#00786f" }, { name: "Verde-folha", hex: "#4a8d28" }, { name: "Terracota", hex: "#bd6d2d" }, { name: "Coral", hex: "#f35e78" }, { name: "Areia", hex: "#dcb88c" }, { name: "Amarelo", hex: "#facd29" }, { name: "Azul", hex: "#3d78b5" }, { name: "Lilás", hex: "#8a6cb8" }];

const hash = (x: number, y: number) => { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const smooth = (t: number) => t * t * (3 - 2 * t);
function noise(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = smooth(x - xi), yf = smooth(y - yi);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
}
const rgb = (hex: string) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
const mix = (hex: string, to: number[], t: number) => { const [r, g, b] = rgb(hex); return `rgb(${Math.round(r + (to[0] - r) * t)},${Math.round(g + (to[1] - g) * t)},${Math.round(b + (to[2] - b) * t)})`; };
const CREAM = [253, 248, 238];

type Draw = (g: CanvasRenderingContext2D, w: number, h: number, t: number, color: string) => void;
const DRAW: Record<Mode, Draw> = {
  cor(g, w, h, t, color) {
    g.fillStyle = mix(color, CREAM, 0.88); g.fillRect(0, 0, w, h);
    const [r, gr, b] = rgb(color);
    for (let i = 0; i < 6; i++) {
      const x = w * (0.5 + 0.36 * Math.sin(t * 0.07 + i * 1.7)), y = h * (0.5 + 0.34 * Math.cos(t * 0.06 + i * 2.3)), radius = Math.min(w, h) * (0.32 + 0.1 * Math.sin(t * 0.11 + i));
      const grad = g.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, `rgba(${r},${gr},${b},${0.5 - i * 0.04})`); grad.addColorStop(1, `rgba(${r},${gr},${b},0)`);
      g.fillStyle = grad; g.fillRect(0, 0, w, h);
    }
  },
  forma(g, w, h, t, color) {
    g.fillStyle = mix(color, CREAM, 0.9); g.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, base = Math.min(w, h) * 0.34, sides = 3 + ((t * 0.05) % 4), n = Math.floor(sides), frac = sides - n;
    const radiusAt = (a: number, k: number) => { const seg = (2 * Math.PI) / k, m = ((a % seg) + seg) % seg; return Math.cos(Math.PI / k) / Math.cos(m - Math.PI / k); };
    for (let ring = 7; ring >= 0; ring--) {
      const scale = base * (0.35 + ring * 0.12), rot = t * 0.03 * (ring % 2 ? 1 : -1) + ring * 0.12;
      g.beginPath();
      for (let i = 0; i <= 120; i++) {
        const a = (i / 120) * Math.PI * 2, r1 = radiusAt(a - rot, n), r2 = radiusAt(a - rot, n + 1), r = (r1 + (r2 - r1) * smooth(frac)) * scale;
        const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.closePath(); g.fillStyle = mix(color, CREAM, 0.3 + ring * 0.09); g.globalAlpha = 0.5; g.fill(); g.globalAlpha = 0.9; g.strokeStyle = mix(color, [255, 255, 255], 0.5); g.lineWidth = 1.2; g.stroke(); g.globalAlpha = 1;
    }
  },
  textura(g, w, h, t, color) {
    g.fillStyle = mix(color, CREAM, 0.92); g.fillRect(0, 0, w, h);
    g.lineWidth = 1.1; const [r, gr, b] = rgb(color);
    for (let i = 0; i < 160; i++) {
      let x = hash(i, 11) * w, y = hash(i, 23) * h; g.beginPath(); g.moveTo(x, y);
      for (let s = 0; s < 34; s++) { const a = noise(x * 0.004 + t * 0.03, y * 0.004 + i * 0.01) * Math.PI * 4; x += Math.cos(a) * 6; y += Math.sin(a) * 6; g.lineTo(x, y); }
      g.strokeStyle = `rgba(${r},${gr},${b},${0.12 + hash(i, 5) * 0.28})`; g.stroke();
    }
  },
  espaco(g, w, h, t, color) {
    const sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, mix(color, CREAM, 0.86)); sky.addColorStop(1, mix(color, CREAM, 0.97)); g.fillStyle = sky; g.fillRect(0, 0, w, h);
    for (let layer = 0; layer < 6; layer++) {
      const depth = layer / 5, base = h * (0.5 + depth * 0.4), amp = h * (0.16 - depth * 0.08), shift = t * (3 + layer * 4);
      g.beginPath(); g.moveTo(0, h);
      for (let x = 0; x <= w; x += 8) g.lineTo(x, base - noise((x + shift) * 0.004 + layer * 9, layer) * amp - amp * 0.3);
      g.lineTo(w, h); g.closePath(); g.fillStyle = mix(color, CREAM, 0.78 - depth * 0.62); g.fill();
    }
    g.fillStyle = "rgba(255,255,255,.7)";
    for (let i = 0; i < 28; i++) { const x = (hash(i, 3) * w + t * (6 + hash(i, 4) * 10)) % w, y = h * (0.15 + hash(i, 9) * 0.6) + Math.sin(t * 0.4 + i) * 8; g.beginPath(); g.arc(x, y, 1 + hash(i, 6) * 2.2, 0, Math.PI * 2); g.fill(); }
  },
};

/** Observar: cenas generativas lentas (cor, forma, textura e espaço) para o olhar repousar; param com "reduzir movimento". */
export function ObservePractice({ paused, motion }: { paused: boolean; motion: boolean }) {
  const [mode, setMode] = useState<Mode>("cor");
  const [color, setColor] = useState(COLORS[0].hex);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    const element = canvas.current; const g = element?.getContext("2d");
    if (!element || !g) return;
    let frame = 0, last = performance.now(), t = 6, dpr = 1, w = 1, h = 1;
    const resize = () => { const r = element.getBoundingClientRect(); w = Math.max(1, r.width); h = Math.max(1, r.height); dpr = Math.min(window.devicePixelRatio || 1, 1.6); element.width = Math.round(w * dpr); element.height = Math.round(h * dpr); render(); };
    function render() { g!.setTransform(dpr, 0, 0, dpr, 0, 0); DRAW[mode](g!, w, h, t, color); }
    const tick = (now: number) => { frame = requestAnimationFrame(tick); const dt = Math.min(0.1, (now - last) / 1000); last = now; if (document.hidden || pausedRef.current) return; t += dt; render(); };
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null; observer?.observe(element); resize();
    if (motion) frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); observer?.disconnect(); };
  }, [mode, color, motion]);

  const current = MODES.find(item => item.id === mode)!;
  return <div className="ps-observe">
    <canvas ref={canvas} className="ps-observe-canvas" role="img" aria-label={`Cena para observar: ${current.label}`} />
    <p className="ps-prompt" role="status">{current.prompt}</p>
    <div className="ps-observe-bar">
      <div className="ps-modes" role="group" aria-label="O que observar">{MODES.map(item => <button type="button" className="fv-chip" key={item.id} aria-pressed={mode === item.id} onClick={() => setMode(item.id)}>{item.label}</button>)}</div>
      <div className="ps-swatches" role="group" aria-label="Cor da cena">{COLORS.map(item => <button type="button" key={item.hex} className="ps-swatch" style={{ background: item.hex }} aria-label={item.name} aria-pressed={color === item.hex} title={item.name} onClick={() => setColor(item.hex)} />)}</div>
    </div>
  </div>;
}
