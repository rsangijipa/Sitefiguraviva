"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { SidebarNav } from "./SidebarNav";
import { useFocusTrap } from "@/hooks/useFocusTrap";

/** Native top layer keeps the menu above animated page containers. */
export function PortalMenu({ onClose }: { onClose: () => void }) {
  const ref = useFocusTrap<HTMLDialogElement>(true);

  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    const media = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (media.matches) onClose(); };
    media.addEventListener("change", closeOnDesktop);
    return () => {
      media.removeEventListener("change", closeOnDesktop);
      dialog?.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [onClose, ref]);

  return (
    <dialog
      ref={ref}
      className="portal-menu"
      aria-label="Menu do aluno"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="portal-menu-panel">
        <button type="button" className="portal-menu-close" onClick={onClose} aria-label="Fechar menu">
          <X size={22} aria-hidden="true" />
        </button>
        <SidebarNav className="h-full w-full" onNavigate={onClose} />
      </div>
    </dialog>
  );
}
