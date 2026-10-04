"use client";

import { useEffect } from "react";

/**
 * Global reference-counted body scroll lock.
 *
 * PROBLEMA QUE ISTO RESOLVE
 * -------------------------
 * Antes, Modal.tsx, Navbar.tsx e layout/MobileNav.tsx escreviam
 * `document.body.style.overflow = "hidden" | "unset"` de forma independente.
 * Com dois "travadores" simultâneos (ex.: menu mobile aberto + modal de recurso),
 * o primeiro a fechar/desmontar escrevia `unset` e liberava o scroll do body
 * enquanto o outro overlay ainda estava aberto — e, no caminho inverso, o
 * cleanup de um efeito derrubava o lock do outro, deixando a página
 * permanentemente travada (`overflow: hidden` órfão) quando a ordem de
 * desmontagem invertia.
 *
 * Aqui mantemos um contador global de locks. O body só é travado na
 * transição 0 -> 1 e só é destravado na transição 1 -> 0, restaurando
 * exatamente o valor inline anterior e o scrollTop original.
 */

let lockCount = 0;
let savedScrollY = 0;
let savedBodyStyles: {
  overflow: string;
  position: string;
  top: string;
  left: string;
  right: string;
  width: string;
} | null = null;

function getScrollbarWidth() {
  if (typeof window === "undefined") return 0;
  return Math.max(0, window.innerWidth - document.documentElement.clientWidth);
}

export function lockBodyScroll() {
  if (typeof document === "undefined") return;
  lockCount += 1;
  if (lockCount > 1) return;

  const body = document.body;
  savedScrollY = window.scrollY;
  savedBodyStyles = {
    overflow: body.style.overflow,
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    width: body.style.width,
  };

  const scrollbarWidth = getScrollbarWidth();
  if (scrollbarWidth > 0) {
    body.style.setProperty("--scrollbar-compensation", `${scrollbarWidth}px`);
    body.style.paddingRight = `${scrollbarWidth}px`;
  }

  // position:fixed é o único método confiável no iOS Safari.
  body.style.overflow = "hidden";
  body.style.position = "fixed";
  body.style.top = `-${savedScrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  body.classList.add("fv-scroll-locked");
}

export function unlockBodyScroll() {
  if (typeof document === "undefined") return;
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount > 0) return;

  const body = document.body;
  const previous = savedBodyStyles;
  savedBodyStyles = null;

  body.style.overflow = previous?.overflow ?? "";
  body.style.position = previous?.position ?? "";
  body.style.top = previous?.top ?? "";
  body.style.left = previous?.left ?? "";
  body.style.right = previous?.right ?? "";
  body.style.width = previous?.width ?? "";
  body.style.paddingRight = "";
  body.style.removeProperty("--scrollbar-compensation");
  body.classList.remove("fv-scroll-locked");

  // Restaura a posição de scroll anterior sem animação suave.
  window.scrollTo({
    top: savedScrollY,
    left: 0,
    behavior: "instant" as ScrollBehavior,
  });
}

/**
 * Trava o scroll do documento enquanto `active` for verdadeiro.
 * Seguro para múltiplos overlays simultâneos.
 */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [active]);
}

export default useBodyScrollLock;
