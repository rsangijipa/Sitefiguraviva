import React, { useState } from "react";
import {
  Settings2,
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  Check,
  X,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Vignette, VignetteResponse } from "../types";

interface VignetteAdminProps {
  vignettes: Vignette[];
  onSaveVignette: (vignette: Partial<Vignette>) => Promise<void>;
  onUpdateVignette: (id: string, updates: Partial<Vignette>) => Promise<void>;
  onDeleteVignette: (id: string) => Promise<void>;
  onResetToDefaults: () => Promise<void>;
  isOpenNewModal: boolean;
  onCloseNewModal: () => void;
}

export const VignetteAdmin: React.FC<VignetteAdminProps> = ({
  vignettes,
  onSaveVignette,
  onUpdateVignette,
  onDeleteVignette,
  onResetToDefaults,
  isOpenNewModal,
  onCloseNewModal,
}) => {
  const [editingVignette, setEditingVignette] = useState<Vignette | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields for create/edit
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Vignette["category"]>(
    "Autonomia & Limites",
  );
  const [context, setContext] = useState("");
  const [situation, setSituation] = useState("");
  const [reflectiveQuestion, setReflectiveQuestion] = useState("");
  const [instituteCoreLesson, setInstituteCoreLesson] = useState("");

  // 3 responses form
  const [respA_action, setRespA_action] = useState("");
  const [respA_readings, setRespA_readings] = useState("");
  const [respA_institute, setRespA_institute] = useState("");

  const [respB_action, setRespB_action] = useState("");
  const [respB_readings, setRespB_readings] = useState("");
  const [respB_institute, setRespB_institute] = useState("");

  const [respC_action, setRespC_action] = useState("");
  const [respC_readings, setRespC_readings] = useState("");
  const [respC_institute, setRespC_institute] = useState("");
  const [respC_isObjective, setRespC_isObjective] = useState(true);

  const resetForm = () => {
    setTitle("");
    setCategory("Autonomia & Limites");
    setContext("");
    setSituation("");
    setReflectiveQuestion("");
    setInstituteCoreLesson("");

    setRespA_action("");
    setRespA_readings("");
    setRespA_institute("");

    setRespB_action("");
    setRespB_readings("");
    setRespB_institute("");

    setRespC_action("");
    setRespC_readings("");
    setRespC_institute("");
    setRespC_isObjective(true);

    setEditingVignette(null);
  };

  const startEdit = (v: Vignette) => {
    setEditingVignette(v);
    setTitle(v.title);
    setCategory(v.category);
    setContext(v.context);
    setSituation(v.situation);
    setReflectiveQuestion(v.reflectiveQuestion);
    setInstituteCoreLesson(v.instituteCoreLesson || "");

    const r0 = v.responses[0];
    const r1 = v.responses[1];
    const r2 = v.responses[2];

    if (r0) {
      setRespA_action(r0.actionText);
      setRespA_readings(r0.possibleReadings.join("\n"));
      setRespA_institute(r0.instituteAnalysis.didacticExplanation);
    }
    if (r1) {
      setRespB_action(r1.actionText);
      setRespB_readings(r1.possibleReadings.join("\n"));
      setRespB_institute(r1.instituteAnalysis.didacticExplanation);
    }
    if (r2) {
      setRespC_action(r2.actionText);
      setRespC_readings(r2.possibleReadings.join("\n"));
      setRespC_institute(r2.instituteAnalysis.didacticExplanation);
      setRespC_isObjective(r2.instituteAnalysis.hasObjectiveAnswer);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const responses: VignetteResponse[] = [
        {
          id: editingVignette
            ? editingVignette.responses[0]?.id || "resp-1"
            : "resp-a-" + Date.now(),
          movementType: "approach",
          relationalMovementLabel: "Aproximação / Confluência",
          actionText:
            respA_action || "Aproximação com acomodação da própria fronteira.",
          distanceDelta: -45,
          fieldDynamic: {
            label: "Fronteira Porosa / Aproximação Intensa",
            boundaryState: "confluent",
            separationDistance: 40,
            tensionLevel: "moderate",
            organicDescription:
              "O campo do Eu cede espaço para priorizar o Outro.",
          },
          possibleReadings: respA_readings
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          instituteAnalysis: {
            hasObjectiveAnswer: false,
            conceptName: "Confluência",
            didacticExplanation:
              respA_institute ||
              "Ajuste onde a fronteira se torna excessivamente porosa.",
          },
        },
        {
          id: editingVignette
            ? editingVignette.responses[1]?.id || "resp-2"
            : "resp-b-" + Date.now(),
          movementType: "withdrawal",
          relationalMovementLabel: "Afastamento / Retirada",
          actionText: respB_action || "Retirada para preservação de espaço.",
          distanceDelta: 65,
          fieldDynamic: {
            label: "Fronteira Rígida / Distanciamento",
            boundaryState: "withdrawn",
            separationDistance: 180,
            tensionLevel: "moderate",
            organicDescription:
              "Os dois campos se afastam para diminuir a pressão de contato.",
          },
          possibleReadings: respB_readings
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          instituteAnalysis: {
            hasObjectiveAnswer: false,
            conceptName: "Retirada e Egotismo",
            didacticExplanation:
              respB_institute || "Ajuste protetivo por afastamento ou rigidez.",
          },
        },
        {
          id: editingVignette
            ? editingVignette.responses[2]?.id || "resp-3"
            : "resp-c-" + Date.now(),
          movementType: "boundary",
          relationalMovementLabel: "Expressão Clara de Limite",
          actionText:
            respC_action || "Expressão honesta de limite mantendo a relação.",
          distanceDelta: 0,
          fieldDynamic: {
            label: "Fronteira Clara e Semipermeável",
            boundaryState: "clear",
            separationDistance: 110,
            tensionLevel: "low",
            organicDescription:
              "Presença autêntica com respeito aos contornos próprios.",
          },
          possibleReadings: respC_readings
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          instituteAnalysis: {
            hasObjectiveAnswer: respC_isObjective,
            objectiveAnswerNote: respC_isObjective
              ? "Didaticamente referenciada pelo Instituto."
              : undefined,
            conceptName: "Diferenciação e Contato Autêntico",
            didacticExplanation:
              respC_institute ||
              "Contato com demarcação consciente de fronteira.",
          },
        },
      ];

      const payload: Partial<Vignette> = {
        title,
        category,
        context,
        situation,
        responses,
        reflectiveQuestion,
        instituteCoreLesson,
      };

      if (editingVignette) {
        await onUpdateVignette(editingVignette.id, payload);
      } else {
        await onSaveVignette(payload);
      }

      resetForm();
      onCloseNewModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormActive = isOpenNewModal || editingVignette !== null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DDD1]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#EFE9DF] text-[#554D40]">
              <Settings2 className="w-4 h-4" />
            </span>
            <h2 className="font-serif text-2xl text-[#26231F] font-normal tracking-tight">
              Gestão de Vinhetas Didáticas
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#70675A] mt-1">
            Módulo administrativo para criação, personalização e curadoria
            pedagógica das situações relacionais.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            id="btn-admin-reset-defaults"
            onClick={() => setIsResetConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DDD5C7] text-xs text-[#635A4D] hover:bg-[#EAE4D9] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Originais</span>
          </button>

          {!isFormActive && (
            <button
              id="btn-admin-open-create"
              onClick={() => {
                resetForm();
                onCloseNewModal();
                setEditingVignette({} as Vignette);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#3C362F] text-[#FAF8F5] text-xs font-medium hover:bg-[#2B2721] transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Vinheta</span>
            </button>
          )}
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {isResetConfirmOpen && (
        <div className="p-4 bg-[#FBF6EE] border border-[#E8DDC9] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#5D4E3C]">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#A87938] shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-[#3B3022] block">
                Restaurar Vinhetas Originais do Instituto?
              </strong>
              <span>
                Esta ação redefinirá a biblioteca para as 5 vinhetas oficiais
                curadas pelo Instituto.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={() => setIsResetConfirmOpen(false)}
              className="px-3 py-1 rounded-lg border border-[#D5C6AF] text-[#554737] hover:bg-[#F2E8D7]"
            >
              Cancelar
            </button>
            <button
              id="btn-confirm-reset"
              onClick={async () => {
                await onResetToDefaults();
                setIsResetConfirmOpen(false);
              }}
              className="px-3 py-1 rounded-lg bg-[#8C5D3D] text-white font-medium hover:bg-[#72482E]"
            >
              Confirmar Restauração
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Form */}
      {isFormActive && (
        <form
          id="vignette-editor-form"
          onSubmit={handleFormSubmit}
          className="bg-white rounded-2xl border border-[#DED7C8] p-6 shadow-xs space-y-6"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#EFE9DF]">
            <h3 className="font-serif text-lg text-[#26221E] font-normal">
              {editingVignette?.id
                ? `Editar: ${editingVignette.title}`
                : "Criar Nova Vinheta Relacional"}
            </h3>
            <button
              type="button"
              onClick={() => {
                resetForm();
                onCloseNewModal();
              }}
              className="p-1 rounded-md text-[#877C6D] hover:bg-[#F2ECE1]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Basic Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#463D31] mb-1">
                Título da Vinheta:
              </label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex.: A Cobrança Velada no Grupo de Família"
                className="w-full text-xs p-2.5 rounded-lg border border-[#D9D1C2] focus:outline-none focus:border-[#7A6B59]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#463D31] mb-1">
                Categoria:
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as Vignette["category"])
                }
                className="w-full text-xs p-2.5 rounded-lg border border-[#D9D1C2] bg-white focus:outline-none focus:border-[#7A6B59]"
              >
                <option value="Trabalho & Profissional">
                  Trabalho & Profissional
                </option>
                <option value="Relações Afetivas">Relações Afetivas</option>
                <option value="Família & Convivência">
                  Família & Convivência
                </option>
                <option value="Amizades & Grupos">Amizades & Grupos</option>
                <option value="Autonomia & Limites">Autonomia & Limites</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#463D31] mb-1">
              Contexto Relacional Mais Amplo:
            </label>
            <textarea
              required
              rows={2}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Descreva a dinâmica prévia e o ambiente da relação..."
              className="w-full text-xs p-2.5 rounded-lg border border-[#D9D1C2] focus:outline-none focus:border-[#7A6B59]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#463D31] mb-1">
              Situação Concreta (O Evento):
            </label>
            <textarea
              required
              rows={2}
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="O que exatamente ocorre que mobiliza a necessidade de posicionamento?"
              className="w-full text-xs p-2.5 rounded-lg border border-[#D9D1C2] focus:outline-none focus:border-[#7A6B59]"
            />
          </div>

          {/* 3 Responses */}
          <div className="space-y-4 pt-3 border-t border-[#EDE7DC]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7A6E5D] block">
              3 Maneiras de Responder (Movimentos Relacionais)
            </span>

            {/* Response A: Aproximação / Confluência */}
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6DFD3] space-y-2.5">
              <span className="text-xs font-medium text-[#7C4E36] block">
                Movimento A: Aproximação / Confluência
              </span>
              <input
                required
                type="text"
                value={respA_action}
                onChange={(e) => setRespA_action(e.target.value)}
                placeholder="Ação concreta (ex: Acomodar-se, abrir mão do limite próprio, atender de imediato...)"
                className="w-full text-xs p-2 rounded-lg border border-[#D9D1C2] bg-white"
              />
              <textarea
                rows={2}
                value={respA_readings}
                onChange={(e) => setRespA_readings(e.target.value)}
                placeholder="Possíveis leituras fenomênicas (uma por linha)..."
                className="w-full text-xs p-2 rounded-lg border border-[#D9D1C2] bg-white"
              />
              <input
                type="text"
                value={respA_institute}
                onChange={(e) => setRespA_institute(e.target.value)}
                placeholder="Análise do Instituto sobre a confluência neste cenário..."
                className="w-full text-xs p-2 rounded-lg border border-[#D9D1C2] bg-white"
              />
            </div>

            {/* Response B: Afastamento / Silêncio */}
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6DFD3] space-y-2.5">
              <span className="text-xs font-medium text-[#3A5D54] block">
                Movimento B: Afastamento / Retirada
              </span>
              <input
                required
                type="text"
                value={respB_action}
                onChange={(e) => setRespB_action(e.target.value)}
                placeholder="Ação concreta (ex: Fechar-se, silenciar, afastar-se bruscamente, esquiva...)"
                className="w-full text-xs p-2 rounded-lg border border-[#D9D1C2] bg-white"
              />
              <textarea
                rows={2}
                value={respB_readings}
                onChange={(e) => setRespB_readings(e.target.value)}
                placeholder="Possíveis leituras fenomênicas (uma por linha)..."
                className="w-full text-xs p-2 rounded-lg border border-[#D9D1C2] bg-white"
              />
              <input
                type="text"
                value={respB_institute}
                onChange={(e) => setRespB_institute(e.target.value)}
                placeholder="Análise do Instituto sobre a retirada e rigidez neste cenário..."
                className="w-full text-xs p-2 rounded-lg border border-[#D9D1C2] bg-white"
              />
            </div>

            {/* Response C: Expressão de Limite */}
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6DFD3] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#52493C] block">
                  Movimento C: Expressão Consciente de Limite
                </span>
                <label className="flex items-center gap-1.5 text-xs text-[#52493C] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={respC_isObjective}
                    onChange={(e) => setRespC_isObjective(e.target.checked)}
                    className="accent-[#5B4E3E]"
                  />
                  <span>Referência didática do Instituto</span>
                </label>
              </div>
              <input
                required
                type="text"
                value={respC_action}
                onChange={(e) => setRespC_action(e.target.value)}
                placeholder="Ação concreta (ex: Dizer a verdade com calma, posicionar-se sem agredir...)"
                className="w-full text-xs p-2 rounded-lg border border-[#D9D1C2] bg-white"
              />
              <textarea
                rows={2}
                value={respC_readings}
                onChange={(e) => setRespC_readings(e.target.value)}
                placeholder="Possíveis leituras fenomênicas (uma por linha)..."
                className="w-full text-xs p-2 rounded-lg border border-[#D9D1C2] bg-white"
              />
              <input
                type="text"
                value={respC_institute}
                onChange={(e) => setRespC_institute(e.target.value)}
                placeholder="Fundamentação teórica do Instituto..."
                className="w-full text-xs p-2 rounded-lg border border-[#D9D1C2] bg-white"
              />
            </div>
          </div>

          {/* Reflective question and core lesson */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#EDE7DC]">
            <div>
              <label className="block text-xs font-medium text-[#463D31] mb-1">
                Pergunta Reflexiva:
              </label>
              <textarea
                required
                rows={2}
                value={reflectiveQuestion}
                onChange={(e) => setReflectiveQuestion(e.target.value)}
                placeholder="Uma pergunta para mobilizar autopercepção..."
                className="w-full text-xs p-2.5 rounded-lg border border-[#D9D1C2] focus:outline-none focus:border-[#7A6B59]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#463D31] mb-1">
                Síntese Conceitual do Instituto (Opcional):
              </label>
              <textarea
                rows={2}
                value={instituteCoreLesson}
                onChange={(e) => setInstituteCoreLesson(e.target.value)}
                placeholder="Diretriz sobre a fronteira de contato nesta dinâmica..."
                className="w-full text-xs p-2.5 rounded-lg border border-[#D9D1C2] focus:outline-none focus:border-[#7A6B59]"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EFE9DF]">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onCloseNewModal();
              }}
              className="px-4 py-2 rounded-lg border border-[#DDD5C7] text-xs text-[#635A4D] hover:bg-[#EFE9DF]"
            >
              Cancelar
            </button>
            <button
              id="btn-save-vignette-form"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-[#3C362F] text-white text-xs font-medium hover:bg-[#2B2721] transition-colors disabled:opacity-50"
            >
              {isSubmitting
                ? "Salvando..."
                : editingVignette?.id
                  ? "Atualizar Vinheta"
                  : "Salvar Nova Vinheta"}
            </button>
          </div>
        </form>
      )}

      {/* Table of Vignettes for Administration */}
      <div className="bg-white rounded-2xl border border-[#E1D9CC] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#EFE9DF] bg-[#FAF8F5] flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#736858]">
            Vinhetas Registradas ({vignettes.length})
          </span>
          <span className="text-xs text-[#8A8071]">
            Vinhetas administráveis sincronizadas
          </span>
        </div>

        <div className="divide-y divide-[#F0ECE4]">
          {vignettes.map((v) => (
            <div
              key={v.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FCFAF7] transition-colors"
            >
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-[#EDE7DC] text-[#554D40] border border-[#DDD4C5]">
                    {v.category}
                  </span>
                  {v.isDefault === false && (
                    <span className="text-[10px] text-[#8C6D45] font-medium">
                      Personalizada
                    </span>
                  )}
                </div>
                <h4 className="font-serif text-base text-[#24211D] font-normal">
                  {v.title}
                </h4>
                <p className="text-xs text-[#6F6659] line-clamp-1">
                  {v.situation}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  id={`btn-edit-${v.id}`}
                  onClick={() => startEdit(v)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#DDD5C7] text-xs text-[#52493D] hover:bg-[#EAE4D9]"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>

                <button
                  id={`btn-delete-${v.id}`}
                  onClick={() => onDeleteVignette(v.id)}
                  className="p-1.5 rounded-lg text-[#9E9484] hover:text-[#913E2E] hover:bg-[#FBEBE8]"
                  title="Excluir vinheta"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
