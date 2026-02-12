import { Timestamp } from "firebase/firestore";

// --- PRIMITIVES ---

export type Role = "admin" | "tutor" | "student";
export type EnrollmentStatus =
  | "pending"
  | "active"
  | "expired"
  | "refunded"
  | "canceled"
  | "completed";
export type BlockType =
  | "text"
  | "video"
  | "image"
  | "file"
  | "pdf"
  | "quiz"
  | "link"
  | "callout"
  | "divider";
export type LessonType = "video" | "text" | "quiz" | "library" | "live";

// --- FIRESTORE DOCUMENTS (Source of Truth) ---

export interface UserDoc {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: Role;
  isActive: boolean;
  stripeCustomerId?: string;
  createdAt: Timestamp;
  lastLogin?: Timestamp;
}

export interface CourseDoc {
  id: string; // Document ID
  title: string;
  subtitle?: string;
  description?: string;
  slug?: string; // friendly url
  coverImage?: string; // URL
  image?: string; // Legacy/Compatibility URL
  thumbnail?: string; // URL

  // Quick Details
  instructor?: string;
  instructorName?: string;
  instructorTitle?: string;
  workload?: number;
  duration?: string;
  level?: string;
  category?: string;

  // Status & Visibility
  isPublished: boolean;
  status: "draft" | "open" | "closed" | "archived";
  contentRevision: number; // For certificate snapshotting and structural tracking

  // Sales & Access
  billing?: {
    type: "subscription" | "one_time" | "free";
    priceId?: string; // Stripe Price ID
    productId?: string; // Stripe Product ID
  };

  // Metadata
  tags?: string[];
  details?: {
    intro?: string; // Short intro text
    duration?: string; // "10 semanas"
    level?: "beginner" | "intermediate" | "advanced";
  };

  // Relationships
  team?: {
    [uid: string]: { role: "author" | "tutor" | "admin" };
  };

  stats?: {
    studentsCount: number;
    lessonsCount?: number; // Added for PRG-05
    rating?: number;
  };

  // Advanced Settings
  communityEnabled?: boolean;
  certificateRules?: {
    enabled: boolean;
    minProgressPercent: number;
  };

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ModuleDoc {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  isPublished: boolean;
  slug?: string;

  // Sub-collection 'lessons' is not nested here in DB, but often hydrated in UI

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface LessonDoc {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  isPublished: boolean;
  slug?: string;

  type: LessonType;
  duration?: number; // Minutes

  // Content References
  videoUrl?: string; // Vimeo/Youtube
  thumbnail?: string;

  // Sub-collection 'blocks' (or embedded for MVP)
  blocks?: Block[];

  // Access control
  isFreePreview?: boolean;

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface BlockDoc {
  id: string;
  lessonId?: string;
  type: BlockType;
  order: number;
  title?: string;
  content: {
    text?: string; // Markdown
    url?: string;
    fileId?: string;
    videoId?: string;
    calloutType?: "info" | "warning" | "success" | "tip";
    caption?: string;
    // extended types...
  };
  isPublished: boolean;
  createdAt?: Timestamp;
}

export interface MaterialDoc {
  id: string;
  courseId: string;
  title: string;
  type: "pdf" | "link" | "archive";
  url: string;
  description?: string;
  isPublished: boolean;
  downloadCount?: number;
  createdAt: Timestamp;
}

export interface AnnouncementDoc {
  id: string;
  courseId: string;
  title: string;
  content: string; // Markdown
  authorId: string;
  isPinned: boolean;
  publishAt: Timestamp;
  createdAt: Timestamp;
}

export interface NotificationDoc {
  id: string;
  userId: string;
  type:
    | "announcement"
    | "community_reply"
    | "course_update"
    | "certificate_available";
  title: string;
  body?: string;
  link: string; // Internal route
  isRead: boolean;
  readAt?: Timestamp;
  createdAt: Timestamp;
  metadata?: {
    courseId?: string;
    threadId?: string;
  };
}

export interface CommunityThreadDoc {
  id: string;
  courseId: string;
  title: string;
  content: string;
  authorId: string;
  // Author Denormalization (Speed)
  authorName: string;
  authorAvatar?: string;

  // Stats
  replyCount: number;
  likeCount: number;
  viewCount: number;

  isPinned: boolean;
  isLocked: boolean;
  isDeleted?: boolean;

  lastReplyAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CommunityReplyDoc {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  likeCount: number;
  isDeleted?: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// --- USER PROGRESS & CERTIFICATES ---

export interface EnrollmentDoc {
  uid: string; // Cannonical UID (Firebase Auth)
  userId?: string; // Legacy/Alias
  courseId: string;
  userName?: string; // Denormalized for certificates
  status: EnrollmentStatus;

  // Commerce
  paymentStatus?: "paid" | "pending" | "failed";
  subscriptionId?: string; // Stripe

  enrolledAt: Timestamp;
  paidAt?: Timestamp;
  paymentMethod?: "pix" | "stripe" | "subscription" | "free";
  sourceRef?: string; // Idempotency key (sessionId, chargeId, etc.)
  accessUntil?: Timestamp; // For subscriptions

  approvedBy?: string; // Admin UID for manual approvals
  approvedAt?: Timestamp;
  rejectionReason?: string;

  courseVersionAtEnrollment?: number;
  courseSnapshotAtEnrollment?: {
    publishedLessonIds: string[];
  };
  completedAt?: Timestamp;
  lastAccessedAt?: Timestamp;

  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Synced Stats (for fast UI)
  progressSummary?: {
    completedLessonsCount: number; // Renamed for consistency
    totalLessons: number;
    percent: number;
    lastLessonId?: string;
    lastAccess?: any;
  };
}

// ... (removed old interface if it existed there, or just keep the export line and remove the manual interface)
export type { CertificateDoc } from "./certificate";

// --- LEGACY COMPATIBILITY & UI HELPERS ---
export type Course = CourseDoc;
export type Module = ModuleDoc & { lessons: Lesson[] };
export type Lesson = LessonDoc & {
  blocks?: Block[];
  isCompleted?: boolean;
  isLocked?: boolean;
  maxWatchedSecond?: number;
  percent?: number;
};
// ...
export interface ProgressDoc {
  userId: string;
  courseId: string;
  lessonId: string;

  status: "completed" | "in_progress";
  percent?: number; // Video watch %
  maxWatchedSecond?: number; // Max second watched

  completedAt?: Timestamp;
  updatedAt: Timestamp; // Last touched
}
export type Block = BlockDoc;
export type Material = MaterialDoc;

export interface AuditLogDoc {
  id: string;
  eventType: string;
  actor: {
    uid: string;
    email?: string;
    role?: string;
  };
  target: {
    id: string;
    collection: string;
  };
  payload?: any;
  diff?: {
    before?: any;
    after?: any;
  };
  timestamp: Timestamp;
}
