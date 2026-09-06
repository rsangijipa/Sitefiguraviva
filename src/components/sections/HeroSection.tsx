"use client";

import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import Image from "next/image";
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

export default function HeroSection({ initialData }: { initialData?: any }) {
  const { data } = useInstituteSettings(initialData);
  const whatsappNumber = data.phone?.replace(/\D/g, "") || "11999999999";

  const isParticlesEnabled = process.env.NEXT_PUBLIC_ENABLE_PARTICLES === "1";

  return (
    <header className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden bg-fv-areia px-6 pb-20 pt-28 md:pb-28 md:pt-36">
      {/* Premium Background Engine */}
      <BackgroundEngine />
      {isParticlesEnabled && <ParticlesLayer />}

      {/* Decorative Overlays */}
      <WaveLines className="opacity-20 mix-blend-multiply" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 xl:gap-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-left"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-fv-creme border border-fv-nevoa mb-8 group hover:border-fv-terra-barro transition-colors"
            >
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-fv-terra-barro animate-ping absolute inset-0 motion-reduce:animate-none" />
                <div className="w-2.5 h-2.5 rounded-full bg-fv-terra-barro relative" />
              </div>
              <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-fv-verde-raiz">
                {data.title || "Instituto Figura Viva"}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0.8, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-fluid-h1 font-serif font-semibold text-fv-verde-raiz mb-8 max-w-[14ch] text-balance"
            >
              A Arte da <br />
              <span className="italic font-normal text-fv-verde-igarape">
                Presença
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-fv-pedra leading-relaxed mb-10 max-w-[46ch]"
            >
              Transforme sua percepção e prática através da{" "}
              <span className="font-medium text-fv-verde-raiz">
                Gestalt-Terapia
              </span>
              . Um espaço de estudo dedicado à profundidade da relação.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4"
            >
              <a
                href={`https://wa.me/55${whatsappNumber}?text=Olá! Gostaria de informações sobre as formações do Instituto Figura Viva.`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative min-h-[56px] px-8 py-4 bg-fv-verde-raiz text-fv-creme rounded-full overflow-hidden transition-colors hover:bg-fv-verde-igarape flex items-center justify-center gap-4 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fv-verde-raiz"
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
                href="#cursos"
                className="group min-h-[56px] px-8 py-4 border border-fv-nevoa bg-fv-creme text-fv-verde-raiz rounded-full hover:bg-fv-areia hover:border-fv-verde-raiz transition-colors flex items-center justify-center gap-4 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fv-verde-raiz"
              >
                <span className="font-bold uppercase tracking-[0.15em] text-[13px]">
                  Ver Formações
                </span>
                <Sparkles
                  size={18}
                  className="text-fv-pedra group-hover:text-fv-terra-barro group-hover:rotate-12 transition-all"
                />
              </a>
            </motion.div>
          </motion.div>

          {/* Premium Visual Composition */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block lg:pl-4"
          >
            <div className="relative z-10 aspect-[4/5] max-h-[70vh] mx-auto rounded-[3rem] overflow-hidden group border-8 border-fv-creme ring-1 ring-fv-nevoa">
              <Image
                src="/assets/logo-figura-viva.jpg"
                alt="Formação em Gestalt-Terapia"
                fill
                className="object-cover transform scale-105 transition-transform duration-[2s] group-hover:scale-100"
                sizes="50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent opacity-60 mix-blend-overlay" />
            </div>

            {/* Float Elements */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-12 -right-12 w-48 h-48 border-[1.5px] border-fv-nevoa rounded-full pointer-events-none"
            />
            <motion.div
              animate={{ y: [0, 25, 0] }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute -bottom-16 -left-16 w-64 h-64 border-[1.5px] border-fv-nevoa rounded-full pointer-events-none"
            />

            {/* Social Proof/Status Floating Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 }}
              className="absolute -bottom-8 right-6 z-20 bg-fv-creme p-6 rounded-[2rem] border border-fv-nevoa max-w-[240px] group hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-fv-creme bg-fv-areia"
                    />
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-fv-creme bg-fv-terra-barro text-[8px] flex items-center justify-center font-bold text-fv-creme">
                    +500
                  </div>
                </div>
              </div>
              <h4 className="text-sm font-bold text-fv-verde-raiz uppercase tracking-widest mb-1">
                Vagas Abertas
              </h4>
              <p className="text-xs text-fv-pedra leading-tight">
                Pós-Graduação reconhecida com selo de excelência.
              </p>
              <div className="mt-4 pt-4 border-t border-fv-nevoa flex items-center justify-between">
                <span className="text-[10px] font-bold text-fv-terra-barro uppercase tracking-[0.2em]">
                  Início Abr/24
                </span>
                <ArrowUpRight
                  size={14}
                  className="text-fv-terra-barro"
                  aria-hidden="true"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
