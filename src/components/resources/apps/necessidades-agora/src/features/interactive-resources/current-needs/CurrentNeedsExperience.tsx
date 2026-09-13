/**
 * CurrentNeedsExperience - Experiência Interativa "Necessidades Agora"
 * Registro Confluência - Instituto Figura Viva
 *
 * Seleção tátil de necessidades percebidas no momento (2–4 min).
 * Segue fluxo canônico: intro -> selecting -> prioritizing -> optionalStep -> reviewing -> saved / exit.
 */

import React, { useReducer, useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  HelpCircle,
  Plus,
  X,
  History,
  Check,
} from 'lucide-react';
import { InteractiveResourceShell } from '../shell/InteractiveResourceShell';
import { currentNeedsReducer, initialCurrentNeedsState } from './reducer';
import { NeedsLibrary } from './components/NeedsLibrary';
import { PresentNeedsTray } from './components/PresentNeedsTray';
import { NeedPriorityControls } from './components/NeedPriorityControls';
import { SmallStepForm } from './components/SmallStepForm';
import { NeedsSummary } from './components/NeedsSummary';
import { NeedsHistory } from './components/NeedsHistory';
import { CurrentNeedsRepository } from './repository';
import { NeedCatalogItem } from './types';
import { telemetry } from '../../../lib/telemetry';
import { audioManager } from '../../../lib/audio';
import { CURRENT_NEEDS_CONSTRAINTS } from './schema';

interface CurrentNeedsExperienceProps {
  userId: string;
  onNavigateToCatalog: () => void;
}

