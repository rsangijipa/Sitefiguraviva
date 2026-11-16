/**
 * Minimal client for the Resend HTTP API (https://resend.com/docs/api-reference/emails/send-email).
 * The Idempotency-Key makes a retried send with the same event key a no-op on
 * Resend's side, so a crash after sending and before marking the row "sent"
 * does not deliver the e-mail twice.
 */

export class EmailSendError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
    readonly status?: number,
  ) {
    super(message);
    this.name = "EmailSendError";
  }
}

export type SendEmailInput = {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  idempotencyKey: string;
};

export async function sendWithResend(
  input: SendEmailInput,
  fetchImpl: typeof fetch = fetch,
): Promise<{ id: string }> {
  let response: Response;
  try {
    response = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": input.idempotencyKey,
      },
      body: JSON.stringify({
        from: input.from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      }),
    });
  } catch (error) {
    throw new EmailSendError(
      `network: ${error instanceof Error ? error.message : "falha de rede"}`,
      true,
    );
  }

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    /* empty or non-JSON body */
  }

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "message" in body
        ? String((body as { message: unknown }).message)
        : `HTTP ${response.status}`;
    // 429 and 5xx are transient; other 4xx (invalid address, unverified
    // domain, bad key) will not fix themselves on retry.
    const retryable = response.status === 429 || response.status >= 500;
    throw new EmailSendError(message.slice(0, 500), retryable, response.status);
  }

  const id =
    body && typeof body === "object" && "id" in body
      ? String((body as { id: unknown }).id)
      : "";
  if (!id) throw new EmailSendError("Resposta sem id do provedor.", true);
  return { id };
}
