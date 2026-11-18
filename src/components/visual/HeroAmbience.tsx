"use client";

import { useEffect, useRef } from "react";
import styles from "./HeroAmbience.module.css";

/**
 * Ambiente desfocado que simula o entorno da árvore: céu azulado, luz dourada
 * entrando por cima, folhagem verde e terra marrom. Tudo é CSS puro — manchas
 * de cor com blur forte que se deslocam devagar (só `transform`/`opacity`,
 * animáveis na GPU, sem repintura). A animação pausa quando o herói sai da
 * tela ou a aba fica em segundo plano, e é desligada com `prefers-reduced-motion`.
 */
export default function HeroAmbience() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let onScreen = true;
    const sync = () => {
      el.dataset.active = String(onScreen && !document.hidden);
    };
    const io = new IntersectionObserver((entries) => {
      onScreen = entries[0]?.isIntersecting ?? true;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <div ref={root} className={styles.root} data-active="true" data-hero-ambience aria-hidden="true">
      <span className={`${styles.blob} ${styles.sky}`} />
      <span className={`${styles.blob} ${styles.sun}`} />
      <span className={`${styles.blob} ${styles.leafA}`} />
      <span className={`${styles.blob} ${styles.leafB}`} />
      <span className={`${styles.blob} ${styles.teal}`} />
      <span className={`${styles.blob} ${styles.earth}`} />
      <span className={`${styles.blob} ${styles.bark}`} />
      <span className={styles.shaft} />
      <span className={styles.grain} />
    </div>
  );
}
