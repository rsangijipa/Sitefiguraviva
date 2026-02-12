"use client";

import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import Image from "next/image";
import OrganicBackground from "../ui/OrganicBackground";
import WaveLines from "../ui/WaveLines";
import { useInstituteSettings } from "@/hooks/useSiteSettings";

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
  const whatsappNumber = data.phone?.replace(/\D/g, "") || "11999999999"; // Fallback safe

  return (
    <header className="relative min-h-screen flex items-center pt-32 pb-24 md:pt-40 md:pb-32 px-6 overflow-hidden bg-[#FEFDFB]">
      {/* Premium Background Layers */}
      <OrganicBackground />
      <WaveLines className="opacity-30 mix-blend-multiply" />

      {/* Artistic Gradients */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] aspect-square rounded-full bg-gradient-to-br from-gold/20 to-transparent blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] aspect-square rounded-full bg-gradient-to-tr from-primary/10 to-transparent blur-[100px] pointer-events-none" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-left"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm mb-10 group hover:border-gold/30 transition-colors"
            >
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-gold animate-ping absolute inset-0" />
                <div className="w-2.5 h-2.5 rounded-full bg-gold relative" />
              </div>
              <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-primary/80">
                {data.title || "Instituto Figura Viva"}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-6xl md:text-8xl lg:text-9xl font-serif text-primary leading-[0.95] tracking-tight mb-10"
            >
              A Arte da <br />
              <span className="italic text-gold font-light">Presença</span>
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

          {/* Premium Visual Composition */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl group border-[12px] border-white/50 backdrop-blur-sm">
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
              className="absolute -top-12 -right-12 w-48 h-48 border-[1.5px] border-gold/30 rounded-full mix-blend-multiply"
            />
            <motion.div
              animate={{ y: [0, 25, 0] }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute -bottom-16 -left-16 w-64 h-64 border-[1.5px] border-primary/10 rounded-full mix-blend-multiply"
            />

            {/* Social Proof/Status Floating Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 }}
              className="absolute -bottom-10 right-10 z-20 bg-white/80 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-2xl border border-white max-w-[240px] group hover:-translate-y-2 transition-transform duration-500"
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
          </motion.div>
        </div>
      </div>
    </header>
  );
}
