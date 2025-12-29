import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Sprout, X, Sparkles } from 'lucide-react';
import BreathingApp from './resources/BreathingApp';
import FeelingsTree from './FeelingsTree';
import MentalHealthQuiz from './resources/MentalHealthQuiz';
import { useApp } from '../context/AppContext';

export default function ResourcesSection() {
    const [activeResource, setActiveResource] = useState(null); // 'breathing' | 'tree' | 'quiz' | null

    const openResource = (resource) => {
        setActiveResource(resource);
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    const closeResource = () => {
        setActiveResource(null);
        document.body.style.overflow = 'auto';
    };

    return (
        <section id="recursos-interativos" className="py-24 bg-surface border-t border-stone-100 relative overflow-hidden">
            <div className="container mx-auto px-6 max-w-6xl relative z-10">
                <div className="mb-16 text-center max-w-2xl mx-auto">
                    <span className="text-xs font-bold tracking-[0.2em] uppercase text-accent mb-4 block">Ferramentas de Cuidado</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-primary leading-tight">Recursos <span className="italic text-accent font-light">Interativos</span></h2>
                    <p className="text-lg text-text/80 mt-4">
                        Espaços digitais desenhados para cultivar a presença e a awareness no seu dia a dia.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {/* Breathing App Card */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="group relative bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col items-center text-center"
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
                        className="group relative bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col items-center text-center"
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

                    {/* Mental Health Quiz Card */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="group relative bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col items-center text-center"
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
            </div>

            {/* Full Screen Transition Overlay */}
            <AnimatePresence>
                {activeResource && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-paper"
                    >
                        {activeResource === 'breathing' && (
                            <BreathingApp onClose={closeResource} />
                        )}

                        {activeResource === 'tree' && (
                            <div className="w-full h-full relative flex flex-col">
                                <button
                                    onClick={closeResource}
                                    className="absolute top-6 right-6 z-50 p-2 bg-white/80 rounded-full shadow-lg text-primary hover:bg-white transition-all"
                                >
                                    <X size={24} />
                                </button>
                                <div className="flex-1 w-full h-full">
                                    <FeelingsTree isModal={true} />
                                </div>
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
