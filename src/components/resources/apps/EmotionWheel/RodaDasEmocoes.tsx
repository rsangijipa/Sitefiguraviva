import React, { useState, useEffect, useRef, useTransition } from 'react';
import {
  InteractiveResourceShell,
} from '../../shell/InteractiveResourceShell';
import { EmotionWheelSvg } from './EmotionWheelSvg';
import { AccessibleEmotionList } from './AccessibleEmotionList';
import { ExplorationPanel } from './ExplorationPanel';
import { ResourceCompletion } from './ResourceCompletion';
import { EMOTION_FAMILIES } from '../../../data/emotionsData';
import { ShellState } from '../../../types';
import { SupabasePersistenceService } from '../../../services/supabaseService';
import {
  List,
  Compass,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

interface RodaDasEmocoesProps {
  onBackToCatalog: () => void;
  onOpenDiaryModal: () => void;
}

export const RodaDasEmocoes: React.FC<RodaDasEmocoesProps> = ({
  onBackToCatalog,
  onOpenDiaryModal,
}) => {
  const [, startTransition] = useTransition();

  // Estados do Shell
  const [shellState, setShellState] = useState<ShellState>('loading');
  const [liveMessage, setLiveMessage] = useState<string>('Carregando a Roda das Emoções.');

  // Seleções do usuário
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | undefined>();
  const [selectedSecondaryId, setSelectedSecondaryId] = useState<string | undefined>();
  const [selectedNuanceId, setSelectedNuanceId] = useState<string | undefined>();
  const [customEmotion, setCustomEmotion] = useState<string>('');
  const [bodyAnchor, setBodyAnchor] = useState<string>('');
  const [intensity, setIntensity] = useState<number>(2);
  const [reflection, setReflection] = useState<string>('');
  const [isSavedToDiary, setIsSavedToDiary] = useState<boolean>(false);

  // Modo de visualização: Roda SVG ou Lista Acessível
  const [viewMode, setViewMode] = useState<'wheel' | 'list'>('wheel');

  // Sessão e Telemetria
  const [sessionId, setSessionId] = useState<string>('');
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Inicialização da sessão
  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        setShellState('ready');
        setLiveMessage('Roda das Emoções pronta para exploração.');
      });
    }, 450);

    const session = SupabasePersistenceService.startSession('roda-das-emocoes', {
      viewMode: 'wheel',
    });
    setSessionId(session.id);

    // Timer de duração da experiência
    timerRef.current = setInterval(() => {
      setDurationSeconds((prev) => prev + 1);
    }, 1000);

    // Pausar se a aba for ocultada
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setShellState((prev) => (prev === 'active' ? 'paused' : prev));
      } else {
        setShellState((prev) => (prev === 'paused' ? 'active' : prev));
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(timer);
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Família, secundária e nuance ativas
  const activeFamily = EMOTION_FAMILIES.find((f) => f.id === selectedFamilyId);
  const activeSecondary = activeFamily?.secondaries.find((s) => s.id === selectedSecondaryId);
  const activeNuance = activeSecondary?.nuances.find((n) => n.id === selectedNuanceId);

  // Manipuladores de Seleção
  const handleSelectFamily = (familyId: string) => {
    setSelectedFamilyId(familyId);
    setSelectedSecondaryId(undefined);
    setSelectedNuanceId(undefined);
    setShellState('active');

    const fam = EMOTION_FAMILIES.find((f) => f.id === familyId);
    setLiveMessage(`Família selecionada: ${fam?.name}. ${fam?.description}`);
  };

  const handleSelectSecondary = (secondaryId: string, familyId: string) => {
    setSelectedFamilyId(familyId);
    setSelectedSecondaryId(secondaryId);
    setSelectedNuanceId(undefined);
    setShellState('active');

    const fam = EMOTION_FAMILIES.find((f) => f.id === familyId);
    const sec = fam?.secondaries.find((s) => s.id === secondaryId);
    setLiveMessage(`Emoção relacionada selecionada: ${sec?.name} na família ${fam?.name}.`);
  };

  const handleSelectNuance = (nuanceId: string, secondaryId: string, familyId: string) => {
    setSelectedFamilyId(familyId);
    setSelectedSecondaryId(secondaryId);
    setSelectedNuanceId(nuanceId);
    setShellState('active');

    const fam = EMOTION_FAMILIES.find((f) => f.id === familyId);
    const sec = fam?.secondaries.find((s) => s.id === secondaryId);
    const nu = sec?.nuances.find((n) => n.id === nuanceId);
    setLiveMessage(`Nuance selecionada: ${nu?.name}. Descrição: ${nu?.phenomenologicalDescription}`);
  };

  const handleResetSelection = () => {
    setSelectedFamilyId(undefined);
    setSelectedSecondaryId(undefined);
    setSelectedNuanceId(undefined);
    setCustomEmotion('');
    setBodyAnchor('');
    setIntensity(2);
    setReflection('');
    setIsSavedToDiary(false);
    setLiveMessage('Seleção reiniciada. Centro da roda aberto.');
  };

  // Salvar no diário pessoal (com consentimento explícito)
  const handleSaveToDiary = () => {
    const payload = {
      emotion_family: activeFamily?.name,
      emotion_label: activeNuance?.name || activeSecondary?.name || activeFamily?.name,
      nuance_label: activeNuance?.name,
      custom_label: customEmotion.trim() || undefined,
      intensity,
      body_note: bodyAnchor || undefined,
      reflection: reflection.trim() || undefined,
      phenomenological_description:
        activeNuance?.phenomenologicalDescription || activeFamily?.description,
    };

    SupabasePersistenceService.saveDiaryEntry('roda-das-emocoes', sessionId, payload);
    setIsSavedToDiary(true);
    setLiveMessage('Registro guardado com sucesso no seu Diário de Percepções.');
  };

  // Encerrar experiência (sem julgamento de desempenho)
  const handleCloseExperience = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    SupabasePersistenceService.completeSession(sessionId, durationSeconds, {
      family: activeFamily?.name,
      savedToDiary: isSavedToDiary,
    });
    setShellState('completed');
    setLiveMessage('Experiência encerrada com respeito ao seu tempo.');
  };

  // Retomar exploração
  const handleResumeExperience = () => {
    setShellState('active');
    // Reinicia o timer
    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  // Barra de Controles Inferiores do Microapp
  const controlsBar = (
    <div className="w-full flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
      <div className="flex items-center gap-2">
        {/* Alternância Roda SVG vs Lista Acessível */}
        <button
          id="btn-toggle-view-mode"
          type="button"
          onClick={() => setViewMode(viewMode === 'wheel' ? 'list' : 'wheel')}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-[#D8CFBE] text-[#262B22] hover:bg-[#F1E9DB] transition-colors min-h-[44px]"
        >
          {viewMode === 'wheel' ? (
            <>
              <List className="w-4 h-4 text-[#005A1F] stroke-[2]" />
              <span>Ver como lista acessível</span>
            </>
          ) : (
            <>
              <Compass className="w-4 h-4 text-[#005A1F] stroke-[2]" />
              <span>Ver roda circular</span>
            </>
          )}
        </button>

        {/* Reiniciar */}
        <button
          id="btn-controls-reset"
          type="button"
          onClick={handleResetSelection}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-[#D8CFBE] text-[#6B6B63] hover:text-[#262B22] hover:bg-[#F1E9DB] transition-colors min-h-[44px]"
        >
          <RotateCcw className="w-4 h-4 stroke-[2]" />
          <span className="hidden sm:inline">Reiniciar roda</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          id="btn-open-diary-modal"
          type="button"
          onClick={onOpenDiaryModal}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[#005A1F] hover:bg-[#F1E9DB] font-medium transition-colors min-h-[44px]"
        >
          <BookOpen className="w-4 h-4 text-[#005A1F] stroke-[2]" />
          <span>Meu Diário de Percepções</span>
        </button>
      </div>
    </div>
  );

  return (
    <InteractiveResourceShell
      title="Roda das Emoções"
      category="PERCEBER"
      subtitle="Exploração fenomenológica para ampliar vocabulário afetivo e presença corporal"
      state={shellState}
      onBack={onBackToCatalog}
      onCloseExperience={handleCloseExperience}
      onRetry={() => setShellState('ready')}
      controls={shellState !== 'completed' ? controlsBar : undefined}
      liveMessage={liveMessage}
    >
      {shellState === 'completed' ? (
        <ResourceCompletion
          durationSeconds={durationSeconds}
          activeFamily={activeFamily}
          activeSecondary={activeSecondary}
          activeNuance={activeNuance}
          customEmotion={customEmotion}
          bodyAnchor={bodyAnchor}
          intensity={intensity}
          reflection={reflection}
          isSavedToDiary={isSavedToDiary}
          onSaveToDiary={handleSaveToDiary}
          onResume={handleResumeExperience}
          onBackToCatalog={onBackToCatalog}
          onOpenDiaryModal={onOpenDiaryModal}
        />
      ) : (
        <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch justify-center">
          {/* Lado Esquerdo / Central: Visualizador (Roda SVG ou Lista Acessível) */}
          <div className="w-full lg:w-7/12 flex flex-col items-center justify-center relative">
            {/* Orientação discreta de navegação */}
            <div className="w-full text-center lg:text-left mb-2">
              <span className="text-xs font-semibold text-[#005A1F] uppercase tracking-wider">
                Camadas Concêntricas: Família → Relações → Nuances
              </span>
            </div>

            {viewMode === 'wheel' ? (
              <div className="w-full flex items-center justify-center bg-[#FDFAF4] rounded-3xl border-2 border-[#F1E9DB] p-2">
                <EmotionWheelSvg
                  selectedFamilyId={selectedFamilyId}
                  selectedSecondaryId={selectedSecondaryId}
                  selectedNuanceId={selectedNuanceId}
                  onSelectFamily={handleSelectFamily}
                  onSelectSecondary={handleSelectSecondary}
                  onSelectNuance={handleSelectNuance}
                  onReset={handleResetSelection}
                />
              </div>
            ) : (
              <AccessibleEmotionList
                selectedFamilyId={selectedFamilyId}
                selectedSecondaryId={selectedSecondaryId}
                selectedNuanceId={selectedNuanceId}
                onSelectFamily={handleSelectFamily}
                onSelectSecondary={handleSelectSecondary}
                onSelectNuance={handleSelectNuance}
              />
            )}
          </div>

          {/* Lado Direito: Painel de Exploração Fenomenológica */}
          <div className="w-full lg:w-5/12 flex flex-col">
            <ExplorationPanel
              activeFamily={activeFamily}
              activeSecondary={activeSecondary}
              activeNuance={activeNuance}
              customEmotion={customEmotion}
              onCustomEmotionChange={setCustomEmotion}
              bodyAnchor={bodyAnchor}
              onBodyAnchorChange={setBodyAnchor}
              intensity={intensity}
              onIntensityChange={setIntensity}
              reflection={reflection}
              onReflectionChange={setReflection}
              onSaveToDiary={handleSaveToDiary}
              onResetSelection={handleResetSelection}
              isSavedToDiary={isSavedToDiary}
            />
          </div>
        </div>
      )}
    </InteractiveResourceShell>
  );
};
