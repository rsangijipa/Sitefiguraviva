"use client";

import React from "react";
import {
  X,
  BookOpen,
  Brain,
  Heart,
  Users,
  User,
  Lightbulb,
  Layers,
  Quote,
  FileText,
  GraduationCap,
} from "lucide-react";
import { ClinicalCase, CaseTheme } from "../types";

interface StudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCase: ClinicalCase;
}

const THEME_THEORY: Record<
  CaseTheme,
  {
    title: string;
    subtitle: string;
    sections: Array<{
      title: string;
      icon: React.ComponentType<{ className?: string }>;
      color: string;
      content: React.ReactNode;
    }>;
    philosophicalNote: {
      quote: string;
      author: string;
      reflection: string;
    };
  }
> = {
  ansiedade: {
    title: "Entendendo a Ansiedade Clínica",
    subtitle: "Do alarme adaptativo ao ciclo de evitação mantenedor",
    sections: [
      {
        title: "1. A Natureza Adaptativa da Ansiedade",
        icon: Heart,
        color: "#D48B3A",
        content: (
          <>
            <p className="text-sm text-[#524E48] leading-relaxed">
              A ansiedade não é um defeito — é um{" "}
              <strong>sistema de alarme evolutivo</strong> projetado para
              proteger. O circuito amígdala-hipocampo-prefrontal detecta ameaças
              e prepara o corpo para luta ou fuga: taquicardia, hiperventilação,
              tensão muscular, vigilância atencional.
            </p>
            <p className="text-sm text-[#524E48] mt-2 leading-relaxed">
              Na ansiedade patológica, este sistema dispara{" "}
              <strong>falsos positivos</strong>: interpreta situações neutras ou
              desafiadoras como perigosas. O corpo reage como se houvesse um
              leão na sala, quando há apenas uma reunião de trabalho.
            </p>
          </>
        ),
      },
      {
        title: "2. O Ciclo da Evitação Mantenedora",
        icon: Brain,
        color: "#3E5568",
        content: (
          <>
            <p className="text-sm text-[#524E48] leading-relaxed">
              <strong>
                Evitação → Alívio imediato → Reforço negativo → Mais evitação.
              </strong>{" "}
              Cada vez que Marina evita uma situação, seu cérebro registra: "Era
              perigoso, bom que fugi". A zona de conforto encolhe, a
              autoeficácia diminui, a ansiedade generaliza.
            </p>
            <div className="mt-3 p-3 rounded-lg bg-[#F5F2EB] border border-[#E6E1D6]">
              <p className="text-xs text-[#5A554E] leading-relaxed">
                <strong>Psicoeducação chave:</strong> "Seu corpo está tentando
                te proteger, mas o alarme está muito sensível. Vamos
                recalibrá-lo juntos."
              </p>
            </div>
          </>
        ),
      },
      {
        title: "3. Abordagem Integrativa Baseada em Evidência",
        icon: Lightbulb,
        color: "#4A6B4F",
        content: (
          <>
            <ul className="space-y-2 text-sm text-[#524E48] leading-relaxed">
              <li className="flex items-start gap-2">
                • <strong>Psicoeducação:</strong> Normalizar, desmistificar,
                criar linguagem compartilhada
              </li>
              <li className="flex items-start gap-2">
                • <strong>Grounding corporal:</strong> Respiração diafragmática
                4-7-8, varredura corporal, 5-4-3-2-1 sensorial
              </li>
              <li className="flex items-start gap-2">
                • <strong>Reestruturação cognitiva:</strong> Identificar
                pensamentos automáticos ("e se..."), examinar evidências, gerar
                alternativas realistas
              </li>
              <li className="flex items-start gap-2">
                • <strong>Exposição graduada:</strong> Hierarquia de situações
                evitadas, prática sistemática, prevenção de resposta de
                segurança
              </li>
              <li className="flex items-start gap-2">
                • <strong>Trabalho com crenças de base:</strong> "Não sou
                capaz", "O mundo é perigoso", "Preciso de certeza" — origem
                desenvolvimental
              </li>
            </ul>
          </>
        ),
      },
      {
        title: "4. O Papel da Relação Terapêutica",
        icon: Users,
        color: "#5A8B5A",
        content: (
          <>
            <p className="text-sm text-[#524E48] leading-relaxed">
              Para quem aprendeu que "o mundo é perigoso" e "não sou capaz", o
              terapeuta pode ser a{" "}
              <strong>primeira experiência de base segura</strong>: alguém que
              permanece, não julga, valida e encoraja pequenos riscos. A aliança
              terapêutica <em>é</em> a intervenção.
            </p>
          </>
        ),
      },
    ],
    philosophicalNote: {
      quote:
        '"A coragem não é ausência de medo, mas a decisão de que algo é mais importante que o medo."',
      author: "Ambrose Redmoon",
      reflection:
        "A ansiedade pede segurança. A terapia oferece <strong>coragem acompanhada</strong>. Não eliminamos o alarme — ensinamos o sistema a distinguir perigo real de desconforto crescimento.",
    },
  },
  depressao: {
    title: "Entendendo a Depressão Maior",
    subtitle:
      "Da exaustão adaptativa à perda de sentido — e o caminho de volta",
    sections: [
      {
        title: "1. Depressão Não É Fraqueza",
        icon: Brain,
        color: "#5A7BA3",
        content: (
          <>
            <p className="text-sm text-[#524E48] leading-relaxed">
              A depressão é uma <strong>resposta adaptativa esgotada</strong>.
              Diante de demandas crônicas sem recursos adequados, o sistema
              "desliga" para poupar energia: humor baixo, anedonia, retardo
              psicomotor, isolamento. É o corpo dizendo "não aguento mais
              assim".
            </p>
            <p className="text-sm text-[#524E48] mt-2 leading-relaxed">
              Roberto carregou o papel de "filho forte" por 30 anos. Dois
              episódios anteriores tratados só com medicação não abordaram a
              raiz:{" "}
              <strong>
                crenças de base de inutilidade e a proibição de ter necessidades
              </strong>
              .
            </p>
          </>
        ),
      },
      {
        title: "2. Ativação Comportamental: Ação Precede Motivação",
        icon: Lightbulb,
        color: "#4A6B4F",
        content: (
          <>
            <p className="text-sm text-[#524E48] leading-relaxed mb-3">
              Na depressão, <strong>espera-se sentir vontade para agir</strong>.
              Mas a neurobiologia da depressão inverte isso:{" "}
              <strong>age-se para sentir vontade</strong>. A ativação
              comportamental graduada (BA) é a intervenção com maior evidência
              para depressão moderada.
            </p>
            <div className="space-y-2 text-sm text-[#524E48]">
              <p>
                <strong>Micro-metas (exemplos para Roberto):</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Banho de 5 min (não "higiene completa")</li>
                <li>Caminhar até o portão (não "exercício")</li>
                <li>Ler 1 parágrafo de história (não "estudar")</li>
                <li>Responder 1 mensagem (não "socializar")</li>
              </ul>
              <p className="mt-2">
                <strong>Registro de atividades + humor</strong> → revela
                padrões, quebra a crença "nada adianta".
              </p>
            </div>
          </>
        ),
      },
      {
        title: "3. Culpa Depressiva como Máscara de Luto",
        icon: Heart,
        color: "#D48B3A",
        content: (
          <>
            <p className="text-sm text-[#524E48] leading-relaxed">
              Roberto sente <strong>culpa</strong> ("sou um fardo", "decepciono
              a família"). Mas a culpa depressiva frequentemente mascara{" "}
              <strong>luto não processado</strong>: pelo pai ausente, pela mãe
              depressiva, pela infância roubada, pelo "eu ideal" que nunca
              existiu.
            </p>
            <p className="text-sm text-[#524E48] mt-2 leading-relaxed">
              Trabalhar a culpa diretamente reforça a autocrítica. A via é{" "}
              <strong>acessar a tristeza primária</strong> por trás da culpa
              secundária: "Sinto muito por ter carregado tanto sozinho."
            </p>
          </>
        ),
      },
      {
        title: "4. Prevenção de Recaída e Construção de Sentido",
        icon: GraduationCap,
        color: "#6B5A4A",
        content: (
          <>
            <p className="text-sm text-[#524E48] leading-relaxed">
              Recuperação não é "nunca mais ficar triste". É{" "}
              <strong>
                ter ferramentas, rede de apoio e narrativa integrada
              </strong>
              . Plano de prevenção: sinais de alerta pessoais, estratégias que
              funcionaram, contatos de emergência, significado construído.
            </p>
          </>
        ),
      },
    ],
    philosophicalNote: {
      quote: '"A depressão é a incapacidade de construir um futuro."',
      author: "Rollo May",
      reflection:
        'A terapia ajuda a <strong>reconstruir o futuro, um micro-passo por vez</strong>. Não devolvemos a motivação — criamos as condições para ela emergir. Cada pequeno ato é um voto no "eu quero viver".',
    },
  },
  trauma: {
    title: "Entendendo o Trauma Complexo",
    subtitle:
      "Quando a sobrevivência molda a personalidade — e a cura requer paciência",
    sections: [
      {
        title: "1. Trauma Complexo vs. PTSD Simples",
        icon: Layers,
        color: "#9C6B7A",
        content: (
          <>
            <p className="text-sm text-[#524E48] leading-relaxed">
              <strong>PTSD:</strong> evento traumático discreto → sintomas de
              reexperimentação, evitação, hipervigilância.
              <br />
              <strong>Trauma Complexo (C-PTSD/DESNOS):</strong> trauma
              interpessoal crônico na infância →{" "}
              <strong>afeta a organização da personalidade</strong>: regulação
              afetiva, consciência/atenção (dissociação), auto-percepção,
              relações, sistemas de significado, somatização.
            </p>
            <p className="text-sm text-[#524E48] mt-2 leading-relaxed">
              Aline não tem "apenas memórias traumáticas" — sua{" "}
              <strong>
                estrutura de self foi organizada em torno da sobrevivência
              </strong>
              . Dissociação, hipervigilância, dificuldade com afeto positivo:
              foram soluções criativas para um ambiente impossível.
            </p>
          </>
        ),
      },
      {
        title: "2. Dissociação como Estratégia de Sobrevivência",
        icon: Brain,
        color: "#5A7BA3",
        content: (
          <>
            <p className="text-sm text-[#524E48] leading-relaxed">
              Quando não há luta nem fuga possíveis (criança dependente de
              cuidador abusivo), o sistema nervoso <strong>desconecta</strong>:
              despersonalização ("não sou eu"), desrealização ("não é real"),
              amnésia dissociativa ("não aconteceu").
            </p>
            <div className="mt-3 p-3 rounded-lg bg-[#F5F2EB] border border-[#E6E1D6]">
              <p className="text-xs text-[#5A554E] leading-relaxed">
                <strong>Reframe essencial:</strong> "Sua mente fez algo incrível
                para você sobreviver. Agora, adulta, você pode aprender a ficar
                presente — no seu ritmo."
              </p>
            </div>
          </>
        ),
      },
      {
        title: "3. Modelo Trifásico (Herman / van der Kolk)",
        icon: FileText,
        color: "#3E5568",
        content: (
          <>
            <div className="space-y-3 text-sm text-[#524E48]">
              <div className="p-3 rounded-lg bg-[#E8EBF0] border border-[#D0D8E0]">
                <p className="font-medium text-[#3E5568] mb-1">
                  FASE 1 — Estabilização e Segurança (meses a anos)
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>
                    Psicoeducação: janela de tolerância, recursos de grounding
                  </li>
                  <li>
                    Regulação autonômica: respiração, movimento, frio/calor
                  </li>
                  <li>
                    Redução de risco: automutilação, ideação suicida, uso de
                    substâncias
                  </li>
                  <li>Aliança terapêutica como base segura</li>
                </ul>
              </div>
              <div className="p-3 rounded-lg bg-[#F0E8EB] border border-[#E0D0D5]">
                <p className="font-medium text-[#7A4A5A] mb-1">
                  FASE 2 — Processamento (quando estável)
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>EMDR / Exposição narrativa graduada</li>
                  <li>Trabalho com partes (IFS / Ego States)</li>
                  <li>Reprocessamento de memórias traumáticas</li>
                  <li>Ritmo ditado pela paciente — sem pressa</li>
                </ul>
              </div>
              <div className="p-3 rounded-lg bg-[#E8F0E8] border border-[#D0E0D0]">
                <p className="font-medium text-[#3E6B3E] mb-1">
                  FASE 3 — Integração e Reconexão
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Reconstrução da identidade além do trauma</li>
                  <li>Relações íntimas e vulnerabilidade</li>
                  <li>Projeto de vida, sentido, legado</li>
                  <li>Prevenção de retraumatização</li>
                </ul>
              </div>
            </div>
          </>
        ),
      },
      {
        title: "4. O Corpo Guarda a Conta",
        icon: User,
        color: "#8B7A6A",
        content: (
          <>
            <p className="text-sm text-[#524E48] leading-relaxed">
              <strong>
                Abordagens somáticas não são opcionais — são essenciais.
              </strong>{" "}
              O trauma vive no corpo: dores crônicas sem causa médica,
              sobressalto excessivo, tensão basal alta, disfunção autonômica.
              Interocepção, movimento consciente, yoga sensível ao trauma, EMDR,
              Experiência Somática: acessam o que a fala sozinha não alcança.
            </p>
          </>
        ),
      },
    ],
    philosophicalNote: {
      quote:
        '"O trauma não é o que acontece com você, mas o que acontece dentro de você como resultado do que aconteceu com você."',
      author: "Gabor Maté",
      reflection:
        'A cura do trauma complexo não é "voltar ao normal" — <strong>nunca houve um "normal"</strong>. É construir, pela primeira vez, um self que sente segurança, agência e conexão. O terapeuta é co-regulador, testemunha, companheiro de jornada.',
    },
  },
  relacionamento: {
    title: "Entendendo Padrões de Apego no Casal",
    subtitle:
      "A dança ansioso-evitativa e a construção de segurança conquistada",
    sections: [
      {
        title: "1. O Ciclo Perseguição-Distanciamento",
        icon: Users,
        color: "#5A8B5A",
        content: (
          <>
            <p className="text-sm text-[#524E48] leading-relaxed">
              <strong>Fernanda (ansiosa):</strong> busca proximidade → não obtém
              resposta → pânico de abandono → intensifica busca (crítica,
              cobrança, "precisamos conversar").
              <br />
              <strong>Lucas (evitativo):</strong> sente pressão/inadequação →
              vergonha → recolhe-se (silêncio, saída, "preciso de espaço") →
              alívio temporário.
            </p>
            <p className="text-sm text-[#524E48] mt-2 leading-relaxed">
              <strong>O ciclo se autoalimenta:</strong> a perseguição dela
              confirma o medo dele de sufocamento; o distanciamento dele
              confirma o medo dela de abandono. Ambos se sentem sozinhos e
              incompreendidos.
            </p>
          </>
        ),
      },
      {
        title: "2. Emoções Primárias vs. Secundárias (EFT)",
        icon: Heart,
        color: "#D48B3A",
        content: (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#524E48]">
              <div className="p-3 rounded-lg bg-[#FEF3E2] border border-[#F0D8B8]">
                <p className="font-medium text-[#C47A2E] mb-1">Fernanda</p>
                <p>
                  <strong>Secundária (visível):</strong> Raiva, cobrança,
                  crítica
                </p>
                <p className="mt-1">
                  <strong>Primária (oculta):</strong> Medo de abandono, solidão,
                  "não importo"
                </p>
                <p className="mt-1">
                  <strong>Necessidade de apego:</strong> "Estou aqui? Você me
                  vê? Sou importante?"
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#E8F0E8] border border-[#D0E0D0]">
                <p className="font-medium text-[#3E6B3E] mb-1">Lucas</p>
                <p>
                  <strong>Secundária (visível):</strong> Frieza, evitação,
                  racionalização
                </p>
                <p className="mt-1">
                  <strong>Primária (oculta):</strong> Vergonha, inadequação,
                  "nunca faço o suficiente"
                </p>
                <p className="mt-1">
                  <strong>Necessidade de apego:</strong> "Sou aceito como sou?
                  Posso errar sem ser rejeitado?"
                </p>
              </div>
            </div>
          </>
        ),
      },
      {
        title: "3. EFT: Três Estágios de Mudança",
        icon: Lightbulb,
        color: "#4A6B4F",
        content: (
          <>
            <div className="space-y-3 text-sm text-[#524E48]">
              <div className="p-3 rounded-lg bg-[#FEF3E2] border border-[#F0D8B8]">
                <p className="font-medium text-[#C47A2E] mb-1">
                  1. Desescalada do Ciclo Negativo
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs mt-1">
                  <li>
                    Identificar o ciclo (não o parceiro) como inimigo comum
                  </li>
                  <li>
                    Acessar emoções primárias por trás das reações defensivas
                  </li>
                  <li>Expressar necessidades de apego diretamente</li>
                </ul>
              </div>
              <div className="p-3 rounded-lg bg-[#E8F0E8] border border-[#D0E0D0]">
                <p className="font-medium text-[#3E6B3E] mb-1">
                  2. Reestruturação da Interação
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs mt-1">
                  <li>
                    Fernanda: "Quando você sai, sinto pânico de te perder.
                    Preciso que você fique."
                  </li>
                  <li>
                    Lucas: "Quando você cobra, sinto que falho. Preciso saber
                    que estou bem."
                  </li>
                  <li>
                    Novos ciclos: acessar vulnerabilidade → responder →
                    segurança
                  </li>
                </ul>
              </div>
              <div className="p-3 rounded-lg bg-[#F0EBE8] border border-[#E0D8D0]">
                <p className="font-medium text-[#6B5A4A] mb-1">
                  3. Consolidação
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs mt-1">
                  <li>Rituais de conexão diários (check-in, toque, olhar)</li>
                  <li>Narrativa compartilhada: "Nós contra o ciclo"</li>
                  <li>Prevenção de recaída no ciclo antigo</li>
                </ul>
              </div>
            </div>
          </>
        ),
      },
      {
        title: "4. Apego Seguro Conquistado (Earned Security)",
        icon: GraduationCap,
        color: "#6B5A4A",
        content: (
          <>
            <p className="text-sm text-[#524E48] leading-relaxed">
              <strong>Segurança não é herdada — pode ser construída.</strong>{" "}
              Pesquisa mostra que adultos com apego inseguro na infância podem
              desenvolver "apego seguro conquistado" através de: relacionamentos
              reparadores, terapia, reflexão metacognitiva, parentalidade
              consciente. O casal <strong>é o laboratório</strong>.
            </p>
          </>
        ),
      },
    ],
    philosophicalNote: {
      quote: '"Somos feridos em relação e curados em relação."',
      author: "Harville Hendrix",
      reflection:
        'O casal não vem à terapia para "consertar o outro". Vem para <strong>mudar a dança juntos</strong>. Cada micro-momento de "estou aqui, você importa" reconstrói a base segura que a infância não deu.',
    },
  },
  identidade: {
    title: "Entendendo Crise de Identidade na Meia-Idade",
    subtitle: "Quando os papéis caem — e o self verdadeiro pede passagem",
    sections: [
      {
        title: "1. Identidade Fundida a Papéis Externos",
        icon: User,
        color: "#8B7A6A",
        content: (
          <>
            <p className="text-sm text-[#524E48] leading-relaxed">
              Paulo construiu sua identidade inteiramente sobre{" "}
              <strong>validação externa</strong>: filho modelo, aluno nota 10,
              executivo de sucesso, pai provedor, marido "presente". Nunca
              perguntou "o que <em>eu</em> quero?" — a pergunta era perigosa em
              um sistema familiar que exigia performance.
            </p>
            <p className="text-sm text-[#524E48] mt-2 leading-relaxed">
              A demissão e o divórcio <strong>removeram os espelhos</strong> que
              refletiam seu valor. Sem eles, o vazio revela:{" "}
              <strong>
                não há "eu" autônomo, apenas "eu que atende expectativas"
              </strong>
              .
            </p>
          </>
        ),
      },
      {
        title: "2. Luto Múltiplo Não Processado",
        icon: Heart,
        color: "#D48B3A",
        content: (
          <>
            <p className="text-sm text-[#524E48] leading-relaxed">
              Paulo está de luto — mas não nomeia como luto. Luto pelo cargo (22
              anos), pelo casamento, pelo "eu idealizado" que o pai projetou,
              pela filha que o vê "estranho". A{" "}
              <strong>vergonha de "não estar bem apesar de ter tudo"</strong>{" "}
              bloqueia o processamento: "não tenho direito de sofrer".
            </p>
            <div className="mt-3 p-3 rounded-lg bg-[#F5F2EB] border border-[#E6E1D6]">
              <p className="text-xs text-[#5A554E] leading-relaxed">
                <strong>Intervenção:</strong> Validar cada luto separadamente.
                "Você perdeu seu lugar no mundo profissional. Isso dói. Tem
                direito de chorar."
              </p>
            </div>
          </>
        ),
      },
      {
        title: "3. Abordagem Existencial-Narrativa",
        icon: BookOpen,
        color: "#3E5568",
        content: (
          <>
            <div className="space-y-3 text-sm text-[#524E48]">
              <p>
                <strong>Desconstrução da "história oficial":</strong> Separar
                "eu deveria" (introjetos) de "eu quero" (valores autênticos).
              </p>
              <p>
                <strong>Exploração de valores:</strong> Exercício do legado ("o
                que quero que digam no meu funeral?"), carta ao eu de 20 anos,
                linha da vida com picos e vales.
              </p>
              <p>
                <strong>Experimentação:</strong> Pequenos atos de autonomia —
                hobby esquecido, dizer "não", pedir ajuda, escolher sem
                consultar ninguém.
              </p>
              <p>
                <strong>Reconstrução narrativa:</strong> Integrar passado
                (honrar a jornada), aceitar finitude (tempo limitado), autorar
                próximo capítulo (agência).
              </p>
            </div>
          </>
        ),
      },
      {
        title: "4. Autonomia se Constrói no Cotidiano",
        icon: Lightbulb,
        color: "#4A6B4F",
        content: (
          <>
            <p className="text-sm text-[#524E48] leading-relaxed">
              Não há "grande gesto" que resolva. Autonomia é{" "}
              <strong>
                escolher o café da manhã, aceitar o convite, recusar o projeto,
                chorar na terapia
              </strong>
              . Cada ato minúsculo de autodeterminação reconstrói o self. O
              terapeuta como <strong>testemunha compassiva</strong> — não
              diretor, não salvador — da emergência do self verdadeiro.
            </p>
          </>
        ),
      },
    ],
    philosophicalNote: {
      quote:
        '"A meia-idade é o momento em que a vida nos pergunta: você tem vivido a sua vida ou a vida que esperavam de você?"',
      author: "James Hollis",
      reflection:
        'A crise não é patologia — é <strong>convite à autenticidade</strong>. O vazio não é ausência — é espaço para o novo. Paulo não precisa "se encontrar" — precisa <strong>se criar</strong>, um escolha por vez.',
    },
  },
};

export const StudyModal: React.FC<StudyModalProps> = ({
  isOpen,
  onClose,
  currentCase,
}) => {
  if (!isOpen) return null;

  const theory = THEME_THEORY[currentCase.theme];
  const themeColors = {
    ansiedade: {
      bg: "#FEF3E2",
      text: "#C47A2E",
      border: "#F0D8B8",
      icon: "#D48B3A",
    },
    depressao: {
      bg: "#E8EBF0",
      text: "#3E5568",
      border: "#D0D8E0",
      icon: "#5A7BA3",
    },
    trauma: {
      bg: "#F0E8EB",
      text: "#7A4A5A",
      border: "#E0D0D5",
      icon: "#9C6B7A",
    },
    relacionamento: {
      bg: "#E8F0E8",
      text: "#3E6B3E",
      border: "#D0E0D0",
      icon: "#5A8B5A",
    },
    identidade: {
      bg: "#F0EBE8",
      text: "#6B5A4A",
      border: "#E0D8D0",
      icon: "#8B7A6A",
    },
  }[currentCase.theme];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1A1918]/50 backdrop-blur-sm transition-all duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#FAF8F5] rounded-2xl border border-[#E3DFD5] shadow-2xl p-6 sm:p-8 text-[#2C2A29]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="study-modal-title"
      >
        {/* Close Button */}
        <button
          id="btn-close-study-modal-top"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#7A756E] hover:text-[#1F1E1D] hover:bg-[#EBE7DF] transition-colors focus-visible-ring"
          aria-label="Fechar modo estudo"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 border-b border-[#E8E4DA] pb-5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#EFECE5] text-xs text-[#625E57] font-medium tracking-wide mb-2">
            <BookOpen
              className="w-3.5 h-3.5"
              style={{ color: themeColors.icon }}
            />
            <span>MODO ESTUDO • FUNDAMENTOS TEÓRICOS</span>
          </div>
          <h2
            id="study-modal-title"
            className="text-2xl sm:text-3xl font-serif text-[#1F1E1D] font-medium tracking-tight"
          >
            {theory.title}
          </h2>
          <p className="text-sm text-[#736F68] mt-1">{theory.subtitle}</p>
        </div>

        {/* Modal Content */}
        <div className="space-y-6 text-[#3F3B36] text-sm sm:text-base leading-relaxed custom-scrollbar">
          {theory.sections.map((section, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white border animate-fade-in-up"
              style={{
                borderColor: themeColors.border,
                animationDelay: `${idx * 0.1}s`,
              }}
            >
              <h3 className="font-serif text-lg text-[#1F1E1D] font-medium flex items-center gap-2 mb-3">
                <span style={{ color: section.color }}>
                  <section.icon className="w-4 h-4" />
                </span>
                {section.title}
              </h3>
              <div className="prose prose-sm max-w-none text-[#524E48] leading-relaxed">
                {section.content}
              </div>
            </div>
          ))}

          {/* Philosophical Insight */}
          <div
            className="p-4 rounded-xl bg-[#F4EFE6] border animate-fade-in-up"
            style={{ borderColor: themeColors.border }}
          >
            <h3 className="font-serif text-lg text-[#1F1E1D] font-medium flex items-center gap-2 mb-2">
              <Lightbulb
                className="w-4 h-4"
                style={{ color: themeColors.icon }}
              />
              Reflexão Filosófica
            </h3>
            <blockquote
              className="italic font-serif text-[#443E38] border-l-2 pl-3 py-1 my-2 text-sm sm:text-base"
              style={{ borderColor: themeColors.icon }}
            >
              "{theory.philosophicalNote.quote}"
            </blockquote>
            <p className="text-xs text-[#625B52] leading-relaxed mt-2">
              — {theory.philosophicalNote.author}
            </p>
            <p className="text-xs text-[#625B52] leading-relaxed mt-2">
              {theory.philosophicalNote.reflection}
            </p>
          </div>

          {/* Clinical Application to Current Case */}
          <div
            className="p-4 rounded-xl bg-white border animate-fade-in-up"
            style={{ borderColor: themeColors.border }}
          >
            <h3 className="font-serif text-lg text-[#1F1E1D] font-medium flex items-center gap-2 mb-3">
              <FileText
                className="w-4 h-4"
                style={{ color: themeColors.icon }}
              />
              Aplicação ao Caso: {currentCase.title}
            </h3>
            <div className="space-y-2 text-sm text-[#524E48]">
              <p>
                <strong>Paciente:</strong> {currentCase.patientProfile.name},{" "}
                {currentCase.patientProfile.age} anos —{" "}
                {currentCase.presentingIssue.slice(0, 100)}...
              </p>
              <p>
                <strong>Foco sugerido:</strong>{" "}
                {currentCase.therapeuticApproach.slice(0, 150)}...
              </p>
              <p className="mt-2">
                <strong>Pergunta-chave para supervisão:</strong>{" "}
                {currentCase.reflectionQuestions[0]}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-[#E8E4DA] flex justify-end">
          <button
            id="btn-return-from-study"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#2C2A29] hover:bg-[#1A1918] text-[#F8F7F4] text-xs font-medium tracking-wide transition-colors focus-visible-ring"
          >
            Retornar ao Caso Clínico
          </button>
        </div>
      </div>
    </div>
  );
};
