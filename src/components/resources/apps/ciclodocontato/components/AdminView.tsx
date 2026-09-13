import React, { useState } from "react";
import { ContactStage, ScenarioItem, ContactCycleConfig } from "../types";
import {
  ShieldCheck,
  Plus,
  Edit,
  Save,
  Eye,
  Settings,
  FileText,
  Check,
} from "lucide-react";

interface AdminViewProps {
  config: ContactCycleConfig;
  onUpdateConfig: (cfg: ContactCycleConfig) => void;
  stages: ContactStage[];
  onUpdateStage: (id: string, updates: Partial<ContactStage>) => void;
  scenarios: ScenarioItem[];
  onUpdateScenarios: (scenarios: ScenarioItem[]) => void;
  onPreviewAsStudent: () => void;
}

export function AdminView({
  config,
  onUpdateConfig,
  stages,
  onUpdateStage,
  scenarios,
  onUpdateScenarios,
  onPreviewAsStudent,
}: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "stages" | "scenarios" | "settings"
  >("overview");
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [stageForm, setStageForm] = useState<Partial<ContactStage>>({});
  const [savedMsg, setSavedMsg] = useState(false);

  const handleEditStage = (st: ContactStage) => {
    setEditingStageId(st.id);
    setStageForm(st);
  };

  const handleSaveStage = (id: string) => {
    onUpdateStage(id, stageForm);
    setEditingStageId(null);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#96551F]">
            <ShieldCheck size={14} aria-hidden="true" />
            Painel Administrativo · Ciclo do Contato
          </span>
          <h2 className="font-serif text-3xl font-bold text-[#262B22]">
            Gerenciamento do Recurso
          </h2>
        </div>

        <button
          type="button"
          onClick={onPreviewAsStudent}
          className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#005A1F] bg-[#005A1F] px-5 py-2.5 text-xs font-semibold text-[#FDFAF4] hover:bg-[#07614C]"
        >
          <Eye size={15} aria-hidden="true" />
          <span>Visualizar como aluno</span>
        </button>
      </div>

      {savedMsg && (
        <div className="mb-4 rounded-xl border-2 border-[#005A1F] bg-[#005A1F]/10 p-3 text-xs font-semibold text-[#005A1F] flex items-center gap-2">
          <Check size={15} aria-hidden="true" />
          <span>Alterações salvas com sucesso!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 border-b-2 border-[#F1E9DB] pb-4">
        {[
          ["overview", "Visão Geral"],
          ["stages", "Etapas"],
          ["scenarios", "Cenários e Práticas"],
          ["settings", "Configurações"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key as any)}
            className={`rounded-xl border-2 px-4 py-2 text-xs font-semibold transition ${
              activeTab === key
                ? "border-[#96551F] bg-[#96551F] text-[#FDFAF4]"
                : "border-[#F1E9DB] bg-[#FDFAF4] text-[#4B4B49] hover:border-[#96551F]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="rounded-[24px] border-2 border-[#F1E9DB] bg-[#FDFAF4] p-8 space-y-6">
          <h3 className="font-serif text-xl font-bold text-[#262B22]">
            Resumo do Recurso
          </h3>
          <p className="text-sm text-[#4B4B49]">
            Gerencie textos, momentos, vinhetas práticas e configurações
            pedagógicas do Ciclo do Contato para o Portal do Aluno.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="rounded-2xl border-2 border-[#F1E9DB] bg-[#F1E9DB]/30 p-4">
              <span className="block text-xs uppercase tracking-wider text-[#6B6B63]">
                Etapas cadastradas
              </span>
              <span className="font-serif text-2xl font-bold text-[#262B22]">
                {stages.length}
              </span>
            </div>
            <div className="rounded-2xl border-2 border-[#F1E9DB] bg-[#F1E9DB]/30 p-4">
              <span className="block text-xs uppercase tracking-wider text-[#6B6B63]">
                Cenários práticos
              </span>
              <span className="font-serif text-2xl font-bold text-[#262B22]">
                {scenarios.length}
              </span>
            </div>
            <div className="rounded-2xl border-2 border-[#F1E9DB] bg-[#F1E9DB]/30 p-4">
              <span className="block text-xs uppercase tracking-wider text-[#6B6B63]">
                Status
              </span>
              <span className="font-serif text-2xl font-bold text-[#005A1F] capitalize">
                {config.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "stages" && (
        <div className="space-y-4">
          <h3 className="font-serif text-xl font-bold text-[#262B22]">
            Etapas do Ciclo (Editáveis)
          </h3>
          {stages.map((st) => {
            const isEditing = editingStageId === st.id;
            return (
              <div
                key={st.id}
                className="rounded-[24px] border-2 border-[#F1E9DB] bg-[#FDFAF4] p-6"
              >
                <div className="flex items-center justify-between pb-4 border-b-2 border-[#F1E9DB]">
                  <div>
                    <span className="text-xs font-bold text-[#96551F]">
                      Posição {st.position}
                    </span>
                    <h4 className="font-serif text-xl font-bold text-[#262B22]">
                      {st.label}
                    </h4>
                  </div>
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={() => handleEditStage(st)}
                      className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#F1E9DB] px-3 py-1.5 text-xs font-semibold text-[#4B4B49] hover:border-[#96551F]"
                    >
                      <Edit size={14} aria-hidden="true" />
                      <span>Editar</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSaveStage(st.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#005A1F] bg-[#005A1F] px-4 py-1.5 text-xs font-semibold text-[#FDFAF4]"
                    >
                      <Save size={14} aria-hidden="true" />
                      <span>Salvar</span>
                    </button>
                  )}
                </div>

                {!isEditing ? (
                  <div className="mt-4 space-y-2 text-sm text-[#4B4B49]">
                    <p>
                      <b>Definição:</b> {st.shortDefinition}
                    </p>
                    <p>
                      <b>Pergunta:</b> “{st.reflectionQuestion}”
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#4B4B49] mb-1">
                        Rótulo / Nome
                      </label>
                      <input
                        type="text"
                        value={stageForm.label || ""}
                        onChange={(e) =>
                          setStageForm({ ...stageForm, label: e.target.value })
                        }
                        className="w-full rounded-xl border-2 border-[#F1E9DB] bg-[#FDFAF4] p-2.5 text-sm text-[#262B22]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#4B4B49] mb-1">
                        Definição Curta
                      </label>
                      <input
                        type="text"
                        value={stageForm.shortDefinition || ""}
                        onChange={(e) =>
                          setStageForm({
                            ...stageForm,
                            shortDefinition: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border-2 border-[#F1E9DB] bg-[#FDFAF4] p-2.5 text-sm text-[#262B22]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#4B4B49] mb-1">
                        Pergunta para Observar
                      </label>
                      <input
                        type="text"
                        value={stageForm.reflectionQuestion || ""}
                        onChange={(e) =>
                          setStageForm({
                            ...stageForm,
                            reflectionQuestion: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border-2 border-[#F1E9DB] bg-[#FDFAF4] p-2.5 text-sm text-[#262B22]"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "scenarios" && (
        <div className="rounded-[24px] border-2 border-[#F1E9DB] bg-[#FDFAF4] p-8 space-y-6">
          <h3 className="font-serif text-xl font-bold text-[#262B22]">
            Cenários de Aplicação
          </h3>
          <p className="text-sm text-[#4B4B49]">
            {scenarios.length} cenários práticos ativos para o modo Aplicar.
          </p>
          <div className="space-y-3">
            {scenarios.map((sc) => (
              <div
                key={sc.id}
                className="rounded-2xl border-2 border-[#F1E9DB] p-4 bg-[#FDFAF4]"
              >
                <h4 className="font-serif font-bold text-base text-[#262B22]">
                  {sc.title}
                </h4>
                <p className="text-xs text-[#4B4B49] mt-1">{sc.context}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="rounded-[24px] border-2 border-[#F1E9DB] bg-[#FDFAF4] p-8 space-y-6">
          <h3 className="font-serif text-xl font-bold text-[#262B22]">
            Configurações Gerais
          </h3>
          <div className="space-y-4 text-sm text-[#4B4B49]">
            <div>
              <label className="block text-xs font-semibold text-[#262B22] mb-1">
                Título do Recurso
              </label>
              <input
                type="text"
                value={config.title}
                onChange={(e) =>
                  onUpdateConfig({ ...config, title: e.target.value })
                }
                className="w-full rounded-xl border-2 border-[#F1E9DB] bg-[#FDFAF4] p-2.5 text-sm text-[#262B22]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#262B22] mb-1">
                Descrição
              </label>
              <textarea
                value={config.description}
                onChange={(e) =>
                  onUpdateConfig({ ...config, description: e.target.value })
                }
                rows={2}
                className="w-full rounded-xl border-2 border-[#F1E9DB] bg-[#FDFAF4] p-2.5 text-sm text-[#262B22]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
