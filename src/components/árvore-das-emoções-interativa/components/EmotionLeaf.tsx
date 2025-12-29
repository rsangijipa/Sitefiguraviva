
import React from 'react';
import { EmotionData } from '../types';

interface EmotionLeafProps {
  emotion: EmotionData;
  delay: number;
  onClick: (emotion: EmotionData) => void;
}

const EmotionLeaf: React.FC<EmotionLeafProps> = ({ emotion, delay, onClick }) => {
  // Gera uma forma levemente irregular para cada emoção
  const r = 25 + Math.random() * 15;
  const opacity = 0.85;

  return (
    <g 
      className="cursor-pointer"
      onClick={() => onClick(emotion)}
      style={{ 
        animation: `popIn 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${delay}s both`
      }}
    >
      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0) translate(0, 20px); }
          to { opacity: 1; transform: scale(1) translate(0, 0); }
        }
        @keyframes swayAndPulse {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.08) rotate(3deg); }
        }
        .hover-group {
          transition: filter 0.3s ease;
        }
        .hover-group:hover {
          animation: swayAndPulse 3s ease-in-out infinite;
          filter: brightness(1.1);
        }
        .watercolor-blob {
          filter: blur(4px);
          transition: filter 0.3s ease;
        }
        .hover-group:hover .watercolor-blob {
          filter: blur(3px); /* Slightly sharper focus on hover */
        }
      `}</style>
      
      <defs>
        <radialGradient id={`grad-${emotion.id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={emotion.color} stopOpacity={opacity} />
          <stop offset="70%" stopColor={emotion.color} stopOpacity={opacity * 0.6} />
          <stop offset="100%" stopColor={emotion.color} stopOpacity="0" />
        </radialGradient>
      </defs>

      <g 
        className="hover-group"
        style={{ transformOrigin: `${emotion.x}px ${emotion.y}px` }}
      >
        <circle 
          cx={emotion.x} 
          cy={emotion.y} 
          r={r} 
          fill={`url(#grad-${emotion.id})`}
          className="watercolor-blob"
        />
        
        {/* Detalhes de brilho/textura na mancha */}
        <circle 
          cx={emotion.x - 5} 
          cy={emotion.y - 5} 
          r={r/3} 
          fill="white" 
          fillOpacity="0.2"
          filter="blur(2px)"
        />
      </g>
    </g>
  );
};

export default EmotionLeaf;
