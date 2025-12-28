"use client";

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MessageCircle, Users, ChevronDown } from 'lucide-react';

const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeInOut" as const }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

export default function HeroSection() {
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <header ref={heroRef} className="relative w-full h-[100vh] flex items-center justify-center overflow-hidden -mt-20"> {/* Negative margin to counteract pt-20 main padding for full hero */}
            <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&q=80&w=2000"
                    alt="Nature Texture"
                    className="w-full h-full object-cover scale-110"
                />
                <div className="absolute inset-0 bg-primary/40 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-paper" />
            </motion.div>

            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="relative z-10 container mx-auto px-6 text-center"
            >
                <motion.div variants={fadeInUp} className="mb-8">
                    <span className="inline-block px-6 py-2 rounded-full glass-dark text-paper/90 text-[10px] font-bold tracking-[0.3em] uppercase backdrop-blur-3xl border border-white/10">
                        Instituto de Gestalt-Terapia
                    </span>
                </motion.div>

                <motion.h1 variants={fadeInUp} className="font-serif text-6xl md:text-8xl lg:text-[9rem] text-paper mb-10 leading-[0.85] tracking-tighter">
                    Habitar a <br />
                    <span className="italic text-gold font-light relative">
                        fronteira
                        <motion.span
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ delay: 1, duration: 1.5, ease: "easeInOut" }}
                            className="absolute -bottom-4 left-0 h-[2px] bg-gradient-to-r from-gold/0 via-gold to-gold/0 opacity-60"
                        />
                    </span>
                </motion.h1>

                <motion.p variants={fadeInUp} className="text-paper/70 text-lg md:text-2xl font-light mb-16 max-w-2xl mx-auto tracking-wide leading-relaxed text-balance">
                    Um espaço vivo de acolhimento clínico e formação profissional, onde o encontro transforma.
                </motion.p>

                <motion.div variants={fadeInUp} className="flex flex-col md:flex-row gap-6 justify-center items-center">
                    <a href="#clinica" className="group relative px-8 py-5 bg-paper text-primary font-bold uppercase tracking-[0.2em] text-[10px] rounded-full overflow-hidden transition-soft hover:scale-105 shadow-2xl shadow-black/20 w-fit">
                        <span className="relative z-10 flex items-center gap-3">
                            Agendar Conversa <MessageCircle size={16} className="text-accent group-hover:scale-110 transition-transform" />
                        </span>
                    </a>
                    <a href="#instituto" className="group relative px-8 py-5 bg-transparent border border-paper/20 text-paper font-bold uppercase tracking-[0.2em] text-[10px] rounded-full overflow-hidden transition-soft hover:bg-paper hover:text-primary backdrop-blur-md w-fit">
                        <span className="relative z-10">Conhecer Cursos</span>
                    </a>
                </motion.div>

                <motion.div variants={fadeInUp} className="mt-12 flex items-center justify-center gap-2 text-paper/60">
                    <div className="flex -space-x-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-primary bg-sage/20 overflow-hidden">
                                <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Aluno" className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                    <span className="text-[10px] font-bold tracking-widest uppercase ml-2 flex items-center gap-1">
                        <Users size={12} className="text-gold" /> +320 Alunos formados
                    </span>
                </motion.div>

            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 15, 0] }}
                transition={{ delay: 2, duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 text-paper/40 flex flex-col items-center gap-2"
            >
                <span className="text-[9px] uppercase tracking-[0.4em] font-bold">Descubra</span>
                <ChevronDown size={24} />
            </motion.div>
        </header>
    );
}
