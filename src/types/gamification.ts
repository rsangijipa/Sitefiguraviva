import { Timestamp } from "firebase/firestore";

export type BadgeCategory = "learning" | "social" | "achievement" | "special";

export interface BadgeDefinition {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name or URL
  category: BadgeCategory;
  xpValue: number;
  isHidden?: boolean;
}

export interface UserGamificationProfile {
  uid: string;
  totalXp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Timestamp | null;
  badges: string[]; // List of badge IDs
  updatedAt: Timestamp;
}

export interface EarnedBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: Timestamp;
  courseId?: string; // Optional: badge tied to a specific course
}

export interface XpTransaction {
  id: string;
  userId: string;
  amount: number;
  reason:
    | "lesson_completed"
    | "quiz_passed"
    | "course_completed"
    | "daily_login"
    | "bonus"
    | "admin_reward";
  metadata?: Record<string, any>;
  timestamp: Timestamp;
}
