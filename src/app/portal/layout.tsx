import { redirect } from "next/navigation";
import { PortalClientLayout } from "./PortalClientLayout";
import { ensureUserDoc } from "@/lib/auth/user-service";
import { requireSession } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession("/auth");

  try {
    await ensureUserDoc(session);
  } catch (error) {
    console.error("[PortalLayout] Failed to ensure user document:", error);
    redirect("/auth");
  }

  return <PortalClientLayout>{children}</PortalClientLayout>;
}
