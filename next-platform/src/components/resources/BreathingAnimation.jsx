import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Componente Mandala com múltiplas camadas de pétalas rotativas
const Mandala = ({ phase, theme, scale }) => {
    // Configuração refinada para múltiplas camadas delicadas
    const rings = useMemo(() => [
        { count: 12, size: 60, radius: 20, speed: 1.5, opacity: 0.9, hueOffset: 0 },
        { count: 16, size: 90, radius: 50, speed: -1.2, opacity: 0.8, hueOffset: 30 },
        { count: 20, size: 120, radius: 90, speed: 0.8, opacity: 0.7, hueOffset: 60 },
        { count: 24, size: 160, radius: 130, speed: -0.6, opacity: 0.6, hueOffset: 90 },
        { count: 32, size: 200, radius: 180, speed: 0.4, opacity: 0.5, hueOffset: 120 },
    ], []);

    return (
        <div
            className="relative flex items-center justify-center transition-transform duration-[100ms] ease-out will-change-transform"
            style={{
                width: '600px',
                height: '600px',
                transform: `scale(${scale})`,
            }}
        >
            {/* Glow Ambiente Central - Aura Suave */}
            <div
                className="absolute inset-0 rounded-full blur-[100px] opacity-40 transition-colors duration-1000"
                style={{
                    background: `radial-gradient(circle, ${theme.primary}, ${theme.secondary}, transparent 70%)`,
                }}
            />

            {rings.map((ring, ringIndex) => (
                <div
                    key={ringIndex}
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                        animation: `spin ${120 + ringIndex * 40}s linear infinite ${ring.speed < 0 ? 'reverse' : 'normal'}`
                    }}
                >
                    {Array.from({ length: ring.count }).map((_, i) => {
                        const rotation = (360 / ring.count) * i;
                        return (
                            <div
                                key={i}
                                className="absolute transition-all duration-1000"
                                style={{
                                    width: `${ring.size}px`,
                                    height: `${ring.size}px`,
                                    background: `linear-gradient(135deg, ${theme.primary}55, ${theme.secondary}55)`,
                                    transform: `rotate(${rotation}deg) translateY(-${ring.radius}px) rotate(45deg)`,
                                    transformOrigin: 'center center',
                                    borderRadius: '50% 0 50% 0',
                                    opacity: ring.opacity * 0.6,
                                    backdropFilter: 'blur(1px)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    boxShadow: `0 0 10px ${theme.secondary}30`,
                                    mixBlendMode: 'normal',
                                    filter: `hue-rotate(${ring.hueOffset}deg)`,
                                }}
                            />
                        );
                    })}
                </div>
            ))}

            {/* Centro Lótus - Núcleo de Respiração */}
            <div className="relative z-10 flex items-center justify-center">
                <div
                    className="absolute w-32 h-32 rounded-full blur-xl opacity-60 animate-pulse"
                    style={{ backgroundColor: theme.primary }}
                />
                <div
                    className="w-24 h-24 rounded-full relative flex items-center justify-center transition-all duration-1000"
                    style={{
                        background: `conic-gradient(from 0deg, ${theme.primary}, ${theme.secondary}, ${theme.primary})`,
                        boxShadow: `0 0 50px ${theme.primary}80`,
                        opacity: 0.9
                    }}
                >
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full border border-white/30" />
                </div>
            </div>

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

// Componente principal de animação de respiração
export const BreathingAnimation = ({
    technique,
    isActive,
    onPhaseChange
}) => {
    const [phase, setPhase] = useState('inhale');
    const [scale, setScale] = useState(0.7);

    useEffect(() => {
        if (!isActive) {
            setScale(0.7);
            return;
        }
        let timeoutId;

        const runCycle = () => {
            setPhase('inhale');
            setScale(1.0); // Expande
            onPhaseChange?.('Inspire...');
            timeoutId = window.setTimeout(() => {
                if (technique.holdDuration > 0) {
                    setPhase('hold');
                    setScale(1.0); // Mantém expandido
                    onPhaseChange?.('Segure...');
                    timeoutId = window.setTimeout(() => {
                        setPhase('exhale');
                        setScale(0.7); // Contrai
                        onPhaseChange?.('Expire...');
                        timeoutId = window.setTimeout(() => {
                            if (technique.holdAfterExhale > 0) {
                                setPhase('wait');
                                setScale(0.7); // Mantém contraído
                                onPhaseChange?.('Pausa...');
                                timeoutId = window.setTimeout(runCycle, technique.holdAfterExhale * 1000);
                            } else { runCycle(); }
                        }, technique.exhaleDuration * 1000);
                    }, technique.holdDuration * 1000);
                } else {
                    setPhase('exhale');
                    setScale(0.7);
                    onPhaseChange?.('Expire...');
                    timeoutId = window.setTimeout(() => {
                        if (technique.holdAfterExhale > 0) {
                            setPhase('wait');
                            setScale(0.7);
                            onPhaseChange?.('Pausa...');
                            timeoutId = window.setTimeout(runCycle, technique.holdAfterExhale * 1000);
                        } else { runCycle(); }
                    }, technique.exhaleDuration * 1000);
                }
            }, technique.inhaleDuration * 1000);
        };
        runCycle();
        return () => clearTimeout(timeoutId);
    }, [isActive, technique, onPhaseChange]);

    // Tema de cores da mandala baseado na técnica
    const mandalaTheme = useMemo(() => {
        const is478 = technique.id === '4-7-8' || technique.id === '4-6';
        return {
            primary: is478 ? '#588157' : '#C45B50',
            secondary: is478 ? '#A3B18A' : '#E6AD9B',
        };
    }, [technique.id]);

    const getInstructionText = () => {
        switch (phase) {
            case 'inhale': return technique.icon === 'nose' ? 'Inspire pelo nariz' : 'Inspire';
            case 'hold': return 'Segure o ar...';
            case 'exhale': return technique.id === 'pursed-lips' ? 'Expire lentamente' : 'Expire pela boca';
            case 'wait': return 'Aguarde...';
            default: return 'Prepare-se';
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-8">
            {/* Mandala com animação de escala */}
            <div className="relative flex items-center justify-center" style={{ width: '500px', height: '500px' }}>
                <Mandala phase={phase} theme={mandalaTheme} scale={scale} />
            </div>

            {/* Texto de Instrução */}
            <div className="h-24 mt-8 flex flex-col items-center justify-start">
                <AnimatePresence mode='wait'>
                    <motion.p
                        key={phase}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="text-3xl font-serif text-ink tracking-tight text-center"
                    >
                        {getInstructionText()}
                    </motion.p>
                </AnimatePresence>
                {/* Subtexto para duração */}
                <motion.p
                    className="text-earth-light/80 font-sans text-sm mt-2"
                    animate={{ opacity: phase === 'hold' || phase === 'wait' ? 1 : 0 }}
                >
                    {phase === 'hold' ? `por ${technique.holdDuration}s` : phase === 'wait' ? `por ${technique.holdAfterExhale}s` : ''}
                </motion.p>
            </div>
        </div>
    );
};
