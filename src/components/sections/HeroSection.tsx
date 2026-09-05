import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import Image from "next/image";
import WaveLines from "../ui/WaveLines";

export default function HeroSection({ initialData }: { initialData?: any }) {
  const data = initialData ?? {};
  const whatsappNumber = data.phone?.replace(/\D/g, "") || "11999999999";

  return (
    <header className="fv-bg fv-bg-hero relative flex min-h-[min(820px,90vh)] items-center overflow-hidden bg-paper px-6 pt-32 pb-24 md:pt-40 md:pb-32">
      <div
        className="pointer-events-none absolute inset-y-12 right-[-12%] z-0 w-[88%] opacity-25 sm:right-[-5%] sm:w-[70%] sm:opacity-35 lg:inset-y-5 lg:right-[1%] lg:w-[52%] lg:opacity-90"
        aria-hidden="true"
      >
        <Image
          src="/assets/fv/hero-tree-lite.svg"
          alt=""
          fill
          priority
          sizes="(max-width: 640px) 88vw, (max-width: 1024px) 70vw, 52vw"
          className="object-contain object-right-bottom"
        />
      </div>

      {/* Decorative Overlays */}
      <WaveLines className="opacity-20 mix-blend-multiply" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid items-center gap-20 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="text-left">
            {/* O nome da instituição é o título. A etiqueta que ficava acima
                repetia essa mesma frase — duas vezes a mesma informação, e a
                de cima em corpo miúdo. Ficou só a de baixo, em tamanho de
                título, que é onde ela trabalha. */}
            <h1 className="font-serif font-bold text-primary mb-8 text-balance tracking-tight leading-[1.08] text-[clamp(1.9rem,4vw,3.05rem)] max-w-[15ch]">
              Instituto de Gestalt-terapia de Rondônia
              <span className="mt-3 block text-gold font-light italic text-[0.82em]">
                Figura Viva
              </span>
            </h1>

            <p className="mb-14 max-w-xl text-xl font-light leading-relaxed text-text/75 md:text-2xl">
              Transforme sua percepção e prática através da{" "}
              <span className="font-medium text-primary">Gestalt-Terapia</span>.
              Um espaço de estudo dedicado à profundidade da relação.
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <a
                href={`https://wa.me/55${whatsappNumber}?text=Olá! Gostaria de informações sobre as formações do Instituto Figura Viva.`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center gap-4 overflow-hidden rounded-md bg-primary px-10 py-5 text-white transition-colors hover:bg-primary-dark active:scale-[0.98]"
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

              <a
                href="/formacoes"
                className="group flex items-center justify-center gap-4 rounded-md border border-border bg-paper px-10 py-5 text-primary transition-colors hover:border-igarape hover:bg-areia active:scale-[0.98]"
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

          {/* Coluna visual: a árvore do fundo é o assunto. Os dois anéis que
              flutuavam em laço infinito saíram — eram dois temporizadores
              permanentes por uma decoração que ninguém olhava. */}
          <div className="relative hidden lg:block">
            <div className="aspect-[4/5] w-full" aria-hidden />

            {/* Cartão de status */}
            <div className="absolute -bottom-10 right-10 z-20 max-w-[240px] rounded-md border border-border bg-paper/95 p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-paper bg-areia"
                    />
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-paper bg-gold text-[8px] flex items-center justify-center font-bold text-white">
                    +500
                  </div>
                </div>
              </div>
              <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-1 italic">
                Vagas Abertas
              </h4>
              <p className="text-xs leading-tight text-text/65">
                Pós-Graduação reconhecida com selo de excelência.
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-4">
                <span className="text-[10px] font-bold text-gold uppercase tracking-[0.2em]">
                  Próximas turmas
                </span>
                <ArrowUpRight size={14} className="text-gold" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
