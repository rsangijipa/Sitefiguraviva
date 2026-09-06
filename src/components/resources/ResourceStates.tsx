"use client";

import React from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

/**
 * Estados padronizados do Resource Experience Shell.
 * Fundo sempre creme (--fv-creme); nunca preto/azul.
 */

export interface ResourceLoaderProps {
  /** Ex.: "Preparando a Árvore da Emoção…" */
  message?: string;
  hint?: string;
}

export function ResourceLoader({
  message = "Preparando o recurso…",
  hint = "Isso leva só um instante.",
}: ResourceLoaderProps) {
  return (
    <div className="fv-resource-state" role="status" aria-live="polite">
      <div className="fv-resource-spinner" aria-hidden="true" />
      <p className="fv-resource-state__label">{message}</p>
      {hint ? <p className="fv-resource-state__hint">{hint}</p> : null}
    </div>
  );
}

export interface ResourceErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ResourceErrorState({
  title = "Não foi possível carregar este recurso",
  description = "Verifique sua conexão e tente novamente. Se o problema continuar, volte mais tarde.",
  onRetry,
}: ResourceErrorStateProps) {
  return (
    <div className="fv-resource-state" role="alert">
      <AlertTriangle
        size={32}
        color="var(--fv-terra-barro)"
        aria-hidden="true"
      />
      <p className="fv-resource-state__label">{title}</p>
      <p className="fv-resource-state__hint">{description}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="fv-resource-icon-btn"
          style={{ paddingInline: "var(--space-3)" }}
        >
          <RotateCw size={16} aria-hidden="true" />
          Tentar novamente
        </button>
      ) : null}
    </div>
  );
}

/**
 * Error boundary local: impede que a falha de um recurso pesado
 * derrube a página inteira, mostrando o ResourceErrorState no shell.
 */
interface BoundaryProps {
  children: React.ReactNode;
  onRetry?: () => void;
  resetKey?: unknown;
}
interface BoundaryState {
  hasError: boolean;
}

export class ResourceErrorBoundary extends React.Component<
  BoundaryProps,
  BoundaryState
> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidUpdate(prev: BoundaryProps) {
    if (prev.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <ResourceErrorState
          onRetry={() => {
            this.setState({ hasError: false });
            this.props.onRetry?.();
          }}
        />
      );
    }
    return this.props.children;
  }
}

export default ResourceLoader;
