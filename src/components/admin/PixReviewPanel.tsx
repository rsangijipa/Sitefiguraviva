"use client";
import { useEffect, useState } from "react";
import {
  approvePixEnrollment,
  rejectPixEnrollment,
  getPixOrderForAdmin,
} from "@/app/actions/enrollment-pix";
import type { PixOrderRow } from "@/infrastructure/supabase/database.types";
export default function PixReviewPanel({
  userId,
  courseId,
  onReviewed,
}: {
  userId: string;
  courseId: string;
  onReviewed?: () => void | Promise<void>;
}) {
  const [order, setOrder] = useState<PixOrderRow | null>(null),
    [receiptUrl, setReceiptUrl] = useState<string | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false);
  const [bankAmount, setBankAmount] = useState("");
  const amountValid = /^\d+(?:[.,]\d{1,2})?$/.test(bankAmount);
  const receivedAmountCents = amountValid
    ? Math.round(Number(bankAmount.replace(",", ".")) * 100)
    : 0;
  const [bankReference, setBankReference] = useState(""),
    [receivedAt, setReceivedAt] = useState(""),
    [confirmed, setConfirmed] = useState(false),
    [reason, setReason] = useState("");
  useEffect(() => {
    let cancelled = false;
    void getPixOrderForAdmin(userId, courseId)
      .then((result) => {
        if (cancelled) return;
        if (result.success) {
          setOrder(result.order || null);
          setReceiptUrl(result.receiptUrl || null);
        } else setError(result.error || "Falha ao carregar pedido.");
      })
      .catch(() => {
        if (!cancelled) setError("Falha ao carregar pedido.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, courseId]);
  const review = async (approve: boolean) => {
    setSaving(true);
    setError("");
    try {
      const result = approve
        ? await approvePixEnrollment(userId, courseId, {
            bankReference,
            receivedAt: new Date(receivedAt).toISOString(),
            receivedConfirmed: confirmed,
            receivedAmountCents,
          })
        : await rejectPixEnrollment(userId, courseId, reason);
      if (!result.success) {
        setError(result.error || "Falha na conferência.");
        return;
      }
      if (order) setOrder({ ...order, status: approve ? "paid" : "rejected" });
      await onReviewed?.();
    } catch {
      setError("Não foi possível concluir a conferência.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <section className="space-y-3 rounded-md border border-border bg-paper p-4">
      <h3 className="font-bold">
        Conferência Pix — matrícula ou primeira parcela
      </h3>
      {loading && <p role="status">Carregando pedido…</p>}
      {error && (
        <p role="alert" className="text-terra">
          {error}
        </p>
      )}
      {!loading && !order && (
        <p>
          Esta matrícula ainda não tem um pedido Pix registrado. Solicite ao
          aluno abrir sua inscrição e gerar a cobrança; pagamentos antigos
          exigem conferência separada.
        </p>
      )}
      {order && (
        <>
          <p>
            Valor inicial:{" "}
            {(order.amount_cents / 100).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
            <br />
            Referência do pedido: {order.txid}
            <br />
            Situação:{" "}
            {order.status === "paid"
              ? "Recebimento conferido"
              : order.status === "rejected"
                ? "Rejeitado"
                : order.declared_at
                  ? "Comprovante enviado; crédito não confirmado"
                  : "Aguardando pagamento/comprovante"}
          </p>
          {receiptUrl && (
            <a
              href={receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block underline"
            >
              Abrir comprovante (link temporário)
            </a>
          )}
          {order.status === "pending" && (
            <>
              <label className="block">
                Identificador do crédito no banco
                <input
                  value={bankReference}
                  onChange={(e) => setBankReference(e.target.value)}
                  className="block w-full rounded border p-2"
                  maxLength={120}
                />
              </label>
              <label className="block">
                Valor do crédito recebido (R$)
                <input
                  value={bankAmount}
                  onChange={(e) => setBankAmount(e.target.value)}
                  inputMode="decimal"
                  className="block w-full rounded border p-2"
                />
              </label>
              <label className="block">
                Data e hora do crédito (horário local deste dispositivo)
                <input
                  type="datetime-local"
                  value={receivedAt}
                  onChange={(e) => setReceivedAt(e.target.value)}
                  className="block w-full rounded border p-2"
                />
              </label>
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />
                Conferi na conta recebedora o crédito deste valor, a data e o
                identificador. O comprovante sozinho não confirma o recebimento.
              </label>
              <button
                type="button"
                disabled={
                  saving ||
                  !confirmed ||
                  bankReference.trim().length < 6 ||
                  !receivedAt ||
                  !amountValid ||
                  receivedAmountCents !== order.amount_cents
                }
                onClick={() => review(true)}
                className="rounded bg-primary px-4 py-2 text-white disabled:opacity-50"
              >
                Confirmar recebimento e liberar acesso
              </button>
              <label className="block">
                Motivo da rejeição
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="block w-full rounded border p-2"
                  maxLength={1000}
                />
              </label>
              <button
                type="button"
                disabled={saving || reason.trim().length < 5}
                onClick={() => review(false)}
                className="rounded border px-4 py-2 disabled:opacity-50"
              >
                Rejeitar pedido
              </button>
            </>
          )}
        </>
      )}
    </section>
  );
}
