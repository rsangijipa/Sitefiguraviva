import type {
  BillingType,
  CourseStatus,
  Json,
  LessonType,
} from "@/infrastructure/supabase/database.types";

export interface CourseRecord {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string | null;
  description: string | null;
  coverImageUrl: string | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  instructorName: string | null;
  instructorTitle: string | null;
  workloadMinutes: number | null;
  durationLabel: string | null;
  level: string | null;
  category: string | null;
  isPublished: boolean;
  status: CourseStatus;
  contentRevision: number;
  billingType: BillingType;
  stripePriceId: string | null;
  stripeProductId: string | null;
  tags: string[];
  details: Json;
  team: Json;
  stats: Json;
  communityEnabled: boolean;
  certificateRules: Json;
  createdAt: string;
  updatedAt: string;
}

export interface CourseModuleRecord {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  order: number;
  isPublished: boolean;
  slug: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LessonRecord {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  description: string | null;
  order: number;
  isPublished: boolean;
  slug: string | null;
  type: LessonType;
  durationMinutes: number | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  blocks: Json;
  isFreePreview: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseOutlineRecord {
  course: CourseRecord;
  modules: Array<CourseModuleRecord & { lessons: LessonRecord[] }>;
}
