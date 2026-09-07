import type {
  EnrollmentStatus,
  Json,
  PaymentStatus,
} from "@/infrastructure/supabase/database.types";

export interface EnrollmentRecord {
  id: string;
  userId: string | null;
  legacyFirebaseUid: string | null;
  courseId: string;
  userName: string | null;
  status: EnrollmentStatus;
  paymentStatus: PaymentStatus | null;
  subscriptionId: string | null;
  enrolledAt: string;
  paidAt: string | null;
  paymentMethod: "pix" | "stripe" | "subscription" | "free" | null;
  sourceRef: string | null;
  accessUntil: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  courseVersionAtEnrollment: number | null;
  courseSnapshotAtEnrollment: Json;
  completedAt: string | null;
  lastAccessedAt: string | null;
  progressSummary: Json;
  createdAt: string;
  updatedAt: string;
}
