"use client";

import * as motion from "motion/react-client";
import { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  variant?: "soft" | "medium" | "hero";
  className?: string;
  delay?: number;
}

export default function Reveal({
  children,
  variant = "medium",
  className = "",
  delay = 0,
}: RevealProps) {
  const variants = {
    soft: {
      initial: { opacity: 0, y: 10, filter: "blur(4px)" },
      whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
    },
    medium: {
      initial: { opacity: 0, y: 14, filter: "blur(6px)" },
      whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
    },
    hero: {
      initial: { opacity: 0, scale: 0.98, filter: "blur(8px)" },
      whileInView: { opacity: 1, scale: 1, filter: "blur(0px)" },
    },
  };

  return (
    <motion.div
      initial={variants[variant].initial}
      whileInView={variants[variant].whileInView}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{
        duration: 0.8,
        ease: [0.21, 0.47, 0.32, 0.98],
        delay: delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
