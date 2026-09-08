import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const RING_MIN_SCALE = 0.7;
const RING_MAX_SCALE = 1;

// Mandala compacta: um núcleo + duas camadas de pétalas que giram devagar,
// e a escala geral segue o ritmo da respiração (inspira = expande).
const Mandala = ({ theme, scale }) => {
  const rings = useMemo(
    () => [
      { count: 10, size: 26, radius: 34, spinDuration: 60 },
      { count: 16, size: 40, radius: 62, spinDuration: 90 },
    ],
    [],
  );

  return (
    <motion.div
      data-mandala-scale={scale}
      className="relative flex items-center justify-center will-change-transform"
      style={{ width: "220px", height: "220px" }}
      animate={{ scale }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      {/* Aura central suave */}
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-40 transition-colors duration-1000"
        style={{
          background: `radial-gradient(circle, ${theme.primary}, ${theme.secondary}, transparent 70%)`,
        }}
      />

      {rings.map((ring, ringIndex) => (
        <div
          key={ringIndex}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            animation: `mandala-spin ${ring.spinDuration}s linear infinite ${
              ringIndex % 2 === 1 ? "reverse" : "normal"
            }`,
          }}
        >
          {Array.from({ length: ring.count }).map((_, i) => {
            const rotation = (360 / ring.count) * i;
            return (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${ring.size}px`,
                  height: `${ring.size}px`,
                  background: `linear-gradient(135deg, ${theme.primary}66, ${theme.secondary}66)`,
                  transform: `rotate(${rotation}deg) translateY(-${ring.radius}px)`,
                  transformOrigin: "center center",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              />
            );
          })}
        </div>
      ))}

      {/* Núcleo */}
      <div className="relative z-10 flex items-center justify-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: `conic-gradient(from 0deg, ${theme.primary}, ${theme.secondary}, ${theme.primary})`,
            boxShadow: `0 0 32px ${theme.primary}70`,
          }}
        >
          <div className="w-11 h-11 bg-white/15 backdrop-blur-md rounded-full border border-white/30" />
        </div>
      </div>

      <style>{`
        @keyframes mandala-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
};

export const BreathingAnimation = ({ technique, isActive, onPhaseChange }) => {
  const [phase, setPhase] = useState("inhale");
  const [scale, setScale] = useState(RING_MIN_SCALE);

  useEffect(() => {
    if (!isActive) {
      setScale(RING_MIN_SCALE);
      return;
    }

    const timeoutIds = [];
    const schedule = (fn, seconds) => {
      const id = window.setTimeout(fn, seconds * 1000);
      timeoutIds.push(id);
      return id;
    };

    const runCycle = () => {
      setPhase("inhale");
      setScale(RING_MAX_SCALE);
      onPhaseChange?.("Inspire...");

      schedule(() => {
        const afterInhale = () => {
          setPhase("exhale");
          setScale(RING_MIN_SCALE);
          onPhaseChange?.("Expire...");

          schedule(() => {
            if (technique.holdAfterExhale > 0) {
              setPhase("wait");
              onPhaseChange?.("Pausa...");
              schedule(runCycle, technique.holdAfterExhale);
            } else {
              runCycle();
            }
          }, technique.exhaleDuration);
        };

        if (technique.holdDuration > 0) {
          setPhase("hold");
          onPhaseChange?.("Segure...");
          schedule(afterInhale, technique.holdDuration);
        } else {
          afterInhale();
        }
      }, technique.inhaleDuration);
    };

    runCycle();
    return () => timeoutIds.forEach((id) => window.clearTimeout(id));
  }, [isActive, technique, onPhaseChange]);

  const mandalaTheme = useMemo(() => {
    const isCalming = technique.id === "4-7-8" || technique.id === "4-6";
    return {
      primary: isCalming ? "#588157" : "#C45B50",
      secondary: isCalming ? "#A3B18A" : "#E6AD9B",
    };
  }, [technique.id]);

  const getInstructionText = () => {
    switch (phase) {
      case "inhale":
        return technique.icon === "nose" ? "Inspire pelo nariz" : "Inspire";
      case "hold":
        return "Segure o ar...";
      case "exhale":
        return technique.id === "pursed-lips"
          ? "Expire lentamente"
          : "Expire pela boca";
      case "wait":
        return "Aguarde...";
      default:
        return "Prepare-se";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-2 md:py-4">
      <div className="relative flex items-center justify-center w-[160px] h-[160px] md:w-[220px] md:h-[220px]">
        <div className="scale-[0.73] md:scale-100 flex items-center justify-center">
          <Mandala theme={mandalaTheme} scale={scale} />
        </div>
      </div>

      <div className="h-16 mt-4 flex flex-col items-center justify-start">
        <AnimatePresence mode="wait">
          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-2xl font-serif text-ink tracking-tight text-center"
          >
            {getInstructionText()}
          </motion.p>
        </AnimatePresence>
        <motion.p
          className="text-earth-light/80 font-sans text-sm mt-1"
          animate={{ opacity: phase === "hold" || phase === "wait" ? 1 : 0 }}
        >
          {phase === "hold"
            ? `por ${technique.holdDuration}s`
            : phase === "wait"
              ? `por ${technique.holdAfterExhale}s`
              : ""}
        </motion.p>
      </div>
    </div>
  );
};
