/**
 * @license
 * Instituto Figura Viva - Rio dos Pensamentos (Registro Confluência)
 * Recurso interativo com fluxo reativo em tempo real para observação e soltura de pensamentos.
 */

import React, { useState, useEffect, useRef } from 'react';
import { InteractiveResourceShell } from '../shell/InteractiveResourceShell';
import { RiverStreamEngine, RiverStreamState } from './RiverStreamEngine';
import { RiverVisualStage } from './RiverVisualStage';
import { RiverTextStage } from './RiverTextStage';
import { ResourceState, RiverSpeed, UserProfile } from '../../../types';
import { supabaseClient } from '../../../services/supabase/client';
import { webAudio } from '../../../services/audio/webAudioService';
import { Send, Droplets, SlidersHorizontal, List, Eye, Save, Sparkles } from 'lucide-react';

interface RiverExperienceProps {
  onBackToPortal: () => void;
  currentUser: UserProfile;
}

export const RiverExperience: React.FC<RiverExperienceProps> = ({
  onBackToPortal,
  currentUser,
}) => {
  const [engine] = useState<RiverStreamEngine>(() => new RiverStreamEngine());
  const [streamState, setStreamState] = useState<RiverStreamState>(() => engine.getState());
  const [inputText, setInputText] = useState<string>('');
  const [viewMode, setViewMode] = useState<'visual' | 'text'>('visual');
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [experiencePhase, setExperiencePhase] = useState<'active' | 'completed'>('active');

  // Tempo de prática no rio
  const startTimeRef = useRef<number>(Date.now());
  const [activeDuration, setActiveDuration] = useState<number>(0);

  // Inicia e subscreve no fluxo reativo
  useEffect(() => {
    engine.start();
    const unsubscribe = engine.subscribe((newState) => {
      setStreamState(newState);
    });

    supabaseClient.logTelemetry('resource_started', 'rio-dos-pensamentos');

    return () => {
      unsubscribe();
      engine.destroy();
      webAudio.stop();
    };
  }, [engine]);

  // Se reducedMotion for ativado, podemos alternar para text ou reduzir velocidade
  useEffect(() => {
    if (reducedMotion) {
      engine.setSpeed('still');
    } else {
      engine.setSpeed('serene');
    }
  }, [reducedMotion, engine]);

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    engine.depositThought(inputText.trim());
    setInputText('');
  };

  const handleEnd = () => {
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    setActiveDuration(elapsedSeconds);
    engine.pause();
    webAudio.stop();
    supabaseClient.logTelemetry('resource_completed', 'rio-dos-pensamentos', elapsedSeconds);
    setExperiencePhase('completed');
  };

  const handleSaveToHistory = async (reflectionText: string) => {
    const result = await supabaseClient.saveRiverReflection({
      text: reflectionText || 'Sessão no Rio dos Pensamentos.',
      durationSeconds: activeDuration,
      thoughtsReleasedCount: streamState.totalReleasedCount,
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
    if (!nextMute && experiencePhase === 'active') {
      webAudio.playGentleStream();
    } else {
      webAudio.stop();
    }
  };

  const resourceState: ResourceState = experiencePhase === 'completed' ? 'completed' : 'active';

  return (
    <InteractiveResourceShell
      title="Rio dos Pensamentos"
      categoryLabel="Atenção & Fluxo Reativo"
      state={resourceState}
      onBackToCatalog={onBackToPortal}
      currentUser={currentUser}
      practiceTitle="Rio dos Pensamentos"
      activeDurationSeconds={activeDuration}
      endedBy="user"
      onSaveToHistory={handleSaveToHistory}
      onBackToPortal={onBackToPortal}

      // Áudio e Acessibilidade
      supportsAudio={true}
      isMuted={isMuted}
      onToggleMute={handleToggleMute}
      reducedMotion={reducedMotion}
      onToggleReducedMotion={() => setReducedMotion(!reducedMotion)}
      badgeLabel="Fluxo em tempo real"

      // Controles
      onEndExperience={handleEnd}
    >
      <div id="river-experience-content" className="w-full max-w-3xl mx-auto flex flex-col items-center">
        {/* Título editorial da experiência */}
        <div className="text-center mb-4 max-w-xl mx-auto">
          <div className="w-12 h-1 confluencia-accent-line mx-auto mb-3" aria-hidden="true" />
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#005A1F]">
            Observe o fluxo dos pensamentos sem reter
          </h2>
          <p className="text-xs sm:text-sm text-[#4B4B49] mt-1 font-sans">
            Coloque uma palavra ou sensação sobre as águas. Observe-a seguir o curso natural do rio.
          </p>
        </div>

        {/* Barra superior de controles da correnteza e visualização */}
        <div className="w-full flex flex-wrap items-center justify-between gap-2.5 mb-3 px-1 text-xs">
          {/* Seletor de velocidade da correnteza */}
          <div className="flex items-center gap-1.5 bg-[#F1E9DB] p-1 rounded-xl border border-[#D8CFBE]">
            <Droplets className="w-3.5 h-3.5 text-[#07614C]" strokeWidth={2} />
            <span className="text-[#4B4B49] font-medium pr-1">Correnteza:</span>
            <button
              type="button"
              onClick={() => engine.setSpeed('still')}
              className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                streamState.speed === 'still' ? 'bg-[#005A1F] text-[#FDFAF4]' : 'text-[#4B4B49] hover:bg-[#FDFAF4]'
              }`}
            >
              Repouso
            </button>
            <button
              type="button"
              onClick={() => engine.setSpeed('calm')}
              className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                streamState.speed === 'calm' ? 'bg-[#005A1F] text-[#FDFAF4]' : 'text-[#4B4B49] hover:bg-[#FDFAF4]'
              }`}
            >
              Suave
            </button>
            <button
              type="button"
              onClick={() => engine.setSpeed('serene')}
              className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                streamState.speed === 'serene' ? 'bg-[#005A1F] text-[#FDFAF4]' : 'text-[#4B4B49] hover:bg-[#FDFAF4]'
              }`}
            >
              Serena
            </button>
          </div>

          {/* Alternância Visual vs Texto (Acessibilidade) */}
          <div className="flex items-center gap-1 bg-[#F1E9DB] p-1 rounded-xl border border-[#D8CFBE]">
            <button
              type="button"
              onClick={() => setViewMode('visual')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors ${
                viewMode === 'visual' ? 'bg-[#005A1F] text-[#FDFAF4]' : 'text-[#4B4B49] hover:bg-[#FDFAF4]'
              }`}
              title="Visual do Rio com folhas flutuantes"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Rio</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('text')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors ${
                viewMode === 'text' ? 'bg-[#005A1F] text-[#FDFAF4]' : 'text-[#4B4B49] hover:bg-[#FDFAF4]'
              }`}
              title="Visão textual sem movimento contínuo"
            >
              <List className="w-3.5 h-3.5" />
              <span>Texto</span>
            </button>
          </div>
        </div>

        {/* Palco do Rio (Visual ou Texto) */}
        <div className="w-full mb-4">
          {viewMode === 'visual' ? (
            <RiverVisualStage
              thoughts={streamState.thoughts}
              ripples={streamState.ripples}
              onDissolveThought={(id) => engine.dissolveThought(id)}
              reducedMotion={reducedMotion}
            />
          ) : (
            <RiverTextStage
              thoughts={streamState.thoughts}
              onDissolveThought={(id) => engine.dissolveThought(id)}
              totalReleasedCount={streamState.totalReleasedCount}
            />
          )}
        </div>

        {/* Formulário de depósito de pensamentos */}
        <form onSubmit={handleDeposit} className="w-full max-w-xl mx-auto flex gap-2">
          <label htmlFor="thought-input" className="sr-only">
            Pensamento ou sensação a soltar no rio
          </label>
          <input
            id="thought-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Qual pensamento ou sensação deseja colocar nas águas agora?"
            maxLength={120}
            className="flex-1 px-4 py-3 rounded-2xl bg-[#FDFAF4] border-2 border-[#07614C] text-sm text-[#262B22] placeholder-[#6B6B63] focus:outline-none focus:ring-2 focus:ring-[#005A1F] min-h-[44px]"
          />
          <button
            id="btn-deposit-thought"
            type="submit"
            disabled={!inputText.trim()}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C] disabled:opacity-40 disabled:pointer-events-none transition-colors font-medium text-sm min-h-[44px] shrink-0"
          >
            <Send className="w-4 h-4 text-inherit" strokeWidth={2} />
            <span className="hidden sm:inline">Depositar</span>
          </button>
        </form>

        <p className="text-xs text-[#6B6B63] mt-2 text-center">
          Dica: Você pode tocar em qualquer pensamento para dissolvê-lo antes da foz.
        </p>
      </div>
    </InteractiveResourceShell>
  );
};
