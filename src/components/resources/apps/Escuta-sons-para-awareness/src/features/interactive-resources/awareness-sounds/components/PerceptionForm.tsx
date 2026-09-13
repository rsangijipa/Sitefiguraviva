/**
 * PerceptionForm - Formulário de Percepção Subjetiva e Revelação
 * Instituto Figura Viva - Registro Confluência
 *
 * Princípios Éticos:
 * - NUNCA usar correto/incorreto, pontuação, percentual de acerto ou diagnóstico.
 * - Toda percepção é válida e subjetiva.
 * - Revelação: "Nesta cena, o som foi posicionado à [direção]. A percepção pode variar conforme o ambiente e o dispositivo."
 * - Restrições: Máximo 5 qualidades, termo próprio ≤ 120 caracteres.
 */

import React, { useState } from 'react';
import {
  PerceivedDirection,
  PerceivedDistance,
  SceneObservation,
  SoundQuality,
} from '../types';
import { GuidedScene } from '../types';
import { Eye, Check, ChevronRight, HelpCircle, Sparkles } from 'lucide-react';
import { VALID_QUALITIES } from '../schema';

interface PerceptionFormProps {
  scene: GuidedScene;
  observation: SceneObservation;
  onUpdateObservation: (updated: Partial<SceneObservation>) => void;
  isRevealed: boolean;
  onRevealScene: () => void;
  onNextScene: () => void;
  isLastScene: boolean;
  isTextMode?: boolean;
}

