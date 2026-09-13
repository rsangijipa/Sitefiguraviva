/**
 * Componente do Palco do Rio (RiverCanvas)
 * Renderiza a superfície do rio em camadas com WebGL de alta fidelidade
 * e overlay vetorial botânico em Canvas 2D, com fallback automático.
 * Instituto Figura Viva - Design System Confluência v1.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { RiverSceneEngine } from '../engine/riverScene';
import { useRiverLoop } from '../hooks/useRiverLoop';
import { LeafThought } from '../../../../types';
import { Sparkles, Layers, Cpu } from 'lucide-react';

interface RiverCanvasProps {
  scene: RiverSceneEngine;
  isPaused: boolean;
  reducedMotion: boolean;
  activeLeaves: LeafThought[];
  ambience?: number;
  onLeafRemoved?: (id: string) => void;
}

export const RiverCanvas: React.FC<RiverCanvasProps> = ({
  scene,
  isPaused,
  reducedMotion,
  activeLeaves,
  ambience = 0,
}) => {
  const webglCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointerRef = useRef<{ x: number; y: number; intensity: number }>({ x: 0.5, y: 0.5, intensity: 0 });

  const [useWebGL, setUseWebGL] = useState(true);
  const [rendererStatus, setRendererStatus] = useState<{ isWebGL: boolean; hasError: boolean }>({
    isWebGL: true,
    hasError: false,
  });
  const [showLayerDetails, setShowLayerDetails] = useState(false);

  // Hook que comanda o loop com suporte a WebGL e Canvas 2D
  useRiverLoop({
    canvasRef,
    webglCanvasRef,
    containerRef,
    pointerRef,
    scene,
    isPaused,
    reducedMotion,
    useWebGL,
    ambience,
    onRendererStatus: (status) => {
      setRendererStatus(status);
    },
  });

  const handlePointerInteraction = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    pointerRef.current = { x, y, intensity: 1.0 };
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerInteraction}
      onPointerMove={handlePointerInteraction}
      className="relative w-full h-[320px] sm:h-[380px] md:h-[440px] rounded-[24px] overflow-hidden border-2 border-[#D8CFBE] bg-[#07614C] transition-all select-none shadow-sm cursor-crosshair"
      role="region"
      aria-label="Cenário do Rio dos Pensamentos com Camadas de Correnteza Fluvial"
    >
      {/* Camada 1: Canvas WebGL para Simulação Fluida de Profundidade e Correntezas */}
      {useWebGL && !rendererStatus.hasError && (
        <canvas
          ref={webglCanvasRef}
          className="absolute inset-0 block w-full h-full pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* Camada 2: Canvas 2D para Folhagens Botânicas, Sedimentos e Frases */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full pointer-events-none z-10"
        aria-hidden="true"
      />

      {/* Controles de Camadas e Motor Visual do Rio */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2">
        {/* Alternador de Motor: WebGL vs Canvas 2D */}
        <button
          type="button"
          onClick={() => setUseWebGL(prev => !prev)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FDFAF4]/95 border border-[#D8CFBE] text-xs font-medium text-[#005A1F] hover:bg-[#FDFAF4] hover:border-[#005A1F] transition-all cursor-pointer shadow-none"
          title="Alternar entre Shader WebGL e Canvas 2D com sedimentos"
        >
          <Cpu className="w-3.5 h-3.5 text-[#005A1F]" strokeWidth={2} />
          <span>{rendererStatus.isWebGL && useWebGL ? 'Motor: WebGL Fluido' : 'Motor: Canvas 2D'}</span>
        </button>

        {/* Botão para inspecionar as 5 camadas ativas do rio */}
        <button
          type="button"
          onClick={() => setShowLayerDetails(prev => !prev)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
            showLayerDetails
              ? 'bg-[#005A1F] text-[#FDFAF4] border border-[#005A1F]'
              : 'bg-[#FDFAF4]/90 text-[#6B6B63] border border-[#D8CFBE] hover:text-[#262B22]'
          }`}
          title="Ver detalhes das camadas físicas e visuais em execução"
        >
          <Layers className="w-3.5 h-3.5" strokeWidth={2} />
          <span>5 Camadas</span>
        </button>
      </div>

      {/* Painel Informativo sobre as Camadas Ativas */}
      {showLayerDetails && (
        <div className="absolute top-12 left-3 z-20 p-3.5 rounded-[18px] bg-[#FDFAF4]/95 border border-[#D8CFBE] text-xs text-[#262B22] max-w-sm space-y-2 animate-fadeIn pointer-events-auto shadow-none">
          <div className="flex items-center justify-between border-b border-[#D8CFBE] pb-1.5">
            <span className="font-['Fraunces'] font-bold text-[#005A1F] text-sm">
              Camadas do Rio dos Pensamentos
            </span>
            <button
              type="button"
              onClick={() => setShowLayerDetails(false)}
              className="text-[#6B6B63] hover:text-[#262B22] text-xs px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
          <ul className="space-y-1 text-[11px] text-[#6B6B63]">
            <li className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#07614C]" />
              <span><strong>1. Leito Profundo & Caústicas:</strong> Refração solar WebGL e correnteza Igarapé/Raiz</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0a6d56]" />
              <span><strong>2. Flora Aquática & Veios:</strong> Macrófitas submersas e filamentos com paralaxe</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#D8CFBE]" />
              <span><strong>3. Marolas & Toque:</strong> Reflexos especulares e ondulações interativas do ponteiro</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#01C94D]" />
              <span><strong>4. Vórtices & Sombras:</strong> Ondulações e sombras de profundidade das folhas flutuantes</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#96551F]" />
              <span><strong>5. Margens, Nenúfares & Espuma:</strong> Vitória-régia, areia mineral e bordas orgânicas</span>
            </li>
          </ul>
        </div>
      )}

      {/* Dica suave de interação com a água */}
      <div className="absolute bottom-3 right-3 z-20 pointer-events-none hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDFAF4]/80 border border-[#D8CFBE]/70 text-[11px] text-[#07614C] font-medium">
        <Sparkles className="w-3 h-3 text-[#005A1F]" />
        <span>Toque ou arraste para ondular a água</span>
      </div>

      {/* Indicador discreto de pausa na tela */}
      {isPaused && (
        <div className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-full bg-[#FDFAF4]/95 border border-[#96551F] text-xs font-medium text-[#96551F] flex items-center gap-1.5 backdrop-blur-none">
          <span className="w-2 h-2 rounded-full bg-[#96551F]" />
          <span>Movimento pausado</span>
        </div>
      )}

      {/* Se não houver folhas no rio no momento */}
      {activeLeaves.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4 z-15">
          <div className="px-5 py-3 rounded-[20px] bg-[#FDFAF4]/95 border border-[#D8CFBE] text-center max-w-sm">
            <p className="font-['Fraunces'] text-sm font-semibold text-[#005A1F] mb-1">
              O rio corre calmo e límpido
            </p>
            <p className="text-xs text-[#6B6B63] font-medium leading-relaxed">
              Você pode apenas contemplar a correnteza ou depositar um pensamento na folha quando desejar.
            </p>
          </div>
        </div>
      )}

      {/* Modo de movimento reduzido ativado */}
      {reducedMotion && (
        <div className="absolute bottom-3 left-3 z-20 px-3 py-1.5 rounded-full bg-[#FDFAF4] border border-[#005A1F] text-xs text-[#005A1F] font-medium">
          Modo sem movimento contínuo ativado
        </div>
      )}
    </div>
  );
};
