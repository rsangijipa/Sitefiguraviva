/**
 * @license
 * Instituto Figura Viva - PauseRoomExperience (Registro Confluência)
 * Orquestradora da Sala de Pausa integrada ao Portal do Aluno.
 * Fluxo: choosing -> preparing -> active <-> paused -> completed.
 */

import React, { useState, useCallback, useRef } from 'react';
import { InteractiveResourceShell } from '../shell/InteractiveResourceShell';
import { PauseChoiceGrid } from './components/PauseChoiceGrid';
import { DurationPicker } from './components/DurationPicker';
import { PausePlayer } from './components/PausePlayer';
import { PAUSE_PRACTICES, PRACTICE_ORDER } from './editorialData';
import { PausePracticeId, PlannedDurationSeconds, ResourceState, UserProfile } from '../../../types';
import { supabaseClient } from '../../../services/supabase/client';
import { webAudio } from '../../../services/audio/webAudioService';
import { Sparkles, ArrowRight } from 'lucide-react';

interface PauseRoomExperienceProps {
  onBackToPortal: () => void;
  currentUser: UserProfile;
}

type PauseFlowPhase = 'choosing' | 'active' | 'completed';

export const PauseRoomExperience: React.FC<PauseRoomExperienceProps> = ({
  onBackToPortal,
  currentUser,
}) => {
  const [phase, setPhase] = useState<PauseFlowPhase>('choosing');
  const [selectedPracticeId, setSelectedPracticeId] = useState<PausePracticeId>('breathing');
  const [plannedDuration, setPlannedDuration] = useState<PlannedDurationSeconds>(180);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hideTimer, setHideTimer] = useState<boolean>(false);

  // Dados da sessão concluída
  const [activeDuration, setActiveDuration] = useState<number>(0);
  const [endedBy, setEndedBy] = useState<'timer' | 'user' | 'switch'>('user');
  const clientRequestIdRef = useRef<string>('');

  const currentPractice = PAUSE_PRACTICES[selectedPracticeId];

  // Iniciar a prática
  const handleStartPractice = () => {
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

  // Salvar no histórico
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

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    webAudio.setMuted(nextMute);
  };

  // Deriva o estado para o Shell
  let resourceState: ResourceState = 'ready';
  if (phase === 'active') resourceState = 'active';
  if (phase === 'completed') resourceState = 'completed';

  return (
    <InteractiveResourceShell
      title="Sala de Pausa"
      categoryLabel="Pausas Opcionais de 2–5 min"
      state={resourceState}
      onBackToCatalog={onBackToPortal}
      currentUser={currentUser}
      practiceTitle={currentPractice.title}
      activeDurationSeconds={activeDuration}
      endedBy={endedBy}
      onSaveToHistory={handleSaveToHistory}
      onBackToPortal={onBackToPortal}
      
      // Áudio & Acessibilidade
      supportsAudio={currentPractice.capabilities.audio}
      isMuted={isMuted}
      onToggleMute={handleToggleMute}
      reducedMotion={reducedMotion}
      onToggleReducedMotion={() => setReducedMotion(!reducedMotion)}
      supportsTimerHiding={phase === 'active'}
      hideTimer={hideTimer}
      onToggleHideTimer={() => setHideTimer(!hideTimer)}
      badgeLabel={phase === 'active' ? currentPractice.title : undefined}

      // Ações dos controles
      onStart={phase === 'choosing' ? handleStartPractice : undefined}
      startLabel={`Começar pausa com ${currentPractice.title}`}
      onEndExperience={() => handleEndPractice(activeDuration || 60, 'user')}
      onSwitchPractice={phase === 'active' ? () => setPhase('choosing') : undefined}
      switchLabel="Escolher outra prática"
    >
      {phase === 'choosing' ? (
        <div className="w-full flex flex-col items-center">
          <PauseChoiceGrid
            practices={PRACTICE_ORDER.map(id => PAUSE_PRACTICES[id])}
            selectedPracticeId={selectedPracticeId}
            onSelectPractice={(id) => setSelectedPracticeId(id)}
          />

          <div className="w-full max-w-md my-4">
            <DurationPicker
              selectedDuration={plannedDuration}
              onSelectDuration={(d) => setPlannedDuration(d)}
            />
          </div>

          <div className="mt-3 text-center">
            <button
              id="btn-confirm-start-pause"
              type="button"
              onClick={handleStartPractice}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C] transition-colors font-medium text-base min-h-[48px] shadow-none focus:outline-none focus:ring-2 focus:ring-[#005A1F]"
            >
              <span>Entrar na pausa com {currentPractice.title}</span>
              <ArrowRight className="w-5 h-5 text-[#FDFAF4]" strokeWidth={2} />
            </button>
          </div>
        </div>
      ) : (
        <PausePlayer
          practice={currentPractice}
          plannedDuration={plannedDuration}
          reducedMotion={reducedMotion}
          onEndExperience={handleEndPractice}
          onRequestSwitchPractice={() => setPhase('choosing')}
          currentUser={currentUser}
        />
      )}
    </InteractiveResourceShell>
  );
};
