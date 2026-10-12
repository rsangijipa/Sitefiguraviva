"use client";
import { useId, type ReactNode, type SVGProps } from "react";

/**
 * Primitivas SVG dos gráficos funcionais dos Recursos (silhueta do corpo e
 * diagrama do ciclo). As ilustrações em si são imagens em
 * public/brand/recursos (ver slots.ts). Só cores da paleta, por token, para
 * acompanhar o tema escuro; sem sombra nem brilho.
 */
export const C = {
  raiz: "var(--fv-verde-raiz)", igarape: "var(--fv-verde-igarape)", barro: "var(--fv-terra-barro)",
  creme: "var(--fv-creme-papel)", mata: "var(--fv-mata)", areia: "var(--fv-areia)", nevoa: "var(--fv-nevoa)",
  pedra: "var(--fv-pedra)", aurora: "var(--fv-aurora)", vazante: "var(--fv-vazante)", broto: "var(--fv-broto)",
} as const;
export type KitColor = keyof typeof C;

/** Ids únicos por desenho: vários SVGs do kit convivem na mesma página. */
export function useKitIds() {
  const base = useId().replace(/:/g, "");
  return { aquarela: `${base}-aquarela`, borda: `${base}-borda`, base };
}

/** Filtros: `aquarela` desfaz o contorno da mancha; `borda` só ondula linhas. */
export function KitDefs({ ids, seed = 3, children }: { ids: ReturnType<typeof useKitIds>; seed?: number; children?: ReactNode }) {
  return <defs>
    <filter id={ids.aquarela} x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="3" seed={seed} result="ruido" />
      <feDisplacementMap in="SourceGraphic" in2="ruido" scale="16" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id={ids.borda} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed={seed + 7} result="ruido" />
      <feDisplacementMap in="SourceGraphic" in2="ruido" scale="3" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    {children}
  </defs>;
}

type StainProps = { cx: number; cy: number; rx: number; ry?: number; color: KitColor; opacity?: number; filter: string; rotate?: number } & Omit<SVGProps<SVGEllipseElement>, "color" | "filter">;
/** Mancha de aquarela: nunca com contorno; a borda é a própria tinta. */
export function Stain({ cx, cy, rx, ry = rx, color, opacity = 0.85, filter, rotate = 0, ...rest }: StainProps) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={C[color]} opacity={opacity} filter={`url(#${filter})`} transform={rotate ? `rotate(${rotate} ${cx} ${cy})` : undefined} {...rest} />;
}

/** Moldura padrão de ilustração do kit: papel Areia, sem borda. */
export function KitFrame({ label, viewBox = "0 0 300 180", children, className, decorative = false }: { label: string; viewBox?: string; children: ReactNode; className?: string; decorative?: boolean }) {
  return <svg viewBox={viewBox} className={className ?? "fv-illustration"} role={decorative ? undefined : "img"} aria-label={decorative ? undefined : label} aria-hidden={decorative || undefined} xmlns="http://www.w3.org/2000/svg" data-placeholder-art>
    {children}
  </svg>;
}
