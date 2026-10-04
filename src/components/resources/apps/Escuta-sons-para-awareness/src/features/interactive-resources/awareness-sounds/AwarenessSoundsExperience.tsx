/**
 * AwarenessSoundsExperience - Orquestrador Principal do Microapp
 * Instituto Figura Viva - Registro Confluência
 *
 * Conecta:
 * - InteractiveResourceShell
 * - ListeningSetup
 * - SoundLibrary
 * - SoundStage
 * - PerceptionForm
 * - AudioControls
 * - ListeningSummary
 * - Persistência Supabase / Repositório RLS
 */

import React, { useState, useEffect, useRef } from 'react';
import { InteractiveResourceShell, ShellState } from './components/InteractiveResourceShell';
import { ListeningSetup } from './components/ListeningSetup';
import { SoundLibrary } from './components/SoundLibrary';
import { SoundStage } from './components/SoundStage';
import { PerceptionForm } from './components/PerceptionForm';
import { AudioControls } from './components/AudioControls';
import { ListeningSummary } from './components/ListeningSummary';
import { useAudioSession } from './hooks/useAudioSession';
import { GUIDED_SCENES, SOUND_LIBRARY_MANIFEST } from './audio/assetLoader';
import { globalRepository } from './repository';
import {
  ResourceMode,
  SceneObservation,
  SoundId,
  SoundPosition,
} from './types';

interface AwarenessSoundsExperienceProps {
  onBackToCatalog: () => void;
}

