// @ts-nocheck -- imported Gemini experience keeps a narrower local state union.
import React, { useReducer, useEffect, useState, useRef } from 'react';
import {
  thoughtGardenReducer,
  initialThoughtGardenState,
} from './reducer';
import {
  GardenLeaf,
  EditorialContentConfig,
  GardenViewPreset,
  RightPanelState,
  WindIntensity,
} from './types';
import {
  getEditorialConfig,
  saveThoughtRecord,
  deleteThoughtRecord,
  updateThoughtRecord,
  recordTelemetry,
} from './repository';
import { InteractiveResourceShell } from '../../../components/interactive-shell/InteractiveResourceShell';
import { ResourceHeader } from '../../../components/interactive-shell/ResourceHeader';
import { ResourceStage } from '../../../components/interactive-shell/ResourceStage';
import { GardenStage } from './components/GardenStage';
import { ThoughtComposer } from './components/ThoughtComposer';
import { LeafActions } from './components/LeafActions';
import { GardenCompletion } from './components/GardenCompletion';
import { GardenBottomBar } from './components/GardenBottomBar';
import {
  Leaf,
  Bookmark,
  AlertTriangle,
  Info,
  Sparkles,
  HeartHandshake,
  ShieldCheck,
  PanelRightClose,
  PanelRightOpen,
  Maximize2,
  Minimize2,
  Plus,
} from 'lucide-react';

interface ThoughtGardenExperienceProps {
  userId: string;
  onBackToPortal: () => void;
  onOpenSavedThoughts: () => void;
}

