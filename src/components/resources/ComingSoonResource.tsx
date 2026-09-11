"use client";
import { useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import type { ResourceDefinition } from "./resourceCatalog";

export default function ComingSoonResource({
  resource,
  onClose,
}: {
  resource: ResourceDefinition;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [started, setStarted] = useState(false);
  const prompts: Record<string, string> = {
    "Respiração Livre":
      "Encontre um ritmo confortável, sem precisar seguir uma contagem.",
    "Respiração Sonora":
      "Escolha uma textura sonora imaginada e permaneça com ela por alguns instantes.",
    Escuta: "Qual som se torna figura quando você escuta o ambiente?",
    "Ciclo do Contato":
      "Explore um conceito e relacione-o a uma situação cotidiana.",
    "Fronteiras de Contato":
      "O que você percebe sobre aproximação, afastamento e expressão?",
    "Caso Clínico Interativo":
      "Leia a situação fictícia e registre o que chama sua atenção.",
    "Laboratório Fenomenológico":
      "Separe o que é observável do que é interpretação.",
    "Pergunta ou Interpretação?": "Que pergunta poderia ampliar esta situação?",
    "Treinador de Awareness":
      "Que pista explicitamente descrita você investigaria primeiro?",
    "Cartas Gestálticas": "Escolha uma pergunta para levar ao estudo.",
    "Construtor de Experimentos": "O que está emergindo neste contexto?",
    "Supervisão Express": "O que você ainda precisa saber antes de intervir?",
    "Mapa de Campo": "Que elementos fazem parte desta situação?",
    "Linha do Processo": "Que acontecimento merece ser colocado em relação?",
    "Banco de Microcasos": "Qual é a questão central deste microcaso?",
  };
  const prompt = prompts[resource.title] || resource.description;
  if (!started)
    return (
      <div className="flex h-full min-h-0 items-center justify-center overflow-y-auto bg-paper px-6 py-16 text-center">
        <div className="max-w-lg">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-terra">
            {resource.category}
          </p>
          <h2 className="font-serif text-4xl font-bold text-primary">
            {resource.title}
          </h2>
          <p className="mt-4 text-base text-text/75">{resource.description}</p>
          <p className="mt-6 text-lg leading-relaxed text-primary">
            Esta é uma primeira experiência explorável. O conteúdo completo será
            aprofundado pelo Instituto.
          </p>
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="resource-action mt-8 bg-primary text-paper"
          >
            Começar a explorar <ArrowRight size={16} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-5 block w-full text-sm text-primary underline"
          >
            Voltar para Recursos
          </button>
        </div>
      </div>
    );
  return (
    <div className="h-full min-h-0 bg-paper px-6 py-12 overflow-y-auto">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terra">
          {resource.category} · {resource.title}
        </p>
        <h2 className="mt-4 font-serif text-4xl text-primary">
          Permaneça com a pergunta.
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-text/75">{prompt}</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mt-8 min-h-40 w-full rounded-[24px] border-2 border-primary/15 bg-areia p-4"
          placeholder="Escreva, se quiser. Você pode apenas continuar..."
        />
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="resource-action bg-primary text-paper"
            onClick={onClose}
          >
            Encerrar
          </button>
          <button
            className="resource-action resource-action--secondary"
            onClick={() => {
              setText("");
              setStarted(false);
            }}
          >
            <RotateCcw size={16} /> Reiniciar
          </button>
        </div>
      </div>
    </div>
  );
}
