import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Sprout, Sparkles, Fingerprint, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import BreathingApp from './resources/BreathingApp';
import FeelingsTree from './FeelingsTree';
import MentalHealthQuiz from './resources/MentalHealthQuiz';
import SomaScan from './somascan/App';
import { useApp } from '../context/AppContext';

export default function ResourcesSection() {
    const [activeResource, setActiveResource] = useState(null); // 'breathing' | 'tree' | 'quiz' | 'somascan'
    const scrollContainerRef = useRef(null);

    const openResource = (resource) => {
        setActiveResource(resource);
        document.body.style.overflow = 'hidden';
    };

    const closeResource = () => {
        setActiveResource(null);
        document.body.style.overflow = 'auto';
    };

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === 'left' ? -350 : 350;
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section id="recursos-interativos" className="py-24 bg-surface border-t border-stone-100 relative overflow-hidden">
            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="mb-12 text-center max-w-2xl mx-auto">
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-accent mb-4 block">Ferramentas de Cuidado</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-primary leading-tight">Recursos <span className="italic text-accent font-light">Interativos</span></h2>
                    <p className="text-lg text-text/80 mt-4">
                        Espaços digitais desenhados para cultivar a presença e a awareness no seu dia a dia.
                    </p>
                </div>

                {/* Horizontal Scroll Container */}
                <div className="relative w-full">
                    {/* Fade Edges */}
                    <div className="absolute left-0 top-0 bottom-12 w-12 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-12 w-12 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none" />

                    <div
                        ref={scrollContainerRef}
                        className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-12 px-6 scrollbar-hide"
                        style={{ scrollBehavior: 'smooth' }}
                    >

                        {/* Breathing App Card */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="flex-shrink-0 w-80 md:w-96 snap-center group relative bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col items-center text-center"
                            onClick={() => openResource('breathing')}
                        >
                            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
                                <Wind size={32} />
                            </div>
                            <h3 className="text-xl font-serif text-primary font-bold mb-2">Guia de Respiração</h3>
                            <p className="text-text/60 text-sm mb-6 flex-grow">
                                Uma pausa guiada para reduzir a ansiedade e reconectar com o agora.
                            </p>
                            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-accent group-hover:text-primary transition-colors">
                                Iniciar Prática
                            </span>
                        </motion.div>

                        {/* Feelings Tree Card */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="flex-shrink-0 w-80 md:w-96 snap-center group relative bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col items-center text-center"
                            onClick={() => openResource('tree')}
                        >
                            <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center text-gold mb-6 group-hover:scale-110 transition-transform">
                                <Sprout size={32} />
                            </div>
                            <h3 className="text-xl font-serif text-primary font-bold mb-2">Árvore da Awareness</h3>
                            <p className="text-text/60 text-sm mb-6 flex-grow">
                                Visualize e nomeie suas emoções em uma experiência interativa 3D.
                            </p>
                            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gold group-hover:text-primary transition-colors">
                                Acessar Árvore
                            </span>
                        </motion.div>

                        {/* SomaScan Card (NEW) */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="flex-shrink-0 w-80 md:w-96 snap-center group relative bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col items-center text-center"
                            onClick={() => openResource('somascan')}
                        >
                            <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-600 mb-6 group-hover:scale-110 transition-transform">
                                <Fingerprint size={32} />
                            </div>
                            <h3 className="text-xl font-serif text-primary font-bold mb-2">SomaScan</h3>
                            <p className="text-text/60 text-sm mb-6 flex-grow">
                                Mapeamento corporal consciente para escutar o que o corpo diz.
                            </p>
                            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-600 group-hover:text-primary transition-colors">
                                Iniciar Scan
                            </span>
                        </motion.div>

                        {/* Mental Health Quiz Card */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="flex-shrink-0 w-80 md:w-96 snap-center group relative bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col items-center text-center"
                            onClick={() => openResource('quiz')}
                        >
                            <div className="w-16 h-16 rounded-2xl bg-sage/10 flex items-center justify-center text-sage mb-6 group-hover:scale-110 transition-transform">
                                <Sparkles size={32} />
                            </div>
                            <h3 className="text-xl font-serif text-primary font-bold mb-2">Quiz de Saúde Mental</h3>
                            <p className="text-text/60 text-sm mb-6 flex-grow">
                                Mindful Roots: Um check-in rápido de 14 dias para sua saúde emocional.
                            </p>
                            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-sage group-hover:text-primary transition-colors">
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
            <AnimatePresence>
                {activeResource && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-paper overflow-y-auto"
                    >
                        {activeResource === 'breathing' && (
                            <BreathingApp onClose={closeResource} />
                        )}

                        {activeResource === 'tree' && (
                            <FeelingsTree isModal={true} onClose={closeResource} />
                        )}

                        {activeResource === 'somascan' && (
                            <div className="w-full h-full relative min-h-screen bg-[#faf9f6]">
                                {/* Wrapper Exit Button for Somascan */}
                                <div className="absolute top-6 left-6 z-50">
                                    <button
                                        onClick={closeResource}
                                        className="flex items-center gap-2 p-3 md:px-5 md:py-2.5 rounded-full bg-white/50 backdrop-blur border border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-400 font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
                                    >
                                        <ArrowLeft size={20} />
                                        <span className="hidden md:inline">Voltar</span>
                                    </button>
                                </div>
                                <SomaScan />
                            </div>
                        )}

                        {activeResource === 'quiz' && (
                            <MentalHealthQuiz onClose={closeResource} />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
