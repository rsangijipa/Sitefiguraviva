"use client";

import React from "react";
import { ArrowLeft, X } from "lucide-react";

export interface ResourceHeaderProps {
  /** Nome do recurso, ex.: "Árvore da Emoção" */
  title: string;
  /** Trilha exibida no desktop antes do nome. */
  breadcrumb?: string;
  titleId: string;
  onClose: () => void;
  /** Ação de "voltar"; por padrão fecha o shell. */
  onBack?: () => void;
}

/**
 * Cabeçalho interno do Resource Experience Shell (56px mobile / 64px desktop).
 * Botões com área de toque >= 44x44, aria-label e focus-visible.
 */
export function ResourceHeader({
  title,
  breadcrumb = "Recursos Interativos",
  titleId,
  onClose,
  onBack,
}: ResourceHeaderProps) {
  return (
    <header className="fv-resource-header">
      <button
        type="button"
        className="fv-resource-icon-btn"
        onClick={onBack ?? onClose}
        aria-label="Voltar"
      >
        <ArrowLeft size={18} aria-hidden="true" />
        <span className="hidden sm:inline">Voltar</span>
      </button>

      <h2 id={titleId} className="fv-resource-title">
        <span className="fv-resource-breadcrumb hidden md:inline">
          {breadcrumb} /{" "}
        </span>
        {title}
      </h2>

      <button
        type="button"
        className="fv-resource-icon-btn"
        onClick={onClose}
        aria-label="Fechar recurso"
      >
        <X size={18} aria-hidden="true" />
      </button>
    </header>
  );
}

export default ResourceHeader;
