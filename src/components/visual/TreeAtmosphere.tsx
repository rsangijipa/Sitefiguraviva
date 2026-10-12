"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./TreeAtmosphere.module.css";
export default function TreeAtmosphere() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let visible = false;
    const update = () => setActive(visible && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", update); };
  }, []);
  return <div ref={ref} aria-hidden="true" className={styles.atmosphere} data-active={active}>
    <svg className={styles.paint} viewBox="0 0 1200 520" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="treeRose"><stop stopColor="var(--wash-rose)" stopOpacity=".5"/><stop offset="1" stopColor="var(--wash-rose)" stopOpacity="0"/></radialGradient>
        <radialGradient id="treeSage"><stop stopColor="var(--wash-sage)" stopOpacity=".54"/><stop offset="1" stopColor="var(--wash-sage)" stopOpacity="0"/></radialGradient>
        <radialGradient id="treeGold"><stop stopColor="var(--wash-gold)" stopOpacity=".46"/><stop offset="1" stopColor="var(--wash-gold)" stopOpacity="0"/></radialGradient>
        <linearGradient id="treeEdgeWash" x1="0" x2="1"><stop stopColor="var(--wash-rose)" stopOpacity=".2"/><stop offset=".18" stopColor="var(--wash-gold)" stopOpacity=".1"/><stop offset=".5" stopColor="var(--wash-sage)" stopOpacity="0"/><stop offset=".82" stopColor="var(--wash-sage)" stopOpacity=".1"/><stop offset="1" stopColor="var(--wash-rose)" stopOpacity=".2"/></linearGradient>
        <filter id="soft"><feGaussianBlur stdDeviation="26"/></filter>
      </defs>
      <rect width="1200" height="520" fill="url(#treeEdgeWash)"/>
      <g filter="url(#soft)">
        <ellipse cx="300" cy="175" rx="330" ry="190" fill="url(#treeRose)"/>
        <ellipse cx="780" cy="165" rx="350" ry="210" fill="url(#treeSage)"/>
        <ellipse cx="570" cy="360" rx="400" ry="180" fill="url(#treeGold)"/>
        <ellipse cx="1020" cy="350" rx="280" ry="180" fill="url(#treeRose)"/>
      </g>
      <path d="M0 300C170 215 280 410 460 330S760 190 920 295s210 85 280 20v205H0Z" fill="var(--wash-sage)" opacity=".09"/>
      <path d="M0 410c190-120 330 30 520-20s350-100 680 0v130H0Z" fill="var(--wash-rose)" opacity=".08"/>
    </svg>
  </div>;
}
