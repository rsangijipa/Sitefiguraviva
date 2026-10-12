/**
 * Espaços de ilustração dos Recursos. As imagens são produzidas fora do código
 * (arte contratada ou gerada à parte) e colocadas em `public/brand/recursos/`
 * com o nome indicado aqui; enquanto o arquivo não existe, o espaço aparece
 * vazio e identificado. A lista completa, com as instruções de arte, fica em
 * docs/recursos-v2-ilustracoes.md e é conferida por teste.
 */
export type SlotRatio = "3:2" | "16:9" | "4:3" | "1:1" | "5:2";
export interface IllustrationSlotDef { path: string; ratio: SlotRatio; alt: string; brief: string }

const DIR = "/brand/recursos";
const STYLE = "Aquarela sobre papel Creme Papel (#FDFAF4), paleta oficial Figura Viva, sem sombra, brilho, pessoas, rostos gerados, fauna ou texto na imagem.";

export const CONCEPT_BRIEFS: Record<string, { alt: string; brief: string }> = {
  awareness: { alt: "Ponto amarelo surgindo num campo de areia, com anéis muito leves.", brief: "Ponto Vazante surgindo num campo Areia, anéis muito leves ao redor." },
  "aqui-agora": { alt: "Linha do tempo que se curva num único ponto iluminado.", brief: "Linha fina Névoa que converge para um único ponto Vazante no centro." },
  autorregulacao: { alt: "Duas manchas ligadas por um ramo que vai de uma à outra.", brief: "Mancha Aurora apagada e mancha Broto viva, ligadas por um Ramo Verde Raiz em arco." },
  suspensao: { alt: "Mancha verde entre dois parênteses desenhados como ramos.", brief: "Mancha Broto entre dois ramos curvos como parênteses (epoché)." },
  descricao: { alt: "Mancha amarela ao lado de linhas de escrita.", brief: "Mancha Vazante à esquerda e linhas de escrita Pedra à direita, sem texto legível." },
  corpo: { alt: "Silhueta neutra em traço verde com uma pequena mancha no peito.", brief: "Silhueta neutra em traço contínuo Verde Raiz, sem gênero, pequena mancha Aurora no peito." },
  "eu-tu": { alt: "Duas formas e o espaço entre elas iluminado em amarelo.", brief: "Duas formas (Igarapé e Terra Barro) com o espaço entre elas iluminado em Vazante." },
  inclusao: { alt: "Dois círculos que se sobrepõem sem se fundir.", brief: "Dois círculos (Igarapé e Terra Barro) sobrepostos, cada um mantendo o contorno." },
  presenca: { alt: "Mancha verde envolta por um contorno pontilhado.", brief: "Mancha Broto com contorno pontilhado Verde Raiz ao redor, aberto." },
  introjecao: { alt: "Forma de contorno nítido dentro de outra forma, sem se misturar.", brief: "Forma inteira de contorno nítido (Terra Barro) dentro de uma mancha Broto, sem mistura." },
  projecao: { alt: "Forma e sua sombra colorida pousada sobre outra forma.", brief: "Forma Aurora e sua 'sombra' colorida pousada sobre uma forma Névoa." },
  retroflexao: { alt: "Ramo que se lança e se curva de volta ao ponto de origem.", brief: "Ramo Terra Barro que sai de um ponto, faz um arco e volta a ele." },
  confluencia: { alt: "Duas manchas, rosa e verde, que se misturam sem contorno.", brief: "Duas manchas (Aurora e Broto) que se misturam sem contorno." },
  deflexao: { alt: "Ramo que se aproxima de um campo e desvia antes de tocá-lo.", brief: "Ramo Terra Barro que se aproxima de uma mancha Igarapé e desvia antes de tocá-la." },
  egotismo: { alt: "Forma amarela cercada por um segundo contorno rígido.", brief: "Mancha Vazante com um segundo contorno rígido Mata ao redor, voltada para si." },
  ajustamento: { alt: "Ramo que contorna um obstáculo e floresce do outro lado.", brief: "Ramo que contorna um obstáculo Névoa e brota folhas do outro lado." },
  "self-id": { alt: "Mancha rosa que emerge do fundo com um pequeno broto.", brief: "Mancha Aurora emergindo de um fundo Aurora apagado, pequeno broto saindo." },
  "self-ego": { alt: "Duas manchas separadas por uma linha de escolha.", brief: "Mancha Broto (identificação) e mancha Névoa (alienação) separadas por linha Verde Raiz." },
  "self-personalidade": { alt: "Círculos concêntricos de cores suaves.", brief: "Camadas concêntricas Areia, Vazante e Broto, como anéis de crescimento." },
  campo: { alt: "Mancha central cercada por outras manchas no mesmo campo.", brief: "Campo Areia com uma mancha Verde Raiz e manchas vizinhas mais leves, sem centro dominante." },
  fronteira: { alt: "Dois campos de cor que se tocam por uma membrana pontilhada.", brief: "Dois campos (Igarapé e Vazante) que se tocam por membrana pontilhada Creme." },
  "teoria-campo": { alt: "Nós ligados por linhas de força, sem centro.", brief: "Nós e linhas de força sem centro, em Verde Raiz, Terra Barro e Igarapé." },
  "figura-fundo": { alt: "Árvore de Rubin em miniatura: dois perfis e uma copa colorida.", brief: "Árvore de Rubin em miniatura (ver arvore-de-rubin)." },
  "vazio-fertil": { alt: "Grande campo vazio com uma mancha nascendo na borda.", brief: "Grande campo Areia vazio com uma pequena mancha Broto nascendo na borda." },
  polaridades: { alt: "Duas manchas nos extremos unidas por um gradiente contínuo.", brief: "Manchas Aurora e Broto nos extremos unidas por gradiente contínuo Aurora → Vazante → Broto." },
  territorio: { alt: "Rio verde atravessando uma paisagem com um ramo na margem.", brief: "Faixa de rio Igarapé, céu em mancha Broto apagada, um ramo com folhas na margem. Sem fauna nem folclore." },
  autoria: { alt: "Retrato tipográfico com as iniciais da autora ou do autor.", brief: "Não gerar: as cartas de autoria usam retrato tipográfico (iniciais) desenhado pelo próprio site." },
};

