export type ExperienceStage =
  | "reading"
  | "reflecting"
  | "analyzing"
  | "conclusion";

export type CaseTheme =
  | "ansiedade"
  | "depressao"
  | "trauma"
  | "relacionamento"
  | "identidade";

export interface ClinicalCase {
  id: number;
  theme: CaseTheme;
  title: string;
  subtitle: string;
  patientProfile: {
    name: string;
    age: number;
    occupation: string;
    context: string;
  };
  presentingIssue: string;
  background: string;
  keyObservations: string[];
  therapeuticApproach: string;
  learningPoints: string[];
  reflectionQuestions: string[];
  estimatedTimeMinutes: number;
}

export interface UserAnalysis {
  caseId: number;
  caseTitle: string;
  theme: CaseTheme;
  selectedFocusAreas: string[];
  reflectionNotes: string;
  timeSpentSeconds: number;
  completedAt: string;
}

export interface AggregatedStats {
  totalCasesCompleted: number;
  totalTimeSpentSeconds: number;
  themesExplored: CaseTheme[];
  lastCompletedAt?: string;
}

export interface CaseProgress {
  currentCaseIndex: number;
  stage: ExperienceStage;
  selectedFocusAreas: string[];
  reflectionNotes: string;
  caseStartTime: number;
  sessionStartTime: number;
}
