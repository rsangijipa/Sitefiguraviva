/**
 * @license
 * Instituto Figura Viva - Janela Central da Sala de Pausa (Registro Confluência)
 * Janela do meio contendo todos os recursos do aplicativo:
 * 1. Práticas da Sala (Seleção, Player Ativo e Conclusão com Reflexão)
 * 2. Meu Histórico Privado de Pausas (com RLS e exportação)
 * 3. Guia Editorial & Roteiros Homologados
 * 4. Paisagem Sonora de Igarapé & Acessibilidade
 */

import React, { useState, useRef } from 'react';
import { PauseChoiceGrid } from './components/PauseChoiceGrid';
import { DurationPicker } from './components/DurationPicker';
import { PausePlayer } from './components/PausePlayer';
import { ResourceCompletion } from '../shell/ResourceCompletion';
import { SalaDePausaHistoryTab } from './components/SalaDePausaHistoryTab';
import { SalaDePausaEditorialGuide } from './components/SalaDePausaEditorialGuide';
import { SalaDePausaSoundLab } from './components/SalaDePausaSoundLab';
import { PAUSE_PRACTICES, PRACTICE_ORDER } from './editorialData';
import { PausePracticeId, PlannedDurationSeconds, UserProfile } from '../../../types';
import { supabaseClient } from '../../../services/supabase/client';
import { webAudio } from '../../../services/audio/webAudioService';
import { SalaDePausaTab } from './components/SalaDePausaTopBar';
import { 
  ArrowRight, 
  Clock, 
  EyeOff, 
  Eye, 
  Sparkles, 
  Compass, 
  ShieldCheck, 
  Heart, 
  CheckCircle2, 
  BookOpen, 
  History, 
  Waves,
  AlertTriangle 
} from 'lucide-react';

interface SalaDePausaWindowProps {
  currentTab: SalaDePausaTab;
  onTabChange: (tab: SalaDePausaTab) => void;
  currentUser: UserProfile;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  // Exposição de estado para a barra superior
  onActiveStateChange?: (isActive: boolean, practiceTitle?: string) => void;
  registerBackTrigger?: (trigger: () => void) => void;
}

export type PausePhase = 'choosing' | 'active' | 'completed';