export const PerceptionForm: React.FC<PerceptionFormProps> = ({
  scene,
  observation,
  onUpdateObservation,
  isRevealed,
  onRevealScene,
  onNextScene,
  isLastScene,
  isTextMode = false,
}) => {
  const [customTerm, setCustomTerm] = useState(observation.customQuality || '');

  const directionOptions: { id: PerceivedDirection; label: string }[] = [
    { id: 'esquerda', label: 'Esquerda' },
    { id: 'centro', label: 'Centro' },
    { id: 'direita', label: 'Direita' },
    { id: 'frente', label: 'Frente' },
    { id: 'atras', label: 'Atrás' },
    { id: 'nao_sei', label: 'Não sei / Difuso' },
  ];

  const distanceOptions: { id: PerceivedDistance; label: string }[] = [
    { id: 'perto', label: 'Perto' },
    { id: 'intermediario', label: 'Intermediário' },
    { id: 'longe', label: 'Longe' },
    { id: 'nao_sei', label: 'Não sei' },
  ];

  const toggleQuality = (quality: SoundQuality) => {
    const current = [...observation.qualities];
    const idx = current.indexOf(quality);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      if (current.length < 5) {
        current.push(quality);
      }
    }
    onUpdateObservation({ qualities: current });
  };

  const handleCustomTermBlur = () => {
    const trimmed = customTerm.trim().slice(0, 120);
    onUpdateObservation({ customQuality: trimmed.length > 0 ? trimmed : null });
  };

  return (
    <div id="perception-form-container" className="space-y-5">
      {/* Título da cena atual */}
      <div className="border-b border-[#D8CFBE] pb-3">
        <span className="text-xs font-semibold text-[#96551F] uppercase tracking-wide">
          {scene.title}
        </span>
        <h3 className="font-heading text-lg font-semibold text-[#005A1F]">
          Sua Percepção
        </h3>
        {isTextMode && (
          <div className="mt-2 p-3 bg-[#F1E9DB] rounded-2xl text-xs text-[#262B22] border border-[#D8CFBE]">
            <span className="font-semibold text-[#005A1F]">Descrição Editorial da Cena: </span>
            {scene.revealedDescription}
          </div>
        )}
      </div>

      {/* Pergunta 1: Direção */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-[#005A1F] uppercase tracking-wider">
          De que direção parece vir?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {directionOptions.map((opt) => {
            const isSelected = observation.perceivedDirection === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                id={`direction-${opt.id}`}
                onClick={() => onUpdateObservation({ perceivedDirection: opt.id })}
                className={`px-3 py-2 text-xs rounded-2xl border-2 text-center font-medium transition-all touch-target-min ${
                  isSelected
                    ? 'bg-[#F1E9DB] border-[#005A1F] text-[#005A1F]'
                    : 'bg-[#FDFAF4] border-[#D8CFBE] text-[#4B4B49] hover:border-[#96551F]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pergunta 2: Distância */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-[#005A1F] uppercase tracking-wider">
          Parece perto ou longe?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {distanceOptions.map((opt) => {
            const isSelected = observation.perceivedDistance === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                id={`distance-${opt.id}`}
                onClick={() => onUpdateObservation({ perceivedDistance: opt.id })}
                className={`px-3 py-2 text-xs rounded-2xl border-2 text-center font-medium transition-all touch-target-min ${
                  isSelected
                    ? 'bg-[#F1E9DB] border-[#005A1F] text-[#005A1F]'
                    : 'bg-[#FDFAF4] border-[#D8CFBE] text-[#4B4B49] hover:border-[#96551F]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pergunta 3: Qualidades sonoras */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-[#005A1F] uppercase tracking-wider">
            Como você descreveria? (até 5)
          </label>
          <span className="text-[11px] text-[#6B6B63]">
            {observation.qualities.length}/5 selecionadas
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {VALID_QUALITIES.map((quality) => {
            const isSelected = observation.qualities.includes(quality);
            return (
              <button
                key={quality}
                type="button"
                id={`quality-${quality}`}
                onClick={() => toggleQuality(quality)}
                className={`px-3 py-1.5 text-xs rounded-full border-2 font-medium capitalize transition-all touch-target-min ${
                  isSelected
                    ? 'bg-[#F1E9DB] border-[#96551F] text-[#96551F]'
                    : 'bg-[#FDFAF4] border-[#D8CFBE] text-[#4B4B49] hover:border-[#96551F]'
                }`}
              >
                {quality}
              </button>
            );
          })}
        </div>

        {/* Termo Próprio (≤ 120 caracteres) */}
        <div className="pt-2">
          <input
            type="text"
            id="custom-quality-input"
            value={customTerm}
            maxLength={120}
            onChange={(e) => setCustomTerm(e.target.value)}
            onBlur={handleCustomTermBlur}
            placeholder="Outra palavra ou sensação sua (opcional, até 120 letras)..."
            className="w-full px-3.5 py-2 text-xs rounded-2xl border border-[#D8CFBE] bg-[#FDFAF4] text-[#262B22] placeholder-[#6B6B63] focus:border-[#005A1F] focus:outline-none"
          />
        </div>
      </div>

      {/* Bloco de Revelação Ética (Sem certo/errado) */}
      {!isRevealed ? (
        <div className="pt-3 border-t border-[#D8CFBE]">
          <button
            type="button"
            id="btn-reveal-scene"
            onClick={onRevealScene}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#F1E9DB] hover:bg-[#E5DBC7] text-[#005A1F] border border-[#005A1F] text-xs sm:text-sm font-semibold transition-colors touch-target-min"
          >
            <Eye className="w-4 h-4 text-[#005A1F]" strokeWidth={2} />
            <span>Ver como o som foi posicionado</span>
          </button>
        </div>
      ) : (
        <div
          id="revelation-card"
          className="p-4 rounded-3xl bg-[#F1E9DB] border-2 border-[#005A1F] space-y-3"
          role="status"
        >
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-5 h-5 text-[#96551F] shrink-0 mt-0.5" strokeWidth={2} />
            <div className="text-xs sm:text-sm text-[#262B22] leading-relaxed">
              <p className="font-semibold text-[#005A1F] mb-1">
                {scene.revealedDescription}
              </p>
              <p className="text-[#4B4B49]">
                {scene.guidanceNote}
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              id="btn-next-guided-scene"
              onClick={onNextScene}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#005A1F] text-[#FDFAF4] text-xs sm:text-sm font-semibold hover:bg-[#07614C] transition-colors touch-target-min"
            >
              <span>{isLastScene ? 'Finalizar prática' : 'Próxima cena'}</span>
              <ChevronRight className="w-4 h-4 text-[#FDFAF4]" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
