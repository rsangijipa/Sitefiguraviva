import type { RegionId } from "../types";

export interface RegionInfo {
  id: RegionId;
  label: string;
  shortLabel: string;
  ariaLabel: string;
  path: string;
}

export const regions: RegionInfo[] = [
  {
    id: "head",
    label: "Cabeça",
    shortLabel: "Cabeça",
    ariaLabel: "Cabeça — sem marcação",
    path: "M46% 8% C38% 5% 28% 7% 26% 14% C24% 20% 30% 26% 38% 27% C42% 27% 44% 26% 46% 26% C48% 26% 50% 27% 54% 27% C62% 26% 68% 20% 66% 14% C64% 7% 54% 5% 46% 8% Z",
  },
  {
    id: "neck",
    label: "Pescoço",
    shortLabel: "Pescoço",
    ariaLabel: "Pescoço — sem marcação",
    path: "M45% 27% L55% 27% L54% 34% L46% 34% Z",
  },
  {
    id: "chest",
    label: "Peito",
    shortLabel: "Peito",
    ariaLabel: "Peito — sem marcação",
    path: "M34% 34% L66% 34% L64% 48% L36% 48% Z",
  },
  {
    id: "abdomen",
    label: "Abdômen",
    shortLabel: "Abdômen",
    ariaLabel: "Abdômen — sem marcação",
    path: "M36% 49% L64% 49% L60% 62% L40% 62% Z",
  },
  {
    id: "left-arm",
    label: "Braço esquerdo",
    shortLabel: "B. esquerdo",
    ariaLabel: "Braço esquerdo — sem marcação",
    path: "M20% 32% C16% 30% 10% 34% 12% 42% C14% 52% 22% 48% 22% 48% L32% 44% L32% 36% Z",
  },
  {
    id: "right-arm",
    label: "Braço direito",
    shortLabel: "B. direito",
    ariaLabel: "Braço direito — sem marcação",
    path: "M80% 32% C84% 30% 90% 34% 88% 42% C86% 52% 78% 48% 78% 48% L68% 44% L68% 36% Z",
  },
  {
    id: "left-leg",
    label: "Perna esquerda",
    shortLabel: "P. esquerda",
    ariaLabel: "Perna esquerda — sem marcação",
    path: "M38% 63% C34% 62% 30% 66% 32% 72% C36% 84% 38% 88% 38% 88% L46% 88% L46% 63% Z",
  },
  {
    id: "right-leg",
    label: "Perna direita",
    shortLabel: "P. direita",
    ariaLabel: "Perna direita — sem marcação",
    path: "M54% 63% L54% 88% L62% 88% C62% 88% 64% 84% 68% 72% C70% 66% 66% 62% 62% 63% Z",
  },
  {
    id: "feet",
    label: "Pés",
    shortLabel: "Pés",
    ariaLabel: "Pés — sem marcação",
    path: "M30% 90% C26% 88% 28% 94% 34% 94% C40% 94% 42% 92% 42% 92% L46% 92% L46% 94% L54% 94% L54% 92% L58% 92% C58% 92% 60% 94% 66% 94% C72% 94% 74% 88% 70% 86% L68% 88% C68% 88% 66% 90% 62% 88% C56% 86% 52% 86% 52% 86% L48% 86% C48% 86% 44% 86% 38% 88% C34% 90% 32% 92% 30% 90% Z",
  },
];

export function getRegion(id: RegionId): RegionInfo {
  return regions.find((r) => r.id === id)!;
}
