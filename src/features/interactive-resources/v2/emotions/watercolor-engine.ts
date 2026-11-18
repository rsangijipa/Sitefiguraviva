/** Motor das aquarelas vivas (portado de aquarelas_interativas.html): pigmentos que giram, respiram, crescem e se arrastam. */
export const SCENE_W = 1396;
export const SCENE_H = 1127;
export const BLOBS = [
  { slug: "verde-petroleo", name: "Verde-petróleo", color: "#00786f", x: 430.5, y: 243, w: 547, h: 440 },
  { slug: "verde-folha", name: "Verde-folha", color: "#4a8d28", x: 946, y: 240, w: 566, h: 480 },
  { slug: "terracota", name: "Terracota", color: "#bd6d2d", x: 213, y: 608, w: 426, h: 502 },
  { slug: "coral", name: "Coral", color: "#f35e78", x: 1150, y: 605, w: 492, h: 464 },
  { slug: "areia", name: "Areia", color: "#dcb88c", x: 399.5, y: 942, w: 553, h: 370 },
  { slug: "amarelo", name: "Amarelo", color: "#facd29", x: 918, y: 944, w: 520, h: 366 },
] as const;
export const blobSrc = (slug: string) => `/brand/recursos/emocoes/aquarelas/${slug}.webp`;

interface Blob {
  x: number; y: number; w: number; h: number; scale: number; angle: number; pigment: number; coverage: number; speed: number; phase: number;
  targetScale: number; targetPigment: number; image: HTMLImageElement; ready: boolean; cache: { key: number; canvas: HTMLCanvasElement | null };
}
export interface Shape { x: number; y: number; angle: number; scale: number }
export interface WatercolorOptions { motion: boolean }
export interface WatercolorHandle {
  /** Define, por pigmento, a soma de intensidades escolhidas; o pigmento cresce e escurece. */
  setWeights(weights: number[]): void;
  setMotion(motion: boolean): void;
  /** Posição (px CSS) do centro de um pigmento, para ancorar cartões flutuantes. */
  anchor(index: number): { x: number; y: number; scale: number } | null;
  dispose(): void;
}
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

