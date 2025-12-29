export interface Question {
  id: number;
  text: string;
  isInverse: boolean;
}

export type ScoreZone = 'green' | 'yellow' | 'orange' | 'red';

export interface ResultData {
  zone: ScoreZone;
  score: number;
  title: string;
  description: string;
  actionPlan: string;
}

export interface AnswerOption {
  value: number;
  label: string;
}