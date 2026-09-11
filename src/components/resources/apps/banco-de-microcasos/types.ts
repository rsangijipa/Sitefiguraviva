export type Level = "Introdutório" | "Intermediário" | "Avançado";

export interface MicroCaseStep {
  title: string;
  type:
    | "observe"
    | "differentiate"
    | "question"
    | "interventions"
    | "context_shift";
  prompt: string;
  options?: string[];
}

export interface MicroCaseClosure {
  question: string;
  observables: string[];
  readings: string[];
  concepts: string[];
  questionsRemaining: string[];
  references: string[];
}

export interface MicroCase {
  id: string;
  title: string;
  theme: string;
  level: Level;
  summary: string;
  minutes: number;
  vignette: string;
  context: string[];
  quote: string;
  steps: MicroCaseStep[];
  closure: MicroCaseClosure;
}

export type ViewState = "home" | "case" | "history" | "closure";
