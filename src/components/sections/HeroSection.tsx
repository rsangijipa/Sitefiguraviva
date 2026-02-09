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
  const whatsappNumber = data.phone.replace(/\D/g, "");

  return (
    <header className="pt-32 pb-24 md:pt-48 md:pb-32 px-6 bg-paper relative overflow-hidden">
      <OrganicBackground />
      <div className="absolute right-[2%] top-[50%] -translate-y-1/2 h-[85%] md:h-[95%] aspect-square pointer-events-none opacity-60 mix-blend-multiply z-0">
        <Image
          src="/assets/hero-bg-custom.jpg"
          alt=""
          fill
          className="object-contain transition-all duration-1000 animate-float-slow"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          fetchPriority="high"
        />
      </div>
      {/* Soft colored waves overlay */}
      <WaveLines className="z-0 mix-blend-multiply opacity-80" />

      <div className="absolute top-0 left-0 w-full h-full z-0 bg-gradient-to-b from-paper/20 via-paper/50 to-paper pointer-events-none" />
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl relative z-10"
        >
          <motion.div
            variants={fadeInUp}
            className="flex items-center gap-4 mb-8"
          >
            <span className="w-12 h-[1px] bg-primary/20"></span>
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary/60">
              {data.title || "Instituto de Gestalt-Terapia"}
            </span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="heading-hero mb-8 text-balance"
          >
            Habitar a{" "}
            <span className="italic text-gold font-light">Fronteira</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-text font-light leading-relaxed mb-12 max-w-2xl text-balance"
          >
            {data.subtitle}
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4"
          >
            <a
              href={`https://wa.me/55${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({
                variant: "primary",
                className: "w-full sm:w-auto gap-2",
              })}
            >
              Agendamento <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a
              href="#instituto"
              className={buttonVariants({
                variant: "secondary",
                className: "w-full sm:w-auto gap-2 bg-white",
              })}
              aria-label="Ver cursos livres"
            >
              Cursos Livres{" "}
              <ArrowUpRight
                size={18}
                className="text-gray-400"
                aria-hidden="true"
              />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </header>
  );
}
