"use client";

import { X } from "lucide-react";
import { Modal, ModalContent, ModalBody } from "@/components/ui/Modal";
import { getImageSrc } from "@/lib/imageUtils";
import { getMediatorParagraphs, type Mediator } from "@/utils/mediators";
import { useState } from "react";

function Portrait({ mediator }: { mediator: Mediator }) {
  const [failed, setFailed] = useState(false);
  const image = getImageSrc(mediator.image, "");
  return (
    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border border-primary/15 bg-stone-100 sm:h-32 sm:w-32">
      {image && !failed ? (
        <img
          src={image}
          alt={`Retrato de ${mediator.name}`}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover object-top"
        />
      ) : (
        <div
          className="flex h-full items-center justify-center font-serif text-3xl text-primary/60"
          aria-hidden="true"
        >
          {mediator.name.charAt(0)}
        </div>
      )}
    </div>
  );
}

export default function MediatorDialog({
  mediator,
  onClose,
}: {
  mediator: Mediator | null;
  onClose: () => void;
}) {
  return (
    <Modal
      isOpen={!!mediator}
      onClose={onClose}
      ariaLabel={
        mediator ? `Currículo de ${mediator.name}` : "Detalhes da mediadora"
      }
    >
      {mediator && (
        <ModalContent className="max-h-[85dvh] border-primary/15">
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-stone-200 bg-stone-50 px-5 py-3 sm:px-8">
            <p className="text-xs font-bold uppercase tracking-widest text-primary/70">
              Conheça a mediadora
            </p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar detalhes da mediadora"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary/30 bg-white px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              Fechar <X size={18} aria-hidden="true" />
            </button>
          </div>
          <ModalBody
            className="min-h-0 overscroll-contain"
            tabIndex={0}
            aria-label="Currículo e trajetória"
          >
            <div className="mb-7 flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
              <Portrait
                key={`${mediator.name}-${mediator.image}`}
                mediator={mediator}
              />
              <div className="min-w-0">
                <h2 className="break-words font-serif text-2xl leading-tight text-primary sm:text-3xl">
                  {mediator.name}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-primary/70">
                  {mediator.role}
                </p>
              </div>
            </div>
            <h3 className="mb-4 border-t border-stone-100 pt-5 text-xs font-bold uppercase tracking-widest text-primary/70">
              Formação e trajetória
            </h3>
            <div className="space-y-5 break-words text-base leading-8 text-primary/80">
              {mediator.bio ? (
                getMediatorParagraphs(mediator.bio).map((paragraph, i) => (
                  <p key={i} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p>
                  O currículo desta mediadora será disponibilizado em breve.
                </p>
              )}
            </div>
          </ModalBody>
        </ModalContent>
      )}
    </Modal>
  );
}
