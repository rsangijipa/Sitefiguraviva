import { Metadata } from "next";
import { lauraPerlsContent } from "@/content/laura-perls";
import { LauraHero } from "@/components/laura/LauraHero";
import { LauraTimeline } from "@/components/laura/LauraTimeline";
import { LauraContributions } from "@/components/laura/LauraContributions";
import { LauraGallery } from "@/components/laura/LauraGallery";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { BackToTop } from "@/components/laura/BackToTop";

export const metadata: Metadata = {
  title: lauraPerlsContent.meta.title,
  description: lauraPerlsContent.meta.description,
  openGraph: {
    title: lauraPerlsContent.meta.title,
    description: lauraPerlsContent.meta.description,
    type: "article",
    images: ["/images/laura-perls-hero.jpg"], // Placeholder, will use illustration if available
  },
};

export default function LauraPerlsPage() {
  return (
    <main className="min-h-screen bg-[#0d0c0b] relative">
      {/* Global Vintage Grain Overlay */}
      <div
        className="fixed inset-0 opacity-[0.05] pointer-events-none z-[9999] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <Navbar />

      <div className="relative font-sans selection:bg-gold/30">
        <LauraHero />
        <LauraTimeline />
        <LauraContributions />
        <LauraGallery />

        {/* Sources Section (Simple footer for this page) */}
        <section className="py-24 bg-[#0d0c0b] border-t border-stone-900 relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <h4 className="font-serif text-2xl text-stone-200 mb-8 italic">
              Fontes & Leituras Sugeridas
            </h4>
            <ul className="space-y-6 mb-12">
              {lauraPerlsContent.readings.map((reading, i) => (
                <li key={i} className="group">
                  <span className="block font-serif text-xl italic text-stone-300 group-hover:text-gold transition-colors">
                    {reading.title}
                  </span>
                  <span className="block text-sm text-stone-500 mt-1">
                    {reading.author} ({reading.year}) — {reading.note}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-[10px] uppercase tracking-[0.3em] text-stone-600 border-t border-stone-800 pt-8">
              Conteúdo revisado em {lauraPerlsContent.meta.updatedAt} •
              Instituto Figura Viva
            </p>
          </div>
        </section>
      </div>

      <BackToTop />
      <Footer />
    </main>
  );
}
