/**
 * @license
 * Instituto Figura Viva - PausePlayer (Registro Confluência)
 * Orquestrador do player da pausa: renderiza o exercício atual, monitora tempo monotônico,
 * gerencia confirmação de troca e conclusão da pausa.
 */

import React, { useState, useEffect } from 'react';
import { PausePracticeConfig, PlannedDurationSeconds, UserProfile } from '../../../../types';
import { useActiveTimer } from '../../../../hooks/useActiveTimer';
import { BreathingPractice } from '../practices/BreathingPractice';
import { ObservingPractice } from '../practices/ObservingPractice';
import { ListeningPractice } from '../practices/ListeningPractice';
import { MovementPractice } from '../practices/MovementPractice';
import { SlowingPractice } from '../practices/SlowingPractice';
import { Clock, AlertTriangle, Eye, EyeOff, Play, Pause, Square, RefreshCw } from 'lucide-react';
import { webAudio } from '../../../../services/audio/webAudioService';

interface PausePlayerProps {
  practice: PausePracticeConfig;
  plannedDuration: PlannedDurationSeconds;
  reducedMotion: boolean;
  onEndExperience: (activeDuration: number, endedBy: 'timer' | 'user' | 'switch') => void;
  onRequestSwitchPractice: () => void;
  currentUser: UserProfile;
}

