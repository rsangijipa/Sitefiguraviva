import "server-only";

import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { getPublicSiteOrigin } from "@/lib/public-site-url";
import { EmailSendError, sendWithResend } from "./resend";
import { buildEnrollmentEmail, type EnrollmentEmailKind } from "./templates";

/**
 * Sends the enrollment e-mails queued in public.enrollment_email_outbox by the
 * database triggers (application received, enrollment confirmed).
 *
 * - Rows are leased with claim_enrollment_emails (FOR UPDATE SKIP LOCKED), so
 *   two runs never send the same event.
 * - The outbox event_key is the Resend Idempotency-Key.
 * - Transient failures go back to "pending" with backoff; after 5 attempts or
 *   a permanent error (bad address, unverified domain) the row is "failed".
 * - Events older than STALE_AFTER_DAYS are canceled instead of sent: a
 *   "matrícula confirmada" weeks late confuses more than it helps.
 */

export const STALE_AFTER_DAYS = 7;
const MAX_ATTEMPTS = 5;
// attempts is already incremented by the claim: 1st failure waits 5 min, ...
const BACKOFF_MINUTES = [5, 30, 120, 720];

type OutboxRow = {
  id: string;
  event_key: string;
  user_id: string;
  course_id: string;
  kind: EnrollmentEmailKind;
  attempts: number;
};

type QueryResult<T> = Promise<{ data: T | null; error: { message: string } | null }>;
// The outbox table and its RPC are not in the generated types yet.
type LooseDb = {
  rpc: (fn: string, args: Record<string, unknown>) => QueryResult<OutboxRow[]>;
  from: (table: string) => any;
};

export type ProcessSummary =
  | { status: "not_configured"; missing: string[] }
  | {
      status: "done";
      claimed: number;
      sent: number;
      retried: number;
      failed: number;
      canceledStale: number;
    };

export type ProcessOptions = {
  limit?: number;
  now?: Date;
  fetchImpl?: typeof fetch;
  env?: Record<string, string | undefined>;
};

export async function processEnrollmentEmails(
  options: ProcessOptions = {},
): Promise<ProcessSummary> {
  const env = options.env ?? process.env;
  const now = options.now ?? new Date();
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.ENROLLMENT_EMAIL_FROM?.trim();
  const missing = [
    !apiKey && "RESEND_API_KEY",
    !from && "ENROLLMENT_EMAIL_FROM",
  ].filter(Boolean) as string[];
  // Without a sender nothing is claimed, so no attempt is burned.
  if (missing.length) return { status: "not_configured", missing };

  const db = createSupabaseServiceClient() as unknown as LooseDb;
  const nowIso = now.toISOString();

  const staleBefore = new Date(
    now.getTime() - STALE_AFTER_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  const { data: canceled, error: cancelError } = await db
    .from("enrollment_email_outbox")
    .update({
      status: "canceled",
      last_error: `Não enviado: evento com mais de ${STALE_AFTER_DAYS} dias.`,
      locked_at: null,
      updated_at: nowIso,
    })
    .eq("status", "pending")
    .lt("created_at", staleBefore)
    .select("id");
  if (cancelError) throw new Error(cancelError.message);

  const { data: claimed, error: claimError } = await db.rpc(
    "claim_enrollment_emails",
    { p_limit: Math.min(Math.max(options.limit ?? 10, 1), 20) },
  );
  if (claimError) throw new Error(claimError.message);

  const summary = {
    status: "done" as const,
    claimed: claimed?.length ?? 0,
    sent: 0,
    retried: 0,
    failed: 0,
    canceledStale: canceled?.length ?? 0,
  };
  const siteOrigin = getPublicSiteOrigin();

  for (const row of claimed ?? []) {
    const update = (fields: Record<string, unknown>) =>
      db
        .from("enrollment_email_outbox")
        .update({ ...fields, locked_at: null, updated_at: new Date().toISOString() })
        .eq("id", row.id);
    try {
      const [{ data: profile }, { data: course }] = await Promise.all([
        db.from("profiles").select("email,display_name").eq("id", row.user_id).maybeSingle(),
        db.from("courses").select("title").eq("id", row.course_id).maybeSingle(),
      ]);
      const to = typeof profile?.email === "string" ? profile.email.trim() : "";
      if (!to) throw new EmailSendError("Aluno sem e-mail cadastrado.", false);

      const content = buildEnrollmentEmail(row.kind, {
        name: profile?.display_name,
        courseTitle: course?.title || "seu curso",
        siteOrigin,
      });
      const { id } = await sendWithResend(
        {
          apiKey: apiKey!,
          from: from!,
          replyTo: env.ENROLLMENT_EMAIL_REPLY_TO?.trim() || undefined,
          to,
          ...content,
          idempotencyKey: row.event_key,
        },
        options.fetchImpl,
      );
      await update({ status: "sent", provider_id: id, last_error: null });
      summary.sent += 1;
    } catch (error) {
      const message = (error instanceof Error ? error.message : String(error)).slice(0, 500);
      const retryable = !(error instanceof EmailSendError) || error.retryable;
      if (retryable && row.attempts < MAX_ATTEMPTS) {
        const minutes =
          BACKOFF_MINUTES[Math.min(row.attempts, BACKOFF_MINUTES.length) - 1] ??
          BACKOFF_MINUTES[0];
        await update({
          status: "pending",
          last_error: message,
          next_attempt_at: new Date(now.getTime() + minutes * 60_000).toISOString(),
        });
        summary.retried += 1;
      } else {
        await update({ status: "failed", last_error: message });
        summary.failed += 1;
      }
    }
  }

  return summary;
}
