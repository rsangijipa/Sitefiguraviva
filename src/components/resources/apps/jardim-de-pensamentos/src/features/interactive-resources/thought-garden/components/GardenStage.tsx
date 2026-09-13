import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { GardenLeaf, GardenViewPreset, WindIntensity } from '../types';
import { ThoughtLeaf } from './ThoughtLeaf';
import { BotanicalGardenCanvas } from './BotanicalGardenCanvas';
import { Sparkles, Plus } from 'lucide-react';

interface GardenStageProps {
  leaves: GardenLeaf[];
  selectedLeafId: string | null;
  onSelectLeaf: (id: string) => void;
  reducedMotion: boolean;
  isFloatingPaused: boolean;
  onTogglePauseFloating?: () => void;
  isMobile: boolean;
  onQuickAddThought?: () => void;
  windIntensity?: WindIntensity;
  viewPreset?: GardenViewPreset;
}

export const GardenStage: React.FC<GardenStageProps> = ({
  leaves,
  selectedLeafId,
  onSelectLeaf,
  reducedMotion,
  isFloatingPaused,
  isMobile,
  onQuickAddThought,
  windIntensity = 'gentle',
  viewPreset = 'panoramic',
}) => {
  // Mobile até 4 folhas simultâneas, desktop até 8 folhas
  const maxVisual = isMobile ? 4 : 8;
  const visualLeaves = leaves.slice(0, maxVisual);
  const overflowLeavesCount = Math.max(0, leaves.length - maxVisual);

  const systemReducedMotion = useReducedMotion();
  const effectiveReducedMotion = reducedMotion || Boolean(systemReducedMotion);

  // Mapeia estilo de transformação da câmera para o SVG e folhas
  const getCameraTransform = () => {
    switch (viewPreset) {
      case 'stream':
        return 'scale(1.22) translate(-3%, -2%)';
      case 'clearing':
        return 'scale(1.16) translate(0%, 1.5%)';
      case 'canopy':
        return 'scale(1.2) translate(4%, -4%)';
      case 'panoramic':
      default:
        return 'scale(1.0) translate(0%, 0%)';
    }
  };

  return (
    <div className="relative w-full h-full min-h-[420px] lg:min-h-[580px] flex items-center justify-center select-none overflow-hidden bg-[#F1E9DB]">
      {/* 1. Camada WebGL/Canvas: Partículas de pólen, esporos de broto, peixinhos, libélula e igarapé */}
      <BotanicalGardenCanvas
        reducedMotion={effectiveReducedMotion}
        isPaused={isFloatingPaused}
        windIntensity={windIntensity}
        viewPreset={viewPreset}
        className="z-0"
      />

      {/* 2. Ilustração Botânica Detalhada em SVG (Design System Confluência) com Transformação de Câmera */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-700 ease-out origin-center"
        style={{ transform: effectiveReducedMotion ? 'none' : getCameraTransform() }}
      >
        <svg
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 1200 800"
          aria-hidden="true"
        >
          <defs>
            {/* Gradiente do Igarapé */}
            <linearGradient id="igarapeFlow" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#07614C" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#005A1F" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#07614C" stopOpacity="0.4" />
            </linearGradient>

            {/* Gradiente de Sol Filtrado (Dapple Light) */}
            <radialGradient id="sunBeam" cx="35%" cy="25%" r="65%">
              <stop offset="0%" stopColor="#FED701" stopOpacity="0.12" />
              <stop offset="60%" stopColor="#FDFAF4" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#FDFAF4" stopOpacity="0" />
            </radialGradient>

            {/* Gradiente de Solo Fértil */}
            <linearGradient id="soilGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#96551F" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#96551F" stopOpacity="0.04" />
            </linearGradient>

            {/* Padrão Textural Suave de Terra Batida */}
            <pattern id="soilStipple" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="12" r="1" fill="#96551F" fillOpacity="0.25" />
              <circle cx="28" cy="22" r="0.8" fill="#96551F" fillOpacity="0.2" />
              <circle cx="18" cy="34" r="1.2" fill="#D8CFBE" fillOpacity="0.4" />
              <circle cx="35" cy="8" r="0.8" fill="#6B6B63" fillOpacity="0.2" />
            </pattern>
          </defs>

          {/* Camada A: Luz solar filtrada pela copa do bosque */}
          <rect width="1200" height="800" fill="url(#sunBeam)" />

          {/* Camada B: Canteiro Norte com Textura de Terra */}
          <path
            d="M -40,180 Q 250,80 520,190 T 1150,110 L 1240,-40 L -40,-40 Z"
            fill="#FDFAF4"
            fillOpacity="0.65"
            stroke="#D8CFBE"
            strokeWidth="2"
          />
          <path
            d="M -40,180 Q 250,80 520,190 T 1150,110 L 1240,-40 L -40,-40 Z"
            fill="url(#soilStipple)"
          />

          {/* Camada C: Caminho Principal Sinuoso de Areia e Névoa */}
          <path
            d="M 80,850 C 180,620 280,500 460,420 C 660,340 840,380 980,240 C 1080,140 1140,90 1240,60"
            stroke="#D8CFBE"
            strokeWidth="56"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 80,850 C 180,620 280,500 460,420 C 660,340 840,380 980,240 C 1080,140 1140,90 1240,60"
            stroke="#F1E9DB"
            strokeWidth="42"
            strokeLinecap="round"
            fill="none"
          />

          {/* Camada D: O Leito Curvo do Igarapé (Água Serena) */}
          <path
            d="M 20,840 C 140,680 240,560 420,490 C 600,420 760,400 940,260 C 1040,180 1120,130 1220,110 L 1230,170 C 1110,200 1020,250 910,320 C 730,460 570,480 380,550 C 220,610 110,750 -10,880 Z"
            fill="url(#igarapeFlow)"
            stroke="#07614C"
            strokeWidth="2"
            strokeOpacity="0.4"
          />

          {/* Linhas de Correnteza Interna do Igarapé */}
          <path
            d="M 30,810 C 160,650 250,540 420,470 C 600,400 780,390 940,240"
            stroke="#FDFAF4"
            strokeWidth="1.5"
            strokeDasharray="16 12"
            strokeOpacity="0.45"
            fill="none"
            className="animate-water-pulse"
          />

          {/* Pedras de Seixo no Rio (Pebbles & Stones) */}
          <g fill="#6B6B63" stroke="#4B4B49" strokeWidth="1.5" opacity="0.6">
            <ellipse cx="140" cy="710" rx="14" ry="9" transform="rotate(-15 140 710)" />
            <ellipse cx="170" cy="695" rx="9" ry="6" fill="#D8CFBE" />
            <ellipse cx="360" cy="540" rx="16" ry="10" transform="rotate(25 360 540)" />
            <ellipse cx="390" cy="525" rx="11" ry="8" fill="#4B4B49" />
            <ellipse cx="780" cy="380" rx="18" ry="11" transform="rotate(-20 780 380)" />
            <ellipse cx="810" cy="365" rx="10" ry="7" fill="#D8CFBE" />
            <ellipse cx="980" cy="270" rx="15" ry="9" transform="rotate(30 980 270)" />
          </g>

          {/* Ninfeias / Vitórias-Régias na Água */}
          <g>
            <g transform="translate(250, 600)">
              <ellipse cx="0" cy="0" rx="32" ry="22" fill="#005A1F" fillOpacity="0.25" stroke="#005A1F" strokeWidth="1.5" />
              <path d="M 0,0 L 26,-8" stroke="#F1E9DB" strokeWidth="1.5" />
              <circle cx="-6" cy="-4" r="4" fill="#FE538B" fillOpacity="0.8" />
              <circle cx="-6" cy="-4" r="2" fill="#FED701" />
            </g>

            <g transform="translate(540, 460)">
              <ellipse cx="0" cy="0" rx="38" ry="26" fill="#07614C" fillOpacity="0.28" stroke="#07614C" strokeWidth="1.5" />
              <path d="M 0,0 L -30,6" stroke="#F1E9DB" strokeWidth="1.5" />
            </g>

            <g transform="translate(860, 310)">
              <ellipse cx="0" cy="0" rx="28" ry="19" fill="#005A1F" fillOpacity="0.25" stroke="#005A1F" strokeWidth="1.5" />
              <path d="M 0,0 L 22,8" stroke="#F1E9DB" strokeWidth="1.5" />
              <circle cx="4" cy="-2" r="3.5" fill="#FE538B" fillOpacity="0.85" />
            </g>
          </g>

          {/* Camada E: Canteiro Sudeste (Mata e Terra Barro) */}
          <path
            d="M 680,820 Q 860,620 1020,680 T 1240,790 L 1240,860 L 620,860 Z"
            fill="url(#soilGrad)"
            stroke="#96551F"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />

          {/* Camada F: Ilustrações Botânicas Vivas (Folhagens com Balanço Sutil) */}
          {/* 1. Costela de Adão / Monstera (Canto Noroeste) */}
          <g
            className={effectiveReducedMotion ? '' : 'animate-sway-slow'}
            transform="translate(80, 70)"
            stroke="#005A1F"
            strokeWidth="2"
            fill="#005A1F"
            fillOpacity="0.08"
          >
            <path d="M 0,160 Q 40,80 120,20" fill="none" strokeWidth="2.5" />
            <path d="M 120,20 C 80,-20 140,-80 200,-50 C 240,-30 260,30 220,70 C 180,100 130,80 120,20 Z" />
            <path d="M 150,-15 L 185,-35" fill="none" />
            <path d="M 165,10 L 210,10" fill="none" />
            <path d="M 160,35 L 195,50" fill="none" />
          </g>

          {/* 2. Samambaia Amazônica (Canto Nordeste) */}
          <g
            className={effectiveReducedMotion ? '' : 'animate-sway-rev'}
            transform="translate(1060, 90)"
            stroke="#07614C"
            strokeWidth="1.8"
            fill="none"
          >
            <path d="M 50,180 Q 20,90 -60,40" strokeWidth="2.5" />
            <path d="M -40,55 Q -65,40 -85,55" />
            <path d="M -25,70 Q -50,55 -70,72" />
            <path d="M -10,90 Q -35,75 -55,95" />
            <path d="M 10,115 Q -15,100 -35,120" />
            <path d="M 30,140 Q 5,125 -15,145" />

            <path d="M -45,45 Q -30,25 -40,10" />
            <path d="M -28,60 Q -10,40 -20,25" />
            <path d="M -12,80 Q 5,60 -5,45" />
          </g>

          {/* 3. Juncos e Bambuzais na Margem do Igarapé */}
          <g
            className={effectiveReducedMotion ? '' : 'animate-sway-slow'}
            transform="translate(480, 480)"
            stroke="#005A1F"
            strokeWidth="1.5"
            fill="none"
          >
            <path d="M 0,30 Q 15,-60 8,-120" />
            <path d="M 14,35 Q 35,-50 30,-110" />
            <path d="M -12,30 Q -5,-40 -20,-95" />
            <path d="M 26,40 Q 50,-30 60,-80" />
            <circle cx="6" cy="-40" r="1.5" fill="#FED701" />
            <circle cx="24" cy="-35" r="1.5" fill="#FED701" />
          </g>

          {/* 4. Bromélia com Flor Aurora (Canteiro Sudeste) */}
          <g
            className={effectiveReducedMotion ? '' : 'animate-sway-rev'}
            transform="translate(920, 680)"
            stroke="#96551F"
            strokeWidth="1.5"
            fill="#07614C"
            fillOpacity="0.12"
          >
            <path d="M 0,30 Q -50,-10 -90,0 Q -40,15 0,30" />
            <path d="M 0,30 Q 50,-10 90,0 Q 40,15 0,30" />
            <path d="M 0,30 Q -30,-40 -60,-60 Q -20,-30 0,30" />
            <path d="M 0,30 Q 30,-40 60,-60 Q 20,-30 0,30" />
            <path d="M 0,30 Q 0,-60 0,-90 Q 5,-40 0,30" />
            <circle cx="0" cy="-30" r="6" fill="#FE538B" stroke="#FE538B" />
            <circle cx="0" cy="-30" r="2.5" fill="#FED701" />
          </g>

          {/* 5. Trevo e Musgo no Canteiro Sudoeste */}
          <g transform="translate(180, 760)" stroke="#005A1F" strokeWidth="1.2" fill="#01C94D" fillOpacity="0.2">
            <circle cx="-12" cy="-8" r="7" />
            <circle cx="0" cy="-16" r="7" />
            <circle cx="12" cy="-8" r="7" />
            <path d="M 0,0 Q 0,-12 0,-18" stroke="#005A1F" fill="none" />
          </g>
        </svg>
      </div>

      {/* 3. Faixa Confluência Decorativa Superior */}
      <div
        className="absolute top-0 left-0 right-0 h-1 gradient-confluencia opacity-80"
        aria-hidden="true"
      />

      {/* 4. Notificação de folhas excedentes no palco */}
      {overflowLeavesCount > 0 && (
        <div className="absolute top-3 right-3 z-30 bg-[#FDFAF4]/95 border border-[#D8CFBE] px-3.5 py-1.5 rounded-full text-xs text-[#6B6B63] font-medium shadow-xs backdrop-blur-sm">
          Mais {overflowLeavesCount} {overflowLeavesCount === 1 ? 'folha na sessão' : 'folhas na sessão'}
        </div>
      )}

      {/* 5. Folhas Interativas Posicionadas sobre o Jardim com Câmera e Animação */}
      {leaves.length === 0 ? (
        /* Estado Sereno: Canteiro Aberto e Convidativo */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-20 text-center max-w-sm px-6 py-8 bg-[#FDFAF4]/95 border-2 border-[#96551F] rounded-[24px] shadow-sm backdrop-blur-xs m-4"
        >
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#F1E9DB] border-2 border-[#005A1F] flex items-center justify-center text-[#005A1F]">
            <Sparkles className="w-6 h-6 stroke-[2px] text-[#005A1F]" />
          </div>
          <h2 className="text-lg font-bold font-fraunces text-[#005A1F] mb-1.5">
            O canteiro está sereno
          </h2>
          <p className="text-xs sm:text-sm text-[#4B4B49] leading-relaxed mb-4">
            Escreva ao lado para pousar um pensamento neste jardim ou clique abaixo para semear uma frase acolhedora.
          </p>
          {onQuickAddThought && (
            <button
              type="button"
              onClick={onQuickAddThought}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#005A1F] hover:bg-[#07614C] text-[#FDFAF4] text-xs font-semibold rounded-full transition-colors min-h-[44px]"
            >
              <Plus className="w-4 h-4 stroke-[2.5px]" />
              <span>Semear pensamento acolhedor</span>
            </button>
          )}
        </motion.div>
      ) : (
        <div
          className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-20 transition-transform duration-700 ease-out origin-center"
          style={{ transform: effectiveReducedMotion ? 'none' : getCameraTransform() }}
        >
          <AnimatePresence mode="popLayout">
            {visualLeaves.map((leaf, index) => (
              <ThoughtLeaf
                key={leaf.id}
                leaf={leaf}
                index={index}
                isSelected={selectedLeafId === leaf.id}
                onSelect={onSelectLeaf}
                reducedMotion={effectiveReducedMotion}
                isFloatingPaused={isFloatingPaused}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
