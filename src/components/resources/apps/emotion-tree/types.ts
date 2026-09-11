export interface EmotionNuance {
  id: string;
  label: string;
  description: string;
  somaticTendency: string;
}

export interface RelatedEmotion {
  id: string;
  label: string;
  description: string;
  somaticTendency: string;
  nuances: EmotionNuance[];
}

export interface EmotionFamily {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  accent: {
    color: string;
    border: string;
    bg: string;
    light: string;
    text: string;
  };
  relatedEmotions: RelatedEmotion[];
}

export interface SomaticRegion {
  id: string;
  label: string;
  description: string;
}

export interface DiaryEntry {
  id: string;
  emotion_family: string;
  emotion_label: string;
  custom_label?: string;
  intensity?: number;
  intensity_label?: string;
  body_location?: string;
  body_note?: string;
  reflection?: string;
  created_at: string;
}

export type ExplorationLevel = 1 | 2 | 3;
