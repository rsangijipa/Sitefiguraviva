import { AuthBoundary } from "@/components/providers/AuthBoundary";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthBoundary>{children}</AuthBoundary>;
}
