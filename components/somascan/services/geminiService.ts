import { BodyData, RecommendationResponse, BodyPartId, SensationType } from "../types";

// Script para o escaneamento corporal (Mantido)
const SCAN_SCRIPT = `
  Bem-vindo ao seu escaneamento corporal. 
  Encontre uma posição confortável, sentado ou deitado. 
  Feche os olhos se desejar. 
  Não estamos aqui para consertar nada, apenas para perceber. 
  Direcione sua atenção para o seu corpo. 
  Dos pés, para as pernas, subindo para o abdômen, peito, braços e cabeça.
  Perceba qualquer tensão, calor, peso ou formigamento. 
  Apenas observe. Clique no mapa para registrar sua sensação e respire.
`;

let currentUtterance: SpeechSynthesisUtterance | null = null;
let isPaused = false;

// --- Áudio e TTS (Mantido) ---

export const playScanIntro = (onEnd: () => void, onStart: () => void) => {
  if (!('speechSynthesis' in window)) {
    console.warn("Text-to-speech not supported");
    onEnd();
    return;
  }

  if (window.speechSynthesis.paused && isPaused) {
    window.speechSynthesis.resume();
    isPaused = false;
    onStart();
    return;
  }

  window.speechSynthesis.cancel();
  isPaused = false;

  const utterance = new SpeechSynthesisUtterance(SCAN_SCRIPT);
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;
  utterance.lang = 'pt-BR';

  const setVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      (v.lang === 'pt-BR' && (v.name.includes("Google") || v.name.includes("Luciana") || v.name.includes("Felipe"))) ||
      v.lang === 'pt-BR'
    );
    if (preferredVoice) utterance.voice = preferredVoice;
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = setVoice;
  } else {
    setVoice();
  }

  utterance.onend = () => {
    isPaused = false;
    currentUtterance = null;
    onEnd();
  };

  utterance.onstart = () => {
    onStart();
  }

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
};

export const pauseScanIntro = () => {
  if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
    isPaused = true;
  }
};

export const stopScanIntro = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    isPaused = false;
    currentUtterance = null;
  }
};

// --- Motor de Inferência Somática (Nova Lógica Inteligente) ---

const getSensation = (data: BodyData, part: BodyPartId): SensationType | undefined => data[part]?.sensation;
const getIntensity = (data: BodyData, part: BodyPartId): number => data[part]?.intensity || 0;

