export type ActiveTab =
  | "opening"
  | "guided"
  | "free"
  | "practice"
  | "review"
  | "completion"
  | "admin";

export type LevelType = "essential" | "deep";

export interface ReferenceItem {
  id: string;
  author: string;
  title: string;
  year: number;
  publisher?: string;
  chapter?: string;
  pages?: string;
  url?: string;
  doi?: string;
}

export interface ContactStage {
  id: string;
  slug: string;
  label: string;
  position: number;
  shortDefinition: string;
  essentialContent: string[];
  expandedContent: string[];
  everydayExample: string;
  clinicalExample?: string;
  reflectionQuestion: string;
  relatedConcepts: string[];
  references: ReferenceItem[];
  authorNote?: string;
  status: "published" | "draft";
}

export interface ScenarioItem {
  id: string;
  title: string;
  slug: string;
  context: string;
  activityType:
    | "position_on_cycle"
    | "sequence"
    | "compare"
    | "reflection"
    | "free_response";
  difficulty: "iniciante" | "intermediário" | "aprofundado";
  content: {
    prompt: string;
    targetStageSlug?: string;
    options?: string[];
    steps?: string[];
  };
  feedback: {
    discussion: string;
    alternativeReadings?: string[];
  };
  scored: boolean;
  status: "published" | "draft";
  position: number;
}

export interface ContactCycleConfig {
  title: string;
  description: string;
  introContent: string;
  completionContent: string;
  guidedEnabled: boolean;
  freeEnabled: boolean;
  practiceEnabled: boolean;
  estimatedMinutes: number;
  status: "published" | "draft";
}

export interface UserSessionRecord {
  startedAt: string;
  completedAt?: string;
  durationSeconds: number;
  mode: string;
  visitedStages: string[];
  savedStages: string[];
  reflections: Record<string, string>;
}
