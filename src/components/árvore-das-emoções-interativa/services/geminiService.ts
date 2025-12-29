
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiEmotionResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function processEmotions(emotions: string[]): Promise<GeminiEmotionResponse> {
  // Solicitamos cores vibrantes explicitamente para garantir contraste na árvore 3D
  const prompt = `Analise as seguintes 5 emoções: ${emotions.join(", ")}. 
  Para cada emoção, atribua uma cor vibrante e única em formato HEX (ex: #FF5733, #9C27B0, #00BCD4) que a represente visualmente e uma frase curta de reflexão ou acolhimento em português. Evite cores muito escuras ou pretas.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          emotions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                color: { type: Type.STRING },
                reflection: { type: Type.STRING }
              },
              required: ["text", "color", "reflection"]
            }
          }
        },
        required: ["emotions"]
      }
    }
  });

  return JSON.parse(response.text) as GeminiEmotionResponse;
}
