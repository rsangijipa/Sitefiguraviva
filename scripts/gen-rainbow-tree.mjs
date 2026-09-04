// Gera a árvore arco-íris (SVG) da marca Figura Viva.
// Estilo: vetor plano — tronco marrom simples + folhas individuais em leque.
// Saída: componente React (SVG inline) + preview HTML.
import fs from "node:fs";
import path from "node:path";

const OUT_TSX = process.argv[2];
const OUT_HTML = process.argv[3];

/* ---------------- RNG determinístico ---------------- */
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let rnd = mulberry32(20260903);
const rr = (a, b) => a + (b - a) * rnd();
const n1 = (v) => Math.round(v * 10) / 10;

/* ---------------- Geometria da copa ---------------- */
const VW = 1000;
const VH = 1040;
// A copa pode passar de x=1043 e chegar a y=-49 (superelipse com lóbulos, mais
// meia folha). Com o viewBox colado em 0 0 1000 1040 o topo e a lateral direita
// saíam cortados em linha reta. A caixa abaixo dá a folga exata.
const VB_X = -60;
const VB_Y = -62;
const VB_W = 1120;
const VB_H = 1104;
const VIEW_BOX = `${VB_X} ${VB_Y} ${VB_W} ${VB_H}`;
const CX = 500;
const CY = 380;
const RX = 484;
const RY = 382;
const WIND_COLS = 4;
const WIND_ROWS = 3;

// contorno levemente lobado da copa
function crownK(th) {
  return (
    1 +
    0.04 * Math.sin(3 * th + 0.9) +
    0.03 * Math.sin(5 * th + 2.3) +
    0.02 * Math.sin(8 * th + 0.4)
  );
}
// superelipse: mantém a copa larga também na parte de baixo, como na arte
const CROWN_N = 2.5;
function crownDist(x, y, k = 1) {
  const th = Math.atan2(-(y - CY), x - CX);
  const kk = crownK(th) * k;
  const dx = Math.abs((x - CX) / (RX * kk));
  const dy = Math.abs((y - CY) / (RY * kk));
  return Math.pow(Math.pow(dx, CROWN_N) + Math.pow(dy, CROWN_N), 1 / CROWN_N);
}
function insideCrown(x, y, k = 1) {
  return crownDist(x, y, k) <= 1;
}

/* ---------------- Mapa de matiz (amostrado da referência) ----------------
   θ em graus, CCW a partir do eixo +x (direita). Os valores passam de 360
   para manter a rampa monotônica; o resultado é reduzido no fim. */
