export type PracticeId =
  | "breathing"
  | "observing"
  | "listening"
  | "movement"
  | "slowing";

export interface PausePracticeConfig {
  id: PracticeId;
  title: string;
  description: string;
  iconComponent: React.ComponentType<{ className?: string }>;
  durations: number[];
  defaultDuration: number;
  capabilities: { audio: boolean; motion: boolean; static: boolean };
}

export interface PauseSessionRecord {
  id: string;
  userId: string;
  practiceId: PracticeId;
  plannedDurationSeconds: number;
  activeDurationSeconds: number;
  endedBy: "timer" | "user" | "switch";
  reflection: string | null;
  contentVersion: string;
  createdAt: string;
  clientRequestId: string;
}

export type PauseStatus =
  | "idle"
  | "choosing"
  | "preparing"
  | "active"
  | "paused"
  | "completion";
