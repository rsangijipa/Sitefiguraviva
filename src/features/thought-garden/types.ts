export type ThoughtStatus =
  | "draft"
  | "placed"
  | "floating"
  | "removed"
  | "saved";

export interface ClientThought {
  id: string;
  thoughtText: string;
  optionalTitle?: string;
  status: ThoughtStatus;
  savedRecordId?: string;
  createdAt: number;
}

export interface SavedThoughtRecord {
  id: string;
  user_id: string;
  client_request_id: string;
  schema_version: number;
  content_version: string;
  thought_text: string;
  optional_title: string | null;
  status: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export type GardenStep =
  | "intro"
  | "composing"
  | "observing"
  | "reviewing"
  | "saving"
  | "saved"
  | "history"
  | "completion"
  | "exited";

export const MAX_EPHEMERAL_LEAVES = 20;
export const MAX_THOUGHT_LENGTH = 500;
export const MIN_THOUGHT_LENGTH = 1;
export const MAX_TITLE_LENGTH = 80;
