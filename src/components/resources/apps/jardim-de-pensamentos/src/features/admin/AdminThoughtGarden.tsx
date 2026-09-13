import React, { useState, useEffect } from 'react';
import { EditorialContentConfig } from '../interactive-resources/thought-garden/types';
import {
  getEditorialConfig,
  updateEditorialConfig,
  DEFAULT_EDITORIAL_CONFIG,
} from '../interactive-resources/thought-garden/repository';
import {
  Settings,
  ArrowLeft,
  Save,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  FileText,
  BarChart3,
  Sliders,
} from 'lucide-react';

interface AdminThoughtGardenProps {
  onBackToPortal: () => void;
  onOpenGardenPreview: () => void;
}

export const AdminThoughtGarden: React.FC<AdminThoughtGardenProps> = ({
  onBackToPortal,
  onOpenGardenPreview,
}) => {
  const [config, setConfig] = useState<EditorialContentConfig>(DEFAULT_EDITORIAL_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'parameters' | 'telemetry'>('content');
  const [telemetryCount, setTelemetryCount] = useState<{
    started: number;
    completed: number;
    repeated: number;
  }>({ started: 0, completed: 0, repeated: 0 });

  useEffect(() => {
    getEditorialConfig().then((cfg) => setConfig(cfg));

    // Carrega telemetria agregada anônima (sem conteúdo)
    try {
      const raw = localStorage.getItem('figura_viva_garden_telemetry');
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          const started = list.filter((l) => l.event === 'resource_started').length;
          const completed = list.filter((l) => l.event === 'resource_completed').length;
          const repeated = list.filter((l) => l.event === 'resource_repeated').length;
          setTelemetryCount({ started, completed, repeated });
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      const updated = await updateEditorialConfig(config);
      setConfig(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch {
      alert('Erro ao salvar configurações editoriais.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Deseja restaurar os textos e parâmetros editoriais originais da versão 1.0.0?')) {
      setConfig(DEFAULT_EDITORIAL_CONFIG);
    }
  };

  return (
    <div className="w-full min-h-[100dvh] bg-[#FDFAF4] text-[#262B22] flex flex-col select-text">
      {/* Cabeçalho Administrativo */}
      <header className="w-full bg-[#FDFAF4] border-b-2 border-[#D8CFBE] px-4 py-3 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToPortal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#005A1F] hover:bg-[#F1E9DB] rounded-full transition-colors min-h-[44px]"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2px]" />
              <span>Voltar ao Portal</span>
            </button>

            <div className="h-5 w-[2px] bg-[#D8CFBE]" />

            <div>
              <span className="text-xs font-semibold text-[#96551F] uppercase tracking-wider block">
                Gestão Editorial • Confluência
              </span>
              <h1 className="text-lg sm:text-xl font-bold font-fraunces text-[#005A1F]">
                Administração: Jardim de Pensamentos
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenGardenPreview}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F1E9DB] hover:bg-[#D8CFBE] text-[#005A1F] text-xs font-semibold rounded-full border border-[#D8CFBE] transition-colors min-h-[44px]"
          >
            Visualizar no Jardim
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {/* Banner de Conformidade com a Política de Privacidade Figura Viva */}
        <div className="mb-6 p-4 bg-[#F1E9DB]/80 border-2 border-[#005A1F] rounded-[24px] flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-[#005A1F] shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-[#4B4B49] leading-relaxed">
            <h2 className="font-bold text-[#005A1F] text-sm mb-0.5">
              Isolamento Rigoroso de Conteúdo Íntimo
            </h2>
            <p>
              Conforme o mandato ético do Instituto Figura Viva, <strong>não existe biblioteca administrativa de pensamentos dos alunos</strong>. Textos oficiais e configurações editoriais nunca se misturam aos registros pessoais. Painéis administrativos gerenciam apenas textos institucionais, versões e parâmetros de experiência.
            </p>
          </div>
        </div>

        {/* Notificação de Sucesso */}
        {savedSuccess && (
          <div
            role="status"
            className="mb-6 p-3 bg-[#F1E9DB] border-2 border-[#005A1F] rounded-xl flex items-center gap-2 text-xs font-bold text-[#005A1F]"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Configurações editoriais publicadas com sucesso!</span>
          </div>
        )}

        {/* Abas do Painel */}
        <div className="flex items-center gap-2 border-b border-[#D8CFBE] mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 -mb-[2px] transition-colors min-h-[44px] ${
              activeTab === 'content'
                ? 'border-[#005A1F] text-[#005A1F]'
                : 'border-transparent text-[#6B6B63] hover:text-[#262B22]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Textos e Instruções Oficiais</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('parameters')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 -mb-[2px] transition-colors min-h-[44px] ${
              activeTab === 'parameters'
                ? 'border-[#005A1F] text-[#005A1F]'
                : 'border-transparent text-[#6B6B63] hover:text-[#262B22]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Parâmetros de Sessão</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('telemetry')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 -mb-[2px] transition-colors min-h-[44px] ${
              activeTab === 'telemetry'
                ? 'border-[#005A1F] text-[#005A1F]'
                : 'border-transparent text-[#6B6B63] hover:text-[#262B22]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Telemetria Agregada</span>
          </button>
        </div>

        {/* Formulário Editorial */}
        {activeTab === 'content' && (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="p-6 bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-[24px] space-y-4">
              <h2 className="text-base font-bold font-fraunces text-[#005A1F]">
                Cabeçalho e Abertura
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#96551F] uppercase mb-1">
                    Nome da Experiência
                  </label>
                  <input
                    type="text"
                    value={config.title}
                    onChange={(e) => setConfig({ ...config, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-xl focus:border-[#005A1F]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#96551F] uppercase mb-1">
                    Versão Editorial
                  </label>
                  <input
                    type="text"
                    value={config.version}
                    onChange={(e) => setConfig({ ...config, version: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-xl focus:border-[#005A1F]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#96551F] uppercase mb-1">
                  Frase de Abertura
                </label>
                <input
                  type="text"
                  value={config.opening_prompt}
                  onChange={(e) => setConfig({ ...config, opening_prompt: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-xl focus:border-[#005A1F]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#96551F] uppercase mb-1">
                  Instrução de Apoio
                </label>
                <textarea
                  value={config.support_text}
                  onChange={(e) => setConfig({ ...config, support_text: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-xl focus:border-[#005A1F] resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#96551F] uppercase mb-1">
                  Nota Ética de Apoio
                </label>
                <textarea
                  value={config.ethical_note}
                  onChange={(e) => setConfig({ ...config, ethical_note: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-xl focus:border-[#005A1F] resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#96551F] uppercase mb-1">
                  Placeholder do Compositor (não usar exemplos íntimos)
                </label>
                <input
                  type="text"
                  value={config.placeholder_text}
                  onChange={(e) => setConfig({ ...config, placeholder_text: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-xl focus:border-[#005A1F]"
                  required
                />
              </div>
            </div>

            <div className="p-6 bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-[24px] space-y-4">
              <h2 className="text-base font-bold font-fraunces text-[#005A1F]">
                Mensagem de Encerramento
              </h2>

              <div>
                <label className="block text-xs font-semibold text-[#96551F] uppercase mb-1">
                  Título de Fechamento
                </label>
                <input
                  type="text"
                  value={config.closing_title}
                  onChange={(e) => setConfig({ ...config, closing_title: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-xl focus:border-[#005A1F]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#96551F] uppercase mb-1">
                  Texto de Apoio ao Fechamento
                </label>
                <textarea
                  value={config.closing_support}
                  onChange={(e) => setConfig({ ...config, closing_support: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-xl focus:border-[#005A1F] resize-none"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#6B6B63] hover:text-[#262B22] min-h-[44px]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restaurar Padrões Confluência</span>
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#005A1F] hover:bg-[#07614C] text-[#FDFAF4] font-medium rounded-full transition-colors min-h-[44px]"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Salvando...' : 'Salvar Alterações Editoriais'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Parâmetros de Sessão */}
        {activeTab === 'parameters' && (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="p-6 bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-[24px] space-y-4">
              <h2 className="text-base font-bold font-fraunces text-[#005A1F]">
                Limites Técnicos & Capacidade
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#96551F] uppercase mb-1">
                    Limite de Caracteres por Folha
                  </label>
                  <input
                    type="number"
                    value={config.max_characters}
                    onChange={(e) => setConfig({ ...config, max_characters: Number(e.target.value) })}
                    min={50}
                    max={1000}
                    className="w-full px-3 py-2 text-sm bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-xl focus:border-[#005A1F]"
                  />
                  <span className="text-[11px] text-[#6B6B63]">Padrão: 500 caracteres</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#96551F] uppercase mb-1">
                    Máximo de Folhas por Sessão
                  </label>
                  <input
                    type="number"
                    value={config.max_session_leaves}
                    onChange={(e) => setConfig({ ...config, max_session_leaves: Number(e.target.value) })}
                    min={5}
                    max={50}
                    className="w-full px-3 py-2 text-sm bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-xl focus:border-[#005A1F]"
                  />
                  <span className="text-[11px] text-[#6B6B63]">Padrão: 20 folhas efêmeras</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#96551F] uppercase mb-1">
                    Folhas Visuais Simultâneas (Desktop)
                  </label>
                  <input
                    type="number"
                    value={config.max_visual_leaves_desktop}
                    onChange={(e) => setConfig({ ...config, max_visual_leaves_desktop: Number(e.target.value) })}
                    min={3}
                    max={15}
                    className="w-full px-3 py-2 text-sm bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-xl focus:border-[#005A1F]"
                  />
                  <span className="text-[11px] text-[#6B6B63]">Padrão: 8 folhas</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#96551F] uppercase mb-1">
                    Folhas Visuais Simultâneas (Mobile)
                  </label>
                  <input
                    type="number"
                    value={config.max_visual_leaves_mobile}
                    onChange={(e) => setConfig({ ...config, max_visual_leaves_mobile: Number(e.target.value) })}
                    min={1}
                    max={6}
                    className="w-full px-3 py-2 text-sm bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-xl focus:border-[#005A1F]"
                  />
                  <span className="text-[11px] text-[#6B6B63]">Padrão: 3 folhas</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#005A1F] hover:bg-[#07614C] text-[#FDFAF4] font-medium rounded-full transition-colors min-h-[44px]"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Parâmetros</span>
              </button>
            </div>
          </form>
        )}

        {/* Telemetria Agregada */}
        {activeTab === 'telemetry' && (
          <div className="space-y-6">
            <div className="p-6 bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-[24px]">
              <h2 className="text-base font-bold font-fraunces text-[#005A1F] mb-2">
                Estatísticas Agregadas Anônimas
              </h2>
              <p className="text-xs text-[#4B4B49] mb-6 leading-relaxed">
                Em conformidade com a privacidade ética do Instituto, a telemetria não coleta texto, palavras-chave, cliques individuais, sentimentos ou identidades pessoais.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-[#F1E9DB]/60 border-2 border-[#D8CFBE] rounded-[24px] text-center">
                  <span className="text-xs font-semibold text-[#96551F] uppercase block mb-1">
                    Experiências Iniciadas
                  </span>
                  <span className="text-3xl font-bold font-fraunces text-[#005A1F]">
                    {telemetryCount.started}
                  </span>
                </div>

                <div className="p-5 bg-[#F1E9DB]/60 border-2 border-[#D8CFBE] rounded-[24px] text-center">
                  <span className="text-xs font-semibold text-[#07614C] uppercase block mb-1">
                    Experiências Encerradas
                  </span>
                  <span className="text-3xl font-bold font-fraunces text-[#07614C]">
                    {telemetryCount.completed}
                  </span>
                </div>

                <div className="p-5 bg-[#F1E9DB]/60 border-2 border-[#D8CFBE] rounded-[24px] text-center">
                  <span className="text-xs font-semibold text-[#4B4B49] uppercase block mb-1">
                    Revisitas ao Jardim
                  </span>
                  <span className="text-3xl font-bold font-fraunces text-[#4B4B49]">
                    {telemetryCount.repeated}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
