export interface AudioTrackItem {
  id: string;
  title: string;
  artist: string;
  category: "awareness" | "meditation" | "grounding" | "historical" | "ambient";
  duration: number; // in seconds
  durationFormatted: string;
  description: string;
  url: string;
  cover?: string;
  tags: string[];
}

export const AUDIO_CATALOG: AudioTrackItem[] = [
  {
    id: "meditacao-figura-viva",
    title: "Presença & Awareness no Aqui-e-Agora",
    artist: "Instituto Figura Viva",
    category: "meditation",
    duration: 184,
    durationFormatted: "03:04",
    description: "Condução suave de atenção plena focada na respiração organísmica e percepção da figura e fundo corporal.",
    url: "/assets/audio/meditation.mp3",
    cover: "/images/cursos/gestalt-intro.jpg",
    tags: ["Awareness", "Atenção Plena", "Aqui e Agora"]
  },
  {
    id: "fritz-perls-1966-historic",
    title: "Fritz Perls: Teoria Gestáltica & O Encontro Vivo (1966)",
    artist: "Fritz Perls • Gravação Histórica",
    category: "historical",
    duration: 1728,
    durationFormatted: "28:48",
    description: "Registro histórico restaurado onde Frederick Perls explora a fronteira de contato, a auto-regulação organísmica e a autenticidade.",
    url: "/laura/audio/fritz-perls-gestalt-theory-1966.mp3",
    cover: "/laura/fritz.jpg",
    tags: ["Histórico", "Fritz Perls", "Teoria"]
  },
  {
    id: "ambiente-floresta", title: "Floresta", artist: "Joseph SARDIN · BigSoundBank · CC0", category: "ambient",
    duration: 45, durationFormatted: "00:45", description: "Pássaros, insetos e ambiente de floresta.",
    url: "/brand/audio/ambient/floresta.mp3", cover: "/brand/recursos/sons/floresta.webp", tags: ["Natureza", "Floresta"]
  },
  {
    id: "ambiente-riacho", title: "Riacho e pássaros", artist: "Joseph SARDIN · BigSoundBank · CC0", category: "ambient",
    duration: 45, durationFormatted: "00:45", description: "Água corrente com pássaros ao fundo.",
    url: "/brand/audio/ambient/riacho.mp3", cover: "/brand/recursos/sons/riacho.webp", tags: ["Água", "Natureza"]
  },
  {
    id: "ambiente-chuva", title: "Chuva", artist: "Effib · Wikimedia Commons · CC BY-SA 3.0", category: "ambient",
    duration: 26, durationFormatted: "00:26", description: "Gravação de chuva com volume ajustado e entrada e saída suaves.",
    url: "/brand/audio/ambient/chuva.mp3", cover: "/brand/recursos/sons/chuva.webp", tags: ["Chuva", "Natureza"]
  }
];
