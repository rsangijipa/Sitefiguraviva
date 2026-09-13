import { redirect } from "next/navigation";
import { PortalClientLayout } from "./PortalClientLayout";
import { ensureUserDoc } from "@/lib/auth/user-service";
import { requireSession } from "@/lib/auth/server";
import { PortalProviders } from "@/components/providers/PortalProviders";
import { SWRegistration } from "@/components/portal/SWRegistration";
import ImpersonationBanner from "@/components/admin/ImpersonationBanner";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession("/auth");
  const isImpersonating = (await cookies()).has("admin_session_backup");

  try {
    await ensureUserDoc(session);
  } catch (error) {
    console.error("[PortalLayout] Failed to ensure user document:", error);
    redirect("/auth");
  }

  return (
    <PortalProviders>
      <SWRegistration />
      {isImpersonating && <ImpersonationBanner />}
      <PortalClientLayout>{children}</PortalClientLayout>
    </PortalProviders>
  );
}
