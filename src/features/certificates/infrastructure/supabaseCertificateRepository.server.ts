import { createSupabaseBrowserClient } from "@/infrastructure/supabase/client";
import type { TableRow } from "@/infrastructure/supabase/database.types";
import type { Certificate } from "@/types/certificate";

type CertificateRow = TableRow<"certificates">;

function mapCertificateRow(row: CertificateRow): Certificate {
  const metadata = (row.metadata || {}) as Record<string, unknown>;
  const studentName =
    (metadata.studentName as string | undefined) ||
    (metadata.userName as string | undefined) ||
    row.user_id ||
    "Aluno";
  const courseName =
    (metadata.courseName as string | undefined) ||
    (metadata.courseTitle as string | undefined) ||
    row.course_id;

  return {
    id: row.id,
    userId: row.user_id || "",
    courseId: row.course_id,
    studentName,
    courseName,
    certificateNumber: row.code,
    issuedAt: row.issued_at,
    completedAt: row.issued_at,
    validationUrl: `/certificado/${row.code}`,
    status: "issued",
    issuedBy: "system",
    templateVersion: metadata.templateVersion as string | undefined,
    enrolledAt: metadata.enrolledAt as string | undefined,
    userName: studentName,
    courseTitle: courseName,
    code: row.code,
    pdfUrl: metadata.pdfUrl as string | undefined,
    instructorName: metadata.instructorName as string | undefined,
    instructorTitle: metadata.instructorTitle as string | undefined,
    courseWorkload: metadata.courseWorkload as number | undefined,
    integrityHash: metadata.integrityHash as string | undefined,
    courseVersionAtCompletion: metadata.courseVersionAtCompletion as
      | number
      | undefined,
    courseSnapshot: metadata.courseSnapshot as Certificate["courseSnapshot"],
  };
}

export async function getCertificate(
  userId: string,
  courseId: string,
  supabase = createSupabaseBrowserClient(),
): Promise<Certificate | null> {
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapCertificateRow(data as CertificateRow) : null;
}

export async function getUserCertificates(
  userId: string,
  supabase = createSupabaseBrowserClient(),
): Promise<Certificate[]> {
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return (data ?? []).map((row) => mapCertificateRow(row as CertificateRow));
}
