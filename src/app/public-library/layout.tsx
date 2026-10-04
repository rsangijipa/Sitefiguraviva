import { AuthBoundary } from "@/components/providers/AuthBoundary";

export default function PublicLibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthBoundary>{children}</AuthBoundary>;
}
