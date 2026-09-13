/**
 * NeedCard - Card de Necessidade no Registro Confluência (Design System Figura Viva)
 * Raio 24px, traço 2px, sem drop-shadow, ícones lineares 24px stroke 2px Verde Raiz/Terra Barro.
 * Permite selecionar/desmarcar e abrir reflexão aberta sem selecionar automaticamente.
 */

import React from 'react';
import {
  Moon,
  Users,
  Shield,
  Compass,
  Feather,
  HeartHandshake,
  Key,
  Eye,
  Sun,
  Wind,
  Sparkles,
  Trees,
  Check,
  HelpCircle,
  LucideIcon,
} from 'lucide-react';
import { NeedCatalogItem } from '../types';

const ICON_MAP: Record<string, LucideIcon> = {
  Moon,
  Users,
  Shield,
  Compass,
  Feather,
  HeartHandshake,
  Key,
  Eye,
  Sun,
  Wind,
  Sparkles,
  Trees,
};

interface NeedCardProps {
  item: NeedCatalogItem;
  isSelected: boolean;
  onToggle: (item: NeedCatalogItem) => void;
  onInspect: (item: NeedCatalogItem) => void;
  disabled?: boolean;
}

export const NeedCard: React.FC<NeedCardProps> = ({
  item,
  isSelected,
  onToggle,
  onInspect,
  disabled = false,
}) => {
  const IconComponent = ICON_MAP[item.iconName] || HelpCircle;

  return (
    <div
      id={`need-card-${item.id}`}
      className={`group relative rounded-[24px] border-2 transition-all p-4 sm:p-5 flex flex-col justify-between text-left min-h-[160px] ${
        isSelected
          ? 'bg-[#FDFAF4] border-[#005A1F] ring-1 ring-[#005A1F]'
          : 'bg-[#FDFAF4] border-[#D8CFBE] hover:border-[#96551F]'
      } ${disabled && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div>
        {/* Cabeçalho do Card: Ícone Linear 24px stroke 2px + Botão de Informação/Reflexão */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-colors ${
              isSelected
                ? 'bg-[#F1E9DB] border-[#005A1F] text-[#005A1F]'
                : 'bg-[#F1E9DB] border-[#D8CFBE] text-[#96551F] group-hover:border-[#96551F]'
            }`}
          >
            <IconComponent className="w-5 h-5 stroke-2" aria-hidden="true" />
          </div>

          {/* Botão de Reflexão Aberta - NÃO seleciona o card automaticamente */}
          {item.reflectionQuestion && (
            <button
              id={`btn-inspect-need-${item.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onInspect(item);
              }}
              className="p-1.5 rounded-full text-[#6B6B63] hover:text-[#005A1F] hover:bg-[#F1E9DB] transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label={`Ver pergunta de reflexão para ${item.name}`}
              title="Ler pergunta reflexiva"
            >
              <HelpCircle className="w-4 h-4 stroke-2" />
            </button>
          )}
        </div>

        {/* Nome da Necessidade e Descrição */}
        <h3 className="font-heading text-base sm:text-lg font-bold text-[#005A1F] mb-1 leading-snug">
          {item.name}
        </h3>
        <p className="text-xs sm:text-sm text-[#4B4B49] leading-relaxed line-clamp-3">
          {item.shortDescription}
        </p>
      </div>

      {/* Botão de Seleção Acessível */}
      <div className="mt-4 pt-3 border-t border-[#D8CFBE]/60 flex items-center justify-between">
        <button
          id={`btn-toggle-need-${item.id}`}
          type="button"
          disabled={disabled && !isSelected}
          onClick={() => onToggle(item)}
          className={`w-full py-2 px-3 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors min-h-[44px] ${
            isSelected
              ? 'bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C]'
              : 'bg-[#F1E9DB] text-[#262B22] hover:bg-[#D8CFBE] border border-[#D8CFBE]'
          }`}
          aria-pressed={isSelected}
        >
          {isSelected ? (
            <>
              <Check className="w-4 h-4 stroke-2" />
              <span>Selecionada</span>
            </>
          ) : (
            <span>Escolher</span>
          )}
        </button>
      </div>
    </div>
  );
};
