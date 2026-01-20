"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Sprout, Sparkles, Fingerprint, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import BreathingApp from './resources/BreathingApp';
import FeelingsTree from './FeelingsTree';
import MentalHealthQuiz from './resources/MentalHealthQuiz';
import SomaScan from './somascan/App';
import { Modal, ModalContent, ModalBody } from './ui/Modal';

export default function ResourcesSection() {
    const [activeResource, setActiveResource] = useState(null); // 'breathing' | 'tree' | 'quiz' | 'somascan'
    const scrollContainerRef = useRef(null);

    const openResource = (resource) => {
        setActiveResource(resource);
    };

    const closeResource = () => {
        setActiveResource(null);
    };

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === 'left' ? -350 : 350;
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section id="recursos-interativos" className="py-24 bg-surface dark:bg-black/20 border-t border-stone-100 dark:border-white/5 relative overflow-hidden transition-colors duration-500">
            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-12 text-center max-w-2xl mx-auto"
                >
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-accent mb-4 block">Ferramentas de Cuidado</span>
                    <h2 className="heading-section text-primary dark:text-text">Recursos <span className="italic text-accent font-light">Interativos</span></h2>
                    <p className="text-lg text-text/80 dark:text-text/60 mt-4">
                        Espaços digitais desenhados para cultivar a presença e a awareness no seu dia a dia.
                    </p>
                </motion.div>

                {/* Horizontal Scroll Container */}
                <div className="relative w-full">
                    {/* Fade Edges */}
                    <div className="absolute left-0 top-0 bottom-12 w-12 bg-gradient-to-r from-surface dark:from-black/0 to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-12 w-12 bg-gradient-to-l from-surface dark:from-black/0 to-transparent z-10 pointer-events-none" />

                    <div
                        ref={scrollContainerRef}
                        className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-12 px-6 scrollbar-hide"
                        style={{ scrollBehavior: 'smooth' }}
                    >

                        {/* Breathing App Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -5 }}
                            className="flex-shrink-0 w-80 md:w-96 snap-center group relative bg-white dark:bg-surface rounded-[2rem] p-8 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col items-center text-center"
                            onClick={() => openResource('breathing')}
                        >
                            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
                                <Wind size={32} />
                            </div>
                            <h3 className="text-xl font-serif text-primary dark:text-text font-bold mb-2">Guia de Respiração</h3>
                            <p className="text-text/60 dark:text-text/50 text-sm mb-6 flex-grow">
                                Uma pausa guiada para reduzir a ansiedade e reconectar com o agora.
                            </p>
                            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-accent group-hover:text-primary dark:group-hover:text-gold transition-colors">
                                Iniciar Prática
                            </span>
                        </motion.div>

                        {/* Feelings Tree Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            whileHover={{ y: -5 }}
                            className="flex-shrink-0 w-80 md:w-96 snap-center group relative bg-white dark:bg-surface rounded-[2rem] p-8 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col items-center text-center"
                            onClick={() => openResource('tree')}
                        >
                            <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center text-gold mb-6 group-hover:scale-110 transition-transform">
                                <Sprout size={32} />
                            </div>
                            <h3 className="text-xl font-serif text-primary dark:text-text font-bold mb-2">Árvore da Awareness</h3>
                            <p className="text-text/60 dark:text-text/50 text-sm mb-6 flex-grow">
                                Visualize e nomeie suas emoções em uma experiência interativa 3D.
                            </p>
                            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gold group-hover:text-primary dark:group-hover:text-white transition-colors">
                                Acessar Árvore
                            </span>
                        </motion.div>

                        {/* SomaScan Card (NEW) */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            whileHover={{ y: -5 }}
                            className="flex-shrink-0 w-80 md:w-96 snap-center group relative bg-white dark:bg-surface rounded-[2rem] p-8 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col items-center text-center"
                            onClick={() => openResource('somascan')}
                        >
                            <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-white/5 flex items-center justify-center text-stone-600 dark:text-stone-300 mb-6 group-hover:scale-110 transition-transform">
                                <Fingerprint size={32} />
                            </div>
                            <h3 className="text-xl font-serif text-primary dark:text-text font-bold mb-2">SomaScan</h3>
                            <p className="text-text/60 dark:text-text/50 text-sm mb-6 flex-grow">
                                Mapeamento corporal consciente para escutar o que o corpo diz.
                            </p>
                            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-600 dark:text-stone-400 group-hover:text-primary dark:group-hover:text-white transition-colors">
                                Iniciar Scan
                            </span>
                        </motion.div>

                        {/* Mental Health Quiz Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            whileHover={{ y: -5 }}
                            className="flex-shrink-0 w-80 md:w-96 snap-center group relative bg-white dark:bg-surface rounded-[2rem] p-8 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col items-center text-center"
                            onClick={() => openResource('quiz')}
                        >
                            <div className="w-16 h-16 rounded-2xl bg-sage/10 dark:bg-accent/10 flex items-center justify-center text-sage dark:text-accent mb-6 group-hover:scale-110 transition-transform">
                                <Sparkles size={32} />
                            </div>
                            <h3 className="text-xl font-serif text-primary dark:text-text font-bold mb-2">Quiz de Saúde Mental</h3>
                            <p className="text-text/60 dark:text-text/50 text-sm mb-6 flex-grow">
                                Mindful Roots: Um check-in rápido de 14 dias para sua saúde emocional.
                            </p>
                            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-sage dark:text-accent group-hover:text-primary dark:group-hover:text-white transition-colors">
                                Fazer Check-in
                            </span>
                        </motion.div>

                    </div>

                    {/* Visual Scroll Controls */}
                    <div className="flex items-center justify-center gap-6 mt-4 opacity-70 hover:opacity-100 transition-opacity pb-4">
                        <button
                            onClick={() => scroll('left')}
                            className="p-3 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-800 transition-colors border border-transparent hover:border-stone-200"
                            aria-label="Scroll Left"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <div className="w-32 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-stone-300 w-1/3 rounded-full"
                                animate={{ x: [0, 80, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            />
                        </div>

                        <button
                            onClick={() => scroll('right')}
                            className="p-3 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-800 transition-colors border border-transparent hover:border-stone-200"
                            aria-label="Scroll Right"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Full Screen Transition Overlay */}
            {/* Full Screen Transition Overlay */}
            <Modal isOpen={!!activeResource} onClose={closeResource}>
                <ModalContent size="xl" className="bg-paper p-0">
                    {/* Wrapper Exit Button (Global for all resources) */}
                    <div className="absolute top-6 left-6 z-50">
                        <button
                            onClick={closeResource}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur border border-stone-200 text-stone-600 hover:text-primary hover:border-gold/50 font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all active:scale-95"
                        >
                            <ArrowLeft size={16} />
                            <span className="hidden md:inline">Voltar</span>
                        </button>
                    </div>

                    {/* Premium Close Button (Top Right) */}
                    <button
                        onClick={closeResource}
                        className="absolute top-6 right-6 z-50 group flex items-center gap-2 bg-white/80 backdrop-blur border border-stone-200 pl-3 pr-2 py-2 rounded-full text-primary hover:bg-gold hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary shadow-sm hover:translate-y-[-1px]"
                    >
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 w-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-300 overflow-hidden whitespace-nowrap">
                            Fechar
                        </span>
                        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-stone-100 group-hover:bg-white/20 transition-colors">
                            <span className="text-xl leading-none -mt-1">×</span>
                        </div>
                    </button>

                    <ModalBody className="p-0">
                        {activeResource === 'breathing' && (
                            <BreathingApp onClose={closeResource} />
                        )}

                        {activeResource === 'tree' && (
                            <FeelingsTree isModal={true} onClose={closeResource} />
                        )}

                        {activeResource === 'somascan' && (
                            <div className="w-full h-full relative min-h-[80vh] bg-[#faf9f6]">
                                <SomaScan />
                            </div>
                        )}

                        {activeResource === 'quiz' && (
                            <MentalHealthQuiz onClose={closeResource} />
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </section>
    );
}