export const PausePlayer: React.FC<PausePlayerProps> = ({
  practice,
  plannedDuration,
  reducedMotion,
  onEndExperience,
  onRequestSwitchPractice,
  currentUser,
}) => {
  const [showSwitchConfirm, setShowSwitchConfirm] = useState<boolean>(false);

  const timer = useActiveTimer({
    plannedDurationSeconds: plannedDuration,
    onComplete: () => {
      webAudio.playGentleChime();
      onEndExperience(timer.activeSeconds, 'timer');
    },
    onPauseByVisibility: () => {
      // Aba oculta -> pausa áudio
      webAudio.stop();
    },
  });

  // Inicia o timer e toca o sino suave de acolhimento ao entrar
  useEffect(() => {
    timer.start();
    webAudio.playGentleChime();
    return () => {
      webAudio.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleManualEnd = () => {
    timer.stop();
    webAudio.stop();
    onEndExperience(timer.activeSeconds, 'user');
  };

  const handleSwitchClick = () => {
    if (timer.isActive) {
      timer.pause();
      webAudio.stop();
      setShowSwitchConfirm(true);
    } else {
      onRequestSwitchPractice();
    }
  };

  const confirmSwitch = () => {
    timer.stop();
    webAudio.stop();
    setShowSwitchConfirm(false);
    onRequestSwitchPractice();
  };

  const cancelSwitch = () => {
    setShowSwitchConfirm(false);
    timer.resume();
  };

  return (
    <div id="pause-player-container" className="w-full flex flex-col items-center">
      {/* Barra de status e tempo monotônico */}
      <div 
        id="player-timer-status"
        className="w-full max-w-xl mb-4 px-4 py-3 bg-[#F1E9DB] border-2 border-[#D8CFBE] rounded-2xl flex items-center justify-between shadow-xs"
      >
        <div className="flex items-center gap-2 text-sm text-[#005A1F] font-semibold">
          <Clock className="w-4 h-4 text-[#005A1F]" strokeWidth={2} />
          <span>{practice.title}</span>
          <span className="text-xs text-[#6B6B63] font-normal">
            ({plannedDuration === 0 ? 'Modo livre' : `${Math.round(plannedDuration / 60)} min`})
          </span>
        </div>

        {/* Indicador de tempo ou modo "Pausa em andamento" */}
        <div className="flex items-center gap-2.5">
          {timer.hideCountdown ? (
            <span className="text-xs font-semibold text-[#005A1F] bg-[#FDFAF4] px-3 py-1 rounded-full border border-[#005A1F]/30">
              Pausa em andamento
            </span>
          ) : (
            <div className="flex items-center gap-2" aria-live="polite">
              <span className="font-mono text-base font-bold text-[#005A1F]">
                {timer.isOpenEnded 
                  ? `+${formatTime(timer.activeSeconds)}` 
                  : formatTime(timer.remainingSeconds)}
              </span>
              <span className="text-xs text-[#6B6B63]">
                {timer.isOpenEnded ? 'ativo' : 'restante'}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={timer.toggleHideCountdown}
            className="p-1.5 rounded-lg text-[#6B6B63] hover:text-[#005A1F] hover:bg-[#FDFAF4] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title={timer.hideCountdown ? 'Mostrar contagem regressiva' : 'Ocultar contagem regressiva'}
            aria-label={timer.hideCountdown ? 'Mostrar contagem regressiva' : 'Ocultar contagem regressiva'}
          >
            {timer.hideCountdown ? <Eye className="w-4 h-4 text-[#FED701]" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Barra de progresso Confluência sutil */}
      {!timer.isOpenEnded && !timer.hideCountdown && (
        <div className="w-full max-w-xl h-2 bg-[#D8CFBE]/60 rounded-full mb-5 overflow-hidden">
          <div 
            className="h-full bg-[#005A1F] transition-all duration-200 ease-linear rounded-full"
            style={{ width: `${timer.progressFraction * 100}%` }}
          />
        </div>
      )}

      {/* Controles de Pausa / Retomada do Timer da Prática */}
      <div className="flex items-center justify-center gap-3 mb-6">
        {timer.isPaused ? (
          <button
            type="button"
            onClick={() => timer.resume()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C] transition-all text-xs font-semibold min-h-[40px]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Retomar pausa</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => timer.pause()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F1E9DB] border-2 border-[#005A1F] text-[#005A1F] hover:bg-[#FDFAF4] transition-all text-xs font-semibold min-h-[40px]"
          >
            <Pause className="w-3.5 h-3.5" />
            <span>Pausar tempo</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleSwitchClick}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D8CFBE] text-[#4B4B49] hover:bg-[#F1E9DB] transition-all text-xs font-medium min-h-[40px]"
          title="Escolher outra prática da Sala de Pausa"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Trocar prática</span>
        </button>

        <button
          type="button"
          onClick={handleManualEnd}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#96551F] text-[#96551F] hover:bg-[#F1E9DB] transition-all text-xs font-medium min-h-[40px]"
          title="Encerrar pausa e ir para reflexão"
        >
          <Square className="w-3.5 h-3.5" />
          <span>Encerrar pausa</span>
        </button>
      </div>

      {/* Renderização da Prática Selecionada */}
      <div className="w-full py-2">
        {practice.id === 'breathing' && (
          <BreathingPractice
            isActive={timer.isActive}
            isPaused={timer.isPaused}
            reducedMotion={reducedMotion}
          />
        )}
        {practice.id === 'observing' && (
          <ObservingPractice />
        )}
        {practice.id === 'listening' && (
          <ListeningPractice
            isActive={timer.isActive}
            isPaused={timer.isPaused}
          />
        )}
        {practice.id === 'movement' && (
          <MovementPractice />
        )}
        {practice.id === 'slowing' && (
          <SlowingPractice />
        )}
      </div>

      {/* Diálogo Acessível de Confirmação de Troca de Prática */}
      {showSwitchConfirm && (
        <div 
          className="fixed inset-0 z-50 bg-[#262B22]/40 flex items-center justify-center p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="switch-dialog-title"
        >
          <div className="bg-[#FDFAF4] border-2 border-[#96551F] rounded-[24px] p-6 max-w-md w-full shadow-lg text-left">
            <div className="flex items-center gap-3 mb-3 text-[#96551F]">
              <AlertTriangle className="w-6 h-6" strokeWidth={2} />
              <h3 id="switch-dialog-title" className="font-serif font-bold text-lg text-[#96551F]">
                Trocar de prática?
              </h3>
            </div>
            <p className="text-sm text-[#4B4B49] font-sans leading-relaxed mb-6">
              Escolher outra prática encerra esta pausa. O tempo ativo até agora não será salvo automaticamente. Deseja continuar?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={cancelSwitch}
                className="px-4 py-2 rounded-xl text-sm font-medium border-2 border-[#D8CFBE] text-[#4B4B49] hover:bg-[#F1E9DB] min-h-[44px]"
              >
                Voltar à prática atual
              </button>
              <button
                type="button"
                onClick={confirmSwitch}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-[#96551F] text-[#FDFAF4] hover:bg-[#96551F]/90 min-h-[44px]"
              >
                Sim, escolher outra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
