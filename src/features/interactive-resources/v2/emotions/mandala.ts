/** Mandala única gerada a partir das emoções nomeadas e suas intensidades (determinística: mesmas escolhas, mesma mandala). */
export interface MandalaEmotion { id: string; title: string; intensity: number }

export const MANDALA_PALETTE = ["#00786f", "#4a8d28", "#bd6d2d", "#f35e78", "#dcb88c", "#facd29"] as const;
const INTENSITY_WORDS = ["", "bem leve", "leve", "presente", "forte", "muito forte"];

function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed: number) {
  let a = seed || 1;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export const mandalaColor = (emotion: MandalaEmotion) => MANDALA_PALETTE[hash(emotion.id + emotion.title) % MANDALA_PALETTE.length];
const f = (value: number) => Number(value.toFixed(2));
export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] as string);

function layer(emotion: MandalaEmotion, index: number, total: number): string {
  const seed = hash(emotion.id + emotion.title);
  const random = rng(seed);
  const color = MANDALA_PALETTE[seed % MANDALA_PALETTE.length];
  const kind = (seed >>> 3) % 5;
  const intensity = Math.min(5, Math.max(1, Math.round(emotion.intensity)));
  const count = 6 + intensity * 2;
  const ringStart = 250, ringEnd = 62;
  const radius = total === 1 ? 150 : ringStart - ((ringStart - ringEnd) * index) / (total - 1);
  const size = 22 + intensity * 12 + random() * 8;
  const speed = (index % 2 ? -1 : 1) * (60 + index * 17 + random() * 40);
  const opacity = f(0.5 + intensity * 0.07);
  let shapes = "";
  for (let k = 0; k < count; k++) {
    const angle = (360 / count) * k;
    let shape = "";
    if (kind === 0) shape = `<ellipse cx="0" cy="${f(-radius)}" rx="${f(size * 0.42)}" ry="${f(size)}"/>`;
    else if (kind === 1) shape = `<path d="M0 ${f(-radius - size)} L${f(size * 0.55)} ${f(-radius)} L0 ${f(-radius + size)} L${f(-size * 0.55)} ${f(-radius)}Z"/>`;
    else if (kind === 2) shape = `<circle cx="0" cy="${f(-radius)}" r="${f(size * 0.62)}"/>`;
    else if (kind === 3) shape = `<path d="M0 ${f(-radius + size * 0.4)} Q${f(size * 0.9)} ${f(-radius - size * 0.2)} 0 ${f(-radius - size)} Q${f(-size * 0.9)} ${f(-radius - size * 0.2)} 0 ${f(-radius + size * 0.4)}Z"/>`;
    else shape = `<path d="M${f(-size * 0.5)} ${f(-radius + size * 0.5)} A${f(size * 0.5)} ${f(size * 0.5)} 0 0 1 ${f(size * 0.5)} ${f(-radius + size * 0.5)} L0 ${f(-radius - size)}Z"/>`;
    shapes += `<g transform="rotate(${f(angle)})">${shape}</g>`;
  }
  return `<g class="m-layer" style="--speed:${f(Math.abs(speed))}s;--dir:${speed < 0 ? "reverse" : "normal"}" fill="${color}" fill-opacity="${opacity}" stroke="${color}" stroke-opacity="0.6" stroke-width="1.2">${shapes}</g>`;
}

/** SVG da mandala (viewBox -300..300). */
export function buildMandalaSvg(emotions: MandalaEmotion[], label = "Mandala das emoções nomeadas"): string {
  const list = emotions.slice(0, 12);
  const layers = list.map((emotion, index) => layer(emotion, index, list.length)).join("");
  const dots = Array.from({ length: 48 }, (_, k) => { const a = (k / 48) * Math.PI * 2; return `<circle cx="${f(Math.cos(a) * 288)}" cy="${f(Math.sin(a) * 288)}" r="${k % 4 === 0 ? 3 : 1.6}"/>`; }).join("");
  const core = Array.from({ length: 8 }, (_, k) => `<ellipse cx="0" cy="-26" rx="9" ry="24" transform="rotate(${k * 45})"/>`).join("");
  return `<svg class="mandala" viewBox="-300 -300 600 600" role="img" aria-label="${escapeHtml(label)}" xmlns="http://www.w3.org/2000/svg"><defs><filter id="aq" filterUnits="userSpaceOnUse" x="-300" y="-300" width="600" height="600"><feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="9"/><feGaussianBlur stdDeviation="0.8"/></filter></defs><circle r="296" fill="#fffcf5"/><circle r="292" fill="none" stroke="#005a1f" stroke-opacity="0.25" stroke-width="1"/><g fill="#005a1f" fill-opacity="0.35">${dots}</g><g filter="url(#aq)" style="mix-blend-mode:multiply">${layers}</g><g fill="#facd29" fill-opacity="0.85" stroke="#bd6d2d" stroke-opacity="0.5">${core}</g><circle r="9" fill="#fffcf5" stroke="#bd6d2d" stroke-opacity="0.6"/></svg>`;
}

export const MANDALA_CSS = `.m-layer{transform-origin:0 0;animation:m-spin var(--speed) linear infinite;animation-direction:var(--dir)}@keyframes m-spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.m-layer{animation:none}}`;

/** Arquivo HTML independente (sem scripts nem rede) que desenha a mandala e lista as emoções usadas. */
export function buildMandalaHtml(emotions: MandalaEmotion[], resourceTitle = "Roda das Emoções"): string {
  const date = new Date().toLocaleDateString("pt-BR");
  const items = emotions.map(emotion => `<li><i style="background:${mandalaColor(emotion)}"></i><strong>${escapeHtml(emotion.title)}</strong> <span>${INTENSITY_WORDS[Math.min(5, Math.max(1, emotion.intensity))]}</span></li>`).join("");
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Minha mandala · ${escapeHtml(resourceTitle)}</title><style>
:root{color-scheme:light}*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;gap:18px;padding:24px;background:#fdf7f0;color:#262b22;font-family:Karla,system-ui,sans-serif}
main{width:min(92vw,640px);display:grid;gap:14px;text-align:center}h1{margin:0;font:600 1.5rem Georgia,serif;color:#005a1f}p{margin:0;color:#6b6b63;font-size:.9rem}
.mandala{width:100%;height:auto;border-radius:50%;box-shadow:0 12px 40px rgb(0 90 31 / .16)}ul{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
li{display:flex;align-items:center;gap:6px;padding:4px 12px;border:1.5px solid #d8cfbe;border-radius:999px;background:#fff;font-size:.85rem}li i{width:10px;height:10px;border-radius:50%}li span{color:#6b6b63}
${MANDALA_CSS}</style></head><body><main><h1>Minha mandala</h1><p>${escapeHtml(resourceTitle)} · ${date}. As formas nascem das emoções que você nomeou e da intensidade de cada uma; não é uma interpretação.</p>${buildMandalaSvg(emotions)}<ul>${items}</ul><p>Instituto Figura Viva · feita só no seu navegador, nada foi enviado.</p></main></body></html>`;
}
