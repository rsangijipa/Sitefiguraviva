"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useInstituteSettings } from "@/hooks/useSiteSettings";
import FiguraVivaTree from "../visual/FiguraVivaTree";

export default function HeroSection({ initialData }: { initialData?: any }) {
  const { data } = useInstituteSettings(initialData);
  const whatsappNumber = data.phone?.replace(/\D/g, "") || "11999999999";

  return (
    <header className="relative isolate overflow-hidden bg-paper px-6 pb-16 pt-28 md:pb-20 md:pt-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_28%,rgba(212,175,55,0.18),transparent_32%),linear-gradient(120deg,rgba(255,255,255,0.72),transparent_65%)]" />
      <div className="pointer-events-none absolute -right-28 top-16 -z-10 h-80 w-80 rounded-full border border-gold/20 md:h-[30rem] md:w-[30rem]" />

      <div className="container relative z-10 mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.72fr)] lg:gap-12">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="max-w-3xl"
        >
          <h1 className="max-w-3xl font-serif text-5xl leading-[0.98] text-primary md:text-7xl">
            Instituto de Gestalt-terapia de Rondônia Figura Viva
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-600 md:text-xl">
            Um espaço de estudo, cuidado e encontro para habitar a
            Gestalt-terapia com profundidade, rigor e presença.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={`https://wa.me/55${whatsappNumber}?text=Olá! Gostaria de informações sobre as formações do Instituto Figura Viva.`}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-primary px-7 py-4 text-[12px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-gold"
            >
              Falar com consultora
              <ArrowRight
                size={17}
                className="transition group-hover:translate-x-1"
              />
            </a>
            <a
              href="#cursos"
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-primary/20 bg-white/50 px-7 py-4 text-[12px] font-bold uppercase tracking-[0.14em] text-primary transition hover:border-gold hover:bg-white"
            >
              Ver formações
              <Sparkles size={16} className="text-gold" />
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="relative hidden min-h-[22rem] items-end justify-center lg:flex"
          aria-hidden="true"
        >
          <FiguraVivaTree className="relative z-10" />
          <div className="absolute bottom-8 h-16 w-64 rounded-full bg-gold/10 blur-2xl" />
        </motion.div>
      </div>
    </header>
  );
}
