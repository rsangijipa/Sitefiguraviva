import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { GardenLeaf } from '../types';
import { Bookmark } from 'lucide-react';

interface ThoughtLeafProps {
  leaf: GardenLeaf;
  isSelected: boolean;
  onSelect: (leafId: string) => void;
  reducedMotion: boolean;
  isFloatingPaused: boolean;
  index?: number;
}

export const ThoughtLeaf: React.FC<ThoughtLeafProps> = ({
  leaf,
  isSelected,
  onSelect,
  reducedMotion,
  isFloatingPaused,
  index = 0,
}) => {
  // Trunca texto para cartão legível (trecho curto e botão ler completo)
  const isLong = leaf.text.length > 90;
  const displayText = isLong && !isSelected ? `${leaf.text.slice(0, 85)}...` : leaf.text;

  // Detecção combinada de movimento reduzido: preferência do SO (useReducedMotion) + preferência do app
  const systemReducedMotion = useReducedMotion();
  const effectiveReducedMotion = reducedMotion || Boolean(systemReducedMotion);

  // Parâmetros orgânicos únicos para cada folha, gerando trajeto não-sincronizado e suave
  const floatParams = useMemo(() => {
    const seed = (leaf.leafShapeIndex ?? index) % 5;
    // Ciclo orgânico relaxante de 7s a 11s, com deriva lateral e elevação suave
    const duration = 7.5 + seed * 0.9;
    const delay = seed * 0.35;
    const driftY = 8 + (seed % 3) * 2; // 8px a 12px de elevação vertical
    const driftX = 6 + ((seed + 1) % 3) * 2.5; // 6px a 11px de deriva horizontal
    const rotOscillation = 2.2 + (seed % 2) * 1.2; // 2.2° a 3.4° de oscilação sutil
    return { duration, delay, driftY, driftX, rotOscillation };
  }, [leaf.leafShapeIndex, index]);

  // Animação de flutuação contínua suave (ativa apenas quando isFloating === true, sem redução e sem pausa)
  const isFloatingActive = leaf.isFloating && !effectiveReducedMotion && !isFloatingPaused && !isSelected;

  // Definição de keyframes para flutuação contínua orgânica
  const floatKeyframes = useMemo(
    () => ({
      x: [0, floatParams.driftX, -floatParams.driftX * 0.75, floatParams.driftX * 0.45, 0],
      y: [0, -floatParams.driftY, -floatParams.driftY * 0.35, -floatParams.driftY * 1.15, 0],
      rotate: [
        leaf.rotationDeg,
        leaf.rotationDeg + floatParams.rotOscillation,
        leaf.rotationDeg - floatParams.rotOscillation,
        leaf.rotationDeg + floatParams.rotOscillation * 0.5,
        leaf.rotationDeg,
      ],
      transition: {
        duration: floatParams.duration,
        delay: floatParams.delay,
        repeat: Infinity,
        repeatType: 'reverse' as const,
        ease: 'easeInOut' as const,
      },
    }),
    [floatParams, leaf.rotationDeg]
  );

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${leaf.xRatio * 100}%`,
        top: `${leaf.yRatio * 100}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: isSelected ? 40 : leaf.isFloating ? 25 : 10,
      }}
    >
      <motion.div
        layout={!effectiveReducedMotion}
        initial={
          effectiveReducedMotion
            ? { opacity: 0 }
            : { opacity: 0, scale: 0.82, y: 14 }
        }
        animate={
          effectiveReducedMotion || isFloatingPaused
            ? {
                opacity: 1,
                x: 0,
                y: isSelected ? -4 : 0,
                rotate: isSelected ? 0 : leaf.rotationDeg,
                scale: isSelected ? 1.04 : 1,
                transition: { duration: 0.2 },
              }
            : isSelected
            ? {
                opacity: 1,
                x: 0,
                y: -6,
                rotate: 0,
                scale: 1.05,
                transition: { type: 'spring', stiffness: 340, damping: 26 },
              }
            : isFloatingActive
            ? floatKeyframes
            : {
                opacity: 1,
                x: 0,
                y: 0,
                rotate: leaf.rotationDeg,
                scale: 1,
                transition: { duration: 0.4, ease: 'easeOut' },
              }
        }
        exit={
          effectiveReducedMotion
            ? { opacity: 0, transition: { duration: 0.15 } }
            : { opacity: 0, scale: 0.8, y: -10, transition: { duration: 0.25 } }
        }
        whileHover={
          !effectiveReducedMotion && !isSelected
            ? { scale: 1.03, y: -2, transition: { duration: 0.2 } }
            : undefined
        }
        whileTap={!effectiveReducedMotion ? { scale: 0.98 } : undefined}
        role="button"
        tabIndex={0}
        onClick={() => onSelect(leaf.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(leaf.id);
          }
        }}
        aria-label={`Folha de pensamento: ${leaf.optional_title || 'sem título'}. ${
          leaf.savedRecordId ? 'Guardada no histórico.' : 'Nesta sessão.'
        } ${leaf.isFloating ? 'Em flutuação.' : 'Pousada no canteiro.'} Clique para opções.`}
        aria-pressed={isSelected}
        className="pointer-events-auto cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-[#005A1F] focus-visible:outline-hidden rounded-[24px]"
      >
        <div
          className={`w-44 sm:w-52 p-3 sm:p-3.5 bg-[#FDFAF4] rounded-[24px] border-2 transition-shadow duration-300 ${
            isSelected
              ? 'border-[#005A1F] ring-2 ring-[#005A1F]/30 shadow-[0_12px_28px_rgba(0,90,31,0.18)]'
              : leaf.savedRecordId
              ? 'border-[#07614C] shadow-[0_6px_18px_rgba(7,97,76,0.10)]'
              : leaf.isFloating
              ? 'border-[#01C94D] shadow-[0_14px_30px_rgba(1,201,77,0.16)]'
              : 'border-[#96551F] shadow-[0_4px_14px_rgba(150,85,31,0.08)]'
          }`}
        >
          {/* Cabeçalho da Folha com Marcador Orgânico */}
          <div className="flex items-center justify-between gap-1.5 mb-1.5 pb-1 border-b border-[#D8CFBE]">
            <div className="flex items-center gap-1.5 min-w-0">
              {/* SVG Marcador Botânico Confluência */}
              <svg
                className={`w-4 h-4 shrink-0 stroke-[2px] ${
                  leaf.savedRecordId ? 'text-[#07614C]' : 'text-[#96551F]'
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6" />
              </svg>
              <span className="text-[11px] font-semibold text-[#96551F] truncate">
                {leaf.optional_title || 'Pensamento'}
              </span>
            </div>

            {leaf.savedRecordId ? (
              <span
                className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[#005A1F] bg-[#F1E9DB] px-1.5 py-0.5 rounded-full"
                title="Guardado no histórico privado"
              >
                <Bookmark className="w-2.5 h-2.5" />
                <span>Guardado</span>
              </span>
            ) : (
              <span className="text-[10px] font-medium text-[#6B6B63]">
                Nesta sessão
              </span>
            )}
          </div>

          {/* Texto do pensamento (React puro e escapado, sem innerHTML) */}
          <p className="text-xs sm:text-sm text-[#262B22] leading-relaxed line-clamp-3 break-words font-sans">
            {displayText}
          </p>

          {/* Indicação de ler completo */}
          {isLong && (
            <div className="mt-2 text-right">
              <span className="text-[11px] font-medium text-[#005A1F] hover:underline">
                {isSelected ? 'Ver detalhes' : 'Ler completo'}
              </span>
            </div>
          )}

          {/* Indicador de status de flutuação com design orgânico */}
          {leaf.isFloating && (
            <div className="mt-1.5 text-[10px] text-[#07614C] font-medium flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  effectiveReducedMotion || isFloatingPaused
                    ? 'bg-[#6B6B63]'
                    : 'bg-[#01C94D] animate-pulse'
                }`}
                aria-hidden="true"
              />
              <span>
                {effectiveReducedMotion
                  ? 'Em observação (estática)'
                  : isFloatingPaused
                  ? 'Flutuação pausada'
                  : 'Flutuando suavemente'}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
