
export interface EmotionData {
  text?: string;
  color: string;
  reflection: string;
  x: number;
  y: number;
  id: string;
}

export interface GeminiEmotionResponse {
  emotions: {
    text: string;
    color: string;
    reflection: string;
  }[];
}
