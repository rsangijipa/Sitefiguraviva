import { useCallback, useRef } from "react";
import type { CheckInState, CheckInActions } from "../types";
import { checkinPrompts } from "../types";
import { StepIndicator } from "./StepIndicator";
import { PromptDisplay } from "./PromptDisplay";

interface ArrivalStepProps {
  state: Pick<CheckInState, "arrivalAnswers" | "currentStep">;
  actions: Pick<CheckInActions, "setArrivalAnswer" | "advanceStep"> & {
    hasContent: boolean;
  };
  totalSteps: number;
}

export function ArrivalStep({ state, actions, totalSteps }: ArrivalStepProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusedIndex = state.currentStep;

  const moveFocus = useCallback(
    (direction: number) => {
      const nextIndex = focusedIndex + direction;
      if (nextIndex >= 0 && nextIndex < checkinPrompts.length) {
        const inputs = document.querySelectorAll("textarea");
        inputs[nextIndex]?.focus();
      }
    },
    [focusedIndex],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        moveFocus(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        moveFocus(-1);
      }
    },
    [moveFocus],
  );

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <header className="border-b border-primary/10 px-4 py-5 sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-terra">
          Perceber · Check-in Corporal
        </p>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="mt-2 font-serif text-3xl text-primary sm:text-4xl"
        >
          Como você chega agora?
        </h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-text/70 sm:text-base">
          Tudo é opcional. Responda no seu ritmo ou pule perguntas. Você pode
          simplesmente continuar.
        </p>
        <StepIndicator
          currentStep={state.currentStep}
          totalSteps={totalSteps}
        />
      </header>

      <form
        className="flex-1 px-4 py-6 sm:px-8"
        onKeyDown={handleKeyDown}
        onSubmit={(e) => e.preventDefault()}
      >
        <div
          className="space-y-8"
          role="group"
          aria-label="Respostas do check-in"
        >
          {checkinPrompts.map((prompt, index) => {
            const isFocused = index === state.currentStep;

            return (
              <div
                key={index}
                className={`overflow-hidden transition-all duration-300 ease-out-soft ${
                  isFocused ? "opacity-100" : "opacity-50"
                }`}
              >
                <PromptDisplay
                  prompt={prompt}
                  value={state.arrivalAnswers[index]}
                  onChange={(value) => actions.setArrivalAnswer(index, value)}
                  labelId={`checkin-prompt-${index}`}
                />
              </div>
            );
          })}
        </div>

        <div className="sticky bottom-0 -mx-4 mt-8 flex justify-end gap-3 border-t border-primary/10 bg-paper px-4 py-3">
          <button
            type="button"
            onClick={() => {
              actions.advanceStep();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={!actions.hasContent}
            className="resource-action rounded-xl bg-primary px-6 py-3 text-paper disabled:opacity-40"
          >
            Avançar para o corpo
          </button>
        </div>
      </form>
    </div>
  );
}