const HUE_STOPS = [
  [0, 130],
  [40, 140],
  [60, 160],
  [75, 185],
  [90, 205],
  [105, 225],
  [118, 275],
  [132, 310],
  [148, 335],
  [165, 350],
  [185, 358],
  [200, 368],
  [220, 378],
  [240, 388],
  [262, 400],
  [285, 410],
  [310, 420],
  [335, 440],
  [360, 490],
];
function hueAt(thDeg) {
  const t = ((thDeg % 360) + 360) % 360;
  for (let i = 0; i < HUE_STOPS.length - 1; i++) {
    const [a, ha] = HUE_STOPS[i];
    const [b, hb] = HUE_STOPS[i + 1];
    if (t >= a && t <= b) return (ha + ((hb - ha) * (t - a)) / (b - a)) % 360;
  }
  return 130;
}
function hueMix(h1, h2, k) {
  const d = ((h2 - h1 + 540) % 360) - 180;
  return (h1 + d * k + 360) % 360;
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// hsl -> hex: encurta bastante a marcação repetida de milhares de folhas
function hslHex(h, s, l) {
  const S = s / 100;
  const L = l / 100;
  const c = (1 - Math.abs(2 * L - 1)) * S;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const m = L - c / 2;
  const t = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ][Math.floor(hp) % 6];
  return (
    "#" +
    t
      .map((v) =>
        Math.round((v + m) * 255)
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
  );
}
const smooth = (x) => {
  const t = clamp(x, 0, 1);
  return t * t * (3 - 2 * t);
};

function leafColor(x, y, rn) {
  const u = clamp(rn, 0, 1);
  const th = (Math.atan2(-(y - CY), x - CX) * 180) / Math.PI;
  let h = hueAt(th);
  // o miolo da copa puxa para amarelo/laranja, como no original
  const lower = smooth((y - (CY - RY * 0.45)) / (RY * 1.15));
  const warm = (1 - u) * (0.28 + 0.72 * lower);
  h = hueMix(h, 48, clamp(warm * 1.05, 0, 0.9));
  let l = 49 + 8 * Math.pow(1 - u, 1.4) + rr(-3.5, 3.5);
  let s = 82 + rr(-7, 9);
  // Volume sem nó extra: a luz vem de cima e da esquerda, então a folha recebe
  // claro/escuro pela posição na copa. É o que separa uma copa com forma de um
  // adesivo chapado — e não custa um único elemento SVG a mais.
  const nx = (x - CX) / RX;
  const ny = (y - CY) / RY;
  const lit = clamp(0.5 - 0.34 * nx - 0.5 * ny, 0, 1);
  l += (lit - 0.5) * 15;
  s -= (lit - 0.5) * 7;
  // ajustes por família de matiz para bater com a arte de referência
  if (h >= 190 && h <= 268) {
    l -= 7;
    s -= 2;
  } else if (h > 95 && h < 168) {
    s -= 8;
    l -= 2;
  } else if (h >= 38 && h <= 70) {
    l += 6;
    s += 6;
  }
  // Quantização: agrupa milhares de folhas em ~poucas centenas de cores, o que
  // permite emitir `<g fill>` em vez de repetir o atributo folha a folha.
  const q = (v, step) => Math.round(v / step) * step;
  return hslHex(
    q(h, 4),
    q(clamp(s, 52, 92), 5),
    q(clamp(l, 34, 66), 3)
  );
}

/* ---------------- Esqueleto lenhoso ---------------- */
const branches = [];
const leaves = [];

function taper(p0, c, p1, w0, w1) {
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const h0 = w0 / 2;
  const h1 = w1 / 2;
  const hc = (h0 + h1) / 2;
  return (
    `M${n1(p0[0] + nx * h0)} ${n1(p0[1] + ny * h0)}` +
    `Q${n1(c[0] + nx * hc)} ${n1(c[1] + ny * hc)} ${n1(p1[0] + nx * h1)} ${n1(
      p1[1] + ny * h1
    )}` +
    `L${n1(p1[0] - nx * h1)} ${n1(p1[1] - ny * h1)}` +
    `Q${n1(c[0] - nx * hc)} ${n1(c[1] - ny * hc)} ${n1(p0[0] - nx * h0)} ${n1(
      p0[1] - ny * h0
    )}Z`
  );
}

const TRUNK_CORRIDOR = (x, y) =>
  (y > 600 && Math.abs(x - CX) < 54) || (y > 720 && Math.abs(x - CX) < 128);

function addLeaf(x, y, ang, size) {
  if (!insideCrown(x, y, 1.03)) return;
  if (TRUNK_CORRIDOR(x, y)) return;
  const rn = crownDist(x, y);
  leaves.push({
    x: Math.round(x),
    y: Math.round(y),
    a: Math.round((ang * 180) / Math.PI + 90),
    s: (size / 100).toFixed(2).replace(/^0/, ""),
    fill: leafColor(x, y, rn),
    col: clamp(Math.floor(((x - (CX - RX)) / (2 * RX)) * WIND_COLS), 0, WIND_COLS - 1),
    row: clamp(Math.floor(((y - (CY - RY)) / (2 * RY)) * WIND_ROWS), 0, WIND_ROWS - 1),
  });
}

// folhas ao longo de um segmento: pares alternados + tufo na ponta.
// A quantidade acompanha o comprimento, para que os ramos internos — longos —
// também fiquem vestidos e o miolo da copa não abra buracos.
function dressSegment(p0, p1, ang, depth, terminal) {
  const along = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
  const t0 = depth === 0 ? 0.2 : depth <= 2 ? 0.12 : 0.06;
  // Passo entre folhas ao longo do ramo. Subir de 32 para 46 tira ~30% das
  // folhas; o ganho de tamanho abaixo compensa a densidade, então a copa
  // continua fechada e o SVG entregue ao navegador encolhe na mesma proporção.
  const n = clamp(Math.round((along * (1 - t0)) / 76), 1, 6);
  for (let i = 0; i < n; i++) {
    const t = t0 + (1 - t0) * ((i + 0.5) / n) + rr(-0.04, 0.04);
    const px = p0[0] + (p1[0] - p0[0]) * t;
    const py = p0[1] + (p1[1] - p0[1]) * t;
    const side = i % 2 === 0 ? 1 : -1;
    const la = ang + side * rr(0.62, 1.28);
    const size = rr(38, 58) * (terminal ? 0.95 : 1);
    // a folha nasce no galho e cresce para fora
    addLeaf(
      px + (Math.cos(la) * size) / 2.1,
      py + (Math.sin(la) * size) / 2.1,
      la,
      size
    );
  }
  if (terminal) {
    for (let i = -1; i <= 1; i++) {
      const la = ang + i * rr(0.4, 0.72);
      const size = rr(40, 60);
      addLeaf(
        p1[0] + (Math.cos(la) * size) / 1.9,
        p1[1] + (Math.sin(la) * size) / 1.9,
        la,
        size
      );
    }
  }
}

function grow(x, y, ang, len, wid, depth) {
  const curve = rr(-0.22, 0.22);
  const mid = ang + curve * 0.5;
  const cp = [x + Math.cos(mid) * len * 0.5, y + Math.sin(mid) * len * 0.5];
  const ex = x + Math.cos(ang + curve) * len;
  const ey = y + Math.sin(ang + curve) * len;
  branches.push({ d: taper([x, y], cp, [ex, ey], wid, wid * 0.66), depth });

  const canSplit = depth < 5 && wid > 2.3;
  const kids = [];
  if (canSplit) {
    const nKids = depth < 1 ? 2 : rnd() < 0.3 ? 3 : 2;
    const spread = depth < 1 ? rr(0.4, 0.55) : rr(0.34, 0.66);
    for (let i = 0; i < nKids; i++) {
      const side = nKids === 3 ? i - 1 : i === 0 ? -1 : 1;
      let na = ang + curve + side * spread * rr(0.75, 1.25);
      if (nKids === 3 && side === 0) na = ang + curve + rr(-0.16, 0.16);
      // pontas externas podem pender; o miolo cresce para cima
      const droop = depth >= 1 ? 0.68 : 0.2;
      if (Math.sin(na) > droop) na = ang + curve - side * spread * 0.55;
      const nl = len * rr(0.68, 0.84);
      const nw = wid * (nKids === 3 ? 0.58 : 0.68);
      if (!insideCrown(ex + Math.cos(na) * nl, ey + Math.sin(na) * nl, 0.94))
        continue;
      kids.push([na, nl, nw]);
    }
  }
  const terminal = kids.length === 0;
  dressSegment([x, y], [ex, ey], ang + curve, depth, terminal);
  kids.forEach(([na, nl, nw]) => grow(ex, ey, na, nl, nw, depth + 1));
}

/* ---------------- Tronco simples com raízes ---------------- */
const BARK = "var(--fv-bark)";
const trunkPath =
  "M454 1010" +
  "C458 946 453 878 458 818" +
  "C462 750 464 668 466 590" +
  "L534 590" +
  "C536 668 538 750 542 818" +
  "C547 878 542 946 546 1010" +
  "C526 1018 474 1018 454 1010Z";
// raízes: contrafortes largos, no mesmo marrom do tronco
const rootPaths = [
  "M456 892C444 944 402 984 318 1006C286 1014 268 1020 276 1024C312 1030 396 1020 438 1004C468 992 478 962 480 926Z",
  "M544 892C556 944 598 984 682 1006C714 1014 732 1020 724 1024C688 1030 604 1020 562 1004C532 992 522 962 520 926Z",
  "M470 962C452 992 420 1012 372 1026C346 1033 336 1038 350 1039C382 1041 442 1030 476 1018C470 1002 468 982 470 962Z",
  "M530 962C548 992 580 1012 628 1026C654 1033 664 1038 650 1039C618 1041 558 1030 524 1018C530 1002 532 982 530 962Z",
  "M448 1004C448 1022 456 1034 468 1040L532 1040C544 1034 552 1022 552 1004Z",
];

/* ---------------- Crescimento ---------------- */
rnd = mulberry32(515);
// leque primário — dez ramos deixando o tronco em alturas e ângulos diversos
grow(478, 590, -1.98, 184, 23, 0);
grow(522, 588, -1.16, 186, 22, 0);
grow(500, 582, -1.57, 178, 19, 0);
grow(472, 622, -2.36, 176, 20, 0);
grow(528, 618, -0.78, 178, 20, 0);
grow(468, 654, -2.68, 172, 18, 0);
grow(532, 650, -0.46, 174, 18, 0);
grow(466, 690, -2.96, 166, 16, 0);
grow(534, 684, -0.18, 168, 16, 0);
grow(500, 616, -1.45, 150, 14, 1);
grow(486, 568, -1.79, 172, 15, 1);
grow(514, 564, -1.35, 174, 15, 1);
grow(500, 546, -1.57, 158, 12, 2);
grow(464, 716, -3.06, 168, 14, 0);
grow(536, 710, -0.08, 170, 14, 0);

/* ---------------- Grupos de vento ----------------
   A copa é dividida numa grade compacta. Cada célula é um grupo animado:
   como o retângulo de cada grupo é pequeno, a área repintada por quadro
   soma cerca de uma copa — e não uma copa por grupo, como aconteceria com
   faixas de largura total. O atraso cresce com a coluna, então a rajada
   atravessa a árvore da esquerda para a direita. */
const WIND_GROUPS = WIND_COLS * WIND_ROWS;
leaves.forEach((l) => {
  l.g = l.row * WIND_COLS + l.col;
});

// Gota, não lente: a base arredondada faz a folha ler como folha mesmo com
// 30 px de altura na tela, e o conjunto perde o aspecto de confete.
const LEAF_PATH =
  "M0-50C14-28 24-6 21 13C18 30 8 43 0 50C-8 43-18 30-21 13C-24-6-14-28 0-50Z";

function renderLeaves() {
  const buckets = Array.from({ length: WIND_GROUPS }, () => []);
  leaves.forEach((l) => buckets[l.g].push(l));
  return buckets
    .map((b, i) => {
      if (!b.length) return "";
      // Dentro do grupo de vento as folhas são reagrupadas por cor: o atributo
      // fill sai do <use> e sobe para um <g>, cortando ~13 bytes por folha sem
      // mudar um pixel do resultado.
      const byFill = new Map();
      b.forEach((l) => {
        if (!byFill.has(l.fill)) byFill.set(l.fill, []);
        byFill.get(l.fill).push(l);
      });
      const inner = [...byFill.entries()]
        .map(
          ([fill, ls]) =>
            `<g fill="${fill}">` +
            ls
              .map(
                (l) =>
                  `<use href="#fvleaf" transform="translate(${l.x} ${l.y})rotate(${l.a})scale(${l.s})"/>`
              )
              .join("") +
            `</g>`
        )
        .join("");
      return `<g class="fv-w fv-w${i}">${inner}</g>`;
    })
    .filter(Boolean)
    .join("\n        ");
}

function windCss() {
  let css = "";
  for (let i = 0; i < WIND_GROUPS; i++) {
    const col = i % WIND_COLS;
    const row = Math.floor(i / WIND_COLS);
    // pontas altas e externas balançam mais que a folhagem junto ao tronco
    const cx = ((col + 0.5) / WIND_COLS) * 2 - 1;
    const cy = (row + 0.5) / WIND_ROWS;
    const amp = 0.45 + 0.55 * clamp(Math.abs(cx) * 0.8 + (1 - cy) * 0.7, 0, 1);
    const t = (a) => n1(a * amp);
    const r = (a) => n1(a * amp);
    css += `
@keyframes fv-wind-${i}{
0%{transform:translate(0,0) rotate(0deg)}
9%{transform:translate(${t(3)}px,${t(-1.4)}px) rotate(${r(0.24)}deg)}
21%{transform:translate(${t(8.2)}px,${t(-2.4)}px) rotate(${r(0.66)}deg)}
33%{transform:translate(${t(5.6)}px,${t(1.2)}px) rotate(${r(0.42)}deg)}
45%{transform:translate(${t(9.4)}px,${t(-0.6)}px) rotate(${r(0.74)}deg)}
57%{transform:translate(${t(3.2)}px,${t(2)}px) rotate(${r(0.2)}deg)}
69%{transform:translate(${t(-2.4)}px,${t(-1)}px) rotate(${r(-0.26)}deg)}
81%{transform:translate(${t(-5.6)}px,${t(1.4)}px) rotate(${r(-0.52)}deg)}
92%{transform:translate(${t(-2)}px,${t(-0.5)}px) rotate(${r(-0.18)}deg)}
100%{transform:translate(0,0) rotate(0deg)}
}
.fv-w${i}{animation:fv-wind-${i} ${n1(6.6 + col * 0.31 + row * 0.47)}s ease-in-out ${n1(
      -col * 0.6 - row * 0.23
    )}s infinite}`;
  }
  return css;
}

/* ---------------- Montagem ---------------- */
const branchPaths = branches
  .sort((a, b) => a.depth - b.depth)
  .map((b) => `<path d="${b.d}"/>`)
  .join("");

const defs =
  `<path id="fvleaf" d="${LEAF_PATH}"/>` +
  // Casca: uma luz só, ancorada no viewBox (userSpaceOnUse), para que tronco e
  // raízes compartilhem a mesma direção de iluminação da copa.
  `<linearGradient id="fvbark" gradientUnits="userSpaceOnUse" x1="440" y1="0" x2="580" y2="0">` +
  `<stop offset="0" stop-color="var(--fv-bark-hi)"/>` +
  `<stop offset=".42" stop-color="var(--fv-bark)"/>` +
  `<stop offset="1" stop-color="var(--fv-bark-lo)"/>` +
  `</linearGradient>` +
  // Sombra no chão: planta a árvore. Sem ela o tronco flutua sobre o papel.
  `<radialGradient id="fvground">` +
  `<stop offset="0" stop-color="rgb(var(--fv-ground))" stop-opacity=".3"/>` +
  `<stop offset=".55" stop-color="rgb(var(--fv-ground))" stop-opacity=".12"/>` +
  `<stop offset="1" stop-color="rgb(var(--fv-ground))" stop-opacity="0"/>` +
  `</radialGradient>`;

const css = `svg.fv-tree{--fv-bark:#6d3b1c;--fv-bark-hi:#8b5326;--fv-bark-lo:#472310;--fv-ground:38 43 34}
.dark svg.fv-tree{--fv-bark:#5c3116;--fv-bark-hi:#78421d;--fv-bark-lo:#33190a;--fv-ground:0 0 0}
.fv-w{transform-box:view-box;transform-origin:500px 700px;will-change:transform}
@media (prefers-reduced-motion:reduce){.fv-w{animation:none!important}}${windCss()}`;

// Estrias de casca: quatro traços finos, escuros, seguindo a fibra do tronco.
const barkLines = [
  "M474 600C471 700 470 820 472 1002",
  "M500 596C499 700 498 828 499 1004",
  "M526 598C528 700 529 822 527 1002",
  "M512 640C513 740 513 860 512 996",
].map(
  (d) =>
    `<path d="${d}" fill="none" stroke="var(--fv-bark-lo)" stroke-opacity=".45" stroke-width="3" stroke-linecap="round"/>`
).join("");

const svgInner = `
      <ellipse class="fv-ground" cx="500" cy="1032" rx="268" ry="28" fill="url(#fvground)"/>
      <g class="fv-woody" fill="url(#fvbark)">
        ${rootPaths.map((d) => `<path d="${d}"/>`).join("")}
        <path d="${trunkPath}"/>
      </g>
      <g class="fv-bark-lines">${barkLines}</g>
      <g class="fv-branches" fill="${BARK}">
        ${branchPaths}
      </g>
      <g class="fv-canopy">
        ${renderLeaves()}
      </g>`;

/* ---------------- Saídas ---------------- */
// O JSX exige os atributos SVG em camelCase; o HTML de preview exige o kebab.
// A marcação é gerada uma vez em kebab e convertida só na saída .tsx.
const JSX_ATTRS = {
  "class=": "className=",
  "stroke-width=": "strokeWidth=",
  "stroke-opacity=": "strokeOpacity=",
  "stroke-linecap=": "strokeLinecap=",
  "stroke-linejoin=": "strokeLinejoin=",
  "stop-color=": "stopColor=",
  "stop-opacity=": "stopOpacity=",
  "fill-opacity=": "fillOpacity=",
  "fill-rule=": "fillRule=",
};
const toJsx = (markup) =>
  Object.entries(JSX_ATTRS).reduce(
    (acc, [from, to]) => acc.split(from).join(to),
    markup
  );

const tsx = `/**
 * Árvore Figura Viva — reprodução vetorial da árvore arco-íris da marca.
 * Gerada proceduralmente: esqueleto lenhoso recursivo + folhas coloridas por
 * um mapa de matiz amostrado da arte original. As folhas são divididas em
 * ${WIND_GROUPS} grupos, com atraso por faixa horizontal, de modo que a rajada de
 * vento atravessa a copa em vez de mover tudo em bloco.
 *
 * Sem hooks e sem "use client": renderiza no servidor, custo zero de JS.
 * Arquivo gerado — alterar o gerador (scripts/gen-rainbow-tree.mjs), não este.
 */
export default function RainbowTree({
  className = "",
  title,
  preserveAspectRatio = "xMidYMax meet",
}: {
  className?: string;
  /** Quando ausente, a árvore é puramente decorativa (aria-hidden). */
  title?: string;
  /** Ancoragem ao redimensionar. O padrão fixa a base da árvore. */
  preserveAspectRatio?: string;
}) {
  return (
    <svg
      viewBox="${VIEW_BOX}"
      preserveAspectRatio={preserveAspectRatio}
      className={"fv-tree " + className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>${toJsx(defs)}</defs>
      <style>{\`${css}\`}</style>
${toJsx(svgInner)}
    </svg>
  );
}
`;

const html = `<!doctype html><meta charset="utf-8"><title>preview</title>
<style>
html,body{margin:0;height:100%}
body{display:grid;grid-template-columns:1fr 1fr}
.pane{display:flex;align-items:flex-end;justify-content:center;overflow:hidden}
.light{background:#FDFAF4}
.dark{background:#12160F}
svg{width:100%;height:100%;max-height:100vh}
</style>
<div class="pane light">
<svg class="fv-tree" viewBox="${VIEW_BOX}" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg">
<defs>${defs}</defs><style>${css}</style>
${svgInner}</svg>
</div>
<div class="pane dark">
<svg class="fv-tree" viewBox="${VIEW_BOX}" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg">
${svgInner}</svg>
</div>`;

fs.mkdirSync(path.dirname(OUT_TSX), { recursive: true });
fs.writeFileSync(OUT_TSX, tsx);
fs.writeFileSync(OUT_HTML, html);
console.log(
  `galhos=${branches.length} folhas=${leaves.length} tsx=${(
    tsx.length / 1024
  ).toFixed(1)}kb`
);
