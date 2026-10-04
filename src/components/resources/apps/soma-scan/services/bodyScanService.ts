import {
  BodyData,
  RecommendationResponse,
  BodyPartId,
  SensationType,
} from "../types";

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
let previousVoicesChanged: SpeechSynthesis["onvoiceschanged"] = null;

const restoreVoicesChanged = () => {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.onvoiceschanged = previousVoicesChanged;
  previousVoicesChanged = null;
};

// --- Áudio e TTS (Mantido) ---

export const playScanIntro = (onEnd: () => void, onStart: () => void) => {
  if (!("speechSynthesis" in window)) {
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
  utterance.lang = "pt-BR";

  const setVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        (v.lang === "pt-BR" &&
          (v.name.includes("Google") ||
            v.name.includes("Luciana") ||
            v.name.includes("Felipe"))) ||
        v.lang === "pt-BR",
    );
    if (preferredVoice) utterance.voice = preferredVoice;
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    previousVoicesChanged = window.speechSynthesis.onvoiceschanged;
    window.speechSynthesis.onvoiceschanged = setVoice;
  } else {
    setVoice();
  }

  utterance.onend = () => {
    isPaused = false;
    currentUtterance = null;
    restoreVoicesChanged();
    onEnd();
  };

  utterance.onstart = () => {
    onStart();
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
};

export const pauseScanIntro = () => {
  if ("speechSynthesis" in window && window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
    isPaused = true;
  }
};

export const stopScanIntro = () => {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    isPaused = false;
    currentUtterance = null;
    restoreVoicesChanged();
  }
};

// --- Motor local de recomendações somáticas ---

const getSensation = (
  data: BodyData,
  part: BodyPartId,
): SensationType | undefined => data[part]?.sensation;
const getIntensity = (data: BodyData, part: BodyPartId): number =>
  data[part]?.intensity || 0;

export const generateRecommendation = async (
  data: BodyData,
): Promise<RecommendationResponse> => {
  // Todas as recomendações são calculadas localmente no navegador.
  return generateHeuristicRecommendation(data);
};

