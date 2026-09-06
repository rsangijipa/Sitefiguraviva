import "server-only";

import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import type { TableRow } from "@/infrastructure/supabase/database.types";
import type { EnrollmentRecord } from "../domain/enrollment.types";

type EnrollmentRow = TableRow<"enrollments">;

function mapEnrollment(row: EnrollmentRow): EnrollmentRecord {
  return {
    id: row.id,
    userId: row.user_id,
    legacyFirebaseUid: row.legacy_firebase_uid,
    courseId: row.course_id,
    userName: row.user_name,
    status: row.status,
    paymentStatus: row.payment_status,
    subscriptionId: row.subscription_id,
    enrolledAt: row.enrolled_at,
    paidAt: row.paid_at,
    paymentMethod: row.payment_method,
    sourceRef: row.source_ref,
    accessUntil: row.access_until,
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
    rejectionReason: row.rejection_reason,
    courseVersionAtEnrollment: row.course_version_at_enrollment,
    courseSnapshotAtEnrollment: row.course_snapshot_at_enrollment,
    completedAt: row.completed_at,
    lastAccessedAt: row.last_accessed_at,
    progressSummary: row.progress_summary,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function findEnrollmentBySupabaseUser(
  userId: string,
  courseId: string,
): Promise<EnrollmentRecord | null> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapEnrollment(data) : null;
}

export async function listUserEnrollments(
  userId: string,
): Promise<EnrollmentRecord[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapEnrollment);
}

export async function findEnrollmentByLegacyFirebaseUid(
  legacyFirebaseUid: string,
  courseId: string,
): Promise<EnrollmentRecord | null> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select("*")
    .eq("legacy_firebase_uid", legacyFirebaseUid)
    .eq("course_id", courseId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapEnrollment(data) : null;
}

export async function listCourseEnrollments(
  courseId: string,
): Promise<EnrollmentRecord[]> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select("*")
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapEnrollment);
}
