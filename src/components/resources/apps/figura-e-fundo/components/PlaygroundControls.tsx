import React from "react";
import {
  Sliders,
  RotateCcw,
  Eye,
  SunDim,
  Maximize2,
  Activity,
} from "lucide-react";

interface PlaygroundControlsProps {
  backgroundOpacity: number;
  setBackgroundOpacity: (v: number) => void;
  scaleFactor: number;
  setScaleFactor: (v: number) => void;
  motionSpeed: number;
  setMotionSpeed: (v: number) => void;
  contrastLevel: number;
  setContrastLevel: (v: number) => void;
  onReset: () => void;
}

export const PlaygroundControls: React.FC<PlaygroundControlsProps> = ({
  backgroundOpacity,
  setBackgroundOpacity,
  scaleFactor,
  setScaleFactor,
  motionSpeed,
  setMotionSpeed,
  contrastLevel,
  setContrastLevel,
  onReset,
}) => {
  return (
    <div className="w-full p-5 rounded-2xl bg-[#FDFAF4] border border-[#F1E9DB]  space-y-4 text-[#262B22]">
      <div className="flex items-center justify-between border-b border-[#F1E9DB] pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#6B6B63]" />
          <h3 className="font-serif text-base font-medium text-[#262B22]">
            Laboratório Perceptivo: Relações de Campo
          </h3>
        </div>
        <button
          id="btn-reset-playground"
          onClick={onReset}
          className="text-xs text-[#6B6B63] hover:text-[#262B22] flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restaurar padrões
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Fundo Residual (Opacidade) */}
        <div className="space-y-1.5 p-3 rounded-xl bg-[#FDFAF4] border border-[#F1E9DB]">
          <div className="flex justify-between items-center text-[#4B4B49]">
            <label
              htmlFor="slider-bg-opacity"
              className="flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#6B6B63]" />
              Presença do Fundo
            </label>
            <span className="font-mono text-[11px] text-[#6B6B63]">
              {Math.round(backgroundOpacity * 100)}%
            </span>
          </div>
          <input
            id="slider-bg-opacity"
            type="range"
            min="0.05"
            max="0.8"
            step="0.05"
            value={backgroundOpacity}
            onChange={(e) => setBackgroundOpacity(parseFloat(e.target.value))}
            className="w-full accent-[#262B22] cursor-pointer"
          />
          <p className="text-[10px] text-[#6B6B63] leading-tight">
            Sem apagar: o fundo permanece sustentando a figura.
          </p>
        </div>

        {/* Contraste */}
        <div className="space-y-1.5 p-3 rounded-xl bg-[#FDFAF4] border border-[#F1E9DB]">
          <div className="flex justify-between items-center text-[#4B4B49]">
            <label
              htmlFor="slider-contrast"
              className="flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <SunDim className="w-3.5 h-3.5 text-[#6B6B63]" />
              Contraste Tonal
            </label>
            <span className="font-mono text-[11px] text-[#6B6B63]">
              {Math.round(contrastLevel * 100)}%
            </span>
          </div>
          <input
            id="slider-contrast"
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={contrastLevel}
            onChange={(e) => setContrastLevel(parseFloat(e.target.value))}
            className="w-full accent-[#262B22] cursor-pointer"
          />
          <p className="text-[10px] text-[#6B6B63] leading-tight">
            Valores mais altos aumentam a atração ocular imediata.
          </p>
        </div>

        {/* Escala */}
        <div className="space-y-1.5 p-3 rounded-xl bg-[#FDFAF4] border border-[#F1E9DB]">
          <div className="flex justify-between items-center text-[#4B4B49]">
            <label
              htmlFor="slider-scale"
              className="flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#4B4B49]" />
              Relação de Escala
            </label>
            <span className="font-mono text-[11px] text-[#6B6B63]">
              {scaleFactor.toFixed(1)}x
            </span>
          </div>
          <input
            id="slider-scale"
            type="range"
            min="0.8"
            max="1.6"
            step="0.1"
            value={scaleFactor}
            onChange={(e) => setScaleFactor(parseFloat(e.target.value))}
            className="w-full accent-[#262B22] cursor-pointer"
          />
          <p className="text-[10px] text-[#6B6B63] leading-tight">
            Variação da magnitude relativa da figura sobre o campo.
          </p>
        </div>

        {/* Movimento */}
        <div className="space-y-1.5 p-3 rounded-xl bg-[#FDFAF4] border border-[#F1E9DB]">
          <div className="flex justify-between items-center text-[#4B4B49]">
            <label
              htmlFor="slider-motion"
              className="flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-[#4B4B49]" />
              Movimento Discreto
            </label>
            <span className="font-mono text-[11px] text-[#6B6B63]">
              {motionSpeed === 0 ? "Estático" : `${motionSpeed.toFixed(1)}x`}
            </span>
          </div>
          <input
            id="slider-motion"
            type="range"
            min="0"
            max="2"
            step="0.5"
            value={motionSpeed}
            onChange={(e) => setMotionSpeed(parseFloat(e.target.value))}
            className="w-full accent-[#262B22] cursor-pointer"
          />
          <p className="text-[10px] text-[#6B6B63] leading-tight">
            Destino comum: o movimento quebra a inércia do fundo.
          </p>
        </div>
      </div>
    </div>
  );
};
