
import React, { useState, useEffect } from 'react';
import { EmotionData } from './types';
import TreeVisualization from './components/TreeVisualization';

// Cores expandidas (Tons terrosos e naturais)
const LEAF_COLORS = [
    '#CFA688', '#D4B491', '#9C9188', '#6B8E23', '#556B2F',
    '#8FBC8F', '#B0896D', '#A0522D', '#DEB887', '#BC8F8F',
    '#DAA520', '#CD853F', '#F4A460', '#D2B48C', '#8B4513',
    '#A52A2A', '#2E8B57', '#66CDAA'
];

// Banco de Mensagens (Gestalt / Mindfulness)
const MESSAGES = [
    "A consciência é o primeiro passo para a cura.",
    "O aqui e agora é o único lugar onde a vida acontece.",
    "Respeite o seu ritmo; ele é a sua maior sabedoria.",
    "Tudo o que você sente tem direito de existir.",
    "O contato é a fronteira onde o eu encontra o mundo.",
    "Não empurre o rio, ele corre sozinho.",
    "Acolher a dor é transformá-la em fluxo.",
    "Você não é o que lhe aconteceu, você é o que escolhe se tornar.",
    "O todo é diferente da soma das partes.",
    "Sua vulnerabilidade é sua maior força.",
    "Permita-se ser quem você é, não quem esperam que você seja.",
    "O vazio fértil é onde o novo pode nascer.",
    "Respire. O ar que entra renova a vida.",
    "Cada emoção é um mensageiro; escute a mensagem.",
    "A mudança acontece quando você se torna o que é, não quando tenta ser o que não é.",
    "Confie na autorregulação do seu organismo.",
    "Feche ciclos para que novos possam se abrir.",
    "A vida é um eterno vir a ser.",
    "Sinta os seus pés no chão; essa é a sua base.",
    "O encontro genuíno transforma ambos.",
    "Olhe para dentro com a mesma gentileza que olha para um amigo.",
    "A angústia é a vertigem da liberdade.",
    "Dê forma ao que está informe dentro de você.",
    "Ajustamento criativo é a arte de sobreviver e viver.",
    "Sua presença é o seu maior presente.",
    "Não busque a perfeição, busque a inteireza.",
    "O corpo fala o que a boca cala. Escute-o.",
    "Fronteiras saudáveis permitem encontros saudáveis.",
    "Você é o artista da sua própria existência.",
    "A responsabilidade é a habilidade de responder à vida.",
    "Aceitação não é resignação, é clareza.",
    "O que você resiste, persiste.",
    "Florir exige passar por todas as estações.",
    "A cura vem do contato, não do isolamento.",
    "Sua história é o solo onde você planta o seu futuro.",
    "Gentileza consigo mesmo é um ato revolucionário.",
    "O passado é referência, não residência.",
    "Cada respiração é uma nova oportunidade de awareness.",
    "Honre suas necessidades no momento presente.",
    "O amor é o reconhecimento do outro como legítimo outro.",
    "A awareness cura por si só.",
    "Deixe ir o que já não lhe serve mais.",
    "A beleza está na autenticidade do ser.",
    "Você é suficiente exatamente como é agora.",
    "A vida acontece no intervalo entre uma inspiração e outra.",
    "Confie no processo, mesmo quando não vir o resultado.",
    "Integre suas sombras para encontrar sua luz.",
    "O caminho se faz caminhando.",
    "Estar presente é o maior ato de amor.",
    "Acolha sua criança interior com carinho."
];

