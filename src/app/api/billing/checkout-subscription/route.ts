import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";
import { getBearerSupabaseSessionClaims } from "@/lib/auth/supabase-session";
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
    const supabase = createSupabaseServiceClient();
    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", normalizedCourseId)
      .maybeSingle();
    if (courseError) throw courseError;
    if (!courseData) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const isAvailable =
      courseData.status === "open" || courseData.is_published === true;
    if (!isAvailable) {
      return NextResponse.json(
        { error: "Course is not available" },
        { status: 400 },
      );
    }

    const billing = ((courseData.legacy_payload as any)?.billing ?? {}) as any;
    const priceId = billing.priceIdMonthly;
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

    // 3. Create Pending Enrollment
    // `uid` here always comes from getBearerSupabaseSessionClaims (a real
    // Supabase Auth UUID matching profiles.id), so it's safe to write into
    // `user_id`. Do NOT set `id` to a client-built string — `enrollments.id`
    // is a Postgres `uuid` column with a DB-generated default; a composite
    // "${uid}_${courseId}" string fails uuid validation and throws (this
    // previously broke subscription checkout after the Stripe session had
    // already been created). Upsert against the (user_id, course_id)
    // partial unique index instead.
    const enrollmentData = {
      status: "pending_approval" as const,
      payment_status: "pending" as const,
      course_version_at_enrollment: courseData.content_revision || 1,
      payment_method: "stripe",
      subscription_id: session.subscription as string | null,
      source_ref: session.id,
      user_id: uid,
      course_id: normalizedCourseId,
    };
    const { error: enrollmentError } = await supabase
      .from("enrollments")
      .upsert(enrollmentData as any, {
        onConflict: "user_id,course_id",
      });
    if (enrollmentError) throw enrollmentError;

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Unable to create checkout" },
      { status: 500 },
    );
  }
}
