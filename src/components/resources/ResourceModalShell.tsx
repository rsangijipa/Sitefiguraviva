"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Modal, ModalBody, ModalContent } from "@/components/ui/Modal";

interface ResourceModalShellProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export default function ResourceModalShell({
  open,
  title,
  onClose,
  children,
  className = "",
}: ResourceModalShellProps) {
  return (
    <Modal isOpen={open} onClose={onClose} ariaLabel={title}>
      <ModalContent
        size="xl"
        className={`max-h-[min(92vh,900px)] rounded-[2rem] border border-white/70 bg-paper p-0 shadow-[0_28px_90px_rgba(30,25,20,0.35)] ${className}`}
      >
        <h2 className="sr-only">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar recurso"
          className="absolute right-3 top-3 z-[120] inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary/10 bg-white/90 text-primary shadow-md transition hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:right-5 sm:top-5"
        >
          <X size={19} aria-hidden="true" />
        </button>
        <ModalBody noPadding className="rounded-[2rem] bg-paper p-0">
          <div className="min-h-0 w-full">{children}</div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