export const conceptSlot = (key: string): IllustrationSlotDef => ({
  path: `${DIR}/cartas/${key}.webp`, ratio: "3:2",
  alt: CONCEPT_BRIEFS[key]?.alt ?? "Ilustração do conceito.", brief: `${CONCEPT_BRIEFS[key]?.brief ?? ""} ${STYLE}`,
});

export const SLOTS = {
  rubin: { path: `${DIR}/figura-e-fundo/arvore-de-rubin.webp`, ratio: "4:3", alt: "Árvore de Rubin: dois perfis frente a frente; o espaço entre eles forma o tronco de uma árvore com a copa colorida.", brief: `Dois perfis humanos em Creme, frente a frente, sobre fundo Verde Raiz; o espaço entre eles é o tronco do logotipo, coroado pela copa em aquarela Aurora, Vazante e Broto, opacidade plena. ${STYLE.replace("pessoas, rostos gerados, ", "")}` },
  copa: { path: `${DIR}/cartas/copa.webp`, ratio: "1:1", alt: "Copa da árvore em aquarela colorida sobre papel.", brief: `Copa em 2,5D pintada em aquarela Aurora, Vazante e Broto sobre Creme Papel, tronco em traço Terra Barro, com cerca de 10 folhas maiores bem destacadas. Sem céu, grama ou paisagem. ${STYLE}` },
  cadeiras: { path: `${DIR}/polaridades/duas-cadeiras.webp`, ratio: "16:9", alt: "Duas cadeiras frente a frente sobre chão de areia.", brief: `Duas cadeiras em traço Terra Barro sobre chão Areia, frente a frente; o espaço entre elas marcado por pontilhado Névoa. ${STYLE}` },
  fronteira: { path: `${DIR}/fronteiras/fronteira-de-contato.webp`, ratio: "5:2", alt: "Dois campos de cor que se tocam por uma membrana pontilhada.", brief: `Faixa horizontal: dois campos (Igarapé e Vazante) que se aproximam e se tocam por membrana pontilhada Creme. ${STYLE}` },
  practice: (id: string): IllustrationSlotDef => ({
    path: `${DIR}/sala-de-pausa/${id}.webp`, ratio: "5:2", alt: "",
    brief: `Faixa abstrata para a prática "${id}": ${{ respirar: "anéis concêntricos suaves em Broto", observar: "um ponto Vazante num campo Areia", "pelos-sentidos": "cinco pequenas manchas em cores da paleta", ouvir: "três linhas de onda em traço único", movimentar: "ramo em curva com uma folha na ponta", desacelerar: "superfície de água Igarapé com ondulações Creme" }[id] ?? "forma abstrata"}. ${STYLE}`,
  }),
  round: (id: string, title: string): IllustrationSlotDef => ({
    path: `${DIR}/figura-e-fundo/${id}.webp`, ratio: "4:3", alt: `Imagem da rodada: ${title}.`,
    brief: `Composição para a rodada perceptiva "${title}": elementos de pesos visuais semelhantes (manchas, ramo, linha, seixo) para que cada pessoa escolha o que vira figura. ${STYLE}`,
  }),
} as const;
