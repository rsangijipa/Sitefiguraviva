/**
 * @license
 * Instituto Figura Viva - InteractiveResourceShell (Registro Confluência)
 * Shell arquitetural unificado com os 4 blocos contratuais:
 * - <ResourceHeader />
 * - <ResourceStage />
 * - <ResourceControls />
 * - <ResourceCompletion />
 */

import React from 'react';
import { ResourceHeader } from './ResourceHeader';
import { ResourceStage } from './ResourceStage';
import { ResourceControls } from './ResourceControls';
import { ResourceCompletion } from './ResourceCompletion';
import { ResourceState, UserProfile } from '../../../types';

interface InteractiveResourceShellProps {
  title: string;
  categoryLabel?: string;
  state: ResourceState;
  errorMessage?: string;
  onRetry?: () => void;
  onBackToCatalog: () => void;
  
  // Acessibilidade & Áudio
  supportsAudio?: boolean;
  isMuted?: boolean;
  onToggleMute?: () => void;
  reducedMotion?: boolean;
  onToggleReducedMotion?: () => void;
  hideTimer?: boolean;
  onToggleHideTimer?: () => void;
  supportsTimerHiding?: boolean;
  badgeLabel?: string;

  // Controles
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onEndExperience: () => void;
  onSwitchPractice?: () => void;
  switchLabel?: string;
  startLabel?: string;
  resumeLabel?: string;
  isPaused?: boolean;

  // Conteúdo do Palco
  children: React.ReactNode;
  secondaryPanel?: React.ReactNode;

  // Fechamento / Conclusão
  currentUser: UserProfile;
  practiceTitle?: string;
  activeDurationSeconds?: number;
  endedBy?: 'timer' | 'user' | 'switch';
  onSaveToHistory?: (reflection: string) => Promise<{ success: boolean; error?: string }>;
  onBackToPortal?: () => void;
  onContinueAWhile?: () => void;
  canContinue?: boolean;
}

export const InteractiveResourceShell: React.FC<InteractiveResourceShellProps> = ({
  title,
  categoryLabel,
  state,
  errorMessage,
  onRetry,
  onBackToCatalog,

  supportsAudio,
  isMuted,
  onToggleMute,
  reducedMotion,
  onToggleReducedMotion,
  hideTimer,
  onToggleHideTimer,
  supportsTimerHiding,
  badgeLabel,

  onStart,
  onPause,
  onResume,
  onEndExperience,
  onSwitchPractice,
  switchLabel,
  startLabel,
  resumeLabel,
  isPaused,

  children,
  secondaryPanel,

  currentUser,
  practiceTitle,
  activeDurationSeconds = 0,
  endedBy = 'user',
  onSaveToHistory,
  onBackToPortal,
  onContinueAWhile,
  canContinue,
}) => {
  return (
    <div 
      id="interactive-resource-shell"
      className={`min-h-[100dvh] w-full flex flex-col justify-between bg-[#FDFAF4] text-[#262B22] selection:bg-[#F1E9DB] ${
        reducedMotion ? 'reduced-motion-active' : ''
      }`}
    >
      {/* 1. Header do recurso */}
      <ResourceHeader
        title={title}
        categoryLabel={categoryLabel}
        state={state}
        onBackToCatalog={onBackToCatalog}
        isMuted={isMuted}
        onToggleMute={onToggleMute}
        supportsAudio={supportsAudio}
        reducedMotion={reducedMotion}
        onToggleReducedMotion={onToggleReducedMotion}
        hideTimer={hideTimer}
        onToggleHideTimer={onToggleHideTimer}
        supportsTimerHiding={supportsTimerHiding}
        badgeLabel={badgeLabel}
      />

      {/* 2. Palco ou Tela de Conclusão */}
      <div className="flex-1 flex flex-col justify-center">
        {state === 'completed' && onSaveToHistory && onBackToPortal ? (
          <div className="py-6 px-4">
            <ResourceCompletion
              practiceTitle={practiceTitle || title}
              activeDurationSeconds={activeDurationSeconds}
              endedBy={endedBy}
              currentUser={currentUser}
              onSaveToHistory={onSaveToHistory}
              onBackToPortal={onBackToPortal}
              onContinueAWhile={onContinueAWhile}
              canContinue={canContinue}
            />
          </div>
        ) : (
          <ResourceStage
            state={state}
            errorMessage={errorMessage}
            onRetry={onRetry}
            secondaryPanel={secondaryPanel}
          >
            {children}
          </ResourceStage>
        )}
      </div>

      {/* 3. Controles inferiores (quando não estiver em estado completado ou erro) */}
      {state !== 'completed' && state !== 'error' && (
        <ResourceControls
          state={state}
          onStart={onStart}
          onPause={onPause}
          onResume={onResume}
          onEndExperience={onEndExperience}
          onSwitchPractice={onSwitchPractice}
          switchLabel={switchLabel}
          startLabel={startLabel}
          resumeLabel={resumeLabel}
          isPaused={isPaused}
        />
      )}
    </div>
  );
};
