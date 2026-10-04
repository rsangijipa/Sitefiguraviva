"use server";

import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import type { Json } from "@/infrastructure/supabase/database.types";

/** Generates a clearly marked development certificate for the current admin. */
export async function generateTestCertificate() {
  try {
    const admin = await requireAdmin();
    const supabase = createSupabaseServiceClient();
    const [profileResult, courseResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("display_name")
        .eq("id", admin.uid)
        .maybeSingle(),
      supabase.from("courses").select("id, title").limit(1).maybeSingle(),
    ]);
    if (profileResult.error) throw profileResult.error;
    if (courseResult.error) throw courseResult.error;
    if (!courseResult.data) {
      return { error: "Crie um curso antes de gerar um certificado de teste." };
    }

    const certificateId = randomUUID();
    const certificateNumber = `IFV-TEST-${Date.now().toString().slice(-6)}`;
    const metadata = {
      isTest: true,
      studentName:
        profileResult.data?.display_name || admin.email || "Aluno de Teste",
      courseName: courseResult.data.title,
      instructorName: "Lilian Vanessa Gusmão",
      instructorTitle: "Psicóloga e Gestalt-terapeuta",
      courseWorkload: 40,
      createdBy: admin.uid,
    } as unknown as Json;
    const { error: insertError } = await supabase.from("certificates").insert({
      id: certificateId,
      user_id: admin.uid,
      course_id: courseResult.data.id,
      code: certificateNumber,
      metadata,
    });
    if (insertError) throw insertError;

    return {
      success: true,
      certificateId,
      certificateNumber,
      message: "Certificado de teste criado com sucesso!",
    };
  } catch (error) {
    console.error("Generate test certificate error:", error);
    return {
      error: "Erro ao gerar certificado de teste",
      details: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/** Deletes all test certificates. Restricted to administrators. */
export async function deleteTestCertificates() {
  try {
    await requireAdmin();
    const supabase = createSupabaseServiceClient();
    const { data: certificates, error: readError } = await supabase
      .from("certificates")
      .select("id")
      .contains("metadata", { isTest: true });
    if (readError) throw readError;

    const ids = (certificates ?? []).map((certificate) => certificate.id);
    if (ids.length > 0) {
      const { error: deleteError } = await supabase
        .from("certificates")
        .delete()
        .in("id", ids);
      if (deleteError) throw deleteError;
    }

    return {
      success: true,
      deleted: ids.length,
      message: `${ids.length} certificados de teste removidos.`,
    };
  } catch (error) {
    console.error("Delete test certificates error:", error);
    return {
      error: "Erro ao deletar certificados de teste",
      details: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
