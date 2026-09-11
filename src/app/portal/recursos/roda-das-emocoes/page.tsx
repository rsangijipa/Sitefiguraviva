import type { Metadata } from "next";
import Link from "next/link";
import { EmotionWheelExperience } from "@/features/interactive-resources/emotion-wheel/EmotionWheelExperience";

export const metadata: Metadata = {
  title: "Roda das Emoções",
  description: "Encontre palavras para o que você percebe agora.",
};

export default function RodaDasEmocoesPage() {
  return (
    <div className="min-h-dvh bg-[#FDFAF4]">
      <div className="container mx-auto max-w-7xl px-4 py-4">
        <Link
          href="/portal/materials"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#005A1F] hover:underline min-h-[44px] items-center"
        >
          ← Voltar aos recursos
        </Link>
      </div>
      <EmotionWheelExperience />
    </div>
  );
}
