"use client";

import { ErrorState as CoreErrorState } from "@/components/core/feedback";

interface ErrorStateProps {
  title?: string;
  message?: string;
  retry?: () => void;
}

export function ErrorState({
  title = "Algo deu errado",
  message = "Não foi possível carregar o conteúdo. Tente novamente.",
  retry,
}: ErrorStateProps) {
  return (
    <CoreErrorState
      title={title}
      description={message}
      retry={retry}
      variant="page"
    />
  );
}
