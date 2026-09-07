"use client";

import { ErrorState as CoreErrorState } from "@/components/core/feedback";

interface ErrorStateProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
}

export function ErrorState({
  error,
  reset,
  title = "Algo deu errado",
  description,
}: ErrorStateProps) {
  return (
    <CoreErrorState
      error={error}
      reset={reset}
      title={title}
      description={description}
      variant="surface"
      showDigest
    />
  );
}
