import type { Metadata } from "next";
import Link from "next/link";

import { AwarenessTreeExperience } from "@/features/awareness-tree/components/AwarenessTreeExperience";
import "@/features/awareness-tree/awareness-tree.css";

export const metadata: Metadata = {
  title: "Árvore da Consciência",
  description:
    "Uma experiência contemplativa para encontrar mensagens de acolhimento, coragem e presença.",
};

export default function AwarenessTreePage() {
  return (
    <div className="relative min-h-dvh bg-[#091813]">
      <Link
        href="/recursos"
        className="fixed left-4 top-4 z-50 inline-flex min-h-11 items-center rounded-full border border-white/20 bg-black/35 px-4 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-black/55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d8bd79] sm:left-6 sm:top-6"
      >
        ← Voltar aos recursos
      </Link>
      <AwarenessTreeExperience />
    </div>
  );
}
