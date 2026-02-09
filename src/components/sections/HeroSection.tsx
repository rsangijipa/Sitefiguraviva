"use client";

import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import OrganicBackground from "../ui/OrganicBackground";
import WaveLines from "../ui/WaveLines";
import { buttonVariants } from "../ui/Button";
import { useInstituteSettings } from "@/hooks/useSiteSettings";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
} as const;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function HeroSection({ initialData }: { initialData?: any }) {
  const { data } = useInstituteSettings(initialData);
  const whatsappNumber = data.phone?.replace(/\D/g, "") || "";

  return (
    <header className="relative min-h-[90vh] flex items-center pt-32 pb-24 md:pt-48 md:pb-32 px-6 overflow-hidden bg-[#faf9f6]">
      {/* Dynamic Backgrounds */}
      <OrganicBackground />
      <WaveLines className="opacity-40" />

      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] aspect-square rounded-full bg-gold/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[30%] aspect-square rounded-full bg-primary/5 blur-[80px] pointer-events-none" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-2xl"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse"></span>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary/70">
                {data.title || "Instituto de Gestalt-Terapia"}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-7xl lg:text-8xl font-serif text-primary leading-[1.1] mb-8"
            >
              Habitar a <br />
              <span className="italic text-gold font-light relative">
                Fronteira
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-gold/20"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 5 Q 25 0, 50 5 T 100 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-stone-600 font-light leading-relaxed mb-12 max-w-xl"
            >
              {data.subtitle ||
                "Explorando os contornos da presença e da relação através da Gestalt-Terapia."}
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-5"
            >
              <a
                href={`https://wa.me/55${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-8 py-5 bg-primary text-white rounded-full overflow-hidden transition-all hover:shadow-2xl hover:shadow-primary/20 flex items-center justify-center gap-3"
              >
                <span className="relative z-10 font-bold uppercase tracking-wider text-xs">
                  Agendamento
                </span>
                <ArrowRight
                  size={18}
                  className="relative z-10 group-hover:translate-x-1 transition-transform"
                />
                <div className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
              </a>

              <a
                href="#instituto"
                className="group px-8 py-5 border border-primary/10 bg-white/50 backdrop-blur-sm text-primary rounded-full hover:bg-white hover:border-primary/30 transition-all flex items-center justify-center gap-3"
              >
                <span className="font-bold uppercase tracking-wider text-xs">
                  Cursos Livres
                </span>
                <ArrowUpRight
                  size={18}
                  className="text-stone-400 group-hover:text-gold transition-colors"
                />
              </a>
            </motion.div>
          </motion.div>

          {/* Visual Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
              <Image
                src="/assets/foto-grupo.jpg"
                alt="Encontro Instituto Figura Viva"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent mix-blend-multiply" />
            </div>

            {/* Organic Frames */}
            <div className="absolute -top-10 -right-10 w-40 h-40 border-2 border-gold/20 rounded-full animate-float-slow" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 border-2 border-primary/10 rounded-full animate-float-delayed" />

            {/* Status Card */}
            <div className="absolute -bottom-6 right-10 z-20 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 max-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  Próxima Turma
                </span>
              </div>
              <p className="text-sm font-serif text-primary leading-tight">
                Formação em Clínica Gestáltica
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
