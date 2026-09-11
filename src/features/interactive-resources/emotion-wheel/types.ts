export interface EmotionNuance {
  id: string;
  familyId: string;
  label: string;
  description: string;
  example: string;
  question: string;
  synonyms: string[];
  archived?: boolean;
}

export interface EmotionFamily {
  id: string;
  name: string;
  description: string;
  colorToken: string;
  nuances: EmotionNuance[];
}

export type EmotionRecordStatus = "named" | "unsure";

export interface EmotionSelectionEntry {
  emotionId?: string | null;
  customLabel?: string | null;
  labelSnapshot: string;
  familyId?: string | null;
  familyName?: string | null;
  intensity?: number | null; // 1..5
}

export interface EmotionRecordPayload {
  status: EmotionRecordStatus;
  entries: EmotionSelectionEntry[];
  note?: string | null;
}

export interface EmotionRecord {
  id: string;
  user_id: string;
  resource_slug: string;
  session_id?: string | null;
  payload: EmotionRecordPayload;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
}

export type WheelStep =
  | "intro"
  | "exploring"
  | "reviewing"
  | "saving"
  | "saved"
  | "history";
export type ViewMode = "wheel" | "list";
