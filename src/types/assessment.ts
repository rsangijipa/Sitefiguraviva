
import { Timestamp } from 'firebase/firestore';

export type QuestionType = 'multiple_choice' | 'single_choice' | 'text' | 'boolean';

export interface QuestionBase {
    id: string;
    text: string;
    type: QuestionType;
    points: number;
    required?: boolean;
    feedback?: string; // Shown after grading
}

export interface ChoiceQuestion extends QuestionBase {
    type: 'multiple_choice' | 'single_choice';
    options: {
        id: string;
        text: string;
        isCorrect?: boolean; // Only present in secure server-side version or strictly hidden
    }[];
    shuffleOptions?: boolean;
}

export interface TextQuestion extends QuestionBase {
    type: 'text';
    minLength?: number;
    maxLength?: number;
    placeholder?: string;
    rubric?: string; // Guide for manual grading
}

export interface BooleanQuestion extends QuestionBase {
    type: 'boolean';
    correctAnswer?: boolean;
}

export type Question = ChoiceQuestion | TextQuestion | BooleanQuestion;

export interface Assessment {
    id: string;
    courseId: string;
    moduleId: string; // Linked to a module
    title: string;
    description?: string;
    type: 'quiz' | 'exam' | 'assignment';

    // Config
    timeLimitMinutes?: number; // 0 = unlimited
    maxAttempts?: number; // 0 = unlimited
    passingScore: number; // Percentage 0-100
    shuffleQuestions?: boolean;

    // Status
    status: 'draft' | 'published' | 'archived';

    // Content
    questions: Question[]; // Or questionIds if using subcollection

    // Dates
    createdAt: Timestamp;
    updatedAt: Timestamp;
    dueDate?: Timestamp;
}

export interface Answer {
    questionId: string;
    value: string | string[] | boolean; // Option ID(s) or text
}

export interface Submission {
    id: string;
    assessmentId: string;
    userId: string;
    attemptNumber: number;

    // State
    status: 'in_progress' | 'submitted' | 'graded';
    answers: Record<string, Answer>; // Keyed by questionId

    // Grading
    score?: number;
    grade?: number; // 0-100
    passed?: boolean;
    feedback?: string;

    // Timing
    startedAt: Timestamp;
    submittedAt?: Timestamp;
    lastSavedAt?: Timestamp; // For autosave
}