export const SalaDePausaWindow: React.FC<SalaDePausaWindowProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  reducedMotion,
  onToggleReducedMotion,
  isMuted,
  onToggleMute,
  onActiveStateChange,
  registerBackTrigger,
}) => {
  // Estado das práticas
  const [phase, setPhase] = useState<PausePhase>('choosing');
  const [selectedPracticeId, setSelectedPracticeId] = useState<PausePracticeId>('breathing');
  const [plannedDuration, setPlannedDuration] = useState<PlannedDurationSeconds>(180);
  const [hideTimer, setHideTimer] = useState<boolean>(false);

  // Confirmação de saída ao clicar em voltar
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  // Dados da sessão em andamento/concluída
  const [activeDuration, setActiveDuration] = useState<number>(0);
  const [endedBy, setEndedBy] = useState<'timer' | 'user' | 'switch'>('user');
  const clientRequestIdRef = useRef<string>('');

  const currentPractice = PAUSE_PRACTICES[selectedPracticeId];

  // Registra gatilho de retorno para a barra superior
  React.useEffect(() => {
    if (registerBackTrigger) {
      registerBackTrigger(() => {
        if (phase === 'active') {
          setShowExitConfirm(true);
        } else if (phase === 'completed') {
          setPhase('choosing');
        } else if (currentTab !== 'praticas') {
          onTabChange('praticas');
        }
      });
    }
  }, [phase, currentTab, registerBackTrigger, onTabChange]);

  // Notifica barra superior de mudanças de estado
  React.useEffect(() => {
    if (onActiveStateChange) {
      onActiveStateChange(phase === 'active', currentPractice.title);
    }
  }, [phase, currentPractice.title, onActiveStateChange]);

  // Iniciar a prática
  const handleStartPractice = (practiceIdToStart?: PausePracticeId) => {
    if (practiceIdToStart) {
      setSelectedPracticeId(practiceIdToStart);
    }
    clientRequestIdRef.current = 'req-' + Math.random().toString(36).substring(2, 9);
    supabaseClient.logTelemetry('resource_started', 'sala-de-pausa');
    setPhase('active');
  };

  // Encerrar a prática
  const handleEndPractice = (duration: number, reason: 'timer' | 'user' | 'switch') => {
    setActiveDuration(duration);
    setEndedBy(reason);
    webAudio.stop();
    supabaseClient.logTelemetry(
      reason === 'timer' ? 'resource_completed' : 'resource_abandoned',
      'sala-de-pausa',
      duration
    );
    setPhase('completed');
  };

  // Salvar no histórico Supabase com isolamento RLS
  const handleSaveToHistory = async (reflectionText: string) => {
    const result = await supabaseClient.savePauseSession({
      client_request_id: clientRequestIdRef.current || 'req-' + Math.random().toString(36).substring(2, 9),
      practice_id: selectedPracticeId,
      practice_title: currentPractice.title,
      planned_duration_seconds: plannedDuration,
      active_duration_seconds: activeDuration,
      ended_by: endedBy,
      reflection: reflectionText ? reflectionText.slice(0, 500) : null,
      content_version: currentPractice.version,
    });

    if (result.error) {
      return { success: false, error: result.error };
    }
    return { success: true };
  };

  // Confirmar saída da prática ativa
  const handleConfirmExit = () => {
    webAudio.stop();
    setShowExitConfirm(false);
    setPhase('choosing');
  };

  return (
    <div className="w-full py-4 sm:py-8 px-3 sm:px-6 flex flex-col items-center">
      {/* Moldura da Janela do Meio */}
      <main 
        id="sala-de-pausa-main-window"
        className="w-full max-w-5xl bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-[24px] shadow-sm overflow-hidden flex flex-col transition-all"
        role="main"
        aria-label="Janela de Recursos da Sala de Pausa"
      >
        {/* Barra Interna de Recursos da Janela */}
        <div className="w-full bg-[#F1E9DB]/70 border-b-2 border-[#D8CFBE] px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#005A1F]" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#005A1F]">
              Recursos da Sala de Pausa
            </span>
            <span className="text-xs text-[#6B6B63] hidden sm:inline">• Registro Confluência</span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => {
                if (phase === 'active') {
                  setShowExitConfirm(true);
                } else {
                  onTabChange('praticas');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all min-h-[36px] ${
                currentTab === 'praticas'
                  ? 'bg-[#005A1F] text-[#FDFAF4]'
                  : 'text-[#4B4B49] hover:bg-[#FDFAF4]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Práticas ({PRACTICE_ORDER.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (phase === 'active') {
                  setShowExitConfirm(true);
                } else {
                  onTabChange('historico');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all min-h-[36px] ${
                currentTab === 'historico'
                  ? 'bg-[#005A1F] text-[#FDFAF4]'
                  : 'text-[#4B4B49] hover:bg-[#FDFAF4]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Meu Histórico</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (phase === 'active') {
                  setShowExitConfirm(true);
                } else {
                  onTabChange('editorial');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all min-h-[36px] ${
                currentTab === 'editorial'
                  ? 'bg-[#96551F] text-[#FDFAF4]'
                  : 'text-[#4B4B49] hover:bg-[#FDFAF4]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Roteiros</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (phase === 'active') {
                  setShowExitConfirm(true);
                } else {
                  onTabChange('paisagem-sonora');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all min-h-[36px] ${
                currentTab === 'paisagem-sonora'
                  ? 'bg-[#07614C] text-[#FDFAF4]'
                  : 'text-[#4B4B49] hover:bg-[#FDFAF4]'
              }`}
            >
              <Waves className="w-3.5 h-3.5" />
              <span>Sons & Acessibilidade</span>
            </button>
          </div>
        </div>

        {/* Conteúdo Central da Janela */}
        <div className="p-4 sm:p-8 flex-1 flex flex-col justify-center">
          {/* TAB 1: PRÁTICAS DA SALA DE PAUSA */}
          {currentTab === 'praticas' && (
            <>
              {phase === 'choosing' && (
                <div id="pause-choosing-view" className="w-full flex flex-col items-center">
                  {/* Título de Boas-Vindas da Sala de Pausa */}
                  <div className="text-center max-w-xl mx-auto mb-6">
                    <span className="text-xs uppercase tracking-wider text-[#96551F] font-bold">
                      Espaço de Acolhimento & Presença
                    </span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#005A1F] mt-1 mb-2">
                      Que tipo de pausa cabe agora?
                    </h2>
                    <p className="text-sm sm:text-base text-[#4B4B49] leading-relaxed">
                      Escolha uma possibilidade abaixo. Você pode ajustar a duração, pausar, trocar de prática ou encerrar no seu momento.
                    </p>
                  </div>

                  {/* Grade dos 5 Recursos de Prática */}
                  <div className="w-full mb-6">
                    <PauseChoiceGrid
                      practices={PRACTICE_ORDER.map(id => PAUSE_PRACTICES[id])}
                      selectedPracticeId={selectedPracticeId}
                      onSelectPractice={(id) => setSelectedPracticeId(id)}
                    />
                  </div>

                  {/* Painel do Roteiro da Prática Selecionada */}
                  <div className="w-full max-w-2xl bg-[#F1E9DB]/60 border-2 border-[#D8CFBE] rounded-[20px] p-4 sm:p-5 mb-6 text-left">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#005A1F] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#FED701]" />
                        <span>Roteiro: {currentPractice.title}</span>
                      </span>
                      <span className="text-xs text-[#6B6B63]">
                        Versão {currentPractice.version}
                      </span>
                    </div>

                    <p className="font-serif text-base sm:text-lg text-[#005A1F] font-semibold italic">
                      "{currentPractice.invitationText}"
                    </p>
                    <p className="text-xs sm:text-sm text-[#4B4B49] mt-2 leading-relaxed">
                      {currentPractice.guidanceText}
                    </p>
                  </div>

                  {/* Seletor de Duração Flexível */}
                  <div className="w-full max-w-lg mb-6">
                    <DurationPicker
                      selectedDuration={plannedDuration}
                      onSelectDuration={(d) => setPlannedDuration(d)}
                    />
                  </div>

                  {/* Controles Opcionais de Contagem Regressiva e Botão Principal */}
                  <div className="w-full max-w-lg flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#D8CFBE]">
                    {/* Botão de Tempo Oculto */}
                    <button
                      type="button"
                      onClick={() => setHideTimer(!hideTimer)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all min-h-[44px] ${
                        hideTimer
                          ? 'bg-[#005A1F] text-[#FDFAF4] border-[#005A1F]'
                          : 'bg-[#FDFAF4] text-[#4B4B49] border-[#D8CFBE] hover:bg-[#F1E9DB]'
                      }`}
                      title={hideTimer ? 'Contagem oculta durante a pausa' : 'Exibir contagem regressiva'}
                    >
                      {hideTimer ? (
                        <>
                          <EyeOff className="w-4 h-4 text-[#FED701]" />
                          <span>Tempo oculto ativado</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 text-[#6B6B63]" />
                          <span>Ocultar tempo na prática</span>
                        </>
                      )}
                    </button>

                    {/* Botão Primário: Iniciar Pausa */}
                    <button
                      id="btn-confirm-start-pause"
                      type="button"
                      onClick={() => handleStartPractice()}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C] transition-all font-medium text-base min-h-[48px] shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#005A1F]"
                    >
                      <span>Entrar na pausa com {currentPractice.title}</span>
                      <ArrowRight className="w-5 h-5 text-[#FDFAF4]" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              )}

              {/* FASE ATIVA: PLAYER DA SALA DE PAUSA */}
              {phase === 'active' && (
                <div id="pause-active-view" className="w-full flex flex-col items-center">
                  <PausePlayer
                    practice={currentPractice}
                    plannedDuration={plannedDuration}
                    reducedMotion={reducedMotion}
                    onEndExperience={handleEndPractice}
                    onRequestSwitchPractice={() => setPhase('choosing')}
                    currentUser={currentUser}
                  />

                  {/* Barra de Ações Rápidas na Janela Durante a Pausa */}
                  <div className="w-full max-w-lg mt-6 pt-4 border-t border-[#D8CFBE] flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setShowExitConfirm(true)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B6B63] hover:text-[#96551F] hover:bg-[#F1E9DB] transition-all min-h-[44px]"
                    >
                      Voltar à seleção de práticas
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEndPractice(activeDuration || 60, 'user')}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#FDFAF4] border-2 border-[#005A1F] text-[#005A1F] hover:bg-[#F1E9DB] transition-all min-h-[44px]"
                    >
                      Concluir pausa agora
                    </button>
                  </div>
                </div>
              )}

              {/* FASE CONCLUÍDA: FECHAMENTO & REFLEXÃO PRIVADA */}
              {phase === 'completed' && (
                <div id="pause-completed-view" className="w-full flex flex-col items-center py-2">
                  <ResourceCompletion
                    practiceTitle={currentPractice.title}
                    activeDurationSeconds={activeDuration}
                    endedBy={endedBy}
                    currentUser={currentUser}
                    onSaveToHistory={handleSaveToHistory}
                    onBackToPortal={() => setPhase('choosing')}
                    onContinueAWhile={() => {
                      setPhase('active');
                    }}
                    canContinue={endedBy === 'timer'}
                  />
                </div>
              )}
            </>
          )}

          {/* TAB 2: HISTÓRICO PRIVADO DA SALA DE PAUSA */}
          {currentTab === 'historico' && (
            <SalaDePausaHistoryTab
              currentUser={currentUser}
              onSelectPracticeToStart={(pId) => {
                onTabChange('praticas');
                handleStartPractice(pId);
              }}
            />
          )}

          {/* TAB 3: GUIA EDITORIAL & ROTEIROS */}
          {currentTab === 'editorial' && (
            <SalaDePausaEditorialGuide
              onSelectPracticeToStart={(pId) => {
                onTabChange('praticas');
                handleStartPractice(pId);
              }}
            />
          )}

          {/* TAB 4: PAISAGEM SONORA & ACESSIBILIDADE */}
          {currentTab === 'paisagem-sonora' && (
            <SalaDePausaSoundLab
              isMuted={isMuted}
              onToggleMute={onToggleMute}
              reducedMotion={reducedMotion}
              onToggleReducedMotion={onToggleReducedMotion}
            />
          )}
        </div>

        {/* Rodapé Interno da Janela */}
        <div className="w-full bg-[#F1E9DB]/50 border-t border-[#D8CFBE] px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B6B63] gap-2">
          <div className="flex items-center gap-2 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#005A1F]" />
            <span>Sala de Pausa • Instituto Figura Viva • Livre de diagnósticos e exigências</span>
          </div>
          <span className="text-[11px] text-[#96551F] font-medium">
            Prática voluntária e autônoma
          </span>
        </div>
      </main>

      {/* Modal Acessível de Confirmação de Saída durante Pausa Ativa */}
      {showExitConfirm && (
        <div 
          className="fixed inset-0 z-50 bg-[#262B22]/40 flex items-center justify-center p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-confirm-title"
        >
          <div className="bg-[#FDFAF4] border-2 border-[#96551F] rounded-[24px] p-6 max-w-md w-full shadow-xl text-left">
            <div className="flex items-center gap-3 mb-3 text-[#96551F]">
              <AlertTriangle className="w-6 h-6" strokeWidth={2} />
              <h3 id="exit-confirm-title" className="font-serif font-bold text-lg text-[#96551F]">
                Deseja sair desta pausa?
              </h3>
            </div>
            <p className="text-sm text-[#4B4B49] leading-relaxed mb-6 font-sans">
              Você está em uma pausa ativa com <strong>{currentPractice.title}</strong>. Sair agora interrompe o momento atual e volta para a seleção de recursos da Sala de Pausa.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium border-2 border-[#D8CFBE] text-[#4B4B49] hover:bg-[#F1E9DB] min-h-[44px]"
              >
                Continuar na pausa
              </button>
              <button
                type="button"
                onClick={handleConfirmExit}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-[#96551F] text-[#FDFAF4] hover:bg-[#96551F]/90 min-h-[44px]"
              >
                Sim, sair da pausa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
