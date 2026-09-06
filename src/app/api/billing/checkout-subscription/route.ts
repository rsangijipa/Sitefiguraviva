import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase/admin";
import { getBearerSupabaseSessionClaims } from "@/lib/auth/supabase-session";
import { FieldValue } from "firebase-admin/firestore";
import { env } from "@/config/env";

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const claims = await getBearerSupabaseSessionClaims(req);
    if (!claims || !claims.isActive) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const uid = claims.uid;
    const email = claims.email;

    const body = await req.json().catch(() => ({}));
    const { courseId } = body;

    if (typeof courseId !== "string" || !courseId.trim()) {
      return NextResponse.json(
        { error: "Course ID required" },
        { status: 400 },
      );
    }

    // 1. Fetch Course details
    const normalizedCourseId = courseId.trim();
    const courseDoc = await adminDb
      .collection("courses")
      .doc(normalizedCourseId)
      .get();
    if (!courseDoc.exists) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const courseData: any = courseDoc.data();
    const isAvailable =
      courseData?.status === "open" || courseData?.isPublished === true;
    if (!isAvailable) {
      return NextResponse.json(
        { error: "Course is not available" },
        { status: 400 },
      );
    }

    const priceId = courseData.billing?.priceIdMonthly;
    if (!priceId) {
      return NextResponse.json(
        { error: "Course billing is not configured" },
        { status: 500 },
      );
    }

    // 2. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email, // Pre-fill email
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Redirect to internal enrollment flow success/cancel pages
      success_url: `${env.NEXT_PUBLIC_BASE_URL}/inscricao/${normalizedCourseId}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.NEXT_PUBLIC_BASE_URL}/inscricao/${normalizedCourseId}/cancelado`,
      metadata: {
        uid: uid,
        courseId: normalizedCourseId,
        applicationId: `${uid}_${normalizedCourseId}`, // Link to application doc
      },
      subscription_data: {
        metadata: {
          uid: uid,
          courseId: normalizedCourseId,
          applicationId: `${uid}_${normalizedCourseId}`,
        },
      },
    });

    // 3. Create Pending Enrollment (Idempotent key use ideally, but here simple set)
    const enrollmentId = `${uid}_${normalizedCourseId}`;
    const enrollmentData = {
      uid,
      courseId: normalizedCourseId,
      status: "pending_approval",
      paymentStatus: "pending",
      approvalStatus: "pending_review",
      courseVersionAtEnrollment: courseData.contentRevision || 1, // Capture starting version
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      stripe: {
        checkoutSessionId: session.id,
      },
    };

    // Write to User's subcollection (Portal Access)
    await adminDb
      .collection("users")
      .doc(uid)
      .collection("enrollments")
      .doc(normalizedCourseId)
      .set(enrollmentData, { merge: true });

    // Write to Global Ledger
    await adminDb
      .collection("enrollments")
      .doc(enrollmentId)
      .set(enrollmentData, { merge: true });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Unable to create checkout" }, { status: 500 });
  }
}
