"use server";
import { verifySession, requireAdmin } from "@/lib/auth/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { buildPixPayload, getPixConfig } from "@/lib/pix";
import { findPixOrder } from "@/lib/pix-order.server";
import type { PixOrderRow } from "@/infrastructure/supabase/database.types";
import { z } from "zod";
interface PixResult {
  success: boolean;
  configured?: boolean;
  payload?: string | null;
  order?: PixOrderRow;
  error?: string;
}
export async function generatePixPayload(courseId: string): Promise<PixResult> {
  const session = await verifySession();
  if (!session) return { success: false, error: "Faça login para continuar." };
  try {
    const existing = await findPixOrder(session.uid, courseId);
    if (existing)
      return {
        success: true,
        configured: true,
        payload: existing.payload,
        order: existing,
      };
    const config = getPixConfig();
    if (!config) return { success: true, configured: false, payload: null };
    const db = createSupabaseServiceClient();
    const { data: course, error } = await db
      .from("courses")
      .select("pix_price_cents,is_published,status")
      .eq("id", courseId)
      .maybeSingle();
    if (
      error ||
      !course ||
      !course.is_published ||
      course.status !== "open" ||
      !Number.isInteger(course.pix_price_cents) ||
      course.pix_price_cents <= 0
    )
      return {
        success: false,
        error: "A cobrança inicial deste curso ainda não está disponível.",
      };
    const id = randomUUID();
    const txid = id.replaceAll("-", "").slice(0, 25);
    const payload = buildPixPayload(config, {
      amount: course.pix_price_cents / 100,
      txId: txid,
    });
    const { data, error: writeError } = await db.rpc(
      "create_manual_pix_order",
      {
        p_user: session.uid,
        p_course: courseId,
        p_id: id,
        p_amount: course.pix_price_cents,
        p_txid: txid,
        p_payload: payload,
        p_merchant: config.merchantName,
      },
    );
    if (writeError) throw writeError;
    const order = data as unknown as PixOrderRow;
    revalidatePath("/inscricao/" + courseId);
    return { success: true, configured: true, payload: order.payload, order };
  } catch {
    return {
      success: false,
      error:
        "Não foi possível preparar o Pix. Confira sua ficha e tente novamente.",
    };
  }
}
export async function createEnrollmentPending(courseId: string) {
  return generatePixPayload(courseId);
}
export interface PixReconciliation {
  bankReference: string;
  receivedAt: string;
  receivedConfirmed: boolean;
  receivedAmountCents: number;
}
const reviewSchema = z.object({
  bankReference: z.string().trim().min(6).max(120),
  receivedAt: z
    .string()
    .datetime({ offset: true })
    .refine(
      (value) => Date.parse(value) <= Date.now() + 60000,
      "Data do recebimento não pode ser futura.",
    ),
  receivedConfirmed: z.literal(true),
  receivedAmountCents: z.number().int().positive().max(2147483647),
});
export async function approvePixEnrollment(
  userId: string,
  courseId: string,
  confirmation?: PixReconciliation,
) {
  const admin = await requireAdmin();
  const parsed = reviewSchema.safeParse(confirmation);
  if (!parsed.success)
    return {
      success: false,
      error:
        "Confirme o crédito bancário e informe identificador e data do recebimento.",
    };
  try {
    const { data, error } = await createSupabaseServiceClient().rpc(
      "review_manual_pix_order",
      {
        p_admin: admin.uid,
        p_user: userId,
        p_course: courseId,
        p_approve: true,
        p_bank_reference: parsed.data.bankReference,
        p_received_at: parsed.data.receivedAt,
        p_received_amount: parsed.data.receivedAmountCents,
        p_reason: null,
      },
    );
    if (error) throw error;
    revalidatePath("/admin/approvals");
    revalidatePath("/admin/enrollments");
    revalidatePath("/portal");
    revalidatePath("/inscricao/" + courseId);
    return {
      success: true,
      alreadyProcessed: !!(data as any)?.alreadyProcessed,
    };
  } catch {
    return {
      success: false,
      error:
        "Não foi possível aprovar. Confira o pedido, o estado da matrícula e se o crédito já foi utilizado.",
    };
  }
}
export async function rejectPixEnrollment(
  userId: string,
  courseId: string,
  reason: string,
) {
  const admin = await requireAdmin();
  if (
    typeof reason !== "string" ||
    reason.trim().length < 5 ||
    reason.length > 1000
  )
    return {
      success: false,
      error: "Informe um motivo de rejeição com ao menos 5 caracteres.",
    };
  try {
    const { error } = await createSupabaseServiceClient().rpc(
      "review_manual_pix_order",
      {
        p_admin: admin.uid,
        p_user: userId,
        p_course: courseId,
        p_approve: false,
        p_bank_reference: null,
        p_received_at: null,
        p_received_amount: null,
        p_reason: reason.trim(),
      },
    );
    if (error) throw error;
    revalidatePath("/admin/approvals");
    revalidatePath("/admin/enrollments");
    revalidatePath("/inscricao/" + courseId);
    return { success: true };
  } catch {
    return {
      success: false,
      error:
        "Não foi possível rejeitar. Verifique se o pedido ainda está pendente.",
    };
  }
}
export async function getPixOrderForAdmin(userId: string, courseId: string) {
  await requireAdmin();
  try {
    const order = await findPixOrder(userId, courseId);
    let receiptUrl: string | null = null;
    if (order?.receipt_path) {
      const { data, error } = await createSupabaseServiceClient()
        .storage.from("pix-receipts")
        .createSignedUrl(order.receipt_path, 300);
      if (error) throw error;
      receiptUrl = data.signedUrl;
    }
    return { success: true, order, receiptUrl };
  } catch {
    return { success: false, error: "Não foi possível carregar o pedido." };
  }
}
