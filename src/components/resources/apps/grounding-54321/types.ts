export type SenseType = "visao" | "tato" | "audicao" | "olfato" | "paladar";

export interface StageData {
  number: number;
  sense: string;
  senseKey: SenseType;
  title: string;
  instruction: string;
  groundingTip: string;
  audioNarration: string;
}

export interface AppSettings {
  audioEnabled: boolean; // master audio on/off
  voiceNarration: boolean; // spoken voice instruction
  chimeSound: boolean; // calming chime on mark touch
  freeRhythm: boolean; // ritmo livre (no forced countdowns)
  manualAdvance: boolean; // avanço manual (user explicitly clicks next)
  doWithoutRegistering: boolean; // "Fazer sem registrar" default mode
  reducedMotion: boolean; // remove pulsations and expansive transitions
}

export interface TelemetryRecord {
  id: string;
  resource_started: string;
  resource_completed?: string;
  duration?: number; // in seconds
}
