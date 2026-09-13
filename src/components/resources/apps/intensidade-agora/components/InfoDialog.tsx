"use client";
import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InfoDialogProps {
  open: boolean;
  onClose: () => void;
}

export function InfoDialog({ open, onClose }: InfoDialogProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open) {
      closeRef.current?.focus();
    } else if (wasOpenRef.current) {
      openerRef.current?.focus();
    }
    wasOpenRef.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => !el.hasAttribute("disabled")) as HTMLElement[];

        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="info-dialog-title"
          className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md bg-white border border-stone-200 rounded-2xl p-6 text-text shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2
                id="info-dialog-title"
                className="text-sm font-semibold text-primary tracking-wide"
              >
                Sobre a Intensidade Agora
              </h2>
              <button
                ref={closeRef}
                onClick={onClose}
                className="p-1.5 rounded-lg text-text/50 hover:text-primary hover:bg-stone-100 transition-colors"
                aria-label="Fechar diálogo"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 4l8 8M12 4l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <p className="text-sm text-text/80 leading-relaxed">
              Perceba a intensidade que está presente agora. Uma intensidade
              alta não é necessariamente ruim — apenas observe onde você se
              encontra.
            </p>

            <ul className="space-y-2 pt-0.5">
              {[
                {
                  desc: "O campo de partículas reage à sua intensidade: mais partículas e movimento para valores altos.",
                },
                {
                  desc: "O anel central pulsa conforme a respiração — lenta quando baixa, rápida quando intensa.",
                },
                {
                  desc: "Use o slider para explorar diferentes níveis de percepção.",
                },
                {
                  desc: "Registre ou encerre sem salvar. Suas observações ficam salvas localmente.",
                },
              ].map(({ desc }) => (
                <li
                  key={desc}
                  className="flex items-start gap-2 text-xs text-text/75"
                >
                  <span
                    className="mt-1.5 h-1 w-1 flex-none rounded-full bg-primary"
                    aria-hidden="true"
                  />
                  <span>{desc}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-primary hover:bg-primary-solid active:scale-[0.98] text-paper font-semibold text-xs rounded-xl transition-all shadow-md"
            >
              Entendi
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
