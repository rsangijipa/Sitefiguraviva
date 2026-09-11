"use client";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 450);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!visible) return null;
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Voltar para o topo"
      className="fixed bottom-5 right-5 z-[100] inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-paper text-primary transition hover:bg-primary hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <ArrowUp size={20} aria-hidden="true" />
    </button>
  );
}
