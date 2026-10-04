import type { ReactNode } from "react";

// Per-request CSP nonces must never be paired with prerendered HTML.
export const dynamic = "force-dynamic";
export default function EnrollmentLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
