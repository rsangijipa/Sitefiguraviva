import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Liveness probe for the Supabase server client. This endpoint is public (used by
 * uptime/monitoring), so it must never leak project IDs or SDK error
 * messages/codes to an unauthenticated caller (P1-02 in
 * docs/RELATORIO_AUDITORIA_COMPLETA_2026-09-04.md). Details go to the server
 * log only; the response is a bare boolean.
 */
export async function GET() {
  try {
    const { error } = await createSupabaseServiceClient()
      .from("public_pages")
      .select("key")
      .limit(1);
    if (error) throw error;
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: any) {
    console.error(
      "[HEALTH CHECK] Supabase server client error:",
      error?.message,
    );
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
