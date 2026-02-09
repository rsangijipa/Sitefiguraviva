import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import {
  DEFAULT_FOUNDER,
  DEFAULT_INSTITUTE,
  DEFAULT_SEO,
} from "@/lib/siteSettings";

export async function GET(request: NextRequest) {
  try {
    // 1. Auth Check (Admin Only) - Simple check for development ease, or strict session check
    // Ideally should check session cookie, but for a seed script triggered via browser,
    // we might rely on the user being logged in OR a secret key.
    // Let's use the session cookie for strict security.

    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifySessionCookie(
      sessionCookie,
      true,
    );
    if (decodedToken.role !== "admin" && !decodedToken.admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const batch = adminDb.batch();
    const settingsRef = adminDb.collection("siteSettings");

    // 2. Founder
    const founderRef = settingsRef.doc("founder");
    const founderSnap = await founderRef.get();
    if (!founderSnap.exists) {
      batch.set(founderRef, { ...DEFAULT_FOUNDER, seededAt: new Date() });
    }

    // 3. Institute
    const instituteRef = settingsRef.doc("institute");
    const instituteSnap = await instituteRef.get();
    if (!instituteSnap.exists) {
      batch.set(instituteRef, { ...DEFAULT_INSTITUTE, seededAt: new Date() });
    }

    // 4. SEO
    const seoRef = settingsRef.doc("seo");
    const seoSnap = await seoRef.get();
    if (!seoSnap.exists) {
      batch.set(seoRef, { ...DEFAULT_SEO, seededAt: new Date() });
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: "Site settings seeded successfully (idempotent).",
    });
  } catch (error: any) {
    console.error("Seed Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
