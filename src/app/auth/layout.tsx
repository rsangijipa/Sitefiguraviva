import { AuthBoundary } from "@/components/providers/AuthBoundary";

export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthBoundary>{children}</AuthBoundary>;
}
