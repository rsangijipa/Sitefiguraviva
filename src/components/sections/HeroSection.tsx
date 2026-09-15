import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
import WaveLines from "../ui/WaveLines";

const EnhancedLivingTree = dynamic(
  () => import("../visual/EnhancedLivingTree"),
  { ssr: false },
);

export default function HeroSection({ initialData }: { initialData?: any }) {
  const data = initialData ?? {};
  const whatsappNumber = data.phone?.replace(/\D/g, "") || "";

  return (
    <header className="fv-bg fv-bg-hero relative flex min-h-[min(680px,80vh)] items-center overflow-hidden bg-paper px-6 pt-24 pb-14 md:pt-28 md:pb-18">
      <div
        className="pointer-events-none absolute inset-y-10 right-[-10%] z-0 w-[70%] scale-[0.8] origin-right opacity-25 sm:right-[-4%] sm:w-[56%] sm:opacity-35 lg:inset-y-4 lg:right-[2%] lg:w-[42%] lg:opacity-90"
        aria-hidden="true"
      >
        <EnhancedLivingTree
          className="h-full w-full"
          theme="figura-viva"
          timeOfDay="tarde"
          windIntensity={0.48}
          windDirection={0.35}
          leafFlutter
          interactive={false}
        />
      </div>

      {/* Decorative Overlays */}
      <WaveLines className="opacity-20 mix-blend-multiply" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="text-left">
            {/* O nome da instituição é o título */}
            <h1 className="font-serif font-bold text-primary mb-6 text-balance tracking-tight leading-[1.08] text-[clamp(1.85rem,3.8vw,2.9rem)] max-w-[15ch]">
              Instituto de Gestalt-terapia de Rondônia
              <span className="mt-2 block text-gold font-light italic text-[0.82em]">
                Figura Viva
              </span>
            </h1>

            <p className="mb-8 max-w-xl text-lg font-light leading-relaxed text-text/75 md:text-xl">
              Transforme sua percepção e prática através da{" "}
              <span className="font-medium text-primary">Gestalt-Terapia</span>.
              Um espaço de estudo dedicado à profundidade da relação.
            </p>

            <div className="flex flex-col sm:flex-row gap-5">
              {whatsappNumber ? (
                <a
                  href={`https://wa.me/55${whatsappNumber}?text=Olá! Gostaria de informações sobre as formações do Instituto Figura Viva.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-center gap-4 overflow-hidden rounded-md bg-primary px-8 py-4 text-white transition-colors hover:bg-primary-dark active:scale-[0.98]"
                >
                  <div className="relative z-10 flex items-center gap-3">
                    <span className="font-bold uppercase tracking-[0.15em] text-[13px]">
                      Falar com Consultora
                    </span>
                    <ArrowRight
                      size={20}
                      className="group-hover:translate-x-1.5 transition-transform duration-300"
                    />
                  </div>
                </a>
              ) : (
                <a
                  href="/contato"
                  className="group relative flex items-center justify-center gap-4 overflow-hidden rounded-md bg-primary px-8 py-4 text-white transition-colors hover:bg-primary-dark active:scale-[0.98]"
                >
                  <span className="font-bold uppercase tracking-[0.15em] text-[13px]">
                    Entrar em contato
                  </span>
                  <ArrowRight size={20} aria-hidden="true" />
                </a>
              )}

              <a
                href="/formacoes"
                className="group flex items-center justify-center gap-4 rounded-md border border-border bg-paper px-8 py-4 text-primary transition-colors hover:border-igarape hover:bg-areia active:scale-[0.98]"
              >
                <span className="font-bold uppercase tracking-[0.15em] text-[13px]">
                  Ver Formações
                </span>
                <Sparkles
                  size={18}
                  className="text-muted transition-all group-hover:rotate-12 group-hover:text-primary"
                />
              </a>
            </div>
          </div>

          {/* Coluna visual: espaço reservado para contemplar a árvore sem cartões sobrepostos */}
          <div className="relative hidden lg:block">
            <div className="aspect-[4/3] w-full" aria-hidden />
          </div>
        </div>
      </div>
    </header>
  );
}
