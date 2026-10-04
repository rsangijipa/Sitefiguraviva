/**
 * @license
 * Instituto Figura Viva - Prática: Ouvir (Registro Confluência)
 * "Escolha um som e observe como ele se apresenta."
 * Modo 1: "Ouvir o ambiente" (Sem reproduzir nem gravar áudio - honesto e seguro).
 * Modo 2: "Paisagem de Igarapé" (Síntese Web Audio suave, 100% opcional, botão mudo instantâneo).
 */

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Radio, Wind, Waves, ShieldCheck } from 'lucide-react';
import { webAudio } from '../../../../services/audio/webAudioService';

interface ListeningPracticeProps {
  isActive: boolean;
  isPaused: boolean;
}

export const ListeningPractice: React.FC<ListeningPracticeProps> = ({
  isActive,
  isPaused,
}) => {
  const [listenMode, setListenMode] = useState<'ambient' | 'igarape'>('ambient');
  const [isPlayingSound, setIsPlayingSound] = useState<boolean>(false);

  // Efeito para sincronizar áudio com estado ativo/pausado
  useEffect(() => {
    if (listenMode === 'igarape' && isActive && !isPaused) {
      webAudio.playGentleStream();
      setIsPlayingSound(true);
    } else {
      webAudio.stop();
      setIsPlayingSound(false);
    }

    return () => {
      webAudio.stop();
    };
  }, [listenMode, isActive, isPaused]);

  return (
    <div 
      id="practice-listening"
      className="w-full flex flex-col items-center justify-center text-center px-4"
    >
      <div className="mb-4 max-w-lg mx-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#96551F]">
          Atenção Auditiva
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl text-[#005A1F] font-bold mt-1">
          Escolha um som e observe como ele se apresenta.
        </h2>
      </div>

      {/* Seletor de Modalidade de Escuta */}
      <div className="flex flex-wrap justify-center gap-3 my-4">
        <button
          id="btn-mode-ambient"
          type="button"
          onClick={() => setListenMode('ambient')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all min-h-[44px] text-sm font-medium ${
            listenMode === 'ambient'
              ? 'bg-[#F1E9DB] border-[#005A1F] text-[#005A1F]'
              : 'border-[#D8CFBE] text-[#4B4B49] hover:bg-[#F1E9DB]'
          }`}
        >
          <Radio className="w-4 h-4 text-[#005A1F]" strokeWidth={2} />
          <span>Ouvir o ambiente</span>
        </button>

        <button
          id="btn-mode-igarape"
          type="button"
          onClick={() => setListenMode('igarape')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all min-h-[44px] text-sm font-medium ${
            listenMode === 'igarape'
              ? 'bg-[#F1E9DB] border-[#07614C] text-[#07614C]'
              : 'border-[#D8CFBE] text-[#4B4B49] hover:bg-[#F1E9DB]'
          }`}
        >
          <Waves className="w-4 h-4 text-[#07614C]" strokeWidth={2} />
          <span>Águas do igarapé (suave)</span>
        </button>
      </div>

      {/* Cartão de orientação conforme o modo selecionado */}
      <div className="w-full max-w-md bg-[#F1E9DB] border-2 border-[#D8CFBE] rounded-[24px] p-6 sm:p-8 my-2">
        {listenMode === 'ambient' ? (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FDFAF4] border-2 border-[#005A1F] flex items-center justify-center mx-auto text-[#005A1F]">
              <Wind className="w-7 h-7 text-[#005A1F]" strokeWidth={2} />
            </div>
            <p className="font-serif text-lg text-[#005A1F] font-semibold">
              Se quiser, note os sons do lugar onde você está.
            </p>
            <p className="text-sm text-[#4B4B49] font-sans leading-relaxed">
              Pode ser um ruído distante, o som da respiração, o vento lá fora ou o silêncio entre os sons. Apenas deixe os sons chegarem e partirem.
            </p>
            <div className="p-3 bg-[#FDFAF4] rounded-xl border border-[#D8CFBE] text-xs text-[#6B6B63] flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#005A1F]" strokeWidth={2} />
              <span>Esta interface não grava nem reproduz áudio. Totalmente livre e privada.</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FDFAF4] border-2 border-[#07614C] flex items-center justify-center mx-auto text-[#07614C]">
              <Waves className="w-7 h-7 text-[#07614C]" strokeWidth={2} />
            </div>
            <p className="font-serif text-lg text-[#07614C] font-semibold">
              Paisagem sutil de águas correntes
            </p>
            <p className="text-sm text-[#4B4B49] font-sans leading-relaxed">
              Frequência suave simulando o leito de um riacho na mata. Sem alarmes ou batidas repetitivas.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${isPlayingSound ? 'bg-[#01C94D] animate-pulse' : 'bg-[#6B6B63]'}`} />
              <span className="text-xs text-[#07614C] font-medium">
                {isPlayingSound ? 'Áudio ambiental em execução' : 'Pausado'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