export const AwarenessSoundsExperience: React.FC<AwarenessSoundsExperienceProps> = ({
  onBackToCatalog,
}) => {
  const {
    engineStatus,
    prefersReducedMotion,
    activateAudio,
    playSound,
    pauseSound,
    resumeSound,
    updatePosition,
    setVolume,
    toggleMute,
    stopAndReset,
  } = useAudioSession();

  // Estados principais
  const [shellState, setShellState] = useState<ShellState>('ready');
  const [hasStarted, setHasStarted] = useState(false);
  const [mode, setMode] = useState<ResourceMode>('guided');
  const [activeSoundId, setActiveSoundId] = useState<SoundId>('agua-corrente');
  const [currentPosition, setCurrentPosition] = useState<SoundPosition>({
    x: -0.6,
    y: 0.2,
    distanceTier: 'medio',
  });

  // Modo Guiado
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isSceneRevealed, setIsSceneRevealed] = useState(false);
  const [currentObservation, setCurrentObservation] = useState<SceneObservation>({
    soundId: GUIDED_SCENES[0].soundId,
    soundVersion: '1.2.0',
    configuredPosition: GUIDED_SCENES[0].configuredPosition,
    perceivedDirection: null,
    perceivedDistance: null,
    qualities: [],
    customQuality: null,
  });
  const [completedObservations, setCompletedObservations] = useState<SceneObservation[]>([]);

  // Cronômetro e Sessão
  const [durationSeconds, setDurationSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string>('sess_' + crypto.randomUUID());
  const clientRequestIdRef = useRef<string>(crypto.randomUUID());

  // Salvamento
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');

  // Contador de tempo quando a experiência está ativa
  useEffect(() => {
    if (hasStarted && shellState !== 'completed') {
      timerRef.current = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasStarted, shellState]);

  // Iniciar Experiência
  const handleStartExperience = async (chosenMode: ResourceMode, useAudio: boolean) => {
    setMode(chosenMode);
    setHasStarted(true);
    setShellState('active');
    setLiveAnnouncement(`Experiência iniciada no modo ${chosenMode}.`);

    // Telemetria não-invasiva
    globalRepository.trackTelemetry({
      eventName: 'resource_started',
      resourceSlug: 'sons-para-awareness',
      mode: chosenMode,
      timestamp: new Date().toISOString(),
    });

    if (chosenMode === 'guided') {
      const firstScene = GUIDED_SCENES[0];
      setActiveSoundId(firstScene.soundId);
      setCurrentPosition(firstScene.configuredPosition);
      setIsSceneRevealed(false);
      setCurrentObservation({
        soundId: firstScene.soundId,
        soundVersion: '1.2.0',
        configuredPosition: firstScene.configuredPosition,
        perceivedDirection: null,
        perceivedDistance: null,
        qualities: [],
        customQuality: null,
      });

      if (useAudio) {
        await playSound(firstScene.soundId, firstScene.configuredPosition);
      }
    } else if (chosenMode === 'free') {
      const initialSound: SoundId = 'agua-corrente';
      const initialPos = SOUND_LIBRARY_MANIFEST[initialSound].defaultPosition;
      setActiveSoundId(initialSound);
      setCurrentPosition(initialPos);

      if (useAudio) {
        await playSound(initialSound, initialPos);
      }
    } else if (chosenMode === 'text') {
      // Modo puramente textual sem áudio
      const firstScene = GUIDED_SCENES[0];
      setActiveSoundId(firstScene.soundId);
      setCurrentPosition(firstScene.configuredPosition);
      setIsSceneRevealed(false);
    }
  };

  // Trocar som no modo livre
  const handleSelectSoundFreeMode = async (soundId: SoundId) => {
    setActiveSoundId(soundId);
    const newPos = SOUND_LIBRARY_MANIFEST[soundId].defaultPosition;
    setCurrentPosition(newPos);
    setLiveAnnouncement(`Elemento sonoro alterado para ${SOUND_LIBRARY_MANIFEST[soundId].title}.`);

    if (mode !== 'text') {
      await playSound(soundId, newPos);
    }
  };

  // Atualizar posição espacial no palco
  const handlePositionChange = (pos: SoundPosition) => {
    setCurrentPosition(pos);
    updatePosition(pos);
  };

  // Controle de Play / Pausa
  const handleTogglePlay = () => {
    if (engineStatus.isPlaying) {
      pauseSound();
      setShellState('paused');
      setLiveAnnouncement('Áudio pausado.');
    } else {
      if (engineStatus.activeSoundId) {
        resumeSound();
      } else {
        playSound(activeSoundId, currentPosition);
      }
      setShellState('active');
      setLiveAnnouncement('Reprodução retomada.');
    }
  };

  // Revelação de Cena no Modo Guiado
  const handleRevealScene = () => {
    setIsSceneRevealed(true);
    setLiveAnnouncement('Posição configurada revelada no palco.');
  };

  // Avançar para próxima cena guiada
  const handleNextScene = async () => {
    // Guarda a observação atual
    const recorded: SceneObservation = {
      ...currentObservation,
      revealedAt: new Date().toISOString(),
    };
    const updatedObservations = [...completedObservations, recorded];
    setCompletedObservations(updatedObservations);

    if (currentSceneIndex < GUIDED_SCENES.length - 1) {
      const nextIndex = currentSceneIndex + 1;
      const nextScene = GUIDED_SCENES[nextIndex];
      setCurrentSceneIndex(nextIndex);
      setActiveSoundId(nextScene.soundId);
      setCurrentPosition(nextScene.configuredPosition);
      setIsSceneRevealed(false);
      setCurrentObservation({
        soundId: nextScene.soundId,
        soundVersion: '1.2.0',
        configuredPosition: nextScene.configuredPosition,
        perceivedDirection: null,
        perceivedDistance: null,
        qualities: [],
        customQuality: null,
      });

      if (mode !== 'text') {
        await playSound(nextScene.soundId, nextScene.configuredPosition);
      }
      setLiveAnnouncement(`Avançando para a cena ${nextIndex + 1}: ${nextScene.title}.`);
    } else {
      // Concluiu todas as cenas
      handleEndExperience(updatedObservations);
    }
  };

  // Encerrar experiência (voluntário a qualquer momento)
  const handleEndExperience = (obsToFinalize?: SceneObservation[]) => {
    stopAndReset();
    setShellState('completed');

    // Se no modo livre, gera uma observação da posição atual
    let finalObservations = obsToFinalize || completedObservations;
    if (mode === 'free' && finalObservations.length === 0) {
      finalObservations = [
        {
          soundId: activeSoundId,
          soundVersion: '1.2.0',
          configuredPosition: currentPosition,
          perceivedDirection: null,
          perceivedDistance: null,
          qualities: [],
          customQuality: null,
        },
      ];
      setCompletedObservations(finalObservations);
    }

    setLiveAnnouncement('Experiência encerrada. Tela de revisão e reflexão aberta.');

    globalRepository.trackTelemetry({
      eventName: 'resource_completed',
      resourceSlug: 'sons-para-awareness',
      mode,
      timestamp: new Date().toISOString(),
    });
  };

  // Salvar no histórico privado do Supabase
  const handleSaveToHistory = async (reflection: string | null): Promise<boolean> => {
    setIsSaving(true);
    try {
      await globalRepository.saveEntry({
        resourceSlug: 'sons-para-awareness',
        sessionId: sessionIdRef.current,
        clientRequestId: clientRequestIdRef.current,
        schemaVersion: 1,
        contentVersion: '1.2.0',
        mode,
        durationSeconds,
        observations: completedObservations,
        personalReflection: reflection,
        isPrivate: true,
      });

      setSaveSuccess(true);
      setLiveAnnouncement('Registro pessoal salvo no seu histórico privado.');
      return true;
    } catch (e) {
      console.error('Falha ao salvar:', e);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Exportar dados em JSON
  const handleExportData = async () => {
    const jsonString = await globalRepository.exportStudentData();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `figura-viva-sons-awareness-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setLiveAnnouncement('Arquivo JSON de registros exportado.');
  };

  // Reiniciar
  const handleRestart = () => {
    stopAndReset();
    setHasStarted(false);
    setShellState('ready');
    setCurrentSceneIndex(0);
    setCompletedObservations([]);
    setDurationSeconds(0);
    setSaveSuccess(false);
    sessionIdRef.current = 'sess_' + crypto.randomUUID();
    clientRequestIdRef.current = crypto.randomUUID();
  };

  return (
    <InteractiveResourceShell
      state={shellState}
      mode={mode}
      title="Sons para Awareness"
      subtitle="Perceba de onde vem um som e como ele se apresenta."
      onBackToCatalog={onBackToCatalog}
      onEndExperience={() => handleEndExperience()}
      onToggleAudioMute={toggleMute}
      isMuted={engineStatus.isMuted}
      audioActive={engineStatus.active}
      announcement={liveAnnouncement}
      onRetry={() => playSound(activeSoundId, currentPosition)}
    >
      {/* 1. Tela de Preparação (Antes de começar) */}
      {!hasStarted && shellState !== 'completed' && (
        <ListeningSetup
          onStartExperience={handleStartExperience}
          audioEngineType={engineStatus.type}
        />
      )}

      {/* 2. Área de Interação Ativa */}
      {hasStarted && shellState !== 'completed' && (
        <div id="interactive-workspace" className="flex-1 flex flex-col space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Palco Circular: 60% no desktop (coluna 7 de 12) */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 sm:p-6 rounded-3xl bg-[#FDFAF4] border-2 border-[#D8CFBE]">
              <SoundStage
                position={currentPosition}
                onPositionChange={handlePositionChange}
                activeSoundId={activeSoundId}
                isPlaying={engineStatus.isPlaying}
                isGuidedMode={mode === 'guided'}
                isRevealed={isSceneRevealed}
                reducedMotion={prefersReducedMotion}
                disabled={mode === 'text'}
              />
            </div>

            {/* Painel Contextual Secundário: 40% no desktop (coluna 5 de 12) */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
              {mode === 'guided' || mode === 'text' ? (
                <div className="p-4 sm:p-5 rounded-3xl bg-[#FDFAF4] border-2 border-[#D8CFBE]">
                  <PerceptionForm
                    scene={GUIDED_SCENES[currentSceneIndex]}
                    observation={currentObservation}
                    onUpdateObservation={(upd) =>
                      setCurrentObservation((prev) => ({ ...prev, ...upd }))
                    }
                    isRevealed={isSceneRevealed}
                    onRevealScene={handleRevealScene}
                    onNextScene={handleNextScene}
                    isLastScene={currentSceneIndex === GUIDED_SCENES.length - 1}
                    isTextMode={mode === 'text'}
                  />
                </div>
              ) : (
                <div className="p-4 sm:p-5 rounded-3xl bg-[#FDFAF4] border-2 border-[#D8CFBE]">
                  <SoundLibrary
                    selectedSoundId={activeSoundId}
                    onSelectSound={handleSelectSoundFreeMode}
                    isPlaying={engineStatus.isPlaying}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Controles de Áudio no Rodapé (quando aplicável) */}
          {mode !== 'text' && (
            <div className="mt-auto">
              <AudioControls
                isPlaying={engineStatus.isPlaying}
                isMuted={engineStatus.isMuted}
                volume={engineStatus.volume}
                onTogglePlay={handleTogglePlay}
                onToggleMute={toggleMute}
                onVolumeChange={setVolume}
                onResetPosition={() =>
                  handlePositionChange(
                    SOUND_LIBRARY_MANIFEST[activeSoundId].defaultPosition
                  )
                }
                spatialMode={engineStatus.type}
              />
            </div>
          )}
        </div>
      )}

      {/* 3. Tela de Encerramento e Revisão */}
      {shellState === 'completed' && (
        <ListeningSummary
          durationSeconds={durationSeconds}
          mode={mode}
          observations={completedObservations}
          onSaveToHistory={handleSaveToHistory}
          onExitWithoutSaving={onBackToCatalog}
          onExportData={handleExportData}
          onRestart={handleRestart}
          isSaving={isSaving}
          saveSuccess={saveSuccess}
        />
      )}
    </InteractiveResourceShell>
  );
};
