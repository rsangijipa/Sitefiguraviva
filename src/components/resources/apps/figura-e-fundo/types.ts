export type ExperienceStage =
  | "contemplating"
  | "selecting"
  | "revealed"
  | "conclusion";

export type RoundTheme =
  | "equilibrio"
  | "contraste"
  | "proximidade"
  | "escala"
  | "movimento";

export interface VisualElementItem {
  id: string;
  name: string;
  category: "forma" | "ramo" | "linha" | "fragmentos" | "textura";
  description: string;
  color: string;
  fillOpacity: number;
  strokeColor?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  motionClass?: string;
  scale?: number;
  position: {
    x: number;
    y: number;
  };
  rotation?: number;
}

export interface RoundConfig {
  id: number;
  theme: RoundTheme;
  title: string;
  subtitle: string;
  phenomenonNote: string;
  parameterName: string;
  elements: VisualElementItem[];
  backgroundColor?: string;
}

export interface UserSelection {
  roundId: number;
  roundTitle: string;
  theme: RoundTheme;
  selectedElementId: string;
  selectedElementName: string;
  secondsElapsed: number;
}

export interface AggregatedStats {
  totalCompletions: number;
  totalTimeSpentSeconds: number;
  lastCompletedAt?: string;
}