export const generateRecommendation = async (data: BodyData): Promise<RecommendationResponse> => {
  // Simular processamento para dar peso à "análise"
  await new Promise(resolve => setTimeout(resolve, 800));

  const entries = Object.values(data);
  const parts = Object.keys(data) as BodyPartId[];
  
  // 1. Caso Vazio: Estado Meditativo
  if (entries.length === 0) {
    return {
      summary: "Silêncio e Observação.",
      recommendation: "Seu corpo parece estar em um estado de quietude ou neutralidade. Aproveite este momento para simplesmente focar no fluxo natural da sua respiração, sem tentar mudar nada."
    };
  }

  // 2. Análise de Intensidade Global
  const totalIntensity = entries.reduce((acc, curr) => acc + (curr?.intensity || 0), 0);
  const avgIntensity = totalIntensity / entries.length;
  const isHighIntensity = avgIntensity > 3.5;

  // 3. Detecção de Padrões Específicos (Heurística Anatômica)

  // Padrão: "Armadura" (Tensão na Cabeça, Pescoço ou Ombros/Peito)
  const hasUpperTension = ['head', 'neck', 'chest'].some(p => getSensation(data, p as BodyPartId) === 'tension');
  const neckOrHead = ['head', 'neck'].some(p => getSensation(data, p as BodyPartId) === 'tension');
  
  if (neckOrHead && hasUpperTension) {
    return {
      summary: "Você está carregando o peso do mundo nos ombros.",
      recommendation: "Essa tensão na parte superior geralmente reflete excesso de atividade mental ou responsabilidade. Tente isto: Eleve os ombros até as orelhas inspirando fundo, e solte-os de uma vez expirando com um som de alívio 'Ahhh'. Repita 3 vezes."
    };
  }

  // Padrão: "Centro Emocional" (Peito ou Estômago com Calor, Formigamento ou Tensão)
  const emotionalCore = ['chest', 'stomach'].filter(p => parts.includes(p as BodyPartId));
  const activeCore = emotionalCore.some(p => {
    const s = getSensation(data, p as BodyPartId);
    return s === 'heat' || s === 'tingling' || s === 'tension';
  });

  if (activeCore && emotionalCore.length > 0) {
    return {
      summary: "Há muita energia movendo-se pelo seu centro vital.",
      recommendation: "Seu centro (peito e abdômen) é onde processamos emoções. Coloque uma mão sobre o coração e outra sobre o umbigo. Sinta o calor das mãos. Respire imaginando que está suavizando essas áreas, como gelo derretendo ao sol."
    };
  }

  // Padrão: "Falta de Aterramento" (Cabeça cheia/quente, mas Pés neutros ou ausentes)
  const headActive = data.head && data.head.sensation !== 'neutral';
  const feetMissingOrNeutral = !data.feet || data.feet.sensation === 'neutral' || data.feet.sensation === 'numbness';

  if (headActive && feetMissingOrNeutral) {
    return {
      summary: "Sua energia está concentrada no topo, desconectada da base.",
      recommendation: "Para baixar essa energia mental, fique de pé (ou pressione os pés no chão se sentado). Tente sentir a textura do chão/meia. Imagine raízes crescendo das solas dos seus pés em direção ao centro da terra."
    };
  }

  // Padrão: "Cansaço Profundo" (Peso nas pernas ou corpo todo)
  const weightCount = entries.filter(e => e?.sensation === 'weight').length;
  if (weightCount >= 2) {
    return {
      summary: "A gravidade está exercendo uma força extra sobre você hoje.",
      recommendation: "Respeite essa gravidade. Não lute contra o cansaço. Deite-se se possível, ou recoste-se totalmente na cadeira. Entregue o peso dos seus ossos para o suporte abaixo de você. Solte o controle."
    };
  }

  // Padrão: "Dissociação/Congelamento" (Dormência ou Frio/Neutro em extremidades)
  const numbnessCount = entries.filter(e => e?.sensation === 'numbness').length;
  if (numbnessCount >= 2) {
    return {
      summary: "Partes de você parecem distantes ou silenciosas.",
      recommendation: "Vamos convidar a presença de volta gentilmente. Comece a esfregar as palmas das mãos até aquecerem. Depois, toque suavemente as áreas que parecem 'adormecidas', como se estivesse dizendo 'estou aqui'."
    };
  }

  // 4. Fallback Inteligente (Baseado na Sensação Dominante)
  // Se nenhum padrão complexo for detectado, usamos a lógica de contagem mas com textos mais ricos.
  
  const counts: Record<string, number> = {};
  entries.forEach(entry => {
    if (!entry) return;
    counts[entry.sensation] = (counts[entry.sensation] || 0) + 1;
  });

  const primarySensation = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b) as SensationType;

  switch (primarySensation) {
    case 'tension':
      return {
        summary: "Seu corpo está em estado de alerta e contração.",
        recommendation: isHighIntensity 
          ? "A tensão está alta. Não force o relaxamento. Faça micro-movimentos: balance a cabeça, gire os punhos, destrave os joelhos. O movimento suave derrete a rigidez."
          : "Note onde a tensão começa e onde termina. Imagine que a cada expiração, essa área ganha um milímetro a mais de espaço."
      };
    case 'heat':
      return {
        summary: "Você está gerando bastante calor ou inflamação sutil.",
        recommendation: "Visualize uma cor azul fresca ou a sensação de uma brisa suave tocando as áreas quentes. Expire pela boca fazendo um bico suave, como se soprasse uma vela devagar."
      };
    case 'tingling':
      return {
        summary: "Seu sistema elétrico (nervoso) está vibrante.",
        recommendation: "Essa vibração é vida circulando. Se for ansiosa, faça exalações longas. Se for excitação, espalhe essa energia sacudindo as mãos e os pés por 15 segundos."
      };
    case 'neutral':
      return {
        summary: "Um estado de equilíbrio, nem excesso nem falta.",
        recommendation: "A neutralidade é um ponto de descanso poderoso. Memorize como é sentir-se 'apenas bem' ou 'estável', para que possa voltar aqui quando estiver estressado."
      };
    case 'weight': // Fallback caso não caia no padrão de "Cansaço Profundo"
      return {
        summary: "Sensação de densidade e presença física.",
        recommendation: "Use esse peso para se sentir real e sólido. Você ocupa espaço. Sinta sua materialidade e a segurança que vem de ter um corpo físico."
      };
    default:
      return {
        summary: "Você completou seu mapeamento.",
        recommendation: "Leve essa consciência para o resto do seu dia. Beba um copo d'água para ajudar a integrar a experiência."
      };
  }
};
