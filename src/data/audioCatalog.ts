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
    duration: 368,
    durationFormatted: "06:08",
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
    duration: 745,
    durationFormatted: "12:25",
    description: "Registro histórico restaurado onde Frederick Perls explora a fronteira de contato, a auto-regulação organísmica e a autenticidade.",
    url: "/laura/audio/fritz-perls-gestalt-theory-1966.mp3",
    cover: "/laura/fritz.jpg",
    tags: ["Histórico", "Fritz Perls", "Teoria"]
  },
  {
    id: "respiracao-ancoragem",
    title: "Ancoragem Organísmica & Respiração Fluida",
    artist: "Prática Clínica • Figura Viva",
    category: "grounding",
    duration: 300,
    durationFormatted: "05:00",
    description: "Exercício de ancoragem somática para desanuviar a tensão antes de atendimentos clínicos ou estudos profundos.",
    url: "/assets/audio/meditation.mp3",
    cover: "/assets/lilian-vanessa.jpeg",
    tags: ["Grounding", "Corpo", "Respiração"]
  },
  {
    id: "fluxo-contemplacao",
    title: "Sons do Bosque & Paisagem de Estudo",
    artist: "Som Ambiente • Instituto Figura Viva",
    category: "ambient",
    duration: 600,
    durationFormatted: "10:00",
    description: "Harmonia sutil da natureza para acompanhar momentos de leitura da biblioteca e anotações teóricas.",
    url: "/assets/audio/meditation.mp3",
    cover: "/assets/foto-grupo.jpg",
    tags: ["Ambiente", "Foco", "Natureza"]
  },
  {
    id: "awareness-polaridades",
    title: "Meditação das Polaridades e Integração",
    artist: "Richard Sangi • Figura Viva",
    category: "awareness",
    duration: 480,
    durationFormatted: "08:00",
    description: "Acolhimento das tensões e diálogo entre opostos internos para fechamento de situações inacabadas.",
    url: "/assets/audio/meditation.mp3",
    cover: "/assets/curso-experiencia-atemporal.jpg",
    tags: ["Polaridades", "Integração", "Gestalt"]
  }
];
