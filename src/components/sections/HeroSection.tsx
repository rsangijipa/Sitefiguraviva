"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import OrganicBackground from "../ui/OrganicBackground";
import WaveLines from "../ui/WaveLines";
import { useInstituteSettings } from "@/hooks/useSiteSettings";
import BackgroundEngine from "../visual/BackgroundEngine";
import dynamic from "next/dynamic";

const ParticlesLayer = dynamic(() => import("../visual/ParticlesLayer"), {
  ssr: false,
});

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
} as const;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

export default function HeroSection({
  initialData,
  backgroundArt,
}: {
  initialData?: any;
  /** Árvore da marca, renderizada no servidor (ver src/app/page.tsx). */
  backgroundArt?: ReactNode;
}) {
  const { data } = useInstituteSettings(initialData);
  const whatsappNumber = data.phone?.replace(/\D/g, "") || "11999999999";

  const isParticlesEnabled = process.env.NEXT_PUBLIC_ENABLE_PARTICLES === "1";

  return (
    <header className="relative min-h-screen flex items-center pt-32 pb-24 md:pt-40 md:pb-32 px-6 overflow-hidden bg-paper">
      {/* Premium Background Engine */}
      <BackgroundEngine />
      {isParticlesEnabled && <ParticlesLayer />}

      {/* Árvore da marca: fundo vivo ancorado à direita da página.
          A máscara horizontal apaga a copa antes da coluna de texto, então a
          árvore pode ficar opaca de verdade sem disputar leitura com o título. */}
      {backgroundArt && (
        <div
          aria-hidden
          className="fv-tree-mask pointer-events-none absolute inset-y-0 right-0 z-0 flex w-[118%] translate-x-[6%] translate-y-[2%] items-end justify-end overflow-hidden select-none sm:w-[92%] lg:w-[64%] lg:translate-x-[3%] lg:translate-y-[1%] xl:w-[60%] 2xl:w-[56%]"
        >
          <div className="fv-tree-layer h-[72%] w-full opacity-30 sm:h-[80%] sm:opacity-[0.38] lg:h-[94%] lg:opacity-100">
            {backgroundArt}
          </div>
        </div>
      )}

      {/* Decorative Overlays */}
      <WaveLines className="opacity-20 mix-blend-multiply" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-left"
          >
            {/* O nome da instituição é o título. A etiqueta que ficava acima
                repetia essa mesma frase — duas vezes a mesma informação, e a
                de cima em corpo miúdo. Ficou só a de baixo, em tamanho de
                título, que é onde ela trabalha. */}
            <motion.h1
              variants={fadeInUp}
              className="font-serif font-bold text-primary mb-8 text-balance tracking-tight leading-[1.08] text-[clamp(1.9rem,4vw,3.05rem)] max-w-[15ch]"
            >
              Instituto de Gestalt-terapia de Rondônia
              <span className="mt-3 block text-gold font-light italic text-[0.82em]">
                Figura Viva
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl text-stone-600 font-light leading-relaxed mb-14 max-w-xl"
            >
              Transforme sua percepção e prática através da{" "}
              <span className="font-medium text-primary">Gestalt-Terapia</span>.
              Um espaço de estudo dedicado à profundidade da relação.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-6"
            >
              <a
                href={`https://wa.me/55${whatsappNumber}?text=Olá! Gostaria de informações sobre as formações do Instituto Figura Viva.`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-10 py-6 bg-primary text-white rounded-full overflow-hidden transition-all hover:shadow-2xl hover:shadow-primary/30 flex items-center justify-center gap-4 active:scale-95"
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
                <div className="absolute inset-0 bg-gradient-to-r from-gold to-[#D4AF37] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
              </a>

              <a
                href="#cursos"
                className="group px-10 py-6 border border-primary/20 bg-white/40 backdrop-blur-xl text-primary rounded-full hover:bg-white hover:border-primary/40 transition-all flex items-center justify-center gap-4 active:scale-95 shadow-sm"
              >
                <span className="font-bold uppercase tracking-[0.15em] text-[13px]">
                  Ver Formações
                </span>
                <Sparkles
                  size={18}
                  className="text-stone-400 group-hover:text-gold group-hover:rotate-12 transition-all"
                />
              </a>
            </motion.div>
          </motion.div>

          {/* Coluna visual: a árvore do fundo é o assunto. Os dois anéis que
              flutuavam em laço infinito saíram — eram dois temporizadores
              permanentes por uma decoração que ninguém olhava. */}
          <div className="relative hidden lg:block">
            <div className="aspect-[4/5] w-full" aria-hidden />

            {/* Cartão de status */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.35,
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute -bottom-10 right-10 z-20 glass-panel p-8 rounded-[2.5rem] max-w-[240px] transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white bg-stone-200"
                    />
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-gold text-[8px] flex items-center justify-center font-bold text-white">
                    +500
                  </div>
                </div>
              </div>
              <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-1 italic">
                Vagas Abertas
              </h4>
              <p className="text-xs text-stone-500 leading-tight">
                Pós-Graduação reconhecida com selo de excelência.
              </p>
              <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-gold uppercase tracking-[0.2em]">
                  Início Abr/24
                </span>
                <ArrowUpRight size={14} className="text-gold" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  );
}
