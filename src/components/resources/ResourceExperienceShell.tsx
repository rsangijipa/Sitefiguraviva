"use client";

import React, { Suspense, useCallback, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import ResourceHeader from "./ResourceHeader";
import { ResourceErrorBoundary, ResourceLoader } from "./ResourceStates";

export interface ResourceExperienceShellProps {
  isOpen: boolean;
  onClose: () => void;
  /** Nome do recurso exibido no header, ex.: "Árvore da Emoção". */
  title: string;
  breadcrumb?: string;
  /** Mensagem do estado de carregamento, ex.: "Preparando a Árvore da Emoção…". */
  loadingMessage?: string;
  /** Permite fechar clicando fora da janela (desktop). Padrão: true. */
  closeOnOverlayClick?: boolean;
  children: React.ReactNode;
}

/**
 * Janela padronizada para abrir qualquer Recurso Interativo.
 *
 * - Desktop: janela central creme com border névoa, sem box-shadow, sobre
 *   fundo areia semi-opaco.
 * - Mobile: tela cheia (100dvh), fundo creme SÓLIDO, respeitando safe areas.
 * - O `<div class="fv-resource-body">` é o único "scroll owner" do conteúdo:
 *   `overflow-y:auto; overscroll-behavior:contain; touch-action:pan-y`.
 *   A página por trás fica travada pelo contador global de locks
 *   (useBodyScrollLock), que restaura o scrollTop original ao fechar.
 * - Fecha com X, Escape e clique no overlay; role=dialog + aria-modal +
 *   aria-labelledby, focus trap e devolução de foco ao gatilho.
 *
 * O conteúdo pesado de cada recurso deve chegar aqui via `next/dynamic`
 * com `ssr:false` para não penalizar o bundle inicial.
 */
export function ResourceExperienceShell({
  isOpen,
  onClose,
  title,
  breadcrumb = "Recursos Interativos",
  loadingMessage,
  closeOnOverlayClick = true,
  children,
}: ResourceExperienceShellProps) {
  const titleId = useId();
  const windowRef = useFocusTrap<HTMLDivElement>(isOpen);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useBodyScrollLock(isOpen);

  // Escape fecha o recurso.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const handleOverlayMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!closeOnOverlayClick) return;
      // Só fecha quando o mousedown começa no próprio overlay, evitando
      // fechar por engano ao soltar um arraste iniciado dentro da janela.
      if (event.target === overlayRef.current) onClose();
    },
    [closeOnOverlayClick, onClose],
  );

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fv-resource-overlay"
      onMouseDown={handleOverlayMouseDown}
    >
      <div
        ref={windowRef}
        className="fv-resource-window"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <ResourceHeader
          title={title}
          breadcrumb={breadcrumb}
          titleId={titleId}
          onClose={onClose}
        />

        {/* Scroll owner do conteúdo do recurso. */}
        <div className="fv-resource-body" data-lenis-prevent>
          <ResourceErrorBoundary resetKey={title}>
            <Suspense
              fallback={
                <ResourceLoader
                  message={loadingMessage ?? `Preparando ${title}…`}
                />
              }
            >
              {children}
            </Suspense>
          </ResourceErrorBoundary>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default ResourceExperienceShell;
