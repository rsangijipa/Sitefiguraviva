import { AuthBoundary } from "@/components/providers/AuthBoundary";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AuthBoundary>{children}</AuthBoundary>;
}
