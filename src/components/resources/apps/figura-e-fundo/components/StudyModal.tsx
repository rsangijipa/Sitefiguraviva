import React from "react";
import { X, BookOpen, Eye, Layers, Compass, Sparkles } from "lucide-react";

interface StudyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudyModal: React.FC<StudyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#262B22]/50  transition-all duration-300">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#FDFAF4] rounded-2xl border border-[#F1E9DB]  p-6 sm:p-8 text-[#262B22]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="btn-close-study-modal-top"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#6B6B63] hover:text-[#262B22] hover:bg-[#F1E9DB] transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 border-b border-[#F1E9DB] pb-5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#F1E9DB] text-xs text-[#6B6B63] font-medium tracking-wide mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>MODO ESTUDO • FUNDAMENTOS TEÓRICOS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-[#262B22] font-medium tracking-tight">
            A Dinâmica de Figura e Fundo
          </h2>
          <p className="text-sm text-[#6B6B63] mt-1">
            Como a percepção visual organiza o caos sensorial em significado e
            presença.
          </p>
        </div>

        {/* Modal Content */}
        <div className="space-y-6 text-[#4B4B49] text-sm sm:text-base leading-relaxed">
          {/* Section 1 */}
          <div className="p-4 rounded-xl bg-[#FDFAF4] border border-[#F1E9DB]">
            <h3 className="font-serif text-lg text-[#262B22] font-medium flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-[#6B6B63]" />
              1. A Origem Perceptiva (Gestalt e Edgar Rubin)
            </h3>
            <p className="text-sm text-[#4B4B49] leading-relaxed">
              No início do século XX, o psicólogo dinamarquês{" "}
              <strong>Edgar Rubin (1915)</strong> e os pioneiros da psicologia
              da <strong>Gestalt</strong> (Wertheimer, Koffka e Köhler)
              investigaram por que não enxergamos o mundo como uma colcha plana
              de manchas desconexas, mas sim como objetos delimitados situados
              no espaço.
            </p>
            <p className="text-sm text-[#4B4B49] mt-2 leading-relaxed">
              Eles constataram que a mente humana realiza uma divisão espontânea
              e imediata de qualquer campo visual em dois pólos constitutivos: a{" "}
              <strong>Figura</strong> e o <strong>Fundo</strong>.
            </p>
          </div>

          {/* Section 2 */}
          <div className="p-4 rounded-xl bg-[#FDFAF4] border border-[#F1E9DB]">
            <h3 className="font-serif text-lg text-[#262B22] font-medium flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-[#4B4B49]" />
              2. Características Estruturais de Cada Instância
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div className="p-3.5 rounded-lg bg-[#FDFAF4] border border-[#F1E9DB]">
                <h4 className="font-medium text-xs tracking-wider uppercase text-[#6B6B63] mb-1.5">
                  A Figura (Gestalt)
                </h4>
                <ul className="text-xs space-y-1.5 text-[#4B4B49]">
                  <li>• Possui contorno nítido que parece pertencer a ela.</li>
                  <li>• Dá a impressão de avançar em direção ao observador.</li>
                  <li>• Tem caráter de 'coisa', é memorizável e recortada.</li>
                  <li>• Centraliza a atenção voluntária ou reflexiva.</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-lg bg-[#FDFAF4] border border-[#F1E9DB]">
                <h4 className="font-medium text-xs tracking-wider uppercase text-[#6B6B63] mb-1.5">
                  O Fundo (Grund)
                </h4>
                <ul className="text-xs space-y-1.5 text-[#4B4B49]">
                  <li>• Parece amorfo e estende-se continuamente por trás.</li>
                  <li>
                    • Não desaparece: funciona como sustentação silenciosa.
                  </li>
                  <li>• É menos retido na memória imediata.</li>
                  <li>• Define o contraste e a respiração do todo.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="p-4 rounded-xl bg-[#FDFAF4] border border-[#F1E9DB]">
            <h3 className="font-serif text-lg text-[#262B22] font-medium flex items-center gap-2 mb-2">
              <Compass className="w-4 h-4 text-[#4B4B49]" />
              3. Forças que Fazem Algo Emergir como Figura
            </h3>
            <p className="text-sm text-[#4B4B49] mb-3">
              Nesta experiência interativa, você explorou quatro vetores de
              articulação perceptiva:
            </p>
            <div className="space-y-2 text-xs text-[#4B4B49]">
              <div className="flex gap-2">
                <span className="font-semibold text-[#262B22] shrink-0">
                  Contraste:
                </span>
                <span>
                  Diferenças acentuadas de valor tonal ou luminosidade atraem a
                  fóvea ocular.
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-[#262B22] shrink-0">
                  Proximidade:
                </span>
                <span>
                  Partículas próximas entre si são fundidas cognitivamente em um
                  único corpo.
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-[#262B22] shrink-0">
                  Escala:
                </span>
                <span>
                  Elementos menores e concentrados destacam-se como figuras
                  sobre massas amplas.
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-[#262B22] shrink-0">
                  Movimento (Destino Comum):
                </span>
                <span>
                  O elemento que oscila ou flutua quebra a inércia do campo e se
                  torna figura viva instantaneamente.
                </span>
              </div>
            </div>
          </div>

          {/* Section 4 - Philosophical insight */}
          <div className="p-4 rounded-xl bg-[#F1E9DB] border border-[#D8CFBE]">
            <h3 className="font-serif text-lg text-[#262B22] font-medium flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-[#96551F]" />
              4. A Reflexão Fenomenológica
            </h3>
            <blockquote className="italic font-serif text-[#4B4B49] border-l-2 border-[#6B6B63] pl-3 py-1 my-2 text-sm sm:text-base">
              “Quando algo se torna figura, o restante não desaparece: permanece
              como fundo.”
            </blockquote>
            <p className="text-xs text-[#6B6B63] leading-relaxed mt-2">
              Como apontou o filósofo <strong>Maurice Merleau-Ponty</strong> na{" "}
              <em>Fenomenologia da Percepção</em>, nossa consciência não é uma
              câmera neutra. Toda presença é co-presença: o que escolhemos
              iluminar repousa sobre a totalidade que acolhe e sustenta o foco.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-[#F1E9DB] flex justify-end">
          <button
            id="btn-return-from-study"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#262B22] hover:bg-[#262B22] text-[#FDFAF4] text-xs font-medium tracking-wide transition-colors"
          >
            Retornar à Experiência
          </button>
        </div>
      </div>
    </div>
  );
};
