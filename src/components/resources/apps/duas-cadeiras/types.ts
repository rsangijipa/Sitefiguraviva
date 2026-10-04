export type ChairId = "A" | "B";

export interface ChairConfig {
  id: ChairId;
  name: string;
  sublabel: string;
  accentColor: string;
}

export interface DialogueTurn {
  id: string;
  chairId: ChairId;
  speakerName: string;
  text: string;
  timestamp: number;
}

export interface ReflectionSession {
  id: string;
  title: string;
  chairA: ChairConfig;
  chairB: ChairConfig;
  turns: DialogueTurn[];
  closingReflection?: string;
  createdAt: number;
  updatedAt: number;
  isCompleted: boolean;
}

export type SessionState = "setup" | "active" | "paused" | "review";
