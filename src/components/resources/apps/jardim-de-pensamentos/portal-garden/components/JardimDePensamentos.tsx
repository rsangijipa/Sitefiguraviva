import React, { useState, useEffect, useRef } from 'react';
import {
  ThoughtLeaf,
  ThoughtAction,
  BotanicalFormType,
  MicroappState,
  UserSession,
} from '../types';
import { JardimCanvas } from './JardimCanvas';
import { InteractiveResourceShell } from './shell/InteractiveResourceShell';
import { api } from '../lib/api';
import { soundSynthesizer } from '../lib/soundSynthesizer';
import {
  Plus,
  Trash2,
  Bookmark,
  Maximize2,
  Minimize2,
  Anchor,
  Feather,
  CheckCircle2,
  Info,
  Clock,
  Sparkles,
  BookOpen,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

const BOTANICAL_TYPES: BotanicalFormType[] = [
  'folha-lanceolada',
  'ramo-confluente',
  'semente-alvorada',
  'folha-larga',
  'samambaia-flutuante',
];

interface JardimDePensamentosProps {
  onBackToResources: () => void;
  onOpenNotebook: () => void;
}

export function JardimDePensamentos({
  onBackToResources,
  onOpenNotebook,
}: JardimDePensamentosProps) {
  // Microapp lifecycle states
  const [state, setState] = useState<MicroappState>('ready');
  const [leaves, setLeaves] = useState<ThoughtLeaf[]>([]);
  const [selectedLeafId, setSelectedLeafId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [selectedFormIndex, setSelectedFormIndex] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [isMuted, setIsMuted] = useState(soundSynthesizer.getMuted());
  const [isTextAlternativeOpen, setIsTextAlternativeOpen] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Active session tracking
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null);
  const sessionStartTimeRef = useRef<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Check system prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setIsReducedMotion(true);
    }
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Initialize session and seed sample leaves for immediate engagement
  useEffect(() => {
    let timer: NodeJS.Timeout;
    async function init() {
      try {
        setState('loading');
        const session = await api.startSession('jardim-de-pensamentos', {
          entry_type: 'contemplacao_livre',
        });
        setCurrentSession(session);
        sessionStartTimeRef.current = Date.now();

        // Seed 2 initial mindful observations
        const initialLeaves: ThoughtLeaf[] = [
          {
            id: 'leaf-seed-1',
            text: 'A pressa de querer que tudo se resolva hoje.',
            action: 'deixar-aqui',
            botanicalForm: 'folha-lanceolada',
            x: 32,
            y: 42,
            rotation: -8,
            scale: 1,
            opacity: 0.9,
            hueTint: '#005A1F',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'leaf-seed-2',
            text: 'Percebo a respiração encontrando seu próprio ritmo.',
            action: 'aproximar',
            botanicalForm: 'semente-alvorada',
            x: 68,
            y: 54,
            rotation: 12,
            scale: 1.25,
            opacity: 1,
            hueTint: '#96551F',
            createdAt: new Date().toISOString(),
          },
        ];
        setLeaves(initialLeaves);
        setSelectedLeafId(initialLeaves[0].id);

        api.logTelemetry('resource_started', 'jardim-de-pensamentos');
        setState('active');
      } catch (err: any) {
        setErrorMessage(err.message || 'Erro ao inicializar o Jardim de Pensamentos');
        setState('error');
      }
    }

    init();

    // Elapsed session time counter
    timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      soundSynthesizer.dispose();
    };
  }, []);

  // Format elapsed time MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const selectedLeaf = leaves.find((l) => l.id === selectedLeafId);

  // Add new thought to the garden
  const handleAddThought = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const form = BOTANICAL_TYPES[selectedFormIndex % BOTANICAL_TYPES.length];
    // Generate organic positions across the garden (18% - 82% to keep inside bounds)
    const newLeaf: ThoughtLeaf = {
      id: `leaf_${Date.now()}`,
      text: trimmed,
      action: 'deixar-aqui',
      botanicalForm: form,
      x: 20 + Math.floor(Math.random() * 60),
      y: 28 + Math.floor(Math.random() * 45),
      rotation: -15 + Math.floor(Math.random() * 30),
      scale: 1,
      opacity: 1,
      hueTint: '#005A1F',
      createdAt: new Date().toISOString(),
      isSaved: false,
    };

    setLeaves((prev) => [...prev, newLeaf]);
    setSelectedLeafId(newLeaf.id);
    setInputText('');
    setSelectedFormIndex((prev) => (prev + 1) % BOTANICAL_TYPES.length);

    soundSynthesizer.playLeafTone('deixar-aqui');
    setFeedbackMessage('O pensamento agora repousa como forma botânica no jardim.');
    setTimeout(() => setFeedbackMessage(''), 4000);
  };

  // Desfusion actions on the selected thought:
  // "deixar aqui", "aproximar", "afastar", "guardar", "soltar"
  const handleActionChoice = async (action: ThoughtAction) => {
    if (!selectedLeafId) return;

    soundSynthesizer.playLeafTone(action);

    if (action === 'guardar') {
      const leaf = leaves.find((l) => l.id === selectedLeafId);
      if (!leaf) return;

      try {
        setFeedbackMessage('Guardando no seu caderno contemplativo...');
        const saved = await api.saveEntry(
          'jardim-de-pensamentos',
          currentSession?.id || null,
          {
            text: leaf.text,
            action: 'guardar',
            botanical_form: leaf.botanicalForm,
            notes: 'Guardado para releitura reflexiva no Portal do Aluno.',
          },
          true
        );

        setLeaves((prev) =>
          prev.map((l) => (l.id === selectedLeafId ? { ...l, action: 'guardar', isSaved: true, serverId: saved.id } : l))
        );
        setFeedbackMessage('Pensamento guardado com segurança no seu caderno pessoal.');
      } catch (err: any) {
        setFeedbackMessage('Não foi possível salvar neste momento. Ele continua no jardim.');
      }
      setTimeout(() => setFeedbackMessage(''), 4500);
      return;
    }

    if (action === 'soltar') {
      setFeedbackMessage('Deixando a forma dissolver-se com a brisa...');
      // Mark as dissolving
      setLeaves((prev) =>
        prev.map((l) => (l.id === selectedLeafId ? { ...l, action: 'soltar' } : l))
      );

      // After soft transition, remove from ephemeral garden
      setTimeout(() => {
        setLeaves((prev) => prev.filter((l) => l.id !== selectedLeafId));
        setSelectedLeafId(null);
        setFeedbackMessage('A forma se integrou suavemente ao ar.');
        setTimeout(() => setFeedbackMessage(''), 3000);
      }, 1000);
      return;
    }

    // "deixar aqui", "aproximar", "afastar"
    setLeaves((prev) =>
      prev.map((l) => (l.id === selectedLeafId ? { ...l, action } : l))
    );

    const labels: Record<string, string> = {
      'deixar-aqui': 'O pensamento repousa sereno no canteiro.',
      'aproximar': 'Aproximando a atenção para observar contornos e texturas com gentileza.',
      'afastar': 'Afastando a perspectiva: o pensamento é apenas parte da paisagem.',
    };
    setFeedbackMessage(labels[action] || '');
    setTimeout(() => setFeedbackMessage(''), 4000);
  };

  // Botão obrigatório: "Limpar tudo sem salvar"
  const handleClearEphemeral = () => {
    setLeaves([]);
    setSelectedLeafId(null);
    setFeedbackMessage('Todo o canteiro foi limpo sem nenhum registro mantido.');
    setTimeout(() => setFeedbackMessage(''), 4000);
  };

  // Botão obrigatório: "Encerrar experiência"
  const handleEndExperience = async () => {
    const duration = Math.round((Date.now() - sessionStartTimeRef.current) / 1000);
    try {
      if (currentSession) {
        await api.finishSession(currentSession.id, duration, {
          total_leaves: leaves.length,
          saved_leaves: leaves.filter((l) => l.isSaved).length,
        });
      }
      api.logTelemetry('resource_completed', 'jardim-de-pensamentos', duration);
    } catch {
      // safe fallback
    }
    setState('completed');
  };

  const handleRestartExperience = async () => {
    setState('loading');
    try {
      const session = await api.startSession('jardim-de-pensamentos', {
        repetition: true,
      });
      setCurrentSession(session);
      sessionStartTimeRef.current = Date.now();
      setElapsedSeconds(0);
      setLeaves([]);
      setSelectedLeafId(null);
      api.logTelemetry('resource_repeated', 'jardim-de-pensamentos');
      setState('active');
    } catch {
      setState('active');
    }
  };

  const handleToggleMute = () => {
    const active = soundSynthesizer.toggleMute();
    setIsMuted(!active);
  };

  const handleToggleReducedMotion = () => {
    setIsReducedMotion((prev) => !prev);
  };

  // Secondary context panel: information and mindful posture
  const secondaryContextPanel = (
    <div className="flex flex-col gap-4 text-xs">
      <div>
        <div className="flex items-center gap-1.5 text-[#96551F] font-semibold text-sm mb-1 font-serif">
          <Info className="w-4 h-4 stroke-2 text-[#96551F]" />
          <span>Postura Contemplativa</span>
        </div>
        <p className="text-[#4B4B49] leading-relaxed">
          Pensamentos são fenômenos mentais transitórios, como folhas que brotam e se dissolvem
          ao longo do rio. Não há necessidade de combatê-los nem de tomá-los como verdades absolutas.
        </p>
      </div>

      <div className="pt-3 border-t-2 border-[#D8CFBE]">
        <span className="font-semibold text-[#262B22] block mb-1">
          As 5 Escolhas de Desfusão:
        </span>
        <ul className="space-y-1.5 text-[#4B4B49]">
          <li>
            <strong className="text-[#07614C]">Deixar aqui:</strong> Permite que o pensamento exista no solo sem urgência.
          </li>
          <li>
            <strong className="text-[#005A1F]">Aproximar:</strong> Investiga sua forma e textura com acolhimento.
          </li>
          <li>
            <strong className="text-[#6B6B63]">Afastar:</strong> Amplia o campo visual, lembrando que você é o observador do jardim.
          </li>
          <li>
            <strong className="text-[#96551F]">Guardar:</strong> Armazena a reflexão no seu caderno para releitura serena.
          </li>
          <li>
            <strong className="text-[#96551F]">Soltar:</strong> Permite que a brisa disperse a forma botânica suavemente.
          </li>
        </ul>
      </div>

      <div className="pt-3 border-t-2 border-[#D8CFBE] flex items-center justify-between">
        <span className="text-[#6B6B63]">Tempo no jardim:</span>
        <span className="font-mono font-medium text-[#005A1F] text-sm">
          {formatTime(elapsedSeconds)}
        </span>
      </div>

      <button
        id="btn-open-notebook-panel"
        onClick={onOpenNotebook}
        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] rounded-[16px] bg-[#F1E9DB] border-2 border-[#005A1F] text-[#005A1F] font-semibold hover:bg-[#FDFAF4] transition-colors"
      >
        <BookOpen className="w-4 h-4 stroke-2 text-[#005A1F]" />
        <span>Ver Caderno de Notas</span>
      </button>
    </div>
  );

  // Controls Content (Bottom action bar on mobile/desktop)
  const controlsContent = (
    <div className="flex flex-col gap-3">
      {/* Mensagem acessível de feedback com aria-live */}
      <div
        id="garden-live-announcer"
        aria-live="polite"
        className="text-xs font-medium text-[#005A1F] min-h-[18px]"
      >
        {feedbackMessage && <span>• {feedbackMessage}</span>}
      </div>

      {/* Seletor de Ações de Desfusão para o pensamento em foco */}
      {selectedLeaf ? (
        <div
          id="thought-choices-bar"
          className="p-3 bg-[#FDFAF4] rounded-[20px] border-2 border-[#005A1F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#96551F] block">
              Observando a forma botânica:
            </span>
            <p className="text-sm font-serif font-bold text-[#262B22] truncate max-w-md">
              "{selectedLeaf.text}"
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
            {/* 1. Deixar aqui */}
            <button
              id="choice-deixar-aqui"
              onClick={() => handleActionChoice('deixar-aqui')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-[16px] border-2 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#005A1F] ${
                selectedLeaf.action === 'deixar-aqui'
                  ? 'bg-[#F1E9DB] border-[#07614C] text-[#07614C]'
                  : 'bg-[#FDFAF4] border-[#D8CFBE] text-[#4B4B49] hover:border-[#07614C]'
              }`}
            >
              <Anchor className="w-4 h-4 stroke-2 text-[#07614C]" />
              <span>Deixar aqui</span>
            </button>

            {/* 2. Aproximar */}
            <button
              id="choice-aproximar"
              onClick={() => handleActionChoice('aproximar')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-[16px] border-2 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#005A1F] ${
                selectedLeaf.action === 'aproximar'
                  ? 'bg-[#F1E9DB] border-[#005A1F] text-[#005A1F]'
                  : 'bg-[#FDFAF4] border-[#D8CFBE] text-[#4B4B49] hover:border-[#005A1F]'
              }`}
            >
              <Maximize2 className="w-4 h-4 stroke-2 text-[#005A1F]" />
              <span>Aproximar</span>
            </button>

            {/* 3. Afastar */}
            <button
              id="choice-afastar"
              onClick={() => handleActionChoice('afastar')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-[16px] border-2 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#005A1F] ${
                selectedLeaf.action === 'afastar'
                  ? 'bg-[#F1E9DB] border-[#6B6B63] text-[#262B22]'
                  : 'bg-[#FDFAF4] border-[#D8CFBE] text-[#4B4B49] hover:border-[#6B6B63]'
              }`}
            >
              <Minimize2 className="w-4 h-4 stroke-2 text-[#96551F]" />
              <span>Afastar</span>
            </button>

            {/* 4. Guardar */}
            <button
              id="choice-guardar"
              onClick={() => handleActionChoice('guardar')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-[16px] border-2 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#96551F] ${
                selectedLeaf.isSaved
                  ? 'bg-[#F1E9DB] border-[#96551F] text-[#96551F]'
                  : 'bg-[#FDFAF4] border-[#96551F] text-[#96551F] hover:bg-[#F1E9DB]'
              }`}
            >
              <Bookmark className="w-4 h-4 stroke-2 text-[#96551F]" />
              <span>{selectedLeaf.isSaved ? 'Guardado' : 'Guardar'}</span>
            </button>

            {/* 5. Soltar */}
            <button
              id="choice-soltar"
              onClick={() => handleActionChoice('soltar')}
              className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-[16px] bg-[#FDFAF4] border-2 border-[#D8CFBE] text-[#6B6B63] hover:border-[#96551F] hover:text-[#96551F] text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#96551F]"
            >
              <Feather className="w-4 h-4 stroke-2 text-[#96551F]" />
              <span>Soltar</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="text-xs text-[#6B6B63] italic">
          Toque em uma folha do jardim para escolher como acolhê-la, ou registre uma nova frase abaixo.
        </div>
      )}

      {/* Formulário de Nova Frase / Pensamento */}
      <form onSubmit={handleAddThought} className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <label htmlFor="input-thought" className="sr-only">
            Escreva uma frase curta para materializar no jardim
          </label>
          <input
            id="input-thought"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Qual pensamento surge agora? Escreva uma frase curta..."
            maxLength={140}
            className="w-full px-4 py-2.5 min-h-[44px] rounded-[16px] bg-[#FDFAF4] border-2 border-[#D8CFBE] text-[#262B22] placeholder-[#6B6B63] text-sm focus:outline-none focus:border-[#005A1F] focus:ring-1 focus:ring-[#005A1F]"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-add-thought"
            type="submit"
            disabled={!inputText.trim()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-[16px] bg-[#005A1F] text-[#FDFAF4] font-semibold text-sm hover:bg-[#07614C] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#005A1F] transition-colors"
          >
            <Plus className="w-4 h-4 stroke-2 text-[#FDFAF4]" />
            <span>Colocar no jardim</span>
          </button>

          {/* Botão obrigatório: Limpar tudo sem salvar */}
          {leaves.length > 0 && (
            <button
              id="btn-clear-all"
              type="button"
              onClick={handleClearEphemeral}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 min-h-[44px] rounded-[16px] bg-[#FDFAF4] border-2 border-[#D8CFBE] text-[#6B6B63] hover:text-[#96551F] hover:border-[#96551F] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#96551F]"
              title="Limpar todas as formas efêmeras sem salvar dados"
            >
              <Trash2 className="w-4 h-4 stroke-2 text-[#96551F]" />
              <span className="hidden md:inline">Limpar tudo sem salvar</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );

  // Completion State Content (após "Encerrar experiência")
  const completionContent = (
    <div
      id="completion-summary-card"
      className="max-w-2xl mx-auto p-6 sm:p-8 bg-[#FDFAF4] rounded-[24px] border-2 border-[#D8CFBE] text-center"
    >
      <div className="w-16 h-16 mx-auto rounded-[24px] bg-[#F1E9DB] border-2 border-[#005A1F] flex items-center justify-center mb-4">
        <CheckCircle2 className="w-8 h-8 stroke-2 text-[#005A1F]" />
      </div>

      <h2 className="font-serif text-2xl font-bold text-[#262B22]">
        Experiência Encerrada com Serenidade
      </h2>
      <p className="text-sm text-[#4B4B49] mt-2 max-w-lg mx-auto leading-relaxed">
        Você dedicou um tempo para observar o fluxo dos seus pensamentos com postura de acolhimento
        e desfusão, sem pressa de produzir resultados.
      </p>

      {/* Métricas Confluência Não-Patológicas */}
      <div className="grid grid-cols-2 gap-4 my-6 text-left max-w-md mx-auto">
        <div className="p-4 rounded-[20px] bg-[#F1E9DB] border-2 border-[#D8CFBE]">
          <span className="text-xs text-[#6B6B63] block">Duração Contemplativa</span>
          <span className="text-xl font-serif font-bold text-[#005A1F]">
            {formatTime(elapsedSeconds)}
          </span>
        </div>
        <div className="p-4 rounded-[20px] bg-[#F1E9DB] border-2 border-[#D8CFBE]">
          <span className="text-xs text-[#6B6B63 block">Formas Observadas</span>
          <span className="text-xl font-serif font-bold text-[#96551F]">
            {leaves.length} formas
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
        <button
          id="btn-restart-experience"
          onClick={handleRestartExperience}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-[16px] bg-[#005A1F] text-[#FDFAF4] font-semibold text-sm hover:bg-[#07614C] transition-colors"
        >
          <RefreshCw className="w-4 h-4 stroke-2 text-[#FDFAF4]" />
          <span>Permanecer no jardim</span>
        </button>

        <button
          id="btn-back-from-completion"
          onClick={onBackToResources}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-[16px] bg-[#FDFAF4] border-2 border-[#D8CFBE] text-[#262B22] font-semibold text-sm hover:border-[#005A1F] transition-colors"
        >
          <span>Retornar ao Catálogo de Recursos</span>
        </button>

        <button
          id="btn-open-notebook-completion"
          onClick={onOpenNotebook}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] rounded-[16px] bg-[#F1E9DB] border-2 border-[#96551F] text-[#96551F] font-semibold text-sm hover:bg-[#FDFAF4] transition-colors"
        >
          <BookOpen className="w-4 h-4 stroke-2 text-[#96551F]" />
          <span>Caderno de Notas</span>
        </button>
      </div>
    </div>
  );

  return (
    <InteractiveResourceShell
      title="Jardim de Pensamentos"
      category="REGULAR / EXPERIMENTAR"
      durationApprox="5 a 10 min"
      state={state}
      onBackToResources={onBackToResources}
      onEndExperience={handleEndExperience}
      onResetExperience={handleRestartExperience}
      isMuted={isMuted}
      onToggleMute={handleToggleMute}
      isTextAlternativeOpen={isTextAlternativeOpen}
      onToggleTextAlternative={() => setIsTextAlternativeOpen((prev) => !prev)}
      isReducedMotionActive={isReducedMotion}
      onToggleReducedMotion={handleToggleReducedMotion}
      secondaryContextPanel={secondaryContextPanel}
      controlsContent={controlsContent}
      completionContent={completionContent}
      errorMessage={errorMessage}
    >
      {/* CAMPO DE INTERAÇÃO BOTÂNICA (CANVAS OU MODO TEXTUAL ACESSÍVEL) */}
      {isTextAlternativeOpen ? (
        <div
          id="garden-text-alternative-view"
          className="w-full h-full p-4 overflow-y-auto"
          aria-label="Lista textual acessível dos pensamentos no jardim"
        >
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#D8CFBE] mb-4">
            <h2 className="font-serif text-lg font-bold text-[#262B22]">
              Visão Textual Contemplativa
            </h2>
            <span className="text-xs text-[#6B6B63]">
              {leaves.length} {leaves.length === 1 ? 'forma' : 'formas'} presentes
            </span>
          </div>

          {leaves.length === 0 ? (
            <p className="text-sm text-[#6B6B63] italic">Nenhum pensamento no canteiro no momento.</p>
          ) : (
            <ul className="space-y-3">
              {leaves.map((leaf, index) => (
                <li
                  key={leaf.id}
                  className={`p-3 rounded-[16px] border-2 transition-colors ${
                    leaf.id === selectedLeafId
                      ? 'bg-[#F1E9DB] border-[#005A1F]'
                      : 'bg-[#FDFAF4] border-[#D8CFBE]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-[#262B22]">
                      <span className="font-mono text-xs text-[#6B6B63] mr-2">#{index + 1}</span>
                      {leaf.text}
                    </p>
                    <button
                      onClick={() => setSelectedLeafId(leaf.id)}
                      className="px-2.5 py-1 text-xs rounded-[12px] border border-[#005A1F] text-[#005A1F] hover:bg-[#005A1F] hover:text-[#FDFAF4]"
                    >
                      Selecionar
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-[#6B6B63] flex items-center gap-3">
                    <span>Ação: <strong>{leaf.action}</strong></span>
                    <span>Forma: {leaf.botanicalForm}</span>
                    {leaf.isSaved && <span className="text-[#96551F]">✓ Guardado no caderno</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <JardimCanvas
          leaves={leaves}
          selectedLeafId={selectedLeafId}
          onSelectLeaf={(leaf) => setSelectedLeafId(leaf.id)}
          isReducedMotion={isReducedMotion}
        />
      )}
    </InteractiveResourceShell>
  );
}
