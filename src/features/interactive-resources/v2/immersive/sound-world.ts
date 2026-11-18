/** Camada viva dos ambientes sonoros: pássaros, insetos, água e chuva em profundidade, sobre a foto de fundo. */
export type WorldScene = "floresta" | "riacho" | "chuva";
export interface WorldHooks { onBird?(): void; onSplash?(): void }
export interface WorldHandle { setMotion(on: boolean): void; pointer(x: number, y: number): void; tap(x: number, y: number): void; dispose(): void }

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const TAU = Math.PI * 2;

interface Bird { x: number; y: number; vx: number; size: number; phase: number; z: number; wob: number }
interface Bug { x: number; y: number; kind: "vagalume" | "borboleta" | "libelula"; phase: number; speed: number; z: number; hue: number; cx: number; cy: number; r: number }
interface Leaf { x: number; y: number; vx: number; vy: number; rot: number; spin: number; size: number; z: number; hue: number }
interface Drop { x: number; y: number; len: number; speed: number; z: number }
interface Ring { x: number; y: number; age: number; max: number; z: number }
interface Fish { x: number; y: number; t: number; dur: number; dir: number; size: number }
interface Glass { x: number; y: number; r: number; vy: number; wait: number }

export function createWorld(canvas: HTMLCanvasElement, scene: WorldScene, motionOn: boolean, hooks: WorldHooks = {}): WorldHandle {
  const g = canvas.getContext("2d");
  if (!g) throw new Error("canvas-2d-indisponivel");
  let w = 1, h = 1, dpr = 1, t = 0, motion = motionOn, frame = 0, last = performance.now();
  let px = 0, py = 0, spx = 0, spy = 0; // ponteiro (−1..1) e versão suavizada
  const birds: Bird[] = [], bugs: Bug[] = [], leaves: Leaf[] = [], drops: Drop[] = [], rings: Ring[] = [], glass: Glass[] = [];
  let fish: Fish | null = null, nextBird = 2, nextFish = 6;

  const seed = () => {
    birds.length = bugs.length = leaves.length = drops.length = rings.length = glass.length = 0;
    if (scene === "floresta") {
      for (let i = 0; i < 16; i++) bugs.push({ x: rnd(0, w), y: rnd(h * 0.3, h * 0.95), kind: "vagalume", phase: rnd(0, TAU), speed: rnd(0.2, 0.6), z: rnd(0.2, 1), hue: 62, cx: rnd(0, w), cy: rnd(h * 0.3, h * 0.9), r: rnd(30, 120) });
      for (let i = 0; i < 4; i++) bugs.push({ x: rnd(0, w), y: rnd(h * 0.4, h * 0.85), kind: "borboleta", phase: rnd(0, TAU), speed: rnd(0.3, 0.5), z: rnd(0.4, 0.9), hue: [20, 330, 48, 200][i % 4], cx: rnd(0, w), cy: rnd(h * 0.45, h * 0.85), r: rnd(80, 200) });
      for (let i = 0; i < 26; i++) leaves.push({ x: rnd(0, w), y: rnd(-h, h), vx: rnd(-12, 14), vy: rnd(18, 42), rot: rnd(0, TAU), spin: rnd(-1.2, 1.2), size: rnd(7, 16), z: rnd(0.2, 1), hue: rnd(70, 110) });
    } else if (scene === "riacho") {
      for (let i = 0; i < 3; i++) bugs.push({ x: rnd(0, w), y: rnd(h * 0.25, h * 0.6), kind: "libelula", phase: rnd(0, TAU), speed: rnd(0.4, 0.8), z: rnd(0.5, 1), hue: 190, cx: rnd(0, w), cy: rnd(h * 0.3, h * 0.6), r: rnd(120, 260) });
      for (let i = 0; i < 10; i++) bugs.push({ x: rnd(0, w), y: rnd(h * 0.3, h * 0.9), kind: "vagalume", phase: rnd(0, TAU), speed: rnd(0.2, 0.5), z: rnd(0.2, 0.8), hue: 55, cx: rnd(0, w), cy: rnd(h * 0.3, h * 0.8), r: rnd(30, 90) });
      for (let i = 0; i < 12; i++) leaves.push({ x: rnd(0, w), y: rnd(h * 0.4, h * 0.95), vx: rnd(40, 90), vy: rnd(-4, 6), rot: rnd(0, TAU), spin: rnd(-0.6, 0.6), size: rnd(6, 11), z: rnd(0.3, 1), hue: rnd(60, 100) });
    } else {
      const n = Math.round(Math.min(260, (w * h) / 5500));
      for (let i = 0; i < n; i++) drops.push({ x: rnd(-60, w + 60), y: rnd(-h, h), len: rnd(10, 34), speed: rnd(520, 980), z: rnd(0.2, 1) });
      for (let i = 0; i < 9; i++) glass.push({ x: rnd(0, w), y: rnd(0, h), r: rnd(3, 8), vy: 0, wait: rnd(0, 8) });
    }
  };
  const resize = () => { const r = canvas.getBoundingClientRect(); w = Math.max(1, r.width); h = Math.max(1, r.height); dpr = Math.min(window.devicePixelRatio || 1, 1.6); canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); seed(); draw(0); };

  const sx = (x: number, z: number) => x + spx * (z - 0.4) * 46;
  const sy = (y: number, z: number) => y + spy * (z - 0.4) * 24;

  const bird = (b: Bird) => {
    const flap = Math.sin(b.phase) * 0.9, s = b.size * (0.55 + b.z * 0.6), x = sx(b.x, b.z), y = sy(b.y, b.z), d = Math.sign(b.vx) || 1;
    g!.save(); g!.translate(x, y); g!.scale(d, 1); g!.globalAlpha = 0.55 + b.z * 0.35; g!.fillStyle = scene === "riacho" ? "#3b3a30" : "#2d3a2a"; g!.strokeStyle = g!.fillStyle; g!.lineWidth = 2 * (0.6 + b.z * 0.5); g!.lineCap = "round";
    g!.beginPath(); g!.ellipse(0, 0, s * 0.55, s * 0.2, 0, 0, TAU); g!.fill(); g!.beginPath(); g!.arc(s * 0.5, -s * 0.04, s * 0.12, 0, TAU); g!.fill();
    for (const side of [-1, 1]) { g!.beginPath(); g!.moveTo(0, 0); g!.quadraticCurveTo(side * s * 0.35, -s * (0.5 + 0.4 * flap), side * s * 0.8, -s * (0.1 + 0.45 * flap)); g!.stroke(); }
    g!.restore();
  };
  const butterfly = (b: Bug) => {
    const s = 9 + b.z * 7, flap = Math.abs(Math.sin(t * 9 + b.phase)), x = sx(b.x, b.z), y = sy(b.y, b.z);
    g!.save(); g!.translate(x, y); g!.rotate(Math.sin(t * 1.3 + b.phase) * 0.4); g!.fillStyle = `hsla(${b.hue},80%,62%,.85)`;
    for (const side of [-1, 1]) { g!.beginPath(); g!.ellipse(side * s * 0.55 * flap, -s * 0.1, s * 0.6 * (0.25 + flap * 0.75), s * 0.85, side * 0.35, 0, TAU); g!.fill(); }
    g!.fillStyle = "#3b2a1a"; g!.fillRect(-1, -s * 0.5, 2, s); g!.restore();
  };
  const dragonfly = (b: Bug) => {
    const s = 16 + b.z * 10, x = sx(b.x, b.z), y = sy(b.y, b.z), flap = Math.sin(t * 40 + b.phase) * 0.4;
    g!.save(); g!.translate(x, y); g!.rotate(Math.sin(t * 0.8 + b.phase) * 0.6); g!.strokeStyle = "#1c6f7a"; g!.lineWidth = 2.2; g!.beginPath(); g!.moveTo(-s, 0); g!.lineTo(s * 0.5, 0); g!.stroke();
    g!.fillStyle = "rgba(190,235,245,.55)"; for (const [dx, sgn] of [[0.1, -1], [0.1, 1], [-0.25, -1], [-0.25, 1]] as const) { g!.beginPath(); g!.ellipse(s * dx, sgn * s * (0.35 + flap * 0.2), s * 0.5, s * 0.14, sgn * 0.3, 0, TAU); g!.fill(); }
    g!.restore();
  };
  const firefly = (b: Bug) => {
    const x = sx(b.x, b.z), y = sy(b.y, b.z), a = 0.25 + 0.75 * Math.max(0, Math.sin(t * 1.6 + b.phase)), r = 5 + b.z * 8, grad = g!.createRadialGradient(x, y, 0, x, y, r * 3);
    grad.addColorStop(0, `hsla(${b.hue},95%,70%,${a})`); grad.addColorStop(1, `hsla(${b.hue},95%,60%,0)`); g!.fillStyle = grad; g!.beginPath(); g!.arc(x, y, r * 3, 0, TAU); g!.fill();
  };

  function draw(dt: number) {
    g!.setTransform(dpr, 0, 0, dpr, 0, 0); g!.clearRect(0, 0, w, h);
    spx += (px - spx) * 0.06; spy += (py - spy) * 0.06;

    if (scene === "floresta") {
      // raios de luz que respiram
      g!.save(); g!.globalCompositeOperation = "screen";
      for (let i = 0; i < 5; i++) {
        const x0 = w * (0.18 + i * 0.12) + spx * 20 * (i % 2 ? 1 : -1), a = 0.06 + 0.07 * (0.5 + 0.5 * Math.sin(t * 0.5 + i * 1.4)), grad = g!.createLinearGradient(x0, 0, x0 + w * 0.22, h);
        grad.addColorStop(0, `rgba(255,244,190,${a})`); grad.addColorStop(1, "rgba(255,244,190,0)"); g!.fillStyle = grad; g!.beginPath(); g!.moveTo(x0, 0); g!.lineTo(x0 + w * 0.1, 0); g!.lineTo(x0 + w * 0.34, h); g!.lineTo(x0 + w * 0.12, h); g!.closePath(); g!.fill();
      }
      g!.restore();
    }
    if (scene === "riacho") {
      // água corrente: faixas de luz que deslizam em camadas
      const top = h * 0.34; g!.save(); g!.lineCap = "round";
      for (let i = 0; i < 26; i++) {
        const depth = i / 26, y0 = top + depth * (h - top) * 0.96, amp = 3 + depth * 9, speed = 24 + depth * 120, freq = 0.012 - depth * 0.006;
        g!.strokeStyle = `rgba(255,255,255,${0.1 + depth * 0.2})`; g!.lineWidth = 1 + depth * 2.4; g!.beginPath();
        const offset = (t * speed + i * 83) % (w + 220);
        for (let x = -40; x <= w + 40; x += 14) { const xx = ((x + offset) % (w + 220)) - 110, yy = y0 + Math.sin(xx * freq + i) * amp + Math.sin(x * 0.02 + t * 0.8 + i) * 1.5; if (x === -40) g!.moveTo(x, yy); else g!.lineTo(x, yy); }
        g!.stroke();
      }
      for (let i = 0; i < 30; i++) { const depth = hashf(i, 1), x = ((hashf(i, 2) * w + t * (50 + depth * 110)) % (w + 40)) - 20, y = top + depth * (h - top) * 0.95; g!.fillStyle = `rgba(255,255,255,${0.2 + 0.4 * Math.max(0, Math.sin(t * 2 + i))})`; g!.beginPath(); g!.ellipse(x, y, 6 + depth * 14, 1.5 + depth * 2, 0, 0, TAU); g!.fill(); }
      g!.restore();
    }

    // névoa suave e profundidade
    if (scene !== "chuva") for (let i = 0; i < 3; i++) { const x = ((t * (8 + i * 4) + i * w * 0.4) % (w * 1.6)) - w * 0.3, y = h * (0.72 + i * 0.1), grad = g!.createRadialGradient(x, y, 0, x, y, w * 0.4); grad.addColorStop(0, "rgba(255,255,255,.12)"); grad.addColorStop(1, "rgba(255,255,255,0)"); g!.fillStyle = grad; g!.fillRect(0, 0, w, h); }

    for (const b of bugs) {
      b.phase += dt; b.x += (Math.cos(t * b.speed + b.phase) * b.r * 0.4 - (b.x - b.cx) * 0.02) * dt * 2; b.y += (Math.sin(t * b.speed * 1.3 + b.phase) * b.r * 0.25 - (b.y - b.cy) * 0.02) * dt * 2;
      if (b.kind === "vagalume") firefly(b); else if (b.kind === "borboleta") butterfly(b); else dragonfly(b);
    }
    for (const l of leaves) {
      l.x += l.vx * dt * (0.4 + l.z); l.y += l.vy * dt * (0.4 + l.z); l.rot += l.spin * dt;
      if (scene === "floresta") { l.x += Math.sin(t + l.rot) * 10 * dt; if (l.y > h + 20) { l.y = -20; l.x = rnd(0, w); } if (l.x > w + 20) l.x = -20; if (l.x < -20) l.x = w + 20; }
      else { if (l.x > w + 20) { l.x = -20; l.y = rnd(h * 0.4, h * 0.95); } }
      const x = sx(l.x, l.z), y = sy(l.y, l.z), s = l.size * (0.6 + l.z * 0.7);
      g!.save(); g!.translate(x, y); g!.rotate(l.rot); g!.fillStyle = `hsla(${l.hue},55%,${scene === "riacho" ? 42 : 36}%,${0.55 + l.z * 0.35})`; g!.beginPath(); g!.moveTo(-s, 0); g!.quadraticCurveTo(0, -s * 0.8, s, 0); g!.quadraticCurveTo(0, s * 0.8, -s, 0); g!.fill(); g!.restore();
    }
    if (scene === "chuva") {
      g!.save(); g!.lineCap = "round";
      for (const d of drops) {
        d.y += d.speed * dt * (0.5 + d.z * 0.7); d.x -= 60 * dt * d.z; if (d.y > h) { d.y = rnd(-80, 0); d.x = rnd(-60, w + 60); if (d.z > 0.7 && d.y < 0 && Math.random() < 0.18) rings.push({ x: rnd(w * 0.05, w * 0.95), y: rnd(h * 0.62, h * 0.98), age: 0, max: rnd(1.1, 1.8), z: rnd(0.4, 1) }); }
        g!.strokeStyle = `rgba(235,248,250,${0.14 + d.z * 0.34})`; g!.lineWidth = 0.7 + d.z * 1.3; const x = sx(d.x, d.z), y = sy(d.y, d.z); g!.beginPath(); g!.moveTo(x, y); g!.lineTo(x + d.len * 0.12 * d.z, y - d.len * d.z); g!.stroke();
      }
      g!.restore();
      for (const q of glass) {
        if (q.wait > 0) { q.wait -= dt; if (q.wait <= 0) { q.vy = rnd(10, 40); } } else { q.y += q.vy * dt; q.vy *= 0.995; if (q.y > h + 10) { q.y = -10; q.x = rnd(0, w); q.wait = rnd(2, 9); q.vy = 0; } if (q.vy < 4) { q.wait = rnd(1, 6); q.vy = 0; } }
        const grad = g!.createRadialGradient(q.x - q.r * 0.3, q.y - q.r * 0.3, 0, q.x, q.y, q.r); grad.addColorStop(0, "rgba(255,255,255,.7)"); grad.addColorStop(1, "rgba(200,225,230,.12)"); g!.fillStyle = grad; g!.beginPath(); g!.ellipse(q.x, q.y, q.r * 0.85, q.r * 1.1, 0, 0, TAU); g!.fill();
      }
    }
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i]; r.age += dt; if (r.age > r.max) { rings.splice(i, 1); continue; }
      const p = r.age / r.max, rad = 6 + p * (50 + r.z * 60);
      for (let k = 0; k < 2; k++) { g!.strokeStyle = `rgba(255,255,255,${(1 - p) * 0.55})`; g!.lineWidth = 1.4; g!.beginPath(); g!.ellipse(r.x, r.y, rad * (1 - k * 0.4), rad * 0.28 * (1 - k * 0.4), 0, 0, TAU); g!.stroke(); }
    }
    for (const b of birds) { b.phase += dt * (9 + b.z * 4); b.x += b.vx * dt * (0.5 + b.z * 0.6); b.y += Math.sin(t * 1.6 + b.wob) * 14 * dt; bird(b); }
    for (let i = birds.length - 1; i >= 0; i--) if (birds[i].x < -150 || birds[i].x > w + 150) birds.splice(i, 1);
    if (fish) {
      fish.t += dt; const p = fish.t / fish.dur;
      if (p >= 1) { rings.push({ x: fish.x + fish.dir * 90, y: fish.y, age: 0, max: 1.6, z: 1 }); fish = null; hooks.onSplash?.(); }
      else { const x = fish.x + fish.dir * p * 90, y = fish.y - Math.sin(p * Math.PI) * 70, ang = Math.atan2(-Math.cos(p * Math.PI) * 70 * Math.PI / 90, fish.dir) * fish.dir;
        g!.save(); g!.translate(x, y); g!.scale(fish.dir, 1); g!.rotate(-ang * 0.4); g!.fillStyle = "#c98a4b"; g!.beginPath(); g!.ellipse(0, 0, fish.size, fish.size * 0.38, 0, 0, TAU); g!.fill(); g!.beginPath(); g!.moveTo(-fish.size * 0.9, 0); g!.lineTo(-fish.size * 1.5, -fish.size * 0.4); g!.lineTo(-fish.size * 1.5, fish.size * 0.4); g!.closePath(); g!.fill(); g!.fillStyle = "#fff"; g!.beginPath(); g!.arc(fish.size * 0.55, -fish.size * 0.08, 2, 0, TAU); g!.fill(); g!.restore(); }
    }
  }
  const hashf = (i: number, k: number) => { const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return s - Math.floor(s); };

  const spawnBird = () => {
    const dir = Math.random() < 0.5 ? 1 : -1;
    birds.push({ x: dir > 0 ? -60 : w + 60, y: rnd(h * 0.12, h * 0.5), vx: dir * rnd(80, 150), size: rnd(26, 44), phase: rnd(0, TAU), z: rnd(0.3, 1), wob: rnd(0, TAU) });
    hooks.onBird?.();
  };
  const spawnFish = () => { fish = { x: rnd(w * 0.25, w * 0.65), y: rnd(h * 0.55, h * 0.8), t: 0, dur: 0.9, dir: Math.random() < 0.5 ? 1 : -1, size: rnd(14, 20) }; };

  const tick = (now: number) => {
    frame = requestAnimationFrame(tick); const dt = Math.min(0.06, (now - last) / 1000); last = now; if (document.hidden) return;
    t += dt;
    if (scene !== "chuva") { nextBird -= dt; if (nextBird <= 0 && birds.length < 5) { spawnBird(); nextBird = rnd(3, 8); } }
    if (scene === "riacho" && !fish) { nextFish -= dt; if (nextFish <= 0) { spawnFish(); nextFish = rnd(8, 15); } }
    draw(dt);
  };
  const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null; observer?.observe(canvas); resize();
  if (motion) { frame = requestAnimationFrame(tick); }

  return {
    setMotion(on) { motion = on; cancelAnimationFrame(frame); if (on) { last = performance.now(); frame = requestAnimationFrame(tick); } else { g!.setTransform(dpr, 0, 0, dpr, 0, 0); g!.clearRect(0, 0, w, h); } },
    pointer(x, y) { px = x; py = y; },
    tap(x, y) {
      if (!motion) return;
      if (scene === "chuva" || scene === "riacho") rings.push({ x, y, age: 0, max: 1.6, z: 1 });
      else { for (let i = 0; i < 6; i++) leaves.push({ x: x + rnd(-20, 20), y: y + rnd(-20, 20), vx: rnd(-40, 40), vy: rnd(10, 40), rot: rnd(0, TAU), spin: rnd(-3, 3), size: rnd(7, 12), z: rnd(0.5, 1), hue: rnd(60, 110) }); if (leaves.length > 70) leaves.splice(0, leaves.length - 70); }
      if (scene !== "chuva" && birds.length < 6) { spawnBird(); }
    },
    dispose() { cancelAnimationFrame(frame); observer?.disconnect(); },
  };
}
