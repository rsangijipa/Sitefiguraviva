export type AnswerValue =
  | "never"
  | "rarely"
  | "sometimes"
  | "frequently"
  | "almost_always"
  | 1
  | 2
  | 3
  | 4
  | 5;
export type InstrumentMode = "demo" | "validated";
export type ScreenStatus =
  | "negative"
  | "borderline"
  | "positive"
  | "not_applicable";
export type ScoringType =
  | "sum"
  | "mean"
  | "mean_domain"
  | "dichotomous"
  | "custom"
  | "percentage"
  | "multi_domain";

export interface Answer {
  questionId: string;
  value: AnswerValue;
}

export interface Question {
  id: string;
  text: string;
  description?: string;
}

/* ============ TIPOS PARA INSTRUMENTOS VALIDADOS ============ */

export interface AssessmentQuestion {
  id: string;
  order: number;
  officialText?: string;
  demoText: string;
  domain?: string;
  responseScale: string;
  reverse?: boolean;
  safetyCritical?: boolean;
  scoringNote?: string;
  conditional?: boolean;
}

export interface SafetyRule {
  questionId: string;
  trigger: (answer: any) => boolean;
  level: "info" | "attention" | "urgent";
  message: string;
}

export interface Evidence {
  authors?: string;
  year?: number;
  reference?: string;
  licensingNote?: string;
}

export interface AssessmentResult {
  instrumentId: string;
  completedAt: string;
  rawScore?: number;
  normalizedScore?: number;
  maxScore?: number;
  classification?: string;
  screenStatus?: ScreenStatus;
  domains?: Array<{
    id: string;
    label: string;
    score: number;
    max?: number;
    normalized?: number;
  }>;
  answeredItems: number;
  missingItems: number;
  valid: boolean;
  safetyFlags: string[];
  interpretation: string;
  disclaimer: string;
}

export interface ValidatedInstrument {
  id: string;
  slug: string;
  name: string;
  publicTitle: string;
  acronym?: string;
  type: "validated_instrument";
  mode: InstrumentMode;
  category: string;
  purpose: string;
  population: string;
  timeframe?: string;
  questions: AssessmentQuestion[];
  scoring: {
    type: ScoringType;
    algorithm: (responses: Record<string, any>) => AssessmentResult;
  };
  interpretation: Array<{
    condition: (score: number) => boolean;
    classification: string;
    screenStatus: ScreenStatus;
    description: string;
  }>;
  safetyRules?: SafetyRule[];
  evidence: Evidence;
  disclaimer: string;
  licensing?: {
    status: "open" | "citation_required" | "permission_required" | "unknown";
    note: string;
  };
}

/* ============ TIPOS PARA QUIZZES AUTORAIS ============ */

export interface QuestionnaireBase {
  id: string;
  title: string;
  description: string;
  subtitle?: string;
  category: string;
  type: "quiz" | "screening" | "validated_instrument";
  icon?: string;
  questions: Question[];
  disclaimer?: string;
  estimatedTime?: number;
}

export interface Quiz extends QuestionnaireBase {
  type: "quiz";
  answerOptions: string[];
}

export interface Screening extends QuestionnaireBase {
  type: "screening";
  answerOptions: string[];
  domains?: ScreeningDomain[];
  resultRules?: ResultRule[];
}

export interface ScreeningDomain {
  id: string;
  name: string;
  description: string;
  questionIds: string[];
}

export interface ResultRule {
  domain: string;
  condition: (score: number) => boolean;
  label: string;
  color: string;
}

export interface QuizResult {
  id: string;
  questionnaireId: string;
  questionnaireName: string;
  questionnaire: Quiz | Screening | ValidatedInstrument;
  timestamp: number;
  answers: Answer[];
  score?: number;
  results?: DomainResult[];
}

export interface DomainResult {
  domain: string;
  score: number;
  label: string;
  percentage: number;
  description?: string;
}

export type Category =
  | "mental-health"
  | "self-knowledge"
  | "career"
  | "neurodiversity";

export interface CategoryInfo {
  id: Category;
  name: string;
  description: string;
  icon: string;
  color: string;
}
