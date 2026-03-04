import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    // Simple fast read on a small or non-existent doc to verify connectivity & auth
    const healthDoc = await adminDb.collection("system").doc("health").get();
    // Just the fact that it didn't throw UNAUTHENTICATED is enough
    return NextResponse.json(
      {
        ok: true,
        projectId: process.env.FIREBASE_PROJECT_ID || "unknown",
        timestamp: new Date().toISOString(),
        exists: healthDoc.exists,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[HEALTH CHECK] Firebase Admin SDK Error:", error.message);
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        code: error.code || "UNKNOWN",
      },
      { status: 500 },
    );
  }
}
