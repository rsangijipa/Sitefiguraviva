import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { processEnrollmentEmails } from "@/features/enrollment-emails/processor.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  const token =
    request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  return (
    !!secret &&
    Buffer.byteLength(token) === Buffer.byteLength(secret) &&
    timingSafeEqual(Buffer.from(token), Buffer.from(secret))
  );
}

// Vercel Cron calls this with "Authorization: Bearer $CRON_SECRET".
export async function GET(request: Request) {
  if (!authorized(request))
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const summary = await processEnrollmentEmails();
    return NextResponse.json(summary, {
      status: summary.status === "not_configured" ? 503 : 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("enrollment-emails cron failed", error);
    return NextResponse.json(
      { error: "processing_failed" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
