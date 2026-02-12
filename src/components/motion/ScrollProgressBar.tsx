"use client";

import * as motion from "motion/react-client";
import { useScroll, useSpring, useTransform } from "framer-motion"; // Specific hooks from framer-motion as they might not be in react-client yet
import { useEffect, useState } from "react";

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [isVisible, setIsVisible] = useState(false);

  // Show only after some scroll
  useEffect(() => {
    const unsub = scrollYProgress.on("change", (latest) => {
      if (latest > 0.05) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    });
    return () => unsub();
  }, [scrollYProgress]);

  const opacity = useTransform(scrollYProgress, [0, 0.05, 0.1], [0, 0, 1]);

  return (
    <motion.div
      style={{ scaleX, opacity: isVisible ? 1 : 0 }}
      className="fixed top-0 left-0 right-0 h-[3px] bg-gold origin-left z-[100] pointer-events-none"
    />
  );
}
