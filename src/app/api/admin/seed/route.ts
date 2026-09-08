import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/server";
import {
  DEFAULT_FOUNDER,
  DEFAULT_INSTITUTE,
  DEFAULT_SEO,
} from "@/lib/siteSettings";

export async function GET(request: NextRequest) {
  try {
    // The `session` cookie carries a Supabase JWT, not a Firebase session
    // cookie, so admin checks go through verifySession() (Supabase-based)
    // rather than adminAuth.verifySessionCookie, which always threw here.
    const claims = await verifySession();
    if (!claims) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    if (!claims.isAdmin) {
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
