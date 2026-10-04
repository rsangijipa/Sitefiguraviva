import React from 'react';
import { BotanicalFormType } from '../types';

interface BotanicalShapeProps {
  form: BotanicalFormType;
  isSelected?: boolean;
  scale?: number;
  className?: string;
  actionState?: string;
}

export function BotanicalShape({
  form,
  isSelected = false,
  scale = 1,
  className = '',
  actionState,
}: BotanicalShapeProps) {
  // Stroke colors based on Design System Figura Viva: Verde Raiz (#005A1F) or Terra Barro (#96551F)
  const strokeColor = isSelected ? '#005A1F' : '#07614C';
  const fillColor = isSelected ? 'rgba(1, 201, 77, 0.15)' : 'rgba(7, 97, 76, 0.08)';
  const accentVeinColor = isSelected ? '#96551F' : '#6B6B63';

  return (
    <div
      className={`relative flex items-center justify-center transition-transform duration-500 ease-out ${className}`}
      style={{
        transform: `scale(${scale})`,
      }}
    >
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full overflow-visible pointer-events-none"
        aria-hidden="true"
      >
        {form === 'folha-lanceolada' && (
          <g>
            {/* Contorno orgânico com aquarela translúcida controlada */}
            <path
              d="M60 10 C85 35, 90 75, 60 110 C30 75, 35 35, 60 10 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Nervura central */}
            <path
              d="M60 18 Q60 65 60 106"
              fill="none"
              stroke={accentVeinColor}
              strokeWidth="1.5"
              strokeDasharray="2,2"
            />
            {/* Nervuras secundárias suaves */}
            <path
              d="M60 40 Q75 48 78 55 M60 55 Q75 63 76 72 M60 70 Q72 78 72 85"
              fill="none"
              stroke={accentVeinColor}
              strokeWidth="1.2"
              strokeOpacity="0.7"
            />
            <path
              d="M60 40 Q45 48 42 55 M60 55 Q45 63 44 72 M60 70 Q48 78 48 85"
              fill="none"
              stroke={accentVeinColor}
              strokeWidth="1.2"
              strokeOpacity="0.7"
            />
          </g>
        )}

        {form === 'ramo-confluente' && (
          <g>
            {/* Haste botânica confluente */}
            <path
              d="M20 105 Q45 80 65 50 T100 15"
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Folíolos com aquarela suave */}
            <path
              d="M42 82 Q30 70 34 60 Q48 68 45 80 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="1.5"
            />
            <path
              d="M58 58 Q72 48 74 38 Q60 44 59 56 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="1.5"
            />
            <path
              d="M78 37 Q68 25 72 16 Q84 22 80 34 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="1.5"
            />
            <path
              d="M93 21 Q105 10 108 8 Q102 20 95 21 Z"
              fill="rgba(150, 85, 31, 0.15)"
              stroke="#96551F"
              strokeWidth="1.5"
            />
          </g>
        )}

        {form === 'semente-alvorada' && (
          <g>
            {/* Forma de semente ou cápsula botânica */}
            <path
              d="M60 15 C85 30 92 65 75 90 C60 110 40 100 35 80 C28 55 40 25 60 15 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="2"
            />
            {/* Anéis de crescimento concêntricos */}
            <circle
              cx="58"
              cy="60"
              r="22"
              fill="none"
              stroke={accentVeinColor}
              strokeWidth="1.2"
              strokeDasharray="3,3"
            />
            <circle
              cx="58"
              cy="60"
              r="12"
              fill="rgba(254, 215, 1, 0.15)"
              stroke="#96551F"
              strokeWidth="1.5"
            />
            <circle cx="58" cy="60" r="3" fill="#005A1F" />
          </g>
        )}

        {form === 'folha-larga' && (
          <g>
            {/* Folha larga com recortes serenos */}
            <path
              d="M60 15 C88 28 98 62 85 92 C72 110 48 110 35 92 C22 62 32 28 60 15 Z"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="2"
            />
            <path
              d="M60 20 Q60 60 60 104"
              fill="none"
              stroke={accentVeinColor}
              strokeWidth="1.8"
            />
            {/* Fendas e curvas reflexivas */}
            <path
              d="M60 45 Q78 35 84 42"
              fill="none"
              stroke={strokeColor}
              strokeWidth="1.5"
            />
            <path
              d="M60 65 Q82 58 86 68"
              fill="none"
              stroke={strokeColor}
              strokeWidth="1.5"
            />
            <path
              d="M60 45 Q42 35 36 42"
              fill="none"
              stroke={strokeColor}
              strokeWidth="1.5"
            />
            <path
              d="M60 65 Q38 58 34 68"
              fill="none"
              stroke={strokeColor}
              strokeWidth="1.5"
            />
          </g>
        )}

        {form === 'samambaia-flutuante' && (
          <g>
            <path
              d="M30 105 Q55 65 85 20"
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M42 85 Q30 80 25 82 Q35 75 44 78"
              fill="none"
              stroke={strokeColor}
              strokeWidth="1.5"
            />
            <path
              d="M48 75 Q62 70 68 74 Q58 66 50 70"
              fill="none"
              stroke={strokeColor}
              strokeWidth="1.5"
            />
            <path
              d="M56 62 Q44 56 39 59 Q49 53 58 56"
              fill="none"
              stroke={strokeColor}
              strokeWidth="1.5"
            />
            <path
              d="M64 50 Q78 44 83 48 Q73 40 66 44"
              fill="none"
              stroke={strokeColor}
              strokeWidth="1.5"
            />
            <path
              d="M72 37 Q60 30 55 33 Q65 27 74 31"
              fill="none"
              stroke={strokeColor}
              strokeWidth="1.5"
            />
            <path
              d="M80 26 Q92 20 95 24 Q86 16 81 21"
              fill="none"
              stroke="#96551F"
              strokeWidth="1.5"
            />
          </g>
        )}

        {/* Indicador sutil de ação ativa */}
        {actionState === 'aproximar' && (
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="#005A1F"
            strokeWidth="1.5"
            strokeDasharray="4,4"
            className="animate-spin"
            style={{ animationDuration: '24s' }}
          />
        )}
      </svg>
    </div>
  );
}