export function createWatercolor(canvas: HTMLCanvasElement, options: WatercolorOptions, onFrame: () => void): WatercolorHandle {
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) throw new Error("canvas-2d-indisponivel");
  const blobs: Blob[] = BLOBS.map((b, i) => ({
    x: b.x, y: b.y, w: b.w, h: b.h, scale: 1, angle: 0, pigment: 100, coverage: 100, speed: 5, phase: i * 1.13, targetScale: 1, targetPigment: 78,
    image: new Image(), ready: false, cache: { key: -1, canvas: null },
  }));
  const homes = BLOBS.map(b => ({ x: b.x, y: b.y }));
  let motion = options.motion, elapsed = 0, last = performance.now(), frame = 0, running = true, drag: { index: number; last: { x: number; y: number } } | null = null;
  let cw = 1, ch = 1, dpr = 1;

  blobs.forEach((b, i) => { b.image.onload = () => { b.ready = true; if (!motion) render(); }; b.image.src = blobSrc(BLOBS[i].slug); });

  const metrics = () => {
    const k = Math.min(cw / SCENE_W, ch / SCENE_H) * 1.08;
    return { k, sx: Math.max(1, (cw / SCENE_W / k) * 0.94), sy: Math.max(1, (ch / SCENE_H / k) * 0.94) };
  };
  const toScreen = (x: number, y: number) => { const m = metrics(); return { x: cw / 2 + (x - SCENE_W / 2) * m.k * m.sx, y: ch / 2 + (y - SCENE_H / 2) * m.k * m.sy }; };
  const toScene = (x: number, y: number) => { const m = metrics(); return { x: (x - cw / 2) / (m.k * m.sx) + SCENE_W / 2, y: (y - ch / 2) / (m.k * m.sy) + SCENE_H / 2 }; };

  const shape = (b: Blob, t: number): Shape => {
    const spin = motion ? (t * b.speed * Math.PI) / 180 : 0;
    const breathe = 1 + (motion ? 0.052 * Math.sin(t * 1.28 + b.phase) : 0);
    return { x: b.x, y: b.y, angle: b.angle + spin, scale: b.scale * breathe };
  };
  const layer = (b: Blob, amount: number) => {
    if (amount >= 99.7) return b.image;
    const key = Math.round(amount / 2) * 2;
    if (b.cache.key === key && b.cache.canvas) return b.cache.canvas;
    const surface = b.cache.canvas ?? document.createElement("canvas");
    surface.width = b.w; surface.height = b.h;
    const g = surface.getContext("2d"); if (!g) return b.image;
    g.clearRect(0, 0, b.w, b.h); g.drawImage(b.image, 0, 0, b.w, b.h); g.globalCompositeOperation = "destination-in";
    const fraction = clamp(key / 100, 0.05, 1), r = Math.hypot(b.w, b.h) * 0.61 * Math.pow(fraction, 0.72), soft = Math.max(11, Math.min(b.w, b.h) * 0.065);
    const gradient = g.createRadialGradient(b.w * 0.48, b.h * 0.48, Math.max(0, r - soft), b.w * 0.48, b.h * 0.48, r + soft);
    gradient.addColorStop(0, "rgba(0,0,0,1)"); gradient.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gradient; g.fillRect(0, 0, b.w, b.h); g.globalCompositeOperation = "source-over";
    b.cache = { key, canvas: surface }; return surface;
  };
  function render() {
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0); ctx!.clearRect(0, 0, cw, ch);
    const m = metrics();
    for (const b of blobs) {
      if (!b.ready) continue;
      const s = shape(b, elapsed), p = toScreen(s.x, s.y);
      let amount = b.coverage;
      if (motion) amount = clamp(amount - (0.5 + 0.5 * Math.sin(elapsed * 0.85 + b.phase)) * 14, 8, 100);
      ctx!.save(); ctx!.translate(p.x, p.y); ctx!.rotate(s.angle); ctx!.scale(s.scale * m.k, s.scale * m.k);
      ctx!.globalAlpha = clamp(0.12 + 0.88 * (b.pigment / 100), 0, 1);
      ctx!.drawImage(layer(b, amount), -b.w / 2, -b.h / 2, b.w, b.h); ctx!.restore();
    }
    onFrame();
  }
  const tick = (now: number) => {
    if (!running) return;
    frame = requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, 0.1); last = now;
    if (document.hidden) return;
    if (motion) elapsed += dt;
    for (const b of blobs) { b.scale += (b.targetScale - b.scale) * Math.min(1, dt * 2.2); b.pigment += (b.targetPigment - b.pigment) * Math.min(1, dt * 2.2); }
    render();
  };
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    cw = Math.max(1, rect.width); ch = Math.max(1, rect.height); dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr); render();
  };
  const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
  observer?.observe(canvas); resize();

  const point = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); return toScene(e.clientX - r.left, e.clientY - r.top); };
  const hit = (p: { x: number; y: number }) => {
    for (let i = blobs.length - 1; i >= 0; i--) {
      const b = blobs[i]; if (!b.ready) continue;
      const s = shape(b, elapsed), dx = p.x - s.x, dy = p.y - s.y, cr = Math.cos(-s.angle), sr = Math.sin(-s.angle);
      const ex = (dx * cr - dy * sr) / (b.w * 0.5 * s.scale), ey = (dx * sr + dy * cr) / (b.h * 0.5 * s.scale);
      if (ex * ex + ey * ey < 0.9) return i;
    }
    return -1;
  };
  const down = (e: PointerEvent) => { if (e.button !== 0) return; const p = point(e), index = hit(p); if (index < 0) return; drag = { index, last: p }; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = "grabbing"; };
  const move = (e: PointerEvent) => {
    const p = point(e);
    if (!drag) { canvas.style.cursor = hit(p) >= 0 ? "grab" : "default"; return; }
    const b = blobs[drag.index]; b.x += p.x - drag.last.x; b.y += p.y - drag.last.y; drag.last = p; if (!motion) render();
  };
  const up = () => { drag = null; canvas.style.cursor = "default"; };
  canvas.addEventListener("pointerdown", down); canvas.addEventListener("pointermove", move); canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up);
  frame = requestAnimationFrame(tick);

  return {
    setWeights(weights) {
      blobs.forEach((b, i) => { const w = weights[i] ?? 0; b.targetScale = 1 + Math.min(0.55, w * 0.07); b.targetPigment = w ? Math.min(100, 82 + w * 4) : 78; });
      if (!motion) { for (const b of blobs) { b.scale = b.targetScale; b.pigment = b.targetPigment; } render(); }
    },
    setMotion(next) { motion = next; if (!next) { blobs.forEach((b, i) => { b.x = homes[i].x; b.y = homes[i].y; }); } render(); },
    anchor(index) { const b = blobs[index]; if (!b) return null; const s = shape(b, elapsed), p = toScreen(s.x, s.y); return { x: p.x, y: p.y, scale: s.scale * metrics().k }; },
    dispose() {
      running = false; cancelAnimationFrame(frame); observer?.disconnect();
      canvas.removeEventListener("pointerdown", down); canvas.removeEventListener("pointermove", move); canvas.removeEventListener("pointerup", up); canvas.removeEventListener("pointercancel", up);
      blobs.forEach(b => { b.cache.canvas = null; b.image.onload = null; });
    },
  };
}
