import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Liveness probe for the Firebase Admin SDK. This endpoint is public (used by
 * uptime/monitoring), so it must never leak project IDs or SDK error
 * messages/codes to an unauthenticated caller (P1-02 in
 * docs/RELATORIO_AUDITORIA_COMPLETA_2026-09-04.md). Details go to the server
 * log only; the response is a bare boolean.
 */
export async function GET() {
  try {
    // Simple fast read on a small or non-existent doc to verify connectivity & auth.
    await adminDb.collection("system").doc("health").get();
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: any) {
    console.error("[HEALTH CHECK] Firebase Admin SDK Error:", error?.message);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
