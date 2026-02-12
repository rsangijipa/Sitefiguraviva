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
    images: ["/images/laura-perls-hero.jpg"],
  },
};

export default function LauraPerlsPage() {
  return (
    <main className="min-h-screen bg-[#f5f2eb] relative">
      {/* Aged Paper Texture Overlay */}
      <div
        className="fixed inset-0 opacity-[0.08] pointer-events-none z-[9999]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Coffee Stains */}
      <div className="fixed top-20 left-10 w-32 h-32 rounded-full bg-[#8b7355]/5 blur-xl pointer-events-none z-0" />
      <div className="fixed bottom-40 right-20 w-48 h-48 rounded-full bg-[#a0826d]/5 blur-2xl pointer-events-none z-0" />

      {/* Decorative Border Frame */}
      <div className="fixed inset-4 md:inset-8 border border-[#d4c4a8]/30 pointer-events-none z-50 rounded-sm">
        {/* Corner Ornaments */}
        <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-[#b8a88a]" />
        <div className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-[#b8a88a]" />
        <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-2 border-l-2 border-[#b8a88a]" />
        <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-[#b8a88a]" />
      </div>

      <Navbar />

      <div className="relative font-sans selection:bg-[#c9a86c]/30">
        <LauraHero />
        <LauraTimeline />
        <LauraContributions />
        <LauraGallery />

        {/* Sources Section */}
        <section className="py-24 bg-[#f5f2eb] border-t border-[#e8dfd1] relative overflow-hidden">
          {/* Decorative Lines */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-[#c9a86c]/50 to-transparent" />

          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="h-px w-16 bg-[#c9a86c]/50" />
                <svg
                  className="w-6 h-6 text-[#c9a86c]/70"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                </svg>
                <div className="h-px w-16 bg-[#c9a86c]/50" />
              </div>
              <h4 className="font-serif text-3xl text-[#5c4a32] italic tracking-wide">
                Fontes & Leituras Sugeridas
              </h4>
            </div>

            <div className="grid gap-6 mb-16">
              {lauraPerlsContent.readings.map((reading, i) => (
                <div
                  key={i}
                  className="group p-6 bg-[#faf8f3] border border-[#e8dfd1] rounded-sm shadow-sm hover:shadow-md transition-all duration-500"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#f0ebe0] flex items-center justify-center shrink-0 border border-[#e8dfd1]">
                      <span className="font-serif text-lg text-[#c9a86c] font-bold">
                        {i + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <span className="block font-serif text-xl italic text-[#5c4a32] group-hover:text-[#8b6f4e] transition-colors leading-snug">
                        {reading.title}
                      </span>
                      <span className="block text-sm text-[#8b7355] mt-2 font-medium">
                        {reading.author} ({reading.year})
                        <span className="text-[#a89080] mx-2">•</span>
                        {reading.note}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center pt-8 border-t border-[#e8dfd1]">
              <p className="text-[11px] uppercase tracking-[0.25em] text-[#a89080]">
                Conteúdo revisado em {lauraPerlsContent.meta.updatedAt} •
                Instituto Figura Viva
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#c9a86c]/50" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#c9a86c]/30" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#c9a86c]/50" />
              </div>
            </div>
          </div>
        </section>
      </div>

      <BackToTop />
      <Footer />
    </main>
  );
}
