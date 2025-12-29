import React, { useState, useEffect, useRef } from 'react';
import { PaperCard } from './PaperCard';
import { TECHNIQUES, SESSION_DURATION_SECONDS } from './constants';
import { BreathingAnimation } from './BreathingAnimation';
import { Play, ArrowLeft, Wind, Leaf, Info, CheckCircle2, Pause, Square, X } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function BreathingApp({ onClose }) {
    const [appState, setAppState] = useState('menu'); // menu, active, completed
    const [selectedTechniqueId, setSelectedTechniqueId] = useState('4-6');
    const [secondsRemaining, setSecondsRemaining] = useState(SESSION_DURATION_SECONDS);
    const [sessionActive, setSessionActive] = useState(false);
    const timerRef = useRef(null);

    const activeTechnique = TECHNIQUES[selectedTechniqueId];

    // Timer Logic
    useEffect(() => {
        if (sessionActive && secondsRemaining > 0) {
            timerRef.current = window.setInterval(() => {
                setSecondsRemaining((prev) => prev - 1);
            }, 1000);
        } else if (secondsRemaining === 0) {
            completeSession();
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [sessionActive, secondsRemaining]);

    const startSession = () => {
        setAppState('active');
        setSessionActive(true);
    };

    const stopSession = () => {
        setSessionActive(false);
        if (timerRef.current) clearInterval(timerRef.current);
        setAppState('menu');
        setSecondsRemaining(SESSION_DURATION_SECONDS);
    };

    const completeSession = () => {
        setSessionActive(false);
        if (timerRef.current) clearInterval(timerRef.current);
        setAppState('completed');
    };

    const resetSession = () => {
        setAppState('menu');
        setSecondsRemaining(SESSION_DURATION_SECONDS);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // --- SUB-COMPONENTS ---

    // Modern SVG Timer Ring
    const TimerRing = ({ total, current }) => {
        const radius = 120;
        const circumference = 2 * Math.PI * radius;
        const progress = current / total;
        const strokeDashoffset = circumference - progress * circumference;

        return (
            <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Background Ring */}
                <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 260 260">
                    <circle
                        cx="130"
                        cy="130"
                        r={radius}
                        className="stroke-stone-200/50"
                        strokeWidth="3"
                        fill="none"
                    />
                    {/* Progress Ring with Glow */}
                    <motion.circle
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1, ease: "linear" }}
                        cx="130"
                        cy="130"
                        r={radius}
                        className="stroke-primary drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                        strokeWidth="6"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeLinecap="round"
                    />
                </svg>

                <div className="flex flex-col items-center z-10">
                    <span className="text-5xl font-sans font-light text-primary tracking-tight">
                        {formatTime(current)}
                    </span>
                    <span className="text-sm font-sans uppercase tracking-widest text-gray-400 mt-2">
                        Restante
                    </span>
                </div>
            </div>
        );
    };

    // --- VIEWS ---

    const renderMenu = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl w-full mx-auto px-6 py-12 flex flex-col items-center"
        >
            <div className="w-full flex justify-start mb-4 relative z-20">
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/50 hover:bg-white text-gray-700 hover:text-primary font-sans font-bold shadow-sm hover:shadow-md transition-all group border border-transparent hover:border-gray-100"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Voltar</span>
                </button>
            </div>

            <header className="mb-12 text-center max-w-2xl relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 text-accent mb-6"
                >
                    <Leaf size={32} />
                </motion.div>
                <h1 className="text-5xl md:text-6xl font-serif text-primary mb-4 tracking-tight">Respire</h1>
                <p className="text-xl font-sans text-gray-600 leading-relaxed">
                    Uma pausa de 2 minutos para reconectar com seu corpo e reduzir a ansiedade.
                </p>
            </header>

            <div className="grid md:grid-cols-2 gap-6 w-full mb-12">
                {/* Card 1: 4-6 */}
                <PaperCard
                    onClick={() => setSelectedTechniqueId('4-6')}
                    active={selectedTechniqueId === '4-6'}
                    className={clsx(
                        "cursor-pointer group h-full flex flex-col transition-all duration-300",
                        selectedTechniqueId === '4-6' ? "ring-2 ring-accent border-accent/20 shadow-xl bg-white" : "hover:bg-white/60"
                    )}
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className={clsx("p-3 rounded-xl transition-colors", selectedTechniqueId === '4-6' ? "bg-accent text-white shadow-lg shadow-accent/20" : "bg-accent/10 text-accent")}>
                            <svg width="32" height="16" viewBox="0 0 100 50" className="stroke-current stroke-[4] fill-none">
                                <path d="M10,40 Q30,10 50,40 T90,40" />
                            </svg>
                        </div>
                        {selectedTechniqueId === '4-6' && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                <CheckCircle2 className="text-accent" size={24} />
                            </motion.div>
                        )}
                    </div>

                    <h3 className="text-2xl font-serif font-bold text-primary mb-1">Calma Rápida (4-6)</h3>
                    <p className="font-sans text-gray-500 mb-6">Ideal para momentos de ansiedade aguda ou estresse imediato.</p>

                    <div className="mt-auto space-y-3 bg-white/50 p-4 rounded-xl border border-white">
                        <div className="flex items-center text-sm font-sans text-gray-700">
                            <span className="w-16 font-bold text-accent">4 seg</span>
                            <span>Inspiração nasal</span>
                        </div>
                        <div className="w-full h-px bg-gray-200/50"></div>
                        <div className="flex items-center text-sm font-sans text-gray-700">
                            <span className="w-16 font-bold text-accent">6 seg</span>
                            <span>Expiração pela boca</span>
                        </div>
                    </div>
                </PaperCard>

                {/* Card 2: Pursed Lips */}
                <PaperCard
                    onClick={() => setSelectedTechniqueId('pursed-lips')}
                    active={selectedTechniqueId === 'pursed-lips'}
                    className={clsx(
                        "cursor-pointer group h-full flex flex-col transition-all duration-300",
                        selectedTechniqueId === 'pursed-lips' ? "ring-2 ring-secondary border-secondary/20 shadow-xl bg-white" : "hover:bg-white/60"
                    )}
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className={clsx("p-3 rounded-xl transition-colors", selectedTechniqueId === 'pursed-lips' ? "bg-secondary text-white shadow-lg shadow-secondary/20" : "bg-secondary/10 text-secondary")}>
                            <Wind size={24} />
                        </div>
                        {selectedTechniqueId === 'pursed-lips' && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                <CheckCircle2 className="text-secondary" size={24} />
                            </motion.div>
                        )}
                    </div>

                    <h3 className="text-2xl font-serif font-bold text-primary mb-1">Lábios Semicerrados</h3>
                    <p className="font-sans text-gray-500 mb-6">Foco total no controle da saída de ar para recuperar o fôlego.</p>

                    <div className="mt-auto space-y-3 bg-white/50 p-4 rounded-xl border border-white">
                        <div className="flex items-center text-sm font-sans text-gray-700">
                            <span className="w-16 font-bold text-secondary">Nasal</span>
                            <span>Inspiração profunda</span>
                        </div>
                        <div className="w-full h-px bg-gray-200/50"></div>
                        <div className="flex items-center text-sm font-sans text-gray-700">
                            <span className="w-16 font-bold text-secondary">Lento</span>
                            <span>Expiração com bico</span>
                        </div>
                    </div>
                </PaperCard>
            </div>

            <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.2)" }}
                whileTap={{ scale: 0.98 }}
                onClick={startSession}
                className="group relative inline-flex items-center justify-center px-10 py-5 font-serif text-xl font-bold text-white transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-xl hover:shadow-2xl w-full md:w-auto min-w-[240px] overflow-hidden"
            >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                <span className="mr-2 relative z-10">Iniciar Prática</span>
                <Play size={20} className="fill-current relative z-10" />
            </motion.button>

            {/* Footer Warning */}
            <div className="mt-16 flex items-start gap-3 text-gray-500 max-w-xl mx-auto bg-white/40 p-4 rounded-xl backdrop-blur-sm">
                <Info className="shrink-0 mt-0.5" size={18} />
                <p className="text-sm font-sans leading-relaxed text-left">
                    <strong>Nota Importante:</strong> Esta ferramenta é para auxílio no relaxamento. Se houver falta de ar intensa, dor no peito ou sinais de crise, procure suporte médico imediato.
                </p>
            </div>
        </motion.div>
    );

    const renderActiveSession = () => {
        const progressPercent = ((SESSION_DURATION_SECONDS - secondsRemaining) / SESSION_DURATION_SECONDS) * 100;

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                className="w-full max-w-2xl mx-auto px-4 flex flex-col items-center min-h-[80vh] justify-center"
            >
                <div className="w-full flex flex-col mb-8">
                    <div className="flex justify-between items-center">
                        <button
                            onClick={stopSession}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/50 hover:bg-white text-gray-700 hover:text-primary font-sans font-medium shadow-sm hover:shadow-md transition-all group border border-transparent hover:border-gray-100"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            <span>Voltar</span>
                        </button>
                        <div className="text-center">
                            <h2 className="font-serif text-2xl text-primary font-bold">{activeTechnique.title}</h2>
                            <p className="text-gray-500 font-sans text-sm">{activeTechnique.subtitle}</p>
                        </div>
                        <div className="w-10"></div> {/* Spacer for alignment */}
                    </div>

                    {/* Global Session Progress Bar */}
                    <div className="w-full h-1.5 bg-gray-200/50 rounded-full mt-6 overflow-hidden">
                        <motion.div
                            className={clsx("h-full", activeTechnique.color)}
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1, ease: "linear" }}
                        />
                    </div>
                </div>

                <div className="relative mb-12 w-full flex justify-center">
                    <BreathingAnimation technique={activeTechnique} isActive={sessionActive} />
                </div>

                <div className="mb-12">
                    <TimerRing total={SESSION_DURATION_SECONDS} current={secondsRemaining} />
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6">
                    <button
                        onClick={sessionActive ? () => setSessionActive(false) : () => setSessionActive(true)}
                        className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                        {sessionActive ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" className="ml-1" size={24} />}
                    </button>

                    <button
                        onClick={stopSession}
                        className="flex items-center gap-2 px-6 py-3 rounded-full border border-gray-300 text-gray-600 font-sans font-bold hover:bg-gray-100 transition-colors"
                    >
                        <Square size={16} /> Parar
                    </button>
                </div>
            </motion.div>
        );
    };

    const renderCompleted = () => (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full mx-auto text-center px-6"
        >
            <PaperCard className="py-16 flex flex-col items-center bg-white/90">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-8"
                >
                    <Leaf size={48} />
                </motion.div>

                <h2 className="text-4xl font-serif text-primary mb-4">Sessão Concluída</h2>
                <p className="font-sans text-lg text-gray-600 mb-10 leading-relaxed max-w-xs mx-auto">
                    Você completou seus 2 minutos. Tire um momento para perceber como seu corpo se sente agora.
                </p>

                <div className="flex flex-col gap-4 w-full">
                    <button
                        onClick={resetSession}
                        className="bg-primary text-white py-4 px-10 rounded-full font-sans font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                    >
                        Voltar ao Início
                    </button>
                    <button
                        onClick={onClose}
                        className="text-primary font-bold uppercase tracking-widest text-xs py-4 hover:bg-gray-50 rounded-full transition-colors"
                    >
                        Fechar Aplicativo
                    </button>
                </div>

            </PaperCard>
        </motion.div>
    );

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-paper overflow-y-auto">
            {/* Background Elements */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />
            <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 via-transparent to-accent/5 pointer-events-none" />

            <main className="flex-grow flex flex-col justify-center relative z-10 py-8 min-h-screen">
                <AnimatePresence mode="wait">
                    {appState === 'menu' && (
                        <motion.div key="menu" className="w-full">
                            {renderMenu()}
                        </motion.div>
                    )}
                    {appState === 'active' && (
                        <motion.div key="active" className="w-full">
                            {renderActiveSession()}
                        </motion.div>
                    )}
                    {appState === 'completed' && (
                        <motion.div key="completed" className="w-full">
                            {renderCompleted()}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
