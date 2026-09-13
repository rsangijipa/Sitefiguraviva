import { Metadata } from "next";
import { lauraPerlsContent } from "@/content/laura-perls";
import { LauraHero } from "@/components/laura/LauraHero";
import { LauraTimeline } from "@/components/laura/LauraTimeline";
import { LauraContributions } from "@/components/laura/LauraContributions";
import { LauraGallery } from "@/components/laura/LauraGallery";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { WhySheMatters } from "@/components/laura/WhySheMatters";
import { AudioRecordings } from "@/components/laura/AudioRecordings";
import { InteractiveMap } from "@/components/laura/InteractiveMap";
import { ConceptsDeepDive } from "@/components/laura/ConceptsDeepDive";
import { LegacyTree } from "@/components/laura/LegacyTree";
import { Quiz } from "@/components/laura/Quiz";
import { LauraReadings } from "@/components/laura/LauraReadings";

export const metadata: Metadata = {
  title: lauraPerlsContent.meta.title,
  description: lauraPerlsContent.meta.description,
  openGraph: {
    title: lauraPerlsContent.meta.title,
    description: lauraPerlsContent.meta.description,
    type: "article",
    images: ["/laura/laura1.jpg"],
  },
};

export default function LauraPerlsPage() {
  return (
    <div className="laura-viva fv-bg fv-bg-laura-archive relative min-h-screen bg-[#FDFAF4] text-[#262B22]">
      <div
        className="fixed inset-0 z-[9999] pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="fixed left-10 top-20 z-0 h-32 w-32 rounded-full bg-[#FE538B]/10 blur-2xl pointer-events-none" />
      <div className="fixed bottom-40 right-20 z-0 h-48 w-48 rounded-full bg-[#01C94D]/10 blur-3xl pointer-events-none" />
      <Navbar />
      <main className="relative font-sans selection:bg-[#FED701]/45">
        <LauraHero />
        <WhySheMatters />
        <InteractiveMap />
        <AudioRecordings />
        <LauraTimeline />
        <ConceptsDeepDive />
        <LauraContributions />
        <LegacyTree />
        <Quiz />
        <LauraReadings />
        <LauraGallery />
      </main>
      <Footer />
    </div>
  );
}
