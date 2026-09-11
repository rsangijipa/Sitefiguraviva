import { StageData } from "../types";

export const STAGES: StageData[] = [
  {
    number: 5,
    sense: "Visão",
    senseKey: "visao",
    title: "5 coisas que você vê",
    instruction:
      "Olhe lentamente ao redor do seu espaço atual. Note cinco coisas reais que seus olhos encontram agora.",
    groundingTip:
      "Pode ser uma sombra na parede, a textura do chão, um reflexo na janela ou um detalhe que você não havia reparado antes.",
    audioNarration:
      "Cinco coisas que você vê. Olhe devagar ao redor do seu ambiente presente e note cinco coisas reais que seus olhos encontram.",
  },
  {
    number: 4,
    sense: "Tato",
    senseKey: "tato",
    title: "4 coisas que pode sentir pelo toque",
    instruction:
      "Perceba o contato físico do seu corpo com o ambiente. Note quatro sensações táteis reais.",
    groundingTip:
      "O peso dos seus pés no chão, o tecido da sua roupa sobre a pele, a temperatura do ar nas mãos ou o apoio da cadeira.",
    audioNarration:
      "Quatro coisas que você pode sentir pelo toque. Perceba o contato do seu corpo com o ambiente ao seu redor e note quatro sensações físicas reais.",
  },
  {
    number: 3,
    sense: "Audição",
    senseKey: "audicao",
    title: "3 sons que percebe",
    instruction:
      "Feche os olhos por um instante ou suavize o olhar. Identifique três sons presentes no ambiente.",
    groundingTip:
      "Pode ser um som distante na rua, o murmúrio do vento, um aparelho elétrico ou o som suave da sua própria respiração.",
    audioNarration:
      "Três sons que você percebe. Ouça atentamente os arredores e identifique três sons presentes neste momento.",
  },
  {
    number: 2,
    sense: "Olfato",
    senseKey: "olfato",
    title: "2 cheiros",
    instruction:
      "Respire fundo pelo nariz e perceba dois aromas sutis no ar onde você está.",
    groundingTip:
      "O aroma do café, o cheiro de papel, da madeira, da chuva ou simplesmente a pureza e a temperatura do ar que entra.",
    audioNarration:
      "Dois cheiros. Respire fundo e perceba dois aromas presentes no ar ao seu redor.",
  },
  {
    number: 1,
    sense: "Paladar / Boca",
    senseKey: "paladar",
    title: "1 sabor ou sensação da boca",
    instruction:
      "Leve a atenção para dentro da boca. Note um sabor presente ou a sensação atual.",
    groundingTip:
      "O resquício de uma bebida recente, a sensação da língua repousada contra os dentes, ou a frescura ao umedecer os lábios.",
    audioNarration:
      "Um sabor ou sensação da boca. Note um sabor presente ou a sensação de repouso no interior da boca.",
  },
];
