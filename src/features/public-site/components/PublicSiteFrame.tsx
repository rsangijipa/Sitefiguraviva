import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function PublicSiteFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-primary fx-grain">
      <Navbar />
      <div id="public-page-content" className="outline-none" tabIndex={-1}>
        {children}
      </div>
      <Footer />
    </div>
  );
}
