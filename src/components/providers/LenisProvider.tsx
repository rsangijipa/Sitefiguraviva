"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function LenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const isSmoothEnabled =
      process.env.NEXT_PUBLIC_ENABLE_SMOOTH_SCROLL === "1";

    if (!isSmoothEnabled) return;

    // Check for reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // v4: Scroll Lock Detection for Lenis
    const observer = new MutationObserver(() => {
      if (
        document.body.classList.contains("lenis-stopped") ||
        document.body.style.overflow === "hidden" ||
        window.getComputedStyle(document.body).overflow === "hidden"
      ) {
        lenis.stop();
      } else {
        lenis.start();
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      observer.disconnect();
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
