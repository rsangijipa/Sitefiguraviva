"use client";

import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import OrganicBackground from '../ui/OrganicBackground';
import WaveLines from '../ui/WaveLines';
import { buttonVariants } from '../ui/Button';

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
} as const;

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

export default function HeroSection() {
    return (
        <header className="pt-32 pb-24 md:pt-48 md:pb-32 px-6 bg-paper relative overflow-hidden">
            <OrganicBackground />
            <img
                src="/assets/logo-hero.png"
                alt=""
                className="absolute right-0 top-1/2 -translate-y-1/2 h-[90%] w-auto object-contain opacity-20 dark:opacity-10 blur-[2px] pointer-events-none mix-blend-multiply dark:mix-blend-overlay"
            />
            {/* Soft colored waves overlay */}
            <WaveLines className="z-0 mix-blend-multiply dark:mix-blend-soft-light opacity-80" />

            <div className="absolute top-0 left-0 w-full h-full z-0 bg-gradient-to-b from-paper/20 via-paper/50 to-paper pointer-events-none" />
            <div className="container mx-auto max-w-6xl">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="max-w-4xl relative z-10"
                >
                    <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-8">
                        <span className="w-12 h-[1px] bg-primary/20"></span>
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary/60">Instituto de Gestalt-Terapia</span>
                    </motion.div>

                    <motion.h1 variants={fadeInUp} className="heading-hero mb-8 text-balance">
                        Habitar a <span className="italic text-gold font-light">Fronteira</span>
                    </motion.h1>

                    <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-text font-light leading-relaxed mb-12 max-w-2xl text-balance">
                        Um espaço vivo de acolhimento clínico e formação profissional, onde o encontro transforma.
                    </motion.p>


                    {/* ... (inside component) */}

                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
                        <a
                            href="https://wa.me/556992481585"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={buttonVariants({ variant: 'primary', className: 'w-full sm:w-auto gap-2' })}
                        >
                            Agendamento <ArrowRight size={18} aria-hidden="true" />
                        </a>
                        <a
                            href="#instituto"
                            className={buttonVariants({ variant: 'secondary', className: 'w-full sm:w-auto gap-2 bg-white' })}
                            aria-label="Ver cursos livres"
                        >
                            Cursos Livres <ArrowUpRight size={18} className="text-gray-400" aria-hidden="true" />
                        </a>
                    </motion.div>
                </motion.div>
            </div>
        </header>
    );
}