export const ThoughtGardenExperience: React.FC<ThoughtGardenExperienceProps> = ({
  userId,
  onBackToPortal,
  onOpenSavedThoughts,
}) => {
  const [state, dispatch] = useReducer(thoughtGardenReducer, initialThoughtGardenState, (init) => {
    // Inicialização direta do canteiro ativo com folhas de acolhimento orgânicas
    const welcomeLeafA: GardenLeaf = {
      id: 'leaf_welcome_1',
      text: 'Respirar fundo e acolher o momento presente.',
      optional_title: 'Respiração',
      status: 'floating',
      isFloating: true,
      leafShapeIndex: 0,
      colorVariant: 'folha-verde',
      xRatio: 0.35,
      yRatio: 0.38,
      rotationDeg: -6,
      createdAt: new Date().toISOString(),
    };
    const welcomeLeafB: GardenLeaf = {
      id: 'leaf_welcome_2',
      text: 'Cada pensamento tem seu próprio tempo para pousar.',
      optional_title: 'Acolhimento',
      status: 'placed',
      isFloating: false,
      leafShapeIndex: 1,
      colorVariant: 'folha-igarape',
      xRatio: 0.65,
      yRatio: 0.62,
      rotationDeg: 7,
      createdAt: new Date().toISOString(),
    };
    return {
      ...init,
      experienceState: 'active',
      leaves: [welcomeLeafA, welcomeLeafB],
      selectedLeafId: null,
      activeAnnouncement: 'Você está no Jardim de Pensamentos.',
    };
  });
  const [editorialConfig, setEditorialConfig] = useState<EditorialContentConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [mobileTab, setMobileTab] = useState<'garden' | 'composer' | 'list'>('garden');
  const [isMobile, setIsMobile] = useState(false);
  const [panelState, setPanelState] = useState<RightPanelState>('open');
  const [windIntensity, setWindIntensity] = useState<WindIntensity>('gentle');
  const [viewPreset, setViewPreset] = useState<GardenViewPreset>('panoramic');
  const audioContextRef = useRef<AudioContext | null>(null);

  // Carrega configuração editorial e detecta prefers-reduced-motion
  useEffect(() => {
    let isMounted = true;
    getEditorialConfig().then((cfg) => {
      if (isMounted) setEditorialConfig(cfg);
    });

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      dispatch({ type: 'SET_REDUCED_MOTION', payload: true });
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => {
      isMounted = false;
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Web Audio sutil e opcional para som natural orgânico quando não mutado
  const playOrganicChime = () => {
    if (state.isMuted) return;
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(576, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {
      // áudio opcional e não impeditivo
    }
  };

  // Telemetria ética: registrar início da experiência
  const handleStartExperience = () => {
    dispatch({ type: 'START_EXPERIENCE' });
    recordTelemetry('resource_started');
  };

  // Colocar folha no jardim (apenas em memória, sem requisição)
  const handlePlaceLeaf = (text: string, optionalTitle?: string | null) => {
    dispatch({
      type: 'PLACE_LEAF',
      payload: { text, optional_title: optionalTitle },
    });
    playOrganicChime();
    if (isMobile) {
      setMobileTab('garden');
    }
  };

  // Guardar pensamento no histórico privado
  const handleSaveToHistory = async (leaf: GardenLeaf) => {
    setIsSaving(true);
    try {
      const savedRecord = await saveThoughtRecord(userId, {
        client_request_id: `req_${leaf.id}`,
        text: leaf.text,
        optional_title: leaf.optional_title,
        content_version: editorialConfig?.version,
      });
      dispatch({
        type: 'MARK_LEAF_AS_SAVED',
        payload: { leafId: leaf.id, recordId: savedRecord.id },
      });
      playOrganicChime();
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: err instanceof Error ? err.message : 'Falha ao salvar no histórico.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Atualizar folha editada
  const handleUpdateLeaf = async (leafId: string, text: string, optionalTitle?: string | null) => {
    setIsSaving(true);
    try {
      const leaf = state.leaves.find((l) => l.id === leafId);
      if (leaf?.savedRecordId) {
        // Se já estava salvo no banco, atualiza no repositório também
        await updateThoughtRecord(userId, leaf.savedRecordId, {
          text,
          optional_title: optionalTitle,
        });
      }
      dispatch({
        type: 'UPDATE_LEAF',
        payload: { id: leafId, text, optional_title: optionalTitle },
      });
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: err instanceof Error ? err.message : 'Erro ao atualizar folha.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Excluir permanentemente do histórico
  const handleDeleteFromHistory = async (savedRecordId: string, leafId: string) => {
    try {
      await deleteThoughtRecord(userId, savedRecordId);
      dispatch({ type: 'REMOVE_LEAF_FROM_SESSION', payload: leafId });
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: err instanceof Error ? err.message : 'Erro ao excluir do histórico.',
      });
    }
  };

  // Encerrar experiência (com verificação se há folhas não salvas)
  const handleRequestEndExperience = () => {
    const unsavedLeaves = state.leaves.filter((l) => !l.savedRecordId);
    if (unsavedLeaves.length > 0) {
      setShowExitConfirm(true);
    } else {
      executeEndExperience();
    }
  };

  const executeEndExperience = () => {
    const durationSeconds = Math.round((Date.now() - state.sessionStartedAt) / 1000);
    recordTelemetry('resource_completed', durationSeconds);
    setShowExitConfirm(false);
    dispatch({ type: 'COMPLETE_EXPERIENCE' });
  };

  const handleRestart = () => {
    recordTelemetry('resource_repeated');
    dispatch({ type: 'START_EXPERIENCE' });
  };

  const selectedLeaf = state.leaves.find((l) => l.id === state.selectedLeafId);
  const savedCount = state.leaves.filter((l) => Boolean(l.savedRecordId)).length;

  return (
    <>
      <InteractiveResourceShell
        state={state.experienceState}
        errorMessage={state.errorNotice}
        onRetry={() => dispatch({ type: 'SET_ERROR', payload: null })}
        header={
          <ResourceHeader
            title={editorialConfig?.title || 'Jardim de Pensamentos'}
            category="Confluência"
            onBack={onBackToPortal}
          />
        }
        stage={
          state.experienceState === 'intro' ? (
            /* Tela de Abertura / Apresentação Ética do Jardim */
            <div className="flex-1 w-full max-w-2xl mx-auto p-6 sm:p-10 flex flex-col justify-center select-text">
              <div className="p-6 sm:p-8 bg-[#FDFAF4] border-2 border-[#96551F] rounded-[24px]">
                <div className="w-14 h-14 rounded-full bg-[#F1E9DB] border-2 border-[#005A1F] flex items-center justify-center text-[#005A1F] mb-4">
                  <Leaf className="w-7 h-7 stroke-[2px]" />
                </div>

                <span className="text-xs font-semibold text-[#96551F] uppercase tracking-wider block mb-1">
                  Espaço de Escrita Breve • Confluência
                </span>

                <h1 className="text-2xl sm:text-3xl font-bold font-fraunces text-[#005A1F] mb-3">
                  {editorialConfig?.opening_prompt || 'Um lugar para pousar pensamentos.'}
                </h1>

                <p className="text-sm sm:text-base text-[#262B22] leading-relaxed mb-4">
                  {editorialConfig?.support_text ||
                    'Escreva se quiser. Você pode guardar, observar ou deixar a folha sair desta experiência.'}
                </p>

                <div className="p-4 bg-[#F1E9DB]/60 border border-[#D8CFBE] rounded-2xl mb-6 flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#07614C] shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-[#4B4B49] leading-relaxed">
                    {editorialConfig?.ethical_note ||
                      'Uma folha sair da tela não significa que um pensamento precise desaparecer.'}
                  </p>
                </div>

                {/* Princípios de Respeito e Autonomia */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <div className="p-3 bg-[#FDFAF4] border border-[#D8CFBE] rounded-xl flex items-center gap-2.5 text-xs text-[#262B22]">
                    <ShieldCheck className="w-4 h-4 text-[#005A1F] shrink-0" />
                    <span>Privacidade estrita. Sem avaliação nem moralização.</span>
                  </div>
                  <div className="p-3 bg-[#FDFAF4] border border-[#D8CFBE] rounded-xl flex items-center gap-2.5 text-xs text-[#262B22]">
                    <HeartHandshake className="w-4 h-4 text-[#96551F] shrink-0" />
                    <span>Experiência efêmera por padrão; guarde só se quiser.</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={handleStartExperience}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#005A1F] hover:bg-[#07614C] text-[#FDFAF4] font-medium rounded-full transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#005A1F]"
                  >
                    <Leaf className="w-5 h-5 stroke-[2px]" />
                    <span>Entrar no jardim</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenSavedThoughts}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#F1E9DB] hover:bg-[#D8CFBE] text-[#262B22] font-medium rounded-full border border-[#D8CFBE] transition-colors min-h-[44px]"
                  >
                    <Bookmark className="w-4 h-4 text-[#96551F]" />
                    <span>Ver pensamentos guardados</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Palco do Jardim Interativo com Suporte a Menu Direito Expandido/Recolhido */
            <ResourceStage
              activeAnnouncement={state.activeAnnouncement}
              panelWidth={panelState === 'expanded' ? 'expanded' : 'default'}
              contextPanel={
                isMobile || panelState === 'collapsed' ? null : (
                  <div className="flex flex-col h-full relative">
                    {/* Barra Superior do Menu Direito */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-[#F1E9DB]/60 border-b border-[#D8CFBE]">
                      <span className="text-xs font-bold font-fraunces text-[#005A1F] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#96551F]" />
                        <span>{selectedLeaf ? 'Ações da Folha' : 'Painel de Escrita'}</span>
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setPanelState((p) => (p === 'expanded' ? 'open' : 'expanded'))}
                          className="p-1.5 text-[#6B6B63] hover:text-[#262B22] rounded-full hover:bg-[#D8CFBE]/50 transition-colors"
                          title={panelState === 'expanded' ? 'Tamanho padrão' : 'Expandir largura'}
                          aria-label="Alternar largura do painel"
                        >
                          {panelState === 'expanded' ? (
                            <Minimize2 className="w-3.5 h-3.5" />
                          ) : (
                            <Maximize2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPanelState('collapsed')}
                          className="p-1.5 text-[#6B6B63] hover:text-[#262B22] rounded-full hover:bg-[#D8CFBE]/50 transition-colors"
                          title="Recolher painel para modo jardim total"
                          aria-label="Ocultar painel"
                        >
                          <PanelRightClose className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Conteúdo Contextual do Painel Direito */}
                    <div className="flex-1 overflow-y-auto">
                      {selectedLeaf ? (
                        <LeafActions
                          leaf={selectedLeaf}
                          onClose={() => dispatch({ type: 'SELECT_LEAF', payload: null })}
                          onSaveToHistory={handleSaveToHistory}
                          onFloatLeaf={(id) => dispatch({ type: 'FLOAT_LEAF', payload: id })}
                          onLandLeaf={(id) => dispatch({ type: 'LAND_LEAF', payload: id })}
                          onRemoveFromSession={(id) =>
                            dispatch({ type: 'REMOVE_LEAF_FROM_SESSION', payload: id })
                          }
                          onDeleteFromHistory={handleDeleteFromHistory}
                          onUpdateLeaf={handleUpdateLeaf}
                          isSaving={isSaving}
                          reducedMotion={state.reducedMotion}
                        />
                      ) : (
                        <ThoughtComposer
                          onPlaceLeaf={handlePlaceLeaf}
                          currentLeavesCount={state.leaves.length}
                          maxSessionLeaves={editorialConfig?.max_session_leaves || 20}
                          openingPrompt={editorialConfig?.opening_prompt}
                          supportText={editorialConfig?.support_text}
                          ethicalNote={editorialConfig?.ethical_note}
                          placeholderText={editorialConfig?.placeholder_text}
                        />
                      )}
                    </div>
                  </div>
                )
              }
            >
              {/* Botão sutil de reabertura do painel quando recolhido no Desktop */}
              {panelState === 'collapsed' && !isMobile && (
                <button
                  type="button"
                  onClick={() => setPanelState('open')}
                  className="absolute right-4 top-4 z-30 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FDFAF4]/95 hover:bg-[#FDFAF4] text-[#005A1F] border border-[#005A1F] font-semibold text-xs shadow-xs backdrop-blur-xs transition-transform hover:scale-102"
                  aria-label="Abrir painel de escrita"
                >
                  <PanelRightOpen className="w-4 h-4" />
                  <span>Abrir painel de escrita</span>
                </button>
              )}

              {/* No Mobile, alternância simples e limpa entre Jardim e Escrita */}
              {isMobile && mobileTab === 'composer' ? (
                <div className="w-full h-full overflow-y-auto bg-[#FDFAF4]">
                  <ThoughtComposer
                    onPlaceLeaf={handlePlaceLeaf}
                    currentLeavesCount={state.leaves.length}
                    maxSessionLeaves={editorialConfig?.max_session_leaves || 20}
                    openingPrompt={editorialConfig?.opening_prompt}
                    supportText={editorialConfig?.support_text}
                    ethicalNote={editorialConfig?.ethical_note}
                    placeholderText={editorialConfig?.placeholder_text}
                  />
                </div>
              ) : isMobile && mobileTab === 'list' ? (
                /* Lista Vertical das Folhas da Sessão no Mobile */
                <div className="w-full h-full overflow-y-auto p-4 bg-[#FDFAF4]">
                  <h2 className="text-base font-bold font-fraunces text-[#005A1F] mb-3">
                    Folhas nesta sessão ({state.leaves.length})
                  </h2>
                  {state.leaves.length === 0 ? (
                    <p className="text-xs text-[#6B6B63]">Nenhuma folha pousada ainda.</p>
                  ) : (
                    <div className="space-y-3">
                      {state.leaves.map((leaf) => (
                        <div
                          key={leaf.id}
                          onClick={() => {
                            dispatch({ type: 'SELECT_LEAF', payload: leaf.id });
                            setMobileTab('garden');
                          }}
                          className="p-3 bg-[#F1E9DB]/50 border-2 border-[#D8CFBE] rounded-2xl flex items-center justify-between gap-3 cursor-pointer"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-bold text-[#96551F] block truncate">
                              {leaf.optional_title || 'Pensamento'}
                            </span>
                            <p className="text-xs text-[#262B22] truncate">{leaf.text}</p>
                          </div>
                          {leaf.savedRecordId && (
                            <span className="text-[10px] text-[#005A1F] font-bold bg-[#F1E9DB] px-2 py-0.5 rounded-full shrink-0">
                              Guardado
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Palco Visual do Jardim */
                <GardenStage
                  leaves={state.leaves}
                  selectedLeafId={state.selectedLeafId}
                  onSelectLeaf={(id) => {
                    dispatch({ type: 'SELECT_LEAF', payload: id });
                    if (id && panelState === 'collapsed') {
                      setPanelState('open');
                    }
                  }}
                  reducedMotion={state.reducedMotion}
                  isFloatingPaused={state.isFloatingPaused}
                  onTogglePauseFloating={() => dispatch({ type: 'TOGGLE_PAUSE_FLOATING' })}
                  isMobile={isMobile}
                  windIntensity={windIntensity}
                  viewPreset={viewPreset}
                  onQuickAddThought={() =>
                    handlePlaceLeaf('Observar com serenidade e acolher cada momento.', 'Contemplação')
                  }
                />
              )}
            </ResourceStage>
          )
        }
        controls={
          state.experienceState !== 'intro' && state.experienceState !== 'completed' ? (
            <GardenBottomBar
              leavesCount={state.leaves.length}
              savedCount={savedCount}
              hasFloatingLeaves={state.leaves.some((l) => l.isFloating)}
              isFloatingPaused={state.isFloatingPaused}
              onTogglePauseFloating={() => dispatch({ type: 'TOGGLE_PAUSE_FLOATING' })}
              reducedMotion={state.reducedMotion}
              windIntensity={windIntensity}
              onChangeWindIntensity={setWindIntensity}
              viewPreset={viewPreset}
              onChangeViewPreset={setViewPreset}
              panelState={panelState}
              onTogglePanelState={() =>
                setPanelState((p) => (p === 'collapsed' ? 'open' : 'collapsed'))
              }
              onTogglePanelWidth={() =>
                setPanelState((p) => (p === 'expanded' ? 'open' : 'expanded'))
              }
              onOpenSavedThoughts={onOpenSavedThoughts}
              onQuickAddThought={() => {
                dispatch({ type: 'SELECT_LEAF', payload: null });
                if (panelState === 'collapsed') setPanelState('open');
                if (isMobile) setMobileTab('composer');
              }}
              isMobile={isMobile}
              mobileTab={mobileTab}
              onSelectMobileTab={setMobileTab}
            />
          ) : undefined
        }
        completion={
          <GardenCompletion
            savedCount={savedCount}
            onViewSaved={onOpenSavedThoughts}
            onRestart={handleRestart}
            onBackToPortal={onBackToPortal}
            closingTitle={editorialConfig?.closing_title}
            closingSupport={editorialConfig?.closing_support}
          />
        }
      />

      {/* Modal Mobile para Ações da Folha Selecionada */}
      {isMobile && selectedLeaf && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#262B22]/50 backdrop-blur-xs flex items-end justify-center"
        >
          <div className="bg-[#FDFAF4] border-t-2 border-[#D8CFBE] rounded-t-[28px] w-full max-h-[85vh] overflow-y-auto">
            <LeafActions
              leaf={selectedLeaf}
              onClose={() => dispatch({ type: 'SELECT_LEAF', payload: null })}
              onSaveToHistory={handleSaveToHistory}
              onFloatLeaf={(id) => dispatch({ type: 'FLOAT_LEAF', payload: id })}
              onLandLeaf={(id) => dispatch({ type: 'LAND_LEAF', payload: id })}
              onRemoveFromSession={(id) => dispatch({ type: 'REMOVE_LEAF_FROM_SESSION', payload: id })}
              onDeleteFromHistory={handleDeleteFromHistory}
              onUpdateLeaf={handleUpdateLeaf}
              isSaving={isSaving}
              reducedMotion={state.reducedMotion}
            />
          </div>
        </div>
      )}

      {/* Diálogo de Confirmação ao Encerrar com Folhas Não Salvas */}
      {showExitConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-confirm-title"
          className="fixed inset-0 z-50 bg-[#262B22]/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-[#FDFAF4] border-2 border-[#96551F] rounded-[24px] max-w-md w-full p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[#F1E9DB] border-2 border-[#96551F] text-[#96551F] flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 id="exit-confirm-title" className="text-lg font-bold font-fraunces text-[#005A1F] mb-2">
              Encerrar experiência?
            </h3>
            <p className="text-xs sm:text-sm text-[#4B4B49] leading-relaxed mb-6">
              Você possui folhas que não foram guardadas nesta sessão. Ao encerrar, o texto não guardado será liberado e deixará a tela. Suas folhas guardadas permanecem preservadas no histórico.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-[#6B6B63] hover:text-[#262B22] min-h-[44px]"
              >
                Continuar no jardim
              </button>
              <button
                type="button"
                onClick={executeEndExperience}
                className="px-5 py-2 text-xs font-medium bg-[#96551F] text-[#FDFAF4] rounded-full hover:bg-[#7a4214] min-h-[44px]"
              >
                Encerrar sem guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Ajuda e Orientações Éticas */}
      {showHelpModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="help-modal-title"
          className="fixed inset-0 z-50 bg-[#262B22]/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-[#FDFAF4] border-2 border-[#005A1F] rounded-[24px] max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8CFBE] mb-4">
              <h3 id="help-modal-title" className="text-lg font-bold font-fraunces text-[#005A1F]">
                Sobre o Jardim de Pensamentos
              </h3>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="p-1 text-[#6B6B63] hover:text-[#262B22]"
                aria-label="Fechar ajuda"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#262B22] leading-relaxed">
              <p>
                O <strong>Jardim de Pensamentos</strong> é um recurso interativo do Portal do Aluno do Instituto Figura Viva, desenhado sob o registro <em>Confluência</em>.
              </p>
              <div className="p-3 bg-[#F1E9DB] rounded-xl border border-[#D8CFBE]">
                <p className="font-semibold text-[#005A1F] mb-1">Princípios do Recurso:</p>
                <ul className="list-disc list-inside space-y-1 text-xs text-[#4B4B49]">
                  <li><strong>Sem julgamento:</strong> Não categorizamos pensamentos como &ldquo;bons&rdquo; ou &ldquo;ruins&rdquo;.</li>
                  <li><strong>Sem diagnóstico:</strong> Não há análise clínica, inteligência de sentimentos ou pontuação.</li>
                  <li><strong>Autonomia:</strong> As folhas são passageiras por padrão. Guarde apenas aquilo que você desejar revisitar.</li>
                  <li><strong>Privacidade:</strong> Suas anotações guardadas pertencem somente a você. Nem professores nem outros alunos têm acesso.</li>
                </ul>
              </div>
              <p className="text-xs text-[#6B6B63]">
                Uma folha sair da tela não significa que um pensamento precise desaparecer. O jardim é um espaço para pausar e observar.
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-[#D8CFBE] text-right">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="px-5 py-2 text-xs font-medium bg-[#005A1F] text-[#FDFAF4] rounded-full hover:bg-[#07614C] min-h-[44px]"
              >
                Compreendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
