"use client";

import { ArrowLeft, X } from "lucide-react";
import { Modal, ModalBody, ModalContent } from "@/components/ui/Modal";

export interface ResourceWindowProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function ResourceWindow({
  isOpen,
  title,
  onClose,
  children,
}: ResourceWindowProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel={title}>
      <ModalContent
        size="full"
        className="h-[90dvh] max-h-[90vh] w-[min(96vw,1440px)] rounded-[1.5rem] bg-paper p-0"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[70] flex items-center justify-between p-3 sm:p-4">
          <button
            className="pointer-events-auto flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary shadow-sm backdrop-blur transition-all hover:bg-gold hover:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={`Voltar de ${title}`}
            onClick={onClose}
          >
            <ArrowLeft size={16} />
            Voltar
          </button>
          <button
            className="pointer-events-auto group flex items-center gap-2 rounded-full bg-white/80 pl-3 pr-2 py-2 text-primary shadow-sm backdrop-blur transition-all hover:bg-gold hover:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={`Fechar ${title}`}
            onClick={onClose}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest">Fechar</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-100 transition-colors group-hover:bg-white/20">
              <X size={14} />
            </span>
          </button>
        </div>
        <ModalBody className="min-h-0 overflow-hidden bg-paper p-0 [&>div]:h-full [&>div]:p-0">
          <div className="h-full min-h-0">{children}</div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
