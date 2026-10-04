export type RiverPhase =
  | "intro"
  | "ready"
  | "running"
  | "paused"
  | "completion";
export type RiverTimingMode = "free" | 2 | 3 | 5;
export type RiverSessionMode = "free" | "timed";
export const RIVER_TIMED_DURATIONS = [120, 180, 300] as const;
export const MAX_RIVER_REFLECTION_LENGTH = 500;
export const MAX_RIVER_ACTIVE_DURATION_SECONDS = 18_000;

export interface RiverLeaf {
  id: string;
  text: string;
  createdAt: number;
  durationMs: number;
  progress: number;
  lane: number;
  wobble: number;
}

export interface RiverSessionSummary {
  activeDurationSeconds: number;
  mode: RiverTimingMode;
  plannedDurationSeconds: number | null;
  reflection: string | null;
}

export interface RiverSessionInput {
  mode: RiverSessionMode;
  plannedDurationSeconds: 120 | 180 | 300 | null;
  activeDurationSeconds: number;
  reflection?: string | null;
  clientRequestId: string;
  contentVersion?: string;
}

export interface RiverSessionRecord extends Required<
  Omit<RiverSessionInput, "reflection">
> {
  id: string;
  userId: string;
  schemaVersion: number;
  reflection: string | null;
  createdAt: string;
  updatedAt: string;
}

export type RiverSessionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      code:
        | "validation_error"
        | "unauthenticated"
        | "forbidden"
        | "not_found"
        | "conflict"
        | "unavailable";
      error: string;
    };

export interface ThoughtRiverExperienceProps {
  onSave?: (summary: RiverSessionSummary) => Promise<void> | void;
  onExit?: () => void;
  onComplete?: (summary: Omit<RiverSessionSummary, "reflection">) => void;
  initialTimingMode?: RiverTimingMode;
  initialView?: "experience" | "history";
  className?: string;
}

export const MAX_ACTIVE_LEAVES = 8;
export const MAX_LEAF_LENGTH = 280;
export const MAX_REFLECTION_LENGTH = 500;
