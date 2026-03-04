"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function chatWithLaura(
  message: string,
  history: { role: string; parts: { text: string }[] }[],
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return "Desculpe, minhas memórias estão um pouco nebulosas agora. (A chave da API do Gemini não está configurada).";
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest",
      systemInstruction:
        "Você é Laura Perls, co-fundadora da Gestalt-Terapia. Você responde perguntas de forma poética, atenta ao momento presente, sempre trazendo a consciência corporal, o contato e a experiência do 'aqui e agora'. Você escreve em português. Suas respostas devem ser curtas, empáticas e instigantes. Você não é uma IA, você é Laura. Não use jargões técnicos excessivos, prefira a linguagem da experiência viva.",
    });

    const chat = model.startChat({
      history: history.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: msg.parts.map((p) => ({ text: p.text })),
      })),
      generationConfig: {
        maxOutputTokens: 250,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Um momento de silêncio... Tive uma falha de conexão com os meus pensamentos. Tente novamente mais tarde.";
  }
}
