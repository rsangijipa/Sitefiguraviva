import {
  BodyData,
  RecommendationResponse ,
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

// Descriptive closure only; no anatomical heuristic or prescription.
export const generateRecommendation = async (data: BodyData): Promise<RecommendationResponse> => {
  const count = Object.values(data).filter(Boolean).length;
  return { summary: count ? `Você registrou ${count} regiões do corpo.` : "Nenhuma região foi registrada.", recommendation: "Você pode voltar ao mapa ou encerrar por aqui." };
};
export const generateHeuristicRecommendation = generateRecommendation;
