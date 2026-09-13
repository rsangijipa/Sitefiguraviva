/**
 * Experiência Completa: Rio dos Pensamentos
 * Registro CONFLUÊNCIA - Instituto Figura Viva
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { InteractiveResourceShell } from '../InteractiveResourceShell';
import { RiverCanvas } from './components/RiverCanvas';
import { RiverComposer } from './components/RiverComposer';
import { RiverControls } from './components/RiverControls';
import { ActiveLeavesList } from './components/ActiveLeavesList';
import { RiverCompletion } from './components/RiverCompletion';
import { RiverSceneEngine } from './engine/riverScene';
import { riverAudio } from './engine/audioAmbience';
import { 
  ResourceState, 
  RiverMode, 
  LeafThought, 
  UserProfile, 
  ResourceContentVersion 
} from '../../../types';
import { 
  saveRiverSession, 
  getPublishedResourceContent, 
  recordTelemetry 
} from './repository';
import { Play, Sparkles } from 'lucide-react';

interface ThoughtRiverExperienceProps {
  currentUser: UserProfile;
  onNavigateToCatalog: () => void;
  onNavigateToHistory: () => void;
}

export const ThoughtRiverExperience: React.FC<ThoughtRiverExperienceProps> = ({
  currentUser,
  onNavigateToCatalog,
  onNavigateToHistory,
}) => {
  const [resourceState, setResourceState] = useState<ResourceState>('loading');
  const [contentConfig, setContentConfig] = useState<ResourceContentVersion | null>(null);
  const [activeLeaves, setActiveLeaves] = useState<LeafThought[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [ambience, setAmbience] = useState<number>(0); // 0: Manhã, 1: Tarde Solar, 2: Crepúsculo
  const [speed, setSpeed] = useState<number>(1.0);
  const [showGuidelines, setShowGuidelines] = useState<boolean>(false);
  
  // Modos de tempo e cronômetro
  const [mode, setMode] = useState<RiverMode>('free');
  const [plannedDuration, setPlannedDuration] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [clientRequestId] = useState(() => 'req-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now());

  // Motor da cena do rio (fora do ciclo de render do React)
  const scene = useMemo(() => new RiverSceneEngine(8), []);
  const timerIntervalRef = useRef<number | null>(null);

  // Inicialização e carregamento editorial
  useEffect(() => {
    let mounted = true;
    const loadContent = async () => {
      try {
        const config = await getPublishedResourceContent();
        if (mounted) {
          setContentConfig(config);
          scene.setMaxLeaves(config.max_active_leaves || 8);
          // O rio abre diretamente ativo, fluido e acolhedor
          setResourceState('active');

          // Adiciona suavemente uma primeira folha de acolhimento se o rio estiver vazio
          setTimeout(() => {
            if (mounted && scene.getLeaves().length === 0) {
              const res = scene.addLeaf('O pensamento vem, o pensamento passa.');
              if (res.success) {
                setActiveLeaves(scene.getLeaves());
              }
            }
          }, 400);

          recordTelemetry({
            event_name: 'resource_opened',
            resource_key: 'rio-dos-pensamentos',
            content_version: config.version,
          });
        }
      } catch {
        if (mounted) {
          setResourceState('error');
        }
      }
    };

    loadContent();

    // Callback de quando a folha sai do campo de visão (cruza a borda direita)
    scene.onLeafExit(() => {
      if (mounted) {
        setActiveLeaves(scene.getLeaves());
        setAnnouncement('Uma folha seguiu o curso natural do rio e saiu do campo de visão.');
      }
    });

    return () => {
      mounted = false;
      riverAudio.stop();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [scene]);

  // Atualização de velocidade
  const handleSelectSpeed = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
    scene.setSpeedMultiplier(newSpeed);
  }, [scene]);

  // Cronômetro da prática ativa (apenas quando em andamento e não pausado)
  useEffect(() => {
    if (resourceState === 'active' && !isPaused) {
      timerIntervalRef.current = window.setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [resourceState, isPaused]);

  // Iniciar observação
  const handleStartExperience = () => {
    setResourceState('active');
    setElapsedSeconds(0);
    recordTelemetry({
      event_name: 'resource_started',
      resource_key: 'rio-dos-pensamentos',
      content_version: contentConfig?.version || 'v1.0.0',
    });
  };

  // Alternar pausa
  const handleTogglePause = useCallback(() => {
    const paused = scene.togglePause();
    setIsPaused(paused);
  }, [scene]);

  // Alternar movimento reduzido
  const handleToggleReducedMotion = useCallback(() => {
    setReducedMotion(prev => !prev);
  }, []);

  // Alternar áudio ambiente
  const handleToggleAudio = useCallback(() => {
    const active = riverAudio.toggle();
    setIsAudioActive(active);
  }, []);

  // Adicionar folha com frase
  const handleAddLeaf = useCallback((text: string) => {
    const res = scene.addLeaf(text);
    if (res.success) {
      setActiveLeaves(scene.getLeaves());
      setAnnouncement(`Uma folha com a frase foi colocada no rio.`);
    }
    return res;
  }, [scene]);

  // Remover folha manualmente
  const handleRemoveLeaf = useCallback((id: string) => {
    scene.removeLeaf(id);
    setActiveLeaves(scene.getLeaves());
    setAnnouncement('Uma folha foi retirada do rio.');
  }, [scene]);

  // Avançar folha no modo de movimento reduzido
  const handleAdvanceLeaf = useCallback((id: string) => {
    scene.removeLeaf(id);
    setActiveLeaves(scene.getLeaves());
    setAnnouncement('A folha seguiu adiante e saiu do campo de visão.');
  }, [scene]);

  // Selecionar duração planejada
  const handleSelectDuration = (duration: number | null) => {
    setPlannedDuration(duration);
    setMode(duration ? 'timed' : 'free');
  };

  // Encerrar experiência (sem julgamento de desempenho)
  const handleEndExperience = () => {
    riverAudio.stop();
    setIsAudioActive(false);
    setResourceState('completed');
    recordTelemetry({
      event_name: 'resource_completed',
      resource_key: 'rio-dos-pensamentos',
      content_version: contentConfig?.version || 'v1.0.0',
      duration_range: elapsedSeconds > 300 ? '5min+' : elapsedSeconds > 120 ? '2-5min' : '0-2min',
    });
  };

  // Salvar sessão no histórico privado
  const handleSaveSession = async (reflection: string) => {
    const res = await saveRiverSession(
      {
        user_id: currentUser.id,
        client_request_id: clientRequestId,
        resource_slug: 'rio-dos-pensamentos',
        started_at: new Date(Date.now() - elapsedSeconds * 1000).toISOString(),
        completed_at: new Date().toISOString(),
        active_duration_seconds: elapsedSeconds,
        planned_duration_seconds: plannedDuration,
        mode,
        reflection: reflection.trim() || null,
        schema_version: 1,
        content_version: contentConfig?.version || 'v1.0.0',
      },
      currentUser
    );
    return res;
  };

  return (
    <InteractiveResourceShell
      title={contentConfig?.title || 'Rio dos Pensamentos'}
      subtitle={contentConfig?.subtitle}
      category="Confluência"
      state={resourceState}
      onBackToCatalog={onNavigateToCatalog}
      onRetry={() => window.location.reload()}
      hideHeader={true}
    >
      {/* ESTADO ATIVO OU PAUSADO: O Rio Aberto em Movimento */}
      {(resourceState === 'active' || resourceState === 'paused' || resourceState === 'ready') && (
        <div className="w-full flex flex-col gap-4 sm:gap-6">
          {/* Palco do Rio (WebGL Shaders + Canvas 2D) */}
          <RiverCanvas
            scene={scene}
            isPaused={isPaused}
            reducedMotion={reducedMotion}
            activeLeaves={activeLeaves}
            onLeafRemoved={handleRemoveLeaf}
            ambience={ambience}
          />

          {/* Barra de Controles Operacionais */}
          <RiverControls
            isPaused={isPaused}
            onTogglePause={handleTogglePause}
            reducedMotion={reducedMotion}
            onToggleReducedMotion={handleToggleReducedMotion}
            isAudioActive={isAudioActive}
            onToggleAudio={handleToggleAudio}
            mode={mode}
            plannedDuration={plannedDuration}
            onSelectDuration={handleSelectDuration}
            elapsedSeconds={elapsedSeconds}
            onEndExperience={handleEndExperience}
            ambience={ambience}
            onSelectAmbience={setAmbience}
            speed={speed}
            onSelectSpeed={handleSelectSpeed}
          />

          {/* Composer de Pensamentos */}
          <RiverComposer
            onAddLeaf={handleAddLeaf}
            activeLeafCount={activeLeaves.length}
            maxLeaves={contentConfig?.max_active_leaves || 8}
            supportText={contentConfig?.support_text}
            isPaused={isPaused}
          />

          {/* Guia de Acolhimento e Princípios Confluência (Expansível) */}
          <div className="w-full rounded-[20px] border border-[#D8CFBE] bg-[#F1E9DB]/60 p-3 sm:p-4 text-left">
            <button
              type="button"
              onClick={() => setShowGuidelines(prev => !prev)}
              className="w-full flex items-center justify-between text-xs sm:text-sm font-semibold text-[#005A1F] hover:text-[#07614C] transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#96551F]" strokeWidth={2} />
                Como funciona a prática de observação do rio
              </span>
              <span className="text-xs text-[#96551F]">
                {showGuidelines ? 'Ocultar orientações' : 'Ver orientações'}
              </span>
            </button>

            {showGuidelines && (
              <div className="mt-3 pt-3 border-t border-[#D8CFBE] text-xs sm:text-sm text-[#262B22] space-y-2">
                <p>
                  Esta prática do <strong>Instituto Figura Viva</strong> convida você a observar pensamentos como folhas flutuando na correnteza:
                </p>
                <ul className="space-y-1.5 list-disc list-inside text-[#262B22]/90">
                  <li>Você não precisa esvaziar a mente nem lutar contra o que surgir.</li>
                  <li>Arraste o cursor ou toque na água para criar ondulações e alterar o fluxo das correntes.</li>
                  <li>Experimente alternar a luz entre <em>Manhã</em>, <em>Tarde Solar</em> e <em>Crepúsculo</em>.</li>
                  <li>Todas as frases que você digita são <strong>100% efêmeras</strong>, existindo apenas na memória da sua tela.</li>
                </ul>
              </div>
            )}
          </div>

          {/* Lista Acessível de Folhas (WCAG AA) */}
          <ActiveLeavesList
            leaves={activeLeaves}
            onRemoveLeaf={handleRemoveLeaf}
            onAdvanceLeaf={handleAdvanceLeaf}
            reducedMotion={reducedMotion}
            announcement={announcement}
          />
        </div>
      )}

      {/* ESTADO COMPLETED: Fechamento Acolhedor */}
      {resourceState === 'completed' && (
        <RiverCompletion
          elapsedSeconds={elapsedSeconds}
          currentUser={currentUser}
          onSaveSession={handleSaveSession}
          onExitWithoutSaving={onNavigateToCatalog}
          onReturnToCatalog={onNavigateToCatalog}
          onViewHistory={onNavigateToHistory}
        />
      )}
    </InteractiveResourceShell>
  );
};
