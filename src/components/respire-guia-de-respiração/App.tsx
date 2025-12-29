import React, { useState, useEffect, useRef } from 'react';
import { PaperCard } from './components/PaperCard';
import { TECHNIQUES, SESSION_DURATION_SECONDS } from './constants';
import { TechniqueId, AppState } from './types';
import { BreathingAnimation } from './components/BreathingAnimation';
import { Play, ArrowLeft, Wind, Leaf, Info, CheckCircle2, Pause, Square } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [appState, setAppState] = useState<AppState>('menu');
  const [selectedTechniqueId, setSelectedTechniqueId] = useState<TechniqueId>('4-6');
  const [secondsRemaining, setSecondsRemaining] = useState(SESSION_DURATION_SECONDS);
  const [sessionActive, setSessionActive] = useState(false);
  const timerRef = useRef<number | null>(null);

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

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // --- SUB-COMPONENTS ---

  // Modern SVG Timer Ring
  const TimerRing = ({ total, current }: { total: number; current: number }) => {
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
            className="stroke-stone-200"
            strokeWidth="4"
            fill="none"
          />
          {/* Progress Ring */}
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "linear" }}
            cx="130"
            cy="130"
            r={radius}
            className="stroke-ink"
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeLinecap="round"
          />
        </svg>
        
        <div className="flex flex-col items-center z-10">
           <span className="text-5xl font-sans font-light text-ink tracking-tight">
             {formatTime(current)}
           </span>
           <span className="text-sm font-sans uppercase tracking-widest text-stone-400 mt-2">
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
      <header className="mb-12 text-center max-w-2xl">
        <motion.div 
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 1, scale: 1 }}
           className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-earth/10 text-earth mb-6"
        >
          <Leaf size={32} />
        </motion.div>
        <h1 className="text-5xl md:text-6xl font-serif text-ink mb-4 tracking-tight">Respire</h1>
        <p className="text-xl font-sans text-stone-600 leading-relaxed">
          Uma pausa de 2 minutos para reconectar com seu corpo e reduzir a ansiedade.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-6 w-full mb-12">
        {/* Card 1: 4-6 */}
        <PaperCard 
          onClick={() => setSelectedTechniqueId('4-6')}
          active={selectedTechniqueId === '4-6'}
          className="cursor-pointer group h-full flex flex-col"
        >
          <div className="flex justify-between items-start mb-6">
             <div className="p-3 bg-earth/10 rounded-xl text-earth">
                <svg width="32" height="16" viewBox="0 0 100 50" className="stroke-current stroke-[4] fill-none">
                  <path d="M10,40 Q30,10 50,40 T90,40" />
                </svg>
             </div>
             {selectedTechniqueId === '4-6' && (
               <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                 <CheckCircle2 className="text-earth" size={24} />
               </motion.div>
             )}
          </div>
          
          <h3 className="text-2xl font-serif font-bold text-ink mb-1">Calma Rápida (4-6)</h3>
          <p className="font-sans text-stone-500 mb-6">Ideal para momentos de ansiedade aguda ou estresse imediato.</p>
          
          <div className="mt-auto space-y-3 bg-white/50 p-4 rounded-xl border border-white">
            <div className="flex items-center text-sm font-sans text-stone-700">
              <span className="w-16 font-bold text-earth">4 seg</span>
              <span>Inspiração nasal</span>
            </div>
            <div className="w-full h-px bg-stone-200/50"></div>
            <div className="flex items-center text-sm font-sans text-stone-700">
              <span className="w-16 font-bold text-earth">6 seg</span>
              <span>Expiração pela boca</span>
            </div>
          </div>
        </PaperCard>

        {/* Card 2: Pursed Lips */}
        <PaperCard 
          onClick={() => setSelectedTechniqueId('pursed-lips')}
          active={selectedTechniqueId === 'pursed-lips'}
          className="cursor-pointer group h-full flex flex-col"
        >
          <div className="flex justify-between items-start mb-6">
             <div className="p-3 bg-rust/10 rounded-xl text-rust">
                <Wind size={24} />
             </div>
             {selectedTechniqueId === 'pursed-lips' && (
               <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                 <CheckCircle2 className="text-rust" size={24} />
               </motion.div>
             )}
          </div>

          <h3 className="text-2xl font-serif font-bold text-ink mb-1">Lábios Semicerrados</h3>
          <p className="font-sans text-stone-500 mb-6">Foco total no controle da saída de ar para recuperar o fôlego.</p>
          
          <div className="mt-auto space-y-3 bg-white/50 p-4 rounded-xl border border-white">
            <div className="flex items-center text-sm font-sans text-stone-700">
              <span className="w-16 font-bold text-rust">Nasal</span>
              <span>Inspiração profunda</span>
            </div>
             <div className="w-full h-px bg-stone-200/50"></div>
            <div className="flex items-center text-sm font-sans text-stone-700">
              <span className="w-16 font-bold text-rust">Lento</span>
              <span>Expiração com bico</span>
            </div>
          </div>
        </PaperCard>
      </div>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={startSession}
        className="group relative inline-flex items-center justify-center px-8 py-4 font-sans text-lg font-bold text-white transition-all duration-200 bg-ink rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink shadow-lg hover:shadow-xl w-full md:w-auto min-w-[200px]"
      >
        <span className="mr-2">Iniciar Prática</span>
        <Play size={20} className="fill-current" />
      </motion.button>

      {/* Footer Warning */}
      <div className="mt-16 flex items-start gap-3 text-stone-500 max-w-xl mx-auto bg-white/40 p-4 rounded-xl backdrop-blur-sm">
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
                className="p-2 rounded-full hover:bg-black/5 text-stone-500 hover:text-ink transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="text-center">
                <h2 className="font-serif text-2xl text-ink font-bold">{activeTechnique.title}</h2>
                <p className="text-stone-500 font-sans text-sm">{activeTechnique.subtitle}</p>
              </div>
              <div className="w-10"></div> {/* Spacer for alignment */}
            </div>

            {/* Global Session Progress Bar */}
            <div className="w-full h-1.5 bg-stone-200/50 rounded-full mt-6 overflow-hidden">
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
              className="w-16 h-16 rounded-full bg-ink text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              {sessionActive ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" className="ml-1" size={24} />}
            </button>
            
            <button 
              onClick={stopSession}
              className="flex items-center gap-2 px-6 py-3 rounded-full border border-stone-300 text-stone-600 font-sans font-bold hover:bg-stone-100 transition-colors"
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
          className="w-24 h-24 bg-earth/10 rounded-full flex items-center justify-center text-earth mb-8"
        >
          <Leaf size={48} />
        </motion.div>
        
        <h2 className="text-4xl font-serif text-ink mb-4">Sessão Concluída</h2>
        <p className="font-sans text-lg text-stone-600 mb-10 leading-relaxed max-w-xs mx-auto">
          Você completou seus 2 minutos. Tire um momento para perceber como seu corpo se sente agora.
        </p>
        
        <button 
          onClick={resetSession}
          className="bg-ink text-white py-4 px-10 rounded-full font-sans font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
        >
          Voltar ao Início
        </button>
      </PaperCard>
    </motion.div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden font-sans">
       {/* Background Elements */}
       <div className="bg-noise" />
       <div className="ambient-glow" />

       <main className="flex-grow flex flex-col justify-center relative z-10 py-8">
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

       <footer className="w-full py-6 text-center text-stone-400 text-xs font-sans relative z-10">
          <p>CRP 24 - 04078 • Respire</p>
       </footer>
    </div>
  );
}