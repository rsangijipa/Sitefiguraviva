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

    // Scroll Lock Detection: a classe `fv-scroll-locked` é aplicada pelo
    // contador global em src/hooks/useBodyScrollLock.ts.
    const syncLockState = () => {
      if (
        document.body.classList.contains("fv-scroll-locked") ||
        document.body.classList.contains("lenis-stopped")
      ) {
        lenis.stop();
      } else {
        lenis.start();
      }
    };

    const observer = new MutationObserver(syncLockState);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });
    syncLockState();

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
