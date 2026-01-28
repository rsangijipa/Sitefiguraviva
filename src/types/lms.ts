import { Timestamp } from 'firebase/firestore';

export type BlockType = 'text' | 'video' | 'image' | 'pdf' | 'quiz' | 'link' | 'callout';

export interface Block {
    id: string;
    type: BlockType;
    order: number;
    title?: string;
    isPublished: boolean; // Consistent with other entities
    content: {
        text?: string; // Markdown
        url?: string; // video, link, pdf
        fileId?: string; // storage ref
        videoId?: string; // YouTube ID
        calloutType?: 'info' | 'warning' | 'success';
        quizId?: string;
    };
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export interface Lesson {
    id: string;
    moduleId: string;
    courseId: string;
    title: string;
    description?: string;
    order: number;
    isPublished: boolean;
    duration?: string | number; // Estimated minutes or string format
    videoUrl?: string; // Legacy support
    thumbnail?: string;
    blocks?: Block[]; // Optional, fetched on demand
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export interface Module {
    id: string;
    courseId: string;
    title: string;
    description?: string;
    order: number;
    isPublished: boolean;
    lessons?: Lesson[]; // Optional, fetched on demand
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export interface Course {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    coverImage?: string;
    isPublished: boolean;
    tags?: string[];
    billing?: {
        priceIdMonthly?: string;
        priceIdYearly?: string;
    };
    details?: {
        intro?: string;
        format?: string;
        schedule?: string;
    };
    mediators?: {
        name: string;
        bio: string;
        photo: string;
    }[];
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

// Enrollment & Progress Types

export type EnrollmentStatus = 'pending' | 'active' | 'expired' | 'cancelled' | 'blocked';

export interface Enrollment {
    id: string; // uid_courseId
    uid: string;
    courseId: string;
    status: EnrollmentStatus;
    paymentStatus?: 'paid' | 'unpaid' | 'past_due';
    createdAt: Timestamp;
    updatedAt: Timestamp;
    completedAt?: Timestamp;
    lastLessonId?: string;
}

export interface CourseProgress {
    id: string; // uid_courseId
    uid: string;
    courseId: string;
    completedLessons: string[]; // Array of lessonIds
    lastViewedAt: Timestamp;
    startedAt: Timestamp;
    percentComplete: number;
}
