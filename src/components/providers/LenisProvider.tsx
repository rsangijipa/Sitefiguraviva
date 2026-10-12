"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import {usePathname} from "next/navigation";
import {isResourceLocation} from "@/lib/observability/resource-privacy";

export default function LenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const resourcePage=isResourceLocation(usePathname());
  useEffect(() => {
    const isSmoothEnabled =
      process.env.NEXT_PUBLIC_ENABLE_SMOOTH_SCROLL === "1";

    if (!isSmoothEnabled || resourcePage) return;

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

    let frame=0;
    function raf(time: number) {
      lenis.raf(time);
      frame=requestAnimationFrame(raf);
    }

    frame=requestAnimationFrame(raf);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [resourcePage]);

  return <>{children}</>;
}
