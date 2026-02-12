"use client";

import React from "react";
import { motion } from "framer-motion"; // Fallback to framer-motion if namespace fails

export default function BackgroundEngine() {
  const isCinematic = process.env.NEXT_PUBLIC_VISUAL_MODE === "cinematic";

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Aurora Layer */}
      <div className="fx-aurora" />

      {/* Interactive Aurora Blobs */}
      <motion.div
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -50, 50, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-gold/5 blur-[120px] rounded-full"
      />

      <motion.div
        animate={{
          x: [0, -80, 40, 0],
          y: [0, 60, -30, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[100px] rounded-full"
      />

      {/* Watercolor Texture Layer */}
      <div className="absolute inset-0 opacity-[0.4] mix-blend-multiply fx-watercolor pointer-events-none" />

      {/* Cinematic Grain (Global in body usually, but can be here too) */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none bg-repeat"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3BaseFilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Light Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-paper/20 to-paper pointer-events-none" />
    </div>
  );
}
