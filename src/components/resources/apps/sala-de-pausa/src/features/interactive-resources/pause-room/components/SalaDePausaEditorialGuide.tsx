/**
 * @license
 * Instituto Figura Viva - Guia Editorial e Roteiros da Sala de Pausa (Registro Confluência)
 * Apresentação detalhada dos roteiros, diretrizes éticas e versionamento das práticas.
 */

import React, { useState } from "react";
import {
  BookOpen,
  Wind,
  Eye,
  Headphones,
  Activity,
  Coffee,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { PAUSE_PRACTICES, PRACTICE_ORDER } from "../editorialData";
import { PausePracticeId } from "../../../../types";

const PRACTICE_ICONS = {
  breathing: Wind,
  observing: Eye,
  listening: Headphones,
  movement: Activity,
  slowing: Coffee,
} as const;

interface SalaDePausaEditorialGuideProps {
  onSelectPracticeToStart?: (practiceId: PausePracticeId) => void;
}

export const SalaDePausaEditorialGuide: React.FC<
  SalaDePausaEditorialGuideProps
> = ({ onSelectPracticeToStart }) => {
  const [selectedPracticeId, setSelectedPracticeId] =
    useState<PausePracticeId>("breathing");

  const selectedPractice = PAUSE_PRACTICES[selectedPracticeId];

  const SelectedIcon = PRACTICE_ICONS[selectedPracticeId];

  return (
    <div
      id="sala-de-pausa-editorial-guide"
      className="w-full max-w-4xl mx-auto py-4 sm:py-6 text-left"
    >
      <div className="mb-6 text-center">
        <span className="text-xs uppercase tracking-wider text-[#96551F] font-bold">
          Diretrizes & Princípios Confluência
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl text-[#005A1F] font-bold mt-1">
          Guia Editorial dos Roteiros da Sala de Pausa
        </h2>
        <p className="text-sm text-[#4B4B49] mt-2 max-w-lg mx-auto leading-relaxed">
          Cada texto da Sala de Pausa foi redigido com cuidado editorial para
          convidar sem impor, sem diagnósticos clínicos e sem cobrança de
          produtividade.
        </p>
      </div>

      {/* Navegador de Práticas */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-[#D8CFBE]">
        {PRACTICE_ORDER.map((id) => {
          const practice = PAUSE_PRACTICES[id];
          const isCurrent = selectedPracticeId === id;
          const Icon = PRACTICE_ICONS[id];

          return (
            <button
              key={id}
              type="button"
              onClick={() => setSelectedPracticeId(id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[44px] whitespace-nowrap ${
                isCurrent
                  ? "bg-[#005A1F] text-[#FDFAF4] shadow-xs"
                  : "bg-[#FDFAF4] border-2 border-[#D8CFBE] text-[#4B4B49] hover:bg-[#F1E9DB]"
              }`}
            >
              <Icon className="w-4 h-4 text-inherit" strokeWidth={2} />
              <span>{practice.title}</span>
            </button>
          );
        })}
      </div>

      {/* Detalhamento Editorial da Prática Selecionada */}
      <div className="bg-[#FDFAF4] border-2 border-[#005A1F] rounded-[24px] p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-4 border-b border-[#D8CFBE]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F1E9DB] border-2 border-[#005A1F] flex items-center justify-center text-[#005A1F]">
              <SelectedIcon className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-[#96551F] font-bold">
                Roteiro Homologado v{selectedPractice.version}
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#005A1F]">
                Prática: {selectedPractice.title}
              </h3>
            </div>
          </div>

          {onSelectPracticeToStart && (
            <button
              type="button"
              onClick={() => onSelectPracticeToStart(selectedPracticeId)}
              className="px-4 py-2 rounded-xl bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C] transition-colors text-xs font-semibold min-h-[40px] self-start sm:self-auto"
            >
              Iniciar esta prática agora
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#96551F]">
                Texto de Abertura / Convite
              </h4>
              <p className="font-serif text-lg text-[#005A1F] font-semibold mt-1 p-3 rounded-xl bg-[#F1E9DB] border border-[#D8CFBE]">
                "{selectedPractice.invitationText}"
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#96551F]">
                Orientação Ética & Não-impositiva
              </h4>
              <p className="text-sm text-[#4B4B49] mt-1 leading-relaxed">
                {selectedPractice.guidanceText}
              </p>
            </div>
          </div>

          <div className="space-y-4 bg-[#F1E9DB]/40 rounded-2xl p-4 border border-[#D8CFBE]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#005A1F]">
              Parâmetros de Projeto (Confluência v1.0)
            </h4>

            <ul className="space-y-2 text-xs text-[#4B4B49]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#005A1F] shrink-0 mt-0.5" />
                <span>
                  <strong>Durações suportadas:</strong> 2 min (120s), 3 min
                  (180s), 5 min (300s) e modo aberto.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#005A1F] shrink-0 mt-0.5" />
                <span>
                  <strong>Acessibilidade alternativa:</strong>{" "}
                  {selectedPractice.capabilities.staticAlternative
                    ? "Alternativa estática disponível para redução de estímulos."
                    : "Interface textual completa sem dependência motora."}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#005A1F] shrink-0 mt-0.5" />
                <span>
                  <strong>Áudio:</strong>{" "}
                  {selectedPractice.capabilities.audio
                    ? "Áudio ambiente opcional de igarapé gerado sinteticamente."
                    : "Sem áudio obrigatório; repouso auditivo."}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#005A1F] shrink-0 mt-0.5" />
                <span>
                  <strong>Autonomia:</strong> Usuário pode pausar, trocar de
                  prática ou finalizar a qualquer segundo.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Princípios Editoriais Fundamentais */}
      <div className="p-5 rounded-[24px] bg-[#F1E9DB] border-2 border-[#D8CFBE] flex items-start gap-4">
        <ShieldCheck
          className="w-6 h-6 text-[#005A1F] shrink-0 mt-0.5"
          strokeWidth={2}
        />
        <div className="text-xs space-y-1">
          <h4 className="font-serif font-bold text-sm text-[#005A1F]">
            Compromisso Editorial do Instituto Figura Viva
          </h4>
          <p className="text-[#4B4B49] leading-relaxed">
            1. <strong>Não-prescrição:</strong> Não há afirmações de cura,
            diagnósticos médicos ou recomendações terapêuticas individuais.
          </p>
          <p className="text-[#4B4B49] leading-relaxed">
            2. <strong>Linguagem aberta:</strong> Usamos verbos de convite
            ("perceba", "note", "se for confortável") em vez de ordens
            imperativas estritas.
          </p>
          <p className="text-[#4B4B49] leading-relaxed">
            3. <strong>Sem vigilância:</strong> Professores e coordenadores não
            recebem relatórios de frequência de pausas dos alunos.
          </p>
        </div>
      </div>
    </div>
  );
};