const App: React.FC = () => {
  const [emotions, setEmotions] = useState<EmotionData[]>([]);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionData | null>(null);

  // Função para embaralhar array
  const shuffle = <T,>(array: T[]): T[] => {
    return array.sort(() => Math.random() - 0.5);
  };

  const generateTree = () => {
    // Quantidade de folhas (entre 12 e 18 para ficar cheia)
    const count = 12 + Math.floor(Math.random() * 7);
    
    // Embaralha cores e mensagens para garantir variedade
    const shuffledColors = shuffle([...LEAF_COLORS, ...LEAF_COLORS]); // Duplica para ter cores suficientes
    const shuffledMessages = shuffle([...MESSAGES]);

    const newEmotions: EmotionData[] = Array.from({ length: count }).map((_, i) => ({
      id: Math.random().toString(36).substr(2, 9),
      text: "", // Texto vazio inicialmente (mistério)
      color: shuffledColors[i % shuffledColors.length],
      reflection: shuffledMessages[i % shuffledMessages.length],
      x: 0,
      y: 0
    }));

    setEmotions(newEmotions);
    setSelectedEmotion(null);
  };

  // Gera a árvore ao montar o componente
  useEffect(() => {
    generateTree();
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#87CEEB]">
      {/* 3D Visualization */}
      <TreeVisualization emotions={emotions} onLeafClick={setSelectedEmotion} />

      {/* Painel Esquerdo: Logo e Instruções */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8 z-10 w-full max-w-xs pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/50 pointer-events-auto flex flex-col items-center text-center">
          
          {/* Logo Placeholder - Substitua src pelo caminho da imagem enviada */}
          <div className="mb-4 relative group">
             {/* Como não tenho o arquivo físico, usei um placeholder visual similar ao descrito */}
             <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center overflow-hidden mb-2 shadow-inner border-2 border-[#D4B491]">
                <span className="text-4xl">🌳</span>
             </div>
             {/* Você pode descomentar a linha abaixo se colocar a imagem na pasta public */}
             {/* <img src="/logo.png" alt="Figura Viva" className="w-32 h-auto mb-4" /> */}
             
             <h1 className="text-3xl font-extrabold text-[#1a472a] tracking-tighter leading-none">
                FIGURA
             </h1>
             <span className="script text-3xl text-[#8B4513] transform -rotate-6 block mt-[-5px]">
                viva
             </span>
          </div>

          <p className="text-[#5D4037] font-medium text-sm mb-6 leading-relaxed">
            Esta é a sua árvore de sentimentos.
            <br/>
            <span className="font-bold text-[#2E8B57]">Clique em uma folha</span> e receba uma mensagem de acolhimento.
          </p>
          
          <button 
            onClick={generateTree}
            className="w-full py-2 px-4 bg-[#6B8E23] text-white rounded-lg hover:bg-[#556B2F] transition-all transform hover:scale-105 font-bold shadow-md text-sm uppercase tracking-wide flex items-center justify-center gap-2"
          >
            <span>🔄</span> Gerar Nova Árvore
          </button>
        </div>
      </div>

      {/* Modal / Card Realista de Folha */}
      {selectedEmotion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm transition-opacity duration-300" onClick={() => setSelectedEmotion(null)}>
          
          <div 
            className="relative w-full max-w-md aspect-[3/4] md:aspect-[4/3] pointer-events-auto transition-transform duration-500 transform scale-100 animate-in zoom-in-50"
            onClick={(e) => e.stopPropagation()} // Evita fechar ao clicar na folha
          >
            {/* SVG Background: Formato de Folha Realista */}
            <svg viewBox="0 0 500 600" className="w-full h-full drop-shadow-2xl filter saturate-150">
              <defs>
                <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={selectedEmotion.color} stopOpacity="1" />
                  <stop offset="50%" stopColor={selectedEmotion.color} stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#2F1B15" stopOpacity="0.4" />
                </linearGradient>
                <filter id="texture">
                  <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                  <feColorMatrix type="saturate" values="0" />
                  <feComponentTransfer>
                     <feFuncA type="linear" slope="0.1" />
                  </feComponentTransfer>
                  <feComposite operator="in" in2="SourceGraphic" />
                </filter>
              </defs>
              
              {/* Corpo da Folha */}
              <path 
                d="M250 550 C 250 550, 150 500, 50 300 C -20 150, 150 20, 250 20 C 350 20, 520 150, 450 300 C 350 500, 250 550, 250 550 Z" 
                fill="url(#leafGradient)"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="2"
              />
              
              {/* Nervura Central */}
              <path 
                d="M250 20 Q 245 285 250 550" 
                stroke="rgba(0,0,0,0.2)" 
                strokeWidth="4" 
                fill="none"
              />

              {/* Nervuras Laterais */}
              <g stroke="rgba(0,0,0,0.15)" strokeWidth="2" fill="none">
                 <path d="M250 100 Q 180 120 100 80" />
                 <path d="M250 100 Q 320 120 400 80" />
                 <path d="M250 200 Q 160 220 80 180" />
                 <path d="M250 200 Q 340 220 420 180" />
                 <path d="M250 300 Q 150 320 80 280" />
                 <path d="M250 300 Q 350 320 420 280" />
                 <path d="M250 400 Q 180 420 120 380" />
                 <path d="M250 400 Q 320 420 380 380" />
              </g>
            </svg>

            {/* Conteúdo da Mensagem (Sobreposto ao SVG) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-white">
              <div className="mb-4 opacity-80">
                 <span className="text-4xl filter drop-shadow-md">✨</span>
              </div>
              <p className="font-serif text-xl md:text-2xl italic leading-relaxed drop-shadow-md font-medium text-[#fcfaf2]">
                "{selectedEmotion.reflection}"
              </p>
              <div className="mt-8 border-t border-white/30 pt-4 w-1/2 mx-auto">
                 <button 
                    onClick={() => setSelectedEmotion(null)}
                    className="text-xs uppercase tracking-widest hover:text-[#fcfaf2] text-white/80 transition-colors font-bold"
                 >
                    Fechar
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
