import React from "react";
import { FolderOpen } from "lucide-react";
import { EmptyState as CoreEmptyState } from "@/components/core/feedback";

interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  title = "Nada por aqui",
  message = "Não encontramos nenhum item para exibir no momento.",
  action,
}: EmptyStateProps) {
  return (
    <CoreEmptyState
      icon={<FolderOpen />}
      title={title}
      description={message}
      action={action}
      variant="dashed"
      size="md"
    />
  );
}
