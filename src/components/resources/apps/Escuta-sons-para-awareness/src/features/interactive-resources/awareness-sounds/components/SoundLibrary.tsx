/**
 * SoundLibrary - Biblioteca de Sons Naturais
 * Instituto Figura Viva - Registro Confluência
 *
 * Padrões:
 * - Cards Confluência (radius 24px, linhas 2px, profundidade Creme sobre Areia)
 * - Ícones lineares (stroke 2px, Verde Raiz ou Terra Barro)
 * - Sem badges excessivos
 * - Descrição de 1–2 linhas
 * - Suporte textual acessível
 */

import React from 'react';
import { Droplet, Wind, CloudRain, Feather, Check, Play, Volume2 } from 'lucide-react';
import { SOUND_LIBRARY_MANIFEST } from '../audio/assetLoader';
import { SoundId } from '../types';

interface SoundLibraryProps {
  selectedSoundId: SoundId;
  onSelectSound: (soundId: SoundId) => void;
  isPlaying: boolean;
  disabled?: boolean;
}

export const SoundLibrary: React.FC<SoundLibraryProps> = ({
  selectedSoundId,
  onSelectSound,
  isPlaying,
  disabled = false,
}) => {
  const sounds = Object.values(SOUND_LIBRARY_MANIFEST);

  const getIcon = (id: SoundId) => {
    switch (id) {
      case 'agua-corrente':
        return <Droplet className="w-6 h-6 text-[#005A1F]" strokeWidth={2} />;
      case 'folhas-vento':
        return <Wind className="w-6 h-6 text-[#96551F]" strokeWidth={2} />;
      case 'chuva-suave':
        return <CloudRain className="w-6 h-6 text-[#07614C]" strokeWidth={2} />;
      case 'passaro-distante':
        return <Feather className="w-6 h-6 text-[#96551F]" strokeWidth={2} />;
    }
  };

  return (
    <div id="sound-library-section" className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#005A1F] uppercase tracking-wide">
          Elementos Sonoros
        </h3>
        <span className="text-xs text-[#6B6B63]">
          4 fontes naturais disponíveis
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sounds.map((sound) => {
          const isSelected = selectedSoundId === sound.id;

          return (
            <button
              key={sound.id}
              type="button"
              id={`sound-card-${sound.id}`}
              disabled={disabled}
              onClick={() => onSelectSound(sound.id)}
              className={`p-4 rounded-3xl border-2 text-left transition-all relative flex flex-col justify-between touch-target-min ${
                isSelected
                  ? 'bg-[#F1E9DB] border-[#005A1F]'
                  : 'bg-[#FDFAF4] border-[#D8CFBE] hover:border-[#96551F]'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              aria-label={`Selecionar som: ${sound.title}. ${sound.description}`}
              aria-pressed={isSelected}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#FDFAF4] border border-[#D8CFBE] flex items-center justify-center">
                    {getIcon(sound.id)}
                  </div>
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#005A1F] bg-[#FDFAF4] px-2.5 py-0.5 rounded-full border border-[#005A1F]">
                      <Check className="w-3.5 h-3.5" />
                      {isPlaying ? 'Em reprodução' : 'Selecionado'}
                    </span>
                  )}
                </div>

                <h4 className="font-heading text-base font-semibold text-[#005A1F] leading-tight">
                  {sound.title}
                </h4>
                <p className="text-xs text-[#4B4B49] mt-1 leading-relaxed line-clamp-2">
                  {sound.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-[#D8CFBE] flex items-center justify-between text-xs text-[#6B6B63]">
                <span>{sound.category}</span>
                <span className="font-medium text-[#96551F]">Loop natural</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
