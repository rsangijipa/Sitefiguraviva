import { CategoryInfo } from "../types";
import { Brain, Lightbulb, Briefcase, Sparkles } from "lucide-react";

export const CATEGORIES: Record<string, CategoryInfo> = {
  "mental-health": {
    id: "mental-health",
    name: "❤️ Saúde Mental",
    description: "Quizzes e rastreios sobre bem-estar, emoções e saúde mental",
    icon: "heart",
    color: "text-rose-600",
  },
  "self-knowledge": {
    id: "self-knowledge",
    name: "🧠 Autoconhecimento",
    description: "Reflexões sobre comportamento, emoções e relacionamentos",
    icon: "brain",
    color: "text-purple-600",
  },
  career: {
    id: "career",
    name: "🧭 Carreira & Aptidões",
    description:
      "Explore seus interesses, pontos fortes e ambiente de trabalho ideal",
    icon: "briefcase",
    color: "text-blue-600",
  },
  neurodiversity: {
    id: "neurodiversity",
    name: "✨ Neurodiversidade",
    description:
      "Características de atenção, funções executivas e comunicação social",
    icon: "sparkles",
    color: "text-amber-600",
  },
};

export const getCategoryLabel = (id: string): string => {
  const category = Object.values(CATEGORIES).find((cat) => cat.id === id);
  return category?.name || id;
};