export const generateHeuristicRecommendation = async (
  data: BodyData,
): Promise<RecommendationResponse> => {
  // Pequena pausa para preservar o feedback de processamento na interface.
  await new Promise((resolve) => setTimeout(resolve, 800));

  const entries = Object.values(data);
  const parts = Object.keys(data) as BodyPartId[];

  // 1. Caso Vazio: Estado Meditativo
  if (entries.length === 0) {
    return {
      summary: "Nenhuma região foi registrada.",
      recommendation:
        "Você pode voltar ao mapa para registrar uma percepção ou encerrar por aqui. A ausência de marcações não permite inferir um estado corporal.",
    };
  }

  // 2. Análise de Intensidade Global
  const totalIntensity = entries.reduce(
    (acc, curr) => acc + (curr?.intensity || 0),
    0,
  );
  const avgIntensity = totalIntensity / entries.length;
  const isHighIntensity = avgIntensity > 3.5;

  // 3. Detecção de Padrões Específicos (Heurística Anatômica)

  // Padrão: "Armadura" (Tensão na Cabeça, Pescoço ou Ombros/Peito)
  const hasUpperTension = ["head", "neck", "chest"].some(
    (p) => getSensation(data, p as BodyPartId) === "tension",
  );
  const neckOrHead = ["head", "neck"].some(
    (p) => getSensation(data, p as BodyPartId) === "tension",
  );

  if (neckOrHead && hasUpperTension) {
    return {
      summary: "Você registrou tensão na parte superior do corpo.",
      recommendation:
        "Se for confortável, eleve os ombros ao inspirar e solte-os suavemente ao expirar. Interrompa se sentir dor ou desconforto.",
    };
  }

  // Padrão: "Centro Emocional" (Peito ou Estômago com Calor, Formigamento ou Tensão)
  const emotionalCore = ["chest", "stomach"].filter((p) =>
    parts.includes(p as BodyPartId),
  );
  const activeCore = emotionalCore.some((p) => {
    const s = getSensation(data, p as BodyPartId);
    return s === "heat" || s === "tingling" || s === "tension";
  });

  if (activeCore && emotionalCore.length > 0) {
    return {
      summary: "Você percebeu sensações no peito ou no abdômen.",
      recommendation:
        "Se for confortável, apoie as mãos nessas áreas e observe a respiração sem tentar interpretar ou mudar a sensação.",
    };
  }

  // Padrão: "Falta de Aterramento" (Cabeça cheia/quente, mas Pés neutros ou ausentes)
  const headActive = data.head && data.head.sensation !== "neutral";
  const feetMissingOrNeutral =
    !data.feet ||
    data.feet.sensation === "neutral" ||
    data.feet.sensation === "numbness";

  if (headActive && feetMissingOrNeutral) {
    return {
      summary:
        "Você registrou uma sensação na cabeça e pouca percepção nos pés.",
      recommendation:
        "Se for confortável, note o contato dos pés com o chão e descreva mentalmente a pressão, a temperatura e a textura percebidas.",
    };
  }

  // Padrão: "Cansaço Profundo" (Peso nas pernas ou corpo todo)
  const weightCount = entries.filter((e) => e?.sensation === "weight").length;
  if (weightCount >= 2) {
    return {
      summary: "Você registrou sensação de peso em mais de uma região.",
      recommendation:
        "Respeite essa gravidade. Não lute contra o cansaço. Deite-se se possível, ou recoste-se totalmente na cadeira. Entregue o peso dos seus ossos para o suporte abaixo de você. Solte o controle.",
    };
  }

  // Dormência registrada em mais de uma região.
  const numbnessCount = entries.filter(
    (e) => e?.sensation === "numbness",
  ).length;
  if (numbnessCount >= 2) {
    return {
      summary: "Você registrou dormência em mais de uma região.",
      recommendation:
        "Observe essas áreas sem forçar estímulos. Dormência persistente, súbita ou acompanhada de outros sintomas deve ser avaliada por um profissional de saúde.",
    };
  }

  // 4. Recomendação baseada na sensação predominante.
  // Se nenhum padrão complexo for detectado, usamos a lógica de contagem.

  const counts: Record<string, number> = {};
  entries.forEach((entry) => {
    if (!entry) return;
    counts[entry.sensation] = (counts[entry.sensation] || 0) + 1;
  });

  const primarySensation = Object.keys(counts).reduce((a, b) =>
    counts[a] > counts[b] ? a : b,
  ) as SensationType;

  switch (primarySensation) {
    case "tension":
      return {
        summary: "A sensação predominante registrada foi tensão.",
        recommendation: isHighIntensity
          ? "A tensão está alta. Não force o relaxamento. Faça micro-movimentos: balance a cabeça, gire os punhos, destrave os joelhos. O movimento suave derrete a rigidez."
          : "Note onde a tensão começa e onde termina. Imagine que a cada expiração, essa área ganha um milímetro a mais de espaço.",
      };
    case "heat":
      return {
        summary: "A sensação predominante registrada foi calor.",
        recommendation:
          "Visualize uma cor azul fresca ou a sensação de uma brisa suave tocando as áreas quentes. Expire pela boca fazendo um bico suave, como se soprasse uma vela devagar.",
      };
    case "tingling":
      return {
        summary: "A sensação predominante registrada foi formigamento.",
        recommendation:
          "Essa vibração é vida circulando. Se for ansiosa, faça exalações longas. Se for excitação, espalhe essa energia sacudindo as mãos e os pés por 15 segundos.",
      };
    case "neutral":
      return {
        summary: "A sensação predominante registrada foi neutralidade.",
        recommendation:
          "A neutralidade é um ponto de descanso poderoso. Memorize como é sentir-se 'apenas bem' ou 'estável', para que possa voltar aqui quando estiver estressado.",
      };
    case "weight": // Fallback caso não caia no padrão de "Cansaço Profundo"
      return {
        summary: "Sensação de densidade e presença física.",
        recommendation:
          "Use esse peso para se sentir real e sólido. Você ocupa espaço. Sinta sua materialidade e a segurança que vem de ter um corpo físico.",
      };
    default:
      return {
        summary: "Você completou seu mapeamento.",
        recommendation:
          "Leve essa consciência para o resto do seu dia. Beba um copo d'água para ajudar a integrar a experiência.",
      };
  }
};
