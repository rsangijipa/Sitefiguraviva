"use server";

import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { verifySession } from "@/lib/auth/server";
import { logger } from "@/lib/logger";

async function getAdminContext() {
  const session = await verifySession();
  if (!session) return { error: "Unauthorized", status: 401 } as const;
  if (!session.isAdmin) return { error: "Acesso negado", status: 403 } as const;
  return { session } as const;
}

export async function generateTestCertificate() {
  const context = await getAdminContext();
  if (!("session" in context))
    return { error: context.error, status: context.status };

  try {
    const supabase = createSupabaseServiceClient();
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id,title")
      .limit(1)
      .maybeSingle();
    if (courseError) throw courseError;
    if (!course)
      return {
        error: "Crie um curso antes de gerar um certificado de teste.",
        status: 409,
      };

    const certificateNumber = `IFV-TEST-${Date.now().toString().slice(-6)}`;
    const { data, error } = await supabase
      .from("certificates")
      .insert({
        user_id: context.session.uid,
        course_id: course.id,
        code: certificateNumber,
        issued_at: new Date().toISOString(),
        metadata: {
          isTest: true,
          studentName: context.session.email || "Administrador",
          courseName: course.title,
          issuedBy: context.session.uid,
        },
      } as any)
      .select("id")
      .single();
    if (error) throw error;

    return {
      success: true,
      certificateId: data.id,
      certificateNumber,
      message: "Certificado de teste criado com sucesso!",
    };
  } catch (error) {
    logger.error("Generate test certificate failed", { error });
    return { error: "Erro ao gerar certificado de teste", status: 500 };
  }
}

export async function deleteTestCertificates() {
  const context = await getAdminContext();
  if (!("session" in context))
    return { error: context.error, status: context.status };

  try {
    const supabase = createSupabaseServiceClient();
    const { data: rows, error: listError } = await supabase
      .from("certificates")
      .select("id")
      .contains("metadata", { isTest: true });
    if (listError) throw listError;
    const ids = (rows ?? []).map((row) => row.id);
    if (ids.length) {
      const { error } = await supabase
        .from("certificates")
        .delete()
        .in("id", ids);
      if (error) throw error;
    }
    return {
      success: true,
      deleted: ids.length,
      message: `${ids.length} certificados de teste removidos.`,
    };
  } catch (error) {
    logger.error("Delete test certificates failed", { error });
    return { error: "Erro ao deletar certificados de teste", status: 500 };
  }
}
