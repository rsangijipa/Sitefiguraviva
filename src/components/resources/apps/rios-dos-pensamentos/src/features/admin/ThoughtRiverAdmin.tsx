/**
 * Painel Administrativo / CMS - Rio dos Pensamentos
 * Rota: /admin/recursos/rio-dos-pensamentos
 * Permite ao corpo docente/coordenação gerenciar conteúdo editorial e parâmetros do recurso.
 * Respeita RLS: o Administrador NÃO tem acesso ao conteúdo íntimo de nenhum aluno.
 */

import React, { useState, useEffect } from 'react';
import { ResourceContentVersion, UserProfile } from '../../types';
import { getPublishedResourceContent, updateEditorialContent } from '../interactive-resources/thought-river/repository';
import { ArrowLeft, Save, ShieldAlert, CheckCircle, Sliders } from 'lucide-react';

interface ThoughtRiverAdminProps {
  currentUser: UserProfile;
  onBackToPortal: () => void;
}

export const ThoughtRiverAdmin: React.FC<ThoughtRiverAdminProps> = ({
  currentUser,
  onBackToPortal,
}) => {
  const [config, setConfig] = useState<ResourceContentVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      const data = await getPublishedResourceContent();
      setConfig(data);
      setLoading(false);
    };
    fetchContent();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    setSaving(true);
    setStatusMessage(null);

    const res = await updateEditorialContent(config, currentUser);
    if (res.success) {
      setStatusMessage({ type: 'success', text: 'Parâmetros editoriais atualizados com sucesso e disponíveis no portal.' });
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Erro ao atualizar conteúdo editorial.' });
    }
    setSaving(false);
  };

  if (currentUser.role !== 'admin') {
    return (
      <div className="w-full max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#F1E9DB] border border-[#96551F] flex items-center justify-center mx-auto text-[#96551F]">
          <ShieldAlert className="w-6 h-6" strokeWidth={2} />
        </div>
        <h2 className="font-['Fraunces'] text-2xl text-[#96551F] font-bold">
          Acesso Restrito à Coordenação
        </h2>
        <p className="text-sm text-[#6B6B63]">
          Apenas usuários com papel administrativo têm autorização para editar parâmetros do recurso. Use o seletor de perfil no topo da página para alternar para a Coordenadora Maria Helena.
        </p>
        <button
          type="button"
          onClick={onBackToPortal}
          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-[16px] border-2 border-[#D8CFBE] text-sm font-medium hover:bg-[#F1E9DB] cursor-pointer"
        >
          Voltar ao Portal do Aluno
        </button>
      </div>
    );
  }

  if (loading || !config) {
    return (
      <div className="py-16 text-center text-sm text-[#6B6B63]">
        Carregando console editorial...
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 text-left space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between pb-4 border-b-2 border-[#D8CFBE]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToPortal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] rounded-[14px] border-2 border-[#D8CFBE] hover:bg-[#F1E9DB] text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#96551F]" strokeWidth={2} />
            <span>Portal</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase text-[#96551F]">Administração CMS</span>
              <span className="px-2 py-0.5 text-[11px] rounded-full bg-[#005A1F] text-[#FDFAF4]">Versão {config.version}</span>
            </div>
            <h1 className="font-['Fraunces'] text-2xl font-bold text-[#005A1F]">
              Configurações: Rio dos Pensamentos
            </h1>
          </div>
        </div>
      </div>

      {/* Alerta estrito de privacidade RLS */}
      <div className="p-4 rounded-[16px] bg-[#F1E9DB] border-2 border-[#96551F]/40 flex items-start gap-3 text-xs sm:text-sm text-[#262B22]">
        <ShieldAlert className="w-5 h-5 text-[#96551F] shrink-0 mt-0.5" strokeWidth={2} />
        <div>
          <p className="font-semibold text-[#96551F]">Privacidade protegida por RLS</p>
          <p className="text-xs text-[#6B6B63] mt-0.5 leading-relaxed">
            Por política de segurança e integridade ética do Instituto Figura Viva, coordenadores e professores têm acesso exclusivamente à curadoria editorial e parâmetros técnicos. Não há visualização de reflexões íntimas dos alunos nesta interface.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-[16px] text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-[#F1E9DB] border border-[#005A1F] text-[#005A1F]'
              : 'bg-[#F1E9DB] border border-[#96551F] text-[#96551F]'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0" strokeWidth={2} />
          ) : (
            <ShieldAlert className="w-4 h-4 shrink-0" strokeWidth={2} />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Formulário Editorial */}
      <form onSubmit={handleSave} className="card-confluencia p-6 sm:p-8 space-y-6 bg-[#FDFAF4]">
        <div className="flex items-center gap-2 pb-2 border-b border-[#D8CFBE]">
          <Sliders className="w-5 h-5 text-[#005A1F]" strokeWidth={2} />
          <h2 className="font-['Fraunces'] text-lg font-bold text-[#005A1F]">
            Roteiro e Textos de Acolhimento
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-[#96551F] mb-1">
              Título do Recurso
            </label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-[12px] border-2 border-[#D8CFBE] bg-[#FDFAF4] text-sm text-[#262B22] focus:border-[#005A1F]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#96551F] mb-1">
              Frase de Abertura (Tela de Entrada)
            </label>
            <input
              type="text"
              value={config.opening_text}
              onChange={(e) => setConfig({ ...config, opening_text: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-[12px] border-2 border-[#D8CFBE] bg-[#FDFAF4] text-sm text-[#262B22] focus:border-[#005A1F]"
              required
            />
            <p className="text-[11px] text-[#6B6B63] mt-1">Padrão: "Você pode observar o que passa."</p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#96551F] mb-1">
              Texto de Apoio (No Composer de Folhas)
            </label>
            <textarea
              rows={2}
              value={config.support_text}
              onChange={(e) => setConfig({ ...config, support_text: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-[12px] border-2 border-[#D8CFBE] bg-[#FDFAF4] text-sm text-[#262B22] focus:border-[#005A1F] resize-none"
              required
            />
            <p className="text-[11px] text-[#6B6B63] mt-1">Padrão: "Escreva uma frase, se quiser, e acompanhe uma folha. Não é preciso fazer o pensamento desaparecer."</p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#96551F] mb-1">
              Descrição Curta do Card (1 a 2 linhas)
            </label>
            <input
              type="text"
              value={config.card_description}
              onChange={(e) => setConfig({ ...config, card_description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-[12px] border-2 border-[#D8CFBE] bg-[#FDFAF4] text-sm text-[#262B22] focus:border-[#005A1F]"
              required
            />
          </div>
        </div>

        {/* Parâmetros Técnicos e Ambientais */}
        <div className="pt-4 border-t border-[#D8CFBE] space-y-4">
          <h2 className="font-['Fraunces'] text-lg font-bold text-[#005A1F]">
            Parâmetros Ambientais do Rio
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#96551F] mb-1">
                Limite de Folhas Simultâneas
              </label>
              <input
                type="number"
                min={4}
                max={8}
                value={config.max_active_leaves}
                onChange={(e) => setConfig({ ...config, max_active_leaves: Math.min(8, Math.max(4, parseInt(e.target.value) || 8)) })}
                className="w-full px-3.5 py-2.5 rounded-[12px] border-2 border-[#D8CFBE] bg-[#FDFAF4] text-sm text-[#262B22]"
              />
              <p className="text-[11px] text-[#6B6B63] mt-1">Limite estrito de até 8 para preservar serenidade.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#96551F] mb-1">
                Velocidade da Correnteza
              </label>
              <select
                value={config.water_flow_speed}
                onChange={(e) => setConfig({ ...config, water_flow_speed: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-[12px] border-2 border-[#D8CFBE] bg-[#FDFAF4] text-sm text-[#262B22]"
              >
                <option value="slow">Lenta (35-45s por travessia)</option>
                <option value="calm">Calma (25-35s por travessia)</option>
                <option value="moderate">Moderada (20-25s por travessia)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ação de salvar */}
        <div className="pt-4 border-t border-[#D8CFBE] flex justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-[16px] bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C] text-sm font-medium transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4 text-[#FDFAF4]" strokeWidth={2} />
            <span>{saving ? 'Publicando...' : 'Publicar Alterações no Portal'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
