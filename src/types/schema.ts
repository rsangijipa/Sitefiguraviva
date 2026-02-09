import { Timestamp } from "firebase/firestore";

// Allow flexible timestamp types (client or admin SDK)
type FlexibleTimestamp =
  | Timestamp
  | { seconds: number; nanoseconds: number }
  | any;

/**
 * Enrollment SSoT
 * Document ID: `${uid}_${courseId}`
 * Path: `enrollments/{id}`
 */
export interface Enrollment {
  uid: string;
  courseId: string;
  status: "active" | "locked" | "expired";
  createdAt: FlexibleTimestamp | Date;
  updatedAt?: FlexibleTimestamp | Date;

  // Metadata for audit
  enrolledBy?: string; // 'admin' | 'system' | 'stripe'
  reason?: string;
}