export const CurrentNeedsExperience: React.FC<CurrentNeedsExperienceProps> = ({
  userId,
  onNavigateToCatalog,
}) => {
  const [state, dispatch] = useReducer(currentNeedsReducer, initialCurrentNeedsState);
  const [catalog, setCatalog] = useState(() => CurrentNeedsRepository.getPublishedCatalog());
  const [activeView, setActiveView] = useState<'experience' | 'history'>('experience');

  // Controle de modal de necessidade customizada
  const [customLabel, setCustomLabel] = useState('');
  const [customDesc, setCustomDesc] = useState('');

  // Chave de requisição de cliente para salvamento idempotente
  const clientRequestIdRef = useRef<string>(
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  );

  useEffect(() => {
    telemetry.log('resource_opened', {
      resource_key: 'necessidades-agora',
      content_version: catalog.version,
    });
  }, [catalog.version]);

  // Atualiza catálogo se houver publicação
  const refreshCatalog = () => {
    setCatalog(CurrentNeedsRepository.getPublishedCatalog());
  };

  const handleStart = () => {
    audioManager.playGentleChime(432, 0.4);
    dispatch({ type: 'START_EXPERIENCE' });
    telemetry.log('resource_started', {
      resource_key: 'necessidades-agora',
      content_version: catalog.version,
    });
  };

  const handleToggleNeed = (item: NeedCatalogItem) => {
    audioManager.playGentleChime(528, 0.2);
    dispatch({
      type: 'TOGGLE_NEED',
      need: {
        id: item.id,
        name: item.name,
        shortDescription: item.shortDescription,
      },
    });
  };

  const handleAddCustomNeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLabel.trim()) return;

    dispatch({
      type: 'ADD_CUSTOM_NEED',
      label: customLabel,
      description: customDesc,
    });
    setCustomLabel('');
    setCustomDesc('');
  };

  const handleSaveToHistory = async () => {
    dispatch({ type: 'START_SAVING' });
    try {
      const res = await CurrentNeedsRepository.createRecord({
        userId,
        clientRequestId: clientRequestIdRef.current,
        contentVersion: catalog.version,
        state: state.stateType,
        entries: state.selectedEntries,
        ordered: state.ordered,
        focusEntryId: state.focusEntryId,
        smallStep: state.smallStep.trim() ? state.smallStep.trim() : null,
      });

      if (res.record) {
        audioManager.playGentleChime(640, 0.6);
        dispatch({ type: 'SAVE_SUCCESS', recordId: res.record.id });
        telemetry.log('resource_completed', {
          resource_key: 'necessidades-agora',
          content_version: catalog.version,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao salvar. Tente novamente.';
      dispatch({ type: 'SAVE_ERROR', error: msg });
      telemetry.log('save_failed', {
        resource_key: 'necessidades-agora',
        content_version: catalog.version,
      });
    }
  };

  const handleExitExperience = () => {
    if (state.step !== 'saved' && state.step !== 'intro') {
      telemetry.log('resource_abandoned', {
        resource_key: 'necessidades-agora',
        content_version: catalog.version,
      });
    }
    onNavigateToCatalog();
  };

  // Se o aluno escolheu ver o histórico
  if (activeView === 'history') {
    return (
      <InteractiveResourceShell
        title="Histórico — Necessidades Agora"
        subtitle="Seus registros passados com privacidade protegida."
        stageState="ready"
        onBackToCatalog={onNavigateToCatalog}
        onExitExperience={onNavigateToCatalog}
      >
        <NeedsHistory
          userId={userId}
          onBackToExperience={() => setActiveView('experience')}
          onNewExperience={() => {
            dispatch({ type: 'RESET_EXPERIENCE' });
            setActiveView('experience');
          }}
        />
      </InteractiveResourceShell>
    );
  }

  const inspectedItem = catalog.items.find((i) => i.id === state.inspectedNeedId) || null;

  return (
    <InteractiveResourceShell
      title="Necessidades Agora"
      subtitle={catalog.editorialIntro.subtitle}
      stageState={state.step === 'saved' ? 'completed' : 'active'}
      hasUnsavedChanges={state.hasUnsavedChanges}
      onBackToCatalog={handleExitExperience}
      onExitExperience={handleExitExperience}
      completion={
        <NeedsSummary
          stateType={state.stateType}
          entries={state.selectedEntries}
          ordered={state.ordered}
          focusEntryId={state.focusEntryId}
          smallStep={state.smallStep}
          isSaving={state.isSaving}
          saveError={state.saveError}
          isSaved={true}
          onSaveToHistory={handleSaveToHistory}
          onEditChoices={() => dispatch({ type: 'SET_STEP', step: 'selecting' })}
          onExitWithoutSaving={handleExitExperience}
          onGoToHistory={() => setActiveView('history')}
        />
      }
    >
      <div className="w-full flex-1 flex flex-col items-center justify-start">
        {/* ========================================================
            ETAPA 1: INTRO (Abertura Acolhedora)
            ======================================================== */}
        {state.step === 'intro' && (
          <div
            id="current-needs-intro"
            className="max-w-xl mx-auto w-full p-6 sm:p-8 text-left my-auto"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#F1E9DB] text-[#96551F] mb-4 border border-[#D8CFBE]">
              <Sparkles className="w-3.5 h-3.5 stroke-2" />
              <span>Registro Confluência</span>
              <span className="text-[#D8CFBE]">•</span>
              <Clock className="w-3 h-3 stroke-2" />
              <span>{catalog.editorialIntro.estimatedTime}</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#005A1F] mb-3 leading-tight tracking-tight">
              {catalog.editorialIntro.title}
            </h1>

            <p className="text-base sm:text-lg text-[#262B22] font-medium mb-3 leading-snug">
              {catalog.editorialIntro.subtitle}
            </p>

            <p className="text-sm text-[#4B4B49] mb-8 leading-relaxed">
              {catalog.editorialIntro.supportText}
            </p>

            {/* Aviso Canônico de Não Obrigação de Salvar */}
            <div className="p-4 rounded-[20px] bg-[#F1E9DB] border border-[#D8CFBE] mb-8 text-xs text-[#4B4B49] flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 stroke-2 text-[#005A1F] shrink-0 mt-0.5" />
              <p>
                <strong>Você pode experimentar sem salvar.</strong> Para guardar no
                seu histórico privado, escolha <em>Salvar</em> ao finalizar. Nenhum
                dado é enviado ou monitorado automaticamente.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                id="btn-start-needs-experience"
                type="button"
                onClick={handleStart}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full text-base font-semibold bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C] transition-colors flex items-center justify-center gap-2 min-h-[48px]"
              >
                <span>Explorar necessidades</span>
                <ArrowRight className="w-4 h-4 stroke-2" />
              </button>

              <button
                id="btn-open-history-intro"
                type="button"
                onClick={() => setActiveView('history')}
                className="w-full sm:w-auto px-5 py-3 rounded-full text-sm font-medium text-[#005A1F] hover:bg-[#F1E9DB] transition-colors flex items-center justify-center gap-2 min-h-[48px]"
              >
                <History className="w-4 h-4 stroke-2" />
                <span>Ver meu histórico</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            ETAPA 2: SELECTING (Biblioteca 65% + Bandeja 35%)
            ======================================================== */}
        {state.step === 'selecting' && (
          <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 flex-1 flex flex-col">
            {/* Header da Etapa com Instruções Claras */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#D8CFBE]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#96551F]">
                  Etapa 1 de 3
                </span>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#005A1F]">
                  Escolha o que parece mais presente agora
                </h2>
                <p className="text-xs sm:text-sm text-[#4B4B49]">
                  Selecione até 5 necessidades para observar com mais atenção.
                </p>
              </div>

              {/* Botão Âncora Mobile para Ver Bandeja */}
              <div className="lg:hidden flex items-center justify-between gap-2 bg-[#F1E9DB] p-2.5 rounded-[16px] border border-[#D8CFBE]">
                <span className="text-xs font-semibold text-[#005A1F]">
                  {state.selectedEntries.length} de {CURRENT_NEEDS_CONSTRAINTS.MAX_ENTRIES} selecionadas
                </span>
                <a
                  href="#present-needs-tray"
                  className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#005A1F] text-[#FDFAF4]"
                >
                  Ver minhas escolhas ({state.selectedEntries.length})
                </a>
              </div>
            </div>

            {/* Layout Desktop: 65% biblioteca / 35% bandeja */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
              <div className="lg:col-span-8 flex flex-col">
                <NeedsLibrary
                  items={catalog.items}
                  selectedEntries={state.selectedEntries}
                  onToggleNeed={handleToggleNeed}
                  onOpenCustomModal={() => dispatch({ type: 'OPEN_CUSTOM_MODAL' })}
                  onSelectUnsure={() => dispatch({ type: 'SELECT_UNSURE' })}
                  inspectedItem={inspectedItem}
                  onCloseInspect={() =>
                    dispatch({ type: 'SET_INSPECTED_NEED', needId: null })
                  }
                  onInspectItem={(item) =>
                    dispatch({ type: 'SET_INSPECTED_NEED', needId: item.id })
                  }
                  explanationMessage={state.explanationMessage}
                  onClearExplanation={() => dispatch({ type: 'CLEAR_EXPLANATION' })}
                />
              </div>

              {/* Bandeja "Mais presentes agora" ocupando 35% no Desktop */}
              <div className="lg:col-span-4 w-full">
                <PresentNeedsTray
                  selectedEntries={state.selectedEntries}
                  onRemoveEntry={(id) => dispatch({ type: 'REMOVE_ENTRY', entryId: id })}
                  onProceed={() => dispatch({ type: 'SET_STEP', step: 'prioritizing' })}
                  focusEntryId={state.focusEntryId}
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ETAPA 3: PRIORITIZING (Organização Opcional por Presença)
            ======================================================== */}
        {state.step === 'prioritizing' && (
          <div className="w-full flex-1 flex flex-col justify-center">
            <NeedPriorityControls
              entries={state.selectedEntries}
              ordered={state.ordered}
              onSetOrdered={(ord) => dispatch({ type: 'SET_ORDERED', ordered: ord })}
              onMoveEntry={(id, dir) =>
                dispatch({ type: 'MOVE_ENTRY', entryId: id, direction: dir })
              }
              focusEntryId={state.focusEntryId}
              onSetFocusEntry={(id) =>
                dispatch({ type: 'SET_FOCUS_ENTRY', entryId: id })
              }
              onBack={() => dispatch({ type: 'SET_STEP', step: 'selecting' })}
              onProceed={() => dispatch({ type: 'SET_STEP', step: 'optionalStep' })}
            />
          </div>
        )}

        {/* ========================================================
            ETAPA 4: OPTIONAL STEP (Existe um pequeno gesto possível?)
            ======================================================== */}
        {state.step === 'optionalStep' && (
          <div className="w-full flex-1 flex flex-col justify-center">
            <SmallStepForm
              stateType={state.stateType}
              entries={state.selectedEntries}
              focusEntryId={state.focusEntryId}
              smallStep={state.smallStep}
              onChangeSmallStep={(txt) =>
                dispatch({ type: 'SET_SMALL_STEP', text: txt })
              }
              onBack={() => {
                if (state.stateType === 'unsure') {
                  dispatch({ type: 'SET_STEP', step: 'selecting' });
                } else {
                  dispatch({ type: 'SET_STEP', step: 'prioritizing' });
                }
              }}
              onProceed={() => dispatch({ type: 'SET_STEP', step: 'reviewing' })}
            />
          </div>
        )}

        {/* ========================================================
            ETAPA 5: REVIEWING (Síntese e Salvamento Privado)
            ======================================================== */}
        {state.step === 'reviewing' && (
          <div className="w-full flex-1 flex flex-col justify-center">
            <NeedsSummary
              stateType={state.stateType}
              entries={state.selectedEntries}
              ordered={state.ordered}
              focusEntryId={state.focusEntryId}
              smallStep={state.smallStep}
              isSaving={state.isSaving}
              saveError={state.saveError}
              isSaved={false}
              onSaveToHistory={handleSaveToHistory}
              onEditChoices={() => dispatch({ type: 'SET_STEP', step: 'selecting' })}
              onExitWithoutSaving={handleExitExperience}
              onGoToHistory={() => setActiveView('history')}
            />
          </div>
        )}

        {/* ========================================================
            MODAL: Outra, em minhas palavras
            ======================================================== */}
        {state.showCustomModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="custom-need-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#262B22]/60 backdrop-blur-xs"
          >
            <form
              onSubmit={handleAddCustomNeed}
              className="bg-[#FDFAF4] rounded-[24px] border-2 border-[#96551F] p-6 max-w-md w-full text-left"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[#96551F]">
                  <Plus className="w-5 h-5 stroke-2" />
                  <h3
                    id="custom-need-title"
                    className="font-heading text-lg font-bold text-[#005A1F]"
                  >
                    Outra, em minhas palavras
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'CLOSE_CUSTOM_MODAL' })}
                  className="p-1 rounded-md text-[#6B6B63] hover:text-[#262B22] min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5 stroke-2" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="custom-label-input"
                    className="text-xs sm:text-sm font-semibold text-[#005A1F] block mb-1"
                  >
                    Nome da necessidade (até 80 caracteres)
                  </label>
                  <input
                    id="custom-label-input"
                    type="text"
                    required
                    maxLength={CURRENT_NEEDS_CONSTRAINTS.CUSTOM_LABEL_MAX_LENGTH}
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    placeholder="Ex: Silêncio interior, Movimento físico, Inspiração..."
                    className="w-full p-3 rounded-[16px] border-2 border-[#D8CFBE] bg-[#FDFAF4] text-sm text-[#262B22] focus:border-[#005A1F] focus:outline-none"
                    autoFocus
                  />
                  <div className="text-right text-[11px] text-[#6B6B63] mt-1">
                    {customLabel.length} / {CURRENT_NEEDS_CONSTRAINTS.CUSTOM_LABEL_MAX_LENGTH}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="custom-desc-input"
                    className="text-xs sm:text-sm font-semibold text-[#005A1F] block mb-1"
                  >
                    Descrição breve ou detalhe (opcional, até 200 caracteres)
                  </label>
                  <textarea
                    id="custom-desc-input"
                    rows={2}
                    maxLength={CURRENT_NEEDS_CONSTRAINTS.CUSTOM_DESC_MAX_LENGTH}
                    value={customDesc}
                    onChange={(e) => setCustomDesc(e.target.value)}
                    placeholder="O que isso representa para você neste momento?"
                    className="w-full p-3 rounded-[16px] border-2 border-[#D8CFBE] bg-[#FDFAF4] text-sm text-[#262B22] focus:border-[#005A1F] focus:outline-none"
                  />
                  <div className="text-right text-[11px] text-[#6B6B63] mt-1">
                    {customDesc.length} / {CURRENT_NEEDS_CONSTRAINTS.CUSTOM_DESC_MAX_LENGTH}
                  </div>
                </div>

                <p className="text-[11px] text-[#6B6B63] italic">
                  Essa opção é pessoal e não será publicada no catálogo geral de outros alunos.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t-2 border-[#D8CFBE]">
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'CLOSE_CUSTOM_MODAL' })}
                  className="px-4 py-2.5 rounded-full text-sm font-medium text-[#4B4B49] hover:bg-[#F1E9DB] min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!customLabel.trim()}
                  className="px-5 py-2.5 rounded-full text-sm font-semibold bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C] disabled:opacity-50 transition-colors min-h-[44px]"
                >
                  Adicionar à minha lista
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </InteractiveResourceShell>
  );
};
