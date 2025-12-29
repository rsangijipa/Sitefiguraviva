import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function BreathingAnimation({ technique, isActive }) {
    const [phase, setPhase] = useState('inhale'); // inhale, hold, exhale, holdPost
    const [scale, setScale] = useState(1);

    // Helper to handle phase transitions
    useEffect(() => {
        if (!isActive) {
            setPhase('ideal');
            setScale(1);
            return;
        }

        let timeout;

        const runCycle = () => {
            // Inhale
            setPhase('inhale');
            setScale(1.5); // expand

            timeout = setTimeout(() => {
                // Hold (if any)
                if (technique.holdTime > 0) {
                    setPhase('hold');
                    timeout = setTimeout(() => {
                        // Exhale
                        startExhale();
                    }, technique.holdTime);
                } else {
                    // Exhale directly
                    startExhale();
                }
            }, technique.inhaleTime);
        };

        const startExhale = () => {
            setPhase('exhale');
            setScale(1); // contract

            timeout = setTimeout(() => {
                // Hold Post Exhale (if any)
                if (technique.holdPostExhaleTime > 0) {
                    setPhase('holdPost');
                    timeout = setTimeout(() => {
                        // Loop back to Inhale
                        runCycle();
                    }, technique.holdPostExhaleTime);
                } else {
                    // Loop back to Inhale
                    runCycle();
                }
            }, technique.exhaleTime);
        };

        runCycle();

        return () => clearTimeout(timeout);
    }, [isActive, technique]);

    // Framer motion variants for the circle
    const variants = {
        ideal: { scale: 1, opacity: 0.5 },
        inhale: { scale: 1.5, opacity: 1, transition: { duration: technique.inhaleTime / 1000, ease: "easeInOut" } },
        hold: { scale: 1.5, opacity: 1, transition: { duration: technique.holdTime / 1000, ease: "linear" } },
        exhale: { scale: 1, opacity: 0.8, transition: { duration: technique.exhaleTime / 1000, ease: "easeInOut" } },
        holdPost: { scale: 1, opacity: 0.8, transition: { duration: technique.holdPostExhaleTime / 1000, ease: "linear" } }
    };

    const getInstruction = () => {
        if (!isActive) return "Pronto para começar?";
        switch (phase) {
            case 'inhale': return technique.instruction;
            case 'hold': return 'Segure...';
            case 'exhale': return technique.instructionExhale;
            case 'holdPost': return 'Aguarde...';
            default: return '';
        }
    };

    return (
        <div className="relative flex items-center justify-center w-64 h-64">
            {/* Outer Glow Ring */}
            <motion.div
                animate={phase === 'inhale' || phase === 'hold' ? { opacity: 0.3, scale: 1.2 } : { opacity: 0.1, scale: 1 }}
                transition={{ duration: 1 }}
                className={`absolute inset-0 rounded-full blur-2xl ${technique.color}`}
            />

            {/* Main Breathing Circle */}
            <motion.div
                variants={variants}
                animate={isActive ? phase : 'ideal'}
                className={`w-32 h-32 rounded-full ${technique.color} flex items-center justify-center shadow-2xl relative z-10`}
            >
                <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
            </motion.div>

            {/* Instruction Text (Centered overlay or below?) - Design decision: Below for clarity in this layout, but let's try overlay for immersion */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <motion.span
                    key={phase}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="font-serif text-xl font-bold text-primary mix-blend-multiply"
                >
                    {getInstruction()}
                </motion.span>
            </div>
        </div>
    );
}
