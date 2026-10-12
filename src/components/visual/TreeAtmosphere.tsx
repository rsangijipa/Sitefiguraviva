"use client";
import { useEffect, useId, useRef, useState } from "react";
import styles from "./TreeAtmosphere.module.css";

/**
 * Aquarela clara que assenta a árvore do herói no chão.
 *
 * É uma faixa horizontal que vai de uma lateral à outra da janela e se ancora
 * na base real do tronco (a sombra marcada com `data-tree-ground`): sobe um
 * pouco acima dela e desce um pouco abaixo. Tudo é medido em pixels da tela,
 * então as manchas mantêm a forma em qualquer largura, e sempre há manchas
 * encostadas nas duas laterais. Topo e base se dissolvem por máscara; nas
 * laterais a faixa passa da janela, de modo que a deriva animada nunca revela
 * uma borda.
 */
type Blob = { cx: number; cy: number; rx: number; ry: number; tone: "rose" | "sage" | "gold" };
type Layout = { top: number; width: number; height: number; base: number; blobs: Blob[]; horizon: string; ripple: string };

const BLEED = 0.04; // fração extra de cada lado, para a deriva não expor a borda
const TONES: Blob["tone"][] = ["rose", "sage", "gold"];
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function measure(host: HTMLElement): Layout | null {
  const box = host.getBoundingClientRect();
  if (!box.width || !box.height) return null;
  const ground = host.querySelector<SVGGraphicsElement>("[data-tree-ground]")?.getBoundingClientRect();
  const visual = host.querySelector<HTMLElement>("[data-hero-tree]")?.getBoundingClientRect();
  if (!ground?.width && !visual) return null;
  // Antes de a árvore montar, estima a base pela caixa reservada a ela.
  const baseX = ground?.width ? ground.left + ground.width / 2 - box.left : visual!.left + visual!.width / 2 - box.left;
  const baseY = ground?.width ? ground.top + ground.height / 2 - box.top : visual!.bottom - visual!.height * 0.075 - box.top;
  const treeWidth = ground?.width ? ground.width * 1.6 : visual!.width * 0.6;
  const treeHeight = visual?.height ?? treeWidth * 1.15;

  const above = clamp(treeHeight * 0.42, 110, 250);
  const below = clamp(Math.min(treeHeight * 0.22, box.height - baseY), 40, 150);
  const top = Math.max(0, baseY - above);
  const height = Math.max(120, Math.min(box.height, baseY + below) - top);
  const bleed = box.width * BLEED;
  const width = box.width + bleed * 2;
  const base = baseY - top; // linha da base dentro da faixa
  const x = baseX + bleed; // centro da árvore dentro da faixa

  const blobs: Blob[] = [
    // Chão sob a árvore e um halo logo atrás do tronco.
    { cx: x, cy: base, rx: clamp(treeWidth * 0.95, 220, 460), ry: height * 0.34, tone: "gold" },
    { cx: x + treeWidth * 0.32, cy: base - height * 0.32, rx: clamp(treeWidth * 0.8, 200, 380), ry: height * 0.36, tone: "sage" },
    { cx: x - treeWidth * 0.55, cy: base - height * 0.18, rx: clamp(treeWidth * 0.7, 180, 340), ry: height * 0.32, tone: "rose" },
  ];
  // Preenche as duas laterais até a borda da janela, com espaçamento regular.
  const step = clamp(width / 5, 260, 420);
  let index = 0;
  for (const direction of [-1, 1]) {
    for (let cx = x + direction * step * 1.25; direction < 0 ? cx > -step / 2 : cx < width + step / 2; cx += direction * step) {
      const edge = cx <= step || cx >= width - step;
      blobs.push({
        cx: clamp(cx, 0, width), cy: base - height * (index % 2 ? 0.08 : 0.24),
        rx: step * (edge ? 0.95 : 0.8), ry: height * (index % 2 ? 0.3 : 0.36), tone: TONES[index % 3],
      });
      index += 1;
    }
  }
  const y = (fraction: number) => (base + height * fraction).toFixed(1);
  const horizon = `M0 ${y(-0.08)} C${width * 0.18} ${y(-0.26)} ${width * 0.32} ${y(0.1)} ${width * 0.5} ${y(-0.04)} S${width * 0.8} ${y(-0.22)} ${width} ${y(-0.06)} V${height} H0Z`;
  const ripple = `M0 ${y(0.14)} C${width * 0.2} ${y(0.02)} ${width * 0.38} ${y(0.22)} ${width * 0.55} ${y(0.12)} S${width * 0.85} ${y(0.04)} ${width} ${y(0.16)} V${height} H0Z`;
  return { top, width, height, base, blobs, horizon, ripple };
}

