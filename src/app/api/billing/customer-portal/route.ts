import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase/admin";
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

    // Find customer ID from user's enrollments
    // We look for any enrollment that has a customerId
    const enrollmentsSnapshot = await adminDb
      .collection("users")
      .doc(uid)
      .collection("enrollments")
      .where("stripe.customerId", "!=", null)
      .limit(1)
      .get();

    if (enrollmentsSnapshot.empty) {
      return NextResponse.json(
        { error: "No billing account found" },
        { status: 404 },
      );
    }

    const customerId = enrollmentsSnapshot.docs[0].data().stripe?.customerId;
    if (typeof customerId !== "string" || !customerId) {
      return NextResponse.json(
        { error: "No billing account found" },
        { status: 404 },
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${env.NEXT_PUBLIC_BASE_URL}/portal`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Customer Portal error:", error);
    return NextResponse.json({ error: "Unable to create billing portal" }, { status: 500 });
  }
}
