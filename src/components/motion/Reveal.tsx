"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

/**
 * Entrada de seção.
 *
 * O que mudou e por quê:
 *
 * 1. Saiu o `filter: blur()` animado. Desfocar um bloco inteiro obriga o
 *    navegador a repintar a seção a cada quadro por 800 ms — era o efeito mais
 *    caro da home, e o responsável pelo aspecto lavado das seções em trânsito.
 * 2. O estado inicial é VISÍVEL. Antes o conteúdo nascia em `opacity: 0` e só
 *    aparecia se o observador disparasse; qualquer falha deixava a seção em
 *    branco. Agora só é escondido o que está abaixo da dobra, e só depois que
 *    o JavaScript confirmou que consegue revelá-lo.
 * 3. A animação é CSS. Uma transição de opacidade e deslocamento, 420 ms, na
 *    curva única do sistema — sem framer-motion nesta camada.
 */

const DISTANCE = { soft: 8, medium: 14, hero: 18 } as const;

interface RevealProps {
  children: ReactNode;
  variant?: keyof typeof DISTANCE;
  className?: string;
  /** Atraso em segundos, para escalonar irmãos. */
  delay?: number;
}

export default function Reveal({
  children,
  variant = "medium",
  className = "",
  delay = 0,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  // "pronto" = sem animação nenhuma (SSR, movimento reduzido, já na tela).
  const [state, setState] = useState<"pronto" | "oculto" | "revelado">(
    "pronto",
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    // Já visível no primeiro quadro: fica como está. O topo da página não deve
    // depender de observador para existir.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    setState("oculto");

    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setState("revelado");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const style = {
    "--reveal-y": `${DISTANCE[variant]}px`,
    transitionDelay: delay ? `${delay}s` : undefined,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      data-reveal={state === "pronto" ? undefined : state}
      className={`reveal ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
