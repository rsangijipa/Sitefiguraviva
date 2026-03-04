"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function analyzeSomascan(data: any): Promise<{
  summary: string;
  recommendation: string;
  aiUsed: boolean;
} | null> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return null; // Fallback to heuristic
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    const prompt = `
    Você é um assistente compassivo de terapia corporal e somática. 
    Analise o seguinte mapeamento corporal (Somascan) do usuário e dê um breve resumo e uma recomendação compassiva:
    
    Dados do Mapeamento:
    ${JSON.stringify(data, null, 2)}
    
    Diretrizes:
    1. Seja empático, acolhedor e não julgador.
    2. Evite jargões médicos; use linguagem acessível. focado em Gestalt-Terapia e práticas somáticas.
    3. Retorne EXATAMENTE e APENAS no seguinte formato JSON, sem crases, sem texto solto e sem markdown ao redor:
    {
      "summary": "Um resumo caloroso da condição geral detectada (1 frase).",
      "recommendation": "Uma recomendação de exercício ou foco gentil (e.g. respiração, micro-movimento) com 2-3 frases."
    }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json\n?|\n?```/gi, "").trim();

    const parsed = JSON.parse(cleanJson);
    return {
      summary: parsed.summary,
      recommendation: parsed.recommendation,
      aiUsed: true,
    };
  } catch (error) {
    console.error("Gemini Somascan error:", error);
    return null; // Fallback to heuristic if AI fails
  }
}
