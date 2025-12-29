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

    const runCycle = () => {
      // Start Inhale
      setPhase('inhale');
      onPhaseChange?.('Inspire...');

      // Schedule Hold or Exhale
      timeoutId = window.setTimeout(() => {
        if (technique.holdDuration > 0) {
          setPhase('hold');
          onPhaseChange?.('Segure...');
          
          timeoutId = window.setTimeout(() => {
            setPhase('exhale');
            onPhaseChange?.('Expire...');
            
            timeoutId = window.setTimeout(() => {
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

    return () => clearTimeout(timeoutId);
  }, [isActive, technique, onPhaseChange]);

  // Determine colors based on technique for a more sophisticated look
  const getGradientColors = () => {
    if (technique.id === '4-6') {
      // Earthy Greens
      return {
        start: 'from-[#A3B18A] to-[#DAD7CD]',
        active: 'from-[#588157] to-[#A3B18A]',
        shadow: 'rgba(88, 129, 87, 0.4)'
      };
    }
    // Pursed Lips (Rust/Warm)
    return {
      start: 'from-[#E6AD9B] to-[#F2E8CF]',
      active: 'from-[#C45B50] to-[#E6AD9B]',
      shadow: 'rgba(196, 91, 80, 0.4)'
    };
  };

  const colors = getGradientColors();

  // --- VARIANTS ---

  // The Core Shape (Solid)
  const coreVariants: Variants = {
    inhale: { 
      scale: 1.6,
      rotate: 0,
      borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "50% 50% 50% 50% / 50% 50% 50% 50%", "30% 70% 70% 30% / 30% 30% 70% 70%"],
      transition: { duration: technique.inhaleDuration, ease: "easeInOut" }
    },
    hold: { 
      scale: 1.65,
      rotate: 5,
      borderRadius: ["30% 70% 70% 30% / 30% 30% 70% 70%", "40% 60% 60% 40% / 40% 40% 60% 60%"],
      transition: { duration: technique.holdDuration, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }
    },
    exhale: { 
      scale: 0.8, 
      rotate: 0,
      borderRadius: ["30% 70% 70% 30% / 30% 30% 70% 70%", "50% 50% 30% 70% / 50% 50% 70% 30%", "60% 40% 30% 70% / 60% 30% 70% 40%"],
      transition: { 
        duration: technique.exhaleDuration, 
        ease: [0.42, 0.0, 0.58, 1.0] 
      }
    },
    wait: {
      scale: 0.8,
      borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
      transition: { duration: technique.holdAfterExhale, ease: "linear" }
    }
  };

  // The "Aura" Shape (Transparent/Blurry layer)
  const auraVariants: Variants = {
    inhale: { 
      scale: 2.2,
      opacity: 0.4,
      rotate: -10,
      borderRadius: ["50% 50% 50% 50%", "60% 40% 30% 70% / 60% 30% 70% 40%"],
      transition: { duration: technique.inhaleDuration, ease: "easeOut" }
    },
    hold: { 
      scale: 2.3, 
      opacity: 0.3,
      rotate: -5,
      transition: { duration: technique.holdDuration, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }
    },
    exhale: { 
      scale: 1.0, 
      opacity: 0.1,
      rotate: 0,
      borderRadius: "50% 50% 50% 50%",
      transition: { duration: technique.exhaleDuration, ease: "easeInOut" }
    },
    wait: {
      scale: 1.0, 
      opacity: 0,
      transition: { duration: technique.holdAfterExhale, ease: "linear" }
    }
  };

  const textVariants = {
    initial: { opacity: 0, y: 5, filter: 'blur(4px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, y: -5, filter: 'blur(4px)' }
  };

  const getInstructionText = () => {
    switch(phase) {
      case 'inhale': return technique.icon === 'nose' ? 'Inspire pelo nariz' : 'Inspire';
      case 'hold': return 'Segure...';
      case 'exhale': return technique.id === 'pursed-lips' ? 'Expire com bico' : 'Expire pela boca';
      case 'wait': return 'Aguarde';
      default: return 'Prepare-se';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-72 h-72 flex items-center justify-center">
        
        {/* Background Ambient Glow */}
        <motion.div
           className="absolute inset-0 rounded-full blur-3xl opacity-20"
           animate={{
             background: phase === 'inhale' || phase === 'hold' ? colors.shadow : 'rgba(0,0,0,0)',
             scale: phase === 'inhale' ? 1.5 : 1
           }}
           transition={{ duration: 2 }}
        />

        {/* Aura Layer (Glassy/Ethereal) */}
        <motion.div
          className={`absolute w-32 h-32 bg-gradient-to-tr ${colors.start} mix-blend-multiply filter blur-md`}
          animate={phase}
          variants={auraVariants}
        />

        {/* Core Layer (Main Shape) */}
        <motion.div
          className={`w-32 h-32 bg-gradient-to-br ${colors.active} shadow-inner`}
          animate={phase}
          variants={coreVariants}
          style={{ 
            boxShadow: 'inset -10px -10px 20px rgba(0,0,0,0.1), inset 10px 10px 20px rgba(255,255,255,0.4)' 
          }}
        />
        
        {/* Center Text Indicator */}
        <div className="absolute z-20 pointer-events-none flex flex-col items-center justify-center">
          <motion.span 
            className="text-white/90 font-sans text-3xl font-light tracking-widest mix-blend-overlay"
            animate={{ 
              opacity: phase === 'wait' ? 0.5 : 1,
              scale: phase === 'inhale' ? 1.2 : 1 
            }}
          >
           {phase === 'inhale' ? 'IN' : phase === 'exhale' ? 'EX' : phase === 'hold' ? 'HOLD' : ''}
          </motion.span>
        </div>
      </div>

      <div className="h-16 mt-2 flex items-center justify-center">
        <AnimatePresence mode='wait'>
          <motion.p
            key={phase}
            variants={textVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4 }}
            className="text-2xl font-serif text-ink tracking-tight text-center"
          >
            {getInstructionText()}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};