import type { ReactNode } from "react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import FloatingControls from "@/components/ui/FloatingControls";

export function PublicSiteFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-text">
      <Navbar />
      {children}
      <Footer />
      <FloatingControls />
    </div>
  );
}
