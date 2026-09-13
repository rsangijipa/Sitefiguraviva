export type QuestionKey =
  | "attention"
  | "body"
  | "feeling"
  | "need"
  | "reflection";

export interface QuestionConfig {
  id: QuestionKey;
  stepNumber: number;
  question: string;
  subtext: string;
  tags: string[];
  themeColor: {
    primary: string;
    blobColor1: string;
    blobColor2: string;
    accentNode: string;
  };
}

export interface PerceptionPayload {
  attention: string;
  body: string;
  feeling: string;
  need: string;
  reflection: string;
}

export interface SavedPerception extends PerceptionPayload {
  id: string;
  createdAt: string;
}
