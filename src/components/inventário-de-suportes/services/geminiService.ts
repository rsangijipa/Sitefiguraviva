import { SupportCategory, SupportItem, SupportKit, EnhancedSupportItem } from "../types";

// Local database of generic shortcuts per category to simulate AI generation
const SHORTCUTS_DB: Record<SupportCategory, string[]> = {
  [SupportCategory.PEOPLE]: [
    "Enviar uma mensagem de carinho",
    "Visualizar o rosto dessa pessoa por 1 min",
    "Escrever uma carta mental de gratidão",
    "Planejar o próximo encontro",
    "Olhar uma foto favorita juntos",
    "Enviar um áudio curto apenas para dizer 'oi'",
    "Lembrar de um conselho que ela te deu"
  ],
  [SupportCategory.ROUTINES]: [
    "Fazer apenas 5 minutos dessa atividade",
    "Respirar fundo antes de começar",
    "Visualizar a sensação de dever cumprido",
    "Preparar o ambiente com carinho",
    "Agradecer por este momento de autocuidado",
    "Fazer uma versão 'express' hoje"
  ],
  [SupportCategory.PLACES]: [
    "Fechar os olhos e visitar mentalmente",
    "Olhar fotos de quando esteve lá",
    "Planejar quando poderá ir novamente",
    "Recriar a atmosfera (som/cheiro) em casa",
    "Desenhar ou escrever sobre este lugar",
    "Conectar-se com a sensação de paz de lá"
  ],
  [SupportCategory.PRACTICES]: [
    "Praticar uma micro-sessão agora",
    "Ler um parágrafo ou frase sobre o tema",
    "Agendar um horário inegociável",
    "Apenas organizar os materiais necessários",
    "Lembrar por que você começou",
    "Fazer um gesto simbólico que represente isso"
  ],
  [SupportCategory.BELIEFS]: [
    "Repetir como um mantra silencioso",
    "Escrever a crença em um papel visível",
    "Meditar por 2 minutos sobre isso",
    "Colocar a mão no coração e sentir",
    "Ler um texto que fortaleça essa fé",
    "Praticar a gratidão baseada nisso"
  ]
};

const MANTRAS = [
  "Minhas raízes são profundas e me sustentam.",
  "Eu tenho todos os recursos internos que preciso.",
  "Eu construo meu próprio refúgio de paz.",
  "Pequenos suportes criam grandes fortalezas.",
  "Eu sou capaz de cuidar de mim mesmo.",
  "Tudo o que preciso está ao meu alcance.",
  "Eu honro o tempo e o espaço da minha cura.",
  "Minha rede de apoio é viva e presente."
];

export const generateSupportKit = async (inventory: SupportItem[]): Promise<SupportKit> => {
  
  // Simulate network delay for a better UX (the loading animation is calming)
  await new Promise(resolve => setTimeout(resolve, 2500));

  // Generate Enhanced Items locally
  const enhancedItems: EnhancedSupportItem[] = inventory.map((item, index) => {
    const categoryShortcuts = SHORTCUTS_DB[item.category];
    // Use a pseudo-random selection based on index to ensure variety but consistency
    // We rotate through the options so multiple items in same category get different shortcuts
    const shortcutIndex = (index + item.text.length) % categoryShortcuts.length;
    
    return {
      ...item,
      shortcut: categoryShortcuts[shortcutIndex]
    };
  });

  // Pick a random mantra
  const mantra = MANTRAS[Math.floor(Math.random() * MANTRAS.length)];

  // Generate a dynamic summary
  const totalItems = inventory.length;
  const categoriesPresent = Array.from(new Set(inventory.map(i => i.category)));
  
  let summary = "";
  if (totalItems < 3) {
    summary = "Mesmo poucos suportes são poderosos quando cultivados com intenção.";
  } else if (categoriesPresent.length >= 4) {
    summary = "Você construiu uma base diversificada e resiliente para se apoiar.";
  } else {
    summary = `Você reuniu ${totalItems} âncoras importantes para o seu bem-estar.`;
  }

  return {
    items: enhancedItems,
    mantra,
    summary
  };
};