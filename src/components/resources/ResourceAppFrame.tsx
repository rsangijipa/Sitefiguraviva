"use client";

import type { ReactNode } from "react";
import { AlertCircle, Loader2, RotateCcw } from "lucide-react";

type ResourceStatus = "loading" | "ready" | "error";

interface ResourceAppFrameProps {
  title: string;
  status?: ResourceStatus;
  errorMessage?: string;
  onRetry?: () => void;
  children: ReactNode;
}

export default function ResourceAppFrame({
  title,
  status = "ready",
  errorMessage = "Não foi possível abrir este recurso.",
  onRetry,
  children,
}: ResourceAppFrameProps) {
  if (status === "loading") {
    return (
      <div
        className="resource-app-frame resource-app-frame--state"
        role="status"
        aria-label={`Carregando ${title}`}
      >
        <Loader2
          className="h-5 w-5 animate-spin text-accent"
          aria-hidden="true"
        />
        <span>Preparando {title.toLowerCase()}...</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        className="resource-app-frame resource-app-frame--state text-center"
        role="alert"
      >
        <AlertCircle className="h-5 w-5 text-clay" aria-hidden="true" />
        <p className="max-w-sm text-sm text-text/75">{errorMessage}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="resource-action resource-action--secondary"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Tentar novamente
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="resource-app-frame h-full min-h-0 w-full">{children}</div>
  );
}
