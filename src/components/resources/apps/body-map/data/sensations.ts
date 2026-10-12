import type { Sensation } from "../types";

export interface SensationInfo {
  value: Sensation;
  label: string;
  description: string;
  cssColor: string;
  bgClass: string;
}

export const sensations: SensationInfo[] = [
  {
    value: "tensão",
    label: "Tensão",
    description: "Contração ou rigidez no corpo",
    cssColor: "rgb(var(--color-primary) / 0.9)",
    bgClass: "bg-[rgb(0 90 31 / 0.08)]",
  },
  {
    value: "calor",
    label: "Calor",
    description: "Sensação de aquecimento ou fluxo",
    cssColor: "rgb(var(--color-terra) / 0.85)",
    bgClass: "bg-[rgb(150 85 31 / 0.08)]",
  },
  {
    value: "peso",
    label: "Peso",
    description: "Pressão ou gravidade localizada",
    cssColor: "rgb(90 90 82)",
    bgClass: "bg-[rgb(75 75 73 / 0.08)]",
  },
  {
    value: "formigamento",
    label: "Formigamento",
    description: "Agudeza ou estímulo nervoso",
    cssColor: "rgb(176 141 85)",
    bgClass: "bg-[rgb(107 107 99 / 0.1)]",
  },
  {
    value: "leveza",
    label: "Leveza",
    description: "Alívio, fluidez ou relaxamento",
    cssColor: "rgb(var(--color-igarape) / 0.8)",
    bgClass: "bg-[rgb(7 97 76 / 0.08)]",
  },
];

export function getSensation(value: Sensation): SensationInfo {
  return sensations.find((s) => s.value === value)!;
}
