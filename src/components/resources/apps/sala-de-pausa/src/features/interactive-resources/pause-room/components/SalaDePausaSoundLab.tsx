/**
 * @license
 * Instituto Figura Viva - Recurso: Paisagem Sonora & Acessibilidade Auditiva (Registro Confluência)
 * Síntese Web Audio pura sem microfone, sem gravação, com som de águas de igarapé e sino suave.
 */

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Bell, Waves, ShieldCheck, Check, Sparkles, Sliders } from 'lucide-react';
import { webAudio } from '../../../../services/audio/webAudioService';

interface SalaDePausaSoundLabProps {
  isMuted: boolean;
  onToggleMute: () => void;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
}

export const SalaDePausaSoundLab: React.FC<SalaDePausaSoundLabProps> = ({
  isMuted,
  onToggleMute,
  reducedMotion,
  onToggleReducedMotion,
}) => {
  const [isPlayingStream, setIsPlayingStream] = useState<boolean>(false);
  const [chimeFeedback, setChimeFeedback] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      // Para o stream ao desmontar se estava em teste
      if (isPlayingStream) {
        webAudio.stop();
      }
    };
  }, [isPlayingStream]);

  const handleToggleStream = () => {
    if (isPlayingStream) {
      webAudio.stop();
      setIsPlayingStream(false);
    } else {
      if (isMuted) {
        onToggleMute();
      }
      webAudio.playGentleStream();
      setIsPlayingStream(true);
    }
  };

  const handleTestChime = () => {
    if (isMuted) {
      onToggleMute();
    }
    webAudio.playGentleChime();
    setChimeFeedback(true);
    setTimeout(() => setChimeFeedback(false), 1500);
  };

  return (
    <div id="sala-de-pausa-sound-lab" className="w-full max-w-3xl mx-auto py-4 sm:py-6 text-left">
      <div className="mb-6 text-center">
        <span className="text-xs uppercase tracking-wider text-[#96551F] font-bold">
          Ambiente & Sensorialidade
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl text-[#005A1F] font-bold mt-1">
          Paisagem Sonora & Acessibilidade
        </h2>
        <p className="text-sm text-[#4B4B49] mt-2 max-w-md mx-auto leading-relaxed">
          Recursos auditivos e visuais da Sala de Pausa desenhados para acolher sem sobrecarregar. 100% opcionais e gerados localmente no seu dispositivo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Card 1: Paisagem de Águas do Igarapé */}
        <div className="bg-[#FDFAF4] border-2 border-[#07614C] rounded-[24px] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F1E9DB] border-2 border-[#07614C] flex items-center justify-center text-[#07614C]">
                <Waves className="w-6 h-6" strokeWidth={2} />
              </div>
              <span className="text-xs font-semibold text-[#07614C] bg-[#F1E9DB] px-3 py-1 rounded-full border border-[#07614C]/30">
                Sintético & Privado
              </span>
            </div>

            <h3 className="font-serif text-xl font-bold text-[#07614C]">
              Águas do Igarapé
            </h3>
            <p className="text-xs sm:text-sm text-[#4B4B49] mt-2 leading-relaxed">
              Frequência de ruído rosa filtrado simulando o fluxo de águas calmas em margem de mata. Ajuda a atenuar ruídos externos durante a pausa.
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs text-[#6B6B63]">
              <span className={`w-2 h-2 rounded-full ${isPlayingStream ? 'bg-[#01C94D] animate-pulse' : 'bg-[#D8CFBE]'}`} />
              <span>{isPlayingStream ? 'Reproduzindo suavemente' : 'Pausado'}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#D8CFBE]">
            <button
              type="button"
              onClick={handleToggleStream}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all min-h-[44px] ${
                isPlayingStream
                  ? 'bg-[#07614C] text-[#FDFAF4] hover:bg-[#005A1F]'
                  : 'bg-[#F1E9DB] text-[#07614C] border-2 border-[#07614C] hover:bg-[#FDFAF4]'
              }`}
            >
              {isPlayingStream ? (
                <>
                  <VolumeX className="w-4 h-4 text-inherit" />
                  <span>Pausar som de águas</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-inherit" />
                  <span>Experimentar águas do igarapé</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Card 2: Sino Confluência de Abertura / Encerramento */}
        <div className="bg-[#FDFAF4] border-2 border-[#005A1F] rounded-[24px] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F1E9DB] border-2 border-[#005A1F] flex items-center justify-center text-[#005A1F]">
                <Bell className="w-6 h-6" strokeWidth={2} />
              </div>
              <span className="text-xs font-semibold text-[#005A1F] bg-[#F1E9DB] px-3 py-1 rounded-full border border-[#005A1F]/30">
                Transição Suave
              </span>
            </div>

            <h3 className="font-serif text-xl font-bold text-[#005A1F]">
              Sino Confluência
            </h3>
            <p className="text-xs sm:text-sm text-[#4B4B49] mt-2 leading-relaxed">
              Tom harmônico suave com decaimento exponencial orgânico. Tocado automaticamente ao concluir o tempo da pausa planejada.
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs text-[#6B6B63]">
              <Sparkles className="w-3.5 h-3.5 text-[#FED701]" />
              <span>Harmônicos naturais sem sustos</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#D8CFBE]">
            <button
              type="button"
              onClick={handleTestChime}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C] transition-all min-h-[44px]"
            >
              {chimeFeedback ? (
                <>
                  <Check className="w-4 h-4 text-[#FED701]" />
                  <span>Sino tocado</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 text-inherit" />
                  <span>Ouvir toque do sino</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Card de Configurações de Acessibilidade Visual */}
      <div className="mt-6 bg-[#F1E9DB] border-2 border-[#D8CFBE] rounded-[24px] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#96551F]" strokeWidth={2} />
            <h4 className="font-serif font-bold text-base text-[#005A1F]">
              Modo de Movimento Reduzido (Calmo)
            </h4>
          </div>
          <p className="text-xs text-[#4B4B49] max-w-lg leading-relaxed">
            Substitui animações orgânicas de expansão respiratória por alternativas estáticas e estáveis para maior conforto visual e sensibilidade motora.
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleReducedMotion}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border-2 transition-all min-h-[44px] shrink-0 ${
            reducedMotion
              ? 'bg-[#96551F] text-[#FDFAF4] border-[#96551F]'
              : 'bg-[#FDFAF4] text-[#4B4B49] border-[#D8CFBE] hover:border-[#96551F]'
          }`}
        >
          {reducedMotion ? 'Movimento calmo ativado' : 'Ativar movimento calmo'}
        </button>
      </div>

      {/* Aviso de Privacidade e Segurança */}
      <div className="mt-4 p-4 rounded-xl bg-[#FDFAF4] border border-[#D8CFBE] flex items-center gap-3 text-xs text-[#6B6B63]">
        <ShieldCheck className="w-4 h-4 text-[#005A1F] shrink-0" />
        <span>
          A Sala de Pausa não acessa microfone, não grava áudio nem envia dados acústicos para servidores externos.
        </span>
      </div>
    </div>
  );
};
