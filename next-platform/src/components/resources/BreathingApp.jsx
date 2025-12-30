import React, { useState, useEffect, useRef } from 'react';
import { PaperCard } from './PaperCard';
import { TECHNIQUES, SESSION_DURATION_SECONDS } from './constants';
import { BreathingAnimation } from './BreathingAnimation';
import { Play, ArrowLeft, Wind, Leaf, Info, CheckCircle2, Pause, Square, X, Circle, Disc, Timer } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function BreathingApp({ onClose }) {
    // STATES: 'menu' -> 'instructions' -> 'active' -> 'completed'
    // Added 'instructions' step for pagination feel
    const [appState, setAppState] = useState('menu');
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

    const goToInstructions = () => {
        setAppState('instructions');
    }

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

    const StepIndicator = ({ step }) => {
        // Steps: 1=Menu, 2=Info, 3=Active, 4=Done
        const steps = [1, 2, 3, 4];
        return (
            <div className="flex items-center gap-2 mb-8">
                {steps.map(s => (
                    <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${s <= step ? 'w-6 bg-primary' : 'w-2 bg-gray-200'}`} />
                ))}
            </div>
        );
    }

    // Fixed Timer Ring + 5s Spinner
    const TimerRing = ({ total, current }) => {
        const radius = 120;
        const circumference = 2 * Math.PI * radius;
        const progress = current / total;
        const strokeDashoffset = circumference - progress * circumference;

        return (
            <div className="relative w-64 h-64 flex items-center justify-center">

                {/* 5-Second Loop Spinner Ring (Outer) */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 260 260">
                    <defs>
                        <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0" />
                            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.8" />
                        </linearGradient>
                    </defs>
                    <motion.circle
                        cx="130"
                        cy="130"
                        r={128} // Slightly larger
                        fill="none"
                        stroke="url(#spinnerGradient)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray="100 700" // Partial arc
                        animate={{ rotate: 360 }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    />
                </svg>

                {/* Progress Ring */}
                <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 260 260">
                    <circle
                        cx="130"
                        cy="130"
                        r={radius}
                        className="stroke-stone-100"
                        strokeWidth="4"
                        fill="none"
                    />
                    <motion.circle
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1, ease: "linear" }}
                        cx="130"
                        cy="130"
                        r={radius}
                        className="stroke-primary/50"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeLinecap="round"
                    />
                </svg>

                <div className="flex flex-col items-center z-10">
                    <span className="text-5xl font-sans font-light text-primary tracking-tight">
                        {formatTime(current)}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-300 mt-2">
                        Restante
                    </span>
                </div>
            </div>
        );
    };

    // --- VIEWS ---

    const renderMenu = () => (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="max-w-5xl w-full mx-auto px-6 py-12 flex flex-col items-center"
        >
            <StepIndicator step={1} />

            <div className="w-full flex justify-start mb-4 relative z-50">
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 p-3 md:px-5 md:py-2.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:text-primary hover:border-primary/30 font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
                    aria-label="Voltar"
                >
                    <ArrowLeft size={20} />
                    <span className="hidden md:inline">Voltar</span>
                </button>
            </div>

            <header className="mb-12 text-center max-w-2xl relative">
                <h1 className="text-4xl md:text-5xl font-serif text-primary mb-4 tracking-tight">Escolha sua Prática</h1>
                <p className="text-lg font-sans text-gray-500">
                    Selecione a técnica que melhor atende ao seu momento agora.
                </p>
            </header>

            <div className="grid md:grid-cols-2 gap-6 w-full mb-12">
                {Object.entries(TECHNIQUES).map(([id, tech]) => (
                    <PaperCard
                        key={id}
                        onClick={() => setSelectedTechniqueId(id)}
                        active={selectedTechniqueId === id}
                        className={clsx(
                            "cursor-pointer group h-full flex flex-col transition-all duration-300 relative overflow-hidden",
                            selectedTechniqueId === id ? "ring-2 ring-primary border-transparent shadow-xl bg-white scale-[1.02]" : "hover:bg-white/80 border-transparent"
                        )}
                    >
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className={clsx("p-3 rounded-xl transition-colors", selectedTechniqueId === id ? "bg-primary text-white" : "bg-gray-100 text-gray-400")}>
                                {id === '4-6' ? <Timer size={24} /> : <Wind size={24} />}
                            </div>
                            {selectedTechniqueId === id && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                    <CheckCircle2 className="text-primary" size={24} />
                                </motion.div>
                            )}
                        </div>

                        <h3 className="text-2xl font-serif font-bold text-primary mb-2 relative z-10">{tech.title}</h3>
                        <p className="font-sans text-gray-500 mb-6 relative z-10">{tech.subtitle}</p>
                    </PaperCard>
                ))}
            </div>

            <button
                onClick={goToInstructions}
                className="group relative inline-flex items-center justify-center px-10 py-5 font-serif text-xl font-bold text-white transition-all duration-300 bg-primary rounded-full shadow-lg hover:shadow-2xl hover:-translate-y-1 w-full md:w-auto"
            >
                <span>Continuar</span>
                <ArrowLeft className="rotate-180 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
        </motion.div>
    );

    const renderInstructions = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl w-full mx-auto px-6 py-12 flex flex-col items-center text-center"
        >
            <StepIndicator step={2} />

            <h2 className="text-3xl font-serif text-primary mb-8">Antes de começar...</h2>

            <div className="bg-white/60 p-8 rounded-3xl border border-white mb-8 w-full text-left space-y-4">
                <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-full text-primary mt-1"><Leaf size={20} /></div>
                    <p className="text-gray-600">Encontre uma posição confortável, sentado ou deitado.</p>
                </div>
                <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-full text-primary mt-1"><Wind size={20} /></div>
                    <p className="text-gray-600">Relaxe os ombros e destrave o maxilar.</p>
                </div>
                <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-full text-primary mt-1"><Info size={20} /></div>
                    <p className="text-gray-600">Siga o ritmo da animação. Se sentir tontura, pare imediatamente.</p>
                </div>
            </div>

            <div className="flex gap-4">
                <button onClick={() => setAppState('menu')} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-full transition-colors">Voltar</button>
                <button onClick={startSession} className="px-10 py-3 bg-primary text-white font-bold rounded-full shadow-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                    <Play size={18} fill="currentColor" /> Iniciar Agora
                </button>
            </div>
        </motion.div>
    );

    const renderActiveSession = () => {
        const progressPercent = ((SESSION_DURATION_SECONDS - secondsRemaining) / SESSION_DURATION_SECONDS) * 100;

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-2xl mx-auto px-4 flex flex-col items-center min-h-[80vh] justify-center"
            >
                <StepIndicator step={3} />

                <div className="absolute top-6 left-6 z-50">
                    <button
                        onClick={stopSession}
                        className="flex items-center gap-2 p-3 md:px-5 md:py-2.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:text-red-500 hover:border-red-200 font-bold shadow-sm transition-all"
                    >
                        <X size={20} />
                        <span className="hidden md:inline">Encerrar</span>
                    </button>
                </div>

                <div className="relative mb-8 w-full flex justify-center scale-110">
                    <BreathingAnimation technique={activeTechnique} isActive={sessionActive} onPhaseChange={() => {}} />
                </div>

                <div className="mb-8">
                    <TimerRing total={SESSION_DURATION_SECONDS} current={secondsRemaining} />
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6">
                    <button
                        onClick={sessionActive ? () => setSessionActive(false) : () => setSessionActive(true)}
                        className="w-16 h-16 rounded-full bg-stone-800 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                        {sessionActive ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" className="ml-1" size={24} />}
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
            <StepIndicator step={4} />

            <PaperCard className="py-16 flex flex-col items-center bg-white/90" onClick={() => {}}>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-8"
                >
                    <Leaf size={48} />
                </motion.div>

                <h2 className="text-4xl font-serif text-primary mb-4">Sessão Concluída</h2>
                <p className="font-sans text-lg text-gray-600 mb-10 leading-relaxed max-w-xs mx-auto">
                    Você completou seus 2 minutos. Leve essa calma com você.
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
            <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 via-blue-50/5 to-accent/5 pointer-events-none" />

            <main className="flex-grow flex flex-col justify-center relative z-10 py-8 min-h-screen">
                <AnimatePresence mode="wait">
                    {appState === 'menu' && (
                        <motion.div key="menu" className="w-full">
                            {renderMenu()}
                        </motion.div>
                    )}
                    {appState === 'instructions' && (
                        <motion.div key="instructions" className="w-full">
                            {renderInstructions()}
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
