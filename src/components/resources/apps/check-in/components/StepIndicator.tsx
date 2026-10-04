interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  if (totalSteps <= 1) return null;

  return (
    <nav
      aria-label="Etapas do check-in"
      className="flex items-center justify-center gap-2"
    >
      {Array.from({ length: totalSteps }).map((_, i) => {
        const isActive = i === currentStep;
        const isPast = i < currentStep;

        return (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ease-out-soft ${
              isActive
                ? "w-6 bg-primary"
                : isPast
                  ? "w-4 bg-primary/50"
                  : "w-1.5 bg-primary/20"
            }`}
            aria-hidden={!isActive}
            aria-label={isActive ? `Etapa ${i + 1}` : undefined}
          />
        );
      })}
    </nav>
  );
}
