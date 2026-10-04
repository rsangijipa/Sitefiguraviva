"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { buildPixPayload, getPixConfig } from "@/lib/pix";
import { findPixOrder } from "@/lib/pix-order.server";

/** Only the persisted application identifies the student and the course. */
export async function enrollLead(applicationId: string, _clientData?: unknown) {
  try {
    const actor = await requireAdmin();
    const db = createSupabaseServiceClient();
    const { data: app, error: appError } = await db
      .from("applications")
      .select("id,user_id,course_id,status")
      .eq("id", applicationId)
      .maybeSingle();
    if (appError || !app?.user_id)
      throw new Error("Ficha vinculada a uma conta é necessária.");
    const { data: profile, error: profileError } = await db
      .from("profiles")
      .select("id,is_active")
      .eq("id", app.user_id)
      .maybeSingle();
    if (profileError || !profile?.is_active)
      throw new Error(
        "A conta do interessado está desativada ou indisponível.",
      );
    const { data: enrollment, error: enrollmentError } = await db
      .from("enrollments")
      .select("status")
      .eq("user_id", app.user_id)
      .eq("course_id", app.course_id)
      .maybeSingle();
    if (enrollmentError)
      throw new Error("Não foi possível consultar a matrícula.");
    if (enrollment && ["active", "completed"].includes(enrollment.status))
      return {
        success: true,
        userId: app.user_id,
        courseId: app.course_id,
        alreadyEnrolled: true,
        paymentPending: false,
      };
    if (!["submitted", "contacted"].includes(app.status))
      throw new Error(
        "Esta ficha não está disponível para preparar a cobrança.",
      );
    const existing = await findPixOrder(app.user_id, app.course_id);
    if (existing) {
      return {
        success: true,
        userId: app.user_id,
        courseId: app.course_id,
        paymentPending: existing.status === "pending",
        orderStatus: existing.status,
      };
    }
    const config = getPixConfig();
    if (!config)
      throw new Error(
        "Configure a chave Pix e o recebedor antes de preparar a cobrança.",
      );
    const { data: course, error: courseError } = await db
      .from("courses")
      .select("pix_price_cents,is_published,status")
      .eq("id", app.course_id)
      .maybeSingle();
    if (
      courseError ||
      !course?.is_published ||
      course.status !== "open" ||
      !Number.isInteger(course.pix_price_cents) ||
      course.pix_price_cents <= 0
    )
      throw new Error(
        "Configure o valor da matrícula ou primeira parcela e abra as inscrições do curso.",
      );
    const id = randomUUID(),
      txid = id.replaceAll("-", "").slice(0, 25);
    const { data, error } = await db.rpc("prepare_application_pix", {
      p_actor: actor.uid,
      p_application: app.id,
      p_id: id,
      p_amount: course.pix_price_cents,
      p_txid: txid,
      p_payload: buildPixPayload(config, {
        amount: course.pix_price_cents / 100,
        txId: txid,
      }),
      p_merchant: config.merchantName,
    });
    if (error || !data)
      throw new Error(
        "Não foi possível preparar a cobrança. Confira a ficha, o consentimento e a matrícula existente.",
      );
    revalidatePath("/admin/applications");
    revalidatePath("/admin/enrollments");
    revalidatePath(`/inscricao/${app.course_id}`);
    return {
      success: true,
      userId: app.user_id,
      courseId: app.course_id,
      paymentPending: true,
      orderStatus: "pending",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível preparar a inscrição.",
    };
  }
}
