/**
 * Assessment & Quiz System - Type Definitions
 *
 * Covers multiple assessment types:
 * - Multiple Choice (auto-graded)
 * - True/False (auto-graded)
 * - Essay (manual grading required)
 * - Practical Assignment (file upload + manual grading)
 */

export type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "essay"
  | "practical";
export type AssessmentStatus = "draft" | "published" | "archived";
export type SubmissionStatus =
  | "pending"
  | "submitted"
  | "graded"
  | "failed"
  | "passed";

/**
 * Question Base Interface
 */
export interface QuestionBase {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  points: number;
  order: number;
}

/**
 * Multiple Choice Question
 */
export interface MultipleChoiceQuestion extends QuestionBase {
  type: "multiple_choice";
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  allowMultiple?: boolean; // Permite múltiplas respostas corretas
}

/**
 * True/False Question
 */
export interface TrueFalseQuestion extends QuestionBase {
  type: "true_false";
  correctAnswer: boolean;
}

/**
 * Essay Question
 */
export interface EssayQuestion extends QuestionBase {
  type: "essay";
  minWords?: number;
  maxWords?: number;
  rubric?: string; // Critérios de avaliação para o instrutor
}

/**
 * Practical Assignment
 */
export interface PracticalQuestion extends QuestionBase {
  type: "practical";
  instructions: string;
  acceptedFileTypes?: string[]; // e.g., ['.pdf', '.docx', '.mp4']
  maxFileSize?: number; // em MB
  rubric?: string;
}

export type Question =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | EssayQuestion
  | PracticalQuestion;

/**
 * Assessment Document (Firestore)
 */
export interface AssessmentDoc {
  id: string;
  courseId: string;
  moduleId?: string; // Opcional: vincular a módulo específico
  lessonId?: string; // Opcional: quiz ao final de aula

  title: string;
  description: string;
  instructions?: string;

  questions: Question[];

  // Settings
  timeLimit?: number; // em minutos (null = sem limite)
  passingScore: number; // Porcentagem mínima para passar (e.g., 70)
  maxAttempts?: number; // null = ilimitado
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean; // Para multiple choice
  showCorrectAnswers?: boolean; // Após submissão

  // Status
  status: AssessmentStatus;
  isRequired: boolean; // Necessário para certificação

  // Stats
  totalPoints: number; // Soma dos points de todas as questões
  averageScore?: number;
  completionRate?: number;

  // Metadata
  createdAt: any; // Timestamp
  updatedAt: any;
  createdBy: string; // Admin UID
}

/**
 * Student's Answer
 */
export interface StudentAnswer {
  questionId: string;

  // Múltipla escolha / Verdadeiro ou Falso
  selectedOptions?: string[]; // IDs das opções selecionadas
  booleanAnswer?: boolean;

  // Dissertativa / Prática
  textAnswer?: string;
  fileUrl?: string;

  // Auto-grading
  isCorrect?: boolean;
  pointsEarned?: number;
}

/**
 * Assessment Submission (Firestore)
 * Path: assessmentSubmissions/{submissionId}
 */
export interface AssessmentSubmissionDoc {
  id: string;
  assessmentId: string;
  userId: string;
  courseId: string;

  // Answers
  answers: StudentAnswer[];

  // Grading
  status: SubmissionStatus;
  score?: number; // Pontuação total
  percentage?: number; // Porcentagem (score / totalPoints)
  passed?: boolean;

  // Manual grading (for essays/practicals)
  gradedBy?: string; // Admin/Instructor UID
  feedback?: string;

  // Attempts
  attemptNumber: number;

  // Timestamps
  startedAt: any; // Timestamp
  submittedAt?: any; // Timestamp
  gradedAt?: any; // Timestamp
}

/**
 * User's Assessment Progress (aggregated)
 * Path: users/{uid}/assessmentProgress/{assessmentId}
 */
export interface UserAssessmentProgress {
  assessmentId: string;
  userId: string;
  courseId: string;

  attempts: number;
  bestScore: number;
  bestPercentage: number;
  passed: boolean;

  lastAttemptAt: any; // Timestamp
  submissions: string[]; // Array de submission IDs
}

/**
 * Assessment Analytics (for admin)
 */
export interface AssessmentAnalytics {
  assessmentId: string;

  totalSubmissions: number;
  totalStudents: number;
  completionRate: number;

  averageScore: number;
  medianScore: number;
  lowestScore: number;
  highestScore: number;

  passRate: number; // % de alunos que passaram

  // Per-Question Stats
  questionStats: {
    questionId: string;
    correctRate: number; // % de acertos
    averagePoints: number;
  }[];
}
