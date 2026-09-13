import React from "react";
import {
  Sparkles,
  Shield,
  Compass,
  BookMarked,
  Layers,
  CheckCircle2,
} from "lucide-react";

export const TheoryGuide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#E3DDD1]">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-[#EFE9DF] text-[#554D40]">
            <Sparkles className="w-4 h-4" />
          </span>
          <h2 className="font-serif text-2xl text-[#26231F] font-normal tracking-tight">
            Fundamentos Didáticos do Instituto
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#70675A] mt-1">
          Diretrizes teóricas para a reflexão sobre fronteiras de contato,
          ambiguidade relacional e diferenciação.
        </p>
      </div>

      {/* Grid of Core Concepts */}
      <div className="space-y-6">
        {/* Concept 1: The Boundary */}
        <section className="bg-white rounded-2xl border border-[#E1D9CC] p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7D6B58]">
            <Shield className="w-4 h-4 text-[#8C745E]" />
            <span>1. O que é uma Fronteira de Contato?</span>
          </div>
          <h3 className="font-serif text-lg text-[#25221E] font-normal">
            A Fronteira não é uma barreira de cimento: é o local onde o encontro
            acontece
          </h3>
          <p className="text-xs sm:text-sm text-[#4A4236] leading-relaxed">
            Na perspectiva relacional da Gestalt e da psicologia fenomênica, a
            fronteira de contato é o ponto em que o indivíduo experimenta o
            "não-eu" e se diferencia do ambiente. Ela não separa as pessoas como
            muralhas impermeáveis; ao contrário, é a membrana viva, sensível e
            responsiva através da qual nutrição, afeto, aprendizado e limites se
            tornam possíveis.
          </p>
        </section>

        {/* Concept 2: Ambiguity and Absence of "One Healthy Answer" */}
        <section className="bg-white rounded-2xl border border-[#E1D9CC] p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7D6B58]">
            <Compass className="w-4 h-4 text-[#8C745E]" />
            <span>2. A Ambiguidade e a Ausência de Resposta Automática</span>
          </div>
          <h3 className="font-serif text-lg text-[#25221E] font-normal">
            Por que não existe comportamento "universalmente saudável" em
            situações ambíguas?
          </h3>
          <p className="text-xs sm:text-sm text-[#4A4236] leading-relaxed">
            Um comportamento não é inerentemente patológico ou saudável em si
            mesmo: sua qualidade depende de ser um{" "}
            <strong>ajuste criativo</strong> vivo ao contexto específico. Em
            certas crises agudas, calar-se ou recuar temporariamente pode ser a
            atitude mais protetiva e inteligente; em outras, expressar o limite
            de imediato é indispensável. Por isso, este recurso didático separa
            cuidadosamente:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE2D5] space-y-1.5">
              <strong className="text-xs font-semibold text-[#665646] uppercase block">
                Possíveis Leituras (Fenomênicas)
              </strong>
              <p className="text-xs text-[#52493D] leading-relaxed">
                Múltiplas perspectivas compreensivas sobre o que cada movimento
                mobiliza, o que busca resguardar e que custos relacionais
                acarreta.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE2D5] space-y-1.5">
              <strong className="text-xs font-semibold text-[#2D5A47] uppercase block flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Conteúdo Didático do Instituto
              </strong>
              <p className="text-xs text-[#52493D] leading-relaxed">
                Formulação conceitual formal aplicada quando a situação exige
                clareza sobre diferenciação de si, assertividade ética e
                integridade do campo.
              </p>
            </div>
          </div>
        </section>

        {/* Concept 3: The 4 Movements in Field */}
        <section className="bg-white rounded-2xl border border-[#E1D9CC] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7D6B58]">
            <Layers className="w-4 h-4 text-[#8C745E]" />
            <span>3. Dinâmicas de Fronteira no Campo Relacional</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3] space-y-2">
              <span className="text-xs font-semibold text-[#8C5D3E] uppercase tracking-wide block">
                Confluência (Fusão)
              </span>
              <p className="text-xs text-[#4F463A] leading-relaxed">
                Perda da fronteira entre Eu e Outro. O indivíduo cede suas
                vontades, engole sentimentos ou assume a dor alheia como dever
                próprio para manter a harmonia artificial.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3] space-y-2">
              <span className="text-xs font-semibold text-[#44665C] uppercase tracking-wide block">
                Retirada / Egotismo (Muralha)
              </span>
              <p className="text-xs text-[#4F463A] leading-relaxed">
                Hiper-rigidez defensiva. Para não ser invadido ou confrontado, o
                sujeito se isola, silencia ou ataca friamente, congelando o
                fluxo de contato nutritivo.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DFD3] space-y-2">
              <span className="text-xs font-semibold text-[#544B3E] uppercase tracking-wide block">
                Contato Diferenciado
              </span>
              <p className="text-xs text-[#4F463A] leading-relaxed">
                Presença genuína de dois sujeitos inteiros. O limite é
                comunicado com firmeza serena: não invade o outro nem permite a
                invasão de seu território essencial.
              </p>
            </div>
          </div>
        </section>

        {/* Concept 4: The Contact-Withdrawal rhythm */}
        <section className="bg-white rounded-2xl border border-[#E1D9CC] p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7D6B58]">
            <BookMarked className="w-4 h-4 text-[#8C745E]" />
            <span>4. O Ritmo Respiração: Contato e Retirada</span>
          </div>
          <h3 className="font-serif text-lg text-[#25221E] font-normal">
            A saúde relacional reside na capacidade de alternar entre presença e
            repouso
          </h3>
          <p className="text-xs sm:text-sm text-[#4A4236] leading-relaxed">
            Assim como o coração se contrai e relaxa (sístole e diástole), toda
            relação saudável oscila entre momentos de aproximação intensa e
            momentos de retiro para auto-integração. Quem não suporta a retirada
            do outro tende ao desespero confluente; quem não suporta a
            aproximação refugia-se na solidão hostil. O experimento de
            Fronteiras de Contato visa restaurar essa elasticidade orgânica.
          </p>
        </section>
      </div>
    </div>
  );
};
