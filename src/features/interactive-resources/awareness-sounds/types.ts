export type ListeningMode = "guided" | "free" | "text";
export type ScenePosition = "left" | "center" | "right" | "front" | "behind";
export type SceneDistance = "near" | "medium" | "far";
export type AudioStatus =
  | "setup"
  | "loadingAsset"
  | "ready"
  | "playing"
  | "paused"
  | "observing"
  | "completion"
  | "error";

export interface SoundManifest {
  id: string;
  title: string;
  description: string;
  file: string;
  mime: string;
  durationSeconds: number;
  author: string;
  license: string;
  sourceUrl: string;
  sizeBytes: number;
  version: string;
  hash: string;
  status: "draft" | "published";
}

export interface ListeningObservation {
  soundId?: string;
  soundVersion?: string;
  configuredPosition?: ScenePosition;
  perceivedDirection?: ScenePosition | "unsure";
  perceivedDistance?: SceneDistance | "unsure";
  qualities: string[];
  customQuality?: string | null;
}

export interface ListeningSessionInput {
  mode: ListeningMode;
  durationSeconds: number;
  observations: ListeningObservation[];
  reflection?: string | null;
  clientRequestId: string;
  contentVersion: string;
}

export interface ListeningSession extends ListeningSessionInput {
  id: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export const TEXTUAL_SCENES = [
  {
    id: "agua",
    title: "Água corrente",
    description:
      "Imagine uma corrente de água contínua, descrita como próxima e à esquerda.",
  },
  {
    id: "folhas",
    title: "Folhas ao vento",
    description:
      "Imagine folhas movimentadas pelo vento, descritas como suaves e ao centro.",
  },
  {
    id: "chuva",
    title: "Chuva suave",
    description: "Imagine uma chuva leve, descrita como envolvente e distante.",
  },
  {
    id: "passaro",
    title: "Pássaro distante",
    description:
      "Imagine um pássaro ao longe, descrito como intermitente e à direita.",
  },
] as const;
