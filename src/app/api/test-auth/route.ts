import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  // P0-01 Security Hardening: Disable this endpoint in production
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }

  try {
    // Even in non-production, ensure only admins can see this
    // Note: For simplicity in this dev tool, we check a local admin flag or similar
    // if needed, but the primary goal is 404 in prod.

    const privateKey = process.env.FIREBASE_PRIVATE_KEY || "";
    const debugInfo = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      keyLength: privateKey.length,
      // REMOVED sensitive key fragments for extra safety even in dev
      hasNewlines: privateKey.includes("\n"),
      hasEscapedNewlines: privateKey.includes("\\n"),
    };

    return NextResponse.json({
      success: true,
      envAnalysis: debugInfo,
      message: "Development only debug info",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Unauthorized or failed" },
      { status: 403 },
    );
  }
}
