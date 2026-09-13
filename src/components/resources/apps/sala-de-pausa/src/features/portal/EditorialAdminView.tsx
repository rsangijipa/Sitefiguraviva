/**
 * @license
 * Instituto Figura Viva - Painel de Gestão Editorial e Governança de Roteiros
 * O Administrador gerencia roteiros, títulos, versões e durações.
 * PRIVACIDADE RIGOROSA: O Admin NÃO TEM ACESSO às notas, reflexões ou dados íntimos dos alunos.
 */

import React, { useState } from 'react';
import { UserProfile, ResourceContentVersion } from '../../types';
import { supabaseClient } from '../../services/supabase/client';
import { PAUSE_PRACTICES } from '../interactive-resources/pause-room/editorialData';
import { BookOpen, ShieldAlert, Check, RefreshCw, BarChart3, Lock, AlertCircle } from 'lucide-react';

interface EditorialAdminViewProps {
  currentUser: UserProfile;
}

export const EditorialAdminView: React.FC<EditorialAdminViewProps> = ({ currentUser }) => {
  const [editorialVersions, setEditorialVersions] = useState<ResourceContentVersion[]>(() =>
    supabaseClient.getPublishedEditorialVersions()
  );
  const [selectedPracticeKey, setSelectedPracticeKey] = useState<keyof typeof PAUSE_PRACTICES>('breathing');
  const [invitationDraft, setInvitationDraft] = useState<string>(
    PAUSE_PRACTICES['breathing'].invitationText
  );
  const [guidanceDraft, setGuidanceDraft] = useState<string>(
    PAUSE_PRACTICES['breathing'].guidanceText
  );
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const telemetryLogs = supabaseClient.getTelemetryLogs();

  const handleSelectPractice = (key: keyof typeof PAUSE_PRACTICES) => {
    setSelectedPracticeKey(key);
    setInvitationDraft(PAUSE_PRACTICES[key].invitationText);
    setGuidanceDraft(PAUSE_PRACTICES[key].guidanceText);
    setSaveStatus(null);
  };

  const handleSaveEditorial = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.role !== 'admin') {
      setSaveStatus('Apenas administradores com perfil editorial têm permissão para publicar roteiros.');
      return;
    }

    // Atualiza a prática em memória / storage
    PAUSE_PRACTICES[selectedPracticeKey].invitationText = invitationDraft;
    PAUSE_PRACTICES[selectedPracticeKey].guidanceText = guidanceDraft;

    const result = supabaseClient.updateEditorialVersion({
      id: 'ed-pause-01',
      resource_key: 'sala-de-pausa',
      version: '1.0.1',
      status: 'published',
      title: 'Sala de Pausa',
      subtitle: 'Hub de pausas opcionais de 2 a 5 minutos no seu ritmo.',
      reviewer: currentUser.name,
      configuration: {
        lastEditedPractice: selectedPracticeKey,
        practicesCount: 5,
      },
      updated_at: new Date().toISOString(),
    });

    if (result.success) {
      setSaveStatus(`Roteiro de "${PAUSE_PRACTICES[selectedPracticeKey].title}" atualizado com sucesso na versão v1.0.1.`);
      setEditorialVersions(supabaseClient.getPublishedEditorialVersions());
    }
  };

  return (
    <div id="editorial-admin-view" className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 text-left">
      {/* Cabeçalho */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#96551F]">
            Governança & Conteúdo Editorial
          </span>
          <div className="w-8 h-1 confluencia-accent-line" aria-hidden="true" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-[#005A1F]">
          Gestão de Roteiros dos Recursos
        </h2>
        <p className="text-sm text-[#4B4B49] mt-1">
          Administração responsável dos textos de acolhimento e parâmetros das práticas.
        </p>
      </div>

      {/* Alerta estrito de conformidade com RLS e Proteção de Dados */}
      <div className="p-4 rounded-[20px] bg-[#FDFAF4] border-2 border-[#96551F] flex items-start gap-3.5 mb-8">
        <Lock className="w-5 h-5 text-[#96551F] shrink-0 mt-0.5" strokeWidth={2} />
        <div className="text-xs text-[#262B22]">
          <h3 className="font-bold text-sm text-[#96551F]">
            Isolamento Absoluto de Conteúdo Íntimo (RLS)
          </h3>
          <p className="mt-1 leading-relaxed text-[#4B4B49]">
            Conforme a política do Instituto Figura Viva, <strong>administradores, professores ou tutores não têm acesso a reflexões subjetivas, notas íntimas ou pontuações dos alunos</strong>. Não são geradas listas de desempenho ou rankings comparativos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: Seletor de Práticas */}
        <div className="lg:col-span-1 bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-[24px] p-5">
          <h3 className="font-serif font-bold text-base text-[#005A1F] mb-3">
            Práticas da Sala de Pausa
          </h3>
          <div className="space-y-2">
            {(Object.keys(PAUSE_PRACTICES) as Array<keyof typeof PAUSE_PRACTICES>).map((key) => {
              const practice = PAUSE_PRACTICES[key];
              const isSelected = selectedPracticeKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectPractice(key)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all text-xs flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#F1E9DB] border-[#005A1F] font-bold text-[#005A1F]'
                      : 'border-transparent hover:bg-[#F1E9DB]/60 text-[#262B22]'
                  }`}
                >
                  <span>{practice.title}</span>
                  <span className="text-[10px] text-[#96551F] font-semibold">v{practice.version}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-[#D8CFBE] text-xs text-[#6B6B63]">
            <p className="font-semibold text-[#005A1F] mb-1">Versões Publicadas no Portal:</p>
            {editorialVersions.map((v) => (
              <div key={v.id} className="py-1 flex justify-between">
                <span>{v.title}</span>
                <span className="font-mono text-[#005A1F]">v{v.version}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Coluna 2: Formulário de Edição Editorial */}
        <div className="lg:col-span-2 bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-[24px] p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#D8CFBE]">
            <h3 className="font-serif font-bold text-lg text-[#005A1F]">
              Editar Roteiro: {PAUSE_PRACTICES[selectedPracticeKey].title}
            </h3>
            <span className="text-xs px-2.5 py-1 bg-[#F1E9DB] text-[#96551F] rounded-full border border-[#D8CFBE] font-medium">
              Confluência v1.0
            </span>
          </div>

          <form onSubmit={handleSaveEditorial} className="space-y-4 text-xs">
            <div>
              <label htmlFor="invitation-text-input" className="block font-medium text-[#262B22] mb-1 text-sm">
                Texto de Abertura / Convite
              </label>
              <textarea
                id="invitation-text-input"
                value={invitationDraft}
                onChange={(e) => setInvitationDraft(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border-2 border-[#D8CFBE] focus:border-[#005A1F] text-sm text-[#262B22] focus:outline-none"
              />
              <p className="text-[#6B6B63] mt-1 text-[11px]">
                Deve manter tom de convite e observação livre, sem exigências de metas ou frequências respiratórias prescritas.
              </p>
            </div>

            <div>
              <label htmlFor="guidance-text-input" className="block font-medium text-[#262B22] mb-1 text-sm">
                Texto de Apoio / Orientação
              </label>
              <textarea
                id="guidance-text-input"
                value={guidanceDraft}
                onChange={(e) => setGuidanceDraft(e.target.value)}
                rows={2}
                className="w-full p-3 rounded-xl border-2 border-[#D8CFBE] focus:border-[#005A1F] text-sm text-[#262B22] focus:outline-none"
              />
            </div>

            {saveStatus && (
              <div className="p-3 bg-[#F1E9DB] border border-[#005A1F] rounded-xl text-[#005A1F] flex items-center gap-2">
                <Check className="w-4 h-4 text-[#005A1F] shrink-0" />
                <span>{saveStatus}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] text-[#6B6B63]">
                {currentUser.role !== 'admin' && (
                  <span className="text-[#96551F]">Apenas administradores podem gravar alterações.</span>
                )}
              </div>
              <button
                type="submit"
                disabled={currentUser.role !== 'admin'}
                className="px-5 py-2.5 rounded-xl bg-[#96551F] text-[#FDFAF4] hover:bg-[#96551F]/90 disabled:opacity-50 font-medium text-sm transition-colors min-h-[44px]"
              >
                Publicar versão do roteiro
              </button>
            </div>
          </form>

          {/* Telemetria Operacional Agregada (Não invasiva) */}
          <div className="mt-8 pt-6 border-t border-[#D8CFBE]">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-[#005A1F]" strokeWidth={2} />
              <h4 className="font-serif font-bold text-sm text-[#005A1F]">
                Estatísticas Operacionais Agregadas
              </h4>
            </div>
            <p className="text-xs text-[#6B6B63] mb-3">
              Métricas técnicas de disponibilidade do recurso (sem identificação de alunos ou conteúdos íntimos).
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-3 bg-[#F1E9DB] rounded-xl border border-[#D8CFBE]">
                <span className="text-[10px] text-[#6B6B63] block">Total Eventos</span>
                <strong className="text-lg text-[#005A1F] font-bold">{telemetryLogs.length}</strong>
              </div>
              <div className="p-3 bg-[#F1E9DB] rounded-xl border border-[#D8CFBE]">
                <span className="text-[10px] text-[#6B6B63] block">Iniciados</span>
                <strong className="text-lg text-[#005A1F] font-bold">
                  {telemetryLogs.filter((l) => l.eventType === 'resource_started').length}
                </strong>
              </div>
              <div className="p-3 bg-[#F1E9DB] rounded-xl border border-[#D8CFBE]">
                <span className="text-[10px] text-[#6B6B63] block">Concluídos</span>
                <strong className="text-lg text-[#07614C] font-bold">
                  {telemetryLogs.filter((l) => l.eventType === 'resource_completed').length}
                </strong>
              </div>
              <div className="p-3 bg-[#F1E9DB] rounded-xl border border-[#D8CFBE]">
                <span className="text-[10px] text-[#6B6B63] block">Voluntários</span>
                <strong className="text-lg text-[#96551F] font-bold">
                  {telemetryLogs.filter((l) => l.eventType === 'resource_abandoned').length}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
