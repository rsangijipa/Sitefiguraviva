import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase/admin";
import { PortalClientLayout } from "./PortalClientLayout";
import { ensureUserDoc } from "@/lib/auth/user-service";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) {
    redirect("/auth");
  }

  try {
    // Verify session server-side
    const decodedToken = await adminAuth.verifySessionCookie(session, true);

    // SSoT: Ensure user document exists (Idempotent)
    await ensureUserDoc(decodedToken);
  } catch (error) {
    console.error("[PortalLayout] Session verification failed:", error);
    redirect("/auth");
  }

  return <PortalClientLayout>{children}</PortalClientLayout>;
}
