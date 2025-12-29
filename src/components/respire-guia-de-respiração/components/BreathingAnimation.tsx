import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { TechniqueConfig } from '../types';

interface BreathingAnimationProps {
  technique: TechniqueConfig;
  isActive: boolean;
  onPhaseChange?: (phase: string) => void;
}

export const BreathingAnimation: React.FC<BreathingAnimationProps> = ({
  technique,
  isActive,
  onPhaseChange
}) => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'wait'>('inhale');

  useEffect(() => {
    if (!isActive) return;

    let timeoutId: number;
    let isMounted = true;

    const runCycle = () => {
      if (!isMounted) return;

      // Start Inhale
      setPhase('inhale');
      onPhaseChange?.('Inspire...');

      // Schedule Hold or Exhale
      timeoutId = window.setTimeout(() => {
        if (!isMounted) return;

        if (technique.holdDuration > 0) {
          setPhase('hold');
          onPhaseChange?.('Segure...');

          timeoutId = window.setTimeout(() => {
            if (!isMounted) return;
            setPhase('exhale');
            onPhaseChange?.('Expire...');

            timeoutId = window.setTimeout(() => {
              if (!isMounted) return;
              if (technique.holdAfterExhale > 0) {
                setPhase('wait');
                onPhaseChange?.('Pausa...');
                timeoutId = window.setTimeout(runCycle, technique.holdAfterExhale * 1000);
              } else {
                runCycle();
              }
            }, technique.exhaleDuration * 1000);
          }, technique.holdDuration * 1000);

        } else {
          setPhase('exhale');
          onPhaseChange?.('Expire...');

          timeoutId = window.setTimeout(() => {
            if (!isMounted) return;
            if (technique.holdAfterExhale > 0) {
              setPhase('wait');
              onPhaseChange?.('Pausa...');
              timeoutId = window.setTimeout(runCycle, technique.holdAfterExhale * 1000);
            } else {
              runCycle();
            }
          }, technique.exhaleDuration * 1000);
        }
      }, technique.inhaleDuration * 1000);
    };

    runCycle();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [isActive, technique, onPhaseChange]);

  // Soft, Pastel Colors for Peace
  const getColors = () => {
    if (technique.id === '4-6') {
      // Very Soft Sage & Sand
      return {
        primary: '#8FA893',    // Muted Sage
        secondary: '#CCD5AE',  // Pale Green
        tertiary: '#E9EDC9',   // Light Yellow/Green
        accent: '#FAEDCD'      // Soft Sand
      };
    }
    // Pursed Lips (Warm/Cozy)
    return {
      primary: '#D4A373',
      secondary: '#E6CCB2',
      tertiary: '#F4E4D3',
      accent: '#FAF4EB'
    };
  };

  const colors = getColors();

  // --- ORGANIC FLOW VARIANTS ---

  const coreVariants: Variants = {
    inhale: {
      scale: 1.8,
      opacity: 1,
      filter: "blur(2px)",
      transition: { duration: technique.inhaleDuration, ease: "easeInOut" }
    },
    hold: {
      scale: 1.9,
      opacity: 0.9,
      filter: "blur(4px)",
      transition: { duration: technique.holdDuration, ease: "linear" }
    },
    exhale: {
      scale: 1.0,
      opacity: 0.8,
      filter: "blur(2px)",
      transition: { duration: technique.exhaleDuration, ease: "easeInOut" }
    },
    wait: {
      scale: 1.0,
      opacity: 0.6,
      filter: "blur(0px)",
      transition: { duration: technique.holdAfterExhale, ease: "linear" }
    }
  };

  const rippleVariants: Variants = {
    inhale: { scale: 2.2, opacity: 0, transition: { duration: technique.inhaleDuration, ease: "easeOut" } },
    hold: { scale: 2.3, opacity: 0, transition: { duration: technique.holdDuration } },
    exhale: { scale: 1, opacity: 0.5, transition: { duration: technique.exhaleDuration, ease: "easeIn" } },
    wait: { scale: 1, opacity: 0 }
  }

  const textVariants = {
    initial: { opacity: 0, y: 10, filter: 'blur(5px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, y: -10, filter: 'blur(5px)' }
  };

  const getInstructionText = () => {
    switch (phase) {
      case 'inhale': return technique.icon === 'nose' ? 'Inspire suavemente...' : 'Inspire...';
      case 'hold': return 'Segure o ar...';
      case 'exhale': return 'Solte o ar...';
      case 'wait': return 'Relaxe...';
      default: return 'Prepare-se';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-80 h-80 flex items-center justify-center">

        {/* Background Aura (Static Glow) */}
        <div className="absolute inset-0 rounded-full blur-[60px] opacity-20 bg-gradient-to-tr from-white to-transparent" />

        {/* --- ORGANIC LAYERS --- */}

        {/* Layer 1: Expansion Ripple */}
        <motion.div
          className="absolute rounded-full w-32 h-32 opacity-30"
          style={{ backgroundColor: colors.tertiary }}
          variants={rippleVariants}
          animate={phase}
        />

        {/* Layer 2: Soft Bloom */}
        <motion.div
          className="absolute rounded-full w-32 h-32 mix-blend-multiply blur-xl"
          style={{ backgroundColor: colors.secondary }}
          variants={coreVariants}
          animate={phase}
        />

        {/* Layer 3: Core Light */}
        <motion.div
          className="absolute rounded-full w-24 h-24 bg-white/40 blur-md"
          animate={{
            scale: phase === 'inhale' ? 1.5 : 1,
            opacity: phase === 'hold' ? 0.6 : 0.3
          }}
          transition={{ duration: technique.inhaleDuration }}
        />

        {/* Center Text Indicator (Minimalist) */}
        <div className="absolute z-30 pointer-events-none flex flex-col items-center justify-center">
          <motion.span
            className="text-stone-600 font-serif text-lg font-light tracking-[0.2em] opacity-50"
            animate={{
              opacity: phase === 'wait' ? 0.3 : 0.6,
            }}
          >
            {phase === 'inhale' ? 'IN' : phase === 'exhale' ? 'EX' : ''}
          </motion.span>
        </div>
      </div>

      <div className="h-20 mt-4 flex items-center justify-center">
        <AnimatePresence mode='wait'>
          <motion.p
            key={phase}
            variants={textVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.8 }}
            className="text-3xl font-serif text-stone-600/80 tracking-tight text-center"
          >
            {getInstructionText()}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};