export default function TreeAtmosphere() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [layout, setLayout] = useState<Layout | null>(null);
  const id = useId().replace(/:/g, "");

  useEffect(() => {
    const element = ref.current;
    const host = element?.parentElement;
    if (!element || !host) return;
    let frame = 0;
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => setLayout(measure(host))); };
    schedule();
    const resize = new ResizeObserver(schedule);
    resize.observe(host);
    const visual = host.querySelector("[data-hero-tree]");
    if (visual) resize.observe(visual);
    // A árvore carrega no cliente depois do herói; remede quando ela aparece.
    const mutation = new MutationObserver(schedule);
    if (visual) mutation.observe(visual, { childList: true, subtree: true });
    window.addEventListener("resize", schedule);
    document.fonts?.ready.then(schedule).catch(() => undefined);

    let visible = false;
    const update = () => setActive(visible && !document.hidden);
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    intersection.observe(element);
    document.addEventListener("visibilitychange", update);
    return () => {
      cancelAnimationFrame(frame); resize.disconnect(); mutation.disconnect(); intersection.disconnect();
      window.removeEventListener("resize", schedule); document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return <div ref={ref} aria-hidden="true" className={styles.atmosphere} data-active={active} data-tree-wash
    style={layout ? { top: layout.top, height: layout.height, left: `-${BLEED * 100}%`, right: `-${BLEED * 100}%` } : undefined}>
    {layout && <svg className={styles.paint} viewBox={`0 0 ${layout.width.toFixed(0)} ${layout.height.toFixed(0)}`} preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {TONES.map(tone => <radialGradient key={tone} id={`${id}-${tone}`}><stop stopColor={`var(--wash-${tone})`} stopOpacity=".52" /><stop offset="1" stopColor={`var(--wash-${tone})`} stopOpacity="0" /></radialGradient>)}
        <filter id={`${id}-soft`} x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="24" /></filter>
        {/* Topo e base se dissolvem: a faixa nunca termina numa linha. */}
        <linearGradient id={`${id}-fade`} x1="0" x2="0" y1="0" y2="1">
          <stop stopColor="#fff" stopOpacity="0" />
          <stop offset={(clamp(layout.base / layout.height - 0.45, 0.15, 0.5)).toFixed(2)} stopColor="#fff" />
          <stop offset={(clamp(layout.base / layout.height + 0.08, 0.6, 0.9)).toFixed(2)} stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width={layout.width} height={layout.height}>
          <rect width={layout.width} height={layout.height} fill={`url(#${id}-fade)`} />
        </mask>
      </defs>
      <g mask={`url(#${id}-mask)`}>
        <g filter={`url(#${id}-soft)`}>
          {layout.blobs.map((blob, index) => <ellipse key={index} cx={blob.cx.toFixed(1)} cy={blob.cy.toFixed(1)} rx={blob.rx.toFixed(1)} ry={blob.ry.toFixed(1)} fill={`url(#${id}-${blob.tone})`} />)}
        </g>
        <path d={layout.horizon} fill="var(--wash-sage)" opacity=".12" />
        <path d={layout.ripple} fill="var(--wash-rose)" opacity=".1" />
      </g>
    </svg>}
  </div>;
}
