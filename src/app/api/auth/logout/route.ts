import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";

export async function POST() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (sessionCookie) {
    try {
      const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
      await adminAuth.revokeRefreshTokens(decoded.uid);
    } catch (error) {
      console.warn("Logout token revocation failed:", error);
    }
  }

  cookieStore.delete("session");

  return NextResponse.json({ status: "success" });
}
