import "server-only";
import { randomUUID } from "node:crypto";
import { RECORD_TABLES } from "./database.server";

export interface DeletionReceipt {
  requestId: string;
  deletedAt: string;
  records: { table: typeof RECORD_TABLES[number]; id: string }[];
}
export async function appendDeletionReceipt(records: DeletionReceipt["records"], requestId = randomUUID()) {
  const endpoint = process.env.FV_RESOURCE_DELETION_LEDGER_URL;
  const token = process.env.FV_RESOURCE_DELETION_LEDGER_TOKEN;
  if (!endpoint || !token || !endpoint.startsWith("https://")) throw new Error("Manifesto externo indisponível.");
  const receipt: DeletionReceipt = { requestId, records, deletedAt: new Date().toISOString() };
  // No owner, text, region, emotion or response is sent. Storage must be outside
  // the restored database. The receiver acknowledges this idempotency key durably.
  const response = await fetch(endpoint, {
    method: "POST", redirect: "error", cache: "no-store", signal: AbortSignal.timeout(10000),
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Idempotency-Key": requestId },
    body: JSON.stringify(receipt),
  });
  if (!response.ok) throw new Error("Não foi possível confirmar o manifesto de exclusão.");
  const acknowledgment: unknown = await response.json();
  if (!acknowledgment || typeof acknowledgment !== "object" || !("requestId" in acknowledgment) || acknowledgment.requestId !== requestId || !("durable" in acknowledgment) || acknowledgment.durable !== true) throw new Error("Manifesto não confirmado.");
  return receipt;
}
