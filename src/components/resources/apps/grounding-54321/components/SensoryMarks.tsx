import React from "react";
import { Check } from "lucide-react";

interface SensoryMarksProps {
  total: number;
  checked: boolean[];
  onToggle: (index: number) => void;
  reducedMotion: boolean;
  senseLabel: string;
}

export const SensoryMarks: React.FC<SensoryMarksProps> = ({
  total,
  checked,
  onToggle,
  reducedMotion,
  senseLabel,
}) => {
  return (
    <div className="w-full flex flex-col items-center gap-4 my-6">
      {/* Sensory touch marks */}
      <div
        id="sensory-marks-container"
        className="flex items-center justify-center flex-wrap gap-4 sm:gap-5"
        role="group"
        aria-label={`Marcas para ${total} percepções de ${senseLabel}`}
      >
        {Array.from({ length: total }).map((_, index) => {
          const isChecked = !!checked[index];
          const delayClass = !reducedMotion
            ? index % 2 === 0
              ? "animate-subtle-breathe"
              : "animate-subtle-breathe [animation-delay:1.5s]"
            : "";

          return (
            <button
              key={`mark-${total}-${index}`}
              id={`sensory-mark-${total}-${index + 1}`}
              type="button"
              onClick={() => onToggle(index)}
              className={`relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-3 focus-visible:ring-[#2C333A]/40 active:scale-95 ${
                isChecked
                  ? "bg-[#232A31] text-[#F8F7F4] shadow-sm"
                  : "bg-[#F1EFEA] border border-[#D5D2C8] text-[#717882] hover:border-[#A8A499] hover:bg-[#EAE8E1]"
              } ${!isChecked && !reducedMotion ? delayClass : ""}`}
              aria-pressed={isChecked}
              aria-label={`${index + 1}º item de ${senseLabel}: ${
                isChecked ? "Percebido" : "Toque quando perceber"
              }`}
            >
              {isChecked ? (
                <Check
                  className={`w-6 h-6 stroke-[2.5] text-[#F8F7F4] ${
                    reducedMotion ? "" : "transition-transform scale-100"
                  }`}
                />
              ) : (
                <span className="font-karla text-sm font-semibold tracking-wider text-[#686E77]">
                  {index + 1}
                </span>
              )}

              {/* Accessible ping animation only when reducedMotion is false and mark is freshly clicked */}
              <span className="sr-only">
                {isChecked
                  ? "Item percebido"
                  : `Aguardando percepção do item ${index + 1}`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mindful prompt under marks */}
      <p className="text-xs text-[#6E757F] text-center max-w-xs font-karla tracking-wide">
        Toque conforme percebe itens reais no seu ambiente.
      </p>
    </div>
  );
};